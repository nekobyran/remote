[CmdletBinding()]
param(
    [ValidateSet('Stage', 'Validate', 'DryRun', 'Deploy', 'Status')]
    [string]$Action = 'Validate'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)

$root = $PSScriptRoot
$stage = Join-Path $root '.stage'
$config = Join-Path $root 'wrangler.jsonc'
$siteUrl = 'https://nkbr.cc/'
$publicFiles = @(
    'index.html', 'styles.css', 'script.js', 'favicon.svg', 'robots.txt', 'sitemap.xml', 'site.webmanifest', '404.html',
    'home.json', 'gal.json', '7f29c60b70c948c298d130c4ccf1b8c8.txt', 'assets/sponsor.jpg',
    'android-simulator-icon.webp', 'codexmax-icon.png', 'easy-dream-skin-icon.png', 'flclash-plusplus-icon.png', 'game-launcher-icon.webp',
    'kacha-icon.webp', 'lanzou-plus-public-icon.svg', 'lanzouyou-icon.svg', 'nekostar-devtools-icon.webp',
    'nekostar-icon.webp', 'skill-creator-icon.webp'
)
$projectUrls = @(
    'https://blog.nkbr.cc/', 'https://nekostar.nkbr.cc/', 'https://nekostardevtools.nkbr.cc/',
    'https://androidsimulator.nkbr.cc/', 'https://skillcreator.nkbr.cc/', 'https://gamelauncher.nkbr.cc/',
    'https://lanzouplus.nkbr.cc/', 'https://lanzouyou.nkbr.cc/', 'https://flclashplus.nkbr.cc/',
    'https://codexmax.nkbr.cc/', 'https://kacha.nkbr.cc/',
    'https://github.com/nekobyran/easy-dream-skin/releases/tag/v1.5.5'
)

function Invoke-Stage {
    $expected = [IO.Path]::GetFullPath((Join-Path $root '.stage'))
    if ([IO.Path]::GetFullPath($stage) -ne $expected) { throw 'Unexpected stage path.' }
    if (Test-Path -LiteralPath $stage) { Remove-Item -LiteralPath $stage -Recurse -Force }
    foreach ($relative in $publicFiles) {
        $source = Join-Path $root $relative
        if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { throw "Missing public file: $relative" }
        $target = Join-Path $stage $relative
        New-Item -ItemType Directory -Force -Path (Split-Path -Parent $target) | Out-Null
        Copy-Item -LiteralPath $source -Destination $target -Force
    }
    Write-Output "stage=pass;files=$($publicFiles.Count);path=$stage"
}

function Invoke-Validate {
    $html = Get-Content -Raw -LiteralPath (Join-Path $root 'index.html') -Encoding utf8
    $css = Get-Content -Raw -LiteralPath (Join-Path $root 'styles.css') -Encoding utf8
    $js = Get-Content -Raw -LiteralPath (Join-Path $root 'script.js') -Encoding utf8
    $worker = Get-Content -Raw -LiteralPath (Join-Path $root 'worker.js') -Encoding utf8
    $wrangler = Get-Content -Raw -LiteralPath $config -Encoding utf8
    foreach ($url in $projectUrls) {
        if (-not $html.Contains($url, [StringComparison]::Ordinal)) { throw "Missing project URL: $url" }
    }
    foreach ($marker in @('motion-toggle', 'data-reveal', 'assets/sponsor.jpg', '12 个独立入口', 'project-meta', 'ROOT REPOSITORY', 'LICENSE NOT DECLARED', 'https://github.com/nekobyran/kacha', 'https://github.com/nekobyran/lanzouplus', 'https://codexmax.nkbr.cc/', 'https://github.com/nekobyran/easy-dream-skin', 'PUBLIC RELEASE · MIT')) {
        if (-not $html.Contains($marker, [StringComparison]::Ordinal)) { throw "Missing portal marker: $marker" }
    }
    foreach ($forbidden in @('PRIVATE PREVIEW', 'TEST BUILD', 'VERIFICATION STATUS', 'github.com/nekobyran/ScreenshotCat', 'codexmax.nkbr.cc/release/', 'lanzoumax')) {
        if ($html.Contains($forbidden, [StringComparison]::OrdinalIgnoreCase)) { throw "Portal contains forbidden internal or stale marker: $forbidden" }
    }
    foreach ($marker in @('prefers-reduced-motion', ':focus-visible', '@keyframes orbit')) {
        if (-not $css.Contains($marker, [StringComparison]::Ordinal)) { throw "Missing CSS safeguard: $marker" }
    }
    foreach ($marker in @('navigator.connection', 'saveData', 'visibilitychange', 'aria-pressed', 'IntersectionObserver', 'is-motion-off', 'reveal-enhanced')) {
        if (-not $js.Contains($marker, [StringComparison]::Ordinal)) { throw "Missing runtime safeguard: $marker" }
    }
    if ($js.Contains("body.classList.toggle('motion-off'", [StringComparison]::Ordinal)) {
        throw 'Motion state must not reuse the motion-off icon class on body.'
    }
    if ($css -match '(?<!reveal-enhanced )\[data-reveal\]\s*\{[^}]*opacity\s*:\s*0') {
        throw 'Reveal content must remain visible when JavaScript or IntersectionObserver is unavailable.'
    }
    if ($worker -match 'raw\.githubusercontent\.com|unsafe-inline|unsafe-eval') { throw 'Worker contains a forbidden remote origin or unsafe CSP.' }
    foreach ($marker in @('Strict-Transport-Security', 'X-Content-Type-Options', 'no-transform', 'GET', 'HEAD', 'env.ASSETS.fetch')) {
        if (-not $worker.Contains($marker, [StringComparison]::Ordinal)) { throw "Worker missing: $marker" }
    }
    if ($wrangler -notmatch '"pattern"\s*:\s*"nkbr\.cc/\*"' -or
        $wrangler -notmatch '"zone_name"\s*:\s*"nkbr\.cc"' -or
        $wrangler -notmatch '"directory"\s*:\s*"\.\/\.stage"') {
        throw 'Wrangler static assets zone-route configuration is invalid.'
    }
    foreach ($relative in $publicFiles) {
        if (-not (Test-Path -LiteralPath (Join-Path $root $relative) -PathType Leaf)) { throw "Missing public file: $relative" }
    }
    $easyDreamSkinIcon = Join-Path $root 'easy-dream-skin-icon.png'
    $easyDreamSkinIconHash = (Get-FileHash -LiteralPath $easyDreamSkinIcon -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($easyDreamSkinIconHash -ne '33cd74daeeadb8bfcbc14951cfa34b076316589ca4dc27712c89175c2ff17fcd') {
        throw "Easy Dream Skin icon hash mismatch: $easyDreamSkinIconHash"
    }
    $nodeCommand = Get-Command node -ErrorAction SilentlyContinue
    $node = if ($nodeCommand) { $nodeCommand.Source } else {
        @('C:\Program Files\nodejs\node.exe', 'D:\vibecoding\sdk\nodejs\node.exe', 'H:\vibecoding\sdk\nodejs\node.exe') |
            Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } |
            Select-Object -First 1
    }
    if (-not $node) { throw 'node.exe was not found.' }
    $scriptCheck = Start-Process -FilePath $node -ArgumentList @('--check', (Join-Path $root 'script.js')) -WorkingDirectory $root -WindowStyle Hidden -Wait -PassThru
    if ($scriptCheck.ExitCode -ne 0) { throw 'script.js syntax check failed.' }
    $workerCheck = Start-Process -FilePath $node -ArgumentList @('--check', (Join-Path $root 'worker.js')) -WorkingDirectory $root -WindowStyle Hidden -Wait -PassThru
    if ($workerCheck.ExitCode -ne 0) { throw 'worker.js syntax check failed.' }
    Write-Output 'validation=pass;projects=12;csp=strict;motion=adaptive;assets=local'
}

