# 一研为定（考研祝福）

## 本地运行

1. 安装依赖：`npm install`
2. 启动开发服务：`npm run dev`

（可选）启用 AI 祝福：在 `.env.local` 配置：
- `OPENAI_BASE_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

不配置也能运行：会使用离线兜底祝福文案。

## 自定义音乐（手动修改）

背景音乐地址在 [constants.ts](constants.ts) 的 `MUSIC_URL`。

- 方式 A（推荐，本地文件最稳定）：
   1. 在项目根目录创建 `public/` 文件夹
   2. 把你的音乐文件放进去，例如：`public/music.mp3`
   3. 把 `MUSIC_URL` 改成：`/music.mp3`

- 方式 B（远程 URL）：
   - 把 `MUSIC_URL` 改成任意可直连的 `https://...mp3`

说明：如果远程音频在你的网络环境下加载失败，右上角按钮会自动提供“本地音色”兜底（点击即可开启/关闭）。

## Deploy

### Vercel

- Deploy as a Vite static site.
- Blessings API is provided by [api/blessings.js](api/blessings.js) (Serverless Function).
- Environment variables（在 Vercel Project Settings 里配置）：
   - `OPENAI_BASE_URL`（可选；不填则使用离线兜底祝福文案）
   - `OPENAI_API_KEY`（可选）
   - `OPENAI_MODEL`（可选）
   - `DATABASE_URL`（可选；MySQL 连接串，例如 `mysql://user:pass@host:port/db`）
