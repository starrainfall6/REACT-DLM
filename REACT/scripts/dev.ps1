# dev.ps1 -- free the port then start the Vite dev server
# Usage (PowerShell):
#   .\scripts\dev.ps1            # default port 5173
#   .\scripts\dev.ps1 -Port 3000
#   npm run dev-safe
param(
  [int]$Port = 5173
)

$ErrorActionPreference = 'Stop'

# Resolve the project root (this script lives in <root>/scripts/dev.ps1)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Resolve-Path (Join-Path $ScriptDir '..')
Set-Location $Root
Write-Host ">> Project dir: $Root" -ForegroundColor Cyan

# [1/2] Kill any process occupying the port
Write-Host ">> [1/2] Freeing port $Port ..." -ForegroundColor Cyan
try {
  $pids = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
          Select-Object -ExpandProperty OwningProcess -Unique
  if ($pids) {
    foreach ($p in $pids) {
      $name = (Get-Process -Id $p -ErrorAction SilentlyContinue).ProcessName
      Write-Host "    killing PID=$p ($name) ..." -ForegroundColor Yellow
      Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 1
    $remain = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if (-not $remain) {
      Write-Host "    port $Port freed." -ForegroundColor Green
    } else {
      Write-Host "    WARNING: port $Port still occupied, will still try to start." -ForegroundColor Red
    }
  } else {
    Write-Host "    port $Port is free, nothing to kill." -ForegroundColor Green
  }
} catch {
  Write-Host "    port cleanup warning (ignorable): $_" -ForegroundColor Yellow
}

# [2/2] Start Vite via node directly (bypass the npm wrapper so the child can bind the port)
Write-Host ">> [2/2] Starting Vite dev server (port $Port)..." -ForegroundColor Cyan
# Locate node_modules/vite/bin/vite.js by walking up from $Root.
# node_modules may live in the repo root while this script sits under REACT/.
$viteJs = $null
$scan = $Root
while ($scan) {
  $cand = Join-Path $scan 'node_modules/vite/bin/vite.js'
  if (Test-Path $cand) { $viteJs = $cand; break }
  $parent = Split-Path -Parent $scan
  if ($parent -eq $scan) { break }
  $scan = $parent
}
if (-not $viteJs) {
  Write-Host "    ERROR: node_modules/vite/bin/vite.js not found. Run 'npm install' first." -ForegroundColor Red
  Read-Host "Press Enter to exit"
  exit 1
}
try {
  & node $viteJs dev --port $Port
} catch {
  Write-Host "    failed to start: $_" -ForegroundColor Red
  Read-Host "Press Enter to exit"
  exit 1
}
