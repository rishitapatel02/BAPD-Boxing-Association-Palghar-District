import express from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { randomBytes, createHash } from "crypto";

import { pool } from "../config/db.js";
import { createToken } from "../utils/token.js";
import { sendEmail } from "../config/email.js";

const router = express.Router();

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// =========================================================
// PLAYER ACCOUNT REGISTRATION
// =========================================================

router.post(
  "/player/register",
  async (req, res) => {
    try {
      const { email, password } = req.body;

      if (
        !email ||
        !password ||
        password.length < 8
      ) {
        return res.status(400).json({
          message:
            "Email and password are required. Password must be at least 8 characters.",
        });
      }

      const [exists] = await pool.query(
        "SELECT id FROM users WHERE email=?",
        [email]
      );

      if (exists.length) {
        return res.status(409).json({
          message:
            "An account with this email already exists.",
        });
      }

      const hash = await bcrypt.hash(
        password,
        12
      );

      const [result] = await pool.query(
        `
        INSERT INTO users
        (
          email,
          password_hash,
          role
        )
        VALUES (?, ?, 'player')
        `,
        [email, hash]
      );

      res.status(201).json({
        userId: result.insertId,
        message:
          "Account created. Complete your player profile next.",
      });

    } catch (error) {
      console.error(
        "Player registration error:",
        error
      );

      res.status(500).json({
        message: "Registration failed",
        error: error.message,
      });
    }
  }
);

// =========================================================
// PLAYER LOGIN
// =========================================================

router.post(
  "/player/login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      const [rows] = await pool.query(
        `
        SELECT
          u.id,
          u.email,
          u.password_hash,
          u.role,
          p.id AS player_id,
          p.full_name,
          p.status

        FROM users u

        LEFT JOIN players p
          ON p.user_id = u.id

        WHERE
          u.email = ?
          AND u.role = 'player'
        `,
        [email]
      );

      if (
        !rows.length ||
        !rows[0].password_hash ||
        !(await bcrypt.compare(
          password,
          rows[0].password_hash
        ))
      ) {
        return res.status(401).json({
          message:
            "Invalid email or password",
        });
      }

      const user = rows[0];

      const token = createToken({
        id: user.id,
        role: "player",
        playerId: user.player_id,
      });

      res.json({
        token,

        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          playerId: user.player_id,
          name: user.full_name,
          status: user.status,
        },
      });

    } catch (error) {
      console.error(
        "Player login error:",
        error
      );

      res.status(500).json({
        message: "Login failed",
        error: error.message,
      });
    }
  }
);

// =========================================================
// FORGOT PASSWORD
// =========================================================

router.post(
  "/player/forgot-password",
  async (req, res) => {
    try {
      const email = String(
        req.body.email || ""
      )
        .trim()
        .toLowerCase();

      if (!email) {
        return res.status(400).json({
          message:
            "Please enter your email address.",
        });
      }

      // Find player account
      const [users] = await pool.query(
        `
        SELECT
          id,
          email
        FROM users
        WHERE
          email = ?
          AND role = 'player'
        `,
        [email]
      );

      // Always return the same message.
      // This prevents revealing whether
      // an email belongs to an account.
      if (!users.length) {
        return res.json({
          message:
            "If an account exists with this email, a password reset link has been sent.",
        });
      }

      const user = users[0];

      // Invalidate previous unused reset tokens
      await pool.query(
        `
        UPDATE password_resets
        SET used_at = NOW()
        WHERE
          user_id = ?
          AND used_at IS NULL
        `,
        [user.id]
      );

      // Generate secure random token
      const rawToken =
        randomBytes(32).toString("hex");

      // Store only the SHA-256 hash
      const tokenHash = createHash(
        "sha256"
      )
        .update(rawToken)
        .digest("hex");

      // Token expires after 15 minutes
      await pool.query(
        `
        INSERT INTO password_resets
        (
          user_id,
          token_hash,
          expires_at
        )
        VALUES
        (
          ?,
          ?,
          DATE_ADD(NOW(), INTERVAL 5 MINUTE)
        )
        `,
        [user.id, tokenHash]
      );

      const clientUrl =
        process.env.CLIENT_URL ||
        "http://localhost:5173";

      const resetLink =
        `${clientUrl}/reset-password?token=${rawToken}`;

      // Send reset email
      await sendEmail({
        to: user.email,

        subject:
          "BAPD Player Password Reset",

        text: `
Hello,

We received a request to reset your BAPD player account password.

Use the following link to create a new password:

${resetLink}

This link expires in 5 minutes.

If you did not request a password reset, you can ignore this email.

Thank you,
BAPD
        `,

        html: `
          <h2>BAPD Password Reset</h2>

          <p>Hello,</p>

          <p>
            We received a request to reset your
            BAPD player account password.
          </p>

          <p>
            Click the button below to create
            a new password:
          </p>

          <p>
            <a
              href="${resetLink}"
              style="
                display:inline-block;
                padding:12px 20px;
                background:#123b8f;
                color:white;
                text-decoration:none;
                border-radius:6px;
              "
            >
              Reset Password
            </a>
          </p>

          <p>
            This link expires in
            <strong>15 minutes</strong>.
          </p>

          <p>
            If you did not request a password reset,
            you can safely ignore this email.
          </p>

          <p>
            Thank you,<br />
            <strong>BAPD</strong>
          </p>
        `,
      });

      console.log(
        "Password reset email sent to:",
        user.email
      );

      res.json({
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });

    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      res.status(500).json({
        message:
          "Could not process the password reset request.",
      });
    }
  }
);

