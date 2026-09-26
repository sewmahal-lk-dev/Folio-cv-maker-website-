// Formatting helpers only: no employer ATS service or candidate ranking is used.
function buildATSCV(data,escape,section,entries){
 const included=(key,title,content)=>cvIncludes(data,key)?section(title,content,key):'';
 const contact=['email','phone','location','website'].filter(key=>cvIncludes(data,key)&&data[key].trim()).map(key=>`<p>${escape(data[key])}</p>`).join('');
 const identity=`<div class="ats-identity"><h1>${escape(data.name)||'Your name'}</h1>${cvIncludes(data,'title')&&data.title.trim()?`<p>${escape(data.title)}</p>`:''}${contact}</div>`;
 const order=['internship','graduate','academic'].includes(data.purpose)?['education','projects','experience']:['experience','education','projects'];
 const titles={experience:'Work Experience',education:'Education',projects:'Projects'};
 const content=included('summary','Professional Summary',data.summary.trim()?`<p>${escape(data.summary)}</p>`:'')+
 order.map(key=>included(key,titles[key],entries(key))).join('')+
 included('skills','Skills',data.skills.trim()?`<p>${escape(data.skills)}</p>`:'')+
 included('certifications','Certifications',entries('certifications'))+
 ['languages','achievements','interests','references'].map(key=>included(key,key[0].toUpperCase()+key.slice(1),data[key].trim()?`<p>${escape(data[key])}</p>`:'')).join('')+
 included('custom',data.customTitle||'Additional Information',data.customContent.trim()?`<p>${escape(data.customContent)}</p>`:'');
 return `<div class="ats-body"><div class="cv-main">${identity}${content}</div></div>`;
}
function atsVisibleText(){
 const lines=[];
 const add=value=>{if(value?.trim())lines.push(value.trim());};
 add(state.name);
 for(const key of ['title','email','phone','location','website','summary'])if(cvIncludes(state,key))add(state[key]);
 const order=['internship','graduate','academic'].includes(state.purpose)?['education','projects','experience']:['experience','education','projects'];
 for(const kind of order)if(cvIncludes(state,kind)){
  const entries=state[kind].filter(e=>e.visible!==false);if(!entries.length)continue;
  add(kind.toUpperCase());for(const entry of entries)for(const field of ['role','organization','dates','description'])add(entry[field]);
 }
 if(cvIncludes(state,'skills')&&state.skills.trim()){add('SKILLS');add(state.skills);}
 if(cvIncludes(state,'certifications')){
  const entries=state.certifications.filter(e=>e.visible!==false);
  if(entries.length)add('CERTIFICATIONS');
  for(const entry of entries)for(const field of ['role','organization','dates','description'])add(entry[field]);
 }
 for(const key of ['languages','achievements','interests','references'])if(cvIncludes(state,key)&&state[key].trim()){add(key.toUpperCase());add(state[key]);}
 if(cvIncludes(state,'custom')&&state.customContent.trim()){add(state.customTitle||'Additional Information');add(state.customContent);}
 return lines.join('\n\n');
}
function atsKeywordResults(input,text){
 const normalize=value=>value.normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
 const tokens=value=>normalize(value).match(/\.?[\p{L}\p{N}]+(?:[.+#-][\p{L}\p{N}]+)*[+#]*/gu)||[];
 const haystack=tokens(text);
 return [...new Set(input.split(/[,\n]/).map(normalize).filter(Boolean))].slice(0,60).map(term=>{
  const needle=tokens(term);
  const found=needle.length>0&&haystack.some((_,i)=>needle.every((token,j)=>haystack[i+j]===token));
  return {term,found};
 });
}
