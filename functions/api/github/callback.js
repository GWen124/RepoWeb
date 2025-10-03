// GitHub OAuth 回调接口
export async function onRequest(context) {
  const { searchParams } = new URL(context.request.url);
  const code = searchParams.get('code');
  if (!code) {
    return new Response('缺少 code 参数', { status: 400 });
  }

  // 交换 access_token
  const clientId = context.env.GITHUB_CLIENT_ID;
  const clientSecret = context.env.GITHUB_CLIENT_SECRET;
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return new Response('获取 access_token 失败', { status: 400 });
  }

  // 获取用户信息
  const userRes = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `token ${tokenData.access_token}`,
      'User-Agent': 'cf-github-oauth-demo',
    },
  });
  const user = await userRes.json();

  // 返回用户信息（实际项目建议设置 session/cookie）
  return new Response(JSON.stringify({ user, access_token: tokenData.access_token }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
