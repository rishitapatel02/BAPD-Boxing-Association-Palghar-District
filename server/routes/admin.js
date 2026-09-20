import express from "express";
import { pool } from "../config/db.js";
import multer from "multer";
import path from "path";
import {
  requireAuth,
  requireAdmin,
} from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

// =========================================================
// OVERVIEW
// =========================================================

router.get("/overview", async (req, res) => {
  try {
    const [[players]] = await pool.query(
      "SELECT COUNT(*) c FROM players"
    );

    const [[pending]] = await pool.query(
      "SELECT COUNT(*) c FROM players WHERE status='pending'"
    );

    const [[tournaments]] = await pool.query(
      "SELECT COUNT(*) c FROM tournaments WHERE tournament_date>=CURDATE()"
    );

    const [[messages]] = await pool.query(
      "SELECT COUNT(*) c FROM contact_messages WHERE status='new'"
    );

    res.json({
      players: players.c,
      pending: pending.c,
      upcomingTournaments: tournaments.c,
      newMessages: messages.c,
    });
  } catch (error) {
    console.error("Overview error:", error);

    res.status(500).json({
      message: "Could not load overview",
    });
  }
});

// =========================================================
// PLAYERS
// =========================================================

router.get("/players", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.*,
        u.email
      FROM players p
      JOIN users u ON u.id = p.user_id
      ORDER BY p.created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Get players error:", error);

    res.status(500).json({
      message: "Could not load players",
    });
  }
});

router.patch("/players/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (
      !["approved", "rejected", "pending"].includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    await pool.query(
      "UPDATE players SET status=? WHERE id=?",
      [status, req.params.id]
    );

    res.json({
      message: `Player ${status}`,
    });
  } catch (error) {
    console.error(
      "Update player status error:",
      error
    );

    res.status(500).json({
      message: "Could not update player status",
    });
  }
});

// =========================================================
// TOURNAMENTS - GET ALL
// =========================================================

router.get("/tournaments", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        name,
        tournament_date,
        registration_last_date,
        venue,
        category,
        description,
        status
      FROM tournaments
      ORDER BY tournament_date DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(
      "Get tournaments error:",
      error
    );

    res.status(500).json({
      message: "Could not load tournaments",
    });
  }
});

// =========================================================
// TOURNAMENTS - CREATE
// =========================================================

router.post("/tournaments", async (req, res) => {
  try {
    const {
      name,
      tournament_date,
      registration_last_date,
      venue,
      category,
      description,
      status = "upcoming",
    } = req.body;

    if (!name || !tournament_date || !venue) {
      return res.status(400).json({
        message: "Name, date and venue are required",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO tournaments
      (
        name,
        tournament_date,
        registration_last_date,
        venue,
        category,
        description,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        tournament_date,
        registration_last_date || null,
        venue,
        category || null,
        description || null,
        status,
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: "Tournament created",
    });
  } catch (error) {
    console.error(
      "Create tournament error:",
      error
    );

    res.status(500).json({
      message: "Could not create tournament",
    });
  }
});

// =========================================================
// TOURNAMENT REGISTRATIONS
// =========================================================

router.get(
  "/tournaments/:tournamentId/registrations",
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `
        SELECT
          tr.id AS registration_id,
          tr.tournament_id,
          tr.player_id,
          tr.created_at AS registered_at,
          p.full_name,
          p.gender,
          p.dob,
          p.weight_category,
          p.age_group,
          p.club,
          p.phone,
          u.email
        FROM tournament_registrations tr
        JOIN players p
          ON p.id = tr.player_id
        JOIN users u
          ON u.id = p.user_id
        WHERE tr.tournament_id = ?
        ORDER BY tr.created_at DESC
        `,
        [req.params.tournamentId]
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
      });
    }
  }
);

// =========================================================
// MATCHES - CREATE
// =========================================================

