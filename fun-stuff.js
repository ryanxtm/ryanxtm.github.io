/* Vanilla adaptations of supplied Skiper31, Skiper30 and Skiper54. */
(() => {
 const section=document.querySelector('#additional-fun');if(!section)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const headings=[...section.querySelectorAll('#fun-title,.fun-animated-heading')].map(heading=>{
  const text=heading.textContent;heading.setAttribute('aria-label',text);heading.textContent='';let index=0;
  text.split(' ').forEach((word,i,words)=>{const group=document.createElement('span');group.className='fun-word';group.setAttribute('aria-hidden','true');for(const char of word){const span=document.createElement('span');span.className='fun-char';span.textContent=char;span.dataset.index=index++;group.append(span)}heading.append(group);if(i<words.length-1){heading.append(' ');index++}});
  return {heading,chars:[...heading.querySelectorAll('.fun-char')],center:(text.length-1)/2};
 });
 const gallery=section.querySelector('.cat-parallax'),columns=[...gallery.children];let frame=0;
 function renderScroll(){frame=0;headings.forEach(({heading,chars,center})=>{const top=heading.getBoundingClientRect().top;const remaining=reduced.matches?0:Math.max(0,Math.min(1,(top-innerHeight*.48)/(innerHeight*.42)));chars.forEach(el=>{const d=Number(el.dataset.index)-center;el.style.transform=`translateX(${d*50*remaining}px) rotateX(${d*50*remaining}deg)`})});
  const rect=gallery.getBoundingClientRect(),progress=Math.max(0,Math.min(1,(innerHeight-rect.top)/(innerHeight+rect.height)));
  columns.forEach((column,i)=>{const travel=innerWidth<=700?0:[120,230,80,180][i];column.style.transform=`translateY(${reduced.matches?0:(progress-.5)*travel}px)`});
 }
 function requestRender(){if(!frame)frame=requestAnimationFrame(renderScroll)}
 addEventListener('scroll',requestRender,{passive:true});addEventListener('resize',requestRender);reduced.addEventListener('change',requestRender);renderScroll();
 function sizeProject(){section.style.setProperty('--project-header-height',`${document.querySelector('.site-header').getBoundingClientRect().height}px`)}
 sizeProject();addEventListener('resize',sizeProject);
 const track=section.querySelector('.project-track'),items=[...track.children],count=section.querySelector('.project-count'),dots=[...section.querySelectorAll('[data-project-index]')];let active=0,scrollFrame=0;
 function sync(){scrollFrame=0;const center=track.scrollLeft+track.clientWidth/2;let distance=Infinity;items.forEach((item,i)=>{const d=Math.abs(item.offsetLeft-track.offsetLeft+item.offsetWidth/2-center);if(d<distance){distance=d;active=i}});items.forEach((item,i)=>item.classList.toggle('is-active',i===active));dots.forEach((dot,i)=>dot.setAttribute('aria-current',String(i===active)));count.textContent=`${active+1} / ${items.length}`}
 function go(index){const target=items[(index+items.length)%items.length];track.scrollTo({left:target.offsetLeft-track.offsetLeft-(track.clientWidth-target.offsetWidth)/2,behavior:reduced.matches?'instant':'smooth'})}
 track.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(sync)},{passive:true});
 section.querySelectorAll('[data-project-step]').forEach(button=>button.addEventListener('click',()=>go(active+Number(button.dataset.projectStep))));dots.forEach((dot,i)=>dot.addEventListener('click',()=>go(i)));
 track.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();go(active+(e.key==='ArrowRight'?1:-1))}});
 addEventListener('resize',()=>{go(active);sync()});sync();
})();
