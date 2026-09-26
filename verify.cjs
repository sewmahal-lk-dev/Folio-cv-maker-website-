const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('dialog',dialog=>dialog.accept());
  await page.goto(pathToFileURL(path.resolve('builder.html')).href);
  await page.locator('input[name=name]').fill('Jamie Silva');
  await page.locator('#purpose').selectOption('internship');
  assert.equal(await page.locator('#cv-preview h1').textContent(),'Jamie Silva');
  assert.equal(await page.locator('#summary-label').textContent(),'Career objective');
  const png=await page.screenshot();
  await page.locator('#photo-input').setInputFiles({name:'portrait.png',mimeType:'image/png',buffer:png});
  await page.waitForFunction(() => !document.querySelector('#apply-photo').disabled);
  await page.locator('#apply-photo').click();
  await page.waitForSelector('.cv-photo');
  assert.equal(await page.locator('.cv-photo').evaluate(img=>img.naturalWidth),480);
  for(const template of ['modern','sidebar','creative','classic','minimal','academic']) {
    await page.locator(`[data-design=${template}]`).click();
    assert(await page.locator('#cv-preview').evaluate(el=>el.scrollWidth<=el.clientWidth));
  }
  await page.locator('[data-design=creative]').click();
  await page.locator('[data-color="#b54477"]').click();
  await page.locator('[data-tab=extras]').click();
  await page.locator('[data-add=projects]').click();
  await page.locator('[data-kind=projects][data-field=role]').fill('Internship portfolio');
  assert((await page.locator('#cv-preview').textContent()).includes('Internship portfolio'));
  await page.reload();
  assert.equal(await page.locator('#cv-preview h1').textContent(),'Jamie Silva');
  assert.equal(await page.locator('.cv-photo').count(),1);
  await page.locator('#show-photo').uncheck();
  assert.equal(await page.locator('.cv-photo').count(),0);
  await page.screenshot({path:'desktop-preview.png',fullPage:true});
  await page.emulateMedia({media:'print'});
  assert.equal(await page.locator('.editor').isVisible(),false);
  await page.pdf({path:'cv-sample.pdf',format:'A4',printBackground:true});
  await page.emulateMedia({media:'screen'});
  for(const width of [390,360,768]) {
    await page.setViewportSize({width,height:900});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${width}`);
  }
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'mobile-preview.png',fullPage:true});
  await page.locator('#reset').click();
  await page.locator('#confirm-reset').click();
  assert.equal(await page.locator('input[name=name]').inputValue(),'');
  assert.equal(await page.locator('.cv-photo').count(),0);
  assert.deepEqual(errors,[]);
  console.log('PASS: live editing, internship ordering, six templates, photo upload, persistence, projects, photo toggle, PDF, mobile overflow, and reset.');
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
