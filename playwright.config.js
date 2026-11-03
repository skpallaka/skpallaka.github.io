// Playwright config: how and where the tests run.
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  // In CI, retry a failing test once to rule out flakiness, and never allow a stray test.only
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',

  use: {
    baseURL: 'http://localhost:8000',
    trace: 'on-first-retry',   // records a step-by-step trace when a test fails, for debugging
  },

  // Run every test twice: once as a desktop browser and once as a phone
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],

  // The site is plain HTML, so Python's built-in server is enough to serve it
  webServer: {
    command: 'python3 -m http.server 8000',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
    stderr: 'ignore',          // Python's server logs every request; hide that noise
  },
});
