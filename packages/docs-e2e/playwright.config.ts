import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  maxFailures: process.env.CI ? 1 : 0,
  use: {
    baseURL: process.env.NEXT_PUBLIC_BOBR_DOCS_URL || "http://localhost:3001",
    trace: "on-first-retry",
  },
  webServer: {
    command: process.env.CI
      ? "cd ../../apps/docs && bun run start -- -p 3001"
      : "cd ../../apps/docs && bun run dev -- -p 3001",
    url: process.env.NEXT_PUBLIC_BOBR_DOCS_URL || "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
