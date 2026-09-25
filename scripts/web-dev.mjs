import { spawn } from "node:child_process";
import { join } from "node:path";
import { ensurePortFree, pidsOnPort } from "./dev-port.mjs";

const PORT = 1420;

if (!(await ensurePortFree(PORT, { label: "web:dev" }))) {
  process.exit(1);
}

console.log("[web:dev] Vite for Tauri embed — use `npm run dev` for the desktop window.\n");

function startVite() {
  return spawn(process.execPath, [join(process.cwd(), "node_modules", "vite", "bin", "vite.js")], {
    stdio: "inherit",
  });
}

let vite = startVite();
process.exitCode = await new Promise((resolve) => {
  vite.on("exit", async (code) => {
    if (code === 0) {
      resolve(0);
      return;
    }
    if (pidsOnPort(PORT).length > 0) {
      if (await ensurePortFree(PORT, { label: "web:dev" })) {
        vite = startVite();
        vite.on("exit", (retryCode) => resolve(retryCode ?? 1));
        return;
      }
    }
    resolve(code ?? 1);
  });
});
