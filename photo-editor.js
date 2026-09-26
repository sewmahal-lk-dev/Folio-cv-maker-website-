const photoDialog = document.querySelector('#photo-dialog');
const cropImage = document.querySelector('#crop-image');
const applyPhoto = document.querySelector('#apply-photo');
const cropPreview = document.querySelector('#crop-preview');
const photoStatus = document.querySelector('#photo-status');
const zoomControl = document.querySelector('#crop-zoom');
const brightnessControl = document.querySelector('#crop-brightness');
const contrastControl = document.querySelector('#crop-contrast');
const adjustButton = document.createElement('button');
adjustButton.id = 'adjust-photo';
adjustButton.type = 'button';
adjustButton.className = 'text-button';
adjustButton.innerHTML = `${icon('sliders')} Adjust`;
document.querySelector('#remove-photo').before(adjustButton);
let cropper = null;
let workingSource = '';
let previewFrame = 0;
let ready = false;

function syncPhotoButton() { adjustButton.hidden = !state.photo; }
new MutationObserver(syncPhotoButton).observe(preview, {childList:true});
syncPhotoButton();

function renderCropPreview() {
  if (!cropper || !ready) return;
  const canvas = cropper.getCroppedCanvas({width:480,height:480,fillColor:'#fff',imageSmoothingQuality:'high'});
  if (!canvas) return;
  const filter = `brightness(${brightnessControl.value}%) contrast(${contrastControl.value}%)`;
  const context = cropPreview.getContext('2d');
  context.clearRect(0,0,480,480);
  context.filter = filter;
  context.drawImage(canvas,0,0,480,480);
  context.filter = 'none';
  document.querySelectorAll('.crop-stage .cropper-canvas img,.crop-stage .cropper-view-box img').forEach(img=>{img.style.filter=filter;});
  const data = cropper.getImageData();
  const ratio = data.width/data.naturalWidth;
  zoomControl.max = Math.max(3,ratio).toFixed(2);
  zoomControl.value = ratio;
  document.querySelector('#crop-zoom-value').textContent = `${Math.round(ratio*100)}%`;
  document.querySelector('#crop-brightness-value').textContent = `${brightnessControl.value}%`;
  document.querySelector('#crop-contrast-value').textContent = `${contrastControl.value}%`;
}
function queuePreview() {
  cancelAnimationFrame(previewFrame);
  previewFrame=requestAnimationFrame(renderCropPreview);
}
function openPhotoEditor(source, edits=null) {
  if (typeof Cropper !== 'function') { photoStatus.textContent='The photo editor could not load. Reload the page and try again.'; return; }
  cropper?.destroy();
  cropper=null;
  ready=false;
  workingSource=source;
  applyPhoto.disabled=true;
  brightnessControl.value=edits?.brightness || 100;
  contrastControl.value=edits?.contrast || 100;
  document.querySelector('#crop-status').textContent='';
  const shape=window.FOLIO_TEMPLATES.find(template=>template.id===state.design).photo;
  cropPreview.style.borderRadius=shape==='circle'?'50%':shape==='arch'?'60px 60px 0 0':'0';
  cropImage.onerror=()=>{document.querySelector('#crop-status').textContent='This saved photo could not be opened. Cancel and upload a new image.';};
  photoDialog.showModal();
  cropImage.src=source;
  cropper=new Cropper(cropImage, {
    aspectRatio:1,viewMode:1,dragMode:'move',autoCropArea:0.8,background:false,
    responsive:true,checkOrientation:false,toggleDragModeOnDblclick:false,
    ready() {
      ready=true;
      if(edits) cropper.setData(edits);
      renderCropPreview();
      applyPhoto.disabled=false;
    },
    crop:queuePreview
  });
}
document.querySelector('#photo-input').addEventListener('change',async event=>{
  const file=event.target.files[0];
  if(!file)return;
  const version=++photoVersion;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024){photoStatus.textContent='Choose a JPG, PNG or WebP under 8 MB.';event.target.value='';return;}
  photoStatus.textContent='Preparing photo...';
  let bitmap;
  try {
    bitmap=await createImageBitmap(file);
    const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(bitmap.width*scale));
    canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    const context=canvas.getContext('2d');
    context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);
    context.drawImage(bitmap,0,0,canvas.width,canvas.height);
    if(version!==photoVersion)return;
    photoStatus.textContent='';
    openPhotoEditor(canvas.toDataURL('image/jpeg',0.85));
  } catch { photoStatus.textContent='This image could not be opened. Try another photo.'; }
  finally { bitmap?.close();event.target.value=''; }
});
adjustButton.addEventListener('click',()=>openPhotoEditor(state.photoSource||state.photo,state.photoEdits));
zoomControl.addEventListener('input',()=>{if(ready)cropper.zoomTo(Number(zoomControl.value));});
brightnessControl.addEventListener('input',queuePreview);
contrastControl.addEventListener('input',queuePreview);
document.querySelectorAll('[data-photo-action]').forEach(button=>button.addEventListener('click',()=>{
  if(!ready)return;
  const actions={left:()=>cropper.move(-12,0),right:()=>cropper.move(12,0),up:()=>cropper.move(0,-12),down:()=>cropper.move(0,12),rotate:()=>cropper.rotate(90),flip:()=>cropper.scaleX(-cropper.getData().scaleX),reset:()=>{cropper.reset();brightnessControl.value=100;contrastControl.value=100;}};
  actions[button.dataset.photoAction]();
  queuePreview();
}));
applyPhoto.addEventListener('click',()=>{
  if(!cropper||!ready)return;
  try {
    renderCropPreview();
    state.photo=cropPreview.toDataURL('image/jpeg',0.9);
    state.photoSource=workingSource;
    state.photoEdits={...cropper.getData(),brightness:Number(brightnessControl.value),contrast:Number(contrastControl.value)};
    render();save();photoDialog.close();
  } catch { document.querySelector('#crop-status').textContent='Could not apply these changes. Please try again.'; }
});
for(const id of ['cancel-photo','close-photo'])document.getElementById(id).addEventListener('click',()=>photoDialog.close());
photoDialog.addEventListener('close',()=>{ready=false;cancelAnimationFrame(previewFrame);cropper?.destroy();cropper=null;workingSource='';cropImage.removeAttribute('src');});
for(const id of ['remove-photo','confirm-reset'])document.getElementById(id).addEventListener('click',()=>{state.photoSource='';state.photoEdits=null;save();});

// Template links change presentation while preserving the visitor's draft.
const selection=new URLSearchParams(location.search);
let changed=false;
if(templates.some(t=>t[0]===selection.get('design'))){state.design=selection.get('design');state.font='template';state.color=window.FOLIO_TEMPLATES.find(t=>t.id===state.design).color;changed=true;}
if(/^#[\da-f]{6}$/i.test(selection.get('color'))){state.color=selection.get('color');changed=true;}
if(['professional','internship','graduate','academic','creative'].includes(selection.get('purpose'))){state.purpose=selection.get('purpose');changed=true;}
if(changed){renderFields();save();history.replaceState(null,'',location.pathname+location.hash);}
document.querySelectorAll('.brand').forEach(link=>{link.href='index.html';});
