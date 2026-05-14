export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    
    // 只处理根路径
    if (url.pathname !== '/') {
      return context.next(); // 透传给 Pages 静态文件
    }
  
    const ua = (request.headers.get('user-agent') || '').toLowerCase();
    const isMobile = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini|webos/i.test(ua);
    
    const target = isMobile ? '/index-android.html' : '/index-pc.html';
    
    // 从 Pages 静态资源获取模板
    const templateUrl = new URL(target, url.origin);
    const resp = await fetch(templateUrl);
    
    if (!resp.ok) {
      return new Response('Template not found', { status: 404 });
    }
    
    let body = await resp.text();
    
    
    return new Response(body, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'private, no-cache, no-store, must-revalidate',
        'vary': 'user-agent'
      }
    });
  }