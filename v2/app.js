(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const store={
  get(k){try{return localStorage.getItem(k)}catch(e){return null}},
  set(k,v){try{localStorage.setItem(k,v)}catch(e){}}
};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// ───────────────────────── icons ─────────────────────────
const ICONS={
  home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  briefcase:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/>',
  network:'<circle cx="5" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><path d="M6.8 7.2 10.3 11M6.8 16.8l3.5-3.8M14 12h3"/>',
  pin:'<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  cap:'<path d="M2 9.5 12 5l10 4.5L12 14z"/><path d="M6 11.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5"/><path d="M22 9.5V15"/>',
  flask:'<path d="M9 3h6"/><path d="M10 3v6.2L4.6 18.6A1.6 1.6 0 0 0 6 21h12a1.6 1.6 0 0 0 1.4-2.4L14 9.2V3"/><path d="M7.2 15h9.6"/>',
  music:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  at:'<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.9 7.9"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  arrow:'<path d="M7 17 17 7M8 7h9v9"/>',
  copy:'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  chevrons:'<path d="m13 17 5-5-5-5M6 17l5-5-5-5"/>',
  up:'<path d="m18 15-6-6-6 6"/>',
  down:'<path d="m6 9 6 6 6-6"/>',
  trophy:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  tag:'<path d="M3 12V3h9l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.4"/>',
  link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  shapes:'<circle cx="7" cy="7" r="4"/><rect x="13" y="13" width="8" height="8" rx="1.5"/><path d="M17.5 3 21 9h-7z"/>',
  text:'<path d="M4 7V5h16v2M12 5v14M9 19h6"/>',
  table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/>',
  grid:'<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
  pointer:'<path d="M5 3v15l4-3.6 2.6 6 2.4-1-2.6-5.9H17z"/>',
  sparkle:'<path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z"/><path d="M19 15.5c.2 1.6.9 2.3 2.5 2.5-1.6.2-2.3.9-2.5 2.5-.2-1.6-.9-2.3-2.5-2.5 1.6-.2 2.3-.9 2.5-2.5z"/>',
  book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5V21h16"/>',
  hospital:'<path d="M3 21h18M5 21V8l7-5 7 5v13"/><path d="M12 9v6M9 12h6"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  droplet:'<path d="M12 3s6.5 6.6 6.5 11.3A6.5 6.5 0 0 1 5.5 14.3C5.5 9.6 12 3 12 3z"/><path d="M9 14.5a3 3 0 0 0 3 3"/>',
  tornado:'<path d="M21 4H3M18 8H6M19 12H9M16 16h-6M11 20H9"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  monitor:'<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M6 11h2.5l1.5-3 3 6 1.5-3H18"/>',
  microscope:'<path d="M6 18h8M3 22h18M14 22a7 7 0 1 0 0-14h-1M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>',
  card:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>'
};
const FILLED={
  github:'<path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5z"/>',
  linkedin:'<path d="M4.98 3.5a2.5 2.5 0 1 1-.02 5 2.5 2.5 0 0 1 .02-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95C21.4 8.75 22 11 22 14.1V21h-4v-6.1c0-1.45-.03-3.3-2.05-3.3-2.05 0-2.37 1.57-2.37 3.2V21h-4z"/>'
};
function icon(name,cls=''){
  const c=('ic '+cls).trim();
  if(FILLED[name])return `<svg class="${c}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${FILLED[name]}</svg>`;
  return `<svg class="${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||''}</svg>`;
}
function hydrate(root=document){
  $$('i.ic[data-i]',root).forEach(el=>{el.outerHTML=icon(el.dataset.i,el.className.replace(/\bic\b/,''))});
}

// ───────────────────────── data ─────────────────────────
// inputs only earn a place when two or more projects draw on them
const INPUTS=['python','pandas','sql','scikit-learn','pytorch','computer vision','apis'];
const PROJECTS=[
  {id:'gummi',t:'Gummi',icon:'droplet',type:'Hackathon',note:'Overall winner, WolfHacks 2026',win:true,
   d:'A glucose coach for people with prediabetes. It looks two hours ahead, suggests a walk before a spike, and checks every prediction against what actually happened. I built the backend on Databricks: the app, all six agents, MLflow tracing and the self-improving prompt loop.',
   tags:['databricks','mlflow','fastapi','agent bricks'],feeds:[0,1,2,6],a:[1,2,3],b:[0,1],
   url:'https://github.com/THEpranavsomalraju/gummi'},
  {id:'refuge',t:'Refuge',icon:'tornado',type:'Datathon',note:'1st place, Carolina Data Challenge 2026',win:true,
   d:'Send a tornado or hurricane through any real US town, turn its schools and churches into shelters, then replay the storm against the best possible plan. I built the risk models and the simulator calibration.',
   tags:['lightgbm','shap','polars','noaa data'],feeds:[0,1,2,3],a:[0,1,3],b:[0,2],
   url:'https://github.com/THEpranavsomalraju/refuge',live:'https://refugestorms.vercel.app'},
  {id:'eyecode',t:'EyeCode',icon:'eye',type:'Hackathon',note:'2nd place, HackNC 2025',win:true,
   d:'A webcam turns eye blinks into Morse code, then into text.',
   tags:['python','flask','opencv','mediapipe'],feeds:[0,5,6],a:[0,1],b:[0,1],
   url:'https://github.com/THEpranavsomalraju/eyecode'},
  {id:'clinician',t:'Clinician GUI',icon:'monitor',type:'Research',note:'Caltech × Duke',
   d:'Built with a Caltech mentor so clinicians run the rejection model with no terminal, no IDE, and no machine learning background.',
   tags:['typescript','react','tailwind','vite'],feeds:[4,5],a:[1,2],b:[1,2],
   url:'https://github.com/THEpranavsomalraju/Clinician-GUI'},
  {id:'rejection',t:'Rejection Classifier',icon:'microscope',type:'Research',note:'98% validation accuracy',
   d:'A fine-tuned ResNet50 grading cardiac transplant rejection at 98% validation accuracy, and 99.2% on the two calls pathologists agree on least.',
   tags:['pytorch','resnet50','umap'],feeds:[0,3,4,5],a:[0,2,3],b:[0,2],
   url:'https://github.com/THEpranavsomalraju/Rejection-Classifer-Caltech-Duke'},
  {id:'card',t:'Card Dispute PRD',icon:'card',type:'Product',note:'21,508 CFPB narratives',
   d:'21,508 CFPB complaint narratives, six tagged failure patterns, and one scoped fix at the denial stage, checked against Regulation Z.',
   tags:['product','python','cfpb api'],feeds:[0,1,6],a:[2,3],b:[1,2],
   url:'https://github.com/THEpranavsomalraju/card-dispute-prd'}
];
const EMAIL='somalrajupc@gmail.com';
const LINKS={github:'https://github.com/THEpranavsomalraju',linkedin:'https://linkedin.com/in/pranavsomalraju'};

// ───────────────────────── render static bits ─────────────────────────
$('#wins').innerHTML=PROJECTS.map((p,i)=>p.win?`
  <div class="row blk" data-p="${i}" role="button" tabindex="0" aria-label="Open ${esc(p.t)}">
    <span class="row-ic">${icon(p.icon)}</span><span class="row-t">${esc(p.t)}</span>
    <span class="row-m">${esc(p.note)}</span>${icon('arrow','go')}
  </div>`:'').join('');

$('#toolbox').innerHTML=INPUTS.map((t,i)=>{
  const used=PROJECTS.filter(p=>p.feeds.includes(i)).map(p=>p.t);
  return `<span class="code" tabindex="0" data-tip="${esc(used.join(', '))}">${esc(t)}</span>`;
}).join('');

$('#db tbody').innerHTML=PROJECTS.map((p,i)=>`
  <tr data-p="${i}" tabindex="0" aria-label="Open ${esc(p.t)}">
    <td><span class="nm">${icon(p.icon)}${esc(p.t)}<span class="open">open</span></span></td>
    <td><span class="ty">${esc(p.type)}</span></td>
    <td class="nt">${esc(p.note)}</td>
    <td class="stk-c"><span class="stk">${p.tags.slice(0,2).map(t=>`<span>${esc(t)}</span>`).join('')}${p.tags.length>2?`<span class="more">+${p.tags.length-2}</span>`:''}</span></td>
  </tr>`).join('');

hydrate();

// ───────────────────────── theme ─────────────────────────
const root=document.documentElement;
const themeNow=()=>root.dataset.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
function syncThemeBtn(){$('#theme').innerHTML=icon(themeNow()==='dark'?'sun':'moon')}
function setTheme(t,x=innerWidth-40,y=22){
  const apply=()=>{root.dataset.theme=t;store.set('v2-theme',t);syncThemeBtn();cover.recolor()};
  if(!document.startViewTransition||reduce){apply();return}
  const vt=document.startViewTransition(apply);
  vt.ready.then(()=>{
    const r=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
    root.animate({clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${r}px at ${x}px ${y}px)`]},
      {duration:620,easing:'cubic-bezier(.65,0,.25,1)',pseudoElement:'::view-transition-new(root)'});
  }).catch(()=>{});
}
const toggleTheme=(x,y)=>setTheme(themeNow()==='dark'?'light':'dark',x,y);
$('#theme').addEventListener('click',e=>toggleTheme(e.clientX,e.clientY));
syncThemeBtn();

// ───────────────────────── toast ─────────────────────────
let toastT;
function toast(msg){
  const t=$('#toast');t.textContent=msg;t.classList.add('on');
  clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),1800);
}
function copyEmail(){
  (navigator.clipboard?navigator.clipboard.writeText(EMAIL):Promise.reject())
    .then(()=>toast('Email copied'),()=>{location.href='mailto:'+EMAIL});
}

// ───────────────────────── top bar ─────────────────────────
addEventListener('scroll',()=>$('#topbar').classList.toggle('scrolled',scrollY>4),{passive:true});
(function edited(){
  const d=new Date(document.lastModified);
  if(isNaN(d))return;
  const s=(Date.now()-d)/1000;
  const rel=s<90?'just now':s<3600?Math.round(s/60)+' min ago':s<86400?Math.round(s/3600)+'h ago'
    :s<86400*30?Math.round(s/86400)+'d ago':d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  $('#edited').textContent='Edited '+rel;
})();

// ───────────────────────── tabs ─────────────────────────
const TABS={home:{t:'Home',i:'home'},experience:{t:'Experience',i:'briefcase'},projects:{t:'Projects',i:'network'}};
const tabBtns=$$('.tab');
let curTab=null;
function moveInk(instant){
  const b=$(`.tab[data-tab="${curTab}"]`),ink=$('#tab-ink');
  if(!b)return;
  if(instant)ink.style.transition='none';
  ink.style.transform=`translateX(${b.offsetLeft}px)`;ink.style.width=b.offsetWidth+'px';
  if(instant){void ink.offsetWidth;ink.style.transition=''}
}
function setTab(name,{instant=false}={}){
  if(!TABS[name])name='home';
  if(name===curTab)return;
  curTab=name;
  tabBtns.forEach(b=>{const on=b.dataset.tab===name;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1});
  $$('.view').forEach(v=>{
    const on=v.dataset.view===name;v.hidden=!on;
    v.classList.remove('enter');
    if(on&&!instant&&!reduce){void v.offsetWidth;v.classList.add('enter')}
  });
  moveInk(instant);
  $('#crumb').innerHTML=icon(TABS[name].i)+`<span>${TABS[name].t}</span>`;
  document.title=name==='home'?'Pranav Somalraju':`${TABS[name].t} · Pranav Somalraju`;
  if(name==='projects')net.enter(); else net.leave();
}
function route(){
  const [tab,pid]=location.hash.replace(/^#/,'').split('/');
  setTab(TABS[tab]?tab:'home',{instant:curTab===null});
  const k=PROJECTS.findIndex(p=>p.id===pid);
  if(k>=0)openPeek(k,{fromRoute:true}); else if(peekIdx>=0)closePeek({fromRoute:true});
}
tabBtns.forEach((b,i)=>{
  b.addEventListener('click',()=>{location.hash=b.dataset.tab});
  b.addEventListener('keydown',e=>{
    if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
    const n=tabBtns[(i+(e.key==='ArrowRight'?1:-1)+tabBtns.length)%tabBtns.length];
    n.focus();location.hash=n.dataset.tab;
  });
});
addEventListener('resize',()=>moveInk(true));
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>moveInk(true));

// ───────────────────────── side peek ─────────────────────────
const peek=$('#peek'),scrim=$('#scrim');
let peekIdx=-1,lastFocus=null;
function renderPeek(p){
  const feeds=p.feeds.map(i=>`<span class="code">${esc(INPUTS[i])}</span>`).join('');
  $('#peek-body').innerHTML=`
    <div class="pk-icon">${icon(p.icon)}</div>
    <h1 class="pk-title" id="pk-title">${esc(p.t)}</h1>
    <div class="props">
      <div class="prop"><span class="k">${icon('shapes')}Type</span><span class="v"><span class="pill">${esc(p.type)}</span></span></div>
      <div class="prop"><span class="k">${icon('trophy')}Note</span><span class="v">${esc(p.note)}</span></div>
      <div class="prop"><span class="k">${icon('tag')}Stack</span><span class="v">${p.tags.map(t=>`<span class="pill">${esc(t)}</span>`).join('')}</span></div>
      <div class="prop"><span class="k">${icon('link')}Links</span><span class="v links">
        ${p.live?`<a href="${p.live}" target="_blank" rel="noopener">play it live</a>`:''}
        <a href="${p.url}" target="_blank" rel="noopener">github</a></span></div>
    </div>
    <hr>
    <p class="pk-desc">${esc(p.d)}</p>
    <div class="pal-g" style="padding-left:0">feeds from</div>
    <div class="pk-feeds">${feeds}</div>`;
  const o=$('#pk-open');o.href=p.live||p.url;$('#pk-open-t').textContent=p.live?'Play it live':'Open on GitHub';
  const body=$('#peek-body');body.scrollTop=0;
  if(!reduce){body.classList.remove('swap');void body.offsetWidth;body.classList.add('swap')}
}
function openPeek(k,{fromRoute=false}={}){
  if(!PROJECTS[k])return;
  if(peekIdx<0)lastFocus=document.activeElement;
  peekIdx=k;renderPeek(PROJECTS[k]);
  peek.classList.add('open');scrim.classList.add('on');peek.setAttribute('aria-hidden','false');
  net.hold(k);
  if(!fromRoute)history.replaceState(null,'',`#${curTab}/${PROJECTS[k].id}`);
  setTimeout(()=>$('#pk-close').focus({preventScroll:true}),60);
}
function closePeek({fromRoute=false}={}){
  if(peekIdx<0)return;
  peekIdx=-1;peek.classList.remove('open');scrim.classList.remove('on');peek.setAttribute('aria-hidden','true');
  net.hold(-1);
  if(!fromRoute)history.replaceState(null,'','#'+curTab);
  if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});
}
const stepPeek=d=>openPeek((peekIdx+d+PROJECTS.length)%PROJECTS.length);
$('#pk-close').addEventListener('click',()=>closePeek());
$('#pk-prev').addEventListener('click',()=>stepPeek(-1));
$('#pk-next').addEventListener('click',()=>stepPeek(1));
scrim.addEventListener('click',()=>closePeek());
document.addEventListener('click',e=>{
  const r=e.target.closest('[data-p]');
  if(r)openPeek(+r.dataset.p);
});
document.addEventListener('keydown',e=>{
  const r=e.target.closest&&e.target.closest('[data-p]');
  if(r&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openPeek(+r.dataset.p)}
});
// table rows light their path in the network above
$$('#db tbody tr').forEach(tr=>{
  tr.addEventListener('pointerenter',()=>net.show(+tr.dataset.p));
  tr.addEventListener('pointerleave',()=>net.show(-1));
});

// ───────────────────────── network ─────────────────────────
const net=(()=>{
  const svg=$('#net');
  const narrow=matchMedia('(max-width: 760px)');
  const spread=(n,lo,hi)=>Array.from({length:n},(_,i)=>Math.round(lo+i*(hi-lo)/(n-1)));
  const IY=spread(INPUTS.length,52,412),AY=spread(4,112,352),BY=spread(3,152,312),OY=spread(PROJECTS.length,60,404);
  const d=(x1,y1,x2,y2)=>{const k=.45*(x2-x1);return `M${x1} ${y1} C${x1+k} ${y1}, ${x2-k} ${y2}, ${x2} ${y2}`};
  let edges=[],outs=[],XI=0;
  // on a phone the layers tuck in and the projects go icon-only; the table
  // underneath carries their names
  function draw(){
    const c=narrow.matches;
    XI=c?140:190;const XA=c?212:400,XB=c?276:600,XO=c?338:780;
    let h=`<text class="lab" x="${XI-16}" y="18" text-anchor="end">what i use</text>`+
          `<text class="lab" x="${XO}" y="18" text-anchor="${c?'middle':'start'}" dx="${c?0:-18}">what it made</text>`;
    IY.forEach((y,i)=>AY.forEach((ya,j)=>{h+=`<path class="edge e-i${i}-a${j}" d="${d(XI,y,XA,ya)}"/>`}));
    AY.forEach((ya,j)=>BY.forEach((yb,m)=>{h+=`<path class="edge e-a${j}-b${m}" d="${d(XA,ya,XB,yb)}"/>`}));
    BY.forEach((yb,m)=>OY.forEach((yo,k)=>{h+=`<path class="edge e-b${m}-o${k}" d="${d(XB,yb,XO,yo)}"/>`}));
    AY.forEach((y,j)=>{h+=`<g class="node nh a${j}"><circle cx="${XA}" cy="${y}" r="5"/></g>`});
    BY.forEach((y,m)=>{h+=`<g class="node nh b${m}"><circle cx="${XB}" cy="${y}" r="5"/></g>`});
    INPUTS.forEach((t,i)=>{const y=IY[i];
      h+=`<g class="node ni i${i}" data-i="${i}"><circle cx="${XI}" cy="${y}" r="6"/><text x="${XI-16}" y="${y+4.5}" text-anchor="end">${esc(t)}</text></g>`});
    PROJECTS.forEach((p,k)=>{const y=OY[k];
      h+=`<g class="node no o${k}" data-o="${k}" tabindex="0" role="button" aria-label="Open ${esc(p.t)}">
        <circle class="ring" cx="${XO}" cy="${y}" r="19"/>
        <circle class="body" cx="${XO}" cy="${y}" r="19"/>
        <svg class="glyph" x="${XO-10}" y="${y-10}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[p.icon]}</svg>
        ${c?'':`<text x="${XO+32}" y="${y+5}">${esc(p.t)}</text>`}</g>`});
    svg.innerHTML=h+`<circle class="spark" r="3.2" cx="${XI}" cy="${IY[0]}" opacity="0"/>`;
    edges=$$('.edge',svg);outs=$$('.no',svg);
    fit();
    if(held>=0){svg.classList.add('dim');lightProject(held)}
  }
  const q=s=>svg.querySelector(s);
  // fit the viewBox to the actual ink, so the net sits dead centre in its frame
  function fit(){
    if(svg.closest('[hidden]'))return;
    const bb=svg.getBBox(),pad=18;
    svg.setAttribute('viewBox',`${bb.x-pad} ${bb.y-pad+4} ${bb.width+pad*2} ${bb.height+pad*2-4}`);
  }
  let held=-1,hover=false,active=false,built=false,sparkT,sparking=false;

  function clear(){
    edges.forEach(e=>e.classList.remove('lit'));
    $$('.ni,.nh',svg).forEach(n=>n.classList.remove('lit'));
    outs.forEach(o=>o.classList.remove('on'));
    svg.classList.remove('dim');
  }
  function lightProject(k,fromInput){
    const p=PROJECTS[k];
    const ins=fromInput==null?p.feeds:[fromInput];
    ins.forEach(i=>{q('.i'+i).classList.add('lit');p.a.forEach(j=>q(`.e-i${i}-a${j}`).classList.add('lit'))});
    p.a.forEach(j=>{q('.a'+j).classList.add('lit');p.b.forEach(m=>q(`.e-a${j}-b${m}`).classList.add('lit'))});
    p.b.forEach(m=>{q('.b'+m).classList.add('lit');q(`.e-b${m}-o${k}`).classList.add('lit')});
    outs[k].classList.add('on');
  }
  function show(k){clear();if(k<0){if(held>=0)show(held);return}svg.classList.add('dim');lightProject(k)}
  function showInput(i){clear();svg.classList.add('dim');PROJECTS.forEach((p,k)=>{if(p.feeds.includes(i))lightProject(k,i)})}

  // delegated, so a redraw keeps working without rewiring
  const target=e=>{const o=e.target.closest('.no');if(o)return{k:+o.dataset.o,el:o};const n=e.target.closest('.ni');if(n)return{i:+n.dataset.i,el:n};return null};
  svg.addEventListener('pointerover',e=>{
    const t=target(e);if(!t||(e.relatedTarget&&t.el.contains(e.relatedTarget)))return;
    hover=true;t.k!=null?show(t.k):showInput(t.i);
  });
  svg.addEventListener('pointerout',e=>{
    const t=target(e);if(!t||(e.relatedTarget&&t.el.contains(e.relatedTarget)))return;
    hover=false;show(-1);
  });
  svg.addEventListener('click',e=>{const t=target(e);if(t&&t.k!=null)openPeek(t.k)});
  svg.addEventListener('keydown',e=>{const t=target(e);if(t&&t.k!=null&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openPeek(t.k)}});
  svg.addEventListener('focusin',e=>{const t=target(e);if(t&&t.k!=null)show(t.k)});
  svg.addEventListener('focusout',()=>show(-1));
  draw();
  narrow.addEventListener('change',draw);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>requestAnimationFrame(fit));

  // first visit: the wiring knits itself together, quickly, once
  function build(){
    built=true;
    if(reduce)return;
    edges.forEach(e=>{
      const len=e.getTotalLength();
      const col=e.classList[1].startsWith('e-i')?0:e.classList[1].startsWith('e-a')?1:2;
      e.animate([{strokeDasharray:len,strokeDashoffset:len},{strokeDasharray:len,strokeDashoffset:0}],
        {duration:520,delay:col*170+Math.random()*160,easing:'cubic-bezier(.3,.7,.2,1)',fill:'backwards'});
    });
    $$('.node',svg).forEach(n=>{
      const col=n.classList.contains('ni')?0:n.classList.contains('a0')||n.classList.contains('a1')||n.classList.contains('a2')||n.classList.contains('a3')?1:n.classList.contains('nh')?2:3;
      n.animate([{opacity:0},{opacity:1}],{duration:400,delay:col*170+Math.random()*120,fill:'backwards'});
    });
  }

  // nobody's touching it? a single signal slips through now and then
  function spark(){
    if(!active||hover||held>=0||document.hidden||reduce){schedule();return}
    const k=Math.floor(Math.random()*PROJECTS.length),p=PROJECTS[k];
    const pick=a=>a[Math.floor(Math.random()*a.length)];
    const i=pick(p.feeds),j=pick(p.a),m=pick(p.b);
    const segs=[q(`.e-i${i}-a${j}`),q(`.e-a${j}-b${m}`),q(`.e-b${m}-o${k}`)];
    const dot=q('.spark');sparking=true;
    const SEG=520;let s=0,t0=null;
    q('.i'+i).classList.add('lit');
    function step(ts){
      if(!active||hover||held>=0){dot.setAttribute('opacity',0);q('.i'+i).classList.remove('lit');sparking=false;schedule();return}
      if(t0==null)t0=ts;
      let u=(ts-t0)/SEG;
      if(u>=1){s++;t0=ts;u=0;if(s>=segs.length){
        dot.setAttribute('opacity',0);q('.i'+i).classList.remove('lit');
        const r=outs[k].querySelector('.ring');r.classList.remove('ping');void r.getBBox();r.classList.add('ping');
        sparking=false;schedule();return}}
      const e=segs[s],L=e.getTotalLength(),pt=e.getPointAtLength(L*(u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2));
      dot.setAttribute('cx',pt.x);dot.setAttribute('cy',pt.y);dot.setAttribute('opacity',1);
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function schedule(){clearTimeout(sparkT);if(active)sparkT=setTimeout(spark,2600+Math.random()*3400)}

  return{
    enter(){active=true;fit();if(!built)build();if(!sparking)schedule()},
    leave(){active=false;clearTimeout(sparkT)},
    show(k){if(!hover)show(k)},
    hold(k){held=k;hover=false;clear();if(k>=0){svg.classList.add('dim');lightProject(k)}}
  };
})();

// ───────────────────────── palette ─────────────────────────
const pal=$('#palette'),palQ=$('#pal-q'),palList=$('#pal-list');
const CMDS=[
  ...Object.entries(TABS).map(([k,v])=>({g:'pages',t:v.t,i:v.i,h:'',run:()=>{location.hash=k}})),
  ...PROJECTS.map((p,k)=>({g:'projects',t:p.t,i:p.icon,h:p.type.toLowerCase(),run:()=>openPeek(k)})),
  {g:'actions',t:'Toggle dark mode',i:'moon',h:'',run:()=>toggleTheme(innerWidth/2,innerHeight/3)},
  {g:'actions',t:'Copy email address',i:'copy',h:'',run:copyEmail},
  {g:'actions',t:'Send an email',i:'mail',h:'',run:()=>{location.href='mailto:'+EMAIL}},
  {g:'actions',t:'Open GitHub',i:'github',h:'',run:()=>open(LINKS.github,'_blank','noopener')},
  {g:'actions',t:'Open LinkedIn',i:'linkedin',h:'',run:()=>open(LINKS.linkedin,'_blank','noopener')}
];
let palItems=[],palSel=0,palFrom=null;
function palRender(){
  const s=palQ.value.trim().toLowerCase();
  palItems=CMDS.filter(c=>!s||(c.t+' '+c.g+' '+c.h).toLowerCase().includes(s));
  palSel=Math.min(palSel,Math.max(0,palItems.length-1));
  if(!palItems.length){palList.innerHTML=`<div class="pal-empty">Nothing called “${esc(palQ.value)}”. Yet.</div>`;return}
  let g='',h='';
  palItems.forEach((c,n)=>{
    if(c.g!==g){g=c.g;h+=`<div class="pal-g">${g}</div>`}
    h+=`<div class="pal-i" role="option" id="pal-${n}" data-n="${n}" aria-selected="${n===palSel}">${icon(c.i)}<span>${esc(c.t)}</span><span class="h">${n===palSel?'↵':esc(c.h)}</span></div>`;
  });
  palList.innerHTML=h;
  palQ.setAttribute('aria-activedescendant','pal-'+palSel);
  const el=$('#pal-'+palSel);if(el)el.scrollIntoView({block:'nearest'});
}
function palOpen(){
  if(!pal.hidden)return;
  palFrom=document.activeElement;pal.hidden=false;palQ.value='';palSel=0;palRender();
  requestAnimationFrame(()=>palQ.focus());
}
function palClose(){if(pal.hidden)return;pal.hidden=true;if(palFrom&&palFrom.focus)palFrom.focus({preventScroll:true})}
function palRun(n){const c=palItems[n];if(!c)return;palClose();setTimeout(c.run,30)}
palQ.addEventListener('input',()=>{palSel=0;palRender()});
palQ.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();palSel=(palSel+(e.key==='ArrowDown'?1:-1)+palItems.length)%Math.max(1,palItems.length);palRender()}
  else if(e.key==='Enter'){e.preventDefault();palRun(palSel)}
});
palList.addEventListener('pointermove',e=>{const it=e.target.closest('.pal-i');if(it&&+it.dataset.n!==palSel){palSel=+it.dataset.n;palRender()}});
palList.addEventListener('click',e=>{const it=e.target.closest('.pal-i');if(it)palRun(+it.dataset.n)});
pal.addEventListener('click',e=>{if(e.target===pal)palClose()});
$('#open-palette').addEventListener('click',palOpen);

