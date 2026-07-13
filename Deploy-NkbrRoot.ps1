[CmdletBinding()]
param(
  [ValidateSet('Stage', 'Validate', 'Deploy')]
  [string]$Action = 'Validate',
  [string]$ProjectRoot = $PSScriptRoot
)

$ErrorActionPreference = 'Stop'
$project = (Resolve-Path -LiteralPath $ProjectRoot).Path
$workerPath = Join-Path $project 'worker.js'
$indexPath = Join-Path $project 'index.html'
$configPath = Join-Path $project 'wrangler.jsonc'
$stagePath = Join-Path $project '.stage'

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
    'LanzouMax',
    'LanzouYOU',
    'FLClash++',
    'https://lanzouplus.nkbr.cc/',
    'https://lanzoumax.nkbr.cc/',
    '<p>2 个软件</p>',
    '<p>8 个项目</p>',
    'Flutter + Rust',
    '接入免费节点能力的 FLClash 本地项目',
    '原生 Java',
    '<dt>版本</dt><dd>1.0.0</dd>'
  )
  foreach ($text in $required) {
    if (-not $index.Contains($text)) { throw "根发布页缺少要求内容：$text" }
  }

  if (([regex]::Matches($index, '<article class="release-card">')).Count -ne 2) {
    throw '主发布区必须精确展示 LanzouPlus 与 LanzouMax。'
  }
  if (([regex]::Matches($index, '<dt>版本</dt><dd>1\.0\.0</dd>')).Count -ne 2) {
    throw '两个已发布项目都必须显示版本 1.0.0。'
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

  foreach ($relative in Get-PublicFiles) {
    if (-not (Test-Path -LiteralPath (Join-Path $project $relative) -PathType Leaf)) {
      throw "Worker 清单中的文件不存在：$relative"
    }
  }
  if (([regex]::Matches($index, '<li class="roadmap-item">')).Count -ne 8 -or $index -notmatch '(?s)<li class="roadmap-item">.*?<h3>Game Launcher</h3>.*?</li>\s*<li class="roadmap-item">.*?<h3>LanzouYOU</h3>.*?</li>\s*<li class="roadmap-item">.*?<h3>FLClash\+\+</h3>') {
    throw 'LanzouYOU 与 FLClash++ 必须位于 Game Launcher 之后的项目区，且原有项目不得丢失。'
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
  'validation=pass;main-releases=2;roadmap=8;lanzouyou-after-gamelauncher=true;flclashplusplus-local-only=true;private-assets=0'
}

switch ($Action) {
  'Stage' { Invoke-Stage }
  'Validate' { Invoke-Validate }
  'Deploy' {
    Invoke-Stage
    Invoke-Validate
    $npx = (Get-Command 'npx.cmd' -ErrorAction Stop).Source
    & $npx --yes wrangler@4.110.0 whoami *> $null
    if ($LASTEXITCODE -ne 0) { throw 'Cloudflare Wrangler 未登录。' }
    & $npx --yes wrangler@4.110.0 deploy --config $configPath
    if ($LASTEXITCODE -ne 0) { throw 'Cloudflare Worker 部署失败。' }
  }
}
