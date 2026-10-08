/*
 * Squeeze carousel — one panel gets the room, the rest squeeze into columns
 * and slats down the right. A dependency-free port of the React component
 * (carousel-squeeze.tsx) for this no-build site. Same geometry: four columns
 * share what's left after the open card, slats and gaps are paid for, and
 * everything is sized in CSS off the carousel's own width (container units),
 * so nothing is measured. The row is a strip that slides, not a ring that
 * turns. Styling lives in style.css under .sq-*.
 *
 *   const sq = SqueezeCarousel.mount(el, { slides, label, aspect: 1 })
 *   sq.setSlides(next)   // swap the data in when nobody is mid-browse
 *
 * A slide is { title, description?, image?, imageAlt?, overlay?, action?, href?, meta? }.
 */
window.SqueezeCarousel=(function(){
'use strict';

const size=v=>typeof v==='number'?v+'px':v;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
// Column shares of the room left over. They sum to one, so the row is always
// exactly full. Hovering a column gives it a tenth more; the others pay.
const SHARES=[0,.55,.3,.15];
const STRETCH=i=>SHARES[i]+(i===0?.06:.1);
const SQUEEZE=i=>SHARES[i]-(i===0?.06:.02);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function mount(host,opts){
  const o=Object.assign({slides:[],defaultIndex:0,height:'clamp(170px, 34cqi, 280px)',aspect:16/9,slatWidth:8,slatGap:8,gap:14,
    radius:6,duration:1000,hoverGrow:true,label:'Featured',onIndexChange:null},opts);
  const reduceMq=matchMedia('(prefers-reduced-motion: reduce)');
  const ms=()=>reduceMq.matches?0:o.duration;
  let slides=o.slides.slice();
  const count=()=>slides.length;
  const wrap=i=>((i%count())+count())%count();
  const slatsN=()=>clamp(count()-4,1,3);
  const visible=()=>4+slatsN();
  const slat=size(o.slatWidth);

  // ── DOM ──
  const root=document.createElement('div');root.className='sq';
  root.innerHTML=`
    <div class="sq-viewport"><div class="sq-strip" role="tablist" aria-label="${esc(o.label)}" aria-orientation="horizontal"></div></div>
    <div class="sq-panel" role="tabpanel" aria-live="polite"></div>`;
  host.appendChild(root);
  const strip=root.querySelector('.sq-strip'),panel=root.querySelector('.sq-panel');

  let seed=0,cards=[],column=0,slid=0,still=false,hover=-1,forward=true,timers=[],uid='sq'+Math.random().toString(36).slice(2,7);

  function setVars(){
    const n=slatsN();
    root.style.setProperty('--sq-h',size(o.height));
    root.style.setProperty('--sq-gap',size(o.gap));
    root.style.setProperty('--sq-slat-gap',size(o.slatGap));
    root.style.setProperty('--sq-radius',size(o.radius));
    root.style.setProperty('--sq-ms',ms()+'ms');
    root.style.setProperty('--sq-hero',`calc(var(--sq-h) * ${o.aspect})`);
    root.style.setProperty('--sq-room',`calc(100cqi - var(--sq-hero) - ${n} * var(--sq-slat-gap) - 3 * var(--sq-gap) - ${n} * ${slat})`);
  }
  const shareOf=col=>{
    if(!(o.hoverGrow&&hover>=0&&hover<=3&&!reduceMq.matches))return SHARES[col];
    return hover===col?STRETCH(col):SQUEEZE(col);
  };
  const widthOf=col=>{
    if(col<0||col>3)return slat;
    if(col===0)return `calc(var(--sq-hero) + var(--sq-room) * ${shareOf(0)})`;
    return `calc(var(--sq-room) * ${shareOf(col)})`;
  };

  function makeCard(slideIdx){
    const s=slides[slideIdx],b=document.createElement('button');
    b.type='button';b.className='sq-card';b.setAttribute('role','tab');
    b.id=`${uid}-tab-${seed}`;b.setAttribute('aria-controls',uid+'-panel');b.setAttribute('aria-label',s.title);
    b.innerHTML=(s.image?`<img class="sq-pic" src="${esc(s.image)}" alt="${esc(s.imageAlt||'')}" draggable="false" loading="lazy">`:`<span class="sq-pic" aria-hidden="true" style="background:${esc(s.background||'var(--bg-2)')}"></span>`)+
      (s.overlay?`<span class="sq-over" aria-hidden="true">${s.overlay}</span>`:'');
    const card={key:seed++,slide:slideIdx,el:b};
    b.addEventListener('mousemove',()=>{if(!o.hoverGrow)return;const c=cards.indexOf(card)+column;if(c!==hover){hover=c;render()}});
    b.addEventListener('click',()=>{const c=cards.indexOf(card)+column;if(c>0)step(c)});
    return card;
  }
  function freshWindow(start){
    strip.innerHTML='';
    cards=Array.from({length:visible()},(_,p)=>makeCard(wrap(start+p)));
    cards.forEach(c=>strip.appendChild(c.el));
  }
  const openSlide=()=>{const c=cards[-column];return c?c.slide:0};

  function renderPanel(){
    panel.id=uid+'-panel';
    if(panel.childElementCount!==count()){
      panel.innerHTML=slides.map((s,i)=>`
        <div class="sq-copy" data-i="${i}">
          <p class="sq-text"><span class="sq-t">${esc(s.title)}</span>${s.description?` <span class="sq-d">${esc(s.description)}</span>`:''}</p>
          ${s.action&&s.href?`<a class="sq-act" href="${esc(s.href)}" target="_blank" rel="noopener noreferrer">${esc(s.action)}<span aria-hidden="true">↗</span></a>`:''}
        </div>`).join('');
    }
    const open=openSlide();
    [...panel.children].forEach((d,i)=>{
      const on=i===open;d.classList.toggle('on',on);d.setAttribute('aria-hidden',String(!on));
      d.querySelectorAll('a').forEach(a=>a.tabIndex=on?0:-1);
    });
  }
  function render(){
    strip.style.transform=`translateX(calc(${slid} * (${slat} + var(--sq-gap))))`;
    strip.style.transition=still?'none':'transform var(--sq-ms) var(--sq-ease)';
    cards.forEach((c,place)=>{
      const col=place+column,front=col===0,w=widthOf(col),el=c.el;
      el.style.width=w;
      el.style.marginLeft=place===0?'0':col<4?'var(--sq-gap)':'var(--sq-slat-gap)';
      el.style.borderRadius=`min(var(--sq-radius), calc(${w} / 2))`;
      el.style.transitionDuration=still?'0s':'var(--sq-ms)';
      el.classList.toggle('front',front);
      el.setAttribute('aria-selected',String(front));el.tabIndex=front?0:-1;
    });
    renderPanel();
  }

  let lastOpen=-1;
  function notify(){const now=openSlide();if(now!==lastOpen){lastOpen=now;o.onIndexChange&&o.onIndexChange(now)}}
  function settle(){
    const n=visible();
    const keep=forward?cards.slice(-n):cards.slice(0,n);
    cards.forEach(c=>{if(!keep.includes(c))c.el.remove()});
    cards=keep;column=0;slid=0;still=true;render();
    requestAnimationFrame(()=>{still=false;render()});
  }
  function step(by){
    if(count()<2||!by)return;
    timers.forEach(clearTimeout);timers=[];
    forward=by>0;
    if(by>0){
      // the incoming slat joins the tail before anything moves, so the row is
      // never a slat short; the old front narrows to a slat and slides out left
      for(let k=0;k<by;k++){const c=makeCard(wrap(cards[cards.length-1].slide+1));cards.push(c);strip.appendChild(c.el)}
      column-=by;slid-=by;render();
    }else{
      // going back: grow the strip at the front as slats already off the left
      // edge, with no transition, so nothing appears to move; then let the
      // columns and the strip ease back one step
      const k=-by;
      for(let i=0;i<k;i++){const c=makeCard(wrap(cards[0].slide-1));cards.unshift(c);strip.insertBefore(c.el,strip.firstChild)}
      column-=k;slid-=k;still=true;render();
      void strip.offsetWidth;
      requestAnimationFrame(()=>{still=false;column+=k;slid+=k;render()});
    }
    notify();
    timers.push(setTimeout(()=>{settle();notify()},ms()+40));
  }
  function go(to){
    const here=openSlide();if(to===here)return;
    const f=wrap(to-here);step(f<=count()/2?f:f-count());
  }

  strip.addEventListener('keydown',e=>{
    const by={ArrowRight:1,ArrowLeft:-1}[e.key];if(by===undefined)return;
    e.preventDefault();e.stopPropagation();step(by);
    requestAnimationFrame(()=>{const f=strip.querySelector('.sq-card.front');f&&f.focus({preventScroll:true})});
  });
  root.addEventListener('mouseleave',()=>{if(hover!==-1){hover=-1;render()}});

  setVars();freshWindow(o.defaultIndex);render();notify();
  reduceMq.addEventListener('change',()=>{setVars();render()});

  return{
    root,step,go,
    get index(){return openSlide()},
    // someone is browsing: hovering, or parked on an older song
    get busy(){return hover!==-1||openSlide()!==0},
    setSlides(next){
      if(!next||!next.length)return;
      slides=next.slice();timers.forEach(clearTimeout);timers=[];
      column=0;slid=0;hover=-1;setVars();freshWindow(0);panel.innerHTML='';still=true;render();
      requestAnimationFrame(()=>{still=false;render()});lastOpen=-1;notify();
    }
  };
}

return{mount};
})();
