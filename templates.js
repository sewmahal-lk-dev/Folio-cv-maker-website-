window.FOLIO_TEMPLATES = [
  {id:'timeline',name:'Timeline',tag:'Overlapping portrait and a tailored navy header',group:'professional',color:'#303a4a',layout:'reference',heading:'Arial, sans-serif',body:'Arial, sans-serif',photo:'circle'},
  {id:'signature',name:'Signature',tag:'Blush portrait panel with a handwritten name',group:'creative',color:'#d7bab7',layout:'reference',heading:'Georgia, serif',body:'Arial, sans-serif',photo:'square'},
  {id:'harbor',name:'Harbor',tag:'Deep blue sidebar, fine rules, crisp type',group:'professional',color:'#193d4b',layout:'reference',heading:'Arial, sans-serif',body:'Arial, sans-serif',photo:'circle'},
  {id:'slate',name:'Slate',tag:'A midnight masthead and polished section labels',group:'professional',color:'#293347',layout:'reference',heading:'Arial, sans-serif',body:'Arial, sans-serif',photo:'square'},
  {id:'sage',name:'Sage',tag:'Muted teal meets a soft peach nameplate',group:'student',color:'#6d9795',layout:'reference',heading:'Arial, sans-serif',body:'Arial, sans-serif',photo:'circle'},
  {id:'contrast',name:'Contrast',tag:'Black-and-white impact with a bold name',group:'professional',color:'#191919',layout:'reference',heading:'Arial, sans-serif',body:'Arial, sans-serif',photo:'circle'},
  {id:'modern',name:'Studio',tag:'Sage accents, thoughtful structure',group:'professional',color:'#37665c',layout:'split',heading:'Georgia, serif',body:'Arial, sans-serif',photo:'circle'},
  {id:'sidebar',name:'Spectrum',tag:'A confident full-height color panel',group:'professional',color:'#263e4d',layout:'sidebar',heading:'Arial, sans-serif',body:'Arial, sans-serif',photo:'square'},
  {id:'creative',name:'Canvas',tag:'Soft rose, expressive typography',group:'creative',color:'#a13f60',layout:'split',heading:'Georgia, serif',body:'Arial, sans-serif',photo:'arch'},
  {id:'classic',name:'Executive',tag:'Refined serif, signature details',group:'professional',color:'#343a3d',layout:'split',heading:'Georgia, serif',body:'Arial, sans-serif',photo:'circle'},
  {id:'minimal',name:'Essential',tag:'Swiss-inspired typography and rhythm',group:'professional',color:'#3d5b87',layout:'linear',heading:'Arial, sans-serif',body:'Arial, sans-serif',photo:'square'},
  {id:'academic',name:'Scholar',tag:'Fresh mint for your first chapter',group:'student',color:'#32755e',layout:'split',heading:'Arial, sans-serif',body:'Arial, sans-serif',photo:'circle'},
  {id:'atelier',name:'Atelier',tag:'An oversized name. A quiet confidence.',group:'creative',color:'#93494c',layout:'split',heading:'Georgia, serif',body:'Arial, sans-serif',photo:'square'},
  {id:'editorial',name:'Editorial',tag:'A magazine-inspired personal profile',group:'creative',color:'#3d576f',layout:'split',heading:'Georgia, serif',body:'Arial, sans-serif',photo:'square'},
  {id:'portfolio',name:'Portfolio',tag:'Cobalt details with a creative edge',group:'creative',color:'#345ac5',layout:'sidebar',heading:'Arial, sans-serif',body:'Arial, sans-serif',photo:'square'},
  {id:'forma',name:'Forma',tag:'Clean geometry, a bright beginning',group:'student',color:'#9c492d',layout:'split',heading:'Arial, sans-serif',body:'Arial, sans-serif',photo:'circle'}
];


