## Voxiva Voice (RU)

Voxiva Voice — лёгкая программа для диктовки на **русском и английском**.

- Нажмите горячую клавишу (или включите “voice activation”) и говорите
- Приложение вставит текст в активное окно (Блокнот, VS Code, браузер и т.д.)
- Работает оффлайн (Whisper через whisper.cpp)

### Установка для тестеров (1 команда PowerShell)

Откройте **PowerShell от имени администратора** и вставьте:

```powershell
irm https://raw.githubusercontent.com/PavelCRG/Voxiva-Voice/main/scripts/tester-install.ps1 | iex
```

После установки:
- Откройте **Voxiva Voice** (через меню Пуск или командой `Start-Process "Voxiva Voice"`)
- В Settings выберите **язык** и **горячую клавишу**
- Сверните окно приложения → появится мини‑HUD
- Диктуйте в любое приложение

### Как собрать релиз (для автора)

```powershell
cd "d:\voxiva.ai\Voxiva Voice"
npm install
npm run tauri build
```

Инсталлятор появится в `src-tauri/target/release/bundle/` — его нужно загрузить в **GitHub Releases**.

---

## Voxiva Voice (EN)

Voxiva Voice is a lightweight dictation app for **English + Russian**.

- Press a hotkey (or enable voice activation) and speak
- Voxiva Voice inserts text into the active window (Notepad, VS Code, browser, etc.)
- Works offline (Whisper via whisper.cpp)

### Tester install (one PowerShell command)

Open **PowerShell as Administrator** and paste:

```powershell
irm https://raw.githubusercontent.com/PavelCRG/Voxiva-Voice/main/scripts/tester-install.ps1 | iex
```

After install:
- Open **Voxiva Voice** (Start menu or `Start-Process "Voxiva Voice"`)
- In Settings choose **language** and a **hotkey**
- Minimize the app → the mini HUD appears
- Dictate into any app

### Build a release (author)

```powershell
cd "d:\voxiva.ai\Voxiva Voice"
npm install
npm run tauri build
```

The installer will be in `src-tauri/target/release/bundle/` — upload it to **GitHub Releases**.

### Repo layout

| Path | Role |
|------|------|
| `src-tauri/src/lib.rs` | App entry: wires plugins + IPC only. |
| `src-tauri/src/commands/` | Tauri `invoke` handlers split by domain (`app`, `settings`, …). |
| `src-tauri/src/config/` | Typed settings + migrations. |
| `src-tauri/src/paths/` | Resolved paths (OS app config dir, etc.). |
| `src-tauri/src/error.rs` | Shared error types for the Rust core. |
| `src-tauri/src/logging.rs` | `tracing` bootstrap (filter via `RUST_LOG`). |
| `src-tauri/capabilities/` | Tauri 2 ACL — least privilege (`core:default` + `opener` for links). |
| `src/app/` | Frontend router composition. |
| `src/pages/` | Route-level screens. |
| `src/components/` | UI + layout + future HUD (`voice/`). |
| `src/lib/commands.ts` | Typed `invoke` wrappers for the UI. |
| `src/types/` | JSON contracts shared with Rust serde shapes. |

### Run from source (developer)

- [Node.js](https://nodejs.org/) 20+
- [Rust / rustup](https://rustup.rs/) — stable toolchain, MSVC build tools on Windows ([Tauri prerequisites](https://v2.tauri.app/start/prerequisites/))

Windows note: if you see **`link.exe` not found**, install Visual Studio Build Tools with C++ workload.

```powershell
cd "d:\voxiva.ai\Voxiva Voice"
npm install
npm run tauri dev
```

### Build an installer (for testers)

```powershell
npm run tauri build
```

Installers appear under `src-tauri/target/release/bundle/`.

### Tester flow (no dev setup)

Use GitHub Releases + the one‑command installer above.

## GitHub downloads (no website yet)

1. Maintainer publishes a **GitHub Release** and attaches the Windows `.msi` / `.exe` from `npm run tauri build`.
2. Testers open the repo → **Releases** → latest → download the installer linked in the release notes.
3. This README stays the single source of truth until `voxiva.ai` ships a landing page (button can later point at the same Release URL).

## Security notes

- Capabilities are explicit in `src-tauri/capabilities/default.json` — add new permissions only when a feature truly needs them.
- Settings are written with `serde_json` to the OS app config directory (`commands/settings.rs`), not to the repo.
- Avoid growing `lib.rs` with business logic — new domains get new modules under `commands/`, `services/` (future), etc.

## License

MIT — see `LICENSE` (add file when publishing the org repo).
