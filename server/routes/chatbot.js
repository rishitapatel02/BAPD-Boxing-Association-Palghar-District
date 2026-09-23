import express from "express";
import { GoogleGenAI } from "@google/genai";
import { pool } from "../config/db.js";
import { requireAuth, requirePlayer } from "../middleware/auth.js";
import { faqAnswer } from "../utils/faq.js";

const router = express.Router();

// =========================================================
// PUBLIC BAPD CHATBOT
// =========================================================

router.post("/", async (req, res) => {
  const message = String(req.body.message || "").trim();

  if (!message) {
    return res.status(400).json({
      message: "Message is required",
    });
  }

  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    return res.json({
      reply: faqAnswer(message),
      source: "faq",
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        apiVersion: "v1",
      },
    });

    const interaction = await ai.interactions.create({
      model:
        process.env.GEMINI_MODEL ||
        "gemini-3-flash-preview",

      input: `
You are the BAPD (Boxing Association of Palghar District)
website support assistant.

Answer questions about:
- BAPD player registration
- tournaments
- rankings
- schedules
- results
- notices
- contact
- website navigation
- general boxing guidance

Rules:
1. Do not invent official BAPD rules, fees, requirements,
   schedules, selections or decisions.
2. Clearly separate confirmed BAPD information from general
   boxing guidance.
3. If a BAPD-specific fact is not available, say that the
   user should contact the association.
4. Keep the answer concise, friendly and useful.

User question:
${message}
`,
    });

    return res.json({
      reply:
        interaction.output_text ||
        faqAnswer(message),
      source: "gemini",
    });
  } catch (error) {
    console.error(
      "Chatbot Gemini error:",
      error
    );

    return res.json({
      reply: faqAnswer(message),
      source: "faq",
      fallbackReason:
        "AI service unavailable",
    });
  }
});

// =========================================================
// PLAYER PERSONALIZED AI INSIGHTS
// =========================================================