function Invoke-Wrangler {
    param([Parameter(Mandatory)][string[]]$Arguments)
    $drive = [IO.Path]::GetPathRoot($root)
    $cache = Join-Path $drive 'vibecoding\sdk\cache\npm'
    New-Item -ItemType Directory -Force -Path $cache | Out-Null
    $nodeCommand = Get-Command node -ErrorAction SilentlyContinue
    $node = if ($nodeCommand) { $nodeCommand.Source } else {
        @('C:\Program Files\nodejs\node.exe', 'D:\vibecoding\sdk\nodejs\node.exe', 'H:\vibecoding\sdk\nodejs\node.exe') |
            Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } |
            Select-Object -First 1
    }
    if (-not $node) { throw 'node.exe was not found.' }
    $wrangler = Get-ChildItem -Path (Join-Path $cache '_npx\*\node_modules\wrangler\bin\wrangler.js') -File -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTimeUtc -Descending |
        Select-Object -First 1
    if (-not $wrangler) { throw 'Wrangler 4 CLI is missing from the D: npm cache. Run npx --yes wrangler@4 --version once.' }
    $startInfo = [Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $node
    $startInfo.WorkingDirectory = $root
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $startInfo.Environment['npm_config_cache'] = $cache
    $startInfo.Environment['NO_UPDATE_NOTIFIER'] = '1'
    [void]$startInfo.ArgumentList.Add($wrangler.FullName)
    foreach ($argument in $Arguments) { [void]$startInfo.ArgumentList.Add($argument) }
    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    if (-not $process.Start()) { throw 'Unable to start Wrangler.' }
    $stdoutTask = $process.StandardOutput.ReadToEndAsync()
    $stderrTask = $process.StandardError.ReadToEndAsync()
    $process.WaitForExit()
    [void]$stdoutTask.GetAwaiter().GetResult()
    [void]$stderrTask.GetAwaiter().GetResult()
    $exitCode = $process.ExitCode
    $process.Dispose()
    if ($exitCode -ne 0) { throw "Wrangler stage failed: $($Arguments[0])" }
}

function Invoke-Status {
    $response = Invoke-WebRequest -Uri $siteUrl -TimeoutSec 30 -MaximumRedirection 4 -UseBasicParsing
    if ($response.StatusCode -ne 200 -or -not ([string]$response.Content).Contains('12 个独立入口')) { throw 'Production portal marker is missing.' }
    foreach ($header in @('Content-Security-Policy', 'Strict-Transport-Security', 'X-Content-Type-Options')) {
        if (-not $response.Headers[$header]) { throw "Missing production header: $header" }
    }
    if ([string]$response.Headers['Cache-Control'] -notmatch 'no-transform') { throw 'Production HTML is missing no-transform.' }
    Write-Output "status=pass;url=$siteUrl;http=200;projects=12;security=pass"
}

switch ($Action) {
    'Stage' { Invoke-Stage }
    'Validate' { Invoke-Validate }
    'DryRun' {
        Invoke-Stage
        Invoke-Validate
        Invoke-Wrangler @('whoami')
        Invoke-Wrangler @('deploy', '--config', $config, '--dry-run')
        Write-Output 'dry_run=pass'
    }
    'Deploy' {
        Invoke-Stage
        Invoke-Validate
        Invoke-Wrangler @('whoami')
        Invoke-Wrangler @('deploy', '--config', $config)
        Invoke-Status
        Write-Output 'deploy=pass'
    }
    'Status' { Invoke-Status }
}
