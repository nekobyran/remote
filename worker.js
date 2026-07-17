const ORIGIN = 'https://raw.githubusercontent.com/nekobyran/remote/e64e4836af24da942665dcab84936db3a24b39e6';
const FILES = new Set([
  'index.html',
  'styles.css',
  'script.js',
  'favicon.svg',
  'lanzou-plus-public-icon.svg',
  'assets/sponsor.jpg',
  'lanzouyou-icon.svg',
  'flclash-plusplus-icon.png',
  'nekostar-icon.webp',
  'nekostar-devtools-icon.webp',
  'android-simulator-icon.webp',
  'kacha-icon.webp',
  'skill-creator-icon.webp',
  'game-launcher-icon.webp',
  'robots.txt',
  '7f29c60b70c948c298d130c4ccf1b8c8.txt',
]);

const CONTENT_TYPES = {
  html: 'text/html; charset=utf-8',
  css: 'text/css; charset=utf-8',
  js: 'application/javascript; charset=utf-8',
  svg: 'image/svg+xml; charset=utf-8',
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  txt: 'text/plain; charset=utf-8',
  xml: 'application/xml; charset=utf-8',
};

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const headers = securityHeaders('text/plain; charset=utf-8');
    headers.set('Allow', 'GET, HEAD');
    return new Response('Method Not Allowed', {
      status: 405,
      headers,
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
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  headers.set('X-NKBR-Origin-Commit', 'e64e4836af24da942665dcab84936db3a24b39e6');

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
    'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex, unavailable_after: 15 Jul 2026 00:00:00 GMT',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  });
}
