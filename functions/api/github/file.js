// 仓库文件操作接口（示例：上传/删除）
export async function onRequest(context) {
  const { request } = context;
  const { method } = request;
  const url = new URL(request.url);
  const accessToken = url.searchParams.get('access_token');
  const repo = url.searchParams.get('repo');
  const path = url.searchParams.get('path');

  if (!accessToken || !repo || !path) {
    return new Response('参数缺失', { status: 400 });
  }

  if (method === 'POST') {
    // 上传/编辑文件
    const body = await request.json();
    const content = body.content;
    const message = body.message || '通过 API 上传文件';
    // 获取文件 sha（判断是否为新文件）
    const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      headers: { Authorization: `token ${accessToken}` },
    });
    let sha = undefined;
    if (getRes.status === 200) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    }
    // 上传/更新
    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: btoa(unescape(encodeURIComponent(content))),
        sha,
      }),
    });
    return new Response(await res.text(), { status: res.status });
  } else if (method === 'DELETE') {
    // 删除文件
    const body = await request.json();
    const message = body.message || '通过 API 删除文件';
    const sha = body.sha;
    if (!sha) return new Response('缺少 sha', { status: 400 });
    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: 'DELETE',
      headers: {
        Authorization: `token ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sha,
      }),
    });
    return new Response(await res.text(), { status: res.status });
  } else {
    return new Response('不支持的请求方法', { status: 405 });
  }
}
