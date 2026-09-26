const contentDialog=document.querySelector('#content-dialog');
document.querySelector('#content-options').innerHTML=contentGroups.map(group=>`<fieldset><legend>${group.label}</legend>${group.items.map(([key,label])=>`<label class="content-option"><input type="checkbox" data-cv-include="${key}" ${cvIncludes(state,key)?'checked':''}><span>${label}</span></label>`).join('')}</fieldset>`).join('');

document.querySelector('#customize-cv').addEventListener('click',()=>contentDialog.showModal());
for(const id of ['close-content','done-content'])document.getElementById(id).addEventListener('click',()=>contentDialog.close());
contentDialog.addEventListener('change',event=>{
  const input=event.target.closest('[data-cv-include]');
  if(!input)return;
  const key=input.dataset.cvInclude;
  if(key==='photo')state.showPhoto=input.checked;
  else state.visibility[key]=input.checked;
  render();save();
});
document.querySelector('#show-all-content').addEventListener('click',()=>{
  state.visibility={};state.showPhoto=true;
  collections.forEach(kind=>state[kind].forEach(entry=>{entry.visible=true;}));
  renderFields();save();
});
