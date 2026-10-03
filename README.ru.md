<p align="center">
  <b>Voxiva Voice</b><br/>
  Локальная голосовая диктовка в любое приложение · Windows
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

## Скачать / Установка

**Вариант A — одна команда PowerShell** (скачает установщик из GitHub Releases):

```powershell
irm https://raw.githubusercontent.com/voxiva-ai/voxiva-voice/main/scripts/tester-install.ps1 | iex
```

Если не хватает прав — открой PowerShell **от имени администратора** и повтори.

**Вариант B — страница Releases**

1. Открой [Latest Release](https://github.com/voxiva-ai/voxiva-voice/releases/latest)
2. Скачай `Voxiva Voice_0.1.0_x64-setup.exe` (или свежий `*-setup.exe`)
3. Запусти установщик

**Если GitHub тормозит / недоступен** — тот же скрипт через jsDelivr:

```powershell
irm https://cdn.jsdelivr.net/gh/voxiva-ai/voxiva-voice@main/scripts/tester-install.ps1 | iex
```

### Обновление

Снова выполни **ту же** команду установки — подтянется последний релиз.

### Удаление

Windows → **Параметры → Приложения → Установленные приложения → Voxiva Voice → Удалить**.

---

## Запуск

1. Открой **Voxiva Voice** (меню Пуск)
2. Первый запуск: анимация → **Старт**
3. В **Настройки → Ввод** выбери хоткей (по умолчанию `Ctrl+Shift+Space`)
4. Сверни окно — маленькая иконка останется на экране и будет пульсировать при диктовке
5. Кликни поле ввода, удержи хоткей, говори, отпусти — текст вставится в активное приложение

| | |
|--|--|
| Хоткей | Настройки → Ввод |
| Удерживать / Вкл-выкл | Настройки → Ввод |
| Виджет (иконка / волна) | Настройки → Внешний вид |
| Телефон (QR) | Настройки → Телефон |
| Справка (EN / RU / 中文) | Настройки → Справка |

---

## Подсказки

- Курсор должен **мигать** в поле ввода.
- Если целевое приложение запущено **от администратора**, Voice тоже запускай от администратора.
- Микрофон занят? Закрой Discord/Zoom или разреши доступ в параметрах Windows.
- Текст не вставляется? Смени **способ вставки** в Настройки → Ввод.

---

## Сборка из исходников

Стек: React + TypeScript (Vite) + Tauri 2 + Rust. Установщик NSIS — в [`BUILD.md`](./BUILD.md).

```powershell
npm install
npm run dev
```

Нужны [Rust](https://rustup.rs) и Node.js 20+.

---

## Лицензия

MIT — см. `LICENSE`.
