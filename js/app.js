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
  const apply=()=>{root.dataset.theme=t;store.set('theme',t);syncThemeBtn()};
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
const TABS={home:'Home',experience:'Experience',projects:'Projects',opensource:'Open source'};
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
  document.title=name==='home'?'Pranav Somalraju':`${TABS[name]} · Pranav Somalraju`;
  if(name==='projects')net.enter(); else net.leave();
  if(name==='opensource')oss.enter();
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
// rows with more to say open like a toggle. the closed panel is inert, so its
// links stay out of the tab order until it is open
$$('#xp button.xp-row').forEach(b=>b.addEventListener('click',()=>{
  const li=b.closest('.xp-i'),open=!li.classList.contains('open');
  li.classList.toggle('open',open);b.setAttribute('aria-expanded',open);
  $('#'+b.getAttribute('aria-controls')).inert=!open;
}));


// ───────────────────────── projects: network + readout ─────────────────────────
const net=(()=>{
  const svg=$('#net'),detail=$('#detail');
  const narrow=matchMedia('(max-width: 760px)');
  const spread=(n,lo,hi)=>Array.from({length:n},(_,i)=>Math.round(lo+i*(hi-lo)/(n-1)));
  const IY=spread(INPUTS.length,52,412),AY=spread(4,112,352),BY=spread(3,152,312),OY=spread(PROJECTS.length,60,404);
  const d=(x1,y1,x2,y2)=>{const k=.45*(x2-x1);return `M${x1} ${y1} C${x1+k} ${y1}, ${x2-k} ${y2}, ${x2} ${y2}`};
  let edges=[],outs=[],sel=0,hover=false,built=false;
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
        <circle class="body" cx="${XO}" cy="${y}" r="17"/>
        <text class="num" x="${XO}" y="${y+4.2}" text-anchor="middle">${String(k+1).padStart(2,'0')}</text>
        ${c?'':`<text class="name" x="${XO+32}" y="${y+6}">${esc(p.t)}</text>`}</g>`});
    svg.innerHTML=h;
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
  function choose(k){
    if(k<0||k>=PROJECTS.length)return;
    const changed=k!==sel;sel=k;show(k);
    if(changed)render(k,true);
  }
  // left alone, it walks through the projects one at a time. pointing at the
  // net or the readout holds it where it is; picking a project (a click, a
  // link, the palette) ends the walk for this visit, so it never moves away
  // from something you chose
  const WALK_MS=4500;
  let walkT=0,walking=false,held=0;
  function walk(){
    clearTimeout(walkT);
    if(!walking||reduce)return;
    walkT=setTimeout(()=>{if(walking&&!held&&!document.hidden)choose((sel+1)%PROJECTS.length);walk()},WALK_MS);
  }
  function stopWalk(){walking=false;clearTimeout(walkT)}
  // only an actual node, or the readout, holds it. the net is nearly as wide
  // as the window, so a pointer merely resting over its empty space would
  // otherwise freeze the walk for good
  const hold=on=>{held=Math.max(0,held+(on?1:-1));if(!held)walk()};   // the next step comes a full beat after you let go
  detail.addEventListener('pointerenter',()=>hold(true));
  detail.addEventListener('pointerleave',()=>hold(false));
  [svg,detail].forEach(el=>{
    el.addEventListener('focusin',()=>hold(true));
    el.addEventListener('focusout',e=>{if(!el.contains(e.relatedTarget))hold(false)});
  });
  function select(k){stopWalk();choose(k)}

  // delegated, so a redraw keeps working without rewiring
  const target=e=>{const o=e.target.closest('.no');if(o)return{k:+o.dataset.o,el:o};const n=e.target.closest('.ni');if(n)return{i:+n.dataset.i,el:n};return null};
  svg.addEventListener('pointerover',e=>{
    const t=target(e);if(!t||(e.relatedTarget&&t.el.contains(e.relatedTarget)))return;
    hover=true;hold(true);t.k!=null?choose(t.k):showInput(t.i);
  });
  svg.addEventListener('pointerout',e=>{
    const t=target(e);if(!t||(e.relatedTarget&&t.el.contains(e.relatedTarget)))return;
    hover=false;hold(false);show(sel);
  });
  svg.addEventListener('click',e=>{const t=target(e);if(t&&t.k!=null)select(t.k)});
  svg.addEventListener('focusin',e=>{const t=target(e);if(t&&t.k!=null)choose(t.k)});

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

  draw();render(sel,false);
  narrow.addEventListener('change',draw);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>requestAnimationFrame(fit));
  return{
    // every visit starts the walk again from 01; a link straight to a project
    // calls select() right after this and stops it
    enter(){fit();if(!built)build();held=0;walking=!reduce;choose(0);walk()},
    leave(){stopWalk()},
    select,
    step(dir){select((sel+dir+PROJECTS.length)%PROJECTS.length)}
  };
})();

// ───────────────────────── open source ─────────────────────────
// my public open-source activity from /api/opensource, drawn the way GitHub
// draws a timeline: the state of each thing in its own colour, the project
// and its stars, comments as cards, newest first under a month that stays
// pinned while you scroll. fetched the first time the tab opens
const oss=(()=>{
  const host=$('#os');
  // GitHub's own octicons (MIT, © GitHub Inc.), so the states read the way they do there
  const OCT={"issue-reopened":["M5.029 2.217a6.5 6.5 0 0 1 9.437 5.11.75.75 0 1 0 1.492-.154 8 8 0 0 0-14.315-4.03L.427 1.927A.25.25 0 0 0 0 2.104V5.75A.25.25 0 0 0 .25 6h3.646a.25.25 0 0 0 .177-.427L2.715 4.215a6.491 6.491 0 0 1 2.314-1.998ZM1.262 8.169a.75.75 0 0 0-1.22.658 8.001 8.001 0 0 0 14.315 4.03l1.216 1.216a.25.25 0 0 0 .427-.177V10.25a.25.25 0 0 0-.25-.25h-3.646a.25.25 0 0 0-.177.427l1.358 1.358a6.501 6.501 0 0 1-11.751-3.11.75.75 0 0 0-.272-.506Z","M9.06 9.06a1.5 1.5 0 1 1-2.12-2.12 1.5 1.5 0 0 1 2.12 2.12Z"],"comment":["M1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0 1 13.25 12H9.06l-2.573 2.573A1.458 1.458 0 0 1 4 13.543V12H2.75A1.75 1.75 0 0 1 1 10.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h4.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"],"eye":["M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.45-.677 1.367-1.931 2.637-3.022C4.33 2.992 6.019 2 8 2ZM1.679 7.932a.12.12 0 0 0 0 .136c.411.622 1.241 1.75 2.366 2.717C5.176 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 0 0 0-.136c-.412-.621-1.242-1.75-2.366-2.717C10.824 4.242 9.473 3.5 8 3.5c-1.473 0-2.825.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z"],"git-merge":["M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm8.5-4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM5 3.25a.75.75 0 1 0 0 .005V3.25Z"],"git-pull-request-closed":["M3.25 1A2.25 2.25 0 0 1 4 5.372v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.251 2.251 0 0 1 3.25 1Zm9.5 5.5a.75.75 0 0 1 .75.75v3.378a2.251 2.251 0 1 1-1.5 0V7.25a.75.75 0 0 1 .75-.75Zm-2.03-5.273a.75.75 0 0 1 1.06 0l.97.97.97-.97a.748.748 0 0 1 1.265.332.75.75 0 0 1-.205.729l-.97.97.97.97a.751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018l-.97-.97-.97.97a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l.97-.97-.97-.97a.75.75 0 0 1 0-1.06ZM2.5 3.25a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0ZM3.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm9.5 0a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z"],"git-pull-request-draft":["M3.25 1A2.25 2.25 0 0 1 4 5.372v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.251 2.251 0 0 1 3.25 1Zm9.5 14a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5ZM2.5 3.25a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0ZM3.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm9.5 0a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM14 7.5a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Zm0-4.25a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Z"],"git-pull-request":["M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"],"issue-closed":["M11.28 6.78a.75.75 0 0 0-1.06-1.06L7.25 8.69 5.78 7.22a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l3.5-3.5Z","M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0Zm-1.5 0a6.5 6.5 0 1 0-13 0 6.5 6.5 0 0 0 13 0Z"],"issue-opened":["M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z","M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"],"skip":["M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm9.78-2.22-5.5 5.5a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l5.5-5.5a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z"],"star":["M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z"]};
  const ic=(n,c='')=>`<svg class="oc${c?' '+c:''}" viewBox="0 0 16 16" aria-hidden="true">${OCT[n].map(d=>`<path d="${d}"/>`).join('')}</svg>`;
  const STATES={
    pr:{open:['git-pull-request','Open','open'],draft:['git-pull-request-draft','Draft','muted'],merged:['git-merge','Merged','merged'],closed:['git-pull-request-closed','Closed','closed']},
    issue:{open:['issue-opened','Open','open'],completed:['issue-closed','Closed','done'],not_planned:['skip','Not planned','muted']}
  };
  const FILTERS=[['all','All'],['pr','Pull requests'],['issue','Issues'],['comment','Comments']];
  const group=i=>i.kind==='review'?'comment':i.kind;
  const stars=n=>n>=1000?(n/1000).toFixed(n>=10000?0:1).replace(/\.0$/,'')+'k':String(n);
  const plural=(n,one,many)=>`<b>${n}</b> ${n===1?one:many}`;
  // titles, as GitHub shows them: `code` in backticks set as code (escaped first, like everything else)
  const title=t=>esc(t).replace(/`([^`]+)`/g,'<code>$1</code>');
  // when, as it happened: the time of day for anything this week, so two
  // comments on one thread read as last night and this morning, not as one
  // moment; the date for anything older. the tooltip has the whole timestamp
  const clock=d=>d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
  const ago=iso=>{const d=new Date(iso),now=new Date(),y=new Date(now);y.setDate(now.getDate()-1);
    if(d.toDateString()===now.toDateString())return 'today '+clock(d);
    if(d.toDateString()===y.toDateString())return 'yesterday '+clock(d);
    if(now-d<6*86400000)return d.toLocaleDateString('en-US',{weekday:'short'})+' '+clock(d);
    return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:d.getFullYear()===now.getFullYear()?undefined:'numeric'})};
  const full=iso=>new Date(iso).toLocaleString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'});
  const month=iso=>new Date(iso).toLocaleDateString('en-US',{month:'long',year:'numeric',timeZone:'UTC'});
  let data=null,fetchedAt=0,loading=false,filter='all',limit=24,uid=0;
  const opened=new Set();   // open dropdowns survive a filter change or a longer list
  const CHEV='<svg class="os-chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M4.5 2.5 8 6l-3.5 3.5"/></svg>';
  const GO='<svg class="go-ic" viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4"/></svg>';

  // GitHub's markdown, rendered here from the raw text rather than taken as
  // HTML: everything is escaped first, and only these tags are ever added, so
  // a stranger's comment can't put anything onto the page
  function md(src){
    const stash=[],keep=h=>'\u0000'+(stash.push(h)-1)+'\u0000';
    const ext='target="_blank" rel="noopener"';
    const inline=raw=>esc(raw)
      .replace(/`([^`\n]+)`/g,(_,c)=>keep(`<code>${c}</code>`))
      .replace(/!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g,(_,u)=>keep(`<a href="${u}" ${ext}>image</a>`))
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,(_,t,u)=>keep(`<a href="${u}" ${ext}>${t}</a>`))
      .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g,(_,b,u)=>b+keep(`<a href="${u}" ${ext}>${u.replace(/^https?:\/\/(www\.)?/,'')}</a>`))
      .replace(/(^|[\s(])@([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))\b/g,(_,b,n)=>b+keep(`<a class="os-at" href="https://github.com/${n}" ${ext}>@${n}</a>`))
      .replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>')
      .replace(/(^|[\s(])[*_](?=\S)([^*_]+?)[*_](?=[\s).,:;!?]|$)/g,'$1<em>$2</em>')   // _word_ only at word edges, so snake_case stays put; may run across lines of one paragraph
      .replace(/\u0000(\d+)\u0000/g,(_,k)=>stash[k]);
    const block=t=>t.split(/\n{2,}/).map(p=>p.replace(/^\n+|\n+$/g,'')).filter(Boolean).map(p=>{
      const L=p.split('\n');
      if(L.every(l=>/^\s*>/.test(l))){
        // a quote can hold lists and paragraphs of its own; GitHub's > [!NOTE] style alerts get their label
        let q=L.map(l=>l.replace(/^\s*>\s?/,'')).join('\n');
        const al=/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i.exec(q);
        if(al)q=q.slice(al[0].length);
        return `<blockquote${al?' class="os-alert"':''}>${al?`<p><strong>${al[1][0]+al[1].slice(1).toLowerCase()}</strong></p>`:''}${block(q)}</blockquote>`;
      }
      // runs of list lines become lists and the lines between them stay text,
      // so "Before you start:" followed by "- one" reads as GitHub shows it
      const isLi=l=>/^\s*(?:[-*+]|\d+\.)\s/.test(l),runs=[];
      for(const l of L){const li=isLi(l),r=runs[runs.length-1];if(r&&r.li===li)r.lines.push(l);else runs.push({li,lines:[l]})}
      return runs.map(r=>r.li
        ?`<ul>${r.lines.map(l=>`<li>${inline(l.replace(/^\s*(?:[-*+]|\d+\.)\s+(?:\[[ xX]\]\s*)?/,''))}</li>`).join('')}</ul>`
        :`<p>${r.lines.some(l=>/^#{1,6}\s/.test(l))
            ?r.lines.map(l=>/^#{1,6}\s/.test(l)?`<strong>${inline(l.replace(/^#+\s*/,''))}</strong>`:inline(l)).join('<br>')
            :inline(r.lines.join('\n')).replace(/\n/g,'<br>')}</p>`).join('');   // inline over the whole run, so emphasis can wrap a line
    }).join('');
    let html='',last=0,m;const fence=/^\s*```[^\n]*\n([\s\S]*?)^\s*```\s*$/gm;
    while((m=fence.exec(src))){html+=block(src.slice(last,m.index))+`<pre><code>${esc(m[1].replace(/\n$/,''))}</code></pre>`;last=fence.lastIndex}
    return html+block(src.slice(last));
  }
  const ROLE={OWNER:'Owner',MEMBER:'Member',COLLABORATOR:'Collaborator',CONTRIBUTOR:'Contributor',FIRST_TIME_CONTRIBUTOR:'First-time contributor',FIRST_TIMER:'First-time contributor'};
  const day=iso=>new Date(iso).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
  function say(c,t,verb,focus){
    const me=c.who.login.toLowerCase()===data.user.toLowerCase();
    const roles=[ROLE[c.role],c.who.login===t.opener.who.login?'Author':null].filter(Boolean)
      .map(r=>`<span class="os-role">${r}</span>`).join('');
    const ext='target="_blank" rel="noopener"';
    const av=c.who.avatar?`<img src="${esc(c.who.avatar)}" alt="" width="28" height="28" loading="lazy" decoding="async">`:'';
    return `<div class="os-say${me?' me':''}${focus?' focus':''}"><a class="os-av" href="${esc(c.who.url)}" ${ext} tabindex="-1" aria-hidden="true">${av}</a>`+
      `<div class="os-say-box"><div class="os-say-h"><a class="os-who" href="${esc(c.who.url)}" ${ext}>${esc(c.who.login)}</a>`+
      `<span>${verb}</span><a class="os-say-when" href="${esc(c.url)}" ${ext}><time datetime="${esc(c.at)}" title="${full(c.at)}">${day(c.at)}</time></a>`+
      (c.edited?`<span class="os-edited" title="Edited since. This is its current text">edited</span>`:'')+
      `<span class="os-roles">${roles}</span></div>`+
      `<div class="os-md">${c.md?md(c.md):'<p class="os-quiet">No description provided.</p>'}`+
      (c.more?`<a class="os-rest" href="${esc(c.url)}" ${ext}>Read the rest on GitHub${GO}</a>`:'')+`</div></div></div>`;
  }
  function event(e,t){
    const ext='target="_blank" rel="noopener"',who=`<b>${esc(e.actor)}</b>`,when=`<time datetime="${esc(e.at)}" title="${full(e.at)}">${day(e.at)}</time>`;
    let icon,tone,text;
    if(e.type==='merged'){icon='git-merge';tone='merged';text='merged this'}
    else if(e.type==='closed'){
      if(t.kind==='pr'){icon='git-pull-request-closed';tone='closed';text='closed this'}
      else if(e.reason==='not_planned'||e.reason==='duplicate'){icon='skip';tone='muted';text='closed this as not planned'}
      else{icon='issue-closed';tone='done';text='closed this as completed'}}
    else if(e.type==='reopened'){icon=t.kind==='pr'?'git-pull-request':'issue-reopened';tone='open';text='reopened this'}
    else if(e.type==='crossreferenced'&&e.ref){icon=e.ref.kind==='pr'?'git-pull-request':'issue-opened';tone='muted';
      text=`mentioned this in <a href="${esc(e.ref.url)}" ${ext}>${title(e.ref.title)} <span class="os-num">#${e.ref.num}</span></a>`}
    else return '';
    return `<div class="os-evt t-${tone}"><span class="os-evt-ic">${ic(OCT[icon]?icon:'issue-opened')}</span><span class="os-evt-t">${who} ${text} ${when}</span></div>`;
  }
  // the thread as it stood at a moment: its state replayed from the events
  // up to then (open until closed, merged or reopened), and only what had
  // been posted by then
  function stateAt(t,at){
    let st='open';
    for(const e of t.events.filter(e=>e.at<=at).sort((x,y)=>x.at<y.at?-1:1)){
      if(e.type==='merged')st='merged';
      else if(e.type==='closed')st=t.kind==='pr'?'closed':(e.reason==='not_planned'||e.reason==='duplicate'?'not_planned':'completed');
      else if(e.type==='reopened')st='open';
    }
    return st;
  }
  function conversation(i){
    const t=data.threads&&data.threads[i.thread];
    if(!t)return '';
    const upTo=x=>x.at<=i.at;
    // this entry's own comment is outlined, the way GitHub marks a comment you
    // followed a link to. if it's older than the comments fetched with the
    // thread, it is placed in from the entry itself
    const comments=t.comments.slice();
    if(i.kind==='comment'&&!comments.some(c=>c.url===i.url))
      comments.push({at:i.at,url:i.url,role:i.role,md:i.md,more:i.more,who:{login:data.user,url:'https://github.com/'+data.user,avatar:null}});
    const then=comments.filter(upTo),later=comments.length-then.length+t.events.filter(e=>!upTo(e)).length;   // later replies, or a later close or merge
    // comments older than the ones fetched: a count when they all came before this
    // moment, otherwise just the way to them
    const unseen=t.total-t.comments.length,firstFetched=t.comments.length?t.comments[0].at:null;
    const earlier=unseen<=0?'':!firstFetched||firstFetched<=i.at
      ?`${unseen} earlier comment${unseen>1?'s':''} on GitHub`:'Earlier comments on GitHub';
    const flow=[...then.map(c=>({at:c.at,h:say(c,t,'commented',c.url===i.url)})),...t.events.filter(upTo).map(e=>({at:e.at,h:event(e,t)}))]
      .sort((a,b)=>a.at<b.at?-1:1).map(x=>x.h).join('');
    return say(t.opener,t,`opened this ${t.kind==='pr'?'pull request':'issue'}`)+
      (earlier?`<a class="os-earlier" href="${esc(t.url)}" target="_blank" rel="noopener">${earlier}${GO}</a>`:'')+flow+
      (later?`<a class="os-earlier os-after" href="${esc(t.url)}" target="_blank" rel="noopener">The thread continued after this. Read it on GitHub${GO}</a>`:'');
  }

  function item(i){
    const repo=data.repos[i.repo]||{name:i.repo,url:'https://github.com/'+i.repo,stars:0};
    const thread=i.kind==='pr'||i.on==='pr'||i.kind==='review'?'pr':'issue';
    // a comment or review shows the thread's state when it was written, not today's
    const tt=(i.kind==='comment'||i.kind==='review')&&data.threads&&data.threads[i.thread];
    const st=tt?stateAt(tt,i.at):i.state;
    const [sIc,sLabel,tone]=(STATES[thread][st]||STATES[thread].open);
    const ext='target="_blank" rel="noopener"';
    const where=`<a class="os-repo" href="${esc(repo.url)}" ${ext}>${esc(repo.name)}</a>`+
      (repo.stars?`<span class="os-stars" title="${repo.stars.toLocaleString('en-US')} stars">${ic('star')}${stars(repo.stars)}</span>`:'');
    const when=`<time datetime="${esc(i.at)}" title="${full(i.at)}">${ago(i.at)}</time>`;
    let verb,badge,body;
    if(i.kind==='pr'||i.kind==='issue'){
      verb=i.kind==='pr'?'Opened a pull request in':'Opened an issue in';
      badge=`<span class="os-ic solid">${ic(sIc)}</span>`;
      body=`<p class="os-t"><a class="os-title" href="${esc(i.url)}" ${ext}>${title(i.title)}</a> <span class="os-num">#${i.num}</span>`+
        ` <span class="os-pill">${ic(sIc)}${sLabel}</span></p>`;
    }else{
      const what=thread==='pr'?'a pull request':'an issue';
      verb=i.kind==='review'?({approved:'Approved',changes_requested:'Requested changes on'}[i.verdict]||'Reviewed')+' '+what+' in'
        :`Commented on ${what} in`;
      badge=`<span class="os-ic">${ic(i.kind==='review'?'eye':'comment')}</span>`;
      // the thread is the header, with its status; the whole conversation drops down under it
      const id='osc-'+(++uid),on=opened.has(i.url),th=conversation(i);
      body=`<div class="os-card${on?' open':''}" data-k="${esc(i.url)}">`+
        `<button type="button" class="os-card-h" aria-expanded="${on}" aria-controls="${id}">${ic(sIc,'tone')}`+
        `<span class="os-card-t">${title(i.title)}</span><span class="os-num">#${i.num}</span>`+
        `<span class="os-pill sm">${sLabel}</span>${CHEV}</button>`+
        `<div class="os-card-more" id="${id}" role="region" aria-label="${esc(i.title)}"${on?'':' inert'}><div class="os-card-in"><div class="os-thread">`+
        (th||`<a class="os-earlier" href="${esc(i.threadUrl)}" target="_blank" rel="noopener">Read the thread on GitHub${GO}</a>`)+
        `</div></div></div></div>`;
    }
    return `<li class="os-i t-${tone}">${badge}<div class="os-c"><p class="os-meta"><span>${verb}</span>${where}${when}</p>${body}</div></li>`;
  }

  function render(){
    host.removeAttribute('aria-busy');
    if(!data||!data.items||!data.items.length){
      host.innerHTML=`<p class="os-status">Couldn't load my activity from GitHub just now. <a class="go" href="https://github.com/THEpranavsomalraju" target="_blank" rel="noopener">See it on GitHub<svg class="go-ic" viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4"/></svg></a></p>`;
      return;
    }
    const t=data.totals,has=k=>k==='all'||data.items.some(i=>group(i)===k);
    const shown=data.items.filter(i=>filter==='all'||group(i)===filter);
    let html=`<div class="os-head"><p class="os-sum">${plural(t.prs,'pull request','pull requests')}, ${plural(t.issues,'issue','issues')} and ${plural(t.comments,'comment','comments')} across ${plural(t.repos,'open-source project','open-source projects')}</p>`+
      `<div class="os-filter" role="group" aria-label="Show"><span class="os-thumb" aria-hidden="true"></span>`+
      FILTERS.filter(([k])=>has(k)).map(([k,l])=>`<button type="button" class="os-fb" data-f="${k}" aria-pressed="${k===filter}">${l}</button>`).join('')+`</div></div>`;
    let cur='';
    shown.slice(0,limit).forEach(i=>{
      const m=month(i.at);
      if(m!==cur){html+=(cur?'</ol>':'')+`<h3 class="os-month">${m}</h3><ol class="os-tl">`;cur=m}
      html+=item(i);
    });
    if(cur)html+='</ol>';
    if(shown.length>limit)html+=`<button type="button" class="os-more">Show older activity</button>`;
    host.innerHTML=html;
    placeThumb(true);
  }
  // the filter's ink slides to whichever is chosen, like the tab underline
  function placeThumb(instant){
    const on=$('.os-fb[aria-pressed="true"]',host),th=$('.os-thumb',host);
    if(!on||!th)return;
    if(instant)th.style.transition='none';
    th.style.transform=`translateX(${on.offsetLeft}px)`;th.style.width=on.offsetWidth+'px';
    if(instant){void th.offsetWidth;th.style.transition=''}
  }
  host.addEventListener('click',e=>{
    const f=e.target.closest('.os-fb');
    if(f){if(f.dataset.f!==filter){filter=f.dataset.f;limit=24;
      $$('.os-fb',host).forEach(b=>b.setAttribute('aria-pressed',b===f));placeThumb();setTimeout(render,reduce?0:180)}return}
    const h=e.target.closest('.os-card-h');
    if(h){const card=h.closest('.os-card'),on=!card.classList.contains('open');
      card.classList.toggle('open',on);h.setAttribute('aria-expanded',on);$('#'+h.getAttribute('aria-controls')).inert=!on;
      on?opened.add(card.dataset.k):opened.delete(card.dataset.k);
      const f=on&&$('.os-say.focus',card);
      if(f)setTimeout(()=>{const r=f.getBoundingClientRect();if(r.top<56||r.bottom>innerHeight)f.scrollIntoView({block:'center',behavior:reduce?'auto':'smooth'})},reduce?0:430);
      return}
    if(e.target.closest('.os-more')){limit+=24;const y=scrollY;render();scrollTo(0,y)}
  });
  addEventListener('resize',()=>placeThumb(true));

  let lastJson='';
  function load(){
    if(loading)return;loading=true;
    fetch('/api/opensource',{headers:{accept:'application/json'}})
      .then(r=>r.ok?r.text():null).catch(()=>null)
      .then(txt=>{
        loading=false;
        let d=null;try{d=txt&&JSON.parse(txt)}catch(e){}
        if(d&&d.items){fetchedAt=Date.now();if(txt===lastJson&&data)return;lastJson=txt;data=d}
        else if(data)return;          // a failed refresh keeps what's already showing
        const y=scrollY;render();if(curTab==='opensource')scrollTo(0,y);   // open dropdowns stay open: they're keyed by comment
      });
  }
  // while the tab is open, check for new activity every five minutes, the
  // same as the edge cache, so a comment I've just posted turns up by itself
  setInterval(()=>{if(curTab==='opensource'&&!document.hidden)load()},5*60*1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&curTab==='opensource'&&Date.now()-fetchedAt>5*60*1000)load()});
  // fetched quietly once the page is idle, so the tab is usually ready before it's opened
  (window.requestIdleCallback||(f=>setTimeout(f,2500)))(()=>{if(!data)load()});
  return{enter(){if(!data||Date.now()-fetchedAt>5*60*1000)load();else placeThumb(true)}};
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
  const n={'1':'home','2':'experience','3':'projects','4':'opensource'}[e.key];
  if(n)location.hash=n;
});

