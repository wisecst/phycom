/* Shared result-window boundaries and presenter key conventions. */
(() => {
 'use strict';
 const windows = new Map();
 const navigation = '#prev,#next,#mobilePrev,#mobileNext,.slide-sidebar-item,.hc-sidebar-item,#fullscreenBtn';
 document.addEventListener('click', event => {
  if (event.target.closest(navigation)) return;
  for (const config of windows.values()) {
   if (!config.isOpen() || event.target.closest(config.inside)) continue;
   config.close();
   event.preventDefault();
   event.stopImmediatePropagation();
   break;
  }
 }, true);
 const completed=new WeakSet();
 const actions='.entry-save-btn,.entry-save-item,.entry-complete-btn';
 function syncActions(){
  document.querySelectorAll('.entry-slide').forEach(slide=>{
   if(!slide.querySelector('.entry-save-btn')||!slide.querySelector('.entry-program,.servo5-code,.dc5-code'))return;
   const on=completed.has(slide);
   slide.querySelectorAll(actions).forEach(button=>{
    if(button.disabled===on)button.disabled=!on;
    if(on&&!button.classList.contains('enabled'))button.classList.add('enabled');
   });
  });
 }
 function completeResult(slide){if(!slide)return;completed.add(slide);syncActions()}
 function installCompletion(){
  // The number badge already owns the page number; remove only its duplicate.
  document.querySelectorAll('#slideSidebarList > button').forEach(button=>{
   const badge=button.querySelector('.sidebar-page-no'),label=button.lastElementChild;
   if(!badge||!label||badge===label)return;
   const prefix=label.textContent.match(/^\s*(\d+)\.\s*/);
   if(prefix&&prefix[1]===badge.textContent.trim())label.textContent=label.textContent.slice(prefix[0].length);
  });
  syncActions();new MutationObserver(syncActions).observe(document.querySelector('main.wrap'),{subtree:true,childList:true,attributes:true,attributeFilter:['disabled']});
 }
 document.addEventListener('DOMContentLoaded',installCompletion,{once:true});
 window.lessonUI = {
  completeResult,
  bindOutside(config) { windows.set(config.key, config); },
  direction(event) {
   if (/input|textarea|select/i.test(event.target.tagName) || event.target.isContentEditable) return 0;
   if (event.key === ' ' && event.target.closest('button,[role="button"]')) return 0;
   return ['ArrowRight','PageDown',' '].includes(event.key) ? 1 : ['ArrowLeft','PageUp'].includes(event.key) ? -1 : 0;
  }
 };
})();
