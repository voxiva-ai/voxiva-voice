#Requires -Version 5.1
<#
  Build Voxiva Voice for Windows (NSIS installer .exe) via Tauri.
  Prerequisites: Node.js, Rust + MSVC (Visual Studio Build Tools), WebView2.

  Usage (from repo root or this folder):
    cd "Voxiva Voice"
    powershell -ExecutionPolicy Bypass -File .\scripts\build-windows-release.ps1
#>
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

Write-Host "==> npm ci / install" -ForegroundColor Cyan
if (Test-Path "package-lock.json") { npm ci } else { npm install }

Write-Host "==> Frontend build" -ForegroundColor Cyan
npm run build

Write-Host "==> Tauri bundle (Windows)" -ForegroundColor Cyan
npm run tauri:build

$nsisDir = Join-Path $root "src-tauri\target\release\bundle\nsis"
if (-not (Test-Path $nsisDir)) {
  Write-Warning "NSIS output folder not found: $nsisDir"
  exit 1
}

$exe = Get-ChildItem -Path $nsisDir -Filter "*setup*.exe" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $exe) {
  Write-Warning "No *setup*.exe under $nsisDir"
  exit 1
}

Write-Host ""
Write-Host "Built installer:" -ForegroundColor Green
Write-Host ("  " + $exe.FullName)
Write-Host ""
Write-Host "Optional: copy to the marketing site for static hosting:" -ForegroundColor Yellow
$webDownloads = Join-Path $root "..\Voxiva Web\public\downloads\voxiva-voice-windows-setup.exe"
Write-Host ("  powershell -File .\scripts\copy-installer-to-web.ps1")
Write-Host ("  -> " + $webDownloads)
