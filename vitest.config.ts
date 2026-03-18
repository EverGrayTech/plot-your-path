import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 30000,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    coverage: {
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      exclude: [
        ".next/**",
        "coverage/**",
        "dist-desktop/**",
        "htmlcov/**",
        "next.config.mjs",
        "scripts/**",
        "src/.next/**",
        "src/out/**",
      ],
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});
