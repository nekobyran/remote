# NKBR 项目集

[nkbr.cc](https://nkbr.cc/) 的首页、13 个项目介绍页与共享森林液态玻璃主题。

## 源码

- `projects.json`：项目顺序、简介、发布域名和本地图标来源。
- `data/releases.json`：历史发布快照，展示页构建不再读取；项目详情主按钮直接前往对应 GitHub 仓库。
- `src/templates.mjs`：首页、项目详情与 404 页。
- `src/project-stories.mjs`、`src/story-art.mjs`、`src/story-shapes.mjs`：13 支独立短片的分镜、原创 SVG 构图与玻璃物件。
- `src/story-scores.js`、`src/story-player.js`、`stories.css`：原生 WAAPI 时间轴、播放控制与响应式取景。
- `src/forest-scene.js`：Three.js 玻璃植物动画、SVG 景深层和背景播放控制。
- `styles.css`、`script.js`：薄荷纸面视觉、横屏三列／竖屏单列、卡片光影与连续项目转场。
- `assets/icons/`：对应本地工程的原始图标快照；来源与修改时间见 `assets/icon-sources.json`。
- `assets/sponsor.jpg`：保留的原赞助二维码。
- `.stage/`：构建生成的公开站点。

## 构建与部署

使用 Node.js 24、GitHub CLI 和 Wrangler 4。Three.js 0.186.1 由 esbuild 打包为同源模块；运行时不请求第三方脚本、模型、纹理或字体。

```powershell
npm ci
npm run refresh  # 使用已登录的 GitHub CLI 更新发布记录
npm run icons    # 从同级工程导入当前本地图标
npm run build    # 使用仓库内的图标与项目分镜构建
npm test
pwsh -File ./Deploy-NkbrRoot.ps1 -Action DryRun
pwsh -File ./Deploy-NkbrRoot.ps1 -Action Deploy
pwsh -File ./Deploy-NkbrRoot.ps1 -Action Status
```

部署使用仓库内的图标快照；更新本地图标时显式运行 `npm run icons`。

部署脚本默认使用 D/H 盘 `vibecoding/sdk` 下的 Wrangler；可用 `-WranglerPath` 指定已安装的 CLI。构建只重建本工程 `.stage/`。

## 路由

13 个发布页的规范地址为 `https://nkbr.cc/projects/<id>/`。

既有 `codexmax`、`androidsimulator`、`skillcreator`、`gamelauncher`、`lanzouplus`、`flclashplus`、`kacha.nkbr.cc` 的首页及 `/release/` 使用相同模板。共享资源位于各域名的 `/_nkbr/`。Cloudflare 使用精确展示路由覆盖既有全站路由；下载、API、登录、发布清单及 CodexMax `/console/` 不进入本 Worker，继续由原服务负责。规范项目页均位于 nkbr.cc；带查询参数的访问也使用规范地址。

`/flanime/` 是已有公开链接，以 308 转到 FlACGN 当前发布页。移出首页的其他项目不再出现在项目集，它们的独立服务不在本次部署范围内。现有 `home.json`、`gal.json` 和域名验证文件继续提供。

## 动效参考

ChatGPT Web 的 6 Pro 参与设计、标题转场打磨与森林动画编排；界面集成与 Three.js 动画经过真实 Edge 浏览器验收。

森林背景采用精细 SVG 植物剪影与分层景深。一组相连的玻璃叶片在 16 秒周期中依次展开、转动、卷曲和收拢，根部保持连接；顶点形变与表面法线同步计算，细叶脉随表面一起弯曲。局部焦散和柔和光幕衬托玻璃厚度。界面以中心较厚、边缘通透的薄荷玻璃保持文字可读。

视觉研究参考 [Lusion](https://lusion.co/) 的动态雕塑构图、[Active Theory](https://activetheory.net/) 的沉浸式呈现、[Awwwards Three.js](https://www.awwwards.com/websites/three-js/) 和 [Recent Design](https://recent.design/) 的界面案例。页面使用原创 SVG 与曲面动画，不复制这些网站的品牌素材。

真实透射材质复用 [three.js physical transmission](https://github.com/mrdoob/three.js/blob/r186/examples/webgl_materials_physical_transmission.html) 和 `RoomEnvironment` 的官方实现（MIT）。完整许可证随站点保存在 `/_nkbr/THREE-LICENSE.txt`。森林、玻璃叶片、叶脉与焦散均在本地生成。

背景最高 30fps，桌面绘制像素限制约 130 万、手机约 50 万。后台与页面离开时停止渲染；可用右下角按钮暂停并记住偏好。系统减少动态效果时显示静态构图；无 JavaScript 或无 WebGL 2 时显示本地 SVG 森林。背景与项目介绍、路由和原生转场独立。

首页卡片与详情页共享纸面、图标和标题：打开时用 740ms 展开，返回时用 620ms 收拢。标题在运动轨迹交叉阶段隐藏，落位后显现；详情的简介、平台和仓库操作随后分层入场。指针光影只随鼠标移动更新。

跨文档转场借鉴 [bramus/view-transitions-demos](https://github.com/bramus/view-transitions-demos/tree/main/src/stack-navigator/mpa)（Apache-2.0）的 `pageswap`／`pagereveal` 身份与方向处理，使用浏览器原生 View Transitions，无新增依赖。外部 head 脚本提前注册事件，CSP 保持 `script-src 'self'; style-src 'self'`。

规范地址之间支持连续转场；子域返回 nkbr.cc 使用普通跨域导航。原生历史记录保留集合滚动位置，详情经过介绍、赞助锚点后也能返回原卡片。不支持 View Transitions 的浏览器使用正常页面导航。

入场效果借鉴 [michalsnik/aos](https://github.com/michalsnik/aos)（MIT）的 fade-up 位移与透明度逻辑，使用原生 IntersectionObserver 和 Web Animations API 实现，无运行时依赖。只播放一次，遵循 `prefers-reduced-motion`；关闭 JavaScript 时内容仍完整可见。

## 验证

`test/site.test.mjs` 的 8 项测试覆盖项目范围、仓库链接与独立短片、图标和二维码字节一致、公开路由、HEAD、下载/API 路由隔离、分镜数量、真实动画对象与严格 CSP 资源合同。

真实 Edge 验收覆盖 1440×1000、390×844、844×390、768×1024、320×640；13 个发布页另以桌面和 320px 手机逐页检查图片、仓库入口与横向溢出。导航验收包括原生共享元素打开／返回、低位卡片滚动恢复、浏览器后退／前进、详情锚点后返回、运行中切换减少动态效果及无 JavaScript 导航。

## 项目动画介绍

每个详情页上方的主按钮直接指向项目仓库。原下方下载卡片、版本列表与下载占位已移除，改为 6 Pro 设计的 13 支原创 HTML/SVG 功能短片。CodexMax 用三端接榫组成工作台，Android Desktop 展开折叠桌面，GameLauncher 将引擎刻度环变成开场拱门，Kacha 从取景经过文字识别示意到笔迹批注；其他项目使用各自的分镜与构图。

每片 15 秒，进入视口后播放一次，结尾停留；可暂停、重播、拖动进度或选择分镜。离屏与页面隐藏时暂停，重新进入后续播，保留用户主动暂停。系统减少动态效果时默认显示终幕；无 JavaScript 时保留完整的静态插画与三段说明，不显示无效控制。手机采用各片独立取景，正文与控制在 SVG 外排版。详情页背景播放控制位于页脚。

时间编排借鉴 [motion-canvas/motion-canvas](https://github.com/motion-canvas/motion-canvas)（MIT）的 [sequence](https://github.com/motion-canvas/motion-canvas/blob/main/packages/core/src/flow/sequence.ts) 开始偏移与错峰编排思路；本项目自行实现单一时间轴，驱动暂停状态的原生 WAAPI 动画，不依赖 Motion Canvas，也未复制其源码。片中画面标注为功能概念演绎；没有模拟实时指标或实际操作完成状态。片中“下载”仅介绍已有产品功能，不提供下载入口。

真实 Edge 验收记录每片 2.5、7.5、13.5 秒三个画面及 320px 终幕，检查播放、暂停、重播、拖动、分镜选择、终幕停留、离屏暂停、减少动态、无 JavaScript 内容、仓库直链与控制热区。截图位于本地 `output/playwright/`，验证结果位于 `verification/`。
