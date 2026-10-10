/* Adapted from the user-supplied Skiper UI Skiper67 component. */
(() => {
 const trigger=document.querySelector('.speech-video-preview');
 const dialog=document.querySelector('.speech-video-dialog');
 if(!trigger || !dialog) return;
 const preview=trigger.querySelector('video');
 const player=dialog.querySelector('video');
 const panel=dialog.querySelector('.speech-video-panel');
 const cursor=trigger.querySelector('.video-play-cursor');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let visible=false,closing=false,motion,frame=0,x=0,y=0,targetX=0,targetY=0;
 function syncPreview(){
  if(visible && !reduced.matches && !document.hidden && !dialog.open) preview.play().catch(()=>{});
  else preview.pause();
 }
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncPreview();},{threshold:.2}).observe(trigger);
 reduced.addEventListener('change',syncPreview);
 document.addEventListener('visibilitychange',syncPreview);
 function follow(){
  x+=(targetX-x)*.2;y+=(targetY-y)*.2;
  cursor.style.transform=`translate(${x}px,${y}px)`;
  if(Math.abs(targetX-x)+Math.abs(targetY-y)>.2) frame=requestAnimationFrame(follow);
  else frame=0;
 }
 trigger.addEventListener('pointermove',event=>{
  if(event.pointerType==='touch'||reduced.matches)return;
  const rect=trigger.getBoundingClientRect();
  targetX=Math.max(0,Math.min(event.clientX-rect.left,rect.width-cursor.offsetWidth));
  targetY=Math.max(0,Math.min(event.clientY-rect.top,rect.height-cursor.offsetHeight));
  if(!trigger.classList.contains('is-pointing')){x=targetX;y=targetY;}
  trigger.classList.add('is-pointing');
  if(!frame) frame=requestAnimationFrame(follow);
 });
 trigger.addEventListener('pointerleave',()=>{trigger.classList.remove('is-pointing');cancelAnimationFrame(frame);frame=0;});
 const small='inset(43.5% 43.5% 33.5% 43.5%)';
 trigger.addEventListener('click',()=>{
  if(dialog.open)return;
  closing=false;dialog.classList.remove('is-closing');
  dialog.showModal();document.body.classList.add('modal-open');syncPreview();
  player.currentTime=0;
  player.play().catch(()=>{}); // Native controls remain available if playback is blocked.
  if(!reduced.matches) motion=panel.animate([{clipPath:small,opacity:0},{clipPath:'inset(0)',opacity:1}],{duration:1000,easing:'cubic-bezier(.16,1,.3,1)'});
 });
 async function closeVideo(){
  if(closing || !dialog.open)return;
  closing=true;player.pause();motion?.cancel();
  if(!reduced.matches){
   dialog.classList.add('is-closing');
   motion=panel.animate([{clipPath:'inset(0)',opacity:1,offset:0},{clipPath:small,opacity:1,offset:.8},{clipPath:small,opacity:0,offset:1}],{duration:1000,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
   try{await motion.finished;}catch{}
  }
  dialog.close();
 }
 dialog.querySelector('.speech-video-close').addEventListener('click',closeVideo);
 dialog.addEventListener('click',event=>{if(event.target===dialog)closeVideo();});
 dialog.addEventListener('cancel',event=>{event.preventDefault();closeVideo();});
 dialog.addEventListener('close',()=>{
  player.pause();motion?.cancel();dialog.classList.remove('is-closing');closing=false;
  document.body.classList.remove('modal-open');trigger.focus({preventScroll:true});syncPreview();
 });
})();
