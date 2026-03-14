import { spawn } from "node:child_process";
import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const binaryExtension = process.platform === "win32" ? ".exe" : "";
const binaryName = `plot-your-path-backend${binaryExtension}`;
const distBinaryPath = path.join(rootDir, "dist", binaryName);
const resourceDir = path.join(rootDir, "src-tauri", "resources");
const resourceBinaryPath = path.join(resourceDir, binaryName);

async function ensureCommandAvailable(command, installHint) {
  try {
    await runCommand("bash", ["-lc", `command -v ${command}`]);
  } catch {
    throw new Error(`${command} is required for desktop backend packaging. ${installHint}`);
  }
}

function runCommand(command, args, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: "1",
        ...extraEnv,
      },
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code ?? "unknown"}`));
    });
  });
}

if (process.platform === "linux") {
  await ensureCommandAvailable(
    "objdump",
    "Install the 'binutils' package before running 'pnpm desktop:prepare'.",
  );
}

await runCommand("uv", [
  "run",
  "python",
  "-m",
  "PyInstaller",
  "desktop-runtime.spec",
  "--noconfirm",
  "--clean",
]);
await mkdir(resourceDir, { recursive: true });
await rm(resourceBinaryPath, { force: true });
await cp(distBinaryPath, resourceBinaryPath);
