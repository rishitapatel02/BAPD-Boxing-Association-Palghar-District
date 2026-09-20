import express from "express";
import { pool } from "../config/db.js";
import {
  requireAuth,
  requireAdmin,
} from "../middleware/auth.js";

const router = express.Router();

// =========================================================
// GET ALL MATCHES
// =========================================================

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        m.id,
        m.match_no,

        -- IMPORTANT:
        -- These IDs are required by AdminDashboard
        m.player_a_id,
        m.player_b_id,

        m.category,
        m.round_name,
        m.scheduled_at,
        m.status,
        m.tournament_id,
        m.venue,

        pa.full_name AS player_a_name,
        pb.full_name AS player_b_name,

        t.name AS tournament_name,

        -- Result information
        r.id AS result_id,
        r.winner_player_id,
        r.loser_player_id,
        r.result_type,
        r.points_awarded,
        r.round_scores,
        r.notes AS result_notes,
        r.recorded_at

      FROM matches m

      LEFT JOIN players pa
        ON pa.id = m.player_a_id

      LEFT JOIN players pb
        ON pb.id = m.player_b_id

      LEFT JOIN tournaments t
        ON t.id = m.tournament_id

      LEFT JOIN results r
        ON r.match_id = m.id

      ORDER BY
        m.scheduled_at ASC,
        m.id ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Get matches error:", error);

    res.status(500).json({
      message: "Could not load matches",
    });
  }
});

// =========================================================
// CREATE / SCHEDULE NEW MATCH
// =========================================================

router.post(
  "/",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        tournament_id,
        player_a_id,
        player_b_id,
        category,
        round_name,
        scheduled_at,
        venue,
        match_no,
      } = req.body;

      // -----------------------------------------------------
      // REQUIRED FIELD VALIDATION
      // -----------------------------------------------------

      if (
        !tournament_id ||
        !player_a_id ||
        !player_b_id ||
        !category ||
        !round_name
      ) {
        return res.status(400).json({
          message:
            "Please fill all required match fields",
        });
      }

      // -----------------------------------------------------
      // SAME PLAYER VALIDATION
      // -----------------------------------------------------

      if (
        Number(player_a_id) ===
        Number(player_b_id)
      ) {
        return res.status(400).json({
          message:
            "Player A and Player B must be different",
        });
      }

      // -----------------------------------------------------
      // CHECK TOURNAMENT EXISTS
      // -----------------------------------------------------

      const [tournamentRows] = await pool.query(
        `
        SELECT id
        FROM tournaments
        WHERE id = ?
        `,
        [tournament_id]
      );

      if (tournamentRows.length === 0) {
        return res.status(404).json({
          message: "Tournament not found",
        });
      }

      // -----------------------------------------------------
      // CHECK PLAYER A EXISTS
      // -----------------------------------------------------

      const [playerARows] = await pool.query(
        `
        SELECT id
        FROM players
        WHERE id = ?
        `,
        [player_a_id]
      );

      if (playerARows.length === 0) {
        return res.status(404).json({
          message: "Player A not found",
        });
      }

      // -----------------------------------------------------
      // CHECK PLAYER B EXISTS
      // -----------------------------------------------------

      const [playerBRows] = await pool.query(
        `
        SELECT id
        FROM players
        WHERE id = ?
        `,
        [player_b_id]
      );

      if (playerBRows.length === 0) {
        return res.status(404).json({
          message: "Player B not found",
        });
      }

      // -----------------------------------------------------
      // INSERT MATCH
      // -----------------------------------------------------

      const [result] = await pool.query(
        `
        INSERT INTO matches
        (
          match_no,
          player_a_id,
          player_b_id,
          category,
          round_name,
          scheduled_at,
          status,
          tournament_id,
          venue
        )
        VALUES (?, ?, ?, ?, ?, ?, 'scheduled', ?, ?)
        `,
        [
          match_no || null,
          player_a_id,
          player_b_id,
          category,
          round_name,
          scheduled_at || null,
          tournament_id,
          venue || null,
        ]
      );

      res.status(201).json({
        message: "Match scheduled successfully",
        matchId: result.insertId,
      });
    } catch (error) {
      console.error(
        "Create match error:",
        error
      );

      res.status(500).json({
        message: "Could not schedule match",
      });
    }
  }
);

// =========================================================
// RECORD MATCH RESULT
// =========================================================
// 10-POINT MUST SYSTEM
//
// Example:
//
// Round 1: Player A 10 - Player B 9
// Round 2: Player A 10 - Player B 9
// Round 3: Player A 9  - Player B 10
//
// Total:   Player A 29 - Player B 28
//
// round_scores is stored as JSON.
// =========================================================

