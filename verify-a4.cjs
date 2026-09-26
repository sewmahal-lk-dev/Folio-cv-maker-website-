const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const fs=require('node:fs');

(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const files=[];
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1100}});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('dialog',dialog=>dialog.accept());
    await page.route('https://fonts.googleapis.com/**',route=>route.abort());
    await page.goto(pathToFileURL(path.resolve('builder.html')).href);
    await page.locator('#purpose').selectOption('internship');
    await page.locator('#load-example').click();
    const photo='data:image/png;base64,'+fs.readFileSync('assets/sample-portrait.png').toString('base64');
    await page.evaluate(async source=>{
      const image=new Image();image.src=source;await image.decode();
      const canvas=document.createElement('canvas');canvas.width=480;canvas.height=480;
      canvas.getContext('2d').drawImage(image,0,0,480,480);
      state.photo=canvas.toDataURL('image/jpeg',.85);render();
    },photo);
    const title=await page.title();
    await page.evaluate(()=>{window.print=()=>{window.printCheck={title:document.title,fonts:document.fonts.status,photoReady:[...preview.querySelectorAll('img')].every(image=>image.complete&&image.naturalWidth>0)};};});
    await page.locator('#export').click();
    await page.waitForFunction(()=>window.printCheck&&!document.querySelector('#export').disabled);
    assert.deepEqual(await page.evaluate(()=>window.printCheck),{title:'Alex Morgan - CV',fonts:'loaded',photoReady:true});
    assert.equal(await page.title(),title);
    const ids=await page.evaluate(()=>FOLIO_TEMPLATES.map(template=>template.id));
    for(const width of [1440,390]){
      await page.setViewportSize({width,height:1100});
      for(const id of ids){
        await page.evaluate(id=>selectTemplate(id),id);
        await page.evaluate(()=>document.fonts.ready);
        await page.emulateMedia({media:'print'});
        const box=await page.locator('#cv-preview').boundingBox();
        assert(Math.abs(box.width-793.7)<1,`${id}: incorrect A4 width ${box.width}`);
        assert(box.height>=1122&&box.height<1124,`${id}: short CV height ${box.height}`);
        if(['timeline','slate','harbor','signature','sage','contrast','sidebar','portfolio'].includes(id)){
          const side=await page.locator('#cv-preview .cv-side').boundingBox();
          assert(Math.abs(side.y+side.height-box.y-box.height)<1,`${id}: sidebar stops above the page bottom`);
        }
        const file=`cv-a4-${id}-${width}.pdf`;
        await page.pdf({path:file,format:'A4',preferCSSPageSize:true,printBackground:true,displayHeaderFooter:true});
        files.push(file);
        await page.emulateMedia({media:'screen'});
      }
    }
    await page.setViewportSize({width:1440,height:1100});
    for(const id of ['timeline','signature','sidebar','minimal']){
      await page.evaluate(id=>{
        selectTemplate(id);
        state.experience=Array.from({length:14},(_,index)=>({role:`Experience marker ${index+1}`,organization:'Example organization',dates:'2020 - 2026',description:'Built accessible applications and collaborated with a multidisciplinary team. Delivered reliable software and documented project outcomes.'}));
        state.customTitle='Additional details';state.customContent='Final content marker';render();
      },id);
      await page.evaluate(()=>document.fonts.ready);
      await page.emulateMedia({media:'print'});
      const file=`cv-a4-${id}-long.pdf`;
      await page.pdf({path:file,format:'A4',preferCSSPageSize:true,printBackground:true});
      files.push(file);
      await page.emulateMedia({media:'screen'});
    }
    assert.deepEqual(errors,[]);
  } finally {
    await browser.close();
  }
  const checked=spawnSync('python',['verify-pdf.py',...files],{encoding:'utf8'});
  process.stdout.write(checked.stdout||'');
  process.stderr.write(checked.stderr||'');
  assert.equal(checked.status,0,'PDF geometry, rendering, or content verification failed');
})().catch(error=>{console.error(error);process.exitCode=1;});
