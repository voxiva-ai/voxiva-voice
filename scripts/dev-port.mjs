import { execSync } from "node:child_process";

/** PIDs listening on an exact TCP port (not :14220 when freeing :1420). */
export function pidsOnPort(port) {
  const want = String(port);

  if (process.platform === "win32") {
    try {
      const out = execSync("netstat -ano -p tcp", {
        stdio: ["ignore", "pipe", "ignore"],
      }).toString();
      const pids = new Set();
      for (const line of out.split(/\r?\n/)) {
        if (!line.includes("LISTENING")) continue;
        const portMatch = line.match(/:(\d+)\s+/);
        if (!portMatch || portMatch[1] !== want) continue;
        const pid = line.match(/\s(\d+)\s*$/);
        if (pid?.[1] && pid[1] !== "0") pids.add(pid[1]);
      }
      return [...pids];
    } catch {
      return [];
    }
  }

  try {
    const out = execSync(`lsof -nP -iTCP:${want} -sTCP:LISTEN -t`, {
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    return out.split(/\r?\n/).filter(Boolean);
  } catch {
    return [];
  }
}

export function killPid(pid) {
  if (!pid || pid === String(process.pid)) return false;
  try {
    execSync(process.platform === "win32" ? `taskkill /F /PID ${pid}` : `kill -9 ${pid}`, {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

export function killPort(port) {
  let killed = 0;
  for (const pid of pidsOnPort(port)) {
    if (killPid(pid)) {
      killed += 1;
      console.log(`[dev] freed port ${port} (killed pid ${pid})`);
    }
  }
  return killed;
}

export function killStaleVoxiva() {
  if (process.platform !== "win32") return;
  try {
    execSync("taskkill /F /IM voxiva-voice.exe", { stdio: "ignore" });
    console.log("[dev] stopped previous voxiva-voice.exe");
  } catch {
    // not running
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Kill orphans from a crashed dev session, then wait until the port is free. */
export async function ensurePortFree(port, { attempts = 16, delayMs = 300, label = "dev" } = {}) {
  killStaleVoxiva();
  killPort(port);

  for (let i = 0; i < attempts; i += 1) {
    if (pidsOnPort(port).length === 0) return true;
    killPort(port);
    await sleep(delayMs);
  }

  const left = pidsOnPort(port);
  console.error(
    `[${label}] Port ${port} is still in use (pid${left.length > 1 ? "s" : ""}: ${left.join(", ")}).`,
  );
  console.error(`[${label}] Close other Voxiva / Vite windows, or run: npm run dev:kill`);
  return false;
}
