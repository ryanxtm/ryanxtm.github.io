/* Small data-driven components; intentionally no framework or animation dependency. */
(() => {
 const data=window.portfolioContent;
 if(!data) return;
 const escape=value=>String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const photo=(image,alt,extra='')=>`<img src="${escape(image.src)}" width="${image.width}" height="${image.height}" alt="${escape(alt)}" loading="lazy" decoding="async" ${extra}>`;
 const viewer=(image,title,caption,body,cls='')=>`<button type="button" class="${cls}" data-figure="${escape(image.src)}" data-figure-title="${escape(title)}" data-caption="${escape(caption)}" aria-label="Enlarge ${escape(title)}">${body}</button>`;
 const featured=data.researchFeatured;
 document.querySelector('#research-featured-media').innerHTML=`<div class="research-figure-deck" aria-label="SSTP research figures">${data.researchFigures.map(image=>viewer(image,image.title,image.caption||image.title,photo(image,image.alt)+`<span class="image-expand" aria-hidden="true">↗</span>`,'research-figure-card')).join('')}</div>`;
 document.querySelector('#sstp-band').innerHTML=data.sstp.map(image=>`<figure class="band-frame">${viewer(image,'SSTP photograph',image.caption||'SSTP photograph',`${photo(image,image.caption||'SSTP photograph '+image.filename)}<span class="band-caption">${escape(image.caption||image.filename)}</span>`,'band-photo')}</figure>`).join('');

 data.productions.filter(production=>production.title!=='The Hunt for Happiness').forEach((production,i)=>{
  const initials=production.title.split(/\s+/).filter(w=>!['a','the','of','in'].includes(w.toLowerCase())).slice(0,2).map(w=>w[0]).join('');
  const label=`${production.title} · ${production.role} · ${production.year}`;
  const tooltip=`<span class="circle-label">${escape(label)}${production.image?'':' · Photo to come'}</span>`;
  const body=production.image?photo(production.image,production.title):`<span class="circle-initials" aria-hidden="true">${escape(initials)}</span>`;
  const item=document.createElement('div');item.className=`production-orbit orbit-${i%4}`;
  item.innerHTML=production.image?viewer(production.image,production.title,label,body+tooltip,'production-circle'):`<div class="production-circle is-placeholder" tabindex="0" role="img" aria-label="${escape(label)}. Photo placeholder">${body}${tooltip}</div>`;
  document.querySelector(i<8?'.cluster-left':'.cluster-right').append(item);
 });

 document.querySelector('#mentorship-columns').innerHTML=data.mentorship.map((entry,i)=>`<article class="mentor-column"><div class="mentor-column-head"><span class="mentor-number">0${i+1}</span><h3>${escape(entry.title)}</h3></div>${viewer(entry.image,entry.featured,entry.caption,photo(entry.image,entry.featured)+`<span class="band-caption">${escape(entry.caption)}</span>`,'mentor-photo')}<h4>${escape(entry.featured)}</h4>${entry.summary?`<p>${escape(entry.summary)}</p>`:''}<ul>${entry.points.map(point=>`<li>${point==='Interpretation Captain Emeritus'?`<strong>${escape(point)}</strong>`:escape(point)}</li>`).join('')}</ul></article>`).join('');
 document.querySelector('#speech-event-photo').innerHTML=viewer(data.speechEvent,'Speech & Debate',data.speechEvent.caption,photo(data.speechEvent,'Speech & Debate photograph')+`<span class="band-caption">${escape(data.speechEvent.caption)}</span>`,'speech-photo');

 document.querySelectorAll('.research-figure-card').forEach((card,i)=>card.style.aspectRatio=data.researchFigures[i].width+'/'+data.researchFigures[i].height);
 const band=document.querySelector('#sstp-band');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 // Skiper52's expanding flex panels, with the existing full-image viewer.
 band.classList.add('hover-expand-gallery');
 band.setAttribute('aria-label','SSTP photographs; use left and right arrows to expand photos');
 const panels=[...band.querySelectorAll('.band-frame')];
 let selected=Math.min(1,panels.length-1);
 function selectPanel(index){
  selected=Math.max(0,Math.min(index,panels.length-1));
  panels.forEach((panel,i)=>panel.classList.toggle('is-active',i===selected));
 }
 // Avoid hover panels chasing a stationary pointer during scroll or resizing.
 let lastScroll=0, panelBusyUntil=0;
 window.addEventListener('scroll',()=>{lastScroll=performance.now();},{passive:true});
 window.addEventListener('wheel',()=>{lastScroll=performance.now();},{passive:true});
 panels.forEach((panel,i)=>{
  panel.addEventListener('pointerenter',event=>{
   const now=performance.now();
   if(event.pointerType==='touch' || now-lastScroll<180 || now<panelBusyUntil || selected===i) return;
   panelBusyUntil=now+340;selectPanel(i);
  });
  panel.addEventListener('focusin',()=>selectPanel(i));
 });
 band.addEventListener('keydown',event=>{
  if(['ArrowLeft','ArrowRight'].includes(event.key)){
   event.preventDefault();selectPanel(selected+(event.key==='ArrowLeft'?-1:1));
   panels[selected].querySelector('button').focus({preventScroll:true});
  }
 });
 selectPanel(selected);

 // One restrained entrance per content group, with no hidden-content dependency.
 const entranceTargets=document.querySelectorAll('.research-layout,.extended-drama,.mentor-column,.speech-highlights');
 if(!reduced.matches){
  const entrance=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(entry.isIntersecting){entry.target.animate([{opacity:.6,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:430,easing:'cubic-bezier(.2,.7,.3,1)'});entrance.unobserve(entry.target);}
  }),{threshold:.12});
  entranceTargets.forEach(el=>entrance.observe(el));
  reduced.addEventListener('change',()=>{if(reduced.matches){entrance.disconnect();entranceTargets.forEach(el=>el.getAnimations().forEach(a=>a.cancel()));}});
 }
})();
