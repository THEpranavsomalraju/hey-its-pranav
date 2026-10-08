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
const svgIcon=d=>`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const MOON='<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>';
const SUN='<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';

// ───────────────────────── data ─────────────────────────
// inputs only earn a place when two or more projects draw on them
const INPUTS=['python','pandas','sql','scikit-learn','pytorch','computer vision','apis'];
const PROJECTS=[
  {id:'gummi',t:'Gummi',type:'Hackathon',note:'Overall winner, WolfHacks 2026',
   d:'A glucose coach for people with prediabetes. It looks two hours ahead, suggests a walk before a spike, and checks every prediction against what actually happened. I built the backend on Databricks: the app, all six agents, MLflow tracing and the self-improving prompt loop.',
   tags:['databricks','mlflow','fastapi','agent bricks'],feeds:[0,1,2,6],a:[1,2,3],b:[0,1],
   url:'https://github.com/THEpranavsomalraju/gummi'},
  {id:'refuge',t:'Refuge',type:'Datathon',note:'1st place, Carolina Data Challenge 2026',
   d:'Send a tornado or hurricane through any real US town, turn its schools and churches into shelters, then replay the storm against the best possible plan. I built the risk models and the simulator calibration.',
   tags:['lightgbm','shap','polars','noaa data'],feeds:[0,1,2,3],a:[0,1,3],b:[0,2],
   url:'https://github.com/THEpranavsomalraju/refuge',live:'https://refugestorms.vercel.app'},
  {id:'eyecode',t:'EyeCode',type:'Hackathon',note:'2nd place, HackNC 2025',
   d:'A webcam turns eye blinks into Morse code, then into text.',
   tags:['python','flask','opencv','mediapipe'],feeds:[0,5,6],a:[0,1],b:[0,1],
   url:'https://github.com/THEpranavsomalraju/eyecode'},
  {id:'clinician',t:'Clinician GUI',type:'Research',note:'Caltech × Duke',
   d:'Built with a Caltech mentor so clinicians run the rejection model with no terminal, no IDE, and no machine learning background.',
   tags:['typescript','react','tailwind','vite'],feeds:[4,5],a:[1,2],b:[1,2],
   url:'https://github.com/THEpranavsomalraju/Clinician-GUI'},
  {id:'rejection',t:'Rejection Classifier',type:'Research',note:'98% validation accuracy',
   d:'A fine-tuned ResNet50 grading cardiac transplant rejection at 98% validation accuracy, and 99.2% on the two calls pathologists agree on least.',
   tags:['pytorch','resnet50','umap'],feeds:[0,3,4,5],a:[0,2,3],b:[0,2],
   url:'https://github.com/THEpranavsomalraju/Rejection-Classifer-Caltech-Duke'},
  {id:'card',t:'Card Dispute PRD',type:'Product',note:'21,508 CFPB narratives',
   d:'21,508 CFPB complaint narratives, six tagged failure patterns, and one scoped fix at the denial stage, checked against Regulation Z.',
   tags:['product','python','cfpb api'],feeds:[0,1,6],a:[2,3],b:[1,2],
   url:'https://github.com/THEpranavsomalraju/card-dispute-prd'}
];
const EMAIL='somalrajupc@gmail.com';
const LINKS={github:'https://github.com/THEpranavsomalraju',linkedin:'https://linkedin.com/in/pranavsomalraju'};

// ───────────────────────── theme ─────────────────────────
const root=document.documentElement;
const themeNow=()=>root.dataset.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
function syncThemeBtn(){$('#theme').innerHTML=svgIcon(themeNow()==='dark'?SUN:MOON)}
function setTheme(t,x=innerWidth-40,y=22){
  const apply=()=>{root.dataset.theme=t;store.set('v2-theme',t);syncThemeBtn()};
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
const TABS={home:'Home',experience:'Experience',projects:'Projects'};
const tabBtns=$$('.tab');
let curTab=null;
function moveInk(instant){
  const b=$(`.tab[data-tab="${curTab}"]`),ink=$('#tab-ink');
  if(!b)return;
  if(instant)ink.style.transition='none';
  const pad=b===tabBtns[0]?0:10;   // the ink sits under the word, not the padding
  ink.style.transform=`translateX(${b.offsetLeft+pad}px)`;ink.style.width=(b.offsetWidth-pad-10)+'px';
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
  $('#crumb').textContent=TABS[name];
  document.title=name==='home'?'Pranav Somalraju':`${TABS[name]} · Pranav Somalraju`;
  if(name==='experience')timeline.run();
  if(name==='projects')net.enter(); else net.leave();
}
function route(){
  const [tab,pid]=location.hash.replace(/^#/,'').split('/');
  setTab(TABS[tab]?tab:'home',{instant:curTab===null});
  const k=PROJECTS.findIndex(p=>p.id===pid);
  if(curTab==='projects'&&k>=0)net.select(k);
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

// ───────────────────────── experience ─────────────────────────
const timeline={
  run(){
    const tl=$('#tl');
    $$('.tl-dot',tl).forEach((d,n)=>d.style.setProperty('--n',n));
    tl.classList.remove('run');
    if(!reduce){void tl.offsetWidth;tl.classList.add('run')}
  }
};

// ───────────────────────── projects: network + readout ─────────────────────────
const net=(()=>{
  const svg=$('#net'),detail=$('#detail');
  const narrow=matchMedia('(max-width: 760px)');
  const spread=(n,lo,hi)=>Array.from({length:n},(_,i)=>Math.round(lo+i*(hi-lo)/(n-1)));
  const IY=spread(INPUTS.length,52,412),AY=spread(4,112,352),BY=spread(3,152,312),OY=spread(PROJECTS.length,60,404);
  const d=(x1,y1,x2,y2)=>{const k=.45*(x2-x1);return `M${x1} ${y1} C${x1+k} ${y1}, ${x2-k} ${y2}, ${x2} ${y2}`};
  let edges=[],outs=[],sel=0,hover=false,active=false,built=false,sparkT,sparking=false;
  const q=s=>svg.querySelector(s);

  // wide on a desktop; on a phone the layers tuck in and the projects go
  // numbers-only, since the readout underneath names them
  function draw(){
    const c=narrow.matches;
    // desktop: the four columns sit evenly about x=0, which fit() pins to the
    // middle of the page, so the inputs and the projects mirror each other
    const XI=c?140:-420,XA=c?212:-140,XB=c?276:140,XO=c?338:420;
    let h=`<text class="lab" x="${XI-16}" y="18" text-anchor="end">what i use</text>`+
          `<text class="lab" x="${c?XO:XO-17}" y="18" text-anchor="${c?'middle':'start'}">what it made</text>`;
    IY.forEach((y,i)=>AY.forEach((ya,j)=>{h+=`<path class="edge e-i${i}-a${j}" d="${d(XI,y,XA,ya)}"/>`}));
    AY.forEach((ya,j)=>BY.forEach((yb,m)=>{h+=`<path class="edge e-a${j}-b${m}" d="${d(XA,ya,XB,yb)}"/>`}));
    BY.forEach((yb,m)=>OY.forEach((yo,k)=>{h+=`<path class="edge e-b${m}-o${k}" d="${d(XB,yb,XO,yo)}"/>`}));
    AY.forEach((y,j)=>{h+=`<g class="node nh a${j}"><circle cx="${XA}" cy="${y}" r="5"/></g>`});
    BY.forEach((y,m)=>{h+=`<g class="node nh b${m}"><circle cx="${XB}" cy="${y}" r="5"/></g>`});
    INPUTS.forEach((t,i)=>{const y=IY[i];
      h+=`<g class="node ni i${i}" data-i="${i}"><circle cx="${XI}" cy="${y}" r="6"/><text x="${XI-16}" y="${y+5}" text-anchor="end">${esc(t)}</text></g>`});
    PROJECTS.forEach((p,k)=>{const y=OY[k];
      h+=`<g class="node no o${k}" data-o="${k}" tabindex="0" role="button" aria-label="${esc(p.t)}">
        <circle class="ring" cx="${XO}" cy="${y}" r="17"/><circle class="body" cx="${XO}" cy="${y}" r="17"/>
        <text class="num" x="${XO}" y="${y+4.2}" text-anchor="middle">${String(k+1).padStart(2,'0')}</text>
        ${c?'':`<text class="name" x="${XO+32}" y="${y+6}">${esc(p.t)}</text>`}</g>`});
    svg.innerHTML=h+`<circle class="spark" r="3.2" cx="${XI}" cy="${IY[0]}" opacity="0"/>`;
    edges=$$('.edge',svg);outs=$$('.no',svg);
    fit();show(sel);
  }
  // fit the viewBox to the actual ink, so the net sits dead centre
  function fit(){
    if(svg.closest('[hidden]'))return;
    const bb=svg.getBBox(),pad=12;
    if(narrow.matches){svg.setAttribute('viewBox',`${bb.x-pad} ${bb.y-pad} ${bb.width+pad*2} ${bb.height+pad*2}`);return}
    const half=Math.max(-bb.x,bb.x+bb.width)+pad;
    svg.setAttribute('viewBox',`${-half} ${bb.y-pad} ${half*2} ${bb.height+pad*2}`);
  }

  function clear(){
    edges.forEach(e=>e.classList.remove('lit'));
    $$('.ni,.nh',svg).forEach(n=>n.classList.remove('lit'));
    outs.forEach(o=>o.classList.remove('on'));
  }
  function lightProject(k,fromInput){
    const p=PROJECTS[k];
    (fromInput==null?p.feeds:[fromInput]).forEach(i=>{q('.i'+i).classList.add('lit');p.a.forEach(j=>q(`.e-i${i}-a${j}`).classList.add('lit'))});
    p.a.forEach(j=>{q('.a'+j).classList.add('lit');p.b.forEach(m=>q(`.e-a${j}-b${m}`).classList.add('lit'))});
    p.b.forEach(m=>{q('.b'+m).classList.add('lit');q(`.e-b${m}-o${k}`).classList.add('lit')});
    outs[k].classList.add('on');
  }
  function show(k){clear();svg.classList.add('dim');lightProject(k)}
  function showInput(i){clear();svg.classList.add('dim');PROJECTS.forEach((p,k)=>{if(p.feeds.includes(i))lightProject(k,i)})}

  // the readout under the net: whatever you last touched stays put, so you
  // can move down to it and follow a link
  function render(k,anim){
    const p=PROJECTS[k];
    const links=(p.live?`<a href="${p.live}" target="_blank" rel="noopener">play it live ↗</a>`:'')+
      `<a href="${p.url}" target="_blank" rel="noopener">github ↗</a>`;
    detail.innerHTML=`
      <p class="d-meta">${String(k+1).padStart(2,'0')} · ${esc(p.type.toLowerCase())}</p>
      <h3 class="d-title">${esc(p.t)}</h3>
      <p class="d-note">${esc(p.note)}</p>
      <p class="d-desc">${esc(p.d)}</p>
      <dl class="d-rows">
        <dt>stack</dt><dd>${p.tags.map(esc).join(' · ')}</dd>
        <dt>draws on</dt><dd>${p.feeds.map(i=>esc(INPUTS[i])).join(' · ')}</dd>
      </dl>
      <div class="d-links">${links}</div>`;
    if(anim&&!reduce){detail.classList.remove('swap');void detail.offsetWidth;detail.classList.add('swap')}
  }
  function select(k){
    if(k<0||k>=PROJECTS.length)return;
    const changed=k!==sel;sel=k;show(k);
    if(changed)render(k,true);
  }

  // delegated, so a redraw keeps working without rewiring
  const target=e=>{const o=e.target.closest('.no');if(o)return{k:+o.dataset.o,el:o};const n=e.target.closest('.ni');if(n)return{i:+n.dataset.i,el:n};return null};
  svg.addEventListener('pointerover',e=>{
    const t=target(e);if(!t||(e.relatedTarget&&t.el.contains(e.relatedTarget)))return;
    hover=true;t.k!=null?select(t.k):showInput(t.i);
  });
  svg.addEventListener('pointerout',e=>{
    const t=target(e);if(!t||(e.relatedTarget&&t.el.contains(e.relatedTarget)))return;
    hover=false;show(sel);
  });
  svg.addEventListener('click',e=>{const t=target(e);if(t&&t.k!=null)select(t.k)});
  svg.addEventListener('focusin',e=>{const t=target(e);if(t&&t.k!=null)select(t.k)});

  // first visit: the wiring knits itself together, quickly, once
  function build(){
    built=true;
    if(reduce)return;
    edges.forEach(e=>{
      const len=e.getTotalLength(),c=e.classList[1];
      const col=c.startsWith('e-i')?0:c.startsWith('e-a')?1:2;
      e.animate([{strokeDasharray:len,strokeDashoffset:len},{strokeDasharray:len,strokeDashoffset:0}],
        {duration:520,delay:col*170+Math.random()*160,easing:'cubic-bezier(.3,.7,.2,1)',fill:'backwards'});
    });
    $$('.node',svg).forEach(n=>{
      const col=n.classList.contains('ni')?0:/\ba\d\b/.test(n.getAttribute('class'))?1:n.classList.contains('nh')?2:3;
      n.animate([{opacity:0},{opacity:1}],{duration:400,delay:col*170+Math.random()*120,fill:'backwards'});
    });
  }

  // nobody's touching it? a single signal slips through now and then
  function spark(){
    if(!active||hover||document.hidden||reduce){schedule();return}
    const k=Math.floor(Math.random()*PROJECTS.length),p=PROJECTS[k];
    const pick=a=>a[Math.floor(Math.random()*a.length)];
    const i=pick(p.feeds),j=pick(p.a),m=pick(p.b);
    const segs=[q(`.e-i${i}-a${j}`),q(`.e-a${j}-b${m}`),q(`.e-b${m}-o${k}`)];
    const dot=q('.spark');sparking=true;
    const SEG=520;let s=0,t0=null;
    function step(ts){
      if(!active||hover||!dot.isConnected){if(dot.isConnected)dot.setAttribute('opacity',0);sparking=false;schedule();return}
      if(t0==null)t0=ts;
      let u=(ts-t0)/SEG;
      if(u>=1){s++;t0=ts;u=0;if(s>=segs.length){
        dot.setAttribute('opacity',0);
        const r=outs[k].querySelector('.ring');r.classList.remove('ping');void r.getBBox();r.classList.add('ping');
        sparking=false;schedule();return}}
      const e=segs[s],L=e.getTotalLength(),pt=e.getPointAtLength(L*(u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2));
      dot.setAttribute('cx',pt.x);dot.setAttribute('cy',pt.y);dot.setAttribute('opacity',1);
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function schedule(){clearTimeout(sparkT);if(active)sparkT=setTimeout(spark,2600+Math.random()*3400)}

  draw();render(sel,false);
  narrow.addEventListener('change',draw);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>requestAnimationFrame(fit));
  return{
    enter(){active=true;fit();if(!built)build();if(!sparking)schedule()},
    leave(){active=false;clearTimeout(sparkT)},
    select,
    step(dir){select((sel+dir+PROJECTS.length)%PROJECTS.length)}
  };
})();

// ───────────────────────── palette ─────────────────────────
const pal=$('#palette'),palQ=$('#pal-q'),palList=$('#pal-list');
const CMDS=[
  ...Object.entries(TABS).map(([k,v],n)=>({g:'pages',t:v,h:String(n+1),run:()=>{location.hash=k}})),
  ...PROJECTS.map(p=>({g:'projects',t:p.t,h:p.type.toLowerCase(),run:()=>{location.hash='projects/'+p.id}})),
  {g:'actions',t:'Toggle dark mode',h:'',run:()=>toggleTheme(innerWidth/2,innerHeight/3)},
  {g:'actions',t:'Copy email address',h:'',run:copyEmail},
  {g:'actions',t:'Send an email',h:'',run:()=>{location.href='mailto:'+EMAIL}},
  {g:'actions',t:'Open GitHub',h:'',run:()=>open(LINKS.github,'_blank','noopener')},
  {g:'actions',t:'Open LinkedIn',h:'',run:()=>open(LINKS.linkedin,'_blank','noopener')}
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
    h+=`<div class="pal-i" role="option" id="pal-${n}" data-n="${n}" aria-selected="${n===palSel}"><span>${esc(c.t)}</span><span class="h">${n===palSel?'↵':esc(c.h)}</span></div>`;
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

// keys: / or ⌘K for commands, 1·2·3 for tabs, j/k through the projects
document.addEventListener('keydown',e=>{
  const typing=/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)||e.target.isContentEditable;
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();pal.hidden?palOpen():palClose();return}
  if(e.key==='Escape'){palClose();return}
  if(typing||e.metaKey||e.ctrlKey||e.altKey||!pal.hidden)return;
  if(e.key==='/'){e.preventDefault();palOpen();return}
  if(curTab==='projects'&&(e.key==='j'||e.key==='k')){net.step(e.key==='j'?1:-1);return}
  const n={'1':'home','2':'experience','3':'projects'}[e.key];
  if(n)location.hash=n;
});

// ───────────────────────── recently: how long ago ─────────────────────────
$$('time.ago').forEach(t=>{
  const d=new Date(t.getAttribute('datetime')+'T12:00:00'),days=Math.floor((Date.now()-d)/86400000);
  if(isNaN(days))return;
  t.textContent=days<1?'today':days<7?days+'d ago':days<30?Math.floor(days/7)+'w ago':days<365?Math.floor(days/30)+'mo ago':Math.floor(days/365)+'y ago';
  t.title=d.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
});

// ───────────────────────── listening ─────────────────────────
// what's on now, then what played before it, from /api/listening. new songs
// slide in only while nobody's browsing the older ones.
(function(){
  const box=$('#ls'),host=$('#ls-car');let car=null,shown='';
  const ago=iso=>{
    const s=(Date.now()-new Date(iso))/1000;
    if(!(s>=0))return'';
    if(s<90)return'just now';if(s<3600)return Math.round(s/60)+'m ago';if(s<86400)return Math.round(s/3600)+'h ago';
    if(s<172800)return'yesterday';return new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric'});
  };
  const toSlides=tracks=>tracks.map(t=>({
    title:t.title,
    description:t.artist+(t.album&&t.album!==t.title?' · '+t.album:''),
    image:t.image,imageAlt:'Cover of '+(t.album||t.title),
    overlay:t.playing?'<span class="eq"><i></i><i></i><i></i></span>now playing':esc(ago(t.playedAt)),
    action:t.url?'Play on Spotify':null,href:t.url
  }));
  function load(){
    fetch('/api/listening',{headers:{accept:'application/json'},cache:'no-store'})
      .then(r=>r.ok?r.json():null)
      .then(d=>{
        if(!d||!Array.isArray(d.tracks)||!d.tracks.length)return;
        const key=d.tracks.map(t=>t.id+(t.playing?'*':'')).join();
        if(key===shown||(car&&car.busy))return;
        shown=key;box.hidden=false;
        const slides=toSlides(d.tracks);
        if(car){car.setSlides(slides);return}
        car=window.SqueezeCarousel.mount(host,{slides,aspect:1,label:'Songs I played recently'});
        $('#ls-prev').addEventListener('click',()=>car.step(-1));
        $('#ls-next').addEventListener('click',()=>car.step(1));
      }).catch(()=>{});
  }
  load();setInterval(()=>{if(!document.hidden)load()},30000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)load()});
})();

// ───────────────────────── github, as a skyline ─────────────────────────
// real contributions from /api/contributions, refreshed while the tab is open
(function(){
  const host=$('#gh');let sky=null,shown='';
  function load(){
    fetch('/api/contributions',{headers:{accept:'application/json'},cache:'no-store'})
      .then(r=>r.ok?r.json():null)
      .then(d=>{
        if(!d||!Array.isArray(d.days)||!d.days.length)return;
        const key=d.days.map(x=>x.count).join(',');
        if(key===shown)return;shown=key;
        host.hidden=false;
        if(sky)sky.setData(d.days);
        else sky=window.ContributionSkyline.mount(host,{data:d.days,palette:'mono'});
      }).catch(()=>{});
  }
  load();setInterval(()=>{if(!document.hidden)load()},10*60*1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)load()});
})();

// ───────────────────────── the name ─────────────────────────
// whichever letters you pass over fall back to signal for a beat, then resolve
(function(){
  const h=$('#title'),text=h.textContent;
  h.innerHTML=[...text].map(c=>`<span class="ch" aria-hidden="true">${c===' '?' ':esc(c)}</span>`).join('');
  const chs=$$('.ch',h),GLYPHS='01#/<>{}*+=%$';
  // pin every letter to its real width so the glyphs never shove the line around
  function lock(){chs.forEach(el=>{el.style.width=''});chs.forEach(el=>{el.style.width=el.getBoundingClientRect().width+'px'})}
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(lock);else lock();
  addEventListener('resize',()=>{clearTimeout(lock._t);lock._t=setTimeout(lock,150)});
  const live=new Map();
  function burst(n){
    const el=chs[n],real=text[n];
    if(!el||real===' ')return;
    clearInterval(live.get(n));
    let ticks=0;const stop=4+Math.floor(Math.random()*5);
    el.classList.add('hot');
    live.set(n,setInterval(()=>{
      if(ticks++>=stop){clearInterval(live.get(n));live.delete(n);el.textContent=real;el.classList.remove('hot');return}
      el.textContent=GLYPHS[Math.floor(Math.random()*GLYPHS.length)];
    },48));
  }
  chs.forEach((el,n)=>el.addEventListener('pointerenter',()=>{
    if(reduce)return;
    burst(n);
    if(Math.random()<.7)setTimeout(()=>burst(n-1),50);
    if(Math.random()<.7)setTimeout(()=>burst(n+1),50);
  }));
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
    if(document.hidden||!pal.hidden||innerWidth<760){arm();return}
    const vis=$$('.view:not([hidden]) :is(p,li,h2,blockquote,.tl-body,dd)').filter(el=>{
      const r=el.getBoundingClientRect();return r.top>70&&r.bottom<innerHeight-30&&r.height<160&&r.width>60;
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
console.log('%chi, you found the console.%c\npress / anywhere. run a finger over my name.',
  'font:600 13px Inter,sans-serif','font:12px JetBrains Mono,monospace;color:#888');
})();
