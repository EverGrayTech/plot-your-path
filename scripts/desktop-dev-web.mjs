import { spawn } from "node:child_process";
import process from "node:process";

const rootDir = process.cwd();
const children = [];
let shuttingDown = false;

function prefixOutput(prefix, stream) {
  if (!stream) {
    return;
  }

  stream.on("data", (chunk) => {
    const text = chunk.toString();
    for (const line of text.split(/\r?\n/)) {
      if (line.trim().length > 0) {
        console.log(`${prefix} ${line}`);
      }
    }
  });
}

function spawnManagedProcess(name, command, args, extraEnv = {}) {
  const child = spawn(command, args, {
    cwd: rootDir,
    env: {
      ...process.env,
      NEXT_PUBLIC_API_URL: "http://127.0.0.1:8765",
      NEXT_TELEMETRY_DISABLED: "1",
      PYTHONPATH: "src",
      PYP_DESKTOP_RUNTIME: "true",
      ...extraEnv,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  prefixOutput(`[${name}]`, child.stdout);
  prefixOutput(`[${name}]`, child.stderr);

  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    const reason = signal ? `signal ${signal}` : `exit code ${code ?? "unknown"}`;
    console.error(`[${name}] stopped unexpectedly with ${reason}`);
    shutdown(code ?? 1);
  });

  children.push(child);
  return child;
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => process.exit(exitCode), 250);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

spawnManagedProcess("backend", "uv", ["run", "python", "-m", "backend.desktop_runtime"]);
spawnManagedProcess("frontend", "pnpm", [
  "dev",
  "src/frontend",
  "--hostname",
  "127.0.0.1",
  "--port",
  "3000",
]);
