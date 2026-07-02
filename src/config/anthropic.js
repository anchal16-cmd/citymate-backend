import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
    console.warn(
        "⚠️  ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key, " +
        "or Mia's /api/chat endpoint will fail on every request."
    );
}

export const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001";
