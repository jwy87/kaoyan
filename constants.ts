export const INITIAL_MESSAGES = [
  "星光不问赶路人",
  "一研为定，顶峰相见",
  "乾坤未定，你我皆是黑马",
  "坚持到底，就是胜利",
  "所有的努力都算数",
  "上岸！上岸！",
  "愿你的努力配得上你的梦想",
  "保持平常心，你最棒",
  "笔锋所至，心之所向",
  "未来可期，加油！",
  "相信自己，你可以",
  "最后的冲刺，稳住！",
  "考神附体，下笔有神",
  "关关难过关关过",
  "去更高的地方见更好的自己",
  "须知少时凌云志",
  "曾许人间第一流",
  "长风破浪会有时",
  "直挂云帆济沧海",
  "彼方尚有荣光在",
  "披星戴月，终得圆满",
  "你的名字，那么好听，一定要出现在录取通知书上"
];

// Templates for personalized bubbles. {name} will be replaced by user name, {school} by target school.
export const PERSONALIZED_TEMPLATES = [
  "祝{name}一战成硕！",
  "{name}，{school}见！",
  "{name}，岸上见！",
  "恭喜{name}被{school}录取！",
  "{name}，你的{school}梦一定实现！",
  "{name}，金榜题名！",
  "{name}，你可以的！",
  "{school}的大门为你打开，{name}加油！"
];

// Fallback messages used when AI generation fails or no API key is present
export const FALLBACK_MESSAGES = [
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

export const LOADING_MESSAGES = [
  "正在连接好运宇宙...",
  "正在收集星光...",
  "正在撰写你的专属上岸剧本...",
  "正在为你的笔尖注入神力...",
  "好运正在赶来的路上...",
  "正在打包你的录取通知书..."
];

export const BUBBLE_COLORS = [
  "bg-red-50 text-red-800 border-red-100",
  "bg-orange-50 text-orange-800 border-orange-100",
  "bg-amber-50 text-amber-800 border-amber-100",
  "bg-yellow-50 text-yellow-800 border-yellow-100",
  "bg-lime-50 text-lime-800 border-lime-100",
  "bg-rose-50 text-rose-800 border-rose-100",
  "bg-blue-50 text-blue-800 border-blue-100",
  "bg-indigo-50 text-indigo-800 border-indigo-100",
  "bg-violet-50 text-violet-800 border-violet-100",
  "bg-emerald-50 text-emerald-800 border-emerald-100",
  "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-100",
];

// A soothing piano track (Erik Satie - Gymnopédie No.1 from Internet Archive)
export const MUSIC_URL = "/1.mp3";

// GitHub link shown next to the music button (change to your repo URL if needed).
export const GITHUB_URL = "https://github.com/";

export const GEMINI_PROMPT_TEMPLATE = `
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