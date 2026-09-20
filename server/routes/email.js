import express from "express";
import {
  sendEmail,
  verifyEmailConnection,
} from "../config/email.js";

const router = express.Router();

router.get("/test-connection", async (req, res) => {
  try {
    await verifyEmailConnection();

    res.json({
      success: true,
      message: "Email connection is working",
    });
  } catch (error) {
    console.error(
      "Email connection error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Email connection failed",
      error: error.message,
    });
  }
});

router.get("/test-send", async (req, res) => {
  try {
    await sendEmail({
      to: process.env.EMAIL_TO,
      subject: "BAPD Email Test",
      text: "This is a test email from the BAPD website.",
      html: `
        <h2>BAPD Email Test</h2>
        <p>This is a test email from the Boxing Association of Palghar District website.</p>
        <p>Email notifications are working successfully.</p>
      `,
    });

    res.json({
      success: true,
      message: "Test email sent successfully",
    });
  } catch (error) {
    console.error(
      "Email sending error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Could not send test email",
      error: error.message,
    });
  }
});

export default router;