import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/frontend/setup.ts"],
    testTimeout: 30000,
    include: ["tests/frontend/**/*.test.ts", "tests/frontend/**/*.test.tsx"],
    coverage: {
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
      exclude: [
        ".next/**",
        "coverage/**",
        "dist-desktop/**",
        "htmlcov/**",
        "next.config.mjs",
        "scripts/**",
        "src/frontend/.next/**",
        "src/frontend/out/**",
      ],
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});
