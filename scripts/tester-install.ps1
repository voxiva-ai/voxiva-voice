$ErrorActionPreference = "Stop"

# IMPORTANT: this script must work when executed via `irm ... | iex`.
# Some environments are picky about `param(...)` in that mode, so we avoid it.
# Optional overrides via env vars:
# - $env:VOXIVA_REPO (default: PavelCRG/Voxiva-Voice)
# - $env:VOXIVA_ASSET_PATTERN (default: *.exe; *.msi is still supported)
$Repo = if ($env:VOXIVA_REPO) { $env:VOXIVA_REPO } else { "PavelCRG/Voxiva-Voice" }
$AssetPattern = if ($env:VOXIVA_ASSET_PATTERN) { $env:VOXIVA_ASSET_PATTERN } else { "*.exe" }

function Get-LatestRelease {
  $url = "https://api.github.com/repos/$Repo/releases/latest"
  Invoke-RestMethod -Uri $url -Headers @{
    "User-Agent" = "VoxivaVoiceTester"
    "Accept"     = "application/vnd.github+json"
  }
}

function Find-VoxivaExe {
  $candidates = @(
    (Join-Path $env:ProgramFiles        "Voxiva Voice\Voxiva Voice.exe"),
    (Join-Path ${env:ProgramFiles(x86)} "Voxiva Voice\Voxiva Voice.exe"),
    (Join-Path $env:LOCALAPPDATA        "Programs\Voxiva Voice\Voxiva Voice.exe")
  ) | Where-Object { $_ -and (Test-Path $_) }

  if ($candidates.Count -gt 0) { return $candidates[0] }
  return $null
}

Write-Host ""
Write-Host "Voxiva Voice installer" -ForegroundColor Cyan
Write-Host "Repo: $Repo"
Write-Host ""

$rel = Get-LatestRelease
$asset = $rel.assets | Where-Object { $_.name -like $AssetPattern } | Select-Object -First 1
if (-not $asset -and $AssetPattern -ne "*.msi") {
  $asset = $rel.assets | Where-Object { $_.name -like "*.msi" } | Select-Object -First 1
}
if (-not $asset) { throw "No release asset matching '$AssetPattern' found in $Repo latest release." }

$tmp = Join-Path $env:TEMP $asset.name
Write-Host "Downloading: $($asset.name)"
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $tmp

Write-Host "Installing (silent)..."
$ext = [System.IO.Path]::GetExtension($tmp).ToLowerInvariant()
if ($ext -eq ".msi") {
  $p = Start-Process msiexec.exe -Wait -PassThru -ArgumentList @("/i", "`"$tmp`"", "/qn", "/norestart")
} else {
  $p = Start-Process -FilePath $tmp -Wait -PassThru -ArgumentList @("/S")
}
if ($p.ExitCode -ne 0) { throw "Installer failed (exit code: $($p.ExitCode)). Try running PowerShell as Administrator." }

Start-Sleep -Milliseconds 600

$exe = Find-VoxivaExe
if ($exe) {
  Write-Host "Launching: $exe"
  Start-Process -FilePath $exe
} else {
  Write-Host "Installed, but couldn't auto-detect exe location." -ForegroundColor Yellow
  Write-Host "Open it from Start Menu: Voxiva Voice" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done. Hotkey default: Ctrl+Shift+Space" -ForegroundColor Green
Write-Host "Tip: put cursor in a text field (caret blinking) before dictation." -ForegroundColor Green

