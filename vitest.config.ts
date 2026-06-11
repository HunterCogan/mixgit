import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // Make vitest globals (like `describe`, `it`, `expect`) available
    // in all test files without needing to import them.
    globals: true,
    // Run tests in a plain Node.js environment.
    // To test React components, change the environment by starting
    // the test file with // @vitest-environment jsdom.
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
