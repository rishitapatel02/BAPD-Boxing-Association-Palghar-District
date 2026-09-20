import express from "express";
import { GoogleGenAI } from "@google/genai";
import { faqAnswer } from "../utils/faq.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const message = String(req.body.message || "").trim();

  if (!message) {
    return res.status(400).json({
      message: "Message is required",
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  console.log("=================================");
  console.log("CHATBOT REQUEST");
  console.log("Question:", message);

  console.log(
    "Gemini API Key:",
    apiKey ? "FOUND" : "MISSING"
  );

  console.log("=================================");

  // ---------------------------------------------------------
  // FAQ FALLBACK
  // ---------------------------------------------------------

  if (!apiKey) {
    console.log(
      "Gemini API key is missing. Using FAQ fallback."
    );

    return res.json({
      reply: faqAnswer(message),
      source: "faq",
    });
  }

  // ---------------------------------------------------------
  // GEMINI
  // ---------------------------------------------------------

  try {
    const client = new GoogleGenAI({
      apiKey: apiKey,
    });

    console.log(
      "Calling Gemini Interactions API..."
    );

    const interaction =
      await client.interactions.create({
        model:
          process.env.GEMINI_MODEL ||
          "gemini-3.6-flash",

        input: `
You are the BAPD (Boxing Association of Palghar District)
website support assistant.

You have TWO types of information available:

=========================================================
1. OFFICIAL BAPD INFORMATION
=========================================================

Use the confirmed BAPD information below when answering
questions about the BAPD website and its features.

Never invent an official BAPD:
- rule
- fee
- date
- eligibility condition
- document requirement
- medical requirement
- tournament requirement
- policy
- announcement

If a BAPD-specific fact is not confirmed below, clearly
tell the user that the exact information should be checked
on the BAPD website or with the BAPD association.

CONFIRMED BAPD INFORMATION:

- Player registration is available on the website.
- Player registration collects:
  full name, gender, date of birth, weight category,
  phone, email, and address.
- Approved players can access their player account.
- Tournaments are listed on the website.
- Approved players can register for tournaments.
- Match schedules are available.
- Match results are available.
- Rankings are grouped by weight category and age group.
- News and announcements are available.
- Gallery is available.
- Coaches are managed by administrators.
- Contact messages can be sent through the Contact page.
- Administrators use Google Sign-In through the Admin Login page.

=========================================================
2. GENERAL BOXING / REGISTRATION GUIDANCE
=========================================================

You may also answer general questions about boxing,
registration, tournaments, fitness documents, common
requirements, training, and similar topics using your
general knowledge.

However, whenever the information is NOT confirmed as an
official BAPD requirement, clearly label it:

"General guidance — not an official BAPD requirement."

Do not make general boxing information sound like an
official BAPD rule.

For example:

User:
"What documents are commonly needed for boxing registration?"

Good answer:
"General guidance — not an official BAPD requirement:
Boxers may commonly be asked for proof of age or identity,
a recent photograph, and medical or other documents
depending on the organization.

For the exact BAPD requirements, please check the Player
Registration page or contact BAPD."

=========================================================
ANSWER STYLE
=========================================================

- Keep answers concise and friendly.
- Use simple language.
- Use numbered steps when explaining website procedures.
- Clearly distinguish official BAPD information from general guidance.
- Do not invent facts.
- Do not claim that Gemini itself is an official BAPD authority.
- If the question is outside the BAPD website or general boxing
  knowledge, politely say that you cannot provide a reliable answer.
- Encourage the user to use the Contact page for official
  clarification when necessary.

=========================================================
USER QUESTION
=========================================================

${message}
`,
      });

    console.log(
      "Gemini response received."
    );

    const reply =
      interaction.output_text?.trim();

    console.log(
      "Gemini reply:",
      reply
    );

    // -------------------------------------------------------
    // EMPTY RESPONSE FALLBACK
    // -------------------------------------------------------

    if (!reply) {
      console.log(
        "Gemini returned no text. Using FAQ fallback."
      );

      return res.json({
        reply: faqAnswer(message),
        source: "faq",
      });
    }

    // -------------------------------------------------------
    // SUCCESS
    // -------------------------------------------------------

    return res.json({
      reply: reply,
      source: "gemini",
    });

  } catch (error) {

    console.error(
      "================================="
    );

    console.error(
      "GEMINI ERROR"
    );

    console.error(
      "================================="
    );

    console.error(error);

    console.error(
      "================================="
    );

    // -------------------------------------------------------
    // GEMINI ERROR FALLBACK
    // -------------------------------------------------------

    return res.json({
      reply: faqAnswer(message),
      source: "faq",
      fallbackReason:
        "AI service unavailable",
    });
  }
});

export default router;
