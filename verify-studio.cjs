const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    await page.goto(pathToFileURL(path.resolve('builder.html')).href, { waitUntil: 'load' });
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    assert.equal(await page.locator('.app-heading h1').evaluate(el => getComputedStyle(el).color), 'rgb(236, 238, 240)');
    assert.equal(await page.locator('#creator-heading').evaluate(el => getComputedStyle(el).color), 'rgb(236, 238, 240)');
    assert.equal(await page.locator('#cv-preview').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)');
    await page.locator('#creator').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('.creator-photo').naturalWidth > 0);
    assert.equal(await page.locator('.creator-photo').getAttribute('src'), 'assets/owner.png');
    assert.equal(await page.locator('#creator-heading').textContent(), 'Sewmahal D.H.P');
    assert.equal(await page.locator('#cv-preview .creator-photo').count(), 0);
    assert.equal(await page.getByRole('link', { name: 'GitHub', exact: true }).getAttribute('href'), 'https://github.com/sewmahal-lk-dev');
    assert.equal(await page.getByRole('link', { name: 'LinkedIn', exact: true }).getAttribute('href'), 'https://www.linkedin.com/in/hirusha-pathum-sewmahal-a447923a5');
    await page.screenshot({ path: 'studio-dark-desktop.png', fullPage: true });
    await page.locator('#theme-toggle').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    await page.screenshot({ path: 'studio-light-desktop.png', fullPage: true });
    await page.locator('#theme-toggle').click();
    await page.locator('#reset').click();
    await page.locator('#confirm-reset').click();
    await page.waitForFunction(() => document.querySelector('#cv-progress').value === 0);
    await page.locator('#next-detail').click();
    assert(await page.locator('[name=name]').evaluate(el => document.activeElement === el));
    await page.locator('[name=name]').fill('Test Applicant');
    await page.waitForFunction(() => document.querySelector('#cv-progress').value === 1);
    await page.locator('[name=title]').fill('Software Engineering Intern');
    await page.locator('[name=email]').fill('test@example.com');
    await page.locator('[name=summary]').fill('A computer science student seeking an internship.');
    await page.locator('#purpose').selectOption('internship');
    await page.locator('#next-detail').click();
    assert(await page.locator('[data-panel=education]').isVisible());
    await page.locator('[data-kind=education][data-field=role]').fill('Computer Science');
    await page.locator('[data-kind=education][data-field=organization]').fill('University');
    await page.locator('#next-detail').click();
    await page.locator('[name=skills]').fill('JavaScript, Communication');
    await page.waitForFunction(() => document.querySelector('#cv-progress').value === 6);
    assert(await page.locator('#progress-complete').isVisible());
    assert.equal(await page.locator('#next-detail').isVisible(), false);
    const before = await page.locator('#cv-preview').innerHTML();
    await page.locator('#theme-toggle').click();
    assert.equal(await page.locator('#cv-preview').innerHTML(), before);
    await page.emulateMedia({ media: 'print' });
    assert.equal(await page.locator('.creator-section').isVisible(), false);
    assert.equal(await page.locator('.topbar').isVisible(), false);
    await page.emulateMedia({ media: 'screen' });
    await page.locator('#theme-toggle').click();
    for (const width of [320, 360, 390, 768, 1024]) {
      await page.setViewportSize({ width, height: 900 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}`);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: 'studio-dark-mobile.png', fullPage: true });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('html').evaluate(el => getComputedStyle(el).scrollBehavior), 'auto');
    const isolated = await browser.newContext();
    const second = await isolated.newPage();
    await second.route('https://fonts.googleapis.com/**', route => route.abort());
    await second.goto(pathToFileURL(path.resolve('builder.html')).href);
    assert.equal(await second.locator('[name=name]').inputValue(), 'Alex Morgan');
    assert.deepEqual(errors, []);
    console.log('PASS: owner image and social links, light/dark persistence, paper colors, progress navigation, print isolation, reduced motion, independent drafts, and responsive widths 320-1440.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
