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
import chatbotRoutes from "./routes/chatbot.js";
import coachRoutes from "./routes/coaches.js";
import matchRoutes from "./routes/matches.js";
import emailRoutes from "./routes/email.js";

dotenv.config();

const app = express();

// =========================================================
// PATH SETUP
// =========================================================

const __filename = fileURLToPath(
  import.meta.url
);

const __dirname = path.dirname(
  __filename
);

// =========================================================
// MIDDLEWARE
// =========================================================

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",
  })
);

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
app.use(
  "/api/email",
  emailRoutes
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
// API ROUTES
// =========================================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/public",
  publicRoutes
);

app.use(
  "/api/players",
  playerRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/coaches",
  coachRoutes
);

app.use(
  "/api/chatbot",
  chatbotRoutes
);

app.use(
  "/api/matches",
  matchRoutes
);

// =========================================================
// 404 HANDLER
// =========================================================

app.use((req, res) => {
  res.status(404).json({
    message: "API route not found",
    path: req.originalUrl,
  });
});

// =========================================================
// ERROR HANDLER
// =========================================================

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  res.status(500).json({
    message: "Internal server error",
  });
});

// =========================================================
// START SERVER
// =========================================================

const PORT = Number(
  process.env.PORT || 5000
);

app.listen(PORT, async () => {
  try {
    await testDb();

    console.log(
      `BAPD server running on http://localhost:${PORT}`
    );

    console.log(
      "MySQL connected successfully"
    );
  } catch (error) {
    console.error(
      "MySQL connection failed:",
      error.message
    );
  }
});