// =========================================================
// RESET PASSWORD
// =========================================================

router.post(
  "/player/reset-password",
  async (req, res) => {
    try {
      const {
        token,
        password,
      } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          message:
            "Reset token and new password are required.",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          message:
            "Password must be at least 8 characters.",
        });
      }

      // Hash the token received from the URL
      const tokenHash = createHash(
        "sha256"
      )
        .update(token)
        .digest("hex");

      // Find valid unused token
      const [rows] = await pool.query(
        `
        SELECT
          id,
          user_id
        FROM password_resets
        WHERE
          token_hash = ?
          AND expires_at > NOW()
          AND used_at IS NULL
        LIMIT 1
        `,
        [tokenHash]
      );

      if (!rows.length) {
        return res.status(400).json({
          message:
            "This password reset link is invalid or has expired.",
        });
      }

      const resetRecord = rows[0];

      // Hash new password
      const passwordHash =
        await bcrypt.hash(
          password,
          12
        );

      // Update password
      await pool.query(
        `
        UPDATE users
        SET password_hash = ?
        WHERE id = ?
        `,
        [
          passwordHash,
          resetRecord.user_id,
        ]
      );

      // Mark token as used
      await pool.query(
        `
        UPDATE password_resets
        SET used_at = NOW()
        WHERE id = ?
        `,
        [resetRecord.id]
      );

      res.json({
        message:
          "Password reset successful. You can now log in with your new password.",
      });

    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      res.status(500).json({
        message:
          "Could not reset password.",
      });
    }
  }
);

// =========================================================
// ADMIN GOOGLE LOGIN
// =========================================================

router.post(
  "/admin/google",
  async (req, res) => {
    try {
      const {
        credential,
      } = req.body;

      if (!credential) {
        return res.status(400).json({
          message:
            "Google credential is required",
        });
      }

      const ticket =
        await googleClient.verifyIdToken({
          idToken: credential,
          audience:
            process.env.GOOGLE_CLIENT_ID,
        });

      const payload =
        ticket.getPayload();

      const email = (
        payload?.email || ""
      ).toLowerCase();

      const approved = (
        process.env.ADMIN_EMAILS || ""
      )
        .split(",")
        .map((value) =>
          value.trim().toLowerCase()
        )
        .filter(Boolean);

      if (
        !payload?.email_verified ||
        !approved.includes(email)
      ) {
        return res.status(403).json({
          message:
            "This Google account is not an approved BAPD administrator.",
        });
      }

      await pool.query(
        `
        INSERT INTO admins
        (
          email,
          name,
          is_active
        )
        VALUES (?, ?, TRUE)

        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          is_active = TRUE
        `,
        [
          email,
          payload.name || email,
        ]
      );

      const token = createToken({
        email,
        role: "admin",
        googleSub: payload.sub,
      });

      res.json({
        token,

        user: {
          email,
          name:
            payload.name || email,
          picture:
            payload.picture || "",
          role: "admin",
        },
      });

    } catch (error) {
      console.error(
        "Google admin login error:",
        error
      );

      res.status(401).json({
        message:
          "Google authentication could not be verified",
        error: error.message,
      });
    }
  }
);

export default router;
