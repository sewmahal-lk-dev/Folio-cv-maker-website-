const key='folio-cv-v1';
const collections=['experience','education','projects','certifications'];
const fields=['name','title','email','phone','location','website','summary','skills','languages','achievements','interests','references','customTitle','customContent'];
const contentGroups=[
  {label:'Personal details',items:[['photo','Profile photo'],['title','Professional title'],['email','Email address'],['phone','Phone number'],['location','Location'],['website','Website / LinkedIn']]},
  {label:'Sections',items:[['summary','Profile / Career objective'],['experience','Work experience'],['education','Education'],['projects','Projects'],['skills','Skills'],['languages','Languages'],['certifications','Certifications'],['achievements','Achievements'],['interests','Interests'],['references','References'],['custom','Additional section']]}
];
const visibilityKeys=contentGroups.flatMap(group=>group.items.map(([key])=>key)).filter(key=>key!=='photo');
const templates=window.FOLIO_TEMPLATES.map(template=>[template.id,template.name]);
const defaults={name:'Alex Morgan',title:'Product Designer',email:'alex.morgan@email.com',phone:'+94 77 123 4567',location:'Colombo, Sri Lanka',website:'alexmorgan.design',summary:'Curious product designer turning complex problems into thoughtful, accessible digital experiences. I combine research, visual craft, and collaboration to create products people love.',skills:'Product design, User research, Figma, Prototyping, Design systems',languages:'English, Sinhala',achievements:'',interests:'',references:'',customTitle:'',customContent:'',experience:[{role:'Senior Product Designer',organization:'Studio North',dates:'2022 - Present',description:'Led product design for a platform serving 20,000+ customers.\nBuilt a design system that reduced delivery time by 30%.\nPartnered with engineers to deliver accessible digital experiences.'},{role:'Product Designer',organization:'Forma Digital',dates:'2019 - 2022',description:'Designed web and mobile experiences across fintech and education.\nLed user interviews and usability testing to guide product decisions.'}],education:[{role:'BA (Hons) in Interaction Design',organization:'University of Moratuwa',dates:'2015 - 2019',description:'First Class Honours'}],projects:[],certifications:[],design:'modern',color:'#167d8d',purpose:'professional',font:'sans',fontSize:11,spacing:1.6,photo:'',showPhoto:true};
Object.assign(defaults, {photoSource:'', photoEdits:null, font:'template',design:'timeline',color:'#303a4a',visibility:{}});
const clone=value=>JSON.parse(JSON.stringify(value));
const esc=value=>String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function normalize(data) {
  const result=clone(defaults);
  if(!data||typeof data!=='object'||Array.isArray(data)) throw Error('Invalid draft');
  fields.forEach(f=>{if(typeof data[f]==='string')result[f]=data[f].slice(0,20000);});
  collections.forEach(k=>{if(Array.isArray(data[k]))result[k]=data[k].filter(e=>e&&typeof e==='object').slice(0,100).map(e=>({...Object.fromEntries(['role','organization','dates','description'].map(f=>[f,typeof e[f]==='string'?e[f].slice(0,10000):''])),visible:e.visible!==false}));});
  if(data.visibility&&typeof data.visibility==='object'&&!Array.isArray(data.visibility)) {
    visibilityKeys.forEach(key=>{if(typeof data.visibility[key]==='boolean')result.visibility[key]=data.visibility[key];});
  }
  if(templates.some(t=>t[0]===data.design))result.design=data.design;
  if(/^#[\da-f]{6}$/i.test(data.color))result.color=data.color;
  if(['professional','internship','graduate','academic','creative'].includes(data.purpose))result.purpose=data.purpose;
  if(['template','sans','serif','mono'].includes(data.font))result.font=data.font;
  if(Number.isFinite(data.fontSize))result.fontSize=Math.max(9,Math.min(14,data.fontSize));
  if(Number.isFinite(data.spacing))result.spacing=Math.max(1.3,Math.min(1.9,data.spacing));
  for(const field of ['photo','photoSource']) {
    if(typeof data[field]==='string'&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(data[field])&&data[field].length<2000000)result[field]=data[field];
  }
  if(data.photoEdits&&typeof data.photoEdits==='object') {
    const limits={x:[-16000,16000],y:[-16000,16000],width:[1,16000],height:[1,16000],rotate:[-360,360],scaleX:[-1,1],scaleY:[-1,1],brightness:[50,150],contrast:[50,150]};
    result.photoEdits={};
    for(const [field,[min,max]] of Object.entries(limits)) if(Number.isFinite(data.photoEdits[field])) result.photoEdits[field]=Math.max(min,Math.min(max,data.photoEdits[field]));
    if(Number.isFinite(data.photoEdits.rotate))result.photoEdits.rotate=((data.photoEdits.rotate%360)+360)%360;
    for(const axis of ['scaleX','scaleY'])if(axis in result.photoEdits)result.photoEdits[axis]=result.photoEdits[axis]<0?-1:1;
  }
  if(typeof data.showPhoto==='boolean')result.showPhoto=data.showPhoto;
  if(window.normalizeCanvas) result.canvas=window.normalizeCanvas(data.canvas);
  result.atsMode=data.atsMode===true;
  return result;
}
let state=clone(defaults);try{const saved=localStorage.getItem(key);if(saved)state=normalize(JSON.parse(saved));}catch{document.querySelector('#save-status').textContent='Draft could not be restored';}
const form=document.querySelector('#cv-form'),preview=document.querySelector('#cv-preview');
function save(){try{localStorage.setItem(key,JSON.stringify(state));document.querySelector('#save-status').textContent='Saved on this device';}catch{document.querySelector('#save-status').textContent='Not saved: download your draft';}}
function section(title,content,id){return content?`<section class="cv-section"${id?` data-cv-section="${esc(id)}"`:''}><h2>${esc(title)}</h2>${content}</section>`:'';}
function entries(kind){return state[kind].filter(e=>e.visible!==false&&['role','organization','dates','description'].some(key=>e[key].trim())).map(e=>`<div class="entry"><div class="entry-top"><h3>${esc(e.role)}</h3>${e.dates.trim()?`<span>${esc(e.dates)}</span>`:''}</div>${e.organization?`<p class="organization">${esc(e.organization)}</p>`:''}${e.description?`<p>${esc(e.description)}</p>`:''}</div>`).join('');}
function render(){
  const fonts={sans:'Arial, sans-serif',serif:'Georgia, serif',mono:'"Courier New", monospace'};
  const template=window.FOLIO_TEMPLATES.find(item=>item.id===state.design);
  const font=fonts[state.font]||template.body;
  const heading=state.font==='template'?template.heading:font;
  preview.className=state.atsMode?"resume designed ats-layout":`resume designed ${template.base||state.design} ${state.design} decor-${template.decoration||"original"} family-${template.family||"original"}`;
  const onAccent=cvContrast(state.color);
  const accentText=onAccent==='#19212a'?'#334047':state.color;
  preview.style.cssText=`--accent:${state.color};--on-accent:${onAccent};--accent-text:${accentText};--cv-font:${font};--heading-font:${heading};--cv-size:${state.fontSize}px;--cv-line:${state.spacing};`;
  preview.innerHTML=state.atsMode?buildATSCV(state,esc,section,entries):buildDesignedCV(state,esc,section,entries);
  preview.classList.toggle('without-sidebar',!preview.querySelector('.cv-side'));
  preview.classList.toggle('without-portrait',!cvIncludes(state,'photo'));
  if(window.layoutCanvas) window.layoutCanvas();
  document.querySelectorAll('[data-cv-include]').forEach(input=>{input.checked=cvIncludes(state,input.dataset.cvInclude);});
  document.querySelector('#show-photo').checked=state.showPhoto;
  document.querySelector('#summary-count').textContent=`${state.summary.length} / 2000`;
  document.querySelector('#summary-label').textContent=['internship','graduate'].includes(state.purpose)?'Career objective':'Professional summary';
  document.querySelector('#avatar').innerHTML=state.photo?`<img src="${state.photo}" alt="Uploaded profile photo">`:esc(state.name.split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0]).join('')||'CV');
  document.querySelector('#remove-photo').hidden=!state.photo;
  document.querySelectorAll('[data-design]').forEach(b=>{b.classList.toggle('active',b.dataset.design===state.design);b.setAttribute('aria-pressed',b.dataset.design===state.design);});
  document.querySelectorAll('[data-color]').forEach(b=>{b.classList.toggle('active',b.dataset.color===state.color);b.setAttribute('aria-pressed',b.dataset.color===state.color);});
  document.querySelector('#current-design').textContent=template.name+' / '+document.querySelector('#purpose option:checked').textContent;
  document.querySelector('#size-value').textContent=`${state.fontSize} px`;
  document.querySelector('#spacing-value').textContent=state.spacing<1.5?'Compact':state.spacing>1.7?'Relaxed':'Balanced';
}
function selectTemplate(id){
  const template=window.FOLIO_TEMPLATES.find(item=>item.id===id);
  if(!template)return;
  state.design=id;state.color=template.color;state.font='template';
  document.querySelector('#custom-color').value=state.color;
  document.querySelector('#font').value=state.font;
  render();save();
}
const labels={experience:['Job title','Company / Organization'],education:['Degree / Qualification','School / University'],projects:['Project name','Link / Organization'],certifications:['Certification','Issuing organization']};
function renderFields(){fields.forEach(f=>form.elements[f].value=state[f]);collections.forEach(kind=>{document.querySelector(`#${kind}-fields`).innerHTML=state[kind].map((e,i)=>`<div class="repeat-entry${e.visible===false?' excluded-entry':''}"><div class="repeat-heading"><strong>${labels[kind][0]} ${i+1}</strong><label class="entry-include"><input type="checkbox" data-kind="${kind}" data-index="${i}" data-field="visible" aria-label="Include ${kind} ${i+1} in CV" ${e.visible!==false?'checked':''}> Include</label><button type="button" class="remove-button" data-remove="${kind}" data-index="${i}">Remove</button></div>${['role','organization','dates','description'].map((f,n)=>`<label>${[...labels[kind],'Date range','Description'][n]}${f==='description'?`<textarea rows="3" data-kind="${kind}" data-index="${i}" data-field="${f}">${esc(e[f])}</textarea>`:`<input data-kind="${kind}" data-index="${i}" data-field="${f}" value="${esc(e[f])}">`}</label>`).join('')}</div>`).join('');});['purpose','font','custom-color','font-size','spacing'].forEach(id=>document.getElementById(id).value=state[({'custom-color':'color','font-size':'fontSize'})[id]||id]);document.querySelector('#show-photo').checked=state.showPhoto;render();}
document.querySelector('#template-gallery').innerHTML=templates.map(([id,name])=>`<button class="template-button" data-design="${id}" aria-label="${name} template"><span class="template-art" aria-hidden="true"><img src="assets/template-${id}.png" alt="" width="550" height="780" loading="lazy" decoding="async"></span><span class="template-name">${name}<span class="template-check">&#10003;</span></span></button>`).join('');
document.querySelector('#colors').innerHTML=[['#167d8d','Teal'],['#305bc7','Blue'],['#b54477','Berry'],['#32764d','Green'],['#b45526','Terracotta'],['#333333','Charcoal']].map(([color,label])=>`<button data-color="${color}" style="--swatch:${color}" aria-label="${label}" title="${label}"></button>`).join('');
form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('input',e=>{const el=e.target;if(el.dataset.kind){state[el.dataset.kind][Number(el.dataset.index)][el.dataset.field]=el.dataset.field==='visible'?el.checked:el.value;if(el.dataset.field==='visible')el.closest('.repeat-entry').classList.toggle('excluded-entry',!el.checked);}else if(fields.includes(el.name))state[el.name]=el.value;else return;render();save();});
form.addEventListener('click',e=>{const remove=e.target.closest('[data-remove]'),add=e.target.closest('[data-add]');if(remove){state[remove.dataset.remove].splice(Number(remove.dataset.index),1);renderFields();save();}if(add){state[add.dataset.add].push({role:'',organization:'',dates:'',description:''});renderFields();save();document.querySelector(`#${add.dataset.add}-fields .repeat-entry:last-child [data-field="role"]`).focus();}});
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-tab]').forEach(t=>{t.classList.toggle('active',t===b);t.setAttribute('aria-current',t===b?'page':'false');});document.querySelectorAll('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==b.dataset.tab);}));document.querySelectorAll('[data-design],[data-color]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.design){selectTemplate(b.dataset.design);return;}state.color=b.dataset.color;document.querySelector('#custom-color').value=state.color;render();save();}));
['purpose','font','custom-color','font-size','spacing','show-photo'].forEach(id=>document.getElementById(id).addEventListener('input',e=>{const f=({'custom-color':'color','font-size':'fontSize','show-photo':'showPhoto'})[id]||id;state[f]=id==='show-photo'?e.target.checked:['fontSize','spacing'].includes(f)?Number(e.target.value):e.target.value;render();save();}));
let photoVersion=0;
document.querySelector('#remove-photo').addEventListener('click',()=>{photoVersion++;state.photo='';render();save();});
document.querySelector('#export').addEventListener('click',async()=>{
  const button=document.querySelector('#export');
  button.disabled=true;
  const title=document.title;
  try {
    await document.fonts.ready;
    await Promise.all([...preview.querySelectorAll('img')].map(image=>image.decode().catch(()=>{})));
    document.title=`${state.name||'My'} - CV`;
    if(window.layoutCanvas) render();
    if(window.canvasOverflow){document.querySelector("#canvas-status").focus();return;}
    window.print();
  } finally {
    document.title=title;
    button.disabled=false;
  }
});
document.querySelector('#open-designs').addEventListener('click',()=>document.querySelector('#design-sidebar').scrollIntoView({behavior:'smooth',block:'start'}));
document.querySelector('#load-example').addEventListener('click',()=>{if(!confirm('Replace your details with an example for this application type?'))return;photoVersion++;const purpose=state.purpose,settings=Object.fromEntries(['purpose','design','color','font','fontSize','spacing','showPhoto','visibility'].map(k=>[k,state[k]]));state={...clone(defaults),...settings};if(['internship','graduate','academic'].includes(purpose)){state.title=purpose==='academic'?'Computer Science Research Applicant':purpose==='internship'?'Software Engineering Intern':'Junior Software Engineer';state.summary='Computer science student with a strong foundation in software development and a hands-on approach to problem solving. Seeking an opportunity to contribute to meaningful projects and grow within a collaborative team.';state.experience=[];state.education=[{role:'BSc in Computer Science',organization:'University of Colombo',dates:'2023 - 2027',description:'Relevant coursework: Algorithms, Databases, Software Engineering'}];state.projects=[{role:'Campus Connect',organization:'Academic team project',dates:'2025',description:'Developed an event discovery application with a team of four.\nImplemented responsive interfaces and automated tests.'}];state.skills='JavaScript, Python, HTML & CSS, Git, Teamwork';}if(purpose==='creative'){state.title='Brand Designer & Illustrator';state.projects=[{role:'Bloom identity system',organization:'Independent client project',dates:'2025',description:'Created brand identity, packaging, and an accessible digital style guide.'}];}renderFields();save();});
const dialog=document.querySelector('#reset-dialog');document.querySelector('#reset').addEventListener('click',()=>dialog.showModal());document.querySelector('#cancel-reset').addEventListener('click',()=>dialog.close());document.querySelector('#confirm-reset').addEventListener('click',()=>{photoVersion++;fields.forEach(f=>state[f]='');collections.forEach(k=>state[k]=[]);state.photo='';state.visibility={};state.showPhoto=true;renderFields();save();dialog.close();});
document.querySelector('#backup').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='folio-cv-draft.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});document.querySelector('#import-input').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;const status=document.querySelector('#draft-status');try{if(file.size>5*1024*1024)throw Error('File too large');const data=JSON.parse(await file.text());if(!data||typeof data.name!=='string'||!Array.isArray(data.experience))throw Error('Not a CV draft');const next=normalize(data);if(confirm('Replace the current CV with this imported draft?')){photoVersion++;state=next;renderFields();save();status.textContent='Draft imported.';}}catch{status.textContent='Cannot import this file. Choose a Folio JSON draft under 5 MB.';}e.target.value='';});renderFields();
