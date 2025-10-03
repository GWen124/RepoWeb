// GitHub OAuth 登录接口
export async function onRequest(context) {
  const clientId = '你的GitHubClientID'; // 请替换为你的GitHub OAuth App Client ID
  const redirectUri = 'https://你的-cloudflare-pages-域名/api/github/callback';
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo%20user`;
  return Response.redirect(githubAuthUrl, 302);
}
