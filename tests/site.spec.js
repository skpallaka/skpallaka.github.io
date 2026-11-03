// UI tests for the portfolio site. Run with: npm test
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('first screen shows role, school and contact buttons', async ({ page }) => {
  await expect(page).toHaveTitle(/Kushal Pallaka/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kushal Pallaka');

  const hero = page.locator('.hero');
  await expect(hero).toContainText('Software Engineer');
  await expect(hero).toContainText('UC Berkeley');

  // Recruiters should be able to reach out without scrolling
  await expect(hero.getByRole('link', { name: 'Email me' })).toBeInViewport();
  await expect(hero.getByRole('link', { name: 'LinkedIn' })).toBeInViewport();
});

test('every section the page promises actually exists', async ({ page }) => {
  for (const id of ['experience', 'projects', 'skills', 'education', 'contact']) {
    await expect(page.locator(`section#${id}`)).toBeAttached();
  }
});

test('in-page links all point at a real section', async ({ page }) => {
  const hrefs = await page.locator('a[href^="#"]').evaluateAll(links => links.map(a => a.getAttribute('href')));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) {
    await expect(page.locator(href), `${href} has no matching element`).toHaveCount(1);
  }
});

test('no placeholder or broken links', async ({ page }) => {
  const hrefs = await page.locator('a').evaluateAll(links => links.map(a => a.getAttribute('href')));
  for (const href of hrefs) {
    expect(href, 'empty or "#" link').not.toMatch(/^#?$/);
    expect(href).not.toContain('example.com');
  }
  await expect(page.locator('a[href^="mailto:"]').first()).toHaveAttribute('href', 'mailto:skushalpallaka@gmail.com');
});

test('project GitHub links point at my repos', async ({ page }) => {
  const repoLinks = page.locator('#projects a', { hasText: 'View on GitHub' });
  await expect(repoLinks).not.toHaveCount(0);
  for (const href of await repoLinks.evaluateAll(links => links.map(a => a.href))) {
    expect(href).toMatch(/^https:\/\/github\.com\/skpallaka\/[\w.-]+$/);
  }
});

test('results chart renders with all three bars', async ({ page }) => {
  const chart = page.locator('#projects figure.chart svg');
  await expect(chart).toBeVisible();
  await expect(chart.locator('g.bar')).toHaveCount(3);
});

test('nav link scrolls to its section', async ({ page, isMobile }) => {
  test.skip(isMobile, 'section links are hidden on phones by design');
  await page.locator('.nav').getByRole('link', { name: 'Projects' }).click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(page.locator('#projects h2')).toBeInViewport();
});

test('page never scrolls sideways', async ({ page }) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('phone nav shows only the name and Email button', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone-only layout');
  const nav = page.locator('.nav');
  await expect(nav.getByRole('link', { name: 'Kushal Pallaka' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Email me' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Projects' })).toBeHidden();
});

test('page loads without console errors', async ({ page }) => {
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  await page.reload();
  await page.waitForLoadState('load');
  expect(errors).toEqual([]);
});
