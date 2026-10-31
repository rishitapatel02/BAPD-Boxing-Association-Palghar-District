import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { testDb } from "./config/db.js";

import authRoutes from "./routes/auth.js";
import publicRoutes from "./routes/public.js";
import playerRoutes from "./routes/players.js";
import adminRoutes from "./routes/admin.js";
import achievementRoutes from "./routes/achievements.js";
import chatbotRoutes from "./routes/chatbot.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================================================
// SECURITY
// =========================================================

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// =========================================================
// CORS
// =========================================================

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",
    credentials: true,
  })
);

// =========================================================
// BODY PARSING
// =========================================================

app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

// =========================================================
// UPLOADS
// =========================================================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

// =========================================================
// ROOT
// =========================================================

app.get("/", (req, res) => {
  res.json({
    name: "BAPD Backend",
    status: "running",
  });
});

// =========================================================
// AUTH ROUTES
// =========================================================

app.use(
  "/api/auth",
  authRoutes
);

// =========================================================
// PUBLIC ROUTES
// =========================================================

app.use(
  "/api/public",
  publicRoutes
);

// =========================================================
// PLAYER ROUTES
// =========================================================

app.use(
  "/api/players",
  playerRoutes
);

// =========================================================
// ADMIN ROUTES
// =========================================================

app.use(
  "/api/admin",
  adminRoutes
);

// =========================================================
// ACHIEVEMENT ROUTES
// =========================================================

app.use(
  "/api/achievements",
  achievementRoutes
);

// =========================================================
// AI CHATBOT ROUTES
// =========================================================

app.use(
  "/api/chatbot",
  chatbotRoutes
);

// =========================================================
// DATABASE CONNECTION TEST
// =========================================================

app.get("/api/health/db", async (req, res) => {
  try {
    await testDb();

    res.json({
      success: true,
      message: "Aiven MySQL connected successfully"
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }
});

// =========================================================
// 404 HANDLER
// =========================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// =========================================================
// ERROR HANDLER
// =========================================================

app.use((err, req, res, next) => {
  console.error(
    "Server Error:",
    err
  );

  res.status(
    err.status || 500
  ).json({
    success: false,
    message:
      err.message ||
      "Internal server error",
  });
});

// =========================================================
// START SERVER
// =========================================================

const PORT = Number(process.env.PORT || 5000);

if (process.env.VERCEL !== "1") {
  app.listen(PORT, async () => {
    console.log(
      `BAPD server running on http://localhost:${PORT}`
    );

    try {
      await testDb();

      console.log(
        "✅ MySQL connected successfully"
      );
    } catch (error) {
      console.error(
        "❌ MySQL connection failed:",
        error.message
      );
    }
  });
}

export default app;