# Voxiva Voice — tester installer script
#
# What this does:
# - Downloads the latest Windows .msi from GitHub Releases
# - Installs it silently
# - Launches Voxiva Voice
#
# Default repo is Voxiva-Voice. You can override:
#   .\tester-install.ps1 -Repo "owner/name"

$ErrorActionPreference = "Stop"

$Repo = "PavelCRG/Voxiva-Voice"
$AssetPattern = "*.msi"

param(
  [string]$Repo = "PavelCRG/Voxiva-Voice"
)

function Get-LatestRelease {
  $url = "https://api.github.com/repos/$Repo/releases/latest"
  Invoke-RestMethod -Uri $url -Headers @{ "User-Agent" = "VoxivaVoiceTester" }
}

$rel = Get-LatestRelease
$asset = $rel.assets | Where-Object { $_.name -like $AssetPattern } | Select-Object -First 1
if (-not $asset) {
  throw "No release asset matching '$AssetPattern' found in $Repo latest release."
}

$tmp = Join-Path $env:TEMP $asset.name
Write-Host "Downloading $($asset.name) ..."
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $tmp

Write-Host "Installing silently..."
Start-Process msiexec.exe -Wait -ArgumentList @("/i", "`"$tmp`"", "/qn", "/norestart")

Write-Host "Launching Voxiva Voice..."
Start-Process "Voxiva Voice"

