<p align="center">
  <b>Voxiva Voice</b><br/>
  Local voice dictation for any app · Windows
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.ru.md">Русский</a>
</p>

<p align="center">
  <b>Beta v0.1.0</b> · Windows 10/11
</p>

---

## Download / Install

**Option A — one PowerShell command** (downloads the latest installer from GitHub Releases):

```powershell
irm https://raw.githubusercontent.com/voxiva-ai/voxiva-voice/main/scripts/tester-install.ps1 | iex
```

If install fails on permissions, open PowerShell **as Administrator** and run again.

**Option B — Releases page**

1. Open [Latest Release](https://github.com/voxiva-ai/voxiva-voice/releases/latest)
2. Download `Voxiva Voice_0.1.0_x64-setup.exe` (or the newest `*-setup.exe`)
3. Run the installer

**If GitHub is slow / blocked (often China)** — same installer script via jsDelivr:

```powershell
irm https://cdn.jsdelivr.net/gh/voxiva-ai/voxiva-voice@main/scripts/tester-install.ps1 | iex
```

### Update

Run the **same** install command again — it pulls the latest release and installs over the current app.

### Uninstall

Windows → **Settings → Apps → Installed apps → Voxiva Voice → Uninstall**.

---

## Start

1. Open **Voxiva Voice** (Start menu)
2. On first launch: watch the welcome animation → **Start**
3. In **Settings → Input**, pick a hotkey (default `Ctrl+Shift+Space`)
4. Minimize the app — a small icon stays on screen and pulses while you dictate
5. Click any text field, hold the hotkey, speak, release — text pastes into the focused app

| | |
|--|--|
| Hotkey | Settings → Input |
| Push-to-talk / Toggle | Settings → Input |
| Widget (icon / wave) | Settings → Appearance |
| Phone QR companion | Settings → Phone |
| Help (EN / RU / 中文) | Settings → Help |

---

## Tips

- Caret must be **blinking** in the target field.
- If the target app runs **as Administrator**, run Voice as Administrator too.
- Mic busy? Close Discord/Zoom or allow the mic in Windows Privacy settings.
- Paste fails? Try another **Paste method** in Settings → Input.

---

## Build from source

Stack: React + TypeScript (Vite) + Tauri 2 + Rust. See [`BUILD.md`](./BUILD.md) for the Windows NSIS installer.

```powershell
npm install
npm run dev
```

Requires [Rust](https://rustup.rs) and Node.js 20+.

---

## License

MIT — see `LICENSE`.
