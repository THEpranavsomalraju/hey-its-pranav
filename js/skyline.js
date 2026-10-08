/*
 * Contribution Skyline — a year of activity as a GitHub-style heat map that
 * folds up into an isometric skyline, and back down again.
 *
 * A dependency-free port of the React component (contribution-skyline.tsx):
 * the pure maths is carried over line for line, the render loop is the same
 * engine, and the React shell is rebuilt as plain DOM so it drops into this
 * no-build site. Styling lives in style.css under .sk-*.
 *
 *   const sky = ContributionSkyline.mount(el, { data:[{date,count}], palette:'mono' })
 *   sky.setData(days)   // live refresh
 */
window.ContributionSkyline=(function(){
'use strict';

// ───────────── pure: dates, grid, stats, levels, camera, colour ─────────────
const DAY_MS=86400000;
const clamp01=v=>v>0?(v<1?v:1):0;
const lerp=(a,b,t)=>a+(b-a)*t;
const easeInOutCubic=x=>{const t=clamp01(x);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
const easeOutCubic=x=>1-Math.pow(1-clamp01(x),3);
const smoothstep=(a,b,x)=>{const t=clamp01((x-a)/(b-a));return t*t*(3-2*t)};
const toKey=ms=>new Date(ms).toISOString().slice(0,10);
const dayMs=v=>{
  if(typeof v==='number')return Math.floor(v/DAY_MS)*DAY_MS;
  if(typeof v==='string'){const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(v);if(m)return Date.UTC(+m[1],+m[2]-1,+m[3]);v=new Date(v)}
  return Date.UTC(v.getFullYear(),v.getMonth(),v.getDate());
};
const levelOf=(count,busy)=>count<=0?0:busy<=0?4:1+Math.min(3,Math.floor((count/busy)*4));
function buildGrid(data,endMs,weekStart=0){
  const counts=new Map();
  for(const d of data){
    if(!d||typeof d.date!=='string')continue;
    const ms=dayMs(d.date),c=Number(d.count);
    if(!Number.isFinite(ms)||!(c>0)||!Number.isFinite(c))continue;
    const k=toKey(ms);counts.set(k,(counts.get(k)||0)+c);
  }
  let start=endMs-364*DAY_MS;
  start-=((new Date(start).getUTCDay()-weekStart+7)%7)*DAY_MS;
  const cells=[];
  for(let ms=start,i=0;ms<=endMs;ms+=DAY_MS,i++){
    const date=toKey(ms);
    cells.push({date,count:counts.get(date)||0,level:0,week:Math.floor(i/7),day:i%7});
  }
  const nz=cells.map(c=>c.count).filter(c=>c>0).sort((a,b)=>a-b);
  const busy=nz.length?nz[Math.floor(.95*(nz.length-1))]:0;
  for(const c of cells)c.level=levelOf(c.count,busy);
  return{cells,weeks:cells.length?cells[cells.length-1].week+1:0,max:nz.length?nz[nz.length-1]:0};
}
function computeStats(cells){
  let total=0,best=0,bestDate=null,run=0,runStart=null,longest={days:0,start:null,end:null};
  for(const c of cells){
    total+=c.count;
    if(c.count>best){best=c.count;bestDate=c.date}
    if(c.count>0){if(run===0)runStart=c.date;run++;if(run>longest.days)longest={days:run,start:runStart,end:c.date}}
    else run=0;
  }
  let j=cells.length-1;
  if(j>=0&&cells[j].count===0)j--;
  const endAt=j;
  while(j>=0&&cells[j].count>0)j--;
  const days=endAt-j;
  const current=days>0?{days,start:cells[j+1].date,end:cells[endAt].date}:{days:0,start:null,end:null};
  return{total,first:cells.length?cells[0].date:null,last:cells.length?cells[cells.length-1].date:null,busiest:{count:best,date:bestDate},longest,current};
}
function monthLabels(cells,weeks,locale='en-US'){
  const fmt=new Intl.DateTimeFormat(locale,{month:'short',timeZone:'UTC'});
  const out=[];let prev=-1;
  for(let w=0;w<weeks;w++){
    const c=cells[w*7];if(!c)break;
    const m=+c.date.slice(5,7);
    if(m!==prev)out.push({week:w,label:fmt.format(dayMs(c.date))});
    prev=m;
  }
  if(out.length>1&&out[1].week-out[0].week<3)out.shift();
  return out;
}
const barHeight=(count,max,scale=1)=>count>0&&max>0?.4+Math.pow(count/max,.85)*7.2*scale:.2;
const WAVE=.42;
const riseAt=(t,week,weeks,day)=>{const d=(weeks>1?week/(weeks-1):0)*.36+(day/6)*.06;return easeOutCubic((t-d)/(1-WAVE))};
const YAW_3D=Math.PI/4,ELEV_3D=34*Math.PI/180;
const YAW_RANGE=[8*Math.PI/180,82*Math.PI/180],ELEV_RANGE=[18*Math.PI/180,62*Math.PI/180];
function camera(e,dYaw=0,dElev=0){
  const yaw=Math.min(YAW_RANGE[1],Math.max(0,lerp(0,YAW_3D+dYaw,e)));
  const elev=lerp(Math.PI/2,Math.min(ELEV_RANGE[1],Math.max(ELEV_RANGE[0],ELEV_3D+dElev)),e);
  return{cs:Math.cos(yaw),sn:Math.sin(yaw),se:Math.sin(elev),ce:Math.cos(elev)};
}
const project=(c,x,y,z)=>[x*c.cs-y*c.sn,(x*c.sn+y*c.cs)*c.se-z*c.ce];
const mixRGB=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const luminance=c=>(.2126*c[0]+.7152*c[1]+.0722*c[2])/255;
const PALETTES={
  github:{light:['#c6e48b','#7bc96f','#239a3b','#196127'],dark:['#0e4429','#006d32','#26a641','#39d353']},
  mono:{light:['#d4d4d4','#a3a3a3','#525252','#171717'],dark:['#333333','#5c5c5c','#a3a3a3','#fafafa']}
};
function resolvePalette(p,dark){
  const pick=Array.isArray(p)?p:typeof p==='object'&&p?(dark?p.dark:p.light):(PALETTES[p]||PALETTES.github)[dark?'dark':'light'];
  const base=PALETTES.github[dark?'dark':'light'];
  return[0,1,2,3].map(i=>pick[i]??pick[pick.length-1]??base[i]);
}

const FG_FALLBACK=[23,23,23],BG_FALLBACK=[255,255,255];
let probe=null;
function toRGB(color,fallback){
  if(!probe){const c=document.createElement('canvas');c.width=c.height=1;probe=c.getContext('2d',{willReadFrequently:true})}
  if(!probe)return fallback;
  probe.clearRect(0,0,1,1);probe.fillStyle='rgba(0,0,0,0)';probe.fillStyle=color;probe.fillRect(0,0,1,1);
  const d=probe.getImageData(0,0,1,1).data;
  if(d[3]<8)return fallback;
  return[d[0],d[1],d[2]];
}
const rgbString=(r,g,b)=>'rgb('+Math.round(r)+','+Math.round(g)+','+Math.round(b)+')';
function pointInQuad(p,o,x,y){
  let sign=0;
  for(let k=0;k<4;k++){
    const ax=p[o+k*2],ay=p[o+k*2+1],bx=p[o+((k+1)%4)*2],by=p[o+((k+1)%4)*2+1];
    const cross=(bx-ax)*(y-ay)-(by-ay)*(x-ax);
    if(Math.abs(cross)<1e-9)continue;
    const s=cross>0?1:-1;
    if(sign===0)sign=s;else if(s!==sign)return false;
  }
  return sign!==0;
}
function quadPath(ctx,p,o,r){
  if(r<.3){ctx.moveTo(p[o],p[o+1]);ctx.lineTo(p[o+2],p[o+3]);ctx.lineTo(p[o+4],p[o+5]);ctx.lineTo(p[o+6],p[o+7]);ctx.closePath();return}
  ctx.moveTo((p[o+6]+p[o])/2,(p[o+7]+p[o+1])/2);
  for(let k=0;k<4;k++){const b=(k+1)%4;ctx.arcTo(p[o+k*2],p[o+k*2+1],p[o+b*2],p[o+b*2+1],r)}
  ctx.closePath();
}
const el=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// ───────────── the component ─────────────
function mount(host,opts={}){
  const o=Object.assign({data:[],endDate:null,palette:'mono',unit:'contribution',unitPlural:null,heightScale:1,duration:1300,
    weekStart:0,orbit:true,defaultView:'3d',locale:'en-US',title:null},opts);
  const plural=o.unitPlural||o.unit+'s',locale=o.locale;
  const nf=new Intl.NumberFormat(locale);
  const df=new Intl.DateTimeFormat(locale,{month:'short',day:'numeric',timeZone:'UTC'});
  const dfy=new Intl.DateTimeFormat(locale,{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
  const dfl=new Intl.DateTimeFormat(locale,{weekday:'long',month:'long',day:'numeric',year:'numeric',timeZone:'UTC'});
  const noun=n=>n===1?o.unit:plural;
  const range=(a,b,withYear)=>!a||!b?'—':(withYear?dfy:df).format(dayMs(a))+' — '+(withYear?dfy:df).format(dayMs(b));
  const ease='cubic-bezier(0.65, 0, 0.35, 1)';

  let model,view=o.defaultView,legendLevel=-1,activeI=-1,width=0,accent='#000',swatches=[];
  function computeModel(days){
    const dates=days.map(d=>dayMs(d.date)).filter(Number.isFinite);
    const end=o.endDate!=null?dayMs(o.endDate):(dates.length?Math.max(...dates):dayMs(new Date()));
    const grid=buildGrid(days,end,o.weekStart);
    return Object.assign(grid,{stats:computeStats(grid.cells),months:monthLabels(grid.cells,grid.weeks,locale)});
  }
  model=computeModel(o.data);
  const describe=i=>{const c=model.cells[i];if(!c)return'';return(c.count?nf.format(c.count)+' '+noun(c.count):'No '+plural)+' on '+dfl.format(dayMs(c.date))};

  // ── DOM ──
  const root=el('section','sk');
  const head=el('header','sk-head');
  const title=el('h3','sk-title');
  const toggle=el('div','sk-toggle');toggle.setAttribute('role','group');toggle.setAttribute('aria-label','Chart view');
  const thumb=el('span','sk-thumb');thumb.setAttribute('aria-hidden','true');
  toggle.appendChild(thumb);
  const btns={};
  ['2d','3d'].forEach(v=>{
    const b=el('button','sk-tbtn',v);b.type='button';
    b.setAttribute('aria-label',v==='2d'?'Flat heat map':'3D skyline');b.title=v==='2d'?'Flat heat map':'3D skyline';
    b.addEventListener('click',()=>setView(v));btns[v]=b;toggle.appendChild(b);
  });
  head.append(title,toggle);
  const frame=el('div','sk-frame');
  const pad=el('div','sk-pad');
  const stage=el('div','sk-stage');
  const canvas=el('canvas','sk-canvas');canvas.tabIndex=0;canvas.setAttribute('role','img');
  const cornerTR=el('div','sk-corner sk-tr'),cornerBL=el('div','sk-corner sk-bl');
  [cornerTR,cornerBL].forEach(c=>c.setAttribute('aria-hidden','true'));
  stage.append(canvas,cornerTR,cornerBL);
  const tip=el('div','sk-tip');tip.setAttribute('role','tooltip');
  const tipText=el('span');const arrow=el('span','sk-arrow');arrow.setAttribute('aria-hidden','true');
  tip.append(tipText,arrow);
  pad.append(stage,tip);
  const rowWrap=el('div','sk-rowwrap'),rowIn=el('div','sk-rowin'),row=el('div','sk-stats');
  rowIn.appendChild(row);rowWrap.appendChild(rowIn);
  const foot=el('div','sk-foot');
  const hintsEl=el('span','sk-hints');
  const HINTS=['Hover a day for details · arrow keys to explore','Drag to orbit · double-click to reset'];
  const hintEls=HINTS.map(h=>{const s=el('span','',esc(h));hintsEl.appendChild(s);return s});
  const legend=el('div','sk-legend');
  legend.appendChild(el('span','sk-less','Less'));
  const levelNames=['No '+plural,'Light','Moderate','Heavy','Heaviest'];
  const swatchEls=levelNames.map((nm,i)=>{
    const b=el('button','sk-sw');b.type='button';b.title=nm;b.setAttribute('aria-label','Highlight '+nm.toLowerCase()+' days');
    b.addEventListener('mouseenter',()=>setLegend(i));b.addEventListener('focus',()=>setLegend(i));
    b.addEventListener('blur',()=>setLegend(-1));b.addEventListener('click',()=>setLegend(legendLevel===i?-1:i));
    legend.appendChild(b);return b;
  });
  legend.appendChild(el('span','sk-more','More'));
  legend.addEventListener('mouseleave',()=>setLegend(-1));
  foot.append(hintsEl,legend);
  frame.append(pad,rowWrap,foot);
  const live=el('p','sk-sr');live.setAttribute('aria-live','polite');
  root.append(head,frame,live);
  host.appendChild(root);

  function statHTML(b,cls){
    return `<div class="sk-stat ${cls}"><div class="sk-l">${esc(b.label)}</div><div class="sk-v"><span class="sk-n">${esc(b.value)}</span><span class="sk-u">${esc(b.unit)}</span></div><div class="sk-s">${esc(b.sub)}</div></div>`;
  }
  function renderText(){
    const s=model.stats;
    title.innerHTML=o.title||`<b>${nf.format(s.total)}</b> ${esc(noun(s.total))} in the last year`;
    const blocks=[
      {label:'1 year total',value:nf.format(s.total),unit:noun(s.total),sub:range(s.first,s.last,true)},
      {label:'Busiest day',value:nf.format(s.busiest.count),unit:noun(s.busiest.count),sub:s.busiest.date?df.format(dayMs(s.busiest.date)):'—'},
      {label:'Longest streak',value:nf.format(s.longest.days),unit:s.longest.days===1?'day':'days',sub:range(s.longest.start,s.longest.end)},
      {label:'Current streak',value:nf.format(s.current.days),unit:s.current.days===1?'day':'days',sub:range(s.current.start,s.current.end)}
    ];
    cornerTR.innerHTML=statHTML(blocks[0],'end')+statHTML(blocks[1],'end');
    cornerBL.innerHTML=statHTML(blocks[2],'start')+statHTML(blocks[3],'start');
    row.innerHTML=blocks.map(b=>statHTML(b,'stack')).join('');
    canvas.setAttribute('aria-label',nf.format(s.total)+' '+noun(s.total)+' between '+range(s.first,s.last,true)+
      ', shown as a '+(view==='3d'?'3D skyline':'heat map')+'. Use the arrow keys to read individual days.');
  }
  function renderChrome(){
    const is3d=view==='3d',corners=width>=560,showRow=!(is3d&&corners);
    root.classList.toggle('is3d',is3d);root.classList.toggle('corners',corners);
    thumb.style.transform=is3d?'translateX(100%)':'translateX(0)';
    for(const v in btns)btns[v].setAttribute('aria-pressed',String(view===v));
    const big=Math.round(Math.max(30,Math.min(56,width*.058)));
    root.style.setProperty('--sk-big',big+'px');
    [[cornerTR,.55,-10],[cornerBL,.65,10]].forEach(([c,f,dy])=>{
      c.style.opacity=is3d&&corners?1:0;c.style.transform=is3d&&corners?'translateY(0)':`translateY(${dy}px)`;
      c.style.transitionDuration=is3d?'600ms':'300ms';c.style.transitionDelay=is3d?Math.round(o.duration*f)+'ms':'0ms';
      c.hidden=!corners;
    });
    rowWrap.style.gridTemplateRows=showRow?'1fr':'0fr';rowWrap.style.opacity=showRow?1:0;
    rowWrap.style.transitionDuration=o.duration+'ms';rowWrap.setAttribute('aria-hidden',String(!showRow));
    const hint=HINTS[is3d&&o.orbit?1:0];
    hintEls.forEach((s,i)=>{s.style.opacity=HINTS[i]===hint?1:0;s.setAttribute('aria-hidden',String(HINTS[i]!==hint))});
    canvas.style.touchAction=is3d&&o.orbit?'pan-y':'auto';
    root.style.setProperty('--sk-accent',accent);
  }
  function renderSwatches(){
    swatchEls.forEach((b,i)=>{b.style.background=swatches[i]||'transparent';b.setAttribute('aria-pressed',String(legendLevel===i))});
    root.style.setProperty('--sk-accent',accent);
  }
  function renderTip(){
    tip.style.opacity=activeI>=0?1:0;tip.setAttribute('aria-hidden',String(activeI<0));
    const c=model.cells[activeI];
    tipText.innerHTML=c?`<strong>${c.count?nf.format(c.count)+' '+esc(noun(c.count)):'No '+esc(plural)}</strong><span class="sk-dim"> on ${esc(dfy.format(dayMs(c.date)))}</span>`:' ';
    if(activeI>=0)tipWidth(tip.offsetWidth);
  }
  function setView(v){if(v===view)return;view=v;renderText();renderChrome();setTarget();kick()}
  function setLegend(i){if(i===legendLevel)return;legendLevel=i;renderSwatches();kick()}

  // ── engine: the same render loop as the React version ──
  const ctx=canvas.getContext('2d');
  const reduceMq=matchMedia('(prefers-reduced-motion: reduce)'),darkMq=matchMedia('(prefers-color-scheme: dark)');
  let reduced=reduceMq.matches;
  let t=0,target=0,entered=false,yaw=0,elev=0,yawGoal=0,elevGoal=0;
  let W=0,H2=0,H3=0,Hmax=0,lastH=-1,dpr=1,gutter=30,labelW=30,font='10px sans-serif';
  const col=new Float32Array(15),colGoal=new Float32Array(15);let colReady=false;
  let fg=FG_FALLBACK,bg=BG_FALLBACK,isDark=false;
  let n=0,weeks=0,wk=new Float32Array(0),dy=new Float32Array(0),lv=new Uint8Array(0),hgt=new Float32Array(0),zs=new Float32Array(0),
    hover=new Float32Array(0),dim=new Float32Array(0),polys=new Float32Array(0),faces=new Uint8Array(0),order=[],months=[],weekdayRows=[];
  let hovered=-1,pinned=-1,activeIdx=-1,tipW=0,raf=0,last=0;

  function load(){
    n=model.cells.length;weeks=model.weeks;
    if(wk.length!==n){
      wk=new Float32Array(n);dy=new Float32Array(n);lv=new Uint8Array(n);hgt=new Float32Array(n);zs=new Float32Array(n);
      hover=new Float32Array(n);dim=new Float32Array(n);polys=new Float32Array(n*24);faces=new Uint8Array(n);
      order=Array.from({length:n},(_,i)=>i);
    }
    for(let i=0;i<n;i++){const c=model.cells[i];wk[i]=c.week;dy[i]=c.day;lv[i]=c.level;hgt[i]=barHeight(c.count,model.max,o.heightScale)}
    months=model.months;
    const wf=new Intl.DateTimeFormat(locale,{weekday:'short',timeZone:'UTC'});
    weekdayRows=[];
    for(let d=0;d<7&&d<n;d++){
      const dow=new Date(dayMs(model.cells[d].date)).getUTCDay();
      if(dow===1||dow===3||dow===5)weekdayRows.push({day:d,label:wf.format(dayMs(model.cells[d].date))});
    }
    if(hovered>=n)hovered=-1;if(pinned>=n)pinned=-1;
  }
  function retheme(){
    const cs=getComputedStyle(root);
    fg=toRGB(cs.color,FG_FALLBACK)||FG_FALLBACK;
    const b=toRGB(cs.backgroundColor,null);
    bg=b||(luminance(fg)>.5?[10,10,10]:BG_FALLBACK);
    isDark=luminance(bg)<.45;
    font='400 10px '+(getComputedStyle(canvas).fontFamily||'sans-serif');
    const pal=resolvePalette(o.palette,isDark);
    const empty=mixRGB(bg,fg,isDark?.11:.075);
    const all=[empty,...pal.map(c=>toRGB(c,FG_FALLBACK)||FG_FALLBACK)];
    for(let k=0;k<5;k++)for(let ch=0;ch<3;ch++)colGoal[k*3+ch]=all[k][ch];
    if(!colReady||reduced){col.set(colGoal);colReady=true}
    ctx.font=font;
    labelW=Math.ceil(Math.max(20,...weekdayRows.map(r=>ctx.measureText(r.label).width)))+8;
    swatches=all.map(c=>rgbString(c[0],c[1],c[2]));accent=swatches[4];
    renderSwatches();kick();
  }
  function extent(cam,e,full){
    const w=lerp(.78,.9,e),off=(1-w)/2;
    let minx=Infinity,maxx=-Infinity,miny=Infinity,maxy=-Infinity;
    const add=(x,y,z)=>{const p=project(cam,x,y,z);if(p[0]<minx)minx=p[0];if(p[0]>maxx)maxx=p[0];if(p[1]<miny)miny=p[1];if(p[1]>maxy)maxy=p[1]};
    for(let i=0;i<n;i++){
      const x0=wk[i]+off,y0=dy[i]+off,z=full?hgt[i]*e:zs[i];
      add(x0,y0,z);add(x0+w,y0,z);add(x0,y0+w,z);add(x0+w,y0+w,0);add(x0,y0+w,0);add(x0+w,y0,0);
    }
    add(0,7+1.5*e,0);add(weeks,7+1.5*e,0);
    return{minx,maxx,miny,maxy};
  }
  function relayout(){
    const w=Math.round(stage.clientWidth);
    if(!w||!n)return;
    W=w;gutter=W<520?0:labelW;dpr=Math.min(2,devicePixelRatio||1);
    const b2=extent(camera(0),0,true);
    H2=20+4+((b2.maxy-b2.miny)/(b2.maxx-b2.minx))*(W-gutter-4);
    const b3=extent(camera(1),1,true);
    const natural=((b3.maxy-b3.miny)/(b3.maxx-b3.minx))*(W-40)+40;
    H3=Math.max(Math.min(natural,W*.72,620),Math.min(natural,240));
    Hmax=Math.ceil(Math.max(H2,H3));
    canvas.width=Math.round(W*dpr);canvas.height=Math.round(Hmax*dpr);
    canvas.style.width=W+'px';canvas.style.height=Hmax+'px';
    lastH=-1;
    if(width!==W){width=W;renderChrome()}
    draw();
  }
  function draw(){
    if(!W||!n)return;
    const e=easeInOutCubic(t),cam=camera(e,yaw,elev),Hc=lerp(H2,H3,e);
    if(Math.abs(Hc-lastH)>.2){stage.style.height=Hc.toFixed(1)+'px';lastH=Hc}
    for(let i=0;i<n;i++)zs[i]=riseAt(t,wk[i],weeks,dy[i])*hgt[i];
    const b=extent(cam,e,false);
    const pad=lerp(2,20,e),left=pad+gutter*(1-e),top=pad+20*(1-e),aw=W-left-pad,ah=Hc-top-pad;
    const bw=Math.max(1e-6,b.maxx-b.minx),bh=Math.max(1e-6,b.maxy-b.miny);
    const s=Math.min(aw/bw,ah/bh);
    const ox=left+(aw-bw*s)/2-b.minx*s,oy=top+(ah-bh*s)/2-b.miny*s;
    const{cs,sn,se,ce}=cam;
    const px=(x,y)=>ox+(x*cs-y*sn)*s,py=(x,y,z)=>oy+((x*sn+y*cs)*se-z*ce)*s;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,Hmax);
    order.sort((a,c)=>(wk[a]+.5)*sn+(dy[a]+.5)*cs-((wk[c]+.5)*sn+(dy[c]+.5)*cs));
    const w=lerp(.78,.9,e),off=(1-w)/2,radius=lerp(.17,.03,e)*s,outline=(1-e)*.07,lift=.7*e;
    const ex=col[0],ey=col[1],ez=col[2];
    for(let k=0;k<n;k++){
      const i=order[k],x0=wk[i]+off,y0=dy[i]+off,x1=x0+w,y1=y0+w,z=zs[i]+hover[i]*lift,q=i*24;
      polys[q]=px(x0,y0);polys[q+1]=py(x0,y0,z);
      polys[q+2]=px(x1,y0);polys[q+3]=py(x1,y0,z);
      polys[q+4]=px(x1,y1);polys[q+5]=py(x1,y1,z);
      polys[q+6]=px(x0,y1);polys[q+7]=py(x0,y1,z);
      polys[q+8]=px(x0,y1);polys[q+9]=py(x0,y1,0);
      polys[q+10]=px(x1,y1);polys[q+11]=py(x1,y1,0);
      polys[q+12]=polys[q+4];polys[q+13]=polys[q+5];
      polys[q+14]=polys[q+6];polys[q+15]=polys[q+7];
      polys[q+16]=px(x1,y0);polys[q+17]=py(x1,y0,0);
      polys[q+18]=polys[q+10];polys[q+19]=polys[q+11];
      polys[q+20]=polys[q+4];polys[q+21]=polys[q+5];
      polys[q+22]=polys[q+2];polys[q+23]=polys[q+3];
      const tall=z*ce*s;let f=0;
      if(tall>.35&&w*cs*s>.35)f|=1;
      if(tall>.35&&w*sn*s>.35)f|=2;
      faces[i]=f;
      const L=lv[i]*3;let r=col[L],g=col[L+1],bl=col[L+2];
      const d=dim[i];
      if(d>.002){r+=(ex-r)*.72*d;g+=(ey-g)*.72*d;bl+=(ez-bl)*.72*d}
      const hv=hover[i];
      if(hv>.002){const m=.16*hv;r+=(fg[0]-r)*m;g+=(fg[1]-g)*m;bl+=(fg[2]-bl)*m}
      if(f&1){ctx.beginPath();quadPath(ctx,polys,q+8,0);ctx.fillStyle=rgbString(r*.84,g*.84,bl*.84);ctx.fill()}
      if(f&2){ctx.beginPath();quadPath(ctx,polys,q+16,0);ctx.fillStyle=rgbString(r*.68,g*.68,bl*.68);ctx.fill()}
      ctx.beginPath();quadPath(ctx,polys,q,radius);ctx.fillStyle=rgbString(r,g,bl);ctx.fill();
      if(outline>.004){ctx.strokeStyle='rgba('+fg[0]+','+fg[1]+','+fg[2]+','+outline.toFixed(3)+')';ctx.lineWidth=1;ctx.stroke()}
      if(hv>.02){ctx.strokeStyle='rgba('+fg[0]+','+fg[1]+','+fg[2]+','+(.85*hv).toFixed(3)+')';ctx.lineWidth=1.5;ctx.stroke()}
    }
    const muted=mixRGB(bg,fg,.55);
    ctx.font=font;
    const a2=1-smoothstep(0,.4,e),a3=smoothstep(.62,1,e);
    const mc=a=>'rgba('+Math.round(muted[0])+','+Math.round(muted[1])+','+Math.round(muted[2])+','+a.toFixed(3)+')';
    if(a2>.004){
      ctx.fillStyle=mc(a2);ctx.textAlign='left';ctx.textBaseline='bottom';
      let edge=-Infinity;
      for(const m of months){
        const x=px(m.week+off,-.3),tw=ctx.measureText(m.label).width;
        if(x<edge||x+tw>W)continue;
        ctx.fillText(m.label,x,py(m.week+off,-.3,0)-3);edge=x+tw+6;
      }
      ctx.textAlign='right';ctx.textBaseline='middle';
      if(gutter>0)for(const r of weekdayRows)ctx.fillText(r.label,px(0,r.day+.5)-6,py(0,r.day+.5,0));
    }
    if(a3>.004){
      ctx.fillStyle=mc(a3);ctx.textAlign='left';ctx.textBaseline='top';
      let edge=-Infinity;
      for(const m of months){
        const x=px(m.week+.5,7.3);
        if(x<edge||x+ctx.measureText(m.label).width>W)continue;
        ctx.fillText(m.label,x,py(m.week+.5,7.3,0)+2);edge=x+ctx.measureText(m.label).width+10;
      }
    }
    if(activeIdx>=0&&activeIdx<n){
      const i=activeIdx,z=zs[i]+hover[i]*lift,tx=px(wk[i]+.5,dy[i]+.5);
      const ty=Math.min(py(wk[i]+off,dy[i]+off,z),py(wk[i]+off+w,dy[i]+off,z),py(wk[i]+off,dy[i]+off+w,z));
      const half=tipW/2,cx=Math.min(W-half-2,Math.max(half+2,tx));
      tip.style.transform='translate('+(cx-half).toFixed(1)+'px,'+(ty-8).toFixed(1)+'px) translateY(-100%)';
      tip.style.setProperty('--arrow',(tx-cx+half).toFixed(1)+'px');
    }
  }
  function tick(now){
    raf=0;
    const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
    let moving=false;
    if(t!==target){const step=reduced?1:(dt*1000)/Math.max(1,o.duration);t=target>t?Math.min(target,t+step):Math.max(target,t-step);moving=true}
    const ko=reduced?1:1-Math.exp(-dt*12);
    yaw+=(yawGoal-yaw)*ko;elev+=(elevGoal-elev)*ko;
    if(Math.abs(yawGoal-yaw)>1e-4||Math.abs(elevGoal-elev)>1e-4)moving=true;else{yaw=yawGoal;elev=elevGoal}
    const kc=reduced?1:1-Math.exp(-dt*7);
    for(let k=0;k<15;k++){const d=colGoal[k]-col[k];if(Math.abs(d)>.4){col[k]+=d*kc;moving=true}else col[k]=colGoal[k]}
    const kh=reduced?1:1-Math.exp(-dt*16),kd=reduced?1:1-Math.exp(-dt*10);
    for(let i=0;i<n;i++){
      const hg=i===activeIdx?1:0,dg=legendLevel>=0&&lv[i]!==legendLevel?1:0,h=hover[i],d=dim[i];
      if(h!==hg){hover[i]=Math.abs(hg-h)<.003?hg:h+(hg-h)*kh;moving=true}
      if(d!==dg){dim[i]=Math.abs(dg-d)<.003?dg:d+(dg-d)*kd;moving=true}
    }
    draw();
    if(moving)raf=requestAnimationFrame(tick);
  }
  function kick(){if(raf)return;last=performance.now();raf=requestAnimationFrame(tick)}
  function tipWidth(w){tipW=w;draw()}
  function refreshActive(){
    const next=hovered>=0?hovered:pinned;
    if(next===activeIdx)return;
    activeIdx=next;activeI=next;renderTip();kick();
  }
  function hit(x,y){
    for(let k=n-1;k>=0;k--){
      const i=order[k],q=i*24;
      if(pointInQuad(polys,q,x,y))return i;
      if(faces[i]&1&&pointInQuad(polys,q+8,x,y))return i;
      if(faces[i]&2&&pointInQuad(polys,q+16,x,y))return i;
    }
    return -1;
  }
  const local=ev=>{const r=canvas.getBoundingClientRect();return[ev.clientX-r.left,ev.clientY-r.top]};
  let drag=null;
  function onDown(ev){
    if(ev.button!==0)return;
    const can=o.orbit&&target===1;
    drag={id:ev.pointerId,x:ev.clientX,y:ev.clientY,yaw:yawGoal,elev:elevGoal,moved:false,orbit:can,mouse:ev.pointerType==='mouse'};
    if(can){try{canvas.setPointerCapture(ev.pointerId)}catch(e){}}
  }
  function onMove(ev){
    if(drag&&drag.orbit&&ev.pointerId===drag.id){
      const dx=ev.clientX-drag.x,dyy=ev.clientY-drag.y;
      if(drag.moved||Math.hypot(dx,dyy)>4){
        drag.moved=true;
        yawGoal=Math.min(YAW_RANGE[1]-YAW_3D,Math.max(YAW_RANGE[0]-YAW_3D,drag.yaw+dx*.006));
        if(drag.mouse)elevGoal=Math.min(ELEV_RANGE[1]-ELEV_3D,Math.max(ELEV_RANGE[0]-ELEV_3D,drag.elev+dyy*.004));
        canvas.style.cursor='grabbing';hovered=-1;refreshActive();kick();return;
      }
    }
    if(ev.pointerType!=='mouse')return;
    const[x,y]=local(ev),i=hit(x,y);
    if(i!==hovered){hovered=i;refreshActive()}
    canvas.style.cursor=o.orbit&&target===1?'grab':i>=0?'pointer':'default';
  }
  function onUp(ev){
    if(!drag||ev.pointerId!==drag.id)return;
    const wasMoved=drag.moved;drag=null;
    if(canvas.hasPointerCapture(ev.pointerId))canvas.releasePointerCapture(ev.pointerId);
    canvas.style.cursor=o.orbit&&target===1?'grab':'default';
    if(wasMoved)return;
    const[x,y]=local(ev),i=hit(x,y);
    pinned=i===pinned?-1:i;
    if(ev.pointerType!=='mouse')hovered=-1;
    refreshActive();
  }
  function onKey(ev){
    const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','Escape'];
    if(!keys.includes(ev.key)||!n)return;
    ev.preventDefault();ev.stopPropagation();
    if(ev.key==='Escape'){pinned=-1;hovered=-1;refreshActive();return}
    let i=pinned>=0?pinned:activeIdx>=0?activeIdx:n-1;
    if(pinned>=0||activeIdx>=0){
      if(ev.key==='ArrowLeft')i-=7;if(ev.key==='ArrowRight')i+=7;
      if(ev.key==='ArrowUp')i-=1;if(ev.key==='ArrowDown')i+=1;
      if(ev.key==='Home')i=0;if(ev.key==='End')i=n-1;
    }
    i=Math.max(0,Math.min(n-1,i));pinned=i;hovered=-1;refreshActive();
    live.textContent=describe(i);
  }
  function setTarget(){
    const goal=view==='3d'?1:0;
    if(!entered)return;
    if(goal!==target){
      target=goal;
      if(goal===0){yawGoal=0;elevGoal=0}
      canvas.style.cursor=o.orbit&&target===1?'grab':'default';
      kick();
    }
  }

  load();renderText();retheme();renderChrome();relayout();
  // the 3D view rises out of the flat one the first time it is seen
  const enter=()=>{if(entered)return;entered=true;if(reduced)t=view==='3d'?1:0;setTarget()};
  const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){enter();io.disconnect()}},{threshold:.35});
  io.observe(stage);
  const ro=new ResizeObserver(()=>{if(Math.round(stage.clientWidth)!==W)relayout()});ro.observe(stage);
  const mo=new MutationObserver(retheme);mo.observe(document.documentElement,{attributes:true,attributeFilter:['class','style','data-theme']});
  reduceMq.addEventListener('change',()=>{reduced=reduceMq.matches;kick()});
  darkMq.addEventListener('change',retheme);
  canvas.addEventListener('pointerdown',onDown);
  canvas.addEventListener('pointermove',onMove);
  canvas.addEventListener('pointerup',onUp);
  canvas.addEventListener('pointercancel',()=>{drag=null});
  canvas.addEventListener('pointerleave',()=>{if(drag)return;hovered=-1;refreshActive()});
  canvas.addEventListener('dblclick',()=>{yawGoal=0;elevGoal=0;kick()});
  canvas.addEventListener('keydown',onKey);
  canvas.addEventListener('blur',()=>{pinned=-1;refreshActive()});

  return{
    root,
    setData(days){
      model=computeModel(days);
      if(activeI>=model.cells.length)activeI=-1;
      load();renderText();retheme();relayout();renderTip();
    }
  };
}

return{mount,buildGrid,computeStats,levelOf};
})();
