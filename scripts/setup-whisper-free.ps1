# Downloads free Whisper (whisper.cpp) CLI + a multilingual model for Voxiva Voice.
# Run in PowerShell (non-admin is fine).
#
# Usage:
#   cd "d:\voxiva.ai\Voxiva Voice"
#   .\scripts\setup-whisper-free.ps1
#
# Then set in the app Settings:
#   - sttMode: whisperCli
#   - whisperCliPath: <printed path>\whisper-cli.exe
#   - whisperModelPath: <printed path>\ggml-base.bin

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$tools = Join-Path $root "tools\whisper"
$binZip = Join-Path $tools "whisper-bin-x64.zip"
$binDir = Join-Path $tools "whisper-bin-x64"
$exe = Join-Path $binDir "Release\whisper-cli.exe"
$model = Join-Path $tools "ggml-base.bin"

New-Item -ItemType Directory -Force -Path $tools | Out-Null

# whisper.cpp release (CPU, x64)
$releaseTag = "v1.8.3"
$binUrl = "https://github.com/ggml-org/whisper.cpp/releases/download/$releaseTag/whisper-bin-x64.zip"

if (-not (Test-Path $exe)) {
  Write-Host "Downloading whisper.cpp CLI ($releaseTag) ..."
  Invoke-WebRequest -Uri $binUrl -OutFile $binZip
  if (Test-Path $binDir) { Remove-Item -Recurse -Force $binDir }
  Expand-Archive -Path $binZip -DestinationPath $binDir -Force
}

# model (multilingual base)
$modelUrl = "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin"
if (-not (Test-Path $model)) {
  Write-Host "Downloading model ggml-base.bin (142MB) ..."
  Invoke-WebRequest -Uri $modelUrl -OutFile $model
}

Write-Host ""
Write-Host "Done."
Write-Host "Set these in Voxiva Voice Settings:"
Write-Host ("  sttMode: whisperCli")
Write-Host ("  whisperCliPath: {0}" -f $exe)
Write-Host ("  whisperModelPath: {0}" -f $model)

