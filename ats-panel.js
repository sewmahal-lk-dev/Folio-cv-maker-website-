(() => {
 const panel=document.createElement('section');panel.className='ats-panel';panel.setAttribute('aria-labelledby','ats-heading');
 panel.innerHTML=`<h3 id="ats-heading">ATS readiness</h3><p>Prepare a clear CV for applicant tracking systems.</p><label class="ats-toggle"><input id="ats-mode" type="checkbox"> Use ATS layout</label><p class="ats-note">Single column, standard headings, and no portrait. Your design and photo are kept for when you switch back. Block positioning is paused in this layout.</p><ul id="ats-checks" aria-label="Formatting checks"></ul><label for="ats-keywords">Keywords from the job posting</label><textarea id="ats-keywords" rows="3" maxlength="4000" placeholder="e.g. Python, project management, SQL"></textarea><small>Separate terms with commas or new lines. Comparison uses visible CV content and ignores case; it does not recognize synonyms. Add only skills and experience you actually have.</small><div id="ats-matches" aria-live="polite"></div><details><summary>Review plain text</summary><pre id="ats-text"></pre></details><button id="ats-download" type="button">Download text (.txt)</button><p class="ats-note">These are local formatting checks, not an employer ATS score or a guarantee of acceptance. Follow the employer’s requested file format.</p><a href="https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse" target="_blank" rel="noopener noreferrer">Why resume formatting matters</a>`;
 document.querySelector('.canvas-tools-panel').after(panel);
 function update(){
  const text=atsVisibleText();const checks=[];
  const check=(ok,yes,no)=>checks.push({ok,label:ok?yes:no});
  check(state.atsMode===true,'Single-column ATS layout enabled.','Use ATS layout to simplify columns and graphics.');
  check(!!state.name.trim(),'Name is present.','Add your full name.');
  check(['email','phone'].some(key=>cvIncludes(state,key)&&state[key].trim()),'Contact information is included.','Include an email address or phone number.');
  const hasCareer=['experience','education','projects'].some(kind=>cvIncludes(state,kind)&&state[kind].some(e=>e.visible!==false&&e.role.trim()));
  check(hasCareer,'Experience, education, or projects are included.','Add experience, education, or a relevant project.');
  const undated=['experience','education'].some(kind=>cvIncludes(state,kind)&&state[kind].some(e=>e.visible!==false&&e.role.trim()&&!e.dates.trim()));
  check(!undated,'No missing dates in titled experience or education entries.','Add dates to your experience and education entries.');
  check(cvIncludes(state,'skills')&&!!state.skills.trim(),'Skills section is included.','Include relevant skills.');
  check(!window.canvasOverflow,'Content fits the selected page count.','Resolve the page overflow before exporting.');
  if(!state.atsMode&&Object.values(state.canvas?.blocks||{}).some(b=>b.x||b.y))checks.push({ok:false,label:'Manually moved blocks may affect reading order. Review plain text or use ATS layout.'});
  document.querySelector('#ats-mode').checked=state.atsMode===true;
  document.querySelector('#ats-checks').innerHTML=checks.map(c=>`<li class="${c.ok?'ats-pass':'ats-review'}">${c.ok?'✓':'Review:'} ${esc(c.label)}</li>`).join('');
  document.querySelector('#ats-text').textContent=text||'Add CV details to see the plain-text version.';
  const results=atsKeywordResults(document.querySelector('#ats-keywords').value,text);
  document.querySelector('#ats-matches').innerHTML=results.length?`<p>${results.filter(x=>x.found).length} of ${results.length} entered terms found</p>${results.map(x=>`<span class="ats-term ${x.found?'ats-pass':'ats-review'}">${esc(x.term)}: ${x.found?'found':'not found'}</span>`).join('')}`:'';
  document.querySelector('.block-tools').hidden=state.atsMode===true;
 }
 document.querySelector('#ats-mode').addEventListener('change',event=>{state.atsMode=event.target.checked;render();save();update();});
 document.querySelector('#ats-keywords').addEventListener('input',update);
 document.querySelector('#ats-download').onclick=()=>{const url=URL.createObjectURL(new Blob([atsVisibleText()],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='cv-plain-text.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 new MutationObserver(update).observe(preview,{childList:true});update();
})();
