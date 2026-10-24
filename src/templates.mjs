import { projectStory } from './project-stories.mjs';
const HOME = 'https://nkbr.cc/';
const GITHUB = 'https://github.com/nekobyran';

const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>';
const github = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 19c-4.3 1.3-4.3-2.2-6-2.7m12 5v-3.9c0-1.1-.4-1.8-.9-2.3 3-.3 6.2-1.5 6.2-6.9 0-1.5-.5-2.7-1.4-3.7.2-.4.6-1.7-.1-3.5 0 0-1.1-.4-3.7 1.4a13 13 0 0 0-6.7 0C5.8.6 4.7 1 4.7 1 4 2.8 4.4 4.1 4.6 4.5A5.4 5.4 0 0 0 3.2 8c0 5.4 3.2 6.6 6.2 6.9-.4.4-.9 1.2-.9 2.3v4"/></svg>';

export const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
})[character]);

export const projectPath = project => `/projects/${project.id}/`;

const repoUrl = project => `${GITHUB}/${project.repo}`;
const collectionReturnUrl = project => `${HOME}#project-${encodeURIComponent(project.id)}`;
const iconUrl = project => `/_nkbr/icons/${project.icon}`;

const tags = platforms => `<div class="tags">${platforms.map(platform => `<span>${escapeHtml(platform)}</span>`).join('')}</div>`;

function icon(project, detail = false) {
  return `<span class="icon-stage ${detail ? 'release-icon' : 'project-icon'}" data-shared-icon${detail ? ' data-reveal="icon"' : ''} aria-hidden="true">
    <img src="${escapeHtml(iconUrl(project))}" width="72" height="72" alt="" decoding="${detail ? 'sync' : 'async'}"${detail ? ' fetchpriority="high"' : ''}>
  </span>`;
}