// keys: / or ⌘K for commands, 1·2·3 for tabs, j/k through an open peek
document.addEventListener('keydown',e=>{
  const typing=/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)||e.target.isContentEditable;
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();pal.hidden?palOpen():palClose();return}
  if(e.key==='Escape'){if(!pal.hidden)palClose();else closePeek();return}
  if(typing||e.metaKey||e.ctrlKey||e.altKey||!pal.hidden)return;
  if(e.key==='/'){e.preventDefault();palOpen();return}
  if(peekIdx>=0&&(e.key==='j'||e.key==='ArrowDown')){e.preventDefault();stepPeek(1);return}
  if(peekIdx>=0&&(e.key==='k'||e.key==='ArrowUp')){e.preventDefault();stepPeek(-1);return}
  const n={'1':'home','2':'experience','3':'projects'}[e.key];
  if(n){closePeek();location.hash=n}
});

// ───────────────────────── now playing ─────────────────────────
(function(){
  const row=$('#np');let shown='';
  function load(){
    fetch('/api/now-playing',{headers:{accept:'application/json'},cache:'no-store'})
      .then(r=>r.ok?r.json():null)
      .then(d=>{
        if(!d||!d.title)return;
        const line=d.title+(d.artist?' — '+d.artist:'');
        if(line+d.playing===shown)return;shown=line+d.playing;
        $('#np-k').textContent=d.playing?'Listening to':'Last played';
        $('#np-t').textContent=line;
        const a=$('#np-v');a.title=line;a.classList.toggle('past',!d.playing);
        if(typeof d.url==='string'&&d.url.startsWith('https://open.spotify.com/'))a.href=d.url;else a.removeAttribute('href');
        row.hidden=false;
      }).catch(()=>{});
  }
  load();setInterval(load,20000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)load()});
})();

