# Realtime Chat App

A real-time chat application built with **React (Vite)** on the frontend and
**Node.js + Express + Socket.io** on the backend, with **SQLite** for message
persistence.

**Live demo:** `https://<your-github-username>.github.io/<repo-name>/` (set up in [Deployment](#deployment) below)
**Live API:** `https://<your-backend>.onrender.com/api/health` (set up in [Deployment](#deployment) below)

---

## Features

- Username-based "login" (dummy auth — no password, see [Assumptions](#assumptions--design-decisions))
- Send / receive messages instantly over Socket.io
- Chat history persists in SQLite and reloads on refresh via a REST API
- Message timestamps
- Typing indicator
- Online / offline presence list
- Delivered / read message status ticks
- Graceful handling of dropped connections, reconnection, and API errors

## Tech Stack

| Layer     | Choice                                   |
|-----------|-------------------------------------------|
| Frontend  | React 18, Vite, socket.io-client, Axios   |
| Backend   | Node.js, Express, Socket.io               |
| Database  | SQLite (`better-sqlite3`)                 |
| Frontend hosting | GitHub Pages (static build)        |
| Backend hosting  | Render or Railway                  |

---

## Project Structure

```
chat-app/
├── backend/
│   ├── src/
│   │   ├── config/db.js            # SQLite connection + schema
│   │   ├── models/message.model.js # DB queries
│   │   ├── controllers/            # REST request handlers
│   │   ├── routes/                 # /api/messages, /api/auth
│   │   ├── sockets/socketHandler.js# all Socket.io events
│   │   ├── app.js                  # Express app (middleware, routes)
│   │   └── server.js               # HTTP server + Socket.io bootstrap
│   ├── render.yaml / railway.json / Procfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/             # Login, ChatWindow, MessageList, ...
│   │   ├── hooks/useSocket.js      # all client-side socket logic
│   │   ├── services/api.js         # REST calls
│   │   └── styles/app.css
│   └── .env.example
└── .github/workflows/deploy-frontend.yml   # auto-deploy to GitHub Pages
```

Clean separation: routes → controllers → models on the backend; components →
hooks → services on the frontend. All Socket.io logic is isolated in
`socketHandler.js` (server) and `useSocket.js` (client) rather than scattered
across the codebase.

---

## Running Locally

### 1. Backend

```bash
cd backend
cp .env.example .env      # edit CLIENT_ORIGIN if needed
npm install
npm run dev                # nodemon, http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env      # set VITE_API_URL=http://localhost:5000
npm install
npm run dev                # http://localhost:5173
```

Open two browser tabs (or use different usernames in two browsers) at
`http://localhost:5173` to see real-time delivery, typing indicators and
presence updates between them.

### Environment Variables

**backend/.env**
| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the server listens on | `5000` |
| `CLIENT_ORIGIN` | Comma-separated allowed CORS origins | `http://localhost:5173,https://you.github.io` |
| `DB_PATH` | SQLite file location | `./data/chat.db` |

**frontend/.env**
| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend (REST + Socket.io) | `http://localhost:5000` |

---

## Deployment

### Backend → Render or Railway

**Render**
1. Push this repo to GitHub.
2. New → Web Service → connect the repo → set **Root Directory** to `backend`.
3. Build command: `npm install` · Start command: `npm start`.
4. Add env vars `CLIENT_ORIGIN` (your GitHub Pages URL) and `DB_PATH`.
5. Deploy. Render gives you a URL like `https://realtime-chat-backend.onrender.com`.
   (`render.yaml` in `/backend` lets Render auto-detect this config via "Blueprint".)

**Railway**
1. New Project → Deploy from GitHub repo → set root/start directory to `backend`.
2. Railway reads `railway.json` / `Procfile` automatically.
3. Add the same env vars as above in the Railway dashboard.
4. Deploy and copy the generated public URL.

> Note: both free tiers use an ephemeral filesystem — the SQLite file resets
> on redeploy. That's an accepted tradeoff for this assignment's scope (see
> [Assumptions](#assumptions--design-decisions)).

### Frontend → GitHub Pages

1. In your GitHub repo: **Settings → Pages → Source → GitHub Actions**.
2. In **Settings → Secrets and variables → Actions**, add a repository secret
   `VITE_API_URL` set to your deployed backend URL (from the step above).
3. Edit `frontend/vite.config.js`'s `base` to match your repo name, e.g.
   `/realtime-chat-app/`.
4. Push to `main`. The workflow in `.github/workflows/deploy-frontend.yml`
   builds the app and publishes it automatically to
   `https://<username>.github.io/<repo-name>/`.

You can also deploy manually with `npm run deploy` inside `frontend/`
(uses the `gh-pages` package), as a fallback if Actions isn't available.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check (used by Render/Railway) |
| GET | `/api/messages` | Fetch chat history |
| POST | `/api/messages` | Send a message `{ username, text }` |
| POST | `/api/auth/login` | Dummy login `{ username }` |

### Socket.io Events

| Event (client → server) | Payload | Purpose |
|---|---|---|
| `user:join` | `username` | Register presence |
| `message:send` | `{ username, text }` | Send a message |
| `message:read` | `messageId` | Mark a message read |
| `typing:start` / `typing:stop` | `username` | Typing indicator |

| Event (server → client) | Payload | Purpose |
|---|---|---|
| `message:new` | message object | Broadcast new message |
| `message:status` | `{ id, status }` | Delivered/read updates |
| `users:online` | `string[]` | Current online users |
| `typing:update` | `{ username, isTyping }` | Typing indicator |
| `user:joined` / `user:left` | `{ username }` | Presence events |

---

## Assumptions & Design Decisions

- **Dummy auth**: the assignment explicitly calls for "username-based login
  (dummy authentication)", so there's no password or JWT — a username is
  validated for shape and stored client-side in `sessionStorage` for the
  session. A production version would add real auth (JWT + bcrypt).
- **SQLite over MongoDB**: chosen so the app has zero external dependencies
  to set up (no DB service to provision) while still meeting the "persist to
  a database" bonus requirement. Swapping to MongoDB would only require
  changing `models/message.model.js`.
- **Single chat room**: all users share one global room, since the brief
  doesn't require multiple rooms/DMs. The socket layer is structured
  (`socketHandler.js`) so adding rooms later is a small, contained change.
- **REST + Socket.io both send messages**: `POST /api/messages` satisfies the
  "REST API to send messages" requirement directly, while `message:send`
  over Socket.io is what actually delivers the message to other clients
  instantly. Both write to the same database and both broadcast, so behavior
  is consistent either way.
- **In-memory presence**: online-user tracking lives in server memory, which
  is fine for the single-instance free-tier deployments (Render/Railway) this
  app targets. A multi-instance production deployment would move this to
  Redis.
- **React (web) over React Native**: chosen so the deliverable can be hosted
  directly on GitHub Pages as a live, clickable link per the submission
  requirements, without requiring an emulator or physical device to review.
  A screen recording is provided per the submission instructions in lieu of
  an APK — see the Google Drive link in the submission.

---

## Error Handling

- REST endpoints validate input and return structured `{ success, error }`
  responses with correct status codes (400/404/500).
- CORS origin mismatches are caught by a centralized Express error handler.
- The client wraps all API calls in `try/catch` and shows an inline banner on
  failure instead of a blank/broken UI.
- Socket.io: server-side `try/catch` around `message:send`, an `ack` callback
  reports success/failure back to the sender, and connection errors surface
  a "Reconnecting…" banner client-side. Disconnects clean up presence state
  server-side (`socket.on('disconnect', ...)`) so stale users don't linger
  in the online list.

## License

MIT
