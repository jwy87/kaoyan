# 一研为定

一个面向考研学子的祝福生成小站：填写昵称与目标院校即可生成专属祝福，也支持匿名跳过直接获取通用祝福。

## 功能概览

- **专属祝福**：输入昵称与目标院校，生成一句短而鼓励的祝福。
- **匿名模式**：跳过填写也能直接获得祝福。
- **祝福墙**：可展示/提交祝福内容。

<img width="2510" height="1377" alt="image" src="https://github.com/user-attachments/assets/4e805af3-c133-437f-b478-c4c3e561bb81" />

## 部署到 Netlify

本项目已适配 Netlify：

- 前端：Vite 构建产物输出到 `dist/`。
- 后端：Netlify Functions 使用 `api/` 作为函数目录（`api/blessings.js`、`api/generateBlessing.js`、`api/health.js`）。
- 路由：通过 `netlify.toml` 将 `/api/*` 重写到 `/.netlify/functions/*`，并为 SPA 配置回退到 `/index.html`。

### Netlify 构建设置

- Build command: `npm run build`
- Publish directory: `dist`

### 环境变量（在 Netlify Site settings → Environment variables 配置）

- `DATABASE_URL`（可选：不配置则祝福墙接口会退化为只读空列表/仅返回成功但不落库）
- `OPENAI_API_KEY`（可选：不配置则生成祝福会使用本地兜底文案）
- `OPENAI_BASE_URL`（可选：例如 `https://api.openai.com/v1`，或你的兼容服务地址）
- `OPENAI_MODEL`（可选：例如 `gpt-4o-mini` 等）

