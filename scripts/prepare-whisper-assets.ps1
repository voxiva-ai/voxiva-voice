$ErrorActionPreference = "Stop"

# Prepares bundled Whisper assets for release builds:
# - Downloads whisper.cpp windows bundle (zip)
# - Extracts Release/ (exe + DLLs) into src-tauri/whisper/Release/
# - Downloads ggml-small-q5_1.bin into src-tauri/whisper/
#
# This is meant to run as part of `tauri build`, so end-users do NOT download anything.

$root = Split-Path -Parent $PSScriptRoot
$tauriDir = Join-Path $root "src-tauri"
$outDir = Join-Path $tauriDir "whisper"
$releaseDir = Join-Path $outDir "Release"

$tag = "v1.8.3"
$zipUrl = "https://github.com/ggml-org/whisper.cpp/releases/download/$tag/whisper-bin-x64.zip"
$modelUrl = "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small-q5_1.bin"

$zipPath = Join-Path $env:TEMP "whisper-bin-x64.zip"
$modelPath = Join-Path $outDir "ggml-small-q5_1.bin"
$exePath = Join-Path $releaseDir "whisper-cli.exe"

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

if (-not (Test-Path $exePath)) {
  Write-Host "Preparing bundled whisper-cli ($tag) ..."
  Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath

  $extractRoot = Join-Path $env:TEMP "voxiva-whisper-extract"
  if (Test-Path $extractRoot) { Remove-Item -Recurse -Force $extractRoot }
  New-Item -ItemType Directory -Force -Path $extractRoot | Out-Null
  Expand-Archive -Path $zipPath -DestinationPath $extractRoot -Force

  # Find the Release folder in the extracted tree
  $releaseSrc = Get-ChildItem -Path $extractRoot -Recurse -Directory -Filter "Release" |
    Where-Object { Test-Path (Join-Path $_.FullName "whisper-cli.exe") } |
    Select-Object -First 1

  if (-not $releaseSrc) { throw "Release folder with whisper-cli.exe not found in zip." }

  if (Test-Path $releaseDir) { Remove-Item -Recurse -Force $releaseDir }
  Copy-Item -Recurse -Force -Path (Join-Path $releaseSrc.FullName "*") -Destination $releaseDir
}

if (-not (Test-Path $modelPath)) {
  Write-Host "Preparing bundled model (ggml-small-q5_1.bin) ..."
  Invoke-WebRequest -Uri $modelUrl -OutFile $modelPath
}

Write-Host "Bundled Whisper assets ready."

