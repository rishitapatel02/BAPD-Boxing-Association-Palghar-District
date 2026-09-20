# BAPD Project Blueprint

## Project
Boxing Association of Palghar District (BAPD)

## Purpose
Digitize player registration, tournament administration, match schedules/results, rankings, news/notices, association records, gallery and public communication.

## Roles
- Visitor: public information and chatbot
- Player: account, profile, approval status, tournament registration, ranking/history
- Coach/Official: planned data role and backend support for player/tournament information
- Admin: full management through Google-authenticated dashboard

## Core architecture
Browser → React/Vite → Express REST API → MySQL
                       ↘ Gemini API (chatbot)
                       ↘ Python ranking helper

## Security
- bcrypt password hashing
- Google ID token verification on backend
- approved administrator email allow-list
- JWT session token
- protected admin/player APIs
- Helmet/CORS
- parameterized MySQL queries
- upload size/type validation
- `.env` secrets excluded from Git

## Branding
Official supplied BAPD logo; black, royal blue, red and white theme.

## Database
`bapd_management`

## Core tables
users, admins, players, coaches_officials, tournaments, tournament_registrations, matches, results, rankings, news, gallery, contact_messages
