const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

// intro curtain
(function(){
  const intro=document.getElementById('intro');
  document.body.classList.add('locked');
  let closed=false;
  function close(){
    if(closed)return; closed=true;
    intro.classList.add('done');
    document.body.classList.remove('locked');
    setTimeout(()=>intro.remove(),1200);
  }
  if(reduce){intro.remove();document.body.classList.remove('locked');return}
  const timer=setTimeout(close,2300);
  ['pointerdown','keydown','wheel','touchstart'].forEach(ev=>
    addEventListener(ev,()=>{clearTimeout(timer);close()},{once:true,passive:true}));
})();
const root=document.documentElement;
document.getElementById('toggle').onclick=()=>root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';

const revealables='.rev,.stagger,.row,.slides';
(function(){
  window.scrollTo(0,0);
  const els=[...document.querySelectorAll(revealables)];
  if(reduce||!('IntersectionObserver' in window))return;   // no arming, no animation
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}
  }),{threshold:0,rootMargin:'0px 0px -12% 0px'});
  els.forEach(el=>{
    // only hide what the visitor has not seen yet
    if(el.getBoundingClientRect().top > innerHeight*0.88){
      el.classList.add('armed');
      io.observe(el);
    }
  });
})();

// scroll cue: bobs at the bottom of the hero, fades once you've actually scrolled
(function(){
  const cue=document.getElementById('scrolldown');
  if(!cue)return;
  const onScroll=()=>cue.classList.toggle('hide',scrollY>60);
  onScroll();
  addEventListener('scroll',onScroll,{passive:true});
})();

const links=[...document.querySelectorAll('.rail a')];
const sio=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;
  links.forEach(l=>l.classList.toggle('on',l.dataset.t===e.target.id));
}),{threshold:.4});
document.querySelectorAll('section').forEach(s=>sio.observe(s));

// portrait tilts toward the cursor
if(!reduce&&matchMedia('(pointer:fine)').matches){
  const stack=document.getElementById('stack'),portrait=document.getElementById('portrait');
  stack.addEventListener('pointermove',e=>{
    const r=stack.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    portrait.style.transform=`rotateY(${x*9}deg) rotateX(${-y*9}deg)`;
  });
  stack.addEventListener('pointerleave',()=>{
    portrait.style.transition='transform .6s cubic-bezier(.16,1,.3,1)';
    portrait.style.transform='';
    setTimeout(()=>portrait.style.transition='transform .3s ease-out',600);
  });
}

// plates drift against the scroll
const plates=[...document.querySelectorAll('.plate .inner')];
if(!reduce){
  (function loop(){
    plates.forEach(b=>{
      const r=b.getBoundingClientRect();
      const prog=(r.top+r.height/2-innerHeight/2)/innerHeight;
      b.style.translate=`0 ${prog*-14}px`;
    });
    requestAnimationFrame(loop);
  })();
}

