# BAPD – Detailed Setup Guide

This guide assumes you are using Windows 10/11 and VS Code. You do not need to be an expert programmer. Follow the steps in order.

---

## 1. What you are installing

BAPD has two applications:

- `client` = React frontend
- `server` = Node/Express backend
- `database` = MySQL database script
- `python` = small ranking calculation helper

The browser talks to the React frontend. React calls Express REST APIs. Express reads/writes MySQL.

---

## 2. Install the required software

Install:

1. Node.js LTS (20 or newer)
2. MySQL 8.x and MySQL Workbench
3. Python 3.10 or newer
4. Git
5. VS Code

After installation, open PowerShell and check:

```powershell
node --version
npm --version
python --version
git --version
```

If each command prints a version number, the installation is working.

---

## 3. Extract the BAPD ZIP

Extract the ZIP somewhere easy, for example:

`C:\Users\YOUR_NAME\Desktop\BAPD_Project`

Open VS Code → File → Open Folder → select `BAPD_Project`.

The important folders are:

```text
BAPD_Project/
├── client/       React frontend
├── server/       Node + Express backend
├── database/     MySQL script
├── python/       ranking helper
├── docs/         setup documentation
└── README.md
```

---

## 4. Create the MySQL database

Open MySQL Workbench and connect to your local MySQL server.

1. Open `database/bapd_management.sql`.
2. Click the lightning-bolt Execute button.
3. Refresh the Schemas panel.
4. You should see `bapd_management`.
5. Expand Tables.

The project uses `bapd_management` instead of your older `bapd_db` database.

Important tables include:

- users
- admins
- players
- coaches_officials
- tournaments
- tournament_registrations
- matches
- results
- rankings
- news
- gallery
- contact_messages

To verify:

```sql
USE bapd_management;
SHOW TABLES;
```

---

## 5. Configure the backend

Open PowerShell:

```powershell
cd C:\Users\YOUR_NAME\Desktop\BAPD_Project\server
copy .env.example .env
```

Open `server/.env`.

Example:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=bapd_management
JWT_SECRET=use-a-long-random-secret
GOOGLE_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
ADMIN_EMAILS=your-real-admin@gmail.com
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-3-flash-preview
```

### What each value means

- `DB_USER`: normally `root` for a local student setup.
- `DB_PASSWORD`: the password you chose when installing MySQL.
- `JWT_SECRET`: a long random string. Do not share it.
- `GOOGLE_CLIENT_ID`: created in Google Cloud.
- `GOOGLE_CLIENT_SECRET`: created in Google Cloud. It stays on the backend.
- `ADMIN_EMAILS`: comma-separated Google email addresses allowed to enter the admin dashboard.
- `GEMINI_API_KEY`: free-tier Gemini API key. Keep it in `.env` only.

Never upload `.env` to GitHub.

---

## 6. Install backend packages

From the `server` folder:

```powershell
npm install
```

This installs Express, MySQL, bcrypt, JWT, Google authentication, file-upload support, security middleware and Gemini SDK.

---

## 7. Set up Google Sign-In for administrators

This project does NOT fake Google login. The frontend receives a Google ID token and sends it to the Express backend. The backend verifies the token with Google's library and then checks whether the email is in `ADMIN_EMAILS`.

### Step A – Google Cloud

Open Google Cloud Console and create/select a project.

Enable the required Google Identity/OAuth configuration.

### Step B – OAuth client

Create an OAuth 2.0 Client ID for a Web application.

For local development, add this Authorized JavaScript origin:

```text
http://localhost:5173
```

Depending on the Google configuration shown in your account, the Google Identity Services client may also require the correct redirect/origin configuration. Use exactly the URL shown by your running frontend.

Copy the Web Client ID into both:

`server/.env`

```env
GOOGLE_CLIENT_ID=...
```

and:

`client/.env`

```env
VITE_GOOGLE_CLIENT_ID=...
```

The client secret must remain only in `server/.env`.

### Step C – Admin allow-list

If the administrator's Google account is:

`admin@gmail.com`

put:

```env
ADMIN_EMAILS=admin@gmail.com
```

For multiple admins:

```env
ADMIN_EMAILS=admin1@gmail.com,admin2@gmail.com
```

### Important test

Try signing in with a Google account that is NOT on the list. It should be rejected.

Then use an approved account. It should reach `/admin`.

---

## 8. Configure the frontend

Open a second PowerShell window:

```powershell
cd C:\Users\YOUR_NAME\Desktop\BAPD_Project\client
copy .env.example .env
```

Open `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID
```

The Google Client ID here must match the backend value.

Install frontend packages:

```powershell
npm install
```

---

## 9. Start the backend

In the server terminal:

```powershell
npm run dev
```

You should see something similar to:

```text
BAPD server running on http://localhost:5000
MySQL connected successfully
```

If MySQL fails, check the DB values in `.env`.

Test the backend in a browser:

`http://localhost:5000/`

You should get JSON saying that the BAPD backend is running.

---

## 10. Start the frontend

In the client terminal:

```powershell
npm run dev
```

Vite will show a local URL, normally:

`http://localhost:5173`

Open that URL.

---

## 11. Test the public website

Check these pages:

- Home
- About
- Players
- Tournaments
- Rankings
- News
- Gallery
- Contact
- Player Login
- Player Registration
- Admin Login

The official BAPD logo is already inside:

`client/src/assets/bapd-logo.jpeg`

The design uses black, royal blue, red and white to match the logo.

---

## 12. Test player registration

1. Open `/register`.
2. Create a player email/password account.
3. Complete the profile.
4. Upload a photo and age proof if available.
5. Submit.
6. Login as the admin.
7. Open Players in the dashboard.
8. Approve the player.

