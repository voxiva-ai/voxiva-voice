#Requires -RunAsAdministrator
<#
Installs Visual Studio Build Tools (18.x — в winget как «Visual Studio Build Tools 2026»)
с рабочей нагрузкой «Разработка классических приложений на C++» (MSVC + Windows SDK),
чтобы Rust с triple `x86_64-pc-windows-msvc` находил link.exe.

Запуск: ПКМ по PowerShell → «Запуск от имени администратора», затем:
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
  cd "d:\voxiva.ai\Voxiva Voice"
  .\scripts\install-windows-cpp-build-tools.ps1

Перед повтором при сбое: закройте «Visual Studio Installer», при необходимости перезагрузите ПК.
#>
$ErrorActionPreference = "Stop"

Write-Host "Установка Microsoft.VisualStudio.BuildTools (канал 18.x) + Workload VCTools..."
Write-Host "(это не пакет winget Microsoft.VisualStudio.2022.BuildTools — отдельный продукт 18.x)`n"

$override = "--wait --passive --norestart --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"

winget install -e --id Microsoft.VisualStudio.BuildTools `
  --accept-package-agreements `
  --accept-source-agreements `
  --override $override

if ($LASTEXITCODE -ne 0) {
  Write-Host "`nwinget завершился с кодом $LASTEXITCODE."
  Write-Host "Частые причины: не админ, занят установщик VS, нужна перезагрузка. См. логи в %TEMP% (dd_*)."
  exit $LASTEXITCODE
}

Write-Host "`nГотово. Закройте это окно, откройте новый обычный PowerShell и выполните:"
Write-Host '  cd "d:\voxiva.ai\Voxiva Voice"'
Write-Host "  npm run tauri dev"
