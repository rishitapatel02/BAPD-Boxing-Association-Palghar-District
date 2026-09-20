import express from "express";
import multer from "multer";
import path from "path";

import { pool } from "../config/db.js";
import {
  requireAuth,
  requirePlayer,
} from "../middleware/auth.js";

import { sendEmail } from "../config/email.js";

const router = express.Router();

// =========================================================
// FILE UPLOAD SETUP
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
      Date.now() + "-" + safeName
    );
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowed = /^image\/(jpeg|png|webp|jpg)$/.test(
      file.mimetype
    );

    cb(null, allowed);
  },
});

// =========================================================
// PLAYER PROFILE / REGISTRATION
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

      // -----------------------------------------------------
      // VALIDATION
      // -----------------------------------------------------

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

      // -----------------------------------------------------
      // FILES
      // -----------------------------------------------------

      const photo =
        req.files?.photo?.[0]?.filename || null;

      const proof =
        req.files?.age_proof?.[0]?.filename || null;

      // -----------------------------------------------------
      // CHECK EXISTING PROFILE
      // -----------------------------------------------------

      const [existing] = await pool.query(
        "SELECT id FROM players WHERE user_id=?",
        [req.user.id]
      );

      if (existing.length) {
        return res.status(409).json({
          message:
            "Player profile already exists",
        });
      }

      // -----------------------------------------------------
      // GET PLAYER EMAIL
      // -----------------------------------------------------

      const [users] = await pool.query(
        "SELECT email FROM users WHERE id=?",
        [req.user.id]
      );

      const playerEmail =
        users.length ? users[0].email : null;

      // -----------------------------------------------------
      // INSERT PLAYER PROFILE
      // -----------------------------------------------------

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

      // -----------------------------------------------------
      // EMAIL NOTIFICATIONS
      // -----------------------------------------------------

      // Send emails separately so that an email failure
      // does NOT undo the successful player registration.

      try {
        // ADMIN NOTIFICATION
        await sendEmail({
          to: process.env.EMAIL_TO,

          subject:
            "New BAPD Player Registration",

          text: `
A new player profile has been submitted on the BAPD website.

Player Name: ${full_name}
Date of Birth: ${dob}
Gender: ${gender}
Weight Category: ${weight_category}
Age Group: ${age_group}
Club: ${club || "Not provided"}
Phone: ${phone || "Not provided"}
Email: ${playerEmail || "Not available"}

The profile is now pending admin approval.
          `,

          html: `
            <h2>New BAPD Player Registration</h2>

            <p>
              A new player profile has been submitted
              on the BAPD website.
            </p>

            <table cellpadding="8" cellspacing="0" border="1">
              <tr>
                <td><strong>Player Name</strong></td>
                <td>${full_name}</td>
              </tr>

              <tr>
                <td><strong>Date of Birth</strong></td>
                <td>${dob}</td>
              </tr>

              <tr>
                <td><strong>Gender</strong></td>
                <td>${gender}</td>
              </tr>

              <tr>
                <td><strong>Weight Category</strong></td>
                <td>${weight_category}</td>
              </tr>

              <tr>
                <td><strong>Age Group</strong></td>
                <td>${age_group}</td>
              </tr>

              <tr>
                <td><strong>Club</strong></td>
                <td>${club || "Not provided"}</td>
              </tr>

              <tr>
                <td><strong>Phone</strong></td>
                <td>${phone || "Not provided"}</td>
              </tr>

              <tr>
                <td><strong>Email</strong></td>
                <td>${playerEmail || "Not available"}</td>
              </tr>
            </table>

            <p>
              <strong>Status:</strong>
              Pending admin approval.
            </p>
          `,
        });

        console.log(
          "Admin registration email sent successfully."
        );

        // PLAYER CONFIRMATION
        if (playerEmail) {
          await sendEmail({
            to: playerEmail,

            subject:
              "BAPD Player Registration Submitted",

            text: `
Hello ${full_name},

Your player profile has been successfully submitted to the Boxing Association of Palghar District (BAPD).

Your registration is currently pending admin approval.

You will be able to access approved player features after your profile is approved.

Thank you,
BAPD
            `,

            html: `
              <h2>BAPD Player Registration Submitted</h2>

              <p>
                Hello <strong>${full_name}</strong>,
              </p>

              <p>
                Your player profile has been successfully
                submitted to the Boxing Association of
                Palghar District (BAPD).
              </p>

              <p>
                <strong>Status:</strong>
                Pending admin approval
              </p>

              <p>
                You will be able to access approved player
                features after your profile is approved.
              </p>

              <p>
                Thank you,<br />
                <strong>BAPD</strong>
              </p>
            `,
          });

          console.log(
            "Player confirmation email sent successfully."
          );
        }

      } catch (emailError) {
        // IMPORTANT:
        // Registration remains successful even if
        // email sending fails.

        console.error(
          "Registration email error:",
          emailError.message
        );
      }

      // -----------------------------------------------------
      // SUCCESS RESPONSE
      // -----------------------------------------------------

      return res.status(201).json({
        message:
          "Player profile submitted for admin approval",
        playerId: result.insertId,
      });

    } catch (error) {
      console.error(
        "Player registration error:",
        error
      );

      return res.status(500).json({
        message:
          "Could not save player profile",
        error: error.message,
      });
    }
  }
);

// =========================================================
// GET CURRENT PLAYER PROFILE
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
      });
    }
  }
);

// =========================================================
// TOURNAMENT REGISTRATION
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

      if (
        !players.length ||
        players[0].status !== "approved"
      ) {
        return res.status(403).json({
          message:
            "Only approved players can register for tournaments",
        });
      }

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

      res.status(409).json({
        message:
          "You may already be registered for this tournament",
      });
    }
  }
);

export default router;