# Free the process occupying the given port (Windows native, default 5173)
# Usage:
#   In PowerShell:  .\scripts\clean-port.ps1 [-Port 5173]
#   Double-click / right-click "Run with PowerShell" also works
param(
  [int]$Port = 5173
)
$ErrorActionPreference = 'Stop'
Write-Host ">> Looking for processes on port $Port ..." -ForegroundColor Cyan

$pids = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique

if (-not $pids) {
  Write-Host "Port $Port is free." -ForegroundColor Green
  exit 0
}

foreach ($p in $pids) {
  $name = (Get-Process -Id $p -ErrorAction SilentlyContinue).ProcessName
  Write-Host "Killing PID=$p ($name) ..." -ForegroundColor Yellow
  Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 1

$remain = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
if (-not $remain) {
  Write-Host "Port $Port freed." -ForegroundColor Green
} else {
  Write-Host "WARNING: port $Port still occupied, please check manually." -ForegroundColor Red
  exit 1
}
