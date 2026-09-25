import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { delimiter, join } from "node:path";
import { ensurePortFree } from "./dev-port.mjs";

const DEV_PORT = 1420;

const cargoBin = join(homedir(), ".cargo", "bin");
const cargoExe = join(cargoBin, process.platform === "win32" ? "cargo.exe" : "cargo");
const projectTarget = join(process.cwd(), "src-tauri", "target");
const path = process.env.PATH || "";
const env = {
  ...process.env,
  CARGO_TARGET_DIR: process.env.CARGO_TARGET_DIR || projectTarget,
  PATH: existsSync(cargoBin) && !path.split(delimiter).includes(cargoBin)
    ? `${cargoBin}${delimiter}${path}`
    : path,
};

if (!existsSync(cargoExe)) {
  console.error(
    "\n[dev] Rust/Cargo not found. Install from https://rustup.rs then restart the terminal.\n",
  );
  process.exit(1);
}

if (!(await ensurePortFree(DEV_PORT, { label: "dev" }))) {
  process.exit(1);
}

console.log("[dev] Starting Voxiva Voice desktop app (Tauri)…");
console.log("[dev] First compile can take a few minutes. Do not open localhost:1420 in a browser.\n");

const child = spawn(
  process.execPath,
  [join(process.cwd(), "node_modules", "@tauri-apps", "cli", "tauri.js"), "dev"],
  { stdio: "inherit", env, shell: false },
);

child.on("exit", (code, signal) => {
  if (signal) process.exit(1);
  process.exit(code ?? 1);
});

child.on("error", (err) => {
  console.error("[dev] Failed to start Tauri:", err.message);
  process.exit(1);
});
