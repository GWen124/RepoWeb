// Cloudflare Pages Functions 中间件示例
export async function onRequest(context) {
  // 可在此处理认证、日志等
  return await context.next();
}