// Original layouts inspired by common resume styles in the supplied references.
const collectionAdditions = [
 ['navy','Navy Professional','harbor','#173b52','professional','round'],
 ['burgundy','Burgundy Banner','academic','#800d19','professional','round'],
 ['sand','Sand Editorial','signature','#b49b85','creative','serif'],
 ['rose','Rose Profile','creative','#bd8e99','creative','serif'],
 ['graphite','Graphite Rail','sidebar','#383a3c','professional','round'],
 ['azure','Azure Graduate','forma','#287eac','student','round'],
 ['ochre','Ochre Architect','timeline','#b99638','creative','bar'],
 ['espresso','Espresso Classic','harbor','#734a35','professional','serif'],
 ['violet','Violet Scholar','minimal','#78558c','student','clean'],
 ['mono','Monochrome Executive','minimal','#242424','professional','clean'],
 ['pearl','Pearl Consultant','editorial','#7a8184','professional','serif'],
 ['forest','Forest Profile','modern','#365e4a','professional','round'],
 ['cobalt','Cobalt Creative','portfolio','#2457a1','creative','bar'],
 ['plum','Plum Graduate','forma','#653956','student','bar'],
 ['ivory','Ivory Writer','classic','#8b7860','creative','serif'],
 ['steel','Steel Manager','slate','#526875','professional','round'],
 ['coral','Coral Studio','creative','#b75e4b','creative','bar'],
 ['teal','Teal Timeline','timeline','#427d7c','professional','round'],
 ['olive','Olive Researcher','academic','#65704b','student','clean'],
 ['ink','Ink Portfolio','contrast','#242b33','creative','bar'],
 ['linen','Linen Minimal','minimal','#a2826c','professional','serif'],
 ['sky','Sky Intern','sage','#75a5c3','student','round'],
 ['charcoal','Charcoal Director','classic','#424750','professional','clean'],
 ['terracotta','Terracotta Designer','atelier','#a25d41','creative','serif']
];
for (const [id,name,base,color,group,decoration] of collectionAdditions) {
 const parent=window.FOLIO_TEMPLATES.find(t=>t.id===base);
 window.FOLIO_TEMPLATES.push({...parent,id,name,base,color,group,decoration,tag:`${name} / ${decoration==='serif'?'Editorial typography':decoration==='round'?'Portrait led layout':decoration==='bar'?'Bold section accents':'Simple, clear structure'}`});
}


// 100 curated template variants: 20 layout/type families in five coordinated editions.
// Stable IDs keep saved drafts and shared links valid as the collection grows.
const expandedFamilies = [
 ['meridian','Meridian','timeline','professional','Arial, sans-serif'],
 ['autograph','Autograph','signature','creative','Georgia, serif'],
 ['anchor','Anchor','harbor','professional','Arial, sans-serif'],
 ['summit','Summit','slate','professional','Arial, sans-serif'],
 ['meadow','Meadow','sage','student','Georgia, serif'],
 ['focus','Focus','contrast','professional','Arial, sans-serif'],
 ['balance','Balance','modern','professional','Georgia, serif'],
 ['pillar','Pillar','sidebar','professional','Arial, sans-serif'],
 ['muse','Muse','creative','creative','Georgia, serif'],
 ['heritage','Heritage','classic','professional','Georgia, serif'],
 ['clarity','Clarity','minimal','professional','Arial, sans-serif'],
 ['discovery','Discovery','academic','student','Arial, sans-serif'],
 ['artisan','Artisan','atelier','creative','Georgia, serif'],
 ['journal','Journal','editorial','creative','Georgia, serif'],
 ['showcase','Showcase','portfolio','creative','Arial, sans-serif'],
 ['launch','Launch','forma','student','Arial, sans-serif'],
 ['chronicle','Chronicle','timeline','professional','Georgia, serif'],
 ['mariner','Mariner','harbor','professional','Georgia, serif'],
 ['apprentice','Apprentice','academic','student','Georgia, serif'],
 ['byline','Byline','editorial','creative','Arial, sans-serif']
];
const expandedEditions = [
 {id:'midnight',name:'Midnight',color:'#25344c',decoration:'clean',detail:'Fine rules and an understated finish'},
 {id:'ocean',name:'Ocean',color:'#176d83',decoration:'round',detail:'Ocean blue with a circular portrait'},
 {id:'forest',name:'Forest',color:'#38604c',decoration:'bar',detail:'Forest green with bold section labels'},
 {id:'clay',name:'Clay',color:'#945437',decoration:'serif',detail:'Warm clay and editorial serif headings'},
 {id:'plum',name:'Plum',color:'#724160',decoration:'original',detail:'Plum accents and balanced typography'}
];
for(const [family,name,base,group,heading] of expandedFamilies){
 const parent=window.FOLIO_TEMPLATES.find(template=>template.id===base);
 for(const edition of expandedEditions){
  window.FOLIO_TEMPLATES.push({...parent,id:`${family}-${edition.id}`,name:`${name} ${edition.name}`,base,family,group,heading,color:edition.color,decoration:edition.decoration,photo:edition.decoration==='round'?'circle':parent.photo,tag:`${edition.detail} / ${parent.name} layout`});
 }
}

function cvContrast(color) {
  const channels=color.slice(1).match(/../g).map(value=>parseInt(value,16)/255).map(value=>value<=0.04045?value/12.92:((value+0.055)/1.055)**2.4);
  return channels[0]*0.2126+channels[1]*0.7152+channels[2]*0.0722>0.179?'#19212a':'#ffffff';
}

function cvIncludes(data, key) {
  return key==='photo'?data.showPhoto!==false:data.visibility?.[key]!==false;
}

