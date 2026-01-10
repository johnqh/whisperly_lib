import { defineConfig } from "vitest/config";

// whisperly_lib supports both web and React Native
// Using node environment ensures tests don't rely on DOM APIs
export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
