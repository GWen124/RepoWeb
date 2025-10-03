# Cloudflare Pages + GitHub OAuth 项目使用说明

## 项目简介
本项目基于 Cloudflare Pages，前端使用 React，后端用 Pages Functions 实现 GitHub OAuth 登录和仓库文件操作。

## 目录结构
- `frontend/`：React 前端代码
- `functions/`：Cloudflare Pages Functions 后端 API

## 环境变量设置
1. 登录 Cloudflare Pages 后台，进入你的项目。
2. 左侧菜单选择「Settings」→「Environment Variables」。
3. 添加以下环境变量：
   - `GITHUB_CLIENT_ID`：你的 GitHub OAuth App Client ID
   - `GITHUB_CLIENT_SECRET`：你的 GitHub OAuth App Client Secret
   - `GITHUB_REDIRECT_URI`：如 `https://你的-cloudflare-pages-域名/api/github/callback`

## GitHub OAuth App 配置
1. 在 GitHub 设置中创建 OAuth App。
2. 回调地址填写为 `GITHUB_REDIRECT_URI`。
3. 获取 Client ID 和 Secret，填入 Cloudflare Pages 环境变量。

## 本地开发
1. 前端开发：
   ```sh
   cd frontend
   npm install
   npm run dev
   ```
2. 后端开发预览（需安装 wrangler）：
   ```sh
   npm install -g wrangler
   wrangler pages dev ./frontend --functions ./functions
   ```

## 部署
1. 推送代码到 GitHub 仓库。
2. 在 Cloudflare Pages 新建项目，选择仓库。
3. 设置 Build Command 为 `npm run build`，Build Output 为 `dist`。
4. 部署后，前端和 API 均可通过你的 Cloudflare Pages 域名访问。

## API 说明
- `/api/github/login`：跳转 GitHub OAuth 登录
- `/api/github/callback`：处理回调，返回用户信息和 access_token
- `/api/github/file`：上传/删除仓库文件（需 access_token、repo、path 等参数）

## 常见问题
- 环境变量只需在 Cloudflare Pages 后台设置，无需 `.env` 文件。
- redirectUri 必须和 GitHub OAuth App 配置一致。
- 代码中通过 `process.env.变量名` 读取环境变量。

## 更多
如需扩展功能或遇到问题，请联系开发者或查阅 Cloudflare Pages 官方文档。
