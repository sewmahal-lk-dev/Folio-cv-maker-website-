const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const fs=require('node:fs');

(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const pdfs=[];
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    page.on('dialog',dialog=>dialog.accept());
    await page.route('https://fonts.googleapis.com/**',route=>route.abort());
    await page.goto(pathToFileURL(path.resolve('builder.html')).href);
    await page.evaluate(()=>{
      state.name='Customization Test';state.title='PrivateTitle';state.email='private@example.com';state.phone='PrivatePhone';state.summary='PrivateSummary';
      state.experience=[{role:'PrivateJob',organization:'PrivateEmployer',dates:'2022',description:'PrivateDescription'},{role:'PublicJob',organization:'PublicEmployer',dates:'2026',description:'PublicDescription'}];
      state.education=[{role:'PrivateEducation',organization:'Institute',dates:'2020',description:''}];
      state.projects=[{role:'PublicProject',organization:'Portfolio',dates:'2026',description:'PublicProjectDescription'}];
      state.certifications=[{role:'PrivateCertificate',organization:'Institute',dates:'2020',description:''}];
      state.achievements='PrivateAchievement';state.interests='PublicInterest';state.references='PrivateReference';state.customTitle='PrivateHeading';state.customContent='PrivateCustom';
      renderFields();save();
    });
    const seeded=await page.evaluate(()=>clone(state));
    const options=await page.evaluate(()=>contentGroups.flatMap(group=>group.items.map(([key])=>key)));
    await page.locator('#customize-cv').click();
    for(const key of options){
      const checkbox=page.locator(`[data-cv-include=${key}]`);
      const selector=key==='photo'?'.portrait-wrap':key==='title'?'.job-title':['email','phone','location','website'].includes(key)?`[data-cv-field=${key}]`:`[data-cv-section=${key}]`;
      assert.equal(await page.locator(`#cv-preview ${selector}`).count(),1,`${key} missing before toggle`);
      await checkbox.uncheck();
      assert.equal(await page.locator(`#cv-preview ${selector}`).count(),0,`${key} still visible`);
      await checkbox.check();
      assert.equal(await page.locator(`#cv-preview ${selector}`).count(),1,`${key} not restored`);
    }
    for(const key of ['photo','title','email','phone','summary','education','certifications','achievements','references','custom'])await page.locator(`[data-cv-include=${key}]`).uncheck();
    await page.screenshot({path:'studio-customize-desktop.png'});
    await page.locator('#done-content').click();
    await page.locator('[data-tab=experience]').click();
    await page.locator('[data-kind=experience][data-index="0"][data-field=visible]').uncheck();
    assert(!(await page.locator('#cv-preview').textContent()).includes('PrivateJob'));
    assert.equal(await page.locator('[data-kind=experience][data-index="0"][data-field=role]').inputValue(),'PrivateJob');
    const saved=await page.evaluate(()=>clone(state));
    for(const key of ['email','phone','summary','customContent'])assert.equal(saved[key],seeded[key]);
    assert.equal(saved.experience[0].visible,false);
    await page.reload();
    assert.equal(await page.locator('#show-photo').isChecked(),false);
    assert.equal(await page.locator('#cv-preview .portrait-wrap').count(),0);
    const ids=await page.evaluate(()=>FOLIO_TEMPLATES.map(template=>template.id));
    for(const id of ids){
      await page.locator(`[data-design=${id}]`).click();
      const text=await page.locator('#cv-preview').textContent();
      for(const hidden of ['PrivateTitle','private@example.com','PrivatePhone','PrivateSummary','PrivateJob','PrivateEducation','PrivateCertificate','PrivateAchievement','PrivateReference','PrivateHeading','PrivateCustom'])assert(!text.includes(hidden),`${id} includes ${hidden}`);
      for(const visible of ['PublicJob','PublicProject','PublicInterest'])assert(text.includes(visible),`${id} lost ${visible}`);
      await page.evaluate(()=>document.fonts.ready);
      await page.emulateMedia({media:'print'});
      const file=`cv-a4-custom-${id}.pdf`;
      await page.pdf({path:file,format:'A4',preferCSSPageSize:true,printBackground:true});pdfs.push(file);
      await page.emulateMedia({media:'screen'});
    }
    const downloadEvent=page.waitForEvent('download');await page.locator('#backup').click();
    const download=await downloadEvent;
    const backup=fs.readFileSync(await download.path());
    const backedUp=JSON.parse(backup.toString());
    assert.equal(backedUp.email,'private@example.com');assert.equal(backedUp.visibility.email,false);assert.equal(backedUp.experience[0].visible,false);
    await page.locator('#customize-cv').click();await page.locator('#show-all-content').click();
    assert((await page.locator('#cv-preview').textContent()).includes('PrivateJob'));
    assert.equal(await page.locator('#cv-preview .portrait-wrap').count(),1);
    await page.locator('#close-content').click();
    await page.locator('#import-input').setInputFiles({name:'draft.json',mimeType:'application/json',buffer:backup});
    await page.waitForFunction(()=>document.querySelector('#draft-status').textContent==='Draft imported.');
    assert.equal(await page.evaluate(()=>state.visibility.email),false);assert.equal(await page.evaluate(()=>state.experience[0].visible),false);
    await page.locator('#purpose').selectOption('internship');
    assert.equal(await page.evaluate(()=>state.visibility.email),false);
    await page.locator('#load-example').click();
    assert.equal(await page.evaluate(()=>state.visibility.email),false);
    await page.evaluate(()=>{state=normalize({...defaults,visibility:{email:'false',phone:false,unknown:false},experience:[{role:'Legacy role'}]});renderFields();});
    assert.equal(await page.evaluate(()=>cvIncludes(state,'email')),true);
    assert.equal(await page.evaluate(()=>cvIncludes(state,'phone')),false);
    assert.equal(await page.evaluate(()=>Object.hasOwn(state.visibility,'unknown')),false);
    assert.equal(await page.evaluate(()=>state.experience[0].visible),true);
    for(const width of [1440,390,320]){
      await page.setViewportSize({width,height:900});
      await page.evaluate(()=>{state=clone(defaults);state.visibility=Object.fromEntries(visibilityKeys.map(key=>[key,false]));state.visibility.projects=true;state.showPhoto=false;state.projects=[{role:'OnlyProject',organization:'Portfolio',dates:'2026',description:'Project details'}];renderFields();});
      for(const id of ids){
        await page.evaluate(id=>selectTemplate(id),id);
        assert.equal(await page.locator('#cv-preview .cv-side').count(),0,`${id} empty sidebar remains`);
        assert.equal(await page.locator('#cv-preview .portrait-wrap').count(),0);
        assert.equal(await page.locator('#cv-preview .contact-strip').count(),0);
        assert(await page.locator('#cv-preview').evaluate(el=>el.scrollWidth<=el.clientWidth),`${id} content overflow at ${width}`);
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${id} page overflow at ${width}`);
        assert(await page.locator('#cv-preview').evaluate(el=>el.querySelector('.cv-main').getBoundingClientRect().width>el.getBoundingClientRect().width*.75),`${id} empty sidebar leaves a gap`);
      }
      await page.locator('#customize-cv').click();
      assert(await page.locator('#content-dialog').evaluate(el=>el.scrollWidth<=el.clientWidth));
      if(width===390)await page.screenshot({path:'studio-customize-mobile.png'});
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#content-dialog').isVisible(),false);
    }
    await page.evaluate(()=>{state.visibility.projects=false;state.name='';renderFields();});
    await page.waitForFunction(()=>document.querySelector('#cv-progress').max===1);
    assert.equal(await page.locator('#progress-count').textContent(),'0 / 1');
    await page.locator('[data-tab=details]').click();await page.locator('[name=name]').fill('Only Name');
    await page.waitForFunction(()=>document.querySelector('#progress-count').textContent==='1 / 1');
    await page.locator('#reset').click();await page.locator('#confirm-reset').click();
    assert.deepEqual(await page.evaluate(()=>state.visibility),{});
    assert.equal(await page.locator('#show-photo').isChecked(),true);
    assert.deepEqual(errors,[]);
  } finally {await browser.close();}
  const result=spawnSync('python',['verify-customization-pdf.py'],{input:JSON.stringify(pdfs),encoding:'utf8'});
  process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');
  assert.equal(result.status,0,'Hidden content leaked into a PDF');
  console.log('PASS: section and field controls, individual entries, preservation, import/export, legacy drafts, responsive layouts, progress, and all 16 PDF templates.');
})().catch(error=>{console.error(error);process.exitCode=1;});