// ───────────────────────── the title, decoded ─────────────────────────
// hover the name and it briefly falls back to signal before resolving
(function(){
  const h=$('#title'),text=h.textContent;
  h.innerHTML=[...text].map(c=>`<span class="ch" aria-hidden="true">${c===' '?' ':esc(c)}</span>`).join('');
  const chs=$$('.ch',h),GLYPHS='01#/<>{}*+=';
  let last=0,running=false;
  h.addEventListener('pointerenter',()=>{
    if(reduce||running||Date.now()-last<7000)return;
    running=true;last=Date.now();
    chs.forEach((el,n)=>{
      const real=text[n];if(real===' ')return;
      const w=el.getBoundingClientRect().width;el.style.width=w+'px';el.style.textAlign='center';
      let ticks=0;const stop=6+n*1.4;
      const iv=setInterval(()=>{
        if(ticks++>=stop){clearInterval(iv);el.textContent=real;el.style.width='';el.style.textAlign='';
          if(n===chs.length-1)running=false;return}
        el.textContent=GLYPHS[Math.floor(Math.random()*GLYPHS.length)];
      },38);
    });
  });
})();

// ───────────────────────── cover: a quiet field of neurons ─────────────────────────
const cover=(()=>{
  const wrap=$('#cover-wrap'),cv=$('#cover'),ctx=cv.getContext('2d');
  const GAP=22;
  let W=0,H=0,dpr=1,dots=[],ink='#000',mx=-999,my=-999,inView=true,raf=0,syn=null,ripple=null,lastMove=0;
  function recolor(){ink=getComputedStyle(root).getPropertyValue('--ink').trim()||'#000';kick()}
  function size(){
    dpr=Math.min(2,devicePixelRatio||1);W=wrap.clientWidth;H=wrap.clientHeight;
    cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    dots=[];
    const ox=(W%GAP)/2+GAP/2,oy=(H%GAP)/2+GAP/2;
    for(let y=oy;y<H;y+=GAP)for(let x=ox;x<W;x+=GAP)dots.push({x,y,s:0,dx:0,dy:0});
    kick();
  }
  function frame(t){
    raf=0;
    ctx.clearRect(0,0,W,H);
    let busy=false;
    const near=Date.now()-lastMove<1600;
    for(const d of dots){
      let ts=0,tx=0,ty=0;
      if(near){
        const vx=d.x-mx,vy=d.y-my,dist=Math.hypot(vx,vy);
        if(dist<120){const f=1-dist/120;ts=f*f;tx=vx/(dist||1)*f*7;ty=vy/(dist||1)*f*7}
      }
      if(ripple){
        const r=(t-ripple.t0)*.55,band=Math.abs(Math.hypot(d.x-ripple.x,d.y-ripple.y)-r);
        if(band<26){const f=1-band/26;ts=Math.max(ts,f*.9)}
      }
      d.s+=(ts-d.s)*.14;d.dx+=(tx-d.dx)*.14;d.dy+=(ty-d.dy)*.14;
      if(Math.abs(ts-d.s)>.004||Math.abs(tx-d.dx)>.05)busy=true;
      ctx.globalAlpha=.2+d.s*.6;ctx.fillStyle=ink;
      ctx.beginPath();ctx.arc(d.x+d.dx,d.y+d.dy,.9+d.s*1.6,0,6.283);ctx.fill();
    }
    if(ripple){if((t-ripple.t0)*.55>Math.hypot(W,H))ripple=null;else busy=true}
    if(syn){
      const u=(t-syn.t0)/1700;
      if(u>=1)syn=null;
      else{
        busy=true;
        const a=Math.sin(Math.PI*u);
        ctx.globalAlpha=a*.5;ctx.strokeStyle=ink;ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(syn.a.x,syn.a.y);
        ctx.quadraticCurveTo(syn.cx,syn.cy,syn.b.x,syn.b.y);ctx.stroke();
        const v=Math.min(1,u*1.4),ix=(1-v)*(1-v)*syn.a.x+2*(1-v)*v*syn.cx+v*v*syn.b.x,iy=(1-v)*(1-v)*syn.a.y+2*(1-v)*v*syn.cy+v*v*syn.b.y;
        ctx.globalAlpha=a;ctx.fillStyle=ink;ctx.beginPath();ctx.arc(ix,iy,2,0,6.283);ctx.fill();
      }
    }
    ctx.globalAlpha=1;
    if(busy&&inView)kick();
  }
  function kick(){if(!raf)raf=requestAnimationFrame(frame)}
  // every so often two of them connect, and nobody's told why
  function synapse(){
    if(inView&&!document.hidden&&!reduce&&dots.length){
      const a=dots[Math.floor(Math.random()*dots.length)];
      const cands=dots.filter(d=>{const r=Math.hypot(d.x-a.x,d.y-a.y);return r>GAP*2.5&&r<GAP*6});
      if(cands.length){
        const b=cands[Math.floor(Math.random()*cands.length)];
        syn={a,b,t0:performance.now(),cx:(a.x+b.x)/2+(Math.random()-.5)*60,cy:(a.y+b.y)/2+(Math.random()-.5)*60};kick();
      }
    }
    setTimeout(synapse,4200+Math.random()*5200);
  }
  const hero=$('.page');
  [wrap,hero].forEach(el=>el.addEventListener('pointermove',e=>{
    const r=wrap.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top;lastMove=Date.now();if(!reduce)kick();
  },{passive:true}));
  wrap.addEventListener('dblclick',e=>{
    if(reduce)return;const r=wrap.getBoundingClientRect();
    ripple={x:e.clientX-r.left,y:e.clientY-r.top,t0:performance.now()};kick();
  });
  new IntersectionObserver(([en])=>{inView=en.isIntersecting;if(inView)kick()}).observe(wrap);
  addEventListener('resize',()=>{clearTimeout(size._t);size._t=setTimeout(size,120)});
  recolor();size();setTimeout(synapse,6000);
  return{recolor};
})();