router.post("/matches", async (req, res) => {
  try {
    const {
      tournament_id,
      match_no,
      round_name,
      category,
      scheduled_at,
      venue,
      player_a_id,
      player_b_id,
    } = req.body;

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

    if (
      Number(player_a_id) === Number(player_b_id)
    ) {
      return res.status(400).json({
        message:
          "Player A and Player B must be different",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO matches
      (
        tournament_id,
        match_no,
        round_name,
        category,
        scheduled_at,
        venue,
        player_a_id,
        player_b_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        tournament_id,
        match_no || null,
        round_name,
        category,
        scheduled_at || null,
        venue || null,
        player_a_id,
        player_b_id,
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: "Match scheduled",
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
});

// =========================================================
// MATCHES - GET ALL
// =========================================================

router.get("/matches", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        m.*,
        t.name AS tournament_name,
        a.full_name AS player_a,
        b.full_name AS player_b
      FROM matches m
      JOIN tournaments t
        ON t.id = m.tournament_id
      LEFT JOIN players a
        ON a.id = m.player_a_id
      LEFT JOIN players b
        ON b.id = m.player_b_id
      ORDER BY m.scheduled_at
    `);

    res.json(rows);
  } catch (error) {
    console.error(
      "Get matches error:",
      error
    );

    res.status(500).json({
      message: "Could not load matches",
    });
  }
});

// =========================================================
// RESULTS
// =========================================================

router.post("/results", async (req, res) => {
  const {
    match_id,
    winner_player_id,
    loser_player_id,
    result_type,
    points_awarded,
    notes,
    round_scores,
  } = req.body;

  const connection =
    await pool.getConnection();

  try {
    await connection.beginTransaction();

    const finalRoundScores =
      Array.isArray(round_scores)
        ? round_scores
        : [];

    await connection.query(
      `
      INSERT INTO results
      (
        match_id,
        winner_player_id,
        loser_player_id,
        result_type,
        points_awarded,
        notes,
        round_scores
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        winner_player_id=VALUES(winner_player_id),
        loser_player_id=VALUES(loser_player_id),
        result_type=VALUES(result_type),
        points_awarded=VALUES(points_awarded),
        notes=VALUES(notes),
        round_scores=VALUES(round_scores)
      `,
      [
        match_id,
        winner_player_id || null,
        loser_player_id || null,
        result_type || "Decision",
        Number(points_awarded || 0),
        notes || null,
        JSON.stringify(finalRoundScores),
      ]
    );

    await connection.query(
      `
      UPDATE matches
      SET status='completed'
      WHERE id=?
      `,
      [match_id]
    );

    // Update ranking points for winner

    if (winner_player_id) {
      const [players] =
        await connection.query(
          `
          SELECT
            weight_category,
            age_group
          FROM players
          WHERE id=?
          `,
          [winner_player_id]
        );

      if (players.length > 0) {
        await connection.query(
          `
          INSERT INTO rankings
          (
            player_id,
            weight_category,
            age_group,
            points
          )
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            points=points+VALUES(points)
          `,
          [
            winner_player_id,
            players[0].weight_category,
            players[0].age_group,
            Number(points_awarded || 0),
          ]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      message:
        "Result recorded and ranking points updated",
    });
  } catch (error) {
    await connection.rollback();

    console.error(
      "Record result error:",
      error
    );

    res.status(500).json({
      message: "Could not record result",
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

// =========================================================
// RANKINGS RECALCULATE
// =========================================================

router.post(
  "/rankings/recalculate",
  async (req, res) => {
    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      // -------------------------------------------------
      // 1. Get all approved players
      // -------------------------------------------------

      const [players] =
        await connection.query(`
          SELECT
            id,
            full_name,
            weight_category,
            age_group
          FROM players
          WHERE status='approved'
          ORDER BY full_name
        `);

      // -------------------------------------------------
      // 2. Make sure every approved player exists
      //    in the rankings table
      // -------------------------------------------------

      for (const player of players) {
        await connection.query(
          `
          INSERT INTO rankings
          (
            player_id,
            weight_category,
            age_group,
            points,
            rank_position
          )
          VALUES (?, ?, ?, 0, 0)
          ON DUPLICATE KEY UPDATE
            weight_category=VALUES(weight_category),
            age_group=VALUES(age_group)
          `,
          [
            player.id,
            player.weight_category,
            player.age_group,
          ]
        );
      }

      // -------------------------------------------------
      // 3. Get rankings ordered by category,
      //    age group and points
      // -------------------------------------------------

      const [rankings] =
        await connection.query(`
          SELECT
            r.id,
            r.player_id,
            r.weight_category,
            r.age_group,
            r.points,
            p.full_name
          FROM rankings r
          JOIN players p
            ON p.id = r.player_id
          WHERE p.status='approved'
          ORDER BY
            r.weight_category ASC,
            r.age_group ASC,
            r.points DESC,
            p.full_name ASC
        `);

      // -------------------------------------------------
      // 4. Calculate rank position separately for each
      //    weight category + age group
      // -------------------------------------------------

      let currentGroup = null;
      let position = 0;

      for (const ranking of rankings) {
        const group =
          `${ranking.weight_category}|${ranking.age_group}`;

        if (group !== currentGroup) {
          currentGroup = group;
          position = 1;
        } else {
          position++;
        }

        await connection.query(
          `
          UPDATE rankings
          SET rank_position=?
          WHERE id=?
          `,
          [
            position,
            ranking.id,
          ]
        );
      }

      await connection.commit();

      // -------------------------------------------------
      // 5. Return useful information
      // -------------------------------------------------

      res.json({
        message:
          "Rankings recalculated successfully",
        playersProcessed:
          players.length,
        rankingsUpdated:
          rankings.length,
      });

    } catch (error) {
      await connection.rollback();

      console.error(
        "Ranking recalculation error:",
        error
      );

      res.status(500).json({
        message:
          "Could not recalculate rankings",
        error: error.message,
      });

    } finally {
      connection.release();
    }
  }
);

// =========================================================
// GALLERY
// =========================================================

const galleryStorage =
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
      const uniqueName =
        Date.now() +
        "-" +
        Math.round(
          Math.random() * 1e9
        ) +
        path.extname(
          file.originalname
        );

      cb(null, uniqueName);
    },
  });

const galleryUpload = multer({
  storage: galleryStorage,

  limits: {
    // Maximum 100 MB PER IMAGE
    fileSize:
      100 * 1024 * 1024,
  },

  fileFilter: (
    req,
    file,
    cb
  ) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    if (
      allowed.includes(
        file.mimetype
      )
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only JPG, PNG and WEBP images are allowed."
        )
      );
    }
  },
});

router.post(
  "/gallery",
  galleryUpload.array(
    "images",
    20
  ),
  async (req, res) => {
    try {
      const {
        title,
        caption,
      } = req.body;

      // -------------------------------------------------
      // Check images
      // -------------------------------------------------

      if (
        !req.files ||
        req.files.length === 0
      ) {
        return res.status(400).json({
          message:
            "Please select at least one image.",
        });
      }

      // -------------------------------------------------
      // Check title
      // -------------------------------------------------

      if (
        !title ||
        !title.trim()
      ) {
        return res.status(400).json({
          message:
            "Gallery title is required.",
        });
      }

      // -------------------------------------------------
      // Insert every uploaded image
      // under the same title
      // -------------------------------------------------

      for (const file of req.files) {
        const imagePath =
          `/uploads/${file.filename}`;

        await pool.query(
          `
          INSERT INTO gallery
          (
            title,
            image_path,
            caption
          )
          VALUES (?, ?, ?)
          `,
          [
            title.trim(),
            imagePath,
            caption || null,
          ]
        );
      }

      res.status(201).json({
        message:
          `${req.files.length} image(s) uploaded successfully.`,
        count:
          req.files.length,
      });

    } catch (error) {
      console.error(
        "Gallery upload error:",
        error
      );

      res.status(500).json({
        message:
          "Could not upload gallery images.",
        error:
          error.message,
      });
    }
  }
);

// =========================================================
// NEWS - GET ALL
// =========================================================

router.get(
  "/news",
  async (req, res) => {
    try {
      const [rows] =
        await pool.query(`
          SELECT
            id,
            title,
            content,
            is_published
          FROM news
          ORDER BY id DESC
        `);

      res.json(rows);
    } catch (error) {
      console.error(
        "Get news error:",
        error
      );

      res.status(500).json({
        message:
          "Could not load news",
      });
    }
  }
);

// =========================================================
// NEWS - CREATE
// =========================================================

router.post(
  "/news",
  async (req, res) => {
    try {
      const {
        title,
        content,
        body,
        is_published = true,
      } = req.body;

      const finalContent =
        content || body;

      if (
        !title ||
        !finalContent
      ) {
        return res.status(400).json({
          message:
            "Title and content are required",
        });
      }

      const [result] =
        await pool.query(
          `
          INSERT INTO news
          (
            title,
            content,
            is_published
          )
          VALUES (?, ?, ?)
          `,
          [
            title,
            finalContent,
            is_published,
          ]
        );

      res.status(201).json({
        id:
          result.insertId,
        message:
          "News posted",
      });

    } catch (error) {
      console.error(
        "Create news error:",
        error
      );

      res.status(500).json({
        message:
          "Could not create news",
      });
    }
  }
);

// =========================================================
// NEWS - DELETE
// =========================================================

router.delete(
  "/news/:id",
  async (req, res) => {
    try {
      await pool.query(
        "DELETE FROM news WHERE id=?",
        [req.params.id]
      );

      res.json({
        message:
          "News deleted",
      });

    } catch (error) {
      console.error(
        "Delete news error:",
        error
      );

      res.status(500).json({
        message:
          "Could not delete news",
      });
    }
  }
);

// =========================================================
// CONTACT MESSAGES
// =========================================================

router.get(
  "/messages",
  async (req, res) => {
    try {
      const [rows] =
        await pool.query(
          `
          SELECT *
          FROM contact_messages
          ORDER BY created_at DESC
          `
        );

      res.json(rows);

    } catch (error) {
      console.error(
        "Get messages error:",
        error
      );

      res.status(500).json({
        message:
          "Could not load messages",
      });
    }
  }
);

router.patch(
  "/messages/:id",
  async (req, res) => {
    try {
      await pool.query(
        `
        UPDATE contact_messages
        SET status=?
        WHERE id=?
        `,
        [
          req.body.status ||
            "read",
          req.params.id,
        ]
      );

      res.json({
        message:
          "Message updated",
      });

    } catch (error) {
      console.error(
        "Update message error:",
        error
      );

      res.status(500).json({
        message:
          "Could not update message",
      });
    }
  }
);

// =========================================================
// EXPORT PLAYERS CSV
// =========================================================

router.get(
  "/export/players.csv",
  async (req, res) => {
    try {
      const [rows] =
        await pool.query(`
          SELECT
            p.full_name,
            u.email,
            p.gender,
            p.dob,
            p.weight_category,
            p.age_group,
            p.club,
            p.status
          FROM players p
          JOIN users u
            ON u.id=p.user_id
          ORDER BY p.full_name
        `);

      const header =
        "Name,Email,Gender,DOB,Weight Category,Age Group,Club,Status\n";

      const csv =
        header +
        rows
          .map((r) =>
            [
              r.full_name,
              r.email,
              r.gender,
              r.dob,
              r.weight_category,
              r.age_group,
              r.club || "",
              r.status,
            ]
              .map(
                (v) =>
                  '"' +
                  String(v).replaceAll(
                    '"',
                    '""'
                  ) +
                  '"'
              )
              .join(",")
          )
          .join("\n");

      res.setHeader(
        "Content-Type",
        "text/csv"
      );

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=bapd_players.csv"
      );

      res.send(csv);

    } catch (error) {
      console.error(
        "Export players error:",
        error
      );

      res.status(500).json({
        message:
          "Could not export players",
      });
    }
  }
);

// =========================================================
// EXPORT TOURNAMENTS CSV
// =========================================================

router.get(
  "/export/tournaments.csv",
  async (req, res) => {
    try {
      const [rows] =
        await pool.query(`
          SELECT
            name,
            tournament_date,
            registration_last_date,
            venue,
            category,
            status
          FROM tournaments
          ORDER BY tournament_date
        `);

      const header =
        "Name,Date,Registration Last Date,Venue,Category,Status\n";

      const csv =
        header +
        rows
          .map((r) =>
            [
              r.name,
              r.tournament_date,
              r.registration_last_date ||
                "",
              r.venue,
              r.category || "",
              r.status,
            ]
              .map(
                (v) =>
                  '"' +
                  String(v).replaceAll(
                    '"',
                    '""'
                  ) +
                  '"'
              )
              .join(",")
          )
          .join("\n");

      res.setHeader(
        "Content-Type",
        "text/csv"
      );

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=bapd_tournaments.csv"
      );

      res.send(csv);

    } catch (error) {
      console.error(
        "Export tournaments error:",
        error
      );

      res.status(500).json({
        message:
          "Could not export tournaments",
      });
    }
  }
);

// =========================================================
// COACHES / OFFICIALS
// =========================================================

router.get(
  "/coaches",
  async (req, res) => {
    try {
      const [rows] =
        await pool.query(
          `
          SELECT *
          FROM coaches_officials
          ORDER BY full_name
          `
        );

      res.json(rows);

    } catch (error) {
      console.error(
        "Get coaches error:",
        error
      );

      res.status(500).json({
        message:
          "Could not load coaches",
      });
    }
  }
);

router.post(
  "/coaches",
  async (req, res) => {
    try {
      const {
        full_name,
        role_title,
        club,
        phone,
        email,
      } = req.body;

      if (
        !full_name ||
        !role_title
      ) {
        return res.status(400).json({
          message:
            "Full name and role are required",
        });
      }

      const [result] =
        await pool.query(
          `
          INSERT INTO coaches_officials
          (
            full_name,
            role_title,
            club,
            phone,
            email
          )
          VALUES (?, ?, ?, ?, ?)
          `,
          [
            full_name,
            role_title,
            club || null,
            phone || null,
            email || null,
          ]
        );

      res.status(201).json({
        id:
          result.insertId,
        message:
          "Coach/official added",
      });

    } catch (error) {
      console.error(
        "Create coach error:",
        error
      );

      res.status(500).json({
        message:
          "Could not add coach/official",
      });
    }
  }
);

export default router;