// projects network: an output fires, its path lights up, the readout follows
(function(){
  const data=[
    {n:'01',t:'EyeCode',d:'A webcam turns eye blinks into Morse code, then into text. Won HackNC 2025.',
     tags:['python','flask','opencv','mediapipe'],feeds:[0,2],a:[0,1],b:[0,1],url:'https://github.com/THEpranavsomalraju/eyecode'},
    {n:'02',t:'Clinician GUI',d:'Built with a Caltech mentor so clinicians run the rejection model with no terminal, no IDE, and no machine learning background.',
     tags:['python','pytorch','gui'],feeds:[0,1,4],a:[1,2],b:[1,2],url:'https://github.com/THEpranavsomalraju/Clinician-GUI'},
    {n:'03',t:'Rejection Classifier',d:'A fine-tuned ResNet50 grading cardiac transplant rejection at 98% validation accuracy, and 99.2% on the two calls pathologists agree on least.',
     tags:['pytorch','resnet50','umap'],feeds:[0,1],a:[0,2,3],b:[0,2],url:'https://github.com/THEpranavsomalraju/Rejection-Classifer-Caltech-Duke'},
    {n:'04',t:'Card Dispute PRD',d:'21,508 CFPB complaint narratives, six tagged failure patterns, and one scoped fix at the denial stage, checked against Regulation Z.',
     tags:['product','python','cfpb api'],feeds:[0,3,4],a:[2,3],b:[1,2],url:'https://github.com/THEpranavsomalraju/card-dispute-prd'}
  ];
  const svg=document.querySelector('.graph');
  if(!svg)return;

  // fit the viewBox to the actual ink so the net sits dead centre
  function centreOf(sel){
    let x0=Infinity,x1=-Infinity;
    svg.querySelectorAll(sel).forEach(n=>{
      const b=n.getBBox();
      x0=Math.min(x0,b.x); x1=Math.max(x1,b.x+b.width);
    });
    return (x0+x1)/2;
  }
  function fit(){
    svg.classList.add('measuring');
    svg.removeAttribute('viewBox');
    // each caption sits over the true centre of its column, project names included
    const place=(id,sel)=>{const t=document.getElementById(id);if(t)t.setAttribute('x',centreOf(sel).toFixed(1))};
    place('lab-in','.n-in');
    place('lab-out','.out');
    const b=svg.getBBox();
    const pad=14, shift=120;   // padding added on the left only, nudging the net right
    svg.setAttribute('viewBox',`${b.x-pad-shift} ${b.y-pad} ${b.width+pad*2+shift} ${b.height+pad*2}`);
    svg.classList.remove('measuring');
  }
  const refit=()=>requestAnimationFrame(fit);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(refit); else refit();
  addEventListener('resize',()=>{clearTimeout(svg._t);svg._t=setTimeout(refit,180)});
  const panel=document.getElementById('panel');
  const outs=[...svg.querySelectorAll('.out')];
  const allEdges=[...svg.querySelectorAll('.edge')];
  let cur=-1,auto,blip;
  const q=sel=>svg.querySelector(sel);

  function paint(k){
    const p=data[k];
    allEdges.forEach(e=>e.classList.remove('lit'));
    svg.querySelectorAll('.n-in,.n-hid').forEach(n=>n.classList.remove('lit'));
    p.feeds.forEach(i=>{q('.i'+i).classList.add('lit');
      p.a.forEach(j=>q('.e-i'+i+'-a'+j).classList.add('lit'));});
    p.a.forEach(j=>{q('.a'+j).classList.add('lit');
      p.b.forEach(m=>q('.e-a'+j+'-b'+m).classList.add('lit'));});
    p.b.forEach(m=>{q('.b'+m).classList.add('lit');
      q('.e-b'+m+'-o'+k).classList.add('lit');});
    outs.forEach((o,i)=>o.classList.toggle('on',i===k));
  }
  function select(k,instant){
    if(k===cur)return; cur=k;
    paint(k);
    const p=data[k];
    const fill=()=>{
      document.getElementById('p-n').textContent=p.n;
      document.getElementById('p-t').textContent=p.t;
      document.getElementById('p-d').textContent=p.d;
      document.getElementById('p-tags').innerHTML=p.tags.map(t=>'<span class="tag">'+t+'</span>').join('');
      document.getElementById('p-link').href=p.url;
      panel.classList.remove('swap');
    };
    if(instant||reduce){fill();return}
    panel.classList.add('swap');
    setTimeout(fill,180);
  }
  outs.forEach((o,i)=>{
    const pick=()=>{stop();select(i)};
    o.addEventListener('pointerenter',pick);
    o.addEventListener('click',pick);
    o.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick()}});
  });

  // hovering an input (e.g. python, sql) lights every project it feeds into
  function paintInput(i){
    allEdges.forEach(e=>e.classList.remove('lit'));
    svg.querySelectorAll('.n-in,.n-hid').forEach(n=>n.classList.remove('lit'));
    outs.forEach(o=>o.classList.remove('on'));
    q('.i'+i).classList.add('lit');
    data.forEach((p,k)=>{
      if(!p.feeds.includes(i))return;
      p.a.forEach(j=>{
        q('.e-i'+i+'-a'+j).classList.add('lit');
        q('.a'+j).classList.add('lit');
        p.b.forEach(m=>{
          q('.e-a'+j+'-b'+m).classList.add('lit');
          q('.b'+m).classList.add('lit');
          q('.e-b'+m+'-o'+k).classList.add('lit');
        });
      });
      outs[k].classList.add('on');
    });
  }
  svg.querySelectorAll('.n-in').forEach(n=>{
    const cls=[...n.classList].find(c=>/^i\d+$/.test(c));
    if(!cls)return;
    const i=+cls.slice(1);
    n.addEventListener('pointerenter',()=>{stop();paintInput(i)});
    n.addEventListener('pointerleave',()=>{if(cur>=0)paint(cur)});
  });
  function stop(){clearInterval(auto);auto=null}
  // (re)starts the run-through at project 1, so it never picks up mid-cycle
  function restart(){
    stop();
    cur=-1;
    select(0,true);
    if(!reduce)auto=setInterval(()=>select((cur+1)%data.length),3800);
  }

  // the net assembles itself the first time it is seen: nodes drift in from
  // scattered points in no particular order, the edges knit them together,
  // then the readout takes over at project 01
  const BUILD=2200;   // outlasts the last edge (cue up to 1550 + .6s)
  let buildTimer,built=false;
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const cue=(el,ms)=>el.style.setProperty('--d',Math.round(ms)+'ms');
  function finish(){
    clearTimeout(buildTimer);
    svg.classList.remove('building');
    restart();
  }
  function build(){
    built=true;
    stop();
    panel.classList.add('swap');
    svg.classList.remove('idle');
    // every node starts somewhere it does not belong, on its own clock
    [...svg.querySelectorAll('.n-in,.n-hid'),...outs].forEach(g=>{
      const shape=g.querySelector('.body')||g.querySelector('circle');
      const d=rnd(0,520);
      cue(shape,d);
      shape.style.setProperty('--dx',Math.round(rnd(-80,80))+'px');
      shape.style.setProperty('--dy',Math.round(rnd(-70,70))+'px');
      // labels wait for their node to land before showing up
      g.querySelectorAll('text').forEach(t=>cue(t,d+720));
    });
    // then the wiring finds them, in scattered order
    allEdges.forEach(e=>{
      if(e._len==null)e._len=e.getTotalLength();
      e.style.setProperty('--dash',e._len.toFixed(1)+'px');
      cue(e,rnd(950,1550));
    });
    svg.querySelectorAll('.layerlab').forEach(l=>cue(l,rnd(1350,1500)));
    svg.classList.add('building');
    buildTimer=setTimeout(finish,BUILD);
  }

  if(reduce||!('IntersectionObserver' in window)){
    restart();
  }else{
    svg.classList.add('idle');       // stay dark until the visitor first arrives
    svg.addEventListener('pointerdown',stop);
    new IntersectionObserver(es=>es.forEach(e=>{
      if(e.isIntersecting){
        built?restart():build();     // built once; later visits just recue at 01
        return;
      }
      // left mid-build: land it now, so coming back finds a finished net
      if(svg.classList.contains('building'))finish();
      stop();
    }),{threshold:.25}).observe(document.querySelector('.graphwrap'));
  }
  if(!reduce){
    // idle chatter on the quiet edges
    blip=setInterval(()=>{
      if(svg.classList.contains('building')||svg.classList.contains('idle'))return;
      const dark=allEdges.filter(e=>!e.classList.contains('lit'));
      if(!dark.length)return;
      const e=dark[Math.floor(Math.random()*dark.length)];
      e.classList.add('blip');
      setTimeout(()=>e.classList.remove('blip'),1400);
    },700);
  }
})();

