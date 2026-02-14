import { defineConfig, devices } from "@playwright/test";

const platformProjectName = `chromium-${process.platform}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:3000",
    viewport: { width: 1366, height: 900 },
    deviceScaleFactor: 1,
    trace: "on-first-retry",
    video: "off",
  },
  projects: [
    {
      name: platformProjectName,
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: {
    command: "pnpm exec next start --hostname 127.0.0.1 --port 3000",
    url: "http://127.0.0.1:3000/no",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