A player must be approved before tournament registration is allowed.

---

## 13. Test player login

Use the same player email and password at `/login`.

The password is stored as a bcrypt hash in MySQL; the original password is not stored in plain text.

The player dashboard shows profile details, approval status, ranking points and available tournaments.

---

## 14. Test Google admin login

1. Open `/admin/login`.
2. Click `Sign in with Google`.
3. Choose an approved administrator account.
4. The backend verifies the Google token.
5. The backend checks the email allow-list.
6. The backend creates a BAPD JWT session token.
7. The dashboard opens.

If the Google account is not approved, the dashboard must not open.

---

## 15. Admin dashboard testing

The dashboard includes:

- Overview cards
- Pending player approvals
- Tournament creation
- News/notice posting
- Contact message viewing
- Ranking calculation check
- CSV export API endpoints

The backend also contains protected APIs for matches, results and coach/official management.

---

## 16. Tournament workflow

Admin:

1. Create a tournament.
2. Add date, registration deadline, venue and category.
3. Save it.

Approved player:

1. Login.
2. Open player dashboard.
3. Select a tournament.
4. Click Register.

The database stores the relationship in `tournament_registrations`.

---

## 17. Match and result workflow

The backend APIs support:

- Match creation
- Player A / Player B
- Round
- Category
- Scheduled time
- Result recording
- Winner / loser
- Result type
- Points awarded

When a result is recorded, the winner's ranking points are updated in the `rankings` table.

The Python file `python/ranking_calculator.py` is an educational helper that demonstrates sorting players by points. The production API performs the live point update transactionally in Node.js.

---

## 18. AI chatbot setup

The chatbot works in two layers:

1. Gemini AI when a valid key is configured.
2. BAPD FAQ fallback when Gemini is unavailable.

Create a Gemini API key in Google AI Studio and put it in:

```env
GEMINI_API_KEY=YOUR_KEY
```

Do not put the key in React code.

If the API is unavailable or the free quota is reached, the chatbot automatically uses its built-in FAQ answers.

Because free quotas and model availability can change, check Google's current AI Studio documentation if a model name or key screen has changed.

---

## 19. Google Maps

The Contact page contains a Google Maps embed centered on Palghar as a placeholder.

Replace the embed URL later with the association's official location after confirming the exact address.

---

## 20. Git and GitHub

From the BAPD project root:

```powershell
git init
git add .
git commit -m "Initial BAPD full stack project"
```

Create a new empty repository on GitHub, then connect it using the commands GitHub provides.

Before pushing, confirm that `.env` is ignored:

```powershell
git status
```

You should NOT see `server/.env` or `client/.env` as files to commit.

Recommended commits while developing:

```text
Initial project setup
Add MySQL schema
Add player registration
Add Google admin login
Add tournament management
Add rankings
Add chatbot
Add admin dashboard
Improve UI and validation
```

---

## 21. Common errors

### `npm is not recognized`
Restart VS Code/PowerShell after installing Node.js. Then run `node --version`.

### `ER_ACCESS_DENIED_ERROR`
Your MySQL username/password is incorrect. Check `server/.env`.

### `Unknown database 'bapd_management'`
Run `database/bapd_management.sql` in MySQL Workbench.

### `ECONNREFUSED 127.0.0.1:3306`
MySQL Server is not running. Start MySQL from Windows Services or MySQL Installer.

### `CORS error`
Make sure the backend is running on port 5000 and `CLIENT_URL=http://localhost:5173`.

### Google login says origin/client error
Check that `VITE_GOOGLE_CLIENT_ID` is correct and `http://localhost:5173` is configured in the Google OAuth client.

### Google account denied
The email is not present in `ADMIN_EMAILS`. Add the exact Google email, restart the backend and try again.

### Gemini chatbot falls back to FAQ
This is expected when the API key is missing, invalid, rate-limited or the configured model is unavailable. Check the backend terminal for the underlying error.

### Port 5000 already in use
On Windows PowerShell:

```powershell
netstat -ano | findstr :5000
taskkill /PID YOUR_PID /F
```

Then restart the backend.

### Frontend shows blank page
Open the browser developer console with F12. Also check the Vite terminal for compile errors.

---

## 22. Final project demonstration checklist

Before your college demo, verify:

- [ ] Home loads
- [ ] Official logo appears
- [ ] Branding uses black/blue/red/white
- [ ] Player account registration works
- [ ] Player profile submission works
- [ ] Admin Google login works
- [ ] Unapproved admin email is denied
- [ ] Player approval works
- [ ] Tournament creation works
- [ ] Player tournament registration works
- [ ] Rankings display
- [ ] Results update points
- [ ] News appears on Home
- [ ] Contact form saves messages
- [ ] Chatbot works with AI or FAQ fallback
- [ ] MySQL contains the expected records
- [ ] GitHub repository is updated

---

## 23. Suggested viva explanation

**How does the application work?**

React provides the user interface. When a user performs an action, React calls a REST API built with Node.js and Express. The backend validates the request and uses MySQL to store or retrieve data. Authentication creates a signed session token. Google verifies administrator identity, while BAPD's allow-list decides whether the Google account is authorized as an admin.

**How are rankings calculated?**

Tournament results award points. The winner's points are added to the ranking record for the player's weight category and age group. Players can then be sorted by points to display their rank.

**Why use Python?**

Python is included as a small, separate ranking-calculation demonstration because the project requirement includes Python. The main web transaction remains in Node.js so the web application does not need a Python server just to perform a simple update.

**Why is there a chatbot fallback?**

An external AI API can have rate limits or temporary failures. The built-in FAQ fallback ensures users still get useful BAPD support.
