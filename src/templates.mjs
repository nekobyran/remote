const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>';
const download = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4"/></svg>';
const github = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 19c-4.3 1.3-4.3-2.2-6-2.7m12 5v-3.9c0-1.1-.4-1.8-.9-2.3 3-.3 6.2-1.5 6.2-6.9 0-1.5-.5-2.7-1.4-3.7.2-.4.6-1.7-.1-3.5 0 0-1.1-.4-3.7 1.4a13 13 0 0 0-6.7 0C5.8.6 4.7 1 4.7 1 4 2.8 4.4 4.1 4.6 4.5A5.4 5.4 0 0 0 3.2 8c0 5.4 3.2 6.6 6.2 6.9-.4.4-.9 1.2-.9 2.3v4"/></svg>';

export const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const tags = platforms => `<div class="tags">${platforms.map(platform => `<span>${escapeHtml(platform)}</span>`).join('')}</div>`;
const icon = (project, className = 'project-icon') => `<img class="${className}" src="/_nkbr/icons/${project.icon}" width="72" height="72" alt="" decoding="async">`;
const repoUrl = project => `https://github.com/nekobyran/${project.repo}`;
export const projectPath = project => `/projects/${project.id}/`;

function header(home) {
  return `<header class="site-header shell">
    <a class="brand" href="https://nkbr.cc/" aria-label="NKBR 首页"><img src="/_nkbr/favicon.svg" width="30" height="30" alt=""><span>NKBR<span class="brand-dot">.</span></span></a>
    <nav aria-label="主导航"><a href="${home ? '#projects' : 'https://nkbr.cc/#projects'}">全部项目</a><a href="#support">赞助</a><a class="nav-github" href="https://github.com/nekobyran" aria-label="NKBR GitHub">${github}</a></nav>
  </header>`;
}

function support() {
  return `<section id="support" class="support shell" aria-labelledby="support-title" data-reveal>
    <div class="support-copy"><h2 id="support-title">赞助支持</h2></div>
    <a class="sponsor-image" href="/_nkbr/sponsor.jpg" target="_blank" rel="noopener" aria-label="查看完整赞助二维码"><img src="/_nkbr/sponsor.jpg" width="641" height="638" alt="赞助二维码" loading="lazy" decoding="async"></a>
  </section>`;
}

function page({ title, description, canonical, content, home = false }) {
  return `<!doctype html>
<html lang="zh-CN"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#eef5e9"><meta name="color-scheme" content="light">
  <meta name="description" content="${escapeHtml(description)}"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:type" content="website"><meta property="og:locale" content="zh_CN">
  <link rel="canonical" href="${canonical}"><link rel="icon" href="/_nkbr/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/_nkbr/styles.css"><script src="/_nkbr/script.js" defer></script><title>${escapeHtml(title)}</title>
</head><body data-design="mint-2026"><a class="skip-link" href="#main">跳到内容</a>${header(home)}
<main id="main">${content}${support()}</main>
<footer class="site-footer shell"><span>© ${new Date().getFullYear()} NKBR</span><a href="https://nkbr.cc/">项目集 ${arrow}</a><a href="#main">回到顶部</a></footer></body></html>\n`;
}

export function homePage(projects) {
  const content = `<section class="hero shell" aria-labelledby="hero-title">
    <div data-reveal><h1 id="hero-title">项目集</h1></div>
    <a class="hero-index" href="#projects" data-reveal><span class="index-number">${String(projects.length).padStart(2, '0')}</span><span>个项目 ${arrow}</span></a>
  </section>
  <section id="projects" class="projects shell" aria-label="全部项目">
  <div class="project-grid">${projects.map((project, index) => `<article class="project-card" data-project="${project.id}" data-reveal>
    <a class="project-link" href="${projectPath(project)}"><div class="card-top">${icon(project)}<span class="card-number">${String(index + 1).padStart(2, '0')}</span></div>
    <h3>${escapeHtml(project.name)}</h3><p>${escapeHtml(project.description)}</p><div class="card-bottom">${tags(project.platforms)}<span class="card-arrow">${arrow}</span></div></a>
  </article>`).join('\n')}</div></section>`;
  return page({ title: 'NKBR · 项目集', description: 'NKBR 的工具、应用与创作项目。', canonical: 'https://nkbr.cc/', content, home: true });
}