// ───────────────────────── the bio's ink ─────────────────────────
// the highlighter strokes go down the first time the bio is actually seen
(function(){
  const bio=$('#bio');if(!bio)return;
  $$('mark',bio).forEach((m,n)=>m.style.setProperty('--n',n));
  if(reduce){bio.classList.add('inked');return}
  const io=new IntersectionObserver(es=>{
    if(es.some(e=>e.isIntersecting)){requestAnimationFrame(()=>bio.classList.add('inked'));io.disconnect()}
  },{threshold:.6});
  io.observe(bio);
})();

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
  // Spotify's history trails what's actually been on, so the page also keeps
  // its own: whenever the song at the front changes, the one it replaced
  // goes into history right away. Kept in this browser for a few hours.
  const SAME=15*60*1000,HOLD=6*3600*1000;
  const read=k=>{try{return JSON.parse(store.get(k)||'null')}catch(e){return null}};
  let mem=read('ls-seen')||[],front=read('ls-front');
  function merge(tracks){
    const cur=tracks[0]&&(tracks[0].playing||tracks[0].paused)?tracks[0]:null;
    if(cur&&front&&front.id!==cur.id)mem.unshift(Object.assign({},front,{playing:false,paused:false,playedAt:new Date().toISOString()}));
    if(cur)front=cur;
    mem=mem.filter(t=>t&&t.playedAt&&Date.now()-Date.parse(t.playedAt)<HOLD).slice(0,12);
    store.set('ls-seen',JSON.stringify(mem));store.set('ls-front',JSON.stringify(front));
    const rest=tracks.slice(cur?1:0).concat(mem).filter(t=>t.playedAt).sort((x,y)=>Date.parse(y.playedAt)-Date.parse(x.playedAt));
    const out=cur?[cur]:[];
    for(const t of rest){
      const at=Date.parse(t.playedAt);
      if(cur&&t.id===cur.id&&Date.now()-at<SAME)continue;
      if(out.some(o=>o.id===t.id&&o.playedAt&&Math.abs(Date.parse(o.playedAt)-at)<SAME))continue;
      out.push(t);if(out.length>=12)break;
    }
    return out;
  }
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
    overlay:t.playing?'<span class="eq"><i></i><i></i><i></i></span>now playing':esc((t.paused?'paused · ':'')+ago(t.playedAt)),
    action:t.url?'Play on Spotify':null,href:t.url
  }));
  function load(){
    fetch('/api/listening',{headers:{accept:'application/json'},cache:'no-store'})
      .then(r=>r.ok?r.json():null)
      .then(d=>{
        if(!d||!Array.isArray(d.tracks)||!d.tracks.length)return;
        d.tracks=merge(d.tracks);
        const key=d.tracks.map(t=>t.id+(t.playing?'*':t.paused?'~':'')).join();
        if(key===shown||(car&&car.busy))return;
        shown=key;box.hidden=false;
        const slides=toSlides(d.tracks);
        if(car){car.setSlides(slides);return}
        car=window.SqueezeCarousel.mount(host,{slides,aspect:1,label:'Songs I played recently'});
        $('#ls-prev').addEventListener('click',()=>car.step(-1));
        $('#ls-next').addEventListener('click',()=>car.step(1));
      }).catch(()=>{});
  }
  load();setInterval(()=>{if(!document.hidden)load()},15000);
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
        else sky=window.ContributionSkyline.mount(host,{data:d.days,palette:'github',lift:'hover',duration:780});
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