function buildDesignedCV(data, escape, section, entries) {
  const template=window.FOLIO_TEMPLATES.find(item=>item.id===data.design)||window.FOLIO_TEMPLATES[0];
  data={...data,design:template.base||data.design};
  const included=(key,title,content)=>cvIncludes(data,key)?section(title,content,key):'';
  const columns=(side,main,className)=>`<div class="${className}">${side?`<aside class="cv-side">${side}</aside>`:''}<div class="cv-main">${main}</div></div>`;
  const initials=data.name.trim().split(/\s+/).slice(0,2).map(part=>part[0]).join('')||'CV';
  const portrait=data.photo
    ? `<img class="cv-photo" src="${data.photo}" alt="Profile portrait">`
    : `<div class="cv-monogram" aria-hidden="true">${escape(initials)}</div>`;
  const photoBlock=cvIncludes(data,'photo')?`<div class="portrait-wrap">${portrait}</div>`:'';
  const nameParts=(data.name.trim()||'Your name').split(/\s+/);
  const nameMarkup=data.design==='signature'?`<span class="signature-name">${escape(nameParts[0])}</span>${nameParts.length>1?` <span class="signature-surname">${escape(nameParts.slice(1).join(' '))}</span>`:''}`:escape(data.name)||'Your name';
  const identity=`<div class="identity"><h1>${nameMarkup}</h1>${cvIncludes(data,'title')&&data.title.trim()?`<p class="job-title">${escape(data.title)}</p>`:''}</div>`;
  const contactFields=[['email','Email'],['phone','Phone'],['location','Location'],['website','Online']];
  const contacts=contactFields.filter(([key])=>cvIncludes(data,key)&&data[key].trim()).map(([key,label])=>`<div class="contact-item" data-cv-field="${key}"><span class="contact-label">${label}</span><span>${escape(data[key])}</span></div>`).join('');
  const contact=section('Contact',contacts?`<div class="contact">${contacts}</div>`:'','contact');
  const skills=included('skills','Expertise',data.skills.split(',').map(value=>value.trim()).filter(Boolean).map(value=>`<span class="skill">${escape(value)}</span>`).join(''));
  const languages=included('languages','Languages',data.languages.trim()?`<p>${escape(data.languages)}</p>`:'');
  const certifications=included('certifications','Certifications',entries('certifications'));
  const profile=included('summary',['internship','graduate'].includes(data.purpose)?'Career objective':'Profile',data.summary.trim()?`<p>${escape(data.summary)}</p>`:'');
  const student=['internship','graduate','academic'].includes(data.purpose)||['academic','sage'].includes(data.design);
  const order=student?['education','projects','experience']:data.design==='portfolio'?['projects','experience','education']:['experience','education','projects'];
  const titles={experience:'Experience',education:'Education',projects:'Selected projects'};
  const extraContent=['achievements','interests','references'].map(key=>included(key,key[0].toUpperCase()+key.slice(1),data[key].trim()?`<p>${escape(data[key])}</p>`:'')).join('')+
    included('custom',data.customTitle||'Additional information',data.customContent.trim()?`<p>${escape(data.customContent)}</p>`:'');
  const content=order.map(kind=>included(kind,titles[kind],entries(kind))).join('')+extraContent;
  const main=profile+content;
  const side=contact+skills+languages+certifications;
  const folio=`<div class="cv-document-mark" aria-hidden="true"><span>${escape(initials)}</span><span>CURRICULUM VITAE</span></div>`;
  if(template.layout==='reference'){
    if(data.design==='timeline')return `<header class="resume-header">${identity}</header>${columns(photoBlock+side,main,'reference-columns')}`;
    if(data.design==='slate')return `<header class="resume-header">${identity}</header>${columns(photoBlock+profile+side,content,'reference-columns')}`;
    if(data.design==='signature'||data.design==='sage')return columns(photoBlock+profile+side,`<header class="resume-header">${identity}</header>${content}`,'reference-columns');
    if(data.design==='harbor'){
      const education=included('education','Education',entries('education'));
      const mainWithoutEducation=profile+order.filter(kind=>kind!=='education').map(kind=>included(kind,titles[kind],entries(kind))).join('')+extraContent;
      return columns(photoBlock+contact+education+skills+languages+certifications,`<header class="resume-header">${identity}</header>${mainWithoutEducation}`,'reference-columns');
    }
    return columns(photoBlock+side,`<header class="resume-header">${identity}</header>${main}`,'reference-columns');
  }
  if(template.layout==='sidebar') return columns(photoBlock+side,`<header class="resume-header">${identity}</header>${main}`,'designed-columns');
  if(template.layout==='linear') return `${folio}<header class="resume-header">${identity}${photoBlock}</header>${contacts?`<div class="contact-strip">${contacts}</div>`:''}<div class="resume-body"><div class="cv-main">${main}${skills}${languages}${certifications}</div></div>`;
  return `${folio}<header class="resume-header">${photoBlock}${identity}</header>${columns(side,main,'resume-body')}`;
}
