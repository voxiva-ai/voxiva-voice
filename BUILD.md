# Voxiva Voice — сборка Windows (.exe)

Приложение — **Tauri 2** + React. Установщик для Windows собирается как **NSIS** (`*-setup.exe`).

## Что нужно на машине

- [Node.js](https://nodejs.org/) LTS  
- [Rust](https://rustup.rs/) + toolchain `stable-x86_64-pc-windows-msvc`  
- **Visual Studio Build Tools** (C++ для Windows) — см. `scripts/install-windows-cpp-build-tools.ps1` при необходимости  
- [WebView2](https://developer.microsoft.com/microsoft-edge/webview2/) (обычно уже есть в Windows 10/11)

## Сборка одной командой (PowerShell)

```powershell
cd "Voxiva Voice"
powershell -ExecutionPolicy Bypass -File .\scripts\build-windows-release.ps1
```

Готовый файл ищи в:

`src-tauri\target\release\bundle\nsis\` — файл вида `Voxiva Voice_<version>_x64-setup.exe`.

## Положить установщик на сайт (Voxiva Web)

1. Скопируй `.exe` в папку сайта (стабильное имя для ссылок):

```powershell
cd "Voxiva Voice"
powershell -ExecutionPolicy Bypass -File .\scripts\copy-installer-to-web.ps1
```

Появится файл: `Voxiva Web/public/downloads/voxiva-voice-windows-setup.exe`.

2. На хостинге (например Vercel) задай переменную окружения **одним из способов**:

- `VOXIVA_VOICE_PUBLIC_INSTALLER_PATH=/downloads/voxiva-voice-windows-setup.exe`  
  тогда `GET /api/download/voxiva-voice/windows` отдаст редирект на твой домен + этот путь.

или

- `VOXIVA_VOICE_WINDOWS_INSTALLER_URL=https://<твой-домен>/downloads/voxiva-voice-windows-setup.exe`

3. Кнопки «Download» на сайте уже ведут на `/api/download/voxiva-voice/windows`.

## Локальная разработка

```powershell
npm install
npm run tauri:dev
```

Авто-проверка обновлений с GitHub **не запускается в debug-сборке**, чтобы не засорять логи при разработке.
