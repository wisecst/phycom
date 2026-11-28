/* Shared lesson flow for DC and 180-degree servo motors.
   Initial blocks and pin-13 view use the established LED markup and styling. */
(()=>{
 'use strict';
 const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
 const servo=document.body.dataset.motor==='servo',name=servo?'서보모터':'DC모터';
 const slides=qa('.slide'),last=slides.length-1,blocks=qa('[data-entry-step]'),max=blocks.length;
 let page=0,step=1,circuitStep=0,finished=false,runButton=null,animationTimer=null;
 let guidedPinShown=false;
 function fitCode(){
  const active=slides[page];
  if(!active?.classList.contains('entry-slide'))return;
  const program=active.querySelector('.motor-program'),stage=active.querySelector('.entry-stage');
  if(!program||!stage)return;
  program.style.setProperty('transform','none','important');
  const rect=window.lessonStage.rect(program),stageRect=window.lessonStage.rect(stage);
  const result=[...active.querySelectorAll('.motor-result')].find(el=>!el.hidden);
  const right=result?window.lessonStage.rect(result).left-24:stageRect.right-20;
  const scale=Math.min(1,(right-rect.left)/Math.max(1,window.lessonStage.measure(program).width),(stageRect.bottom-24-rect.top)/Math.max(1,window.lessonStage.measure(program).height));
  program.style.setProperty('transform','scale('+Math.max(.35,scale)+')','important');
 }
 function closeResults(){
  clearTimeout(animationTimer);animationTimer=null;
  qa('.motor-result').forEach(el=>{el.hidden=true;el.setAttribute('aria-hidden','true')});
  q('.motor-motion').classList.remove('running');
  q('.motor-motion-fan')?.classList.remove('running');
  if(q('#motorResultText'))q('#motorResultText').textContent='정지';
  q('.motor-program').classList.remove('running');
  if(runButton){runButton.textContent='▶';runButton.classList.remove('running');runButton=null}
  requestAnimationFrame(fitCode);
 }
 function openResult(id,button){
  closeResults();const modal=q(id);modal.hidden=false;modal.setAttribute('aria-hidden','false');
  runButton=button;if(button){button.textContent='■';button.classList.add('running')}
  requestAnimationFrame(fitCode);
 }
 function showPin13(){openResult('#pin13Modal',q('#runPin13'))}
 function runMotor(){
  openResult('#motorResult',q('#runMotor'));q('.motor-program').classList.add('running');
  const text=q('#motorResultText'),motion=q('.motor-motion'),pointer=q('.motor-motion-pointer'),fan=q('.motor-motion-fan');
  if(servo){
   const angles=[90,180,90,0];let i=0;
   const paint=()=>{const angle=angles[i];text.textContent=angle+'°';pointer.style.transform='rotate('+(angle-90)+'deg)';if(++i<angles.length)animationTimer=setTimeout(paint,500)};
   paint();
  }else{
   let on=true;
   const paint=()=>{motion.classList.toggle('running',on);if(fan)fan.classList.toggle('running',on);text.textContent=on?'회전 중':'정지';on=!on;animationTimer=setTimeout(paint,2000)};
   paint();
  }
 }
 function renderCode(){
  blocks.forEach(el=>{const n=+el.dataset.entryStep;el.classList.toggle('entry-show',n<=step);el.classList.toggle('entry-current',n===step)});
  q('[data-repeat-body]')?.classList.toggle('repeat-show',step>=3);
  const current=blocks.find(el=>+el.dataset.entryStep===step);
  const tab=current?.dataset.tab||(step===1?'start':'hardware');
  qa('.entry-tab').forEach(el=>el.classList.toggle('active-tab',el.dataset.tab===tab));
  const run=q('#runMotor');if(run)run.disabled=step<max;
  requestAnimationFrame(fitCode);
 }
 function syncNav(){
  q('#prev').disabled=page===0;
  q('#next').disabled=page===last&&finished&&q('#motorResult').hidden;
  q('#slides').textContent=window.hardwareConnect?.number(page,slides.length)||(page+1)+' / '+slides.length;
 }
 function showPage(n){
  if(window.hardwareConnect?.before(page,n,showPage))return;
  q('#pinDialog').close();closeResults();page=Math.max(0,Math.min(last,n));
  slides.forEach((el,i)=>el.classList.toggle('active',i===page));
  document.body.classList.toggle('after-intro',page>0);document.body.classList.toggle('entry-page',slides[page].classList.contains('entry-slide'));
  q('#slideSubtitle').textContent=name+' '+(page===0?'개념설명':page===1?'회로 연결':'실행');
  qa('.slide-sidebar-item').forEach((el,i)=>{el.classList.toggle('active',i===page);if(i===page)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current')});
  if(page===1)requestAnimationFrame(()=>{window.lessonCircuit.refresh();window.lessonCircuit.setStep(circuitStep)});
  if(page===last)renderCode();syncNav();window.hardwareLessonAdapter?.sync?.(page);
 }
 function next(){
  if(page===0){showPage(1);return}
  if(page===1){if(circuitStep<3){window.lessonCircuit.setStep(++circuitStep)}else showPage(2);return}
  
  if(step===1){step=2;renderCode()}
  else if(step===2&&!guidedPinShown){guidedPinShown=true;showPin13()}
  else if(step<max){closeResults();step++;renderCode()}
  else if(!finished){finished=true;runMotor()}
  else closeResults();
  syncNav();
 }
 function prev(){
  if(page===0)return;
  if(page===1){if(circuitStep>0)window.lessonCircuit.setStep(--circuitStep);else showPage(0);return}
  
  const pinOpen=!q('#pin13Modal').hidden,motorOpen=!q('#motorResult').hidden;
  closeResults();
  if(motorOpen||finished){finished=false;renderCode();syncNav();return}
  if(pinOpen){guidedPinShown=false;syncNav();return}
  if(step>1){step--;if(step<3)guidedPinShown=false;renderCode();syncNav()}else showPage(1);
 }
 qa('.motor-result .entry-result-close').forEach(el=>el.addEventListener('click',()=>{closeResults();syncNav()}));
 window.lessonUI.bindOutside({key:'motor-results',isOpen:()=>qa('.motor-result').some(el=>!el.hidden),inside:'.motor-result,#runPin13,#runMotor',close:()=>{closeResults();syncNav()}});
 q('#runPin13').addEventListener('click',()=>{if(runButton===q('#runPin13'))closeResults();else showPin13();syncNav()});
 q('#runMotor').addEventListener('click',()=>{if(runButton===q('#runMotor'))closeResults();else runMotor();syncNav()});
 q('#prev').addEventListener('click',prev);q('#next').addEventListener('click',next);
 window.addEventListener('resize',()=>requestAnimationFrame(fitCode));
 document.addEventListener('fullscreenchange',()=>requestAnimationFrame(fitCode));
 const toggleFullscreen=()=>window.lessonStage.toggleFullscreen();
 q('#fullscreenBtn').addEventListener('click',()=>toggleFullscreen().catch(()=>{}));
 document.addEventListener('keydown',event=>{
  if(/input|textarea|select/i.test(event.target.tagName)||event.target.isContentEditable)return;
  if(window.lessonUI.direction(event)>0){event.preventDefault();next()}
  else if(window.lessonUI.direction(event)<0){event.preventDefault();prev()}
  else if(event.key==='Escape'){q('#pinDialog').close();closeResults();syncNav()}
  else if(event.key.toLowerCase()==='f'){event.preventDefault();toggleFullscreen().catch(()=>{})}
  else if(event.key==='Home'){event.preventDefault();showPage(0)}
  else if(event.key==='End'){event.preventDefault();showPage(2)}
 });
 q('[data-motor-pins]').addEventListener('click',()=>q('#pinDialog').showModal());
 q('#pinDialog [data-close-dialog]').addEventListener('click',()=>q('#pinDialog').close());
 q('#pinDialog').addEventListener('click',event=>{if(event.target===q('#pinDialog'))q('#pinDialog').close()});
 ['1. 개념설명','2. 회로 연결','3. 실행'].forEach((title,i)=>{
  const button=document.createElement('button');button.type='button';button.className='slide-sidebar-item';button.innerHTML='<span class="sidebar-page-no">'+(i+1)+'</span><span>'+title+'</span>';button.addEventListener('click',()=>showPage(i));q('#slideSidebarList').appendChild(button);
 });
 window.addEventListener("load",()=>{window.hardwareConnect.open=()=>{showPage(1);window.hardwareConnect.before(1,2,showPage);};syncNav();});
 renderCode();showPage(0);
})();
