import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import process from "node:process";

const rootDir = process.cwd();
const mode = process.argv[2];
const require = createRequire(import.meta.url);

if (mode !== "dev" && mode !== "build") {
  throw new Error("Usage: node scripts/desktop-run-tauri.mjs <dev|build>");
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: "1",
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

async function ensureCommandAvailable(command, installHint) {
  try {
    await runCommand("bash", ["-lc", `command -v ${command}`]);
  } catch {
    throw new Error(`${command} is required for desktop ${mode} mode. ${installHint}`);
  }
}

function resolveTauriCliEntrypoint() {
  try {
    return require.resolve("@tauri-apps/cli/tauri.js");
  } catch {
    throw new Error(
      "@tauri-apps/cli is required for desktop workflows. Run 'pnpm install' to restore the Tauri CLI package.",
    );
  }
}

await ensureCommandAvailable(
  "cargo",
  "Install the Rust toolchain before running desktop workflows.",
);

if (mode === "build" && process.platform === "linux") {
  await ensureCommandAvailable(
    "objdump",
    "Install the 'binutils' package before running 'pnpm desktop:build'.",
  );
  await ensureCommandAvailable(
    "cc",
    "Install a system C toolchain (for example 'gcc' or the 'build-essential' package) before running 'pnpm desktop:build'.",
  );
}

await runCommand(process.execPath, [resolveTauriCliEntrypoint(), mode]);
