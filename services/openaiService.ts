import { GEMINI_PROMPT_TEMPLATE, FALLBACK_MESSAGES } from "../constants";
import { UserInfo } from "../types";

const getRandomFallback = () => {
  return FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
};

const getEnv = (key: string) => {
  // Vite defines may expose process.env.* at build time.
  return (process.env as any)?.[key] as string | undefined;
};

const resolveChatCompletionsUrl = (baseUrl: string) => {
  const trimmed = baseUrl.replace(/\/+$/, "");
  if (trimmed.endsWith("/chat/completions")) return trimmed;
  if (trimmed.includes("/v1")) return `${trimmed}/chat/completions`;
  return `${trimmed}/v1/chat/completions`;
};

export const generateBlessing = async (userInfo?: UserInfo): Promise<string> => {
  try {
    const apiKey = getEnv("OPENAI_API_KEY");
    const baseUrl = getEnv("OPENAI_BASE_URL");
    const model = getEnv("OPENAI_MODEL");

    // If no API key / base url / model is present in the environment, throw immediately to use fallback
    if (!apiKey || !baseUrl || !model) {
      console.warn(
        "OPENAI env vars missing (OPENAI_API_KEY/OPENAI_BASE_URL/OPENAI_MODEL), using fallback messages."
      );
      throw new Error("Missing OpenAI environment variables");
    }

    let prompt = GEMINI_PROMPT_TEMPLATE;
    if (userInfo) {
      prompt = prompt.replace("{name}", userInfo.name).replace("{school}", userInfo.school);
    } else {
      prompt = prompt.replace("{name}", "考生").replace("{school}", "理想院校");
    }

    const url = resolveChatCompletionsUrl(baseUrl);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`OpenAI API error: ${response.status} ${errText}`);
    }

    const data: any = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    return (typeof text === "string" ? text.trim() : "") || getRandomFallback();
  } catch (error) {
    // Graceful fallback if API fails or key is missing
    console.warn("Using offline fallback message due to:", error);
    return getRandomFallback();
  }
};