function header(home, project) {
  const returnAttribute = project ? ' data-collection-return' : '';
  return `<header class="site-header shell">
    <a class="brand" href="${HOME}" aria-label="NKBR 首页"${returnAttribute}>
      <img src="/_nkbr/favicon.svg" width="32" height="32" alt="">
      <span>NKBR<span class="brand-dot">.</span></span>
    </a>
    <nav aria-label="主导航">
      <a class="nav-projects" href="${home ? '#projects' : `${HOME}#projects`}"${home ? ' aria-current="page"' : ''}${returnAttribute}>全部项目</a>
      <a href="#support">赞助</a>
      <a class="nav-github" href="${GITHUB}" aria-label="NKBR GitHub">${github}</a>
    </nav>
  </header>`;
}

function support() {
  return `<section id="support" class="support shell" aria-labelledby="support-title" data-reveal>
    <div class="support-copy">
      <h2 id="support-title">赞助支持</h2>
      <span class="support-rule" aria-hidden="true"></span>
    </div>
    <a class="sponsor-image" href="/_nkbr/sponsor.jpg" target="_blank" rel="noopener" aria-label="查看完整赞助二维码">
      <img src="/_nkbr/sponsor.jpg" width="641" height="638" alt="赞助二维码" loading="lazy" decoding="async">
      <span class="sponsor-caption" aria-hidden="true">查看原图 ${arrow}</span>
    </a>
  </section>`;
}

function page({ title, description, canonical, content, home = false, project = null }) {
  const kind = home ? 'home' : project ? 'project' : 'not-found';
  const projectAttribute = project ? ` data-project="${escapeHtml(project.id)}"` : '';
  const footerHref = project ? collectionReturnUrl(project) : HOME;

  return `<!doctype html>
<html lang="zh-CN" data-page="${kind}"${projectAttribute}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#eff4e9">
  <meta name="color-scheme" content="light">
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="zh_CN">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <link rel="icon" href="/_nkbr/favicon.svg" type="image/svg+xml">
  ${project ? `<link rel="preload" as="image" href="${escapeHtml(iconUrl(project))}" fetchpriority="high">` : ''}
  <link rel="stylesheet" href="/_nkbr/styles.css">
  ${project ? '<link rel="stylesheet" href="/_nkbr/stories.css"><script type="module" src="/_nkbr/stories.js"></script>' : ''}
  <link rel="expect" href="#page-end" blocking="render">
  <script src="/_nkbr/script.js"></script>
  <script type="module" src="/_nkbr/forest.js"></script>
  <title>${escapeHtml(title)}</title>
</head>
<body data-design="mint-2026">
  <div class="forest-world" aria-hidden="true"><canvas class="forest-canvas"></canvas><div class="forest-veil"></div></div>
  <a class="skip-link" href="#main">跳到内容</a>
  ${header(home, project)}
  <main id="main" tabindex="-1">
    ${content}
    ${support()}
  </main>
  <footer id="page-end" class="site-footer shell">
    <span>© ${new Date().getFullYear()} NKBR</span>
    <a href="${escapeHtml(footerHref)}"${project ? ' data-collection-return' : ''}>项目集 ${arrow}</a>
    <a class="to-top" href="#main">回到顶部 ${arrow}</a>
  </footer>
  <button class="forest-toggle" type="button" data-forest-toggle aria-pressed="false" aria-label="暂停森林动态" hidden><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path class="forest-pause-icon" d="M7 5v10m6-10v10"/><path class="forest-play-icon" d="m7 4 9 6-9 6z"/></svg><span>暂停背景</span></button>
</body>
</html>\n`;
}

export function homePage(projects) {
  const count = String(projects.length).padStart(2, '0');

  const content = `<section class="hero shell" aria-labelledby="hero-title">
    <div class="hero-heading" data-reveal="heading">
      <h1 id="hero-title">项目<span>集</span></h1>
      <span class="hero-rule" aria-hidden="true"></span>
    </div>
    <a class="hero-index" href="#projects" aria-label="浏览全部 ${projects.length} 个项目" data-reveal="index">
      <span class="index-number">${count}</span>
      <span class="index-caption">个项目 <span class="index-arrow">${arrow}</span></span>
    </a>
  </section>
  <section id="projects" class="projects shell" aria-label="全部项目">
    <div class="project-grid">
      ${projects.map((project, index) => `<article id="project-${escapeHtml(project.id)}" class="project-card" data-project="${escapeHtml(project.id)}" data-reveal>
        <a class="project-link" href="${escapeHtml(projectPath(project))}">
          <span class="project-surface" data-shared-surface aria-hidden="true"></span>
          <div class="card-top">
            ${icon(project)}
            <span class="card-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
          </div>
          <h2 class="project-title"><span data-shared-title>${escapeHtml(project.name)}</span></h2>
          <p class="project-description">${escapeHtml(project.description)}</p>
          <div class="card-bottom">
            ${tags(project.platforms)}
            <span class="card-arrow" aria-hidden="true">${arrow}</span>
          </div>
        </a>
      </article>`).join('\n')}
    </div>
  </section>`;

  return page({
    title: 'NKBR · 项目集',
    description: 'NKBR 的工具、应用与创作项目。',
    canonical: HOME,
    content,
    home: true,
  });
}

export function releasePage(project) {

  const content = `<section class="release-hero shell" aria-labelledby="release-title">
    <div class="release-navigation">
      <a class="back-link" href="${escapeHtml(collectionReturnUrl(project))}" data-collection-return>
        <span class="back-arrow" aria-hidden="true">${arrow}</span>
        <span>全部项目</span>
      </a>
    </div>
    <div class="release-panel" data-project="${escapeHtml(project.id)}">
      <div class="project-surface release-surface" data-shared-surface aria-hidden="true"></div>
      <div class="release-heading">
        ${icon(project, true)}
        <div class="release-heading-copy">
          <h1 id="release-title" class="release-title"><span data-shared-title data-reveal="title">${escapeHtml(project.name)}</span></h1>
          <p class="release-description" data-reveal data-detail-stage="1">${escapeHtml(project.description)}</p>
          <div class="release-platforms" data-reveal data-detail-stage="2">${tags(project.platforms)}</div>
        </div>
      </div>
      <div class="release-actions" data-reveal data-detail-stage="3">
        <a class="button button-primary" href="${escapeHtml(repoUrl(project))}"><span>前往 GitHub 仓库</span>${github}</a>
        <a class="text-link" href="#story"><span>观看介绍</span>${arrow}</a>
      </div>
    </div>
  </section>
  ${projectStory(project)}`;

  return page({
    title: `${project.name} · NKBR`,
    description: project.description,
    canonical: `${HOME.slice(0, -1)}${projectPath(project)}`,
    content,
    project,
  });
}

export function notFoundPage() {
  return page({
    title: '页面未找到 · NKBR',
    description: 'NKBR 项目集',
    canonical: HOME,
    content: `<section class="hero error-hero shell" aria-labelledby="error-title">
      <div class="error-copy" data-reveal>
        <p class="error-code">404</p>
        <h1 id="error-title">页面未找到</h1>
        <a class="button button-primary" href="${HOME}"><span>返回项目集</span>${arrow}</a>
      </div>
    </section>`,
  });
}
