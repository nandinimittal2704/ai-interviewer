---
description: "Project workspace instructions for AI Interviewer. Use when working on frontend React pages, backend Express API, auth, or cross-app integration."
---

# AI Interviewer Workspace

This repository is a split frontend/backend app with no root-level `package.json`.

## Project layout
- `backend/`: Express API, MongoDB, auth, interview session routes.
- `frontend/`: Vite + React app, React Router, Axios, auth UI.

## Backend notes
- App entry: `backend/server.js`
- Routes: `backend/routes/auth.js`, `backend/routes/interview.js`, `backend/routes/sessions.js`
- Models: `backend/models/User.js`, `backend/models/Session.js`
- Config: `backend/config/gemini.js`
- Environment: expects `MONGO_URI`, `PORT`, `JWT_SECRET`, and any Gemini/AI credentials.
- Use ES modules throughout (`type: module`).

## Frontend notes
- App entry: `frontend/src/main.jsx`
- Pages: `frontend/src/pages/`
- Routing: `frontend/src/App.jsx`
- API base config: `frontend/src/config.js`
- Uses token-based auth stored in `localStorage`
- Linting: `frontend/npm run lint`

## Commands
- Backend: `cd backend && npm install` and `npm run dev`
- Frontend: `cd frontend && npm install` and `npm run dev`
- Frontend lint: `cd frontend && npm run lint`

## Conventions
- Use ES module `import` / `export` syntax consistently.
- Keep backend route logic in `backend/routes/` and business logic small.
- Keep frontend page layout and styling inside React page components.
- Protected routes are handled in `frontend/src/App.jsx` using `PrivateRoute`.

## When assisting
- For UI and page updates, prioritize `frontend/src/pages/` and `frontend/src/App.jsx`.
- For API, auth, or DB issues, prioritize `backend/`.
- For changes affecting both sides, update the frontend request/response flow and the backend endpoint together.
- Avoid assuming a monorepo root script exists; use the separate frontend/backend package scripts.
