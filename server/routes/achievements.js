import express from "express";

import { pool } from "../config/db.js";

import {
  requireAuth,
  requireAdmin,
  requirePlayer,
} from "../middleware/auth.js";

const router = express.Router();


// =========================================================
// ADMIN - ADD ACHIEVEMENT
// =========================================================

router.post(
  "/",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        player_id,
        tournament_id,
        match_id,
        achievement_title,
        achievement_type,
        result,
        points_earned,
        achievement_date,
        description,
      } = req.body;

      // -----------------------------------------------
      // VALIDATION
      // -----------------------------------------------

      if (
        !player_id ||
        !achievement_title ||
        !achievement_type
      ) {
        return res.status(400).json({
          message:
            "Player, achievement title and achievement type are required.",
        });
      }

      // -----------------------------------------------
      // VERIFY PLAYER EXISTS
      // -----------------------------------------------

      const [players] = await pool.query(
        `
        SELECT id, full_name
        FROM players
        WHERE id = ?
        `,
        [player_id]
      );

      if (!players.length) {
        return res.status(404).json({
          message: "Player not found.",
        });
      }

      // -----------------------------------------------
      // VERIFY TOURNAMENT IF PROVIDED
      // -----------------------------------------------

      if (tournament_id) {
        const [tournaments] = await pool.query(
          `
          SELECT id
          FROM tournaments
          WHERE id = ?
          `,
          [tournament_id]
        );

        if (!tournaments.length) {
          return res.status(404).json({
            message: "Tournament not found.",
          });
        }
      }

      // -----------------------------------------------
      // VERIFY MATCH IF PROVIDED
      // -----------------------------------------------

      if (match_id) {
        const [matches] = await pool.query(
          `
          SELECT id
          FROM matches
          WHERE id = ?
          `,
          [match_id]
        );

        if (!matches.length) {
          return res.status(404).json({
            message: "Match not found.",
          });
        }
      }

      // -----------------------------------------------
      // INSERT ACHIEVEMENT
      // -----------------------------------------------

      const [resultData] = await pool.query(
        `
        INSERT INTO achievements
        (
          player_id,
          tournament_id,
          match_id,
          achievement_title,
          achievement_type,
          result,
          points_earned,
          achievement_date,
          description
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          player_id,
          tournament_id || null,
          match_id || null,
          achievement_title,
          achievement_type,
          result || null,
          Number(points_earned) || 0,
          achievement_date || null,
          description || null,
        ]
      );

      res.status(201).json({
        message:
          "Player achievement added successfully.",
        achievementId:
          resultData.insertId,
      });

    } catch (error) {
      console.error(
        "Add achievement error:",
        error
      );

      res.status(500).json({
        message:
          "Could not add achievement.",
        error: error.message,
      });
    }
  }
);


// =========================================================
// ADMIN - GET ALL ACHIEVEMENTS
// =========================================================

router.get(
  "/all",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `
        SELECT
          a.id,
          a.player_id,
          a.tournament_id,
          a.match_id,
          a.achievement_title,
          a.achievement_type,
          a.result,
          a.points_earned,
          a.achievement_date,
          a.description,
          a.created_at,

          p.full_name AS player_name,

          t.name AS tournament_name,

          m.match_no,
          m.round_name

        FROM achievements a

        JOIN players p
          ON a.player_id = p.id

        LEFT JOIN tournaments t
          ON a.tournament_id = t.id

        LEFT JOIN matches m
          ON a.match_id = m.id

        ORDER BY
          a.achievement_date DESC,
          a.id DESC
        `
      );

      res.json(rows);

    } catch (error) {
      console.error(
        "Get all achievements error:",
        error
      );

      res.status(500).json({
        message:
          "Could not load achievements.",
        error: error.message,
      });
    }
  }
);


// =========================================================
// PLAYER - GET OWN ACHIEVEMENTS
// =========================================================

router.get(
  "/my",
  requireAuth,
  requirePlayer,
  async (req, res) => {
    try {
      // Find player belonging to logged-in user
      const [players] = await pool.query(
        `
        SELECT id
        FROM players
        WHERE user_id = ?
        `,
        [req.user.id]
      );

      if (!players.length) {
        return res.status(404).json({
          message:
            "Player profile not found.",
        });
      }

      const playerId = players[0].id;

      // Get achievements
      const [rows] = await pool.query(
        `
        SELECT
          a.id,
          a.achievement_title,
          a.achievement_type,
          a.result,
          a.points_earned,
          a.achievement_date,
          a.description,

          t.name AS tournament_name,

          m.match_no,
          m.round_name

        FROM achievements a

        LEFT JOIN tournaments t
          ON a.tournament_id = t.id

        LEFT JOIN matches m
          ON a.match_id = m.id

        WHERE a.player_id = ?

        ORDER BY
          a.achievement_date DESC,
          a.id DESC
        `,
        [playerId]
      );

      res.json(rows);

    } catch (error) {
      console.error(
        "Get my achievements error:",
        error
      );

      res.status(500).json({
        message:
          "Could not load your achievements.",
        error: error.message,
      });
    }
  }
);


// =========================================================
// ADMIN - GET ACHIEVEMENTS FOR SPECIFIC PLAYER
// =========================================================

router.get(
  "/player/:playerId",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `
        SELECT
          a.id,
          a.player_id,
          a.tournament_id,
          a.match_id,
          a.achievement_title,
          a.achievement_type,
          a.result,
          a.points_earned,
          a.achievement_date,
          a.description,
          a.created_at,

          p.full_name AS player_name,

          t.name AS tournament_name,

          m.match_no,
          m.round_name

        FROM achievements a

        JOIN players p
          ON a.player_id = p.id

        LEFT JOIN tournaments t
          ON a.tournament_id = t.id

        LEFT JOIN matches m
          ON a.match_id = m.id

        WHERE a.player_id = ?

        ORDER BY
          a.achievement_date DESC,
          a.id DESC
        `,
        [req.params.playerId]
      );

      res.json(rows);

    } catch (error) {
      console.error(
        "Get player achievements error:",
        error
      );

      res.status(500).json({
        message:
          "Could not load player achievements.",
        error: error.message,
      });
    }
  }
);


// =========================================================
// ADMIN - UPDATE ACHIEVEMENT
// =========================================================

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        player_id,
        tournament_id,
        match_id,
        achievement_title,
        achievement_type,
        result,
        points_earned,
        achievement_date,
        description,
      } = req.body;

      if (
        !player_id ||
        !achievement_title ||
        !achievement_type
      ) {
        return res.status(400).json({
          message:
            "Player, achievement title and achievement type are required.",
        });
      }

      const [existing] = await pool.query(
        `
        SELECT id
        FROM achievements
        WHERE id = ?
        `,
        [req.params.id]
      );

      if (!existing.length) {
        return res.status(404).json({
          message:
            "Achievement not found.",
        });
      }

      await pool.query(
        `
        UPDATE achievements

        SET
          player_id = ?,
          tournament_id = ?,
          match_id = ?,
          achievement_title = ?,
          achievement_type = ?,
          result = ?,
          points_earned = ?,
          achievement_date = ?,
          description = ?

        WHERE id = ?
        `,
        [
          player_id,
          tournament_id || null,
          match_id || null,
          achievement_title,
          achievement_type,
          result || null,
          Number(points_earned) || 0,
          achievement_date || null,
          description || null,
          req.params.id,
        ]
      );

      res.json({
        message:
          "Achievement updated successfully.",
      });

    } catch (error) {
      console.error(
        "Update achievement error:",
        error
      );

      res.status(500).json({
        message:
          "Could not update achievement.",
        error: error.message,
      });
    }
  }
);


// =========================================================
// ADMIN - DELETE ACHIEVEMENT
// =========================================================

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const [result] = await pool.query(
        `
        DELETE FROM achievements
        WHERE id = ?
        `,
        [req.params.id]
      );

      if (!result.affectedRows) {
        return res.status(404).json({
          message:
            "Achievement not found.",
        });
      }

      res.json({
        message:
          "Achievement deleted successfully.",
      });

    } catch (error) {
      console.error(
        "Delete achievement error:",
        error
      );

      res.status(500).json({
        message:
          "Could not delete achievement.",
        error: error.message,
      });
    }
  }
);


export default router;