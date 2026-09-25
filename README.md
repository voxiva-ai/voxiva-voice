<p align="center">
  <img
    src="src/assets/brand/voxiva-hero-banner.svg"
    width="100%"
    style="max-width: 1100px; height: auto;"
    alt="Voxiva Voice — Stop typing. Just speak."
  />
</p>

<p align="center">
  <a href="#ru">Русский</a> · <a href="#en">English</a>
</p>

## Voxiva Voice

<a id="ru"></a>
### Русский

Voxiva Voice — диктовка в любое приложение: Блокнот, VS Code, браузер и т.д.

### Установка (1 команда PowerShell)

Открой PowerShell и вставь:

```powershell
irm https://raw.githubusercontent.com/voxiva-ai/voxiva-voice/main/scripts/tester-install.ps1 | iex
```

Если установка не проходит (ошибка прав) — открой PowerShell **от имени администратора** и повтори команду.

### Сборка своего установщика (.exe)

Чтобы собрать **Windows NSIS** и положить файл на сайт **Voxiva Web** для скачивания, см. [`BUILD.md`](./BUILD.md) (скрипты `scripts/build-windows-release.ps1` и `scripts/copy-installer-to-web.ps1`).

### Обновление

Чтобы обновиться до последней версии, выполни **ту же самую команду** — она скачает установщик из **Latest Release** и установит поверх.

### Удаление

Удалить можно стандартно: Windows → **Параметры → Приложения → Установленные приложения → Voxiva Voice → Удалить**.

### Как пользоваться

1) Открой приложение **Voxiva Voice** (Пуск → Voxiva Voice)  
2) В **Settings** выбери горячую клавишу и язык (RU / EN / Auto)  
3) Сверни окно → появится мини‑HUD  
4) Открой любое приложение, поставь курсор (чтобы мигал) и диктуй

### Если не вставляется текст

- Убедись, что курсор **мигает** в поле ввода.
- Если целевая программа запущена **от администратора**, то Voxiva Voice тоже нужно запустить **от администратора**.

### Если микрофон “занят”

Закрой приложения, которые используют микрофон (Discord/Zoom) или включи доступ к микрофону в Windows:
Settings → Privacy & security → Microphone.

### Разработка (из исходников)

Стек как в **Voxiva Space**: React + TypeScript (Vite) + Tauri 2 + Rust.

```powershell
cd "D:\voxiva.ai\Voxiva Voice"
npm install
npm run dev
```

`npm run dev` открывает **окно приложения** (Tauri). Первая компиляция Rust может занять несколько минут.
Не открывай `http://localhost:1420` в браузере — это только dev-сервер для встроенного webview.

- `npm run dev:web` — только Vite (для Tauri)
- `npm run dev:kill` — освободить порт 1420
- `npm run tauri:build` — установщик для продакшена

Нужны [Rust](https://rustup.rs) и Node.js 20+.

---

<a id="en"></a>
### English

Voxiva Voice is a lightweight dictation app for any text field (Notepad, VS Code, browser, etc.).

### Install (one PowerShell command)

Open PowerShell and paste:

```powershell
irm https://raw.githubusercontent.com/voxiva-ai/voxiva-voice/main/scripts/tester-install.ps1 | iex
```

If install fails due to permissions, run PowerShell **as Administrator** and retry.

### Build your own Windows installer (.exe)

See [`BUILD.md`](./BUILD.md) for the NSIS build and copying the setup file into **Voxiva Web** (`public/downloads/`) for website downloads.

### Update

To update to the latest version, run the **same command** again — it downloads the installer from **Latest Release** and installs over the existing app.

### Uninstall

Use the standard Windows flow: **Settings → Apps → Installed apps → Voxiva Voice → Uninstall**.

### How to use

1) Open **Voxiva Voice** (Start → Voxiva Voice)  
2) In **Settings**, pick a hotkey and language (EN / RU / Auto)  
3) Minimize the app → the mini HUD appears  
4) Put the caret in any app and dictate

### If text is not inserted

- Make sure the caret is blinking in a text field.
- If the target app runs **as Administrator**, run Voxiva Voice **as Administrator** too.

### If the microphone is busy

Close apps using the mic (Discord/Zoom) or enable mic access in Windows Settings:
Settings → Privacy & security → Microphone.

### Development (from source)

Stack matches **Voxiva Space**: React + TypeScript (Vite) + Tauri 2 + Rust.

```powershell
cd "D:\voxiva.ai\Voxiva Voice"
npm install
npm run dev
```

`npm run dev` opens the **desktop window** (Tauri). First Rust compile can take a few minutes.
Do not open `http://localhost:1420` in a browser — that is only the embedded dev server.

- `npm run dev:web` — Vite only (used internally by Tauri)
- `npm run dev:kill` — free port 1420 if a stale dev session is stuck
- `npm run tauri:build` — production installer

Requires [Rust](https://rustup.rs) and Node.js 20+.

### License

MIT — see `LICENSE`.