// ticker bands react to scroll speed
(function(){
  if(reduce)return;
  const tracks=[...document.querySelectorAll('.track')];
  function fill(t){
    const unit=t.dataset.unit||(t.dataset.unit=t.innerHTML);
    t.innerHTML=unit;
    const need=t.parentElement.clientWidth;
    let guard=0;
    while(t.offsetWidth<need&&guard++<40)t.innerHTML+=unit;
    const pass=t.offsetWidth;      // width of one full pass, measured
    t.innerHTML+=t.innerHTML;      // clone it, so the track is exactly two passes
    t._half=pass;
    t._x=0;t.style.transform='translateX(0px)';
  }
  tracks.forEach(fill);
  addEventListener('resize',()=>{clearTimeout(window._bt);window._bt=setTimeout(()=>tracks.forEach(fill),200)});
  let last=scrollY,vel=0;
  addEventListener('scroll',()=>{vel=(scrollY-last)*.35;last=scrollY});
  (function loop(){
    vel*=.92;
    tracks.forEach(t=>{
      const dir=+t.dataset.dir,half=t._half||t.offsetWidth/2;
      t._x-=dir*(.5+vel*dir);
      if(t._x<=-half)t._x+=half;
      if(t._x>0)t._x-=half;
      t.style.transform=`translateX(${t._x}px)`;
    });
    requestAnimationFrame(loop);
  })();
})();

// magnetic buttons
if(!reduce&&matchMedia('(pointer:fine)').matches){
  document.querySelectorAll('.btn').forEach(b=>{
    b.addEventListener('pointermove',e=>{
      const r=b.getBoundingClientRect();
      b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.14}px, ${(e.clientY-r.top-r.height/2)*.22}px)`;
    });
    b.addEventListener('pointerleave',()=>{
      b.style.transition='transform .4s cubic-bezier(.16,1,.3,1)';b.style.transform='';
      setTimeout(()=>b.style.transition='',400);
    });
  });
}
