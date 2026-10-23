import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const run = promisify(execFile);
const root = new URL('../', import.meta.url);
const projects = JSON.parse(await readFile(new URL('projects.json', root), 'utf8'));
const releases = {};
// Persist only the release fields consumed by the pages, never raw API output.
for (const project of projects) {
  const { stdout } = await run('gh', ['api', `repos/nekobyran/${project.repo}/releases?per_page=20`], { maxBuffer: 4 * 1024 * 1024 });
  const published = JSON.parse(stdout).filter(release => !release.draft);
  const release = published.find(release => !release.prerelease) ?? published[0];
  if (!release) {
    releases[project.id] = { url: `https://github.com/nekobyran/${project.repo}/releases`, assets: [] };
    console.log(`${project.id}: no published release`);
    continue;
  }
  // CodexMax ships the CLI separately from its current desktop distribution.
  const selected = project.additionalRelease ? [release, published.find(item => item.tag_name === project.additionalRelease)] : [release];
  const assets = selected.flatMap(item => item.assets).filter(asset => {
    if (project.assetPattern) return new RegExp(project.assetPattern).test(asset.name);
    return /\.(apk|exe|msi|zip|dmg|AppImage|deb|rpm|tar\.gz|tar\.zst)$/i.test(asset.name)
      && !/verification|audit|source|browser-fix|connection-fix/i.test(asset.name);
  }).map(asset => ({ name: asset.name, size: asset.size, url: asset.browser_download_url }));
  releases[project.id] = { version: release.tag_name, date: release.published_at.slice(0, 10), preview: release.prerelease, url: release.html_url, assets };
  console.log(`${project.id}: ${release.tag_name}, ${assets.length} files`);
}
await mkdir(new URL('data/', root), { recursive: true });
await writeFile(new URL('data/releases.json', root), `${JSON.stringify(releases, null, 2)}\n`);