// ───────────────────────── every other letter, too ─────────────────────────
// pass over any text and the letters under the pointer fall to signal for a
// beat. the real letter stays where it is, just transparent, with the glyph
// drawn over it, so nothing on the line moves and the text is never changed.
(function(){
  if(reduce)return;
  const GLYPHS='01#/<>{}*+=%$';
  const SKIP='input,textarea,select,svg,canvas,script,style,kbd,#title,.scr,.palette,[contenteditable]';
  const caretAt=(x,y)=>{
    if(document.caretPositionFromPoint){const p=document.caretPositionFromPoint(x,y);return p&&{node:p.offsetNode,offset:p.offset}}
    if(document.caretRangeFromPoint){const r=document.caretRangeFromPoint(x,y);return r&&{node:r.startContainer,offset:r.startOffset}}
    return null;
  };
  const range=document.createRange();
  const under=(node,i,x,y)=>{
    if(i<0||i>=node.length)return false;
    range.setStart(node,i);range.setEnd(node,i+1);
    const b=range.getBoundingClientRect();
    return x>=b.left&&x<=b.right&&y>=b.top&&y<=b.bottom;
  };
  function wrap(node,i){
    if(!node.parentNode||i<0||i>=node.length||/\s/.test(node.data[i]))return null;
    const ch=node.splitText(i);ch.splitText(1);
    const s=document.createElement('span');s.className='scr';
    ch.parentNode.insertBefore(s,ch);s.appendChild(ch);
    s.style.setProperty('--sc',getComputedStyle(s.parentElement).color);
    return s;
  }
  function scramble(s){
    let ticks=0;const stop=4+Math.floor(Math.random()*5);
    s.dataset.g=GLYPHS[Math.floor(Math.random()*GLYPHS.length)];
    const iv=setInterval(()=>{
      if(ticks++<stop){s.dataset.g=GLYPHS[Math.floor(Math.random()*GLYPHS.length)];return}
      clearInterval(iv);
      const p=s.parentNode;if(!p)return;
      p.replaceChild(s.firstChild,s);p.normalize();
    },48);
  }
  let raf=0,ev=null,last=0;
  document.addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse')return;
    ev=e;if(!raf)raf=requestAnimationFrame(tick);
  },{passive:true});
  function tick(){
    raf=0;const now=performance.now();
    if(now-last<30||!ev)return;
    const c=caretAt(ev.clientX,ev.clientY);
    if(!c||!c.node||c.node.nodeType!==3)return;
    const el=c.node.parentElement;
    if(!el||el.closest(SKIP))return;
    // the caret lands between letters; take whichever side the pointer is actually on
    const i=under(c.node,c.offset,ev.clientX,ev.clientY)?c.offset:under(c.node,c.offset-1,ev.clientX,ev.clientY)?c.offset-1:-1;
    if(i<0)return;
    last=now;
    const node=c.node,picks=[i];
    if(Math.random()<.7)picks.push(i+1);
    if(Math.random()<.7)picks.push(i-1);
    // right to left, so splitting one letter off never shifts the next index
    picks.sort((a,b)=>b-a).forEach(k=>{const s=wrap(node,k);if(s)scramble(s)});
  }
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
    const vis=$$('.view:not([hidden]) :is(p,li,h2,blockquote,dd)').filter(el=>{
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
