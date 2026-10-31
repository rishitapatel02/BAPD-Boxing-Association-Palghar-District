
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

// Security
app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Middleware
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Backend status
app.get("/", (req, res) => {
  res.json({
    name: "BAPD Backend",
    status: "running",
  });
});

// Database connection health check
app.get("/api/health/db", async (req, res) => {
  try {
    await testDb();

    res.json({
      success: true,
      message: "Aiven MySQL connected successfully",
    });
  } catch (error) {
    console.error("Database connection failed:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      cause: error.cause?.message,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/chatbot", chatbotRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// Local server
const PORT = Number(process.env.PORT || 5000);

if (process.env.VERCEL !== "1") {
  app.listen(PORT, async () => {
    console.log(`BAPD server running on http://localhost:${PORT}`);

    try {
      await testDb();
      console.log("MySQL connected successfully");
    } catch (error) {
      console.error("MySQL connection failed:", error.message);
    }
  });
}

export default app;
