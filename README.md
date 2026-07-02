# CityMate Backend

Node.js + Express backend for CityMate. Right now it powers **Mia**, the AI
chatbot (using the real Claude API), and is structured so features like
**Bookings** can be added the same way later.

## 📁 Structure

```
citymate-backend/
├── server.js                        # Express app entry point
├── .env.example                     # Copy to .env and fill in your key
├── src/
│   ├── config/anthropic.js          # Claude API client setup
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
2. Copy the env file and fill in your real Anthropic API key:
   ```bash
   cp .env.example .env
   ```
   Get a key at https://console.anthropic.com/ (Settings → API Keys). **Never commit `.env`.**

3. Make sure `CORS_ORIGIN` in `.env` matches wherever you're running the CityMate
   frontend (e.g. VS Code Live Server usually serves on `http://127.0.0.1:5500`).

4. Start the server:
   ```bash
   npm run dev     # auto-restarts on file changes
   # or
   npm start
   ```

   You should see:
   ```
   CityMate backend running at http://localhost:5000
   Accepting frontend requests from: http://127.0.0.1:5500
   ```

5. Test it's alive: open `http://localhost:5000/api/health` in a browser — should
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
  older ones are dropped automatically to control cost).

Response:
```json
{ "reply": "You can browse Local Services from your dashboard..." }
```

Errors come back as `{ "error": "..." }` with an appropriate status code
(`400` bad input, `429` rate limited, `500` server/API issue).

### `POST /api/bookings` *(placeholder)*

Returns `501 Not Implemented` with an explanatory message — a real handler will
replace this once the Bookings feature is built.

## 💰 Cost note

Every `/api/chat` call spends real Anthropic API credits. The default model
(`claude-haiku-4-5-20251001`) is the cheapest/fastest Claude model, good for a
support-style bot like Mia. `max_tokens` is capped at 400 per reply and history
is capped at 12 turns to keep costs predictable. Monitor usage at
https://console.anthropic.com/.

## 🚀 Deploying

For production, don't run this on your laptop. Any Node host works (Render,
Railway, Fly.io, a VPS, etc.) — just set the same environment variables there
(`ANTHROPIC_API_KEY`, `CLAUDE_MODEL`, `PORT`, `CORS_ORIGIN` pointing at your real
frontend domain over HTTPS), and update the frontend's `chat.js` to call your
deployed backend URL instead of `localhost`.
