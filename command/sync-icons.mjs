import { readFile, writeFile, copyFile, mkdir, stat } from 'node:fs/promises';
import { extname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const workspace = resolve(root, '..');
const projects = JSON.parse(await readFile(join(root, 'projects.json'), 'utf8'));
await mkdir(join(root, 'assets/icons'), { recursive: true });
const sources = [];
for (const project of projects) {
  const source = join(workspace, project.iconSource);
  const info = await stat(source);
  await copyFile(source, join(root, 'assets/icons', `${project.id}${extname(source)}`));
  sources.push({ project: project.id, source: project.iconSource, bytes: info.size, modified: info.mtime.toISOString() });
}
await writeFile(join(root, 'assets/icon-sources.json'), `${JSON.stringify(sources, null, 2)}\n`);
console.log(`Imported ${sources.length} local project icons without changing their contents.`);
