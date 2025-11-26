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
    baseURL: process.env.NEXT_PUBLIC_BOBR_WEB_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: process.env.CI
      ? "cd ../../apps/web && bun run start -- -p 3000"
      : "cd ../../apps/web && bun run dev -- -p 3000",
    url: process.env.NEXT_PUBLIC_BOBR_WEB_URL || "http://localhost:3000",
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
