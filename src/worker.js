/**
 * Cloudflare Worker for VitaNova Health
 * Serves static assets with security headers, clean URL rewrites, and instant cache revalidation.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let pathname = url.pathname;

    // Clean URL rewrite: /about -> /about.html
    if (!pathname.includes('.') && pathname !== '/') {
      const htmlPath = pathname + '.html';
      const assetResponse = await env.ASSETS.fetch(new Request(new URL(htmlPath, request.url), request));
      if (assetResponse.status === 200) {
        return addSecurityHeaders(assetResponse, true);
      }
    }

    const response = await env.ASSETS.fetch(request);
    const isHtml = (response.headers.get('content-type') || '').includes('text/html') || pathname.endsWith('.html') || pathname === '/';
    return addSecurityHeaders(response, isHtml);
  }
};

function addSecurityHeaders(response, isHtml) {
  const newHeaders = new Headers(response.headers);
  newHeaders.set('X-Content-Type-Options', 'nosniff');
  newHeaders.set('X-Frame-Options', 'SAMEORIGIN');
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Prevent aggressive browser/edge caching of HTML so updates reflect instantly
  if (isHtml) {
    newHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    newHeaders.set('Pragma', 'no-cache');
    newHeaders.set('Expires', '0');
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}
