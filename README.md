# BAPD – Boxing Association of Palghar District

A full-stack web application developed for the **Boxing Association of Palghar District (BAPD)** to manage players, tournaments, coaches, matches, rankings, announcements, registrations, and administrative operations.

The project also includes an **AI-powered support chatbot** and **email notification system**.

---

## 📌 Project Overview

BAPD is a web-based management platform designed to digitize boxing association activities and provide a centralized system for players, administrators, coaches, and visitors.

The application provides:

* Player account registration and login
* Player profile management
* Admin authentication
* Tournament management
* Tournament registration
* Match scheduling and results
* Player rankings
* Coach management
* News and announcements
* Gallery
* Contact management
* AI support chatbot
* Email notifications
* Password recovery system

---

## 🎯 Objectives

The main objectives of the BAPD system are:

1. To digitize player registration and management.
2. To simplify tournament registration and management.
3. To provide organized match and ranking information.
4. To provide administrators with centralized control.
5. To improve communication through announcements and email notifications.
6. To provide users with an AI-powered support assistant.
7. To reduce manual paperwork and improve accessibility of boxing-related information.

---

## ✨ Main Features

### Player Features

* Create player account
* Secure password-based login
* Complete player profile
* Upload player photograph
* Upload age proof
* View player information
* Tournament registration
* View ranking information
* Password recovery

### Admin Features

* Google-based administrator login
* Admin dashboard
* Player management
* Player approval
* Tournament management
* Coach management
* Match management
* Results management
* Rankings management
* News and announcements
* Gallery management
* Contact message management

### Public Features

* Home page
* About BAPD
* Players
* Tournaments
* Matches
* Results
* Rankings
* News
* Gallery
* Contact page

### AI Chatbot

The website includes an AI-powered chatbot using **Google Gemini**.

The chatbot can:

* Answer BAPD website-related questions
* Explain registration and website procedures
* Provide general boxing guidance
* Distinguish between confirmed BAPD information and general guidance
* Provide fallback FAQ responses when AI service is unavailable

### Email System

The application uses **Nodemailer** with Gmail to send:

* Player registration notifications
* Player registration confirmation emails
* Password reset emails
* System test emails

### Password Recovery

Players can:

* Request a password reset
* Receive a reset link by email
* Set a new password
* Use the new password to log in

Password-reset links are designed to expire after **5 minutes**.

---

## 🛠️ Technology Stack

### Frontend

* React.js
* Vite
* JavaScript
* React Router
* Axios
* CSS

### Backend

* Node.js
* Express.js
* JavaScript
* JWT authentication
* bcryptjs
* Multer
* Helmet
* CORS

### Database

* MySQL

### AI

* Google Gemini API
* `@google/genai`

### Email

* Nodemailer
* Gmail SMTP

### Authentication

* JWT for player authentication
* Google OAuth for administrator authentication

### Development Tools

* Visual Studio Code
* Git
* GitHub
* MySQL Workbench
* PowerShell

---

## 📂 Project Structure

```text
BAPD_Project/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── ...
│
├── server/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── python/
│   └── ranking_calculator.py
│
├── .gitignore
└── README.md
```

---

## 🗄️ Database

The application uses MySQL for storing application data.

The database manages information related to:

* Users
* Players
* Coaches
* Tournaments
* Tournament registrations
* Matches
* Rankings
* News
* Gallery
* Contact messages
* Password reset tokens

---

## 🔐 Security

The application follows several security practices:

* Passwords are stored using bcrypt hashing.
* JWT tokens are used for authenticated player sessions.
* Administrator access uses Google authentication.
* Only approved administrator accounts can access the admin dashboard.
* Password-reset tokens are securely hashed before storage.
* Password-reset links expire after 5 minutes.
* Sensitive environment variables are stored in `.env`.
* `.env` files are excluded from GitHub using `.gitignore`.
* Uploaded files are restricted by file type and size.
* Helmet is used for HTTP security headers.
* CORS is configured for frontend-backend communication.

---

## 🤖 AI Chatbot

The BAPD chatbot is powered by Google Gemini.

The chatbot operates in two modes:

### Official BAPD Information

It answers using confirmed BAPD website information.

### General Guidance

It can also provide general boxing or registration guidance while clearly indicating that such information is **not an official BAPD requirement**.

This prevents general AI knowledge from being incorrectly presented as an official association rule.

---

## 📧 Email Notifications

The application uses Nodemailer with Gmail SMTP.

Email functionality includes:

```text
Player Registration
        ↓
Admin Notification
        +
Player Confirmation
```

Password recovery also uses the same email service.

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/rishitapatel02/BAPD-Boxing-Association-Palghar-District.git
```

### 2. Open the project

```bash
cd BAPD-Boxing-Association-Palghar-District
```

### 3. Install frontend dependencies

```bash
cd client
npm install
```

### 4. Install backend dependencies

```bash
cd ../server
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file inside the `server` folder.

Example:

```env
PORT=5000
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

GEMINI_API_KEY=your_gemini_api_key

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_TO=your_notification_email

GOOGLE_CLIENT_ID=your_google_client_id
ADMIN_EMAILS=your_admin_email
```

**Never upload `.env` to GitHub.**

---

## ▶️ Running the Project

### Start Backend

```bash
cd server
npm run dev
```

Backend:

```text
http://localhost:5000
```

### Start Frontend

Open another terminal:

```bash
cd client
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🧪 Testing

The system can be tested for:

* Player registration
* Player login
* Admin login
* Player profile submission
* Player approval
* Tournament creation
* Tournament registration
* Match scheduling
* Match results
* Ranking display
* News and announcements
* Gallery
* Contact form
* AI chatbot
* Email notifications
* Password reset

---

## 📈 Future Scope

Future improvements may include:

* Online tournament fee payment
* Mobile application
* Push notifications
* Advanced analytics
* Live match scoring
* Automated ranking calculations
* Digital certificates
* SMS notifications
* Cloud deployment
* Advanced AI assistance
* Multi-association support

---

## 👩‍💻 Development

### Project

**BAPD – Boxing Association of Palghar District**

### Type

Full-Stack Web Application

### Purpose

Academic / Educational Project

### Repository

https://github.com/rishitapatel02/BAPD-Boxing-Association-Palghar-District

---

## 📄 License

This project is developed for educational and academic purposes.
