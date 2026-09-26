// The form remains the source of truth. Pages are derived from its rendered blocks.
(() => {
 const stage=document.querySelector('.paper-stage');
 const toolsPanel=document.createElement('section');toolsPanel.className='canvas-tools-panel';toolsPanel.setAttribute('aria-labelledby','canvas-tools-heading');
 toolsPanel.innerHTML='<h3 id="canvas-tools-heading">Page &amp; layout</h3>';
 document.querySelector('.editor').append(toolsPanel);
 const controls=document.createElement('div');controls.className='canvas-controls';
 controls.innerHTML=`<label>CV length <select id="canvas-pages"><option value="1">1 Page</option><option value="2">2 Pages</option></select></label><label>Margins <input id="canvas-margin" type="number" min="0" max="20" step="1"> mm</label><label>Section spacing <input id="canvas-gap" type="number" min="0" max="35"> px</label><div class="canvas-navigation"><button id="page-prev" aria-label="Previous page">←</button><span id="page-label"></span><button id="page-next" aria-label="Next page">→</button></div><div><button id="zoom-out" aria-label="Zoom out">−</button><output id="zoom-label"></output><button id="zoom-in" aria-label="Zoom in">+</button><button id="zoom-reset">Fit</button></div>`;
 toolsPanel.append(controls);
 const status=document.createElement('p');status.id='canvas-status';status.tabIndex=-1;status.setAttribute('role','status');toolsPanel.append(status);
 const inspector=document.createElement('div');inspector.className='block-tools';
 inspector.innerHTML=`<strong id="block-label">Select a section or portrait to adjust it</strong><div id="block-options" hidden><label>Text size <input id="block-size" type="number" min="8" max="24"></label><label>Line spacing <input id="block-line" type="number" min="1" max="2.3" step="0.1"></label><label>Width % <input id="block-width" type="number" min="40" max="100"></label><label>Horizontal <input id="block-x" type="number" min="-100" max="100"></label><label>Vertical <input id="block-y" type="number" min="-100" max="100"></label><label>Portrait size <input id="block-photoSize" type="number" min="40" max="160"></label><label>Alignment <select id="block-align"><option>left</option><option>center</option><option>right</option></select></label><button id="block-bold">Bold</button><button id="block-italic">Italic</button><button id="block-up">Move section up</button><button id="block-down">Move section down</button><button id="block-reset">Reset block</button></div><small>Drag a selected block to move it. Use Width to resize text. Edit text in the form; font family is in Design.</small>`;
 controls.after(inspector);
 const overflow=document.createElement('details');overflow.className='canvas-overflow';overflow.hidden=true;overflow.innerHTML='<summary>Review all content that needs more space</summary><pre></pre>';stage.after(overflow);
 let pages=[],active=0,zoom=1,selected='',drag=null;
 const config=()=>state.canvas||(state.canvas=normalizeCanvas());
 const settings=()=>config().blocks[selected]||(config().blocks[selected]={x:0,y:0,width:100,size:state.fontSize,line:state.spacing,bold:false,italic:false,align:'left',photoSize:100});
 function styleBlocks(root){
  if(state.atsMode)return;
  root.querySelectorAll('[data-cv-section],.portrait-wrap,.identity').forEach(el=>{
   const id=el.dataset.cvSection||(el.matches('.portrait-wrap')?'portrait':'identity');el.dataset.block=id;
   const b=config().blocks[id];if(!b)return;
   Object.assign(el.style,{position:'relative',left:b.x+'px',top:b.y+'px',width:b.width+'%',fontSize:b.size+'px',lineHeight:b.line,fontWeight:b.bold?'700':'',fontStyle:b.italic?'italic':'',textAlign:b.align});
   if(id==='portrait'){el.style.width=b.photoSize+'px';el.querySelectorAll('img,.cv-monogram').forEach(img=>{img.style.setProperty('width',b.photoSize+'px','important');img.style.setProperty('height',b.photoSize+'px','important');img.style.minHeight='0';});}
  });
  root.querySelectorAll('.cv-main,.cv-side').forEach(lane=>{
   const sections=[...lane.children].filter(x=>x.matches('[data-cv-section]'));
   const original=sections.slice();
   sections.sort((a,b)=>{const rank=x=>{const i=config().order.indexOf(x.dataset.cvSection);return i<0?100+original.indexOf(x):i;};return rank(a)-rank(b);});
   sections.forEach(el=>lane.append(el));
  });
 }
 function bottom(root){
  const top=root.getBoundingClientRect().top;
  const scale=root.getBoundingClientRect().width/600;
  return Math.max(0,...[...root.querySelectorAll('h1,h2,h3,p,.skill,.contact-item,.portrait-wrap,.entry-top,.cv-document-mark')].map(el=>(el.getBoundingClientRect().bottom-top)/scale))+20;
 }
 function createSheet(root){
  const sheet=document.createElement('div');sheet.className='a4-sheet';sheet.append(root);stage.append(sheet);return sheet;
 }
 function makeContinuation(section,target){
  let next=[...target.children].find(el=>el.dataset.cvSection===section.dataset.cvSection);
  if(!next){next=section.cloneNode(false);const heading=section.querySelector('h2').cloneNode(true);heading.textContent+=' (continued)';next.append(heading);target.prepend(next);}
  return next;
 }
 function flow(first,second,limit){
  for(const laneClass of ['cv-main','cv-side']){
   const lane=first.querySelector('.'+laneClass),target=second.querySelector('.'+laneClass);if(!lane||!target)continue;
   let guard=0;
   while(bottom(first)>limit&&guard++<300){
    const sections=[...lane.children].filter(el=>el.matches('[data-cv-section]'));
    const section=sections.at(-1);if(!section)break;
    const rootTop=first.getBoundingClientRect().top,scale=first.getBoundingClientRect().width/600;
    if((section.getBoundingClientRect().bottom-rootTop)/scale<=limit-20)break;
    const sectionTop=(section.getBoundingClientRect().top-rootTop)/scale;
    // Keep whole sections together whenever they fit on a fresh page.
    if(sectionTop>limit*.45||section.offsetHeight<limit*.55){target.prepend(section);continue;}
    const children=[...section.children].filter(el=>el.tagName!=='H2');
    if(children.length>1){const next=makeContinuation(section,target);next.insertBefore(children.at(-1),next.children[1]||null);continue;}
    const child=children[0],paragraph=child?.matches('p')?child:child?.querySelector('p:last-child');
    if(paragraph&&paragraph.textContent.length>120){
     const original=paragraph.textContent;let low=1,high=original.length-1,best=0;
     while(low<=high){const mid=Math.floor((low+high)/2);paragraph.textContent=original.slice(0,mid);if(bottom(first)<=limit){best=mid;low=mid+1;}else high=mid-1;}
     let cut=original.lastIndexOf(' ',best);if(cut<1)cut=best;
     if(cut>0){paragraph.textContent=original.slice(0,cut);const next=makeContinuation(section,target),tail=document.createElement('p');tail.textContent=original.slice(cut);next.insertBefore(tail,next.children[1]||null);continue;}
     paragraph.textContent=original;
    }
    target.prepend(section);
   }
  }
 }
 window.layoutCanvas=function(){
  const cfg=config();active=Math.min(active,cfg.pages-1);
  // app.render has just rebuilt page one; calls before export rebuild it too.
  if(preview.parentElement!==stage){stage.prepend(preview);}
  stage.querySelectorAll('.a4-sheet').forEach(el=>el.remove());
  preview.style.removeProperty('transform');preview.style.removeProperty('min-height');
  preview.style.setProperty('--section-gap',cfg.gap+'px');
  styleBlocks(preview);
  const allText=preview.textContent;
  pages=[createSheet(preview)];
  const available=848.571-cfg.margin*2*600/210;
  const innerWidth=600-cfg.margin*2*600/210;
  // Width is fixed at 600 design units and scaled uniformly into the A4 margins.
  const fitWidth=innerWidth/600;
  const limit=available/fitWidth;
  if(cfg.pages===2){
   const second=preview.cloneNode(true);second.removeAttribute('id');second.querySelectorAll('[data-cv-section],.portrait-wrap,.cv-document-mark,.contact-strip').forEach(el=>el.remove());
   second.classList.add('continuation');pages.push(createSheet(second));flow(preview,second,limit);
  }
  let tooMuch=false;
  pages.forEach(sheet=>{
   const root=sheet.firstElementChild;
   const needed=bottom(root);const fit=Math.min(1,limit/Math.max(needed,1));
   const scale=Math.max(.72,fit)*fitWidth;
   root.style.transform=`scale(${scale*793.700787/600})`;
   root.style.transformOrigin='top left';root.style.margin='0';
   root.style.minHeight=(available/scale)+'px';
   root.style.left=cfg.margin+'mm';root.style.top=cfg.margin+'mm';
   if(fit<.72)tooMuch=true;
   const bounds=sheet.getBoundingClientRect();
   for(const element of root.querySelectorAll('h1,h2,h3,p,.skill,.contact-item,.portrait-wrap,.entry-top')){
    const box=element.getBoundingClientRect();
    if(box.left<bounds.left-1||box.right>bounds.right+1||box.top<bounds.top-1||box.bottom>bounds.bottom+1)tooMuch=true;
   }
  });
  window.canvasOverflow=tooMuch;
  overflow.hidden=!tooMuch;overflow.querySelector('pre').textContent=tooMuch?allText:'';
  status.textContent=tooMuch?'Too much content for this layout. Choose 2 pages, reduce text or spacing, or use a simpler template. PDF export is paused; all content is retained below.':`${cfg.pages} fixed A4 ${cfg.pages===1?'page':'pages'} · Select a block to customize`;
  status.classList.toggle('warning',tooMuch);
  document.querySelector('#canvas-pages').value=cfg.pages;document.querySelector('#canvas-margin').value=cfg.margin;document.querySelector('#canvas-gap').value=cfg.gap;
  updateView();
 };
 function updateView(){
  pages.forEach((page,i)=>{page.classList.toggle('inactive-page',i!==active);page.style.transform=`scale(${zoom})`;});
  stage.style.width=793.700787*zoom+'px';stage.style.height=1122.519685*zoom+'px';
  document.querySelector('#page-label').textContent=`Page ${active+1} of ${pages.length}`;
  document.querySelector('#page-prev').disabled=active===0;document.querySelector('#page-next').disabled=active===pages.length-1;
  document.querySelector('#zoom-label').textContent=Math.round(zoom*100)+'%';
  stage.querySelectorAll('[data-block]').forEach(el=>el.classList.toggle('selected-block',el.dataset.block===selected));
 }
 function fitZoom(){zoom=Math.min(1,Math.max(.2,(document.querySelector('.preview-area').clientWidth-60)/793.700787));updateView();}
 function showSelection(){
  document.querySelector('#block-options').hidden=!selected;document.querySelector('#block-label').textContent=selected?`Editing ${selected}`:'Select a section or portrait to adjust it';
  if(!selected)return;const b=settings();
  for(const prop of ['size','line','width','x','y','photoSize','align'])document.querySelector('#block-'+prop).value=b[prop];
  for(const prop of ['bold','italic'])document.querySelector('#block-'+prop).setAttribute('aria-pressed',b[prop]);
  updateView();
 }
 function refresh(){render();save();showSelection();}
 for(const prop of ['pages','margin','gap'])document.querySelector('#canvas-'+prop).addEventListener('change',e=>{config()[prop]=Number(e.target.value);state.canvas=normalizeCanvas(config());refresh();});
 for(const prop of ['size','line','width','x','y','photoSize','align'])document.querySelector('#block-'+prop).addEventListener('change',e=>{settings()[prop]=prop==='align'?e.target.value:Number(e.target.value);state.canvas=normalizeCanvas(config());refresh();});
 for(const prop of ['bold','italic'])document.querySelector('#block-'+prop).onclick=()=>{settings()[prop]=!settings()[prop];refresh();};
 for(const [id,delta] of [['up',-1],['down',1]])document.querySelector('#block-'+id).onclick=()=>{
  const el=pages[active].querySelector(`[data-cv-section="${selected}"]`);if(!el)return;
  const siblings=[...el.parentElement.children].filter(el=>el.dataset.cvSection).map(el=>el.dataset.cvSection);const i=siblings.indexOf(selected),j=i+delta;
  if(j<0||j>=siblings.length)return;[siblings[i],siblings[j]]=[siblings[j],siblings[i]];config().order=[...siblings,...config().order.filter(x=>!siblings.includes(x))];refresh();
 };
 document.querySelector('#block-reset').onclick=()=>{delete config().blocks[selected];refresh();};
 document.querySelector('#page-prev').onclick=()=>{active--;updateView();};document.querySelector('#page-next').onclick=()=>{active++;updateView();};
 document.querySelector('#zoom-in').onclick=()=>{zoom=Math.min(1.5,zoom+.1);updateView();};document.querySelector('#zoom-out').onclick=()=>{zoom=Math.max(.2,zoom-.1);updateView();};document.querySelector('#zoom-reset').onclick=fitZoom;
 stage.addEventListener('pointerdown',event=>{
  const block=event.target.closest('[data-block]');if(!block)return;selected=block.dataset.block;showSelection();
  const b=settings();drag={id:event.pointerId,x:event.clientX,y:event.clientY,startX:b.x,startY:b.y,scale:block.closest('.resume').getBoundingClientRect().width/600};stage.setPointerCapture(event.pointerId);
 });
 stage.addEventListener('pointermove',event=>{if(!drag)return;const b=settings();b.x=Math.max(-100,Math.min(100,drag.startX+(event.clientX-drag.x)/drag.scale));b.y=Math.max(-100,Math.min(100,drag.startY+(event.clientY-drag.y)/drag.scale));stage.querySelectorAll(`[data-block="${selected}"]`).forEach(el=>{el.style.left=b.x+'px';el.style.top=b.y+'px';});});
 stage.addEventListener('pointerup',()=>{if(drag){drag=null;refresh();}});stage.addEventListener('pointercancel',()=>{drag=null;refresh();});
 window.addEventListener('resize',fitZoom);
 // Rebuild from state to prevent a second pagination pass from losing page-two blocks.
 const layout=window.layoutCanvas;let layingOut=false;
 window.layoutCanvas=()=>{if(layingOut)return;layingOut=true;try{layout();}finally{layingOut=false;}};
 document.querySelector('#export').addEventListener('click',()=>render(),true);
 window.addEventListener('beforeprint',()=>render());
 render();fitZoom();document.fonts.ready.then(()=>render());
})();
