const designs = window.FOLIO_TEMPLATES;
const gallery = document.querySelector('#home-templates');
for (const design of designs) {
  const link = document.createElement('a');
  link.className = 'home-template';
  link.dataset.group = design.group;
  const parameters = new URLSearchParams({design:design.id,color:design.color});
  if(design.group === 'student') parameters.set('purpose','graduate');
  if(design.group === 'creative') parameters.set('purpose','creative');
  link.href = `builder.html?${parameters}`;
  link.setAttribute('aria-label', `Use ${design.name} template`);
  link.innerHTML = `<div class="template-image-wrap"><img src="assets/template-${design.id}.png" alt="${design.name} CV layout preview" width="550" height="780" loading="lazy"><span class="choose-design">Use this design ${icon('arrow-up-right')}</span></div><div class="home-template-title"><h3>${design.name}</h3>${icon('arrow-up-right')}</div><p>${design.tag}</p>`;
  gallery.append(link);
}
const searchBar=document.createElement('div');searchBar.className='collection-search';
searchBar.innerHTML='<label for="home-template-search">Search templates<input id="home-template-search" type="search" placeholder="Search names, colors, or styles"></label><span id="home-template-count" role="status"></span>';
gallery.before(searchBar);
let homeCategory='all';
function filterHomeTemplates(){
  const query=document.querySelector('#home-template-search').value.trim().toLowerCase();
  let count=0;
  document.querySelectorAll('.home-template').forEach((item,index)=>{
    const design=designs[index];
    item.hidden=(homeCategory!=='all'&&design.group!==homeCategory)||!`${design.name} ${design.tag} ${design.group}`.toLowerCase().includes(query);
    if(!item.hidden)count++;
  });
  document.querySelector('#home-template-count').textContent=`${count} of ${designs.length} templates`;
  document.querySelector('#no-templates').hidden=count>0;
}
document.querySelector('#home-template-search').addEventListener('input',filterHomeTemplates);
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(item => {
    item.classList.toggle('active', item === button);
    item.setAttribute('aria-pressed', String(item === button));
  });
  homeCategory=button.dataset.filter;
  filterHomeTemplates();
}));
filterHomeTemplates();
try {
  if (localStorage.getItem('folio-cv-v1')) document.querySelector('#start-building').innerHTML = `Continue my CV ${icon('arrow-up-right')}`;
} catch { /* A new draft still works when storage is unavailable. */ }
