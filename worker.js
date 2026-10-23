import projects from './projects.json' with { type: 'json' };

const hosts = new Map(projects.filter(project => project.host).map(project => [project.host, project.id]));
const releasePaths = new Set(['/', '/index.html', '/release', '/release/']);
const HTML_CACHE = 'public, max-age=0, must-revalidate, no-transform';
const STATIC_CACHE = 'public, max-age=0, must-revalidate';

function securityHeaders(contentType) {
  const headers = new Headers();
  headers.set('Content-Security-Policy', "default-src 'self'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; object-src 'none'; connect-src 'self'; img-src 'self' data:; media-src 'none'; font-src 'self'; style-src 'self'; script-src 'self'; manifest-src 'self'; worker-src 'none'; upgrade-insecure-requests");
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'accelerometer=(), autoplay=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  headers.set('Cache-Control', contentType?.includes('text/html') ? HTML_CACHE : STATIC_CACHE);
  return headers;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const project = hosts.get(url.hostname);
    // Exact presentation routes leave the existing API/download workers intact.
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const headers = securityHeaders('text/plain');
      headers.set('Allow', 'GET, HEAD');
      return new Response('Method Not Allowed', { status: 405, headers });
    }
    if (!project && /^\/flanime(?:\/|\/index\.html)?$/.test(url.pathname)) {
      return Response.redirect('https://nkbr.cc/projects/flacgn/', 308);
    }
    if (project && releasePaths.has(url.pathname)) url.pathname = `/projects/${project}/`;
    const assetResponse = await env.ASSETS.fetch(new Request(url, request));
    const contentType = assetResponse.headers.get('Content-Type') || 'application/octet-stream';
    const headers = new Headers(assetResponse.headers);
    for (const [key, value] of securityHeaders(contentType)) headers.set(key, value);
    headers.set('X-NKBR-Design', 'mint-2026');
    return new Response(request.method === 'HEAD' ? null : assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers
    });
  }
};
