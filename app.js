const gallery = [
 {src:'suitcase',caption:'Ryan performing with a suitcase under magenta lighting in Everybody.'},
 {src:'movement',caption:'Experimental ensemble movement under blue lighting. Ryan is the performer in the center.'},
 {src:'reach',caption:'Ryan, arm extended, in an ensemble moment from Everybody.'},
 {src:'running',caption:'Ryan running at the side of the stage during Everybody.'},
 {src:'ensemble',caption:'The Somebodies onstage. Ryan is second from the left. An onstage lottery assigned their roles each night.'},
 {src:'backstage',caption:'Ryan in an orange costume during Everybody.'},
 {src:'cast',caption:'The Everybody ensemble. Ryan wears pink fluffy sunglasses near the center.'}
];
const dialog = document.querySelector('#image-dialog');
const dialogImage = document.querySelector('#dialog-image');
const dialogCaption = document.querySelector('#dialog-caption');
const controls = document.querySelector('.gallery-controls');
let activeIndex=0, galleryMode=true, opener=null;
function renderPhoto(){const p=gallery[activeIndex];dialogImage.src=`assets/${p.src}.webp`;dialogImage.alt=p.caption;dialogCaption.textContent=p.caption;document.querySelector('#gallery-count').textContent=`${activeIndex+1} / ${gallery.length}`;}
function showDialog(button){opener=button;dialog.showModal();document.body.classList.add('modal-open');}
document.querySelectorAll('[data-gallery]').forEach(button=>button.addEventListener('click',()=>{activeIndex=Number(button.dataset.gallery);galleryMode=true;controls.hidden=false;document.querySelector('#dialog-title').textContent='Everybody · Selected moments';renderPhoto();showDialog(button);}));
document.querySelectorAll('[data-figure]').forEach(button=>button.addEventListener('click',()=>{galleryMode=false;controls.hidden=true;document.querySelector('#dialog-title').textContent=button.dataset.figureTitle||'Research · PolyGR & AT8';dialogImage.src=button.dataset.figure;dialogImage.alt=button.dataset.caption;dialogCaption.textContent=button.dataset.caption;showDialog(button);}));
function movePhoto(direction){activeIndex=(activeIndex+direction+gallery.length)%gallery.length;renderPhoto();}
document.querySelector('#previous-image').addEventListener('click',()=>movePhoto(-1));
document.querySelector('#next-image').addEventListener('click',()=>movePhoto(1));
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');opener?.focus();});
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('keydown',event=>{if(galleryMode && ['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();movePhoto(event.key==='ArrowLeft'?-1:1);}});
const navLinks=[...document.querySelectorAll('.site-header nav a')];
const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){navLinks.forEach(link=>{if(link.hash===`#${entry.target.id}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}});},{rootMargin:'-15% 0px -60% 0px',threshold:0});
document.querySelectorAll('main section[id]').forEach(section=>observer.observe(section));

// Jump links expose the selected collection before navigating to it.
document.querySelectorAll('[data-expand]').forEach(link => {
 link.addEventListener('click', () => {
  const collection = document.getElementById(link.dataset.expand);
  if (collection) collection.open = true;
 });
});

// A delayed scroll signal travels through the panes at different speeds.
// Native scrolling remains untouched; only decorative transforms are animated.
(() => {
 const section = document.querySelector('#research');
 const panes = [...document.querySelectorAll('.research-glass-pane')].map((element, index) => ({
  element, depth: Number(element.dataset.depth), delay: Number(element.dataset.delay),
  angle: Number(element.dataset.angle), phase: index * 1.3, position: 0, tilt: 0
 }));
 if (!section || !panes.length) return;
 const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
 let samples = [{time: performance.now(), y: window.scrollY}];
 let sectionTop = 0, viewportHeight = window.innerHeight;
 let visible = false, frame = null, previousTime = 0;
 const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
 function measure() {
  sectionTop = section.getBoundingClientRect().top + window.scrollY;
  viewportHeight = window.innerHeight;
 }
 function delayedScroll(time) {
  if (time <= samples[0].time) return samples[0].y;
  for (let i = 1; i < samples.length; i++) {
   if (samples[i].time >= time) {
    const left = samples[i - 1], right = samples[i];
    const fraction = (time - left.time) / Math.max(1, right.time - left.time);
    return left.y + (right.y - left.y) * fraction;
   }
  }
  return samples[samples.length - 1].y;
 }
 function animate(time) {
  frame = null;
  if (!visible || reducedMotion.matches || document.hidden) return;
  const dt = previousTime ? Math.min(time - previousTime, 50) : 16;
  previousTime = time;
  panes.forEach(pane => {
   const delayedY = delayedScroll(time - pane.delay);
   const target = clamp((delayedY + viewportHeight * .35 - sectionTop) * pane.depth, -90, 240);
   const ease = 1 - Math.exp(-dt / (180 + pane.delay * .35));
   pane.position += (target - pane.position) * ease;
   const tiltTarget = clamp((window.scrollY - delayedY) * .014, -4, 4);
   pane.tilt += (tiltTarget - pane.tilt) * ease;
   const drift = Math.sin(time / 4200 + pane.phase) * 5;
   const sway = Math.sin(time / 5400 + pane.phase) * 3;
   pane.element.style.transform = `translate3d(${sway.toFixed(2)}px, ${(pane.position + drift).toFixed(2)}px, 0) rotate(${(pane.angle + pane.tilt).toFixed(2)}deg)`;
  });
  frame = requestAnimationFrame(animate);
 }
 function start() {
  if (visible && !reducedMotion.matches && !document.hidden && frame === null) {
   previousTime = 0;
   frame = requestAnimationFrame(animate);
  }
 }
 function stop() {
  if (frame !== null) cancelAnimationFrame(frame);
  frame = null;
  previousTime = 0;
 }
 window.addEventListener('scroll', () => {
  const now = performance.now();
  samples.push({time: now, y: window.scrollY});
  while (samples.length > 2 && samples[1].time < now - 900) samples.shift();
  if (samples.length > 120) samples = samples.slice(-120);
  start();
 }, {passive: true});
 window.addEventListener('resize', measure, {passive: true});
 new ResizeObserver(measure).observe(document.querySelector('main'));
 new IntersectionObserver(entries => {
  visible = entries[0].isIntersecting;
  if (visible) {measure(); start();} else stop();
 }, {rootMargin: '160px 0px'}).observe(section);
 reducedMotion.addEventListener('change', () => {
  stop();
  if (reducedMotion.matches) panes.forEach(pane => pane.element.style.removeProperty('transform'));
  else start();
 });
 document.addEventListener('visibilitychange', () => {
  if (document.hidden) stop();
  else {samples = [{time: performance.now(), y: window.scrollY}]; start();}
 });
 measure();
})();

// Reflections respond to the viewing angle implied by scrolling, then settle.
(() => {
 const section = document.querySelector('#theater');
 const glitter = section?.querySelector('.theater-glitter');
 if (!glitter) return;
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 let visible = false, frame = null, top = 0, position = 0, previousTime = 0;
 function measure() {top = section.getBoundingClientRect().top + scrollY;}
 function stop() {if (frame !== null) cancelAnimationFrame(frame); frame = null; previousTime = 0;}
 function animate(time) {
  frame = null;
  if (!visible || document.hidden || reduced.matches) return;
  const target = scrollY + innerHeight * .5 - top;
  const dt = previousTime ? Math.min(50, time - previousTime) : 16;
  previousTime = time;
  const gap = target - position;
  position += gap * (1 - Math.exp(-dt / 190));
  // Opacity composites cached textures without repainting moving masks/filters.
  const reflection = glitter.querySelector('.glitter-silver');
  reflection.style.opacity = String(.18 + (Math.sin(position / 210) + 1) * .13);
  if (Math.abs(gap) > .1) frame = requestAnimationFrame(animate);
 }
 function start() {if (visible && !document.hidden && !reduced.matches && frame === null) {previousTime = 0; frame = requestAnimationFrame(animate);}}
 addEventListener('scroll', start, {passive:true});
 addEventListener('resize', () => {measure(); start();}, {passive:true});
 new ResizeObserver(() => {measure(); start();}).observe(document.querySelector('main'));
 new IntersectionObserver(([entry]) => {visible = entry.isIntersecting; if (visible) {measure(); start();} else stop();}, {rootMargin:'120px 0px'}).observe(section);
 reduced.addEventListener('change', () => {stop(); if (reduced.matches) glitter.querySelector('.glitter-silver').style.removeProperty('opacity'); else start();});
 document.addEventListener('visibilitychange', () => {if (document.hidden) stop(); else start();});
 measure();
})();

// A visible photo deck turns its top card to the back every three seconds.
(() => {
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 document.querySelectorAll('.show-photo-group,.research-figure-deck').forEach(deck => {
  const research=deck.classList.contains('research-figure-deck');
  const cards = [...deck.children];
  deck.classList.add('photo-deck');
  const angles = new Map(cards.map((card, i) => [card, i % 2 ? 5 : -5]));
  const resting = card => `translate3d(0,0,0) rotate(${angles.get(card)}deg)`;
  let timer, visible = false, paused = false, busy = false;
  const controls = document.createElement('div');
  controls.className = 'deck-controls';
  controls.innerHTML = research?'<button type="button">Pause figures</button><button type="button">Next figure →</button>':'<button type="button">Pause photos</button><button type="button">Next photo →</button>';
  deck.after(controls);
  const [pause, next] = controls.children;
  function layout() {
   cards.forEach((card, i) => {
    card.style.zIndex = String(cards.length-i);
    card.style.transform = resting(card);
    card.inert = i !== 0;
   });
  }
  async function turn() {
   if (busy) return;
   busy = true;
   const top = cards[0];
   const fromAngle = angles.get(top);
   const toAngle = -angles.get(cards[cards.length-1]);
   // Always travel away from the text, regardless of the card's tilt.
   const direction = research || (deck.closest('.show-row-reverse') && innerWidth > 700) ? 1 : -1;
   const distance = deck.clientWidth * 1.55;
   const dip = deck.clientHeight * .035;
   if (!reduced.matches) {
    top.style.willChange = 'transform';
    await new Promise(resolve => {
     let began;
     function sweep(now) {
      if (began === undefined) began = now;
      const t = Math.min(1, (now-began)/1400);
      const progress = t*t*(3-2*t);
      // One continuous path and transform: never reset perspective or position.
      const arc = Math.sin(Math.PI*progress);
      const angle = fromAngle+(toAngle-fromAngle)*progress+direction*7*arc;
      top.style.transform = `translate3d(${direction*distance*arc}px,${dip*arc}px,0) rotate(${angle}deg)`;
      // At the widest point the card is fully clear of the bundle.
      if (progress >= .5) top.style.zIndex = '0';
      if (t < 1) requestAnimationFrame(sweep); else resolve();
     }
     requestAnimationFrame(sweep);
    });
    top.style.removeProperty('will-change');
   }
   angles.set(top, toAngle);
   cards.push(cards.shift());
   layout();
   busy = false;
  }
  function sync() {
   clearInterval(timer);
   pause.textContent = paused ? (research?'Play figures':'Play photos') : (research?'Pause figures':'Pause photos');
   pause.hidden = reduced.matches;
   if (visible && !paused && !reduced.matches && !document.hidden) timer=setInterval(turn,3000);
  }
  pause.addEventListener('click',()=>{paused=!paused;sync();});
  next.addEventListener('click',()=>{turn();sync();});
  deck.addEventListener('focusin',()=>{paused=true;sync();});
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.25}).observe(deck);
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',sync);
  layout();sync();
 });
})();

// A scroll-drawn thread links the signature to each area of the portfolio.
(() => {
 const svg = document.querySelector('.story-line');
 if (!svg) return;
 const group = svg.querySelector('.story-paths'), arrow = svg.querySelector('.story-arrow');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const ns = 'http://www.w3.org/2000/svg';
 // A single centerline, written in cursive pen order (not a font outline).
 const signature = 'M 12 112 C 34 108 46 68 58 36 C 68 9 46 16 42 41 C 38 69 37 106 30 130 C 42 96 50 40 72 28 C 95 15 124 25 117 49 C 111 70 82 81 54 76 C 75 72 84 95 95 115 C 109 143 127 131 140 91 C 133 110 131 131 143 132 C 157 133 166 104 176 89 C 166 119 159 172 143 179 C 123 188 122 169 139 154 C 156 139 185 127 195 109 C 207 83 231 82 228 102 C 226 119 214 137 201 132 C 183 125 201 90 219 91 C 239 92 217 129 232 132 C 246 135 258 103 264 90 C 258 111 254 122 251 132 C 264 107 281 87 290 95 C 300 105 279 129 295 132 C 306 134 320 121 329 111 C 345 93 359 66 369 42 C 380 14 410 14 416 28 C 422 43 399 58 384 49 C 373 42 366 26 355 27 C 342 29 352 53 365 72 C 381 98 391 138 415 130 C 433 126 452 110 461 90 C 454 109 449 126 458 131 C 469 137 483 116 491 100 C 504 78 526 89 519 110 C 514 125 502 137 491 131 C 476 122 494 89 510 92 C 529 96 509 129 524 132 C 537 134 549 111 558 99 C 570 82 591 89 586 108 C 581 130 558 142 551 125 C 543 108 560 91 575 93 C 591 95 581 114 596 116 C 607 118 619 108 630 100';
 let signatureTravel=0, signaturePath=null, gradientStops=[];
 const cutouts=document.querySelector('.signature-cutouts');
 const cutoutFigures=Array.from(cutouts.querySelectorAll('.signature-cutout'));
 const cutoutBeats=[.16,.40,.65,.87];
 let cutoutAnchors=[];
 const defs=document.createElementNS(ns,'defs'), gradient=document.createElementNS(ns,'linearGradient');
 gradient.id='story-ink';gradient.setAttribute('gradientUnits','userSpaceOnUse');
 gradient.setAttribute('x1','0');gradient.setAttribute('x2','0');gradient.setAttribute('y1','0');
 defs.append(gradient);svg.prepend(defs);
 function inkAt(y) {
  let a=gradientStops[0],b=gradientStops[gradientStops.length-1];
  for(let i=1;i<gradientStops.length;i++){if(y<=gradientStops[i].y){a=gradientStops[i-1];b=gradientStops[i];break;}}
  const t=Math.max(0,Math.min(1,(y-a.y)/(b.y-a.y||1)));
  return `rgb(${a.rgb.map((v,i)=>Math.round(v+(b.rgb[i]-v)*t)).join(',')})`;
 }
 const icons = {
 research:'M 100 0 C 100 20 80 17 72 32 C 47 21 25 37 28 56 C 6 66 10 94 28 104 C 19 129 40 145 60 138 C 72 160 97 144 100 126 C 103 145 132 154 143 137 C 167 146 187 124 177 106 C 198 90 189 66 171 59 C 175 37 151 22 133 32 C 120 15 99 21 100 43 L 100 126 C 83 122 78 111 84 98 C 63 110 47 98 53 82 C 32 79 38 57 54 58 C 55 41 79 42 81 60 C 68 68 67 81 84 84 C 93 70 101 60 100 43 C 112 43 129 45 130 61 C 151 48 164 67 151 80 C 173 85 167 109 148 106 C 143 124 119 124 117 107 C 131 100 135 89 123 81 C 111 82 104 98 100 126 L 100 170',
 theater:'M 100 0 C 100 12 81 20 65 20 C 49 20 31 12 23 18 C 15 24 20 52 25 70 C 30 91 42 109 60 109 C 78 109 92 89 97 67 C 101 48 101 27 94 23 C 87 19 76 20 65 20 C 43 20 29 32 34 49 C 38 38 47 38 51 49 C 47 55 38 55 34 49 C 43 61 56 62 66 49 C 70 38 79 38 83 49 C 79 55 70 55 66 49 C 59 44 59 62 62 67 C 65 73 74 72 81 69 C 76 92 43 97 36 69 C 49 75 68 75 81 69 C 99 58 96 34 107 46 C 116 40 131 48 147 48 C 163 48 177 40 184 46 C 191 53 185 80 180 99 C 175 122 163 140 146 140 C 129 140 114 121 109 101 C 104 81 100 52 107 46 C 112 43 119 57 119 77 C 123 83 131 83 135 77 C 131 67 123 67 119 77 C 129 91 142 91 153 77 C 157 83 165 83 169 77 C 165 67 157 67 153 77 C 143 82 147 93 156 99 C 163 103 166 110 166 113 C 154 99 134 99 125 113 C 137 108 154 108 166 113 C 177 128 163 140 146 140 C 126 140 100 150 100 170',
 mentorship:'M 100 0 C 54 0 32 36 43 70 C 50 91 73 102 75 127 L 125 127 C 127 101 150 91 157 70 C 168 36 146 0 100 0 C 73 14 74 47 100 67 C 126 47 127 14 100 0 M 100 0 C 73 14 74 47 100 67 L 100 127 L 75 127 L 75 141 L 125 141 L 125 153 L 78 153 Q 100 182 123 153 L 100 170',
 speech:'M 100 0 C 76 0 67 17 67 37 L 67 83 C 67 126 133 126 133 83 L 133 37 C 133 17 124 0 100 0 L 100 22 L 77 22 L 123 22 L 123 40 L 77 40 L 77 58 L 123 58 L 123 76 L 77 76 C 77 109 123 109 123 76 L 133 83 C 139 112 120 132 100 132 C 68 132 51 111 51 83 C 51 144 149 144 149 83 C 149 117 130 140 100 140 L 100 161 L 71 170 L 129 170 L 100 170'
 };
 // Transform absolute SVG coordinates without altering their smooth curves.
 function mapped(d,x,y,scale) {return d.replace(/([MCQL])([^MCQL]*)/g,(_,cmd,values)=>{
  const n=values.trim().split(/[ ,]+/).map(Number);
  return cmd+' '+n.map((v,i)=>(v*scale+(i%2?y:x)).toFixed(2)).join(' ');
 });}
 let paths=[],frame=0;
 function add(d,start,end,color) {
  const path=document.createElementNS(ns,'path');path.setAttribute('d',d);path.style.stroke="url(#story-ink)";
  group.append(path);const length=path.getTotalLength();path.style.strokeDasharray=String(length);
  paths.push({path,length,start,end});
 }
 function measure() {
  group.replaceChildren();paths=[];
  const w=document.documentElement.clientWidth, h=Math.ceil(document.querySelector('footer').getBoundingClientRect().bottom+scrollY); // Content endpoint excludes this decorative SVG’s own overflow.
  svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.style.height=h+'px';
  gradient.setAttribute('y2',String(h));gradient.replaceChildren();
  gradientStops=[{y:0,rgb:[36,52,69]},...Array.from(document.querySelectorAll('.story-symbol'),slot=>({y:slot.getBoundingClientRect().top+scrollY+140,rgb:slot.dataset.symbol==='theater'?[221,163,206]:slot.dataset.symbol==='mentorship'?[146,112,79]:slot.dataset.symbol==='speech'?[255,255,255]:[104,140,150]}))];
  gradientStops.push({y:document.querySelector('#speech').getBoundingClientRect().bottom+scrollY,rgb:[255,255,255]},{y:h,rgb:[104,140,150]});
  for(const point of gradientStops){const stop=document.createElementNS(ns,'stop');stop.setAttribute('offset',String(point.y/h));stop.setAttribute('stop-color',`rgb(${point.rgb.join(',')})`);gradient.append(stop);}
  const scale=Math.min(w*.74/640,1.35), x=(w-640*scale)/2;
  const y=innerHeight*.29-90*scale+80;
  signatureTravel=innerHeight*.40;
  add(mapped(signature,x,y,scale),innerHeight*.72,innerHeight*.72+signatureTravel,'#243445');
  signaturePath=paths[0].path;
  // Two avatars above and two below the signature, with clear breathing room.
  const signatureBounds=signaturePath.getBBox();
  cutoutAnchors=cutoutBeats.map((beat,i)=>{
   const size={width:cutoutFigures[i].offsetWidth,height:cutoutFigures[i].offsetHeight};
   const upper=i===0||i===2;
   const center=w*[.23,.39,.62,.78][i];
   return {x:center-size.width/2,y:upper?Math.max(12,signatureBounds.y-size.height-12):signatureBounds.y+signatureBounds.height+12,dx:0,dy:0};
  });
  const figureBottom=Math.max(...cutoutAnchors.map((p,i)=>p.y+cutoutFigures[i].offsetHeight));
  cutouts.querySelector('.signature-hint').style.top=(figureBottom+22)+'px';
  document.querySelector('.line-intro').style.minHeight=(signatureTravel+figureBottom+80)+'px';
  signaturePath.style.strokeWidth=String(Math.max(2,2.7*scale));
  let px=x+630*scale,py=y+100*scale+signatureTravel,lane=w*.965,index=0;
  for (const slot of document.querySelectorAll('.story-symbol')) {
   const top=slot.getBoundingClientRect().top+scrollY, iy=top+25,cx=w/2;
   const iconScale=.48;
   const key=slot.dataset.symbol,color=key==='theater'?'#dda3ce':key==='mentorship'?'#92704f':'#688c96';
   let d=`M ${px} ${py}`;
   if(index===0) {
    // Follow the signature out toward the right margin, without crossing the hub.
    d+=` C ${px+35} ${py-16} ${lane} ${py+55} ${lane} ${py+120}`;
    const contact=document.querySelector('.contact-strip').getBoundingClientRect();
    const boxTop=contact.top+scrollY+6,boxBottom=contact.bottom+scrollY-6,boxLeft=w*.06,radius=14;
    // Turn left, down, then right around the contact icons before rejoining the margin.
    d+=` L ${lane} ${boxTop-radius} Q ${lane} ${boxTop} ${lane-radius} ${boxTop} L ${boxLeft+radius} ${boxTop} Q ${boxLeft} ${boxTop} ${boxLeft} ${boxTop+radius} L ${boxLeft} ${boxBottom-radius} Q ${boxLeft} ${boxBottom} ${boxLeft+radius} ${boxBottom} L ${lane-radius} ${boxBottom} Q ${lane} ${boxBottom} ${lane} ${boxBottom+radius}`;
   } else {
    // A generous downward bend stays inside the previous symbol's empty slot.
    d+=` C ${px} ${py+20} ${lane} ${py+18} ${lane} ${py+36}`;
   }
   // Keep the same margin between sections. Only enter the centered illustration
   // inside its reserved space, with vertical tangents at both ends.
   d+=` L ${lane} ${top} C ${lane} ${top+12} ${cx} ${iy-12} ${cx} ${iy}`;
   add(d,index===0?innerHeight*.72+signatureTravel:py,iy,color);
   add(mapped(icons[key],cx-100*iconScale,iy,iconScale),iy,iy+170*iconScale,color);
   if(key==='speech') paths[paths.length-1].path.style.stroke='#fff';
   px=cx;py=iy+170*iconScale;index++;
  }
  render();
 }
 function render() {
  frame=0;const cursor=scrollY+innerHeight*.72;let tip=null;
  const signatureOffset=Math.min(scrollY,signatureTravel);
  cutouts.style.transform=`translate3d(0,${signatureOffset}px,0)`;
  const penProgress=Math.max(0,Math.min(1,(cursor-paths[0].start)/(paths[0].end-paths[0].start||1)));
  cutoutFigures.forEach((figure,i)=>{
   const anchor=cutoutAnchors[i];
   const reveal=Math.max(0,Math.min(1,(penProgress-cutoutBeats[i])/.08));
   const ease=reveal*reveal*(3-2*reveal);
   const drift=.45+.55*ease;
   figure.style.left=anchor.x+'px';figure.style.top=anchor.y+'px';
   figure.style.opacity=String(ease);
   figure.style.visibility=reveal>0?'visible':'hidden';
   figure.style.transform=`translate3d(${anchor.dx*drift}px,${anchor.dy*drift}px,0) scale(${.65+.35*ease})`;
   figure.classList.toggle('is-revealed',reveal>0);
   figure.disabled=reveal<.9;
   if(reveal===0){figure.setAttribute('aria-expanded','false');figure.querySelector('.avatar-bubble').hidden=true;}
  });
  cutouts.querySelector('.signature-hint').style.opacity=String(Math.max(0,Math.min(1,(penProgress-.87)/.08)));
  cutouts.style.opacity='1';
  cutouts.classList.toggle('is-resting',scrollY>signatureTravel+innerHeight);
  const scrollCue=document.querySelector('.line-scroll');
  scrollCue.style.opacity=String(Math.max(0,1-scrollY/80));
  scrollCue.style.visibility=scrollY>=80?'hidden':'visible';
  scrollCue.style.pointerEvents=scrollY>=80?'none':'auto';
  signaturePath.setAttribute("transform",`translate(0 ${signatureOffset})`);
  for(const item of paths) {
   const p=item.end===0?1:Math.max(0,Math.min(1,(cursor-item.start)/(item.end-item.start)));
   item.path.style.strokeDashoffset=String(item.length*(1-p));
   if(p>0) tip={item,p};
  }
  arrow.style.visibility=tip?'visible':'hidden';
  if(tip) {
   const l=tip.item.length*tip.p,a=tip.item.path.getPointAtLength(Math.max(0,l-1)),b=tip.item.path.getPointAtLength(l);
   arrow.setAttribute('transform',`translate(${b.x} ${b.y+(tip.item.path===signaturePath?signatureOffset:0)}) rotate(${Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI-90})`);
   arrow.style.stroke=inkAt(b.y+(tip.item.path===signaturePath?signatureOffset:0));
  }
 }
 addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(render);},{passive:true});
 addEventListener('resize',measure);addEventListener('load',measure);
 new ResizeObserver(measure).observe(document.querySelector('.site-content'));
 document.fonts.ready.then(measure);reduced.addEventListener('change',render);measure();
})();

// Playful, keyboard-accessible avatar conversations.
(() => {
 const avatars=[...document.querySelectorAll('.signature-cutout')];
 const closeAll=()=>avatars.forEach(button=>{
  button.setAttribute('aria-expanded','false');
  button.querySelector('.avatar-bubble').hidden=true;
 });
 avatars.forEach(button=>button.addEventListener('click',()=>{
  const opening=button.getAttribute('aria-expanded')!=='true';
  closeAll();
  if(opening){
   button.setAttribute('aria-expanded','true');
   button.querySelector('.avatar-bubble').hidden=false;
   if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
    button.querySelector('img').animate([{transform:'translateY(0) rotate(0)'},{transform:'translateY(-9px) rotate(-4deg)'},{transform:'translateY(0) rotate(0)'}],{duration:380,easing:'ease-out'});
   }
  }
 }));
 document.addEventListener('keydown',event=>{if(event.key==='Escape')closeAll();});
 document.addEventListener('click',event=>{if(!event.target.closest('.signature-cutout'))closeAll();});
})();

// Copy contact details and confirm the result in a speech bubble.
(() => {
 const buttons=[...document.querySelectorAll('button.contact-copy[data-copy-value]')];
 const closeAll=()=>buttons.forEach(button=>button.querySelector('.contact-tooltip').textContent='');
 buttons.forEach(button=>button.addEventListener('click',async()=>{
  const value=button.dataset.copyValue;
  if(!value)return;
  closeAll();
  const confirmation=button.dataset.contact==='wechat'?'WeChat username copied to clipboard!':'Address copied to clipboard!';
  try{
   await navigator.clipboard.writeText(value);
   button.querySelector('.contact-tooltip').textContent=confirmation;
  }catch{
   button.querySelector('.contact-tooltip').textContent='Could not copy automatically: '+value;
  }
 }));
 document.addEventListener('keydown',event=>{if(event.key==='Escape')closeAll();});
 document.addEventListener('click',event=>{if(!event.target.closest('.contact-copy'))closeAll();});
})();
