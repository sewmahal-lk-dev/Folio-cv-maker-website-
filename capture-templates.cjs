const { chromium } = require('playwright');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const fs = require('node:fs');
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1200}});
    await page.route('https://fonts.googleapis.com/**',route=>route.abort());
    await page.goto(pathToFileURL(path.resolve('builder.html')).href);

    const photo='data:image/png;base64,'+fs.readFileSync('assets/sample-portrait.png').toString('base64');
    await page.evaluate(photo=>{state.photo=photo;state.showPhoto=true;state.fontSize=10.5;state.spacing=1.55;state.summary='Product designer creating thoughtful digital experiences. I bring together research, strategy, and visual craft to help ambitious teams build products people love.';state.experience[0].description='Led design for a platform serving 20,000+ customers.\nBuilt a design system that reduced delivery time by 30%.';renderFields();},photo);
    await page.evaluate(()=>{
      state.experience.push({role:'Junior Designer',organization:'Frame Creative',dates:'2018 - 2019',description:'Created brand identities and responsive websites for early-stage businesses.'});
      state.references='Taylor James | Design Director\nContact details available on request.';
      renderFields();
    });
    const designs=await page.evaluate(()=>window.FOLIO_TEMPLATES.map(template=>template.id));
    const selected=process.argv.includes('--refined')?designs.filter(id=>/^(chronicle|mariner|apprentice|byline)-/.test(id)):process.argv.includes('--missing')?designs.filter(id=>!fs.existsSync(`assets/template-${id}.png`)):designs;
    for(const design of selected) {
      await page.evaluate(id=>selectTemplate(id),design);
      await page.evaluate(()=>document.fonts.ready);
      await page.locator('.a4-sheet').first().screenshot({path:`assets/template-${design}.png`});
    }
    console.log(`Captured ${selected.length} full-page CV previews with a fictional sample portrait.`);
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
