import { defineConfig } from "vitest/config";

// whisperly_lib supports both web and React Native
// Store tests use node environment (no DOM needed)
// Hook/manager tests use jsdom via @vitest-environment comment directives
export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["src/**/*.test.ts"],
    server: {
      deps: {
        inline: ["@sudobility/whisperly_client"],
      },
    },
  },
});
