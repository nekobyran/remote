import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { extname } from 'node:path';
import worker from '../worker.js';
import { assetLabel, escapeHtml } from '../src/templates.mjs';

const root = new URL('../', import.meta.url);
const projects = JSON.parse(await readFile(new URL('projects.json', root), 'utf8'));
const catalog = JSON.parse(await readFile(new URL('data/releases.json', root), 'utf8'));
const read = path => readFile(new URL(path, root), 'utf8');
const wanted = ['codexmax','androiddesktop','flutterdesign','gamelauncher','flacgn','flclashplus','ainavol','lanzouplus','androidsimulator','nekocommunity','skillcreator','flpiliplus','kacha'];

test('homepage contains exactly the thirteen requested projects in image order', async () => {
  assert.deepEqual(projects.map(project => project.id), wanted);
  const html = await read('.stage/index.html');
  assert.deepEqual([...html.matchAll(/data-project="(.*?)"/g)].map(match => match[1]), wanted);
  assert.doesNotMatch(html, /NekoStar|LanzouYOU|Easy Dream Skin|NKBR Blog|LICENSE NOT DECLARED|PRIVATE RELEASE|边界说明|校验/);
});

test('all release pages share theme, local icon, original QR and concise download actions', async () => {
  for (const project of projects) {
    const html = await read(`.stage/projects/${project.id}/index.html`);
    assert.match(html, /data-design="mint-2026"/);
    assert.ok(html.includes('/_nkbr/styles.css'));
    assert.ok(html.includes('/_nkbr/script.js'));
    assert.ok(html.includes(`/_nkbr/icons/${project.id}${extname(project.iconSource)}`));
    assert.ok(html.includes('/_nkbr/sponsor.jpg'));
    assert.doesNotMatch(html, /SHA256|SHA-256|checksum|PRIVATE RELEASE|边界说明|免责声明/);
    for (const asset of catalog[project.id].assets) assert.ok(html.includes(escapeHtml(asset.url)));
  }
  assert.equal((await readdir(new URL('.stage/projects/', root))).length, 13);
  assert.deepEqual(await readFile(new URL('.stage/_nkbr/sponsor.jpg', root)), await readFile(new URL('assets/sponsor.jpg', root)));
});

test('icon snapshots and public assets are identical bytes', async () => {
  for (const project of projects) {
    const file = `${project.id}${extname(project.iconSource)}`;
    assert.deepEqual(await readFile(new URL(`assets/icons/${file}`, root)), await readFile(new URL(`.stage/_nkbr/icons/${file}`, root)));
  }
});

test('orientation and reduced-motion contracts exist without hidden no-JS content', async () => {
  const css = (await read('styles.css')).replace(/\s+/g, '');
  assert.match(css, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css, /@media\(orientation:portrait\)\{[\s\S]*?\.project-grid,\.download-grid\{grid-template-columns:minmax\(0,1fr\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /:focus-visible/);
  assert.doesNotMatch(css, /\[data-reveal\][^{]*\{[^}]*opacity:0/);
});

test('all existing release domains resolve to their canonical generated page', async () => {
  for (const project of projects.filter(project => project.host)) {
    for (const path of ['/', '/?from=home', '/release/']) {
      let requested;
      const response = await worker.fetch(new Request(`https://${project.host}${path}`), { ASSETS: { fetch: async request => {
        requested = new URL(request.url).pathname;
        return new Response('page', { headers: { 'Content-Type': 'text/html' } });
      } } });
      assert.equal(requested, `/projects/${project.id}/`);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('X-NKBR-Design'), 'mint-2026');
      assert.match(response.headers.get('Content-Security-Policy'), /script-src 'self'/);
    }
  }
});

test('console, API, manifests, and downloads never match the new project-domain routes', async () => {
  const config = JSON.parse(await read('wrangler.jsonc'));
  for (const project of projects.filter(project => project.host)) {
    const patterns = config.routes.map(route => route.pattern).filter(pattern => pattern.startsWith(project.host));
    assert.deepEqual(patterns.map(pattern => pattern.slice(project.host.length)), ['/', '/index.html', '/release', '/release/', '/_nkbr/*']);
    for (const path of ['/console/', '/api/release', '/release.json', '/download/windows', '/latest.json', '/mcp', '/oauth/token']) {
      const target = project.host + path;
      assert.ok(!patterns.some(pattern => pattern.endsWith('*') ? target.startsWith(pattern.slice(0, -1)) : target === pattern));
    }
  }
});

test('root page rejects writes; HEAD has no body; old public Flanime URL migrates', async () => {
  assert.equal((await worker.fetch(new Request('https://nkbr.cc/', { method: 'POST' }), {})).status, 405);
  const head = await worker.fetch(new Request('https://nkbr.cc/', { method: 'HEAD' }), { ASSETS: { fetch: async () => new Response('page') } });
  assert.equal(await head.text(), '');
  const redirect = await worker.fetch(new Request('https://nkbr.cc/flanime/'), {});
  assert.equal(redirect.status, 308);
  assert.equal(redirect.headers.get('location'), 'https://nkbr.cc/projects/flacgn/');
});

test('platform labels follow package names', () => {
  assert.equal(assetLabel('test-android-arm64-v8a.apk'), 'Android ARM64');
  assert.equal(assetLabel('test-android-armeabi-v7a.apk'), 'Android ARMv7');
  assert.equal(assetLabel('codexmax.exe'), 'Windows · CLI');
  assert.equal(assetLabel('test-windows-setup.exe'), 'Windows · 安装版');
});
