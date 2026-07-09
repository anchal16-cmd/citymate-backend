# CityMate Backend

Node.js + Express backend for CityMate. Right now it powers **Mia**, the AI
chatbot (using the free Google Gemini API — no credit card needed). The
**Bookings** feature has since been built, but lives directly in the frontend
against Firestore (see the frontend's `FEATURE_BOOKINGS.md`) rather than here,
since it doesn't need a secret the way Mia does. This backend stays
structured so any future feature that *does* need one can be added the same
way Mia was.

## 📁 Structure

```
citymate-backend/
├── server.js                        # Express app entry point
├── .env.example                     # Copy to .env and fill in your key
├── src/
│   ├── config/gemini.js             # Gemini API config (uses built-in fetch, no SDK)
│   ├── data/citymateContext.js      # Mia's system prompt (what she knows/doesn't)
│   ├── controllers/chatController.js
│   └── routes/
│       ├── chat.js                  # POST /api/chat
│       └── bookings.js              # placeholder for the future Bookings feature
```

## ⚙️ Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Get a **free** Gemini API key (no credit card required):
   - Go to https://aistudio.google.com/app/apikey
   - Sign in with any Google account
   - Click **"Create API key"**
   - Copy the key (starts with `AIza...`)

3. Copy the env file and paste your key in:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set `GEMINI_API_KEY=AIza...` (your real key). **Never commit `.env`.**

4. Make sure `CORS_ORIGIN` in `.env` matches wherever you're running the CityMate
   frontend (e.g. `npx serve` usually serves on `http://localhost:3000`, VS Code
   Live Server usually on `http://127.0.0.1:5500`).

5. Start the server:
   ```bash
   npm run dev     # auto-restarts on file changes
   # or
   npm start
   ```

   You should see:
   ```
   CityMate backend running at http://localhost:5000
   Accepting frontend requests from: http://localhost:3000
   ```

6. Test it's alive: open `http://localhost:5000/api/health` in a browser — should
   return `{"status":"ok","service":"citymate-backend"}`.

## 🔌 API

### `POST /api/chat`

Request body:
```json
{
  "message": "how do I find a plumber?",
  "history": [
    { "role": "user", "content": "hi" },
    { "role": "assistant", "content": "Hey! I'm Mia..." }
  ]
}
```

- `message` — required, the new thing the user just typed.
- `history` — optional, previous turns of the conversation (max last 12 are kept,
  older ones are dropped automatically).

Response:
```json
{ "reply": "You can browse Local Services from your dashboard..." }
```

Errors come back as `{ "error": "..." }` with an appropriate status code
(`400` bad input, `429` rate limited, `500` server/API issue).

### `POST /api/bookings` *(placeholder)*

Bookings are now a real feature, but implemented directly against Firestore
from the frontend (`bookings.html` / `bookings.js`), the same way `users` and
`providers` already work — not through this server, since bookings don't need
a secret. See the frontend's `FEATURE_BOOKINGS.md` for the full write-up.

This endpoint still returns `501 Not Implemented` and is kept as a reserved
placeholder for a future server-side need, e.g. sending notification emails
when a booking's status changes.

## 💰 Free tier limits (Gemini)

`gemini-2.5-flash` (the default model here) is free with **no card required**,
but Google caps free usage — as of writing, roughly **10 requests/minute and
250 requests/day per project**. That's plenty for a student project or demo.
If you see a `429` error/"getting a lot of questions" message from Mia, you've
hit that limit — wait a bit and try again. These exact numbers can change on
Google's side, so double-check current limits in Google AI Studio if you hit
this a lot.

If you outgrow the free tier later, you can add billing in Google Cloud
Console for higher limits — you don't have to switch providers.

## 🌱 Need demo provider data?

Populating providers is a Firestore concern, not a backend one, so the seed
tool lives in the frontend project: `citymate-frontend/seed-providers.html`.
It bulk-creates 10 demo providers per service category (80 total) with one
click — see that project's README for how to run it.

## 🚀 Deploying

For production, don't run this on your laptop. Any Node host works (Render,
Railway, Fly.io, a VPS, etc.) — just set the same environment variables there
(`GEMINI_API_KEY`, `GEMINI_MODEL`, `PORT`, `CORS_ORIGIN` pointing at your real
frontend domain over HTTPS), and update the frontend's `chat.js` to call your
deployed backend URL instead of `localhost`.
