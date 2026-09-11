/**
 * Cloudflare Worker for VitaNova Health
 * Serves static assets with security headers and clean URL rewrites.
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
        return addSecurityHeaders(assetResponse);
      }
    }

    const response = await env.ASSETS.fetch(request);
    return addSecurityHeaders(response);
  }
};

function addSecurityHeaders(response) {
  const newHeaders = new Headers(response.headers);
  newHeaders.set('X-Content-Type-Options', 'nosniff');
  newHeaders.set('X-Frame-Options', 'SAMEORIGIN');
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}