// ───────────────────────── a second cursor ─────────────────────────
// go quiet for a while and someone else drifts through the doc, reads a
// line or two, and leaves. move your mouse and they're gone.
(function(){
  if(reduce)return;
  const g=$('#ghost'),sel=$('#ghost-sel');
  let idleT,runs=0,live=false,timers=[];
  const later=(fn,ms)=>timers.push(setTimeout(fn,ms));
  function arm(){clearTimeout(idleT);if(runs<2)idleT=setTimeout(go,runs?90000:22000)}
  function bail(){
    if(!live)return;live=false;
    timers.forEach(clearTimeout);timers=[];
    g.classList.remove('on');sel.classList.remove('on');
  }
  function go(){
    if(document.hidden||!pal.hidden||peekIdx>=0||innerWidth<760){arm();return}
    const vis=$$('.view:not([hidden]) .blk, .props .prop').filter(el=>{
      const r=el.getBoundingClientRect();return r.top>70&&r.bottom<innerHeight-30&&r.height<160&&r.width>120;
    });
    if(vis.length<2){arm();return}
    live=true;runs++;
    const a=vis[Math.floor(Math.random()*vis.length)];
    let b=vis[Math.floor(Math.random()*vis.length)];if(b===a)b=vis[(vis.indexOf(a)+1)%vis.length];
    const at=(x,y)=>{g.style.transform=`translate(${x}px,${y}px)`};
    g.style.transition='none';at(innerWidth+30,innerHeight*.7);void g.offsetWidth;g.style.transition='';
    g.classList.add('on');
    const visit=(el,t)=>{
      later(()=>{const r=el.getBoundingClientRect();at(r.left+Math.min(r.width*.6,260),r.top+r.height/2-4)},t);
      later(()=>{const r=el.getBoundingClientRect();
        Object.assign(sel.style,{left:r.left+scrollX-6+'px',top:r.top+scrollY-2+'px',width:Math.min(r.width,560)+12+'px',height:r.height+4+'px'});
        sel.classList.add('on')},t+1300);
      later(()=>sel.classList.remove('on'),t+3000);
    };
    visit(a,200);visit(b,3500);
    later(()=>{at(innerWidth+40,innerHeight+40);g.classList.remove('on')},6900);
    later(()=>{live=false;arm()},7600);
  }
  ['pointermove','keydown','scroll','pointerdown'].forEach(ev=>addEventListener(ev,()=>{bail();arm()},{passive:true}));
  arm();
})();

// ───────────────────────── boot ─────────────────────────
addEventListener('hashchange',route);
route();
console.log('%chi, you found the console.%c\npress / anywhere. double-click the cover. hover my name.',
  'font:600 13px Inter,sans-serif','font:12px JetBrains Mono,monospace;color:#888');
})();