router.post(
  "/player-insights",
  requireAuth,
  requirePlayer,
  async (req, res) => {
    const action = String(
      req.body.action || ""
    ).trim();

    const allowedActions = [
      "Analyze my achievements",
      "Suggest my next competition level",
      "Create my boxing development plan",
    ];

    if (!allowedActions.includes(action)) {
      return res.status(400).json({
        message: "Invalid AI insight action",
      });
    }

    try {
      // -----------------------------------------------------
      // LOAD PLAYER PROFILE
      // -----------------------------------------------------

      const [playerRows] = await pool.query(
        `
        SELECT
          p.id,
          p.full_name,
          p.gender,
          p.weight_category,
          p.age_group,
          p.club,
          p.status,
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
        WHERE p.user_id = ?
        LIMIT 1
        `,
        [req.user.id]
      );

      if (!playerRows.length) {
        return res.status(404).json({
          message: "Player profile not found",
        });
      }

      const player = playerRows[0];

      // -----------------------------------------------------
      // LOAD ACHIEVEMENTS
      // -----------------------------------------------------

      const [achievementRows] = await pool.query(
        `
        SELECT
          a.achievement_level,
          a.achievement_title,
          a.achievement_type,
          a.result,
          a.points_earned,
          a.achievement_date,
          a.description,
          a.custom_tournament_name,
          t.name AS tournament_name
        FROM achievements a
        LEFT JOIN tournaments t
          ON t.id = a.tournament_id
        WHERE a.player_id = ?
        ORDER BY
          a.achievement_date DESC,
          a.id DESC
        LIMIT 50
        `,
        [player.id]
      );

      // -----------------------------------------------------
      // PREPARE MEDAL COUNTS
      // -----------------------------------------------------

      const gold = achievementRows.filter(
        (item) =>
          String(item.result || "")
            .toLowerCase()
            .includes("gold")
      ).length;

      const silver = achievementRows.filter(
        (item) =>
          String(item.result || "")
            .toLowerCase()
            .includes("silver")
      ).length;

      const bronze = achievementRows.filter(
        (item) =>
          String(item.result || "")
            .toLowerCase()
            .includes("bronze")
      ).length;

      const achievementPoints =
        achievementRows.reduce(
          (sum, item) =>
            sum + Number(item.points_earned || 0),
          0
        );

      const highestLevel =
        achievementRows[0]?.achievement_level ||
        "No achievement level recorded";

      // -----------------------------------------------------
      // BUILD SAFE PLAYER CONTEXT
      // -----------------------------------------------------

      const achievementSummary =
        achievementRows.length === 0
          ? "No achievements have been recorded yet."
          : achievementRows
              .map((item, index) => {
                const tournament =
                  item.tournament_name ||
                  item.custom_tournament_name ||
                  "Not specified";

                return [
                  `${index + 1}.`,
                  `Level: ${
                    item.achievement_level ||
                    "Not specified"
                  }`,
                  `Tournament: ${tournament}`,
                  `Title: ${
                    item.achievement_title ||
                    "Not specified"
                  }`,
                  `Type: ${
                    item.achievement_type ||
                    "Not specified"
                  }`,
                  `Result: ${
                    item.result ||
                    "Not specified"
                  }`,
                  `Points: ${Number(
                    item.points_earned || 0
                  )}`,
                  `Date: ${
                    item.achievement_date ||
                    "Not specified"
                  }`,
                  `Description: ${
                    item.description || ""
                  }`,
                ].join(" | ");
              })
              .join("\n");

      // -----------------------------------------------------
      // FALLBACK WITHOUT GEMINI
      // -----------------------------------------------------

      const fallback =
        action === "Analyze my achievements"
          ? `You currently have ${
              achievementRows.length
            } recorded achievement(s), ${gold} Gold, ${silver} Silver and ${bronze} Bronze medal(s), with ${achievementPoints} achievement point(s).`
          : action ===
              "Suggest my next competition level"
            ? `Your current highest recorded achievement level is ${highestLevel}. Review your recent results with your coach or association official before deciding on your next competition level.`
            : `Your current profile has ${
                achievementRows.length
              } achievement(s) and ${
                player.ranking_points
              } ranking point(s). A development plan should be discussed with your coach and aligned with your training and competition schedule.`;

      // -----------------------------------------------------
      // GEMINI
      // -----------------------------------------------------

      const key = process.env.GEMINI_API_KEY;

      if (!key) {
        return res.json({
          reply: fallback,
          source: "local",
        });
      }

      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          apiVersion: "v1",
        },
      });

      const interaction = await ai.interactions.create({
        model:
          process.env.GEMINI_MODEL ||
          "gemini-3-flash-preview",

        input: `
You are an AI boxing development assistant inside the
BAPD (Boxing Association of Palghar District) player portal.

Generate a personalized but concise response for the player.

IMPORTANT RULES:
1. Use only the player data supplied below.
2. Do not invent BAPD rules, selection criteria, fees,
   tournament dates, qualification requirements or official
   decisions.
3. Distinguish personal-development suggestions from official
   BAPD information.
4. Do not diagnose injuries or medical conditions.
5. Do not promise selection, victory or advancement.
6. Keep the response practical and easy for a student/athlete
   to understand.
7. Mention when the player should confirm something with a
   coach or BAPD official.

PLAYER PROFILE
Name: ${player.full_name}
Gender: ${player.gender || "Not specified"}
Weight Category: ${
          player.weight_category || "Not specified"
        }
Age Group: ${player.age_group || "Not specified"}
Club: ${player.club || "Not specified"}
Approval Status: ${
          player.status || "Not specified"
        }
Ranking Points: ${Number(
          player.ranking_points || 0
        )}
Total Achievements: ${achievementRows.length}
Achievement Points: ${achievementPoints}
Gold Medals: ${gold}
Silver Medals: ${silver}
Bronze Medals: ${bronze}
Highest Recorded Achievement Level: ${highestLevel}

ACHIEVEMENTS
${achievementSummary}

PLAYER REQUEST
${action}

Response format:
- Start with a one-line personalized summary.
- Give 3 to 5 useful points.
- End with one practical next step.
`,
      });

      return res.json({
        reply:
          interaction.output_text ||
          fallback,
        source: "gemini",
      });
    } catch (error) {
      console.error(
        "Player AI insight error:",
        error
      );

      return res.json({
        reply:
          "The AI service is temporarily unavailable. Please review your achievements with your coach or BAPD official and try again later.",
        source: "fallback",
      });
    }
  }
);

export default router;