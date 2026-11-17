/* Display numbering only. Navigation indices and lesson content stay unchanged. */
(() => {
 'use strict';
 const slides=()=>[...document.querySelectorAll('main.wrap > .slide')];
 const plain=text=>text.replace(/^\s*\d+\.\s*/, '');
 const number=slide=>{const i=slides().indexOf(slide);const pageNumber=i+1;return pageNumber};
 const counter=slide=>number(slide)+' / '+slides().length;
 const write=(el,text)=>{if(el&&el.textContent!==text)el.textContent=text};
 function refresh(){
  const pages=slides(),items=[...document.querySelectorAll('#slideSidebarList > button')];
  pages.forEach((slide,i)=>{
   const pageNumber=i+1;
   const item=items[i],label=item?.lastElementChild;
   write(item?.querySelector('.sidebar-page-no'),String(pageNumber));
   if(label&&!label.classList.contains('sidebar-page-no'))write(label,plain(label.textContent));
   const heading=slide.classList.contains('hardware-connect-slide')?slide.querySelector('.entry-lesson-title'):slide.querySelector('h2:not(.project-header-subtitle),.entry-lesson-title');
   if(heading)write(heading,pageNumber+'. '+plain(heading.textContent));
   if(slide.hasAttribute('aria-label')){const t=slide.getAttribute('aria-label'),v=pageNumber+'. '+plain(t);if(t!==v)slide.setAttribute('aria-label',v)}
  });
  const active=pages.find(slide=>slide.classList.contains('active'));
  if(!active)return;
  const i=pages.indexOf(active),pageNumber=i+1;
  write(document.querySelector('#slides'),counter(active));
  const subtitle=document.querySelector('#slideSubtitle,#subtitle');
  if(subtitle&&subtitle.textContent.trim()){
   const title=subtitle.textContent.replace(/^(DC모터|서보모터)\s+/, '').replace(/^\s*\d+\.\s*/, '');
   const device=subtitle.textContent.match(/^(DC모터|서보모터)\s+/)?.[0]||'';
   write(subtitle,device+pageNumber+'. '+title);
  }
  document.querySelectorAll('.project-header-subtitle,.project-guide-subtitle').forEach(h=>{
   const slide=pages.find(s=>s.classList.contains(h.classList.contains('circuit-subtitle')?'project-circuit':'project-guide'));
   if(slide)write(h,number(slide)+'. '+plain(h.textContent));
  });
 }
 window.lessonPages={number,counter,refresh};
 document.addEventListener('DOMContentLoaded',()=>{
  refresh();
  new MutationObserver(refresh).observe(document.querySelector('main.wrap'),{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
  new MutationObserver(refresh).observe(document.querySelector('#slideSidebarList'),{childList:true,subtree:true});
 },{once:true});
})();
