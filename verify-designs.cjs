const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://fonts.googleapis.com/**',route=>route.abort());
  await page.goto(pathToFileURL(path.resolve('builder.html')).href);
  await page.waitForSelector('#browse-templates');
  const source='data:image/png;base64,'+fs.readFileSync('assets/sample-portrait.png').toString('base64');
  await page.evaluate(async source=>{
   const image=new Image();image.src=source;await image.decode();const canvas=document.createElement('canvas');canvas.width=480;canvas.height=480;canvas.getContext('2d').drawImage(image,0,0,480,480);
   state.photo=canvas.toDataURL('image/jpeg',.85);state.showPhoto=true;
   state.projects=[{role:'Project marker',organization:'Independent',dates:'2025',description:'Project description'}];
   state.certifications=[{role:'Certification marker',organization:'Institute',dates:'2026',description:''}];
   state.achievements='Achievement marker';state.references='Reference marker';state.customTitle='Publications';state.customContent='Publication marker';renderFields();
  },source);
  const catalog=await page.evaluate(()=>window.FOLIO_TEMPLATES);
  const ids=catalog.map(template=>template.id);
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:1000});
   for(const id of ids){
    await page.locator(`[data-design=${id}]`).click();
    await page.evaluate(()=>document.fonts.ready);
    const text=await page.locator('#cv-preview').textContent();
    for(const marker of ['Alex Morgan','Project marker','Certification marker','Achievement marker','Reference marker','Publication marker','English, Sinhala'])assert(text.includes(marker),`${id} lost ${marker}`);
    assert.equal(await page.locator('#cv-preview .cv-photo').count(),1);
    assert(await page.locator('#cv-preview').evaluate(el=>el.scrollWidth<=el.clientWidth),`${id} CV overflow at ${width}`);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${id} page overflow at ${width}`);
    assert(await page.locator('#cv-preview').evaluate(el=>{const name=el.querySelector('.identity').getBoundingClientRect(),photo=el.querySelector('.portrait-wrap').getBoundingClientRect();return name.right<=photo.left+1||name.left>=photo.right-1||name.bottom<=photo.top+1||name.top>=photo.bottom-1;}),`${id} identity/photo overlap at ${width}`);
    if(catalog.find(template=>template.id===id).layout==='reference'&&width!==320)await page.locator('#cv-preview').screenshot({path:`studio-reference-${id}-${width}.png`});
   }
  }
  await page.setViewportSize({width:1440,height:1000});
  for(const id of ids){
   await page.locator(`[data-design=${id}]`).click();
   await page.locator('#custom-color').fill('#ffffff');
   assert(await page.locator('#cv-preview .cv-main h2').first().evaluate(el=>getComputedStyle(el).color!=='rgb(255, 255, 255)'),`${id} white accent hides headings`);
  }
  await page.locator('#browse-templates').click();
  assert.equal(await page.locator('.template-option').count(),catalog.length);
  await page.screenshot({path:'studio-template-browser.png'});
  await page.locator('[data-template-filter=student]').click();assert.equal(await page.locator('.template-option').count(),catalog.filter(template=>template.group==='student').length);
  await page.locator('#template-search').fill('nonexistent');assert(await page.locator('#template-no-results').isVisible());
  await page.locator('#template-search').fill('');await page.locator('[data-template-filter=creative]').click();assert.equal(await page.locator('.template-option').count(),catalog.filter(template=>template.group==='creative').length);
  await page.locator('[data-choose-template=atelier]').click();
  assert.equal(await page.locator('#template-dialog').isVisible(),false);
  assert.equal(await page.locator('[name=name]').inputValue(),'Alex Morgan');
  await page.reload();assert((await page.locator('#cv-preview').getAttribute('class')).includes('atelier'));
  assert.equal(await page.locator('#font').inputValue(),'template');
  await page.locator('#show-photo').uncheck();assert.equal(await page.locator('#cv-preview .cv-photo').count(),0);
  await page.locator('[name=name]').fill('Alexandra Catherine Morgan-Wickramasinghe');
  await page.setViewportSize({width:390,height:844});
  for(const id of ids){await page.locator(`[data-design=${id}]`).click();assert(await page.locator('#cv-preview').evaluate(el=>el.scrollWidth<=el.clientWidth),`${id} long name overflow`);}
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('[name=name]').fill('Alex Morgan');await page.locator('#show-photo').check();
  for(const template of catalog.filter(template=>template.layout==='reference')){
   await page.locator(`[data-design=${template.id}]`).click();
   await page.evaluate(()=>document.fonts.ready);
   if(template.id==='signature')assert(await page.evaluate(()=>document.fonts.check('65px "Folio Signature"')),'Signature font did not load');
   await page.emulateMedia({media:'print'});
   assert.equal(await page.locator('.creator-section').isVisible(),false);
   assert.equal(await page.locator('.editor').isVisible(),false);
   assert.equal(await page.locator('#cv-preview .cv-photo').isVisible(),true);
   const pdf=await page.pdf({format:'A4',printBackground:true});
   assert(pdf.subarray(0,5).toString()==='%PDF-'&&pdf.length>10000,`${template.id} failed PDF generation`);
   assert((await page.locator('#cv-preview').textContent()).includes('Publication marker'));
   await page.emulateMedia({media:'screen'});
  }
  await page.locator('[data-design=atelier]').click();
  await page.emulateMedia({media:'print'});
  await page.pdf({path:'cv-designer-sample.pdf',format:'A4',printBackground:true});
  assert.equal(await page.locator('.editor').isVisible(),false);
  assert.equal(await page.locator('#template-dialog').isVisible(),false);
  await page.emulateMedia({media:'screen'});
  await page.goto(pathToFileURL(path.resolve('index.html')).href+'#templates');
  await page.locator('#templates').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>[...document.querySelectorAll('.home-template img')].every(img=>img.complete&&img.naturalWidth>0));
  await page.screenshot({path:'home-designer-collection.png',fullPage:true});
  assert.equal(await page.locator('.home-template').count(),catalog.length);
  assert.deepEqual(errors,[]);
  console.log(`PASS: all ${catalog.length} layouts at 320/390/1440, content retention, portrait geometry, long names, template search/filter/select, persistence, thumbnails and PDF export.`);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
