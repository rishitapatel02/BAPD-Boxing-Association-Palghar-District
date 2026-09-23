import express from "express";
import multer from "multer";
import path from "path";
import { pool } from "../config/db.js";
import {
  requireAuth,
  requirePlayer,
} from "../middleware/auth.js";

const router = express.Router();

// =========================================================
// MULTER STORAGE
// =========================================================

const storage = multer.diskStorage({
  destination: "server/uploads",

  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

    cb(
      null,
      `${Date.now()}-${safeName}`
    );
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    cb(
      null,
      /^image\/(jpeg|png|webp|jpg)$/.test(
        file.mimetype
      )
    );
  },
});

// =========================================================
// CREATE PLAYER PROFILE
// =========================================================

router.post(
  "/profile",
  requireAuth,
  requirePlayer,

  upload.fields([
    {
      name: "photo",
      maxCount: 1,
    },
    {
      name: "age_proof",
      maxCount: 1,
    },
  ]),

  async (req, res) => {
    try {
      const {
        full_name,
        dob,
        gender,
        weight_category,
        age_group,
        club,
        phone,
        address,
        coach_id,
      } = req.body;

      if (
        !full_name ||
        !dob ||
        !gender ||
        !weight_category ||
        !age_group
      ) {
        return res.status(400).json({
          message:
            "Required profile fields are missing",
        });
      }

      const photo =
        req.files?.photo?.[0]?.filename || null;

      const proof =
        req.files?.age_proof?.[0]?.filename ||
        null;

      const [existing] = await pool.query(
        "SELECT id FROM players WHERE user_id = ?",
        [req.user.id]
      );

      if (existing.length) {
        return res.status(409).json({
          message:
            "Player profile already exists",
        });
      }

      const [result] = await pool.query(
        `
        INSERT INTO players
        (
          user_id,
          full_name,
          dob,
          gender,
          weight_category,
          age_group,
          club,
          coach_id,
          photo,
          age_proof,
          phone,
          address
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          req.user.id,
          full_name,
          dob,
          gender,
          weight_category,
          age_group,
          club || null,
          coach_id || null,
          photo,
          proof,
          phone || null,
          address || null,
        ]
      );

      res.status(201).json({
        message:
          "Player profile submitted for admin approval",

        playerId: result.insertId,
      });
    } catch (error) {
      console.error(
        "Player profile error:",
        error
      );

      res.status(500).json({
        message:
          "Could not save player profile",

        error: error.message,
      });
    }
  }
);

// =========================================================
// GET LOGGED-IN PLAYER PROFILE
// =========================================================

router.get(
  "/me",
  requireAuth,
  requirePlayer,

  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `
        SELECT
          p.*,
          u.email,

          COALESCE(
            (
              SELECT points
              FROM rankings rk
              WHERE rk.player_id = p.id
              ORDER BY points DESC
              LIMIT 1
            ),
            0
          ) AS ranking_points

        FROM players p

        JOIN users u
          ON u.id = p.user_id

        WHERE p.user_id = ?
        `,
        [req.user.id]
      );

      if (!rows.length) {
        return res.status(404).json({
          message:
            "Complete your player profile first",
        });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error(
        "Get player profile error:",
        error
      );

      res.status(500).json({
        message:
          "Could not load player profile",

        error: error.message,
      });
    }
  }
);

// =========================================================
// GET LOGGED-IN PLAYER'S TOURNAMENT REGISTRATIONS
// =========================================================

router.get(
  "/tournaments/registrations",
  requireAuth,
  requirePlayer,

  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `
        SELECT
          tr.id AS registration_id,
          tr.tournament_id,
          t.name AS tournament_name,
          t.tournament_date

        FROM tournament_registrations tr

        JOIN players p
          ON p.id = tr.player_id

        JOIN tournaments t
          ON t.id = tr.tournament_id

        WHERE p.user_id = ?

        ORDER BY tr.id DESC
        `,
        [req.user.id]
      );

      res.json(rows);
    } catch (error) {
      console.error(
        "Tournament registrations error:",
        error
      );

      res.status(500).json({
        message:
          "Could not load tournament registrations",

        error: error.message,
      });
    }
  }
);

// =========================================================
// REGISTER PLAYER FOR TOURNAMENT
// =========================================================

router.post(
  "/tournaments/:tournamentId/register",
  requireAuth,
  requirePlayer,

  async (req, res) => {
    try {
      const [players] = await pool.query(
        `
        SELECT id, status
        FROM players
        WHERE user_id = ?
        `,
        [req.user.id]
      );

      if (!players.length) {
        return res.status(404).json({
          message:
            "Player profile not found",
        });
      }

      if (
        players[0].status !==
        "approved"
      ) {
        return res.status(403).json({
          message:
            "Only approved players can register for tournaments",
        });
      }

      // Check whether already registered
      const [existing] =
        await pool.query(
          `
          SELECT id
          FROM tournament_registrations

          WHERE tournament_id = ?
            AND player_id = ?
          `,
          [
            req.params.tournamentId,
            players[0].id,
          ]
        );

      if (existing.length > 0) {
        return res.status(409).json({
          message:
            "You are already registered for this tournament",
        });
      }

      // Create registration
      await pool.query(
        `
        INSERT INTO tournament_registrations
        (
          tournament_id,
          player_id
        )
        VALUES (?, ?)
        `,
        [
          req.params.tournamentId,
          players[0].id,
        ]
      );

      res.status(201).json({
        message:
          "Tournament registration successful",
      });
    } catch (error) {
      console.error(
        "Tournament registration error:",
        error
      );

      res.status(500).json({
        message:
          "Tournament registration failed",

        error: error.message,
      });
    }
  }
);

// =========================================================
// EXPORT ROUTER
// =========================================================

export default router;