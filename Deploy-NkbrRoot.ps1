#requires -Version 7.0
[CmdletBinding()]
param(
  [ValidateSet('Stage','Validate','DryRun','Deploy','Status')][string]$Action='Validate',
  [string]$WranglerPath
)
$ErrorActionPreference='Stop'
$root=$PSScriptRoot
$env:WRANGLER_SEND_METRICS='false'
$env:XDG_CONFIG_HOME=Join-Path $env:APPDATA 'xdg.config'
if(-not $WranglerPath){
  $sdk=Join-Path ([IO.Path]::GetPathRoot($root)) 'vibecoding/sdk'
  $WranglerPath=Join-Path $sdk 'wrangler/4.149.0/node_modules/wrangler/bin/wrangler.js'
}
function Invoke-Node([string[]]$Arguments){
  & node @Arguments
  if($LASTEXITCODE -ne 0){throw "Node failed: $($Arguments[0])"}
}
function Build-Site {
  Invoke-Node @('command/sync-icons.mjs')
  Invoke-Node @('command/build.mjs')
}
function Test-Site { Invoke-Node @('--test','test/site.test.mjs') }
function Get-SiteStatus {
  $projects=Get-Content (Join-Path $root 'projects.json') -Raw | ConvertFrom-Json
  $urls=@('https://nkbr.cc/')+@($projects | ForEach-Object {"https://nkbr.cc/projects/$($_.id)/"})+@($projects | Where-Object host | ForEach-Object {"https://$($_.host)/"})
  foreach($url in $urls){
    $response=Invoke-WebRequest -Uri $url -Headers @{'Cache-Control'='no-cache'} -TimeoutSec 30
    if($response.StatusCode -ne 200 -or $response.Headers['X-NKBR-Design'] -ne 'mint-2026' -or $response.Content -notmatch 'data-design="mint-2026"'){throw "Site check failed: $url"}
    Write-Output "PASS $url"
  }
}
Push-Location $root
try {
  switch($Action){
    'Stage' {Build-Site}
    'Validate' {Build-Site; Test-Site}
    'DryRun' {
      Build-Site; Test-Site
      $auth=& node $WranglerPath whoami 2>&1
      if($LASTEXITCODE -ne 0){throw 'Cloudflare authentication is unavailable.'}
      Invoke-Node @($WranglerPath,'deploy','--config','wrangler.jsonc','--dry-run')
    }
    'Deploy' {
      Build-Site; Test-Site
      $auth=& node $WranglerPath whoami 2>&1
      if($LASTEXITCODE -ne 0){throw 'Cloudflare authentication is unavailable.'}
      Invoke-Node @($WranglerPath,'deploy','--config','wrangler.jsonc')
      Get-SiteStatus
    }
    'Status' {Get-SiteStatus}
  }
}finally{Pop-Location}
