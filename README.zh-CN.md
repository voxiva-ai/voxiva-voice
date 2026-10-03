<p align="center">
  <b>Voxiva Voice</b><br/>
  本地语音听写 · 适用于任意应用 · Windows
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

## 下载 / 安装

**方式 A — 一条 PowerShell 命令**（从 GitHub Releases 下载最新安装包）：

```powershell
irm https://raw.githubusercontent.com/voxiva-ai/voxiva-voice/main/scripts/tester-install.ps1 | iex
```

若权限不足，请以**管理员**身份打开 PowerShell 后重试。

**方式 B — Releases 页面**

1. 打开 [Latest Release](https://github.com/voxiva-ai/voxiva-voice/releases/latest)
2. 下载 `Voxiva Voice_0.1.0_x64-setup.exe`（或最新的 `*-setup.exe`）
3. 运行安装程序

**国内网络推荐（jsDelivr 镜像）** — 同一安装脚本：

```powershell
irm https://cdn.jsdelivr.net/gh/voxiva-ai/voxiva-voice@main/scripts/tester-install.ps1 | iex
```

也可直接打开 Releases 页下载 `.exe`。

### 更新

再次运行**同一条**安装命令即可覆盖更新到最新版。

### 卸载

Windows → **设置 → 应用 → 已安装的应用 → Voxiva Voice → 卸载**。

---

## 开始使用

1. 打开 **Voxiva Voice**（开始菜单）
2. 首次启动：欢迎动画 → 点 **Start / 开始**
3. 在 **设置 → 输入** 选择快捷键（默认 `Ctrl+Shift+Space`）
4. 最小化应用 — 屏幕上会保留小图标，听写时轻微闪动
5. 点击任意输入框，按住快捷键说话，松开 — 文字会粘贴到当前应用

| | |
|--|--|
| 快捷键 | 设置 → 输入 |
| 按住 / 开关模式 | 设置 → 输入 |
| 小组件（图标 / 波形） | 设置 → 外观 |
| 手机二维码 | 设置 → 手机 |
| 帮助（EN / RU / 中文） | 设置 → 帮助 |

---

## 提示

- 目标输入框里的光标需要**闪烁**。
- 若目标应用以**管理员**运行，Voice 也需以管理员运行。
- 麦克风被占用？关闭 Discord/Zoom，或在 Windows 隐私设置中允许麦克风。
- 无法粘贴？在 设置 → 输入 中更换**粘贴方式**。

---

## 从源码构建

技术栈：React + TypeScript (Vite) + Tauri 2 + Rust。Windows NSIS 安装包见 [`BUILD.md`](./BUILD.md)。

```powershell
npm install
npm run dev
```

需要 [Rust](https://rustup.rs) 与 Node.js 20+。

---

## 许可证

MIT — 见 `LICENSE`。
