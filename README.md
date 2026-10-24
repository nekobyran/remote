# NKBR 项目集

[nkbr.cc](https://nkbr.cc/) 的首页、13 个项目发布页与共享浅绿主题。

## 源码

- `projects.json`：项目顺序、简介、发布域名和本地图标来源。
- `data/releases.json`：从 GitHub 正式发布记录读取的版本和下载地址；预览版本明确标注。CodexMax 的 CLI 与桌面版分别发布，页面同时保留两者。私有仓库下载沿用 GitHub 访问权限。
- `src/templates.mjs`：首页、下载页和 404 页的统一模板。
- `styles.css`、`script.js`：薄荷纸面视觉、横屏三列／竖屏单列、卡片光影与连续项目转场。
- `assets/icons/`：对应本地工程的原始图标快照；来源与修改时间见 `assets/icon-sources.json`。
- `assets/sponsor.jpg`：保留的原赞助二维码。
- `.stage/`：构建生成的公开站点。

## 构建与部署

使用 Node.js 24、GitHub CLI 和 Wrangler 4。项目自身没有 npm 依赖。

```powershell
npm run refresh  # 使用已登录的 GitHub CLI 更新发布记录
npm run icons    # 从同级工程导入当前本地图标
npm run build    # 使用仓库内的图标与版本快照构建
npm test
pwsh -File ./Deploy-NkbrRoot.ps1 -Action DryRun
pwsh -File ./Deploy-NkbrRoot.ps1 -Action Deploy
pwsh -File ./Deploy-NkbrRoot.ps1 -Action Status
```

部署脚本默认使用 D/H 盘 `vibecoding/sdk` 下的 Wrangler；可用 `-WranglerPath` 指定已安装的 CLI。构建只重建本工程 `.stage/`。

## 路由

13 个发布页的规范地址为 `https://nkbr.cc/projects/<id>/`。

既有 `codexmax`、`androidsimulator`、`skillcreator`、`gamelauncher`、`lanzouplus`、`flclashplus`、`kacha.nkbr.cc` 的首页及 `/release/` 使用相同模板。共享资源位于各域名的 `/_nkbr/`。Cloudflare 使用精确展示路由覆盖既有全站路由；下载、API、登录、发布清单及 CodexMax `/console/` 不进入本 Worker，继续由原服务负责。规范项目页均位于 nkbr.cc；带查询参数的访问也使用规范地址。

`/flanime/` 是已有公开链接，以 308 转到 FlACGN 当前发布页。移出首页的其他项目不再出现在项目集，它们的独立服务不在本次部署范围内。现有 `home.json`、`gal.json` 和域名验证文件继续提供。

## 动效参考

本轮设计与代码由 ChatGPT Web 的 6 Pro 生成，经真实 Edge 浏览器验收后，再由同一个 Pro 调整标题转场时序。

首页卡片与详情页共享纸面、图标和标题：打开时用 740ms 展开，返回时用 620ms 收拢。标题在运动轨迹交叉阶段隐藏，落位后显现；详情的简介、平台和下载操作随后分层入场。指针光影只随鼠标移动更新。

跨文档转场借鉴 [bramus/view-transitions-demos](https://github.com/bramus/view-transitions-demos/tree/main/src/stack-navigator/mpa)（Apache-2.0）的 `pageswap`／`pagereveal` 身份与方向处理，使用浏览器原生 View Transitions，无新增依赖。外部 head 脚本提前注册事件，CSP 保持 `script-src 'self'; style-src 'self'`。

规范地址之间支持连续转场；子域返回 nkbr.cc 使用普通跨域导航。原生历史记录保留集合滚动位置，详情经过下载、赞助锚点后也能返回原卡片。不支持 View Transitions 的浏览器使用正常页面导航。

入场效果借鉴 [michalsnik/aos](https://github.com/michalsnik/aos)（MIT）的 fade-up 位移与透明度逻辑，使用原生 IntersectionObserver 和 Web Animations API 实现，无运行时依赖。只播放一次，遵循 `prefers-reduced-motion`；关闭 JavaScript 时内容仍完整可见。

## 验证

`test/site.test.mjs` 的 8 项测试覆盖项目范围、统一模板、图标和二维码字节一致、公开路由、HEAD、下载/API 路由隔离以及下载分类。

真实 Edge 验收覆盖 1440×1000、390×844、844×390、768×1024、320×640；13 个发布页另以桌面和 320px 手机逐页检查图片、下载入口与横向溢出。导航验收包括原生共享元素打开／返回、低位卡片滚动恢复、浏览器后退／前进、详情锚点后返回、运行中切换减少动态效果及无 JavaScript 导航。
