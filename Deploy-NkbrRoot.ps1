[CmdletBinding()]
param(
  [ValidateSet('Stage', 'Validate', 'Deploy')]
  [string]$Action = 'Validate',
  [string]$ProjectRoot = $PSScriptRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$project = (Resolve-Path -LiteralPath $ProjectRoot).Path
$workerPath = Join-Path $project 'worker.js'
$indexPath = Join-Path $project 'index.html'
$configPath = Join-Path $project 'wrangler.jsonc'
$stagePath = Join-Path $project '.stage'
$sponsorRelativePath = 'assets/sponsor.jpg'
$sponsorSha256 = '1E23933B0C5DA7169FFBBC64EF58B324867ADA4EA38CF1F772F2CF13BA5C300A'

function Get-PublicFiles {
  $worker = Get-Content -LiteralPath $workerPath -Raw -Encoding UTF8
  $match = [regex]::Match($worker, "(?s)const FILES = new Set\(\[(?<files>.*?)\]\);")
  if (-not $match.Success) { throw '无法读取 Worker 公共文件清单。' }
  $files = [regex]::Matches($match.Groups['files'].Value, "'(?<path>[^']+)'") |
    ForEach-Object { $_.Groups['path'].Value }
  if ($files.Count -eq 0) { throw 'Worker 公共文件清单为空。' }
  return $files
}

function Invoke-Stage {
  if (Test-Path -LiteralPath $stagePath) {
    $resolvedStage = (Resolve-Path -LiteralPath $stagePath).Path
    if ($resolvedStage -ne (Join-Path $project '.stage')) { throw '暂存目录路径异常。' }
    Remove-Item -LiteralPath $resolvedStage -Recurse -Force
  }
  New-Item -ItemType Directory -Path $stagePath | Out-Null
  foreach ($relative in Get-PublicFiles) {
    $source = Join-Path $project $relative
    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { throw "缺少公共文件：$relative" }
    $target = Join-Path $stagePath $relative
    $targetParent = Split-Path -Parent $target
    if (-not (Test-Path -LiteralPath $targetParent)) {
      New-Item -ItemType Directory -Path $targetParent -Force | Out-Null
    }
    Copy-Item -LiteralPath $source -Destination $target
  }
  "stage=pass;files=$((Get-PublicFiles).Count);path=$stagePath"
}

function Invoke-Validate {
  foreach ($requiredPath in @($workerPath, $indexPath, $configPath)) {
    if (-not (Test-Path -LiteralPath $requiredPath -PathType Leaf)) { throw "缺少发布文件：$requiredPath" }
  }

  $index = Get-Content -LiteralPath $indexPath -Raw -Encoding UTF8
  $worker = Get-Content -LiteralPath $workerPath -Raw -Encoding UTF8
  $config = Get-Content -LiteralPath $configPath -Raw -Encoding UTF8
  $required = @(
    'LanzouPlus',
    'Kacha',
    'LanzouYOU',
    'FLClash++',
    'CodexMax',
    'ChatGPT 第三方客户端，支持通过 ChatGPT 插件连接本地服务，并在本地连接 Codex。',
    'https://lanzouplus.nkbr.cc/',
    'https://kacha.nkbr.cc/',
    '<p>3 个软件</p>',
    '<p>8 个项目</p>',
    'Flutter + Rust',
    '接入免费节点能力的 FLClash 本地项目',
    '原生 Java',
    'C# · WinUI 3',
    '<dt>状态</dt><dd>已上线</dd>',
    '<dt>版本</dt><dd>1.0.0</dd>',
    '<h2 id="sponsor-title">赞助支持</h2>',
    'src="/assets/sponsor.jpg"'
  )
  foreach ($text in $required) {
    if (-not $index.Contains($text)) { throw "根发布页缺少要求内容：$text" }
  }

  foreach ($directive in @(
    '<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />',
    '<meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />',
    '<meta name="bingbot" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />',
    '<meta name="baiduspider" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />',
    '<meta name="sogou web spider" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />',
    '<meta name="360Spider" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />',
    '<meta name="Bytespider" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />'
  )) {
    if (-not $index.Contains($directive, [StringComparison]::Ordinal)) { throw "根发布页缺少禁止索引指令：$directive" }
  }

  $robotsPath = Join-Path $project 'robots.txt'
  if (-not (Test-Path -LiteralPath $robotsPath -PathType Leaf)) { throw '根发布页缺少 robots.txt。' }
  $robots = Get-Content -LiteralPath $robotsPath -Raw -Encoding UTF8
  if ($robots -notmatch '(?im)^User-agent:\s*\*\s*\r?$[\s\S]*?^Allow:\s*/\s*\r?$') { throw '根发布页 robots.txt 必须允许爬虫读取 noindex 指令。' }
  if ($robots -match '(?im)^Disallow:\s*/\s*\r?$') { throw '根发布页 robots.txt 不得阻止爬虫读取 noindex 指令。' }

  if ($worker -notmatch "'X-Robots-Tag':\s*'noindex, nofollow, noarchive, nosnippet, noimageindex, unavailable_after: 15 Jul 2026 00:00:00 GMT'") {
    throw '根发布页 Worker 必须为所有响应设置完整 X-Robots-Tag。'
  }
  if ($worker -notmatch "headers\.set\('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0'\)") {
    throw '根发布页 Worker 必须禁用搜索缓存。'
  }
  if (([regex]::Matches($index, 'rel="nofollow noopener noreferrer"')).Count -ne 3) {
    throw '根发布页对外发布入口必须全部声明 nofollow。'
  }

  if ([regex]::Matches($index, 'src="/assets/sponsor\.jpg"').Count -ne 1 -or $index -match '(?i)(?:raw\.githubusercontent\.com|github\.com/[^"'']*/blob/)[^"'']*sponsor|Screenshot_2026-07-17-22-38-28-48') {
    throw '根发布页赞助区必须且只能引用一个本地赞助图片。'
  }
  $sponsorPath = Join-Path $project $sponsorRelativePath
  if (-not (Test-Path -LiteralPath $sponsorPath -PathType Leaf)) { throw "根发布页缺少 $sponsorRelativePath。" }
  if ((Get-FileHash -LiteralPath $sponsorPath -Algorithm SHA256).Hash -cne $sponsorSha256) { throw '根发布页赞助图片 SHA-256 与核验源不一致。' }
  $sponsorBytes = [IO.File]::ReadAllBytes($sponsorPath)
  if ($sponsorBytes.Length -lt 4 -or $sponsorBytes[0] -ne 0xFF -or $sponsorBytes[1] -ne 0xD8 -or $sponsorBytes[2] -ne 0xFF -or $sponsorBytes[-2] -ne 0xFF -or $sponsorBytes[-1] -ne 0xD9) { throw '根发布页赞助图片不是完整 JPEG。' }
  if ($worker -notmatch "jpg:\s*'image/jpeg'") { throw 'Worker 缺少 JPEG 内容类型。' }

  $publicFiles = @(Get-PublicFiles)
  if ($publicFiles -cnotcontains $sponsorRelativePath) { throw 'Worker 公共文件清单缺少赞助图片。' }
  if ($publicFiles -contains 'sitemap.xml' -or (Test-Path -LiteralPath (Join-Path $project 'sitemap.xml'))) {
    throw '根发布页不得保留或发布 sitemap.xml。'
  }
  $indexNowFiles = @(Get-ChildItem -LiteralPath $project -File | Where-Object Name -Match '^[0-9a-f]{32}\.txt$')
  if ($indexNowFiles.Count -ne 1) { throw '根发布页必须且只能保留一个 IndexNow 所有权文件。' }
  $indexNowKey = [IO.Path]::GetFileNameWithoutExtension($indexNowFiles[0].Name)
  if ((Get-Content -LiteralPath $indexNowFiles[0].FullName -Raw -Encoding UTF8).Trim() -cne $indexNowKey) {
    throw 'IndexNow 所有权文件内容与文件名不一致。'
  }
  if ($publicFiles -cnotcontains $indexNowFiles[0].Name) { throw 'Worker 公共文件清单缺少 IndexNow 所有权文件。' }

  if (([regex]::Matches($index, '<article class="release-card">')).Count -ne 3) {
    throw '根发布区必须展示 LanzouPlus、Kacha 与纳西妲 Codex 主题。'
  }
  if (([regex]::Matches($index, '<dt>版本</dt><dd>1\.0\.0</dd>')).Count -ne 2) {
    throw 'LanzouPlus 与 Kacha 必须显示版本 1.0.0。'
  }
  if ($index -notmatch '(?s)<article class="release-card">.*?<h3>Kacha</h3>.*?<dt>状态</dt><dd>已上线</dd>.*?href="https://kacha\.nkbr\.cc/".*?</article>') {
    throw 'Kacha 必须以已上线状态出现在根发布区并链接独立发布页。'
  }
  if ($index -notmatch '(?s)<article class="release-card">.*?<h3>纳西妲 · 森息</h3>.*?<dt>版本</dt><dd>1\.5\.0</dd>.*?href="https://github\.com/nekobyran/nahida-codex-skin/releases/tag/v1\.5\.0".*?</article>') {
    throw '纳西妲 Codex 主题必须以 v1.5.0 已上线状态出现在根发布区。'
  }
  if ($index -match '(?s)<li class="roadmap-item">(?:(?!</li>).)*?<h3>Kacha</h3>') {
    throw '已上线的 Kacha 不得继续出现在路线图。'
  }
  if ($index.Contains('LanzouMax', [StringComparison]::Ordinal) -or $index.Contains('lanzoumax.nkbr.cc', [StringComparison]::OrdinalIgnoreCase)) {
    throw '根发布页不得再建立 LanzouPlus 与 LanzouMax 的搜索关联。'
  }
  if ($index -match '(?i)nekobyran\.lanzou|b00yawz2bg|LanzouMax\.apk|(?:password|passwd|密码)\s*[:=]') {
    throw '根发布页包含禁止公开的私有渠道信息。'
  }

  $origin = [regex]::Match($worker, "const ORIGIN = 'https://raw\.githubusercontent\.com/nekobyran/remote/(?<sha>[0-9a-f]{40})';")
  $header = [regex]::Match($worker, "X-NKBR-Origin-Commit', '(?<sha>[0-9a-f]{40})'")
  if (-not $origin.Success -or -not $header.Success -or $origin.Groups['sha'].Value -ne $header.Groups['sha'].Value) {
    throw 'Worker 静态源提交与响应标记不一致。'
  }
  if ($config -notmatch '"name"\s*:\s*"nkbr-release"' -or $config -notmatch '"pattern"\s*:\s*"nkbr\.cc/\*"') {
    throw 'Wrangler 项目或根域名路由不正确。'
  }

  foreach ($relative in $publicFiles) {
    if (-not (Test-Path -LiteralPath (Join-Path $project $relative) -PathType Leaf)) {
      throw "Worker 清单中的文件不存在：$relative"
    }
  }
  if (([regex]::Matches($index, '<li class="roadmap-item">')).Count -ne 8 -or $index -notmatch '(?s)<li class="roadmap-item">.*?<h3>Game Launcher</h3>.*?</li>\s*<li class="roadmap-item">.*?<h3>LanzouYOU</h3>.*?</li>\s*<li class="roadmap-item">.*?<h3>FLClash\+\+</h3>.*?</li>\s*<li class="roadmap-item">.*?<h3>CodexMax</h3>') {
    throw 'LanzouYOU、FLClash++ 与 CodexMax 必须依次位于 Game Launcher 之后的项目区，且原有项目不得丢失。'
  }
  $flClashItem = [regex]::Match($index, '(?s)<li class="roadmap-item">(?:(?!</li>).)*?<h3>FLClash\+\+</h3>(?:(?!</li>).)*?</li>')
  if (-not $flClashItem.Success -or $flClashItem.Value -match '<a\s') {
    throw 'FLClash++ 本地项目不得虚构下载或公开链接。'
  }
  $flClashIconPath = Join-Path $project 'flclash-plusplus-icon.png'
  $legacyFlClashIconPath = Join-Path $project 'flclash-plusplus-icon.svg'
  if (Test-Path -LiteralPath $legacyFlClashIconPath) {
    throw 'FLClash++ 原创占位 SVG 必须从发布源删除。'
  }
  if ($index -notmatch 'src="/flclash-plusplus-icon\.png"' -or -not (Test-Path -LiteralPath $flClashIconPath -PathType Leaf)) {
    throw 'FLClash++ 必须引用本地项目的真实 PNG 应用图标。'
  }
  $flClashIconHash = (Get-FileHash -LiteralPath $flClashIconPath -Algorithm SHA256).Hash
  if ($flClashIconHash -ne 'F3E0BCE43B212427D76A6B1ECA5B6B03C91DE2E166519318D4A1B88FBEB13806') {
    throw 'FLClash++ 图标不是已核验的本地 Android launcher 源图。'
  }
  $codexMaxItem = [regex]::Match($index, '(?s)<li class="roadmap-item">(?:(?!</li>).)*?<h3>CodexMax</h3>(?:(?!</li>).)*?</li>')
  if (-not $codexMaxItem.Success -or $codexMaxItem.Value -match '<a\s' -or $codexMaxItem.Value -notmatch '<span class="roadmap-status">开发中</span>') {
    throw 'CodexMax 必须以无虚构发布链接的开发中状态出现在路线图。'
  }
  $codexMaxIconPath = Join-Path $project 'codexmax-icon.png'
  if ($index -notmatch 'src="/codexmax-icon\.png"' -or -not (Test-Path -LiteralPath $codexMaxIconPath -PathType Leaf)) {
    throw 'CodexMax 必须引用本地项目的真实 PNG 应用图标。'
  }
  $codexMaxIconHash = (Get-FileHash -LiteralPath $codexMaxIconPath -Algorithm SHA256).Hash
  if ($codexMaxIconHash -ne '31693BAE821DBFA6A4B778CCA6C5B8A6ABB8FE801750448588493F8BE1362233') {
    throw 'CodexMax 图标不是已核验的本地应用图标。'
  }
  'validation=pass;main-releases=3;kacha=online;nahida-skin=online;roadmap=8;lanzouyou-after-gamelauncher=true;codexmax=development;flclashplusplus-local-only=true;private-assets=0;sponsor=local'
}

switch ($Action) {
  'Stage' { Invoke-Stage }
  'Validate' { Invoke-Validate }
  'Deploy' {
    Invoke-Stage
    Invoke-Validate
    $npmCache = 'D:\vibecoding\cache\npm'
    New-Item -ItemType Directory -Path $npmCache -Force | Out-Null
    $env:npm_config_cache = $npmCache
    $npx = (Get-Command 'npx.cmd' -ErrorAction Stop).Source
    $authProcess = Start-Process -FilePath $npx -ArgumentList @('--yes', 'wrangler@4.112.0', 'whoami') -NoNewWindow -Wait -PassThru
    if ($authProcess.ExitCode -ne 0) { throw 'Cloudflare Wrangler 未登录。' }
    $deployProcess = Start-Process -FilePath $npx -ArgumentList @('--yes', 'wrangler@4.112.0', 'deploy', '--config', $configPath) -NoNewWindow -Wait -PassThru
    if ($deployProcess.ExitCode -ne 0) { throw 'Cloudflare Worker 部署失败。' }
  }
}
