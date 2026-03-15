import { spawn } from "node:child_process";
import { cp, rm, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const outputCandidates = [path.join(rootDir, "out"), path.join(rootDir, "src", "frontend", "out")];
const desktopDistDir = path.join(rootDir, "dist-desktop");

function runCommand(command, args, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      env: {
        ...process.env,
        PYP_STATIC_EXPORT: "true",
        NEXT_PUBLIC_API_URL: "http://127.0.0.1:8765",
        NEXT_TELEMETRY_DISABLED: "1",
        ...extraEnv,
      },
      shell: process.platform === "win32",      
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

async function resolveOutputDir() {
  for (const candidate of outputCandidates) {
    try {
      const details = await stat(candidate);
      if (details.isDirectory()) {
        return candidate;
      }
    } catch {
      // Continue until a build output is found.
    }
  }

  throw new Error("Unable to locate Next.js export output after desktop build.");
}

for (const outputDir of [...outputCandidates, desktopDistDir]) {
  await rm(outputDir, { force: true, recursive: true });
}

await runCommand(process.platform === "win32" ? "pnpm.cmd" : "pnpm", ["exec", "next", "build", "src/frontend"]);

const outputDir = await resolveOutputDir();
await cp(outputDir, desktopDistDir, { recursive: true });
