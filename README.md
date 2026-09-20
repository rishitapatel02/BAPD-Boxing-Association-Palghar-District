# BAPD – Boxing Association of Palghar District

A full-stack TY BSc Computer Science mini project for managing players, tournaments, matches, results, rankings, notices, gallery content and administrator operations.

## Technology
- Frontend: React + Vite, JavaScript, CSS3
- Backend: Node.js + Express REST API
- Database: MySQL (`bapd_management`)
- Authentication: Google Sign-In for administrators + email/password for players
- AI: Google Gemini API with FAQ fallback
- Additional: Python ranking-calculation script
- Version control: Git + GitHub

## Important
The project contains configuration placeholders. You must add your own Google OAuth credentials and Gemini API key. Never commit `.env` files or secrets to GitHub.

## Quick start
1. Install Node.js 20+, MySQL 8+, Python 3.10+, Git and VS Code.
2. Create the database by running `database/bapd_management.sql` in MySQL Workbench.
3. In `server`, copy `.env.example` to `.env` and fill in the values.
4. Run `npm install` inside `server`.
5. Run `npm run dev` inside `server`.
6. In another terminal, run `npm install` inside `client`.
7. Copy `client/.env.example` to `client/.env` and add the same Google Client ID.
8. Run `npm run dev` inside `client`.
9. Open the Vite URL shown in the terminal.

For full instructions, read `docs/SETUP_GUIDE.md`.

## Default public routes
`/`, `/about`, `/players`, `/tournaments`, `/rankings`, `/news`, `/gallery`, `/contact`, `/login`, `/admin/login`

## Admin login
Admin login uses Google Sign-In. The backend verifies the Google ID token and checks the Google email against `ADMIN_EMAILS` before issuing the BAPD JWT session token.

## Chatbot
The chatbot first tries Gemini when `GEMINI_API_KEY` is configured. If the API is unavailable, it answers from the built-in BAPD FAQ so the website remains useful.

## Branding
The supplied official BAPD JPEG logo is included at `client/src/assets/bapd-logo.jpeg`. The UI follows black, royal blue, red and white branding.
