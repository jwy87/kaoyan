import { GEMINI_PROMPT_TEMPLATE, FALLBACK_MESSAGES } from "../constants";
import { UserInfo } from "../types";

const getRandomFallback = () => {
  return FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
};

const resolveChatCompletionsUrl = (baseUrl: string) => {
  const trimmed = baseUrl.replace(/\/+$/, "");
  if (trimmed.endsWith("/chat/completions")) return trimmed;
  if (trimmed.includes("/v1")) return `${trimmed}/chat/completions`;
  return `${trimmed}/v1/chat/completions`;
};

type GenerateBlessingResponse = {
  text?: string;
  fallback?: boolean;
};

export const generateBlessing = async (userInfo?: UserInfo): Promise<string> => {
  try {
    // Prefer server-side generation on Vercel to avoid exposing API keys in the browser.
    const response = await fetch("/api/generateBlessing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userInfo }),
    });

    if (!response.ok) {
      throw new Error(`Blessing API error: ${response.status}`);
    }

    const data = (await response.json()) as GenerateBlessingResponse;
    const text = typeof data?.text === "string" ? data.text.trim() : "";
    return text || getRandomFallback();
  } catch (error) {
    // Graceful fallback if API fails or key is missing
    console.warn("Using offline fallback message due to:", error);
    return getRandomFallback();
  }
};
