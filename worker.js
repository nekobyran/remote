const ORIGIN = 'https://raw.githubusercontent.com/nekobyran/remote/fad1369d39418c0398dd6f5a80aebaf3f92a467d';
const FILES = new Set([
  'index.html',
  'styles.css',
  'script.js',
  'favicon.svg',
  'lanzou-plus-public-icon.svg',
  'lanzou-plus-icon.webp',
  'lanzouyou-icon.svg',
  'nekostar-icon.webp',
  'nekostar-devtools-icon.webp',
  'android-simulator-icon.webp',
  'kacha-icon.webp',
  'skill-creator-icon.webp',
  'game-launcher-icon.webp',
  'robots.txt',
  'sitemap.xml',
]);

const CONTENT_TYPES = {
  html: 'text/html; charset=utf-8',
  css: 'text/css; charset=utf-8',
  js: 'application/javascript; charset=utf-8',
  svg: 'image/svg+xml; charset=utf-8',
  webp: 'image/webp',
  txt: 'text/plain; charset=utf-8',
  xml: 'application/xml; charset=utf-8',
};

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'GET, HEAD' },
    });
  }

  const url = new URL(request.url);
  let path;
  try {
    path = decodeURIComponent(url.pathname).replace(/^\/+|\/+$/g, '') || 'index.html';
  } catch {
    return new Response('Bad Request', {
      status: 400,
      headers: securityHeaders('text/plain; charset=utf-8'),
    });
  }

  if (!FILES.has(path)) {
    return new Response('Not Found', {
      status: 404,
      headers: securityHeaders('text/plain; charset=utf-8'),
    });
  }

  const originResponse = await fetch(`${ORIGIN}/${path}`, {
    headers: { 'Cache-Control': 'no-cache' },
    cf: { cacheTtl: 0 },
  });

  if (!originResponse.ok) {
    return new Response('Release page is temporarily unavailable.', {
      status: 502,
      headers: securityHeaders('text/plain; charset=utf-8'),
    });
  }

  const extension = path.split('.').pop();
  const headers = securityHeaders(CONTENT_TYPES[extension] || 'application/octet-stream');
  headers.set('Cache-Control', path === 'index.html' ? 'public, max-age=60' : 'public, max-age=300');
  headers.set('X-NKBR-Origin-Commit', 'fad1369d39418c0398dd6f5a80aebaf3f92a467d');

  return new Response(request.method === 'HEAD' ? null : originResponse.body, {
    status: 200,
    headers,
  });
}

function securityHeaders(contentType) {
  return new Headers({
    'Content-Type': contentType,
    'Content-Security-Policy': "default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; connect-src 'self' https://cloudflareinsights.com; style-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  });
}
