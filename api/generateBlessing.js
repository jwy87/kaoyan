const FALLBACK_MESSAGES = [
  "保持热爱，奔赴山海，祝你考试顺利！",
  "愿你合上笔盖的瞬间，有侠客收剑入鞘的骄傲。",
  "请再悄悄加把劲，你想要的马上就来了。",
  "来路风尘仆仆，归途星河璀璨，祝上岸！",
  "那些看似不起眼的日复一日，终将在某一天让你看到坚持的意义。",
  "愿你历尽千帆，终能得偿所愿。",
  "你的日积月累，终将变成别人的望尘莫及。",
  "祝你：拥有“会当凌绝顶”的傲气，更有“一览众山小”的底气！",
  "希君生羽翼，一化北溟鱼。",
  "愿你以渺小启程，以伟大结束。"
];

const PROMPT_TEMPLATE = `
You are a warm, encouraging assistant. The Chinese Graduate Entrance Exam (Kaoyan) is approaching.
User Name: {name}
Target University: {school}

Please generate a short, poetic, and encouraging blessing for this specific student.
If the User Name is "同学" (Student) or generic, make the blessing suitable for any examinee.
Include their name or target university naturally if it fits the poetic flow and is specific, but it's not strictly required.
The tone should be gentle, hopeful, and inspiring.
Keep it under 40 Chinese characters.
Only return the text of the blessing, nothing else.
`;

const getRandomFallback = () => FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];

const resolveChatCompletionsUrl = (baseUrl) => {
  const trimmed = String(baseUrl || '').replace(/\/+$/, '');
  if (trimmed.endsWith('/chat/completions')) return trimmed;
  if (trimmed.includes('/v1')) return `${trimmed}/chat/completions`;
  return `${trimmed}/v1/chat/completions`;
};

const json = (statusCode, data, extraHeaders = {}) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    ...extraHeaders,
  },
  body: JSON.stringify(data),
});

export async function handler(event) {
  try {
    const method = event?.httpMethod || 'GET';
    if (method !== 'POST') {
      return json(
        405,
        { error: 'Method Not Allowed' },
        { Allow: 'POST' }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL;
    const model = process.env.OPENAI_MODEL;

    if (!apiKey || !baseUrl || !model) {
      return json(200, { text: getRandomFallback(), fallback: true });
    }

    let parsedBody = null;
    try {
      parsedBody = event?.body ? JSON.parse(event.body) : null;
    } catch {
      return json(400, { error: 'Invalid JSON body' });
    }

    const userInfo = parsedBody?.userInfo;
    const name = typeof userInfo?.name === 'string' ? userInfo.name : '考生';
    const school = typeof userInfo?.school === 'string' ? userInfo.school : '理想院校';

    const prompt = PROMPT_TEMPLATE.replace('{name}', name).replace('{school}', school);

    const url = resolveChatCompletionsUrl(baseUrl);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return json(200, { text: getRandomFallback(), fallback: true });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    const finalText = (typeof text === 'string' ? text.trim() : '') || getRandomFallback();
    return json(200, { text: finalText, fallback: false });
  } catch (e) {
    return json(200, { text: getRandomFallback(), fallback: true });
  }
}
