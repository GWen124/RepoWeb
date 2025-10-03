// GitHub OAuth 登录接口
export async function onRequest(context) {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = process.env.GITHUB_REDIRECT_URI;
    if (!clientId || !redirectUri) {
      return new Response(
        `环境变量缺失：GITHUB_CLIENT_ID=${clientId}, GITHUB_REDIRECT_URI=${redirectUri}`,
        { status: 500 }
      );
    }
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo%20user`;
    return Response.redirect(githubAuthUrl, 302);
  } catch (err) {
    return new Response(`OAuth 跳转异常: ${err && err.message ? err.message : err}`, { status: 500 });
  }
}
