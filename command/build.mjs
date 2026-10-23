import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homePage, releasePage, notFoundPage } from '../src/templates.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const stage = join(root, '.stage');
const projects = JSON.parse(await readFile(join(root, 'projects.json'), 'utf8'));
const releases = JSON.parse(await readFile(join(root, 'data/releases.json'), 'utf8'));
// Rewrite generated files in place so Wrangler's Windows watcher can stay open.
await mkdir(join(stage, '_nkbr/icons'), { recursive: true });
for (const [index, project] of projects.entries()) {
  project.index = index;
  project.icon = `${project.id}${extname(project.iconSource)}`;
  const source = join(root, 'assets/icons', project.icon);
  await copyFile(source, join(stage, '_nkbr/icons', project.icon));
  const pagePath = join(stage, 'projects', project.id, 'index.html');
  await mkdir(dirname(pagePath), { recursive: true });
  await writeFile(pagePath, releasePage(project, releases[project.id]));
}
for (const [source, destination] of [['styles.css', '_nkbr/styles.css'], ['script.js', '_nkbr/script.js'], ['favicon.svg', '_nkbr/favicon.svg'], ['assets/sponsor.jpg', '_nkbr/sponsor.jpg'], ['home.json', 'home.json'], ['gal.json', 'gal.json'], ['robots.txt', 'robots.txt'], ['7f29c60b70c948c298d130c4ccf1b8c8.txt', '7f29c60b70c948c298d130c4ccf1b8c8.txt']]) {
  await copyFile(join(root, source), join(stage, destination));
}
await writeFile(join(stage, 'index.html'), homePage(projects));
await writeFile(join(stage, '404.html'), notFoundPage());
await writeFile(join(stage, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://nkbr.cc/</loc></url>${projects.map(project => `<url><loc>https://nkbr.cc/projects/${project.id}/</loc></url>`).join('')}</urlset>\n`);
console.log(`Built homepage + ${projects.length} release pages; 13 local icons; original sponsor image.`);
