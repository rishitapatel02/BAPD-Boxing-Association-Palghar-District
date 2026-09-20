import express from "express";
import { pool } from "../config/db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// =========================
// GET ALL COACHES
// =========================

router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM coaches ORDER BY created_at DESC"
    );

    res.json(rows);
  } catch (error) {
    console.error("Get coaches error:", error);

    res.status(500).json({
      message: "Could not load coaches",
    });
  }
});

// =========================
// ADD COACH
// =========================

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      club,
      specialization,
      status,
    } = req.body;

    if (!full_name) {
      return res.status(400).json({
        message: "Coach name is required",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO coaches
      (full_name, email, phone, club, specialization, status)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        full_name,
        email || null,
        phone || null,
        club || null,
        specialization || null,
        status || "active",
      ]
    );

    res.status(201).json({
      message: "Coach added successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Add coach error:", error);

    res.status(500).json({
      message: "Could not add coach",
    });
  }
});

// =========================
// DELETE COACH
// =========================

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM coaches WHERE id = ?",
      [req.params.id]
    );

    res.json({
      message: "Coach deleted successfully",
    });
  } catch (error) {
    console.error("Delete coach error:", error);

    res.status(500).json({
      message: "Could not delete coach",
    });
  }
});

export default router;