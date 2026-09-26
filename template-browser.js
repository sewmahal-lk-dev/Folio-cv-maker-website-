const templateDialog=document.querySelector('#template-dialog');
const templateGrid=document.querySelector('#template-browser-grid');
const fontOption=document.createElement('option');
fontOption.value='template';fontOption.textContent='Designer pairing';
document.querySelector('#font').prepend(fontOption);
document.querySelector('#font').value=state.font;
const browseButton=document.createElement('button');
browseButton.type='button';browseButton.className='browse-templates';browseButton.id='browse-templates';
browseButton.innerHTML=`Browse all designs ${icon('arrow-up-right')}`;
document.querySelector('#template-gallery').after(browseButton);
let category='all';
function fillTemplateBrowser(){
  const query=document.querySelector('#template-search').value.trim().toLowerCase();
  const matches=window.FOLIO_TEMPLATES.filter(template=>(category==='all'||template.group===category)&&`${template.name} ${template.tag} ${template.group}`.toLowerCase().includes(query));
  templateGrid.innerHTML=matches.map(template=>`<button type="button" class="template-option ${state.design===template.id?'active':''}" data-choose-template="${template.id}" aria-label="Use ${template.name} template" aria-pressed="${state.design===template.id}"><span class="template-option-image"><img src="assets/template-${template.id}.png" alt="${template.name} CV preview" width="550" height="780" loading="lazy" decoding="async"></span><span class="template-option-name">${template.name}${icon(state.design===template.id?'check':'arrow-up-right')}</span><span class="template-option-tag">${template.tag}</span></button>`).join('');
  document.querySelector('#template-no-results').hidden=matches.length>0;
}
browseButton.addEventListener('click',()=>{fillTemplateBrowser();templateDialog.showModal();});
document.querySelector('#close-templates').addEventListener('click',()=>templateDialog.close());
document.querySelector('#template-search').addEventListener('input',fillTemplateBrowser);
document.querySelectorAll('[data-template-filter]').forEach(button=>button.addEventListener('click',()=>{
  category=button.dataset.templateFilter;
  document.querySelectorAll('[data-template-filter]').forEach(item=>{item.classList.toggle('active',item===button);item.setAttribute('aria-pressed',String(item===button));});
  fillTemplateBrowser();
}));
templateGrid.addEventListener('click',event=>{
  const button=event.target.closest('[data-choose-template]');
  if(!button)return;
  selectTemplate(button.dataset.chooseTemplate);
  templateDialog.close();
});
