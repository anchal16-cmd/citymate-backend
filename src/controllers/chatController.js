import { anthropic, CLAUDE_MODEL } from "../config/anthropic.js";
import { CITYMATE_SYSTEM_PROMPT } from "../data/citymateContext.js";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 12; // keep token usage & cost predictable

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

    // Only trust well-formed { role, content } pairs from the client, and
    // only keep the most recent turns to bound the request size.
    const cleanHistory = history
        .filter(
            (item) =>
                item &&
                (item.role === "user" || item.role === "assistant") &&
                typeof item.content === "string" &&
                item.content.trim().length > 0
        )
        .slice(-MAX_HISTORY_MESSAGES)
        .map((item) => ({ role: item.role, content: item.content }));

    const messages = [...cleanHistory, { role: "user", content: message }];

    try {
        const response = await anthropic.messages.create({
            model: CLAUDE_MODEL,
            max_tokens: 400,
            system: CITYMATE_SYSTEM_PROMPT,
            messages,
        });

        const reply = response.content
            .filter((block) => block.type === "text")
            .map((block) => block.text)
            .join("\n")
            .trim();

        return res.json({ reply: reply || "Sorry, I couldn't come up with a reply. Try asking that again?" });
    } catch (error) {
        console.error("Claude API error:", error?.message || error);

        if (error?.status === 401) {
            return res.status(500).json({
                error: "Server isn't configured correctly (invalid API key). Contact the site admin.",
            });
        }

        if (error?.status === 429) {
            return res.status(429).json({
                error: "Mia is getting a lot of questions right now — please try again in a moment.",
            });
        }

        return res.status(500).json({
            error: "Something went wrong while talking to Mia. Please try again.",
        });
    }
}