router.post(
  "/:id/result",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const matchId = req.params.id;

      const {
        winner_player_id,
        loser_player_id,
        result_type,
        round_scores,
        points_awarded,
        notes,
      } = req.body;

      // -----------------------------------------------------
      // WINNER / LOSER REQUIRED
      // -----------------------------------------------------

      if (
        !winner_player_id ||
        !loser_player_id
      ) {
        return res.status(400).json({
          message:
            "Winner and loser are required",
        });
      }

      // -----------------------------------------------------
      // GET MATCH
      // -----------------------------------------------------

      const [matchRows] = await pool.query(
        `
        SELECT *
        FROM matches
        WHERE id = ?
        `,
        [matchId]
      );

      if (matchRows.length === 0) {
        return res.status(404).json({
          message: "Match not found",
        });
      }

      const match = matchRows[0];

      // -----------------------------------------------------
      // CHECK MATCH ALREADY COMPLETED
      // -----------------------------------------------------

      if (match.status === "completed") {
        return res.status(409).json({
          message:
            "This match is already completed",
        });
      }

      // -----------------------------------------------------
      // VALID PLAYERS IN THIS MATCH
      // -----------------------------------------------------

      const validPlayers = [
        Number(match.player_a_id),
        Number(match.player_b_id),
      ];

      if (
        !validPlayers.includes(
          Number(winner_player_id)
        ) ||
        !validPlayers.includes(
          Number(loser_player_id)
        )
      ) {
        return res.status(400).json({
          message:
            "Winner and loser must belong to this match",
        });
      }

      // -----------------------------------------------------
      // WINNER AND LOSER CANNOT BE SAME
      // -----------------------------------------------------

      if (
        Number(winner_player_id) ===
        Number(loser_player_id)
      ) {
        return res.status(400).json({
          message:
            "Winner and loser cannot be the same player",
        });
      }

      // -----------------------------------------------------
      // CHECK EXISTING RESULT
      // -----------------------------------------------------

      const [existingResult] =
        await pool.query(
          `
          SELECT id
          FROM results
          WHERE match_id = ?
          `,
          [matchId]
        );

      if (existingResult.length > 0) {
        return res.status(409).json({
          message:
            "Result has already been recorded for this match",
        });
      }

      // -----------------------------------------------------
      // VALIDATE ROUND SCORES
      // -----------------------------------------------------

      let finalRoundScores = [];

      if (
        Array.isArray(round_scores) &&
        round_scores.length > 0
      ) {
        finalRoundScores =
          round_scores.map((round, index) => {
            return {
              round:
                Number(round.round) ||
                index + 1,

              player_a:
                Number(round.player_a),

              player_b:
                Number(round.player_b),
            };
          });

        // ---------------------------------------------------
        // CHECK EVERY ROUND
        // ---------------------------------------------------

        for (const round of finalRoundScores) {
          if (
            !Number.isInteger(
              round.player_a
            ) ||
            !Number.isInteger(
              round.player_b
            )
          ) {
            return res.status(400).json({
              message:
                `Round ${round.round}: scores must be whole numbers`,
            });
          }

          // 10-point must system
          // For this project we allow scores 7-10.

          if (
            round.player_a < 7 ||
            round.player_a > 10 ||
            round.player_b < 7 ||
            round.player_b > 10
          ) {
            return res.status(400).json({
              message:
                `Round ${round.round}: scores must be between 7 and 10`,
            });
          }
        }
      }

      // -----------------------------------------------------
      // DECISION SCORE VALIDATION
      // -----------------------------------------------------

      if (
        result_type === "Decision" &&
        finalRoundScores.length > 0
      ) {
        let playerATotal = 0;
        let playerBTotal = 0;

        finalRoundScores.forEach(
          (round) => {
            playerATotal +=
              round.player_a;

            playerBTotal +=
              round.player_b;
          }
        );

        const winnerIsPlayerA =
          Number(winner_player_id) ===
          Number(match.player_a_id);

        const winnerTotal =
          winnerIsPlayerA
            ? playerATotal
            : playerBTotal;

        const loserTotal =
          winnerIsPlayerA
            ? playerBTotal
            : playerATotal;

        if (winnerTotal <= loserTotal) {
          return res.status(400).json({
            message:
              "For a Decision, the selected winner must have a higher total score.",
          });
        }
      }

      // -----------------------------------------------------
      // SAVE RESULT
      // -----------------------------------------------------

      await pool.query(
        `
        INSERT INTO results
        (
          match_id,
          winner_player_id,
          loser_player_id,
          result_type,
          points_awarded,
          round_scores,
          notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          matchId,

          winner_player_id,

          loser_player_id,

          result_type || "Decision",

          // Existing column kept for compatibility
          Number(points_awarded) || 0,

          // Save 10-point round scores as JSON
          JSON.stringify(finalRoundScores),

          notes || null,
        ]
      );

      // -----------------------------------------------------
      // UPDATE MATCH STATUS
      // -----------------------------------------------------

      await pool.query(
        `
        UPDATE matches
        SET status = 'completed'
        WHERE id = ?
        `,
        [matchId]
      );

      res.json({
        message:
          "Match result recorded successfully",
      });
    } catch (error) {
      console.error(
        "Record result error:",
        error
      );

      res.status(500).json({
        message:
          "Could not record match result",
      });
    }
  }
);

// =========================================================
// GET RESULT FOR ONE MATCH
// =========================================================

router.get(
  "/:id/result",
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `
        SELECT
          r.*,

          w.full_name AS winner_name,

          l.full_name AS loser_name

        FROM results r

        LEFT JOIN players w
          ON w.id = r.winner_player_id

        LEFT JOIN players l
          ON l.id = r.loser_player_id

        WHERE r.match_id = ?
        `,
        [req.params.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          message: "Result not found",
        });
      }

      const result = rows[0];

      // -----------------------------------------------------
      // MYSQL JSON MAY COME BACK AS STRING OR OBJECT
      // -----------------------------------------------------

      if (
        typeof result.round_scores ===
        "string"
      ) {
        try {
          result.round_scores =
            JSON.parse(
              result.round_scores
            );
        } catch (error) {
          console.error(
            "Could not parse round scores:",
            error
          );
        }
      }

      res.json(result);
    } catch (error) {
      console.error(
        "Get result error:",
        error
      );

      res.status(500).json({
        message:
          "Could not load result",
      });
    }
  }
);

export default router;