export function assetLabel(name) {
  const role = /-admin-/i.test(name) ? '管理端 · ' : /-user-/i.test(name) ? '用户端 · ' : '';
  if (/template/i.test(name)) return '设计模板';
  if (/plugin/i.test(name)) return '插件';
  if (/\.apk$/i.test(name)) {
    const arch = /arm64/i.test(name) ? 'ARM64' : /armeabi|armv7/i.test(name) ? 'ARMv7' : /x86_64/i.test(name) ? 'x64' : /x86/i.test(name) ? 'x86' : '';
    return `${role}Android ${arch}`.trim();
  }
  if (/cli|^codexmax\.exe$/i.test(name)) return 'Windows · CLI';
  if (/web/i.test(name)) return 'Web';
  if (/mac|\.dmg$/i.test(name)) return 'macOS';
  if (/linux|AppImage|\.deb$|\.rpm$/i.test(name)) return 'Linux';
  if (/setup|installer|\.msi$/i.test(name)) return `${role}Windows · 安装版`;
  return `${role}Windows · 便携版`;
}

export function releasePage(project, release) {
  const assets = release.assets;
  const content = `<section class="release-hero shell" aria-labelledby="release-title">
    <div class="release-heading" data-reveal>${icon(project, 'release-icon')}<div><h1 id="release-title">${escapeHtml(project.name)}</h1><p>${escapeHtml(project.description)}</p>${tags(project.platforms)}</div></div>
    <div class="release-actions" data-reveal><a class="button button-primary" href="${assets.length ? '#downloads' : repoUrl(project)}">${assets.length ? `选择下载 ${download}` : `项目源码 ${github}`}</a><a class="text-link" href="${release.url}">版本记录 ${arrow}</a></div>
  </section>
  <section id="downloads" class="downloads shell" aria-labelledby="downloads-title"><div class="section-heading" data-reveal><div><h2 id="downloads-title">${assets.length ? '获取应用' : '项目源码'}</h2></div>${release.version ? `<div class="release-version"><strong>${escapeHtml(release.version)}</strong><span>${release.preview ? '预览版 · ' : ''}${release.date}</span></div>` : ''}</div>
    <div class="download-grid">${assets.length ? assets.map(asset => `<article class="download-card" data-reveal><p class="download-platform">${escapeHtml(assetLabel(asset.name))}</p><h3>${escapeHtml(asset.name)}</h3><p class="file-size">${(asset.size / 1024 / 1024).toFixed(1)} MB</p><a class="button button-primary" href="${escapeHtml(asset.url)}" aria-label="下载 ${escapeHtml(asset.name)}">GitHub 下载 ${download}</a></article>`).join('\n') : `<article class="download-card" data-reveal><p class="download-platform">GitHub</p><h3>${escapeHtml(project.name)}</h3><p class="file-size">尚未发布安装包</p><a class="button button-primary" href="${repoUrl(project)}">查看源码 ${arrow}</a></article>`}</div>
    ${assets.length ? `<a class="source-link" href="${repoUrl(project)}">${github} 项目源码</a>` : ''}
  </section>`;
  return page({ title: `${project.name} · NKBR`, description: project.description, canonical: `https://nkbr.cc${projectPath(project)}`, content });
}

export function notFoundPage() {
  return page({ title: '页面未找到 · NKBR', description: 'NKBR 项目集', canonical: 'https://nkbr.cc/', content: '<section class="hero shell"><div><p class="eyebrow">404</p><h1>这页走丢了。</h1><a class="button button-primary" href="https://nkbr.cc/">返回项目集</a></div></section>' });
}
