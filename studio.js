// Lucide icon geometry, ISC license: https://lucide.dev/license
const iconPaths = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
  moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.464.402.807a6.25 6.25 0 0 0 8.268 8.268c.344-.215.83-.004.803.397"/>',
  save: '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7H7v7M7 3v5h8"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  'arrow-right': '<path d="M5 12h14m-7-7 7 7-7 7"/>',
  'arrow-up-right': '<path d="M7 7h10v10M7 17 17 7"/>',
  'arrow-left': '<path d="m12 19-7-7 7-7m7 7H5"/>',
  'arrow-up': '<path d="m5 12 7-7 7 7m-7 7V5"/>',
  'arrow-down': '<path d="m19 12-7 7-7-7m7-7v14"/>',
  'rotate-cw': '<path d="M21 7v5h-5M3 12a9 9 0 0 1 15.4-6.4L21 8M3 16a9 9 0 0 0 15.4 2.4"/>',
  'rotate-ccw': '<path d="M3 7v5h5M21 12A9 9 0 0 0 5.6 5.6L3 8m18 8a9 9 0 0 1-15.4 2.4"/>',
  'flip-horizontal': '<path d="M12 3v18M16 7h5v10h-5M8 7H3v10h5"/>',
  x: '<path d="m18 6-12 12M6 6l12 12"/>',
  check: '<path d="m20 6-11 11-5-5"/>',
  sliders: '<path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M1 14h6m2-6h6m2 8h6"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.35 1.9.69 2.79a2 2 0 0 1-.45 2.11L8.09 9.89a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.83.57 2.79.69A2 2 0 0 1 22 16.92z"/>',
  github: '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 19 4.77 5.07 5.07 0 0 0 18.91 1S17.73.65 15 2.48a13.38 13.38 0 0 0-7 0C5.27.65 4.09 1 4.09 1A5.07 5.07 0 0 0 4 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 8 18.13V22"/>',
  linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>'
};
function icon(name) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths['arrow-up-right']}</svg>`;
}
document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });

const themeButton = document.querySelector('#theme-toggle');
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === 'dark';
  const label = `Switch to ${dark ? 'light' : 'dark'} mode`;
  themeButton.innerHTML = icon(dark ? 'sun' : 'moon');
  themeButton.title = label;
  themeButton.setAttribute('aria-label', label);
  themeButton.setAttribute('aria-pressed', String(dark));
  document.querySelector('meta[name="theme-color"]').content = dark ? '#141516' : '#f8fafb';
}
applyTheme(document.documentElement.dataset.theme);
themeButton.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem('folio-theme', next); } catch { /* The theme still works for this visit. */ }
});

const owner = window.FOLIO_OWNER || {};
if (owner.name?.trim()) {
  document.querySelector('#creator-heading').textContent = owner.name;
  document.querySelector('#creator-shortcut-label').textContent = `By ${owner.name}`;
  document.querySelector('#owner-credit').textContent = `Created by ${owner.name}`;
  document.querySelector('.creator-photo').alt = `${owner.name}, creator of Folio`;
}
const creatorLinks = document.querySelector('#creator-links');
function addOwnerLink(label, href, symbol, external = false) {
  const link = document.createElement('a');
  link.href = href;
  link.innerHTML = icon(symbol);
  const text = document.createElement('span');
  text.textContent = label;
  link.append(text);
  if (external) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
  creatorLinks.append(link);
  creatorLinks.hidden = false;
}
for (const [field, label, domain] of [['github', 'GitHub', 'github.com'], ['linkedin', 'LinkedIn', 'linkedin.com']]) {
  if (!owner[field]) continue;
  try {
    const url = new URL(owner[field]);
    if (url.protocol === 'https:' && (url.hostname === domain || url.hostname.endsWith(`.${domain}`))) addOwnerLink(label, url.href, field, true);
  } catch { /* Incomplete public links stay hidden. */ }
}
if (owner.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(owner.email)) addOwnerLink(owner.email, `mailto:${encodeURIComponent(owner.email)}`, 'mail');
if (owner.phone && /^\+?[\d\s()-]{6,25}$/.test(owner.phone)) addOwnerLink(owner.phone, `tel:${owner.phone.replace(/[^+\d]/g, '')}`, 'phone');
if (owner.whatsapp && /^\+[1-9]\d{7,14}$/.test(owner.whatsapp)) addOwnerLink('WhatsApp', `https://wa.me/${owner.whatsapp.slice(1)}`, 'phone', true);

if (document.querySelector('#cv-preview')) {
let nextDetail;
function updateProgress() {
  const student = ['internship', 'graduate', 'academic'].includes(state.purpose);
  const hasEntry = kind => state[kind].some(entry => entry.visible!==false && entry.role.trim() && (entry.organization.trim() || entry.description.trim()));
  const careerSections=(student?['education','projects','experience']:['experience','education','projects']).filter(key=>cvIncludes(state,key));
  const career=careerSections[0];
  const contactFields=['email','phone'].filter(key=>cvIncludes(state,key));
  const checks = [
    { include:true, done: !!state.name.trim(), text: 'Add your name', tab: 'details', selector: '[name="name"]' },
    { include:cvIncludes(state,'title'), done: !!state.title.trim(), text: 'Add your professional title', tab: 'details', selector: '[name="title"]' },
    { include:contactFields.length>0, done: contactFields.some(key=>state[key].trim()), text: 'Add a way to reach you', tab: 'details', selector: `[name="${contactFields[0]}"]` },
    { include:cvIncludes(state,'summary'), done: !!state.summary.trim(), text: student ? 'Add your career objective' : 'Add your introduction', tab: 'details', selector: '[name="summary"]' },
    { include:careerSections.length>0, done: careerSections.some(hasEntry), text: `Add your ${career}`, tab: career==='projects'?'extras':career, add:career },
    { include:cvIncludes(state,'skills'), done: !!state.skills.split(',').some(skill => skill.trim()), text: 'Add your skills', tab: 'extras', selector: '[name="skills"]' }
  ].filter(check=>check.include);
  const count = checks.filter(check => check.done).length;
  document.querySelector('#cv-progress').max = checks.length;
  document.querySelector('#cv-progress').value = count;
  document.querySelector('#progress-count').textContent = `${count} / ${checks.length}`;
  nextDetail = checks.find(check => !check.done);
  document.querySelector('#next-detail').hidden = !nextDetail;
  document.querySelector('#progress-complete').hidden = !!nextDetail;
  if (nextDetail) document.querySelector('#progress-next').textContent = nextDetail.text;
  document.querySelector('.draft-progress').classList.toggle('complete', !nextDetail);
}
document.querySelector('#next-detail').addEventListener('click', () => {
  if (!nextDetail) return;
  const target = nextDetail;
  document.querySelector(`[data-tab="${target.tab}"]`).click();
  if (target.add && !state[target.add].some(entry=>entry.visible!==false)) document.querySelector(`[data-add="${target.add}"]`).click();
  const index=target.add?state[target.add].findIndex(entry=>entry.visible!==false):0;
  const input = document.querySelector(target.selector || `[data-kind="${target.add}"][data-index="${index}"][data-field="role"]`);
  input?.focus();
});
new MutationObserver(updateProgress).observe(preview, {childList: true});
updateProgress();
}

let toastTimer;
function showToast(message) {
  const toast = document.querySelector('#studio-status');
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2500);
}
document.querySelector('#backup')?.addEventListener('click', () => showToast('Your editable draft is ready to download.'));
