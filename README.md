## Voxiva Voice

Voxiva Voice — лёгкая программа для диктовки на **русском и английском**.

- Нажмите горячую клавишу и говорите
- Приложение вставит текст в активное окно (Блокнот, VS Code, браузер и т.д.)
- Работает оффлайн (Whisper через whisper.cpp)

### Установка (1 команда PowerShell)

Откройте PowerShell и вставьте:

```powershell
irm https://raw.githubusercontent.com/PavelCRG/Voxiva-Voice/main/scripts/tester-install.ps1 | iex
```

Если установка не проходит (ошибка прав) — запустите PowerShell **от имени администратора** и повторите.

Если вы тестируете форк/другой репозиторий, можно указать его так:

```powershell
$env:VOXIVA_REPO="owner/name"; irm https://raw.githubusercontent.com/PavelCRG/Voxiva-Voice/main/scripts/tester-install.ps1 | iex
```

### Как пользоваться

1) Откройте **Voxiva Voice** (меню Пуск)  
2) В **Settings** выберите:
   - язык (RU / EN / Auto)
   - горячую клавишу (preset или custom)
   - режим записи (Push‑to‑talk или Toggle)
3) Сверните окно приложения → появится мини‑HUD  
4) Откройте Блокнот / VS Code / браузер, поставьте курсор и диктуйте

### Функции

- Диктовка в любое приложение
- Мини‑HUD при свёрнутом окне
- Индикатор громкости в HUD
- Voice activation (без хоткея) — включается из трея: **Toggle voice activation**

---

<details>
<summary><strong>English version</strong></summary>

Voxiva Voice is a lightweight dictation app for **English + Russian**.

- Press a hotkey and speak
- Voxiva Voice inserts text into the active window (Notepad, VS Code, browser, etc.)
- Works offline (Whisper via whisper.cpp)

### Install (one PowerShell command)

Open PowerShell and paste:

```powershell
irm https://raw.githubusercontent.com/PavelCRG/Voxiva-Voice/main/scripts/tester-install.ps1 | iex
```

If install fails due to permissions, run PowerShell **as Administrator** and retry.

If you're testing a fork/another repo, you can override:

```powershell
$env:VOXIVA_REPO="owner/name"; irm https://raw.githubusercontent.com/PavelCRG/Voxiva-Voice/main/scripts/tester-install.ps1 | iex
```

### How to use

1) Open **Voxiva Voice** (Start menu)  
2) In **Settings** choose:
   - language (RU / EN / Auto)
   - hotkey (preset or custom)
   - recording mode (Push‑to‑talk or Toggle)
3) Minimize the app → the mini HUD appears  
4) Open any app, place the cursor and dictate

### Features

- Dictation into any app
- Mini HUD while the app is minimized
- Live mic level meter in the HUD
- Voice activation (no hotkey) — tray menu: **Toggle voice activation**

</details>

### License

MIT — see `LICENSE`.
