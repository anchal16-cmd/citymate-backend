import { GEMINI_API_KEY, GEMINI_ENDPOINT } from "../config/gemini.js";
import { CITYMATE_SYSTEM_PROMPT } from "../data/citymateContext.js";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 12; // keep request size & free-tier usage predictable

/**
 * POST /api/chat
 * Body: { message: string, history?: [{ role: "user" | "assistant", content: string }] }
 * Response: { reply: string }
 */
export async function handleChatMessage(req, res) {
    const { message, history = [] } = req.body || {};

    if (typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ error: "A non-empty 'message' string is required." });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
        return res.status(400).json({
            error: `Message is too long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.`,
        });
    }

    if (!Array.isArray(history)) {
        return res.status(400).json({ error: "'history' must be an array if provided." });
    }

    // Only trust well-formed { role, content } pairs, and only keep the
    // most recent turns to bound the request size.
    const cleanHistory = history
        .filter(
            (item) =>
                item &&
                (item.role === "user" || item.role === "assistant") &&
                typeof item.content === "string" &&
                item.content.trim().length > 0
        )
        .slice(-MAX_HISTORY_MESSAGES);

    // Gemini's REST format uses { role, parts: [{ text }] } and calls the
    // assistant's role "model" instead of "assistant".
    const contents = [
        ...cleanHistory.map((item) => ({
            role: item.role === "assistant" ? "model" : "user",
            parts: [{ text: item.content }],
        })),
        { role: "user", parts: [{ text: message }] },
    ];

    if (!GEMINI_API_KEY) {
        return res.status(500).json({
            error: "Server isn't configured correctly (missing Gemini API key). Contact the site admin.",
        });
    }

    try {
        const response = await fetch(GEMINI_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": GEMINI_API_KEY,
            },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: CITYMATE_SYSTEM_PROMPT }] },
                contents,
                generationConfig: { maxOutputTokens: 400 },
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API error:", response.status, JSON.stringify(data));

            if (response.status === 400 && data?.error?.message?.includes("API key")) {
                return res.status(500).json({
                    error: "Server isn't configured correctly (invalid Gemini API key). Contact the site admin.",
                });
            }

            if (response.status === 429) {
                return res.status(429).json({
                    error: "Mia is getting a lot of questions right now (free tier limit) — try again in a minute.",
                });
            }

            return res.status(500).json({
                error: "Something went wrong while talking to Mia. Please try again.",
            });
        }

        const reply = (data?.candidates?.[0]?.content?.parts || [])
            .map((part) => part.text || "")
            .join("\n")
            .trim();

        return res.json({ reply: reply || "Sorry, I couldn't come up with a reply. Try asking that again?" });
    } catch (error) {
        console.error("Gemini request failed:", error?.message || error);
        return res.status(500).json({
            error: "Something went wrong while talking to Mia. Please try again.",
        });
    }
}
