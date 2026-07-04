// Google Gemini (free tier, no credit card required for API keys created
// in Google AI Studio: https://aistudio.google.com/app/apikey).
//
// We call the REST endpoint directly with Node's built-in fetch instead of
// installing an extra SDK package — one less thing to install/manage.

if (!process.env.GEMINI_API_KEY) {
    console.warn(
        "⚠️  GEMINI_API_KEY is not set. Copy .env.example to .env and add your key " +
        "(free, no card needed, from https://aistudio.google.com/app/apikey), or " +
        "Mia's /api/chat endpoint will fail on every request."
    );
}

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
export const GEMINI_ENDPOINT =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
