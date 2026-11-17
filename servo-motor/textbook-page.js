/* Servo-only lesson flow. The LED pin-13 prefix and result boundaries are retained. */
(()=>{
 'use strict';
 const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
 const slides=qa('main.wrap > .slide'),basic=qa('[data-entry-step]'),code=qa('[data-textbook-step]');
 const principle=q('#servoPrincipleOverlay'),pins=q('#pinDialog'),pinResult=q('#pin13Modal'),result=q('#motorResult'),final=q('#servo5Result');
 let page=0,intro=0,circuit=0,step4=0,step5=0,pin4=0,pin5=0,result4=0,result5=0,timer=null,runButton=null,angle=0,direction=1,principleTimer=null;
 let detail=1;
 const lastStep5=23;
 function stopPrinciple(){clearInterval(principleTimer);principleTimer=null;}
 function startPrinciple(){
  stopPrinciple();const started=performance.now(),horn=principle.querySelector('.servo-principle-horn');
  function tick(){
   const t=((performance.now()-started)/1000)%7,current=t<.8?0:t<2.4?Math.round((t-.8)/1.6*90):90;
   const phase=t<.8?0:t<2.4?1:t<3.2?2:t<4?3:4;
   horn.style.transform='rotate('+(current-90)+'deg)';q('#servoPrincipleAngle').textContent=current+'°';
   const messages=['90° 제어 신호를 보내요.','현재 위치를 확인하며 회전 중이에요.','현재 위치: 90°','현재 90° = 목표 90°','목표 90°에 도착! 멈췄어요.'];
   const status=q('#servoPrincipleStatus');if(status.textContent!==messages[phase])status.textContent=messages[phase];
   principle.querySelectorAll('[data-principle-phase]').forEach(el=>el.classList.toggle('active-phase',+el.dataset.principlePhase===phase));
  }
  tick();principleTimer=setInterval(tick,80);
 }
 function comparison(left,right){const value=v=>'<span class="'+(v==='각도'?'tb-variable':'number-field')+'">'+v+(v==='각도'?'<span class="select-arrow">▼</span> 값':'')+'</span>';return value(left)+'<b>&lt;</b>'+value(right);}
 function paintConditions(){
  for(const which of ['up','down']){
   const up=which==='up',insert=up?7:17,variable=up?9:19,edit=up?10:20,slot=q('[data-servo-condition="'+which+'"]');
   q('[data-condition-true="'+which+'"]').hidden=step5>=insert;slot.hidden=step5<insert;
   const left=up?(step5>=variable?'각도':'10'):(step5>=edit?'0':'10'),right=up?(step5>=edit?'180':'10'):(step5>=variable?'각도':'10');
   slot.innerHTML=comparison(left,right);slot.classList.toggle('entry-current',step5===insert);slot.classList.toggle('condition-inserting',step5===insert);
   slot.querySelector('.tb-variable')?.classList.toggle('entry-current',step5===variable);
   (up?slot.lastElementChild:slot.firstElementChild).classList.toggle('entry-current',step5===edit);
  }

 }
 function closeResults(){
  clearTimeout(timer);timer=null;
  [pinResult,result,final].forEach(el=>{el.hidden=true;el.setAttribute('aria-hidden','true')});
  if(runButton){runButton.textContent='▶';runButton.classList.remove('running');runButton=null}
  qa('.servo-running').forEach(el=>el.classList.remove('servo-running'));
 }
 function closePopup(){
  if(!principle.hidden){intro=2;principle.hidden=true;principle.setAttribute('aria-hidden','true');stopPrinciple()}
  if(pins.open){intro=4;pins.close()}
  if(!pinResult.hidden){if(page===2)pin4=2;else pin5=2}
  if(!result.hidden)result4=2;
  if(!final.hidden)result5=2;
  closeResults();paint();
 }
 function showIntro(n){
  intro=n;principle.hidden=n!==1;principle.setAttribute('aria-hidden',String(n!==1));
  if(n===1)startPrinciple();else stopPrinciple();
  if(n===3){if(!pins.open)pins.showModal()}else if(pins.open)pins.close();
  paint();
 }
 function openResult(el,btn){
  closeResults();slides[page].append(el);el.hidden=false;el.setAttribute('aria-hidden','false');
  if((el===result&&step4>=basic.length)||(el===final&&step5>=lastStep5))window.lessonUI.completeResult(slides[page]);
  if(btn){runButton=btn;btn.textContent='■';btn.classList.add('running')}
  paint();
 }
 function showPin(){
  if(page===2)pin4=1;else pin5=1;
  openResult(pinResult,q(page===2?'#runPin13':'#servo5RunPin13'));
 }
 function runBasic(){
  result4=1;openResult(result,q('#runMotor'));let i=0;
  function tick(){
   const angles=[90,180,90,0],n=[3,5,7,9][i];
   q('#motorResultText').textContent=angles[i]+'°';q('#motorResult .servo-actual-horn').style.transform='rotate('+(angles[i]-90)+'deg)';
   basic.forEach(el=>{el.classList.remove('entry-current');el.classList.toggle('servo-running',+el.dataset.entryStep===n)});
   i=(i+1)%angles.length;timer=setTimeout(tick,500);
  }
  tick();
 }
 function updateAngle(n,dir){
  angle=Math.max(0,Math.min(180,n));q('#servo5Angle').textContent=angle+'°';
  final.querySelector('.servo-roulette-arrow').style.transform='rotate('+(angle-90)+'deg)';
  final.querySelector('.servo-actual-horn').style.transform='rotate('+(angle-90)+'deg)';
  q('#servo5Key').textContent=dir>0?'↑ 위쪽 화살표':'↓ 아래쪽 화살표';
  final.querySelectorAll('[data-servo-key]').forEach(el=>el.classList.toggle('pressed',el.dataset.servoKey===(dir>0?'up':'down')));
  const script=slides[3].querySelectorAll('.tb-script')[dir>0?1:2];
  slides[3].querySelectorAll('.tb-script').forEach(el=>el.classList.toggle('servo-running',el===script));
 }
 function runExample(){
  result5=1;openResult(final,q('#servo5Run'));direction=1;updateAngle(0,1);
  function tick(){
   if(angle===180)direction=-1;else if(angle===0)direction=1;
   updateAngle(angle+direction*10,direction);timer=setTimeout(tick,600);
  }
  timer=setTimeout(tick,600);
 }
 function fitCode(){window.servoFitCode?.();}
 function paint(){
  basic.forEach(el=>{const n=+el.dataset.entryStep;el.classList.toggle('entry-show',n<=step4);el.classList.toggle('entry-current',n===step4)});
  q('#runMotor').disabled=step4<basic.length;
  code.forEach(el=>{const n=+el.dataset.textbookStep;el.classList.toggle('tb-hidden',n>step5);el.classList.toggle('entry-current',n===step5)});
  slides[3].querySelectorAll('[data-container-step]').forEach(el=>el.hidden=+el.dataset.containerStep>step5);
  slides[3].querySelectorAll('.tb-script').forEach(el=>el.hidden=+el.querySelector('[data-textbook-step]').dataset.textbookStep>step5);
  q('.servo-scene2').hidden=false;q('.servo-scene-add').hidden=true;
  q('.servo-page5 .entry-scene-tab:not(.servo-scene2)').classList.toggle('active',false);
  q('.servo-scene-hint').hidden=true;q('.servo5-code').hidden=false;
  q('.servo-scene-add').classList.toggle('entry-current',step5===0);
  q('#servo5Run').disabled=step5<lastStep5;paintConditions();
  for(const i of [2,3])slides[i].dataset.entryDetail=i===page?detail:1;
  const current=page===2?basic.find(el=>+el.dataset.entryStep===step4):code.find(el=>+el.dataset.textbookStep===step5);
  const conditionTab=page===3?({6:'judge',7:'judge',8:'data',9:'data',10:'judge',16:'judge',17:'judge',18:'data',19:'data',20:'judge'}[step5]):null;
  slides[page]?.querySelectorAll('.entry-tab').forEach(el=>el.classList.toggle('active-tab',el.dataset.tab===(conditionTab||current?.dataset.tab||(page===2&&step4>0?(step4===1?'start':'hardware'):null))));
  q('#prev').disabled=page===0&&intro===0;q('#next').disabled=page===3&&result5===2;
  if(!window.hardwareConnect?.getState().active){
   q('#slides').textContent=window.hardwareConnect?.number(page,slides.length)||(page+1+(page>=2?1:0))+' / 5';
   q('#slideSubtitle').textContent='서보모터 '+['개념설명','회로 연결','기본 코드','180° 서보모터 원리 알기'][page];
   qa('.slide-sidebar-item').forEach((b,i)=>{b.classList.toggle('active',i===page);if(i===page)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  }
  document.dispatchEvent(new Event('servo-entry-state'));requestAnimationFrame(fitCode);
 }
 function showPage(n){
  closeResults();stopPrinciple();principle.hidden=true;principle.setAttribute('aria-hidden','true');if(pins.open)pins.close();
  if(window.hardwareConnect?.before(page,n,showPage))return;
  page=Math.max(0,Math.min(slides.length-1,n));slides.forEach((el,i)=>el.classList.toggle('active',i===page));
  document.body.classList.toggle('after-intro',page>0);document.body.classList.toggle('entry-page',page>=2);
  if(page===1)requestAnimationFrame(()=>{window.lessonCircuit.refresh();window.lessonCircuit.setStep(circuit)});
  if(page===0)showIntro(intro);else paint();
 }
 function next(){
  if(page===0){if(intro<4)showIntro(intro+1);else showPage(1);return}
  if(page===1){if(circuit<3)window.lessonCircuit.setStep(++circuit);else showPage(2);return}
  if(!pinResult.hidden||!result.hidden||!final.hidden){closePopup();return}
  if(page===2){
   if(step4===2&&pin4===0){showPin();return}
   if(step4<basic.length){step4++;paint();return}
   if(result4===0){runBasic();return}
   step5=0;detail=1;pin5=0;result5=0;showPage(3);return;
  }
  if(step5===2&&pin5===0){showPin();return}
  const progress=window.servoConstruction?.(3,step5);if(progress&&detail<progress.length-1){detail++;paint();return;}
  if(step5<lastStep5){detail=1;step5++;if([6,8,16,18].includes(step5))step5++;paint();return}
  if(result5===0)runExample();
 }
 function prev(){
  if(page===0){showIntro(Math.max(0,intro-1));return}
  if(page===1){if(circuit>0)window.lessonCircuit.setStep(--circuit);else{intro=4;showPage(0)}return}
  if(!pinResult.hidden){closeResults();if(page===2)pin4=0;else pin5=0;paint();return}
  if(!result.hidden||!final.hidden){closeResults();if(page===2)result4=0;else result5=0;paint();return}
  if(page===2){
   if(result4===2){runBasic();return}
   if(step4===2&&pin4===2){showPin();return}
   if(step4>0){step4--;if(step4===2)pin4=2;result4=0;paint()}else showPage(1);return;
  }
  if(result5===2){runExample();return}
  if(detail>1&&window.servoConstruction?.(3,step5)){detail--;paint();return;}
  if(step5===2&&pin5===2){showPin();return}
  if(step5>0){step5--;if([6,8,16,18].includes(step5))step5--;detail=(window.servoConstruction?.(3,step5)?.length||2)-1;if(step5===2)pin5=2;result5=0;paint()}else showPage(2);
 }
 q('#prev').addEventListener('click',prev);q('#next').addEventListener('click',next);
 q('#servoPrincipleTrigger').addEventListener('click',()=>showIntro(principle.hidden?1:2));
 q('#servoPrincipleClose').addEventListener('click',closePopup);
 principle.addEventListener('click',e=>{if(e.target===principle)closePopup()});
 q('[data-motor-pins]').addEventListener('click',()=>showIntro(3));
 pins.querySelector('[data-close-dialog]').addEventListener('click',closePopup);
 pins.addEventListener('cancel',e=>{e.preventDefault();closePopup()});pins.addEventListener('click',e=>{if(e.target===pins)closePopup()});
 qa('.motor-result .entry-result-close').forEach(b=>b.addEventListener('click',closePopup));
 q('#runPin13').addEventListener('click',()=>pinResult.hidden?showPin():closePopup());
 q('#servo5RunPin13').addEventListener('click',()=>pinResult.hidden?showPin():closePopup());
 q('#runMotor').addEventListener('click',()=>result.hidden?runBasic():closePopup());
 q('#servo5Run').addEventListener('click',()=>final.hidden?runExample():closePopup());
 q('.servo-scene-add').addEventListener('click',()=>{if(page===3&&step5===0)next()});
 window.lessonUI.bindOutside({key:'servo-results',isOpen:()=>[pinResult,result,final].some(x=>!x.hidden),inside:'.motor-result,.ec-run,#runPin13,#runMotor,#servo5RunPin13,#servo5Run',close:closePopup});
 document.addEventListener('keydown',e=>{
  if(/input|textarea|select/i.test(e.target.tagName)||e.target.isContentEditable)return;
  if(!final.hidden&&['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();updateAngle(angle+(e.key==='ArrowUp'?10:-10),e.key==='ArrowUp'?1:-1);return}
  const direction=window.lessonUI.direction(e);
  if(direction){e.preventDefault();direction>0?next():prev()}
  else if(e.key==='Escape')closePopup();
  else if(e.key.toLowerCase()==='f'){e.preventDefault();window.lessonStage.toggleFullscreen().catch(()=>{})}
  else if(e.key==='Home'){e.preventDefault();intro=0;showPage(0)}
  else if(e.key==='End'){e.preventDefault();showPage(3)}
 });
 q('#fullscreenBtn').addEventListener('click',()=>window.lessonStage.toggleFullscreen().catch(()=>{}));
 const titles=['개념설명','회로 연결','기본 코드','예제 2 180° 서보모터 원리 알기'];
 titles.forEach((title,i)=>{const b=document.createElement('button');b.type='button';b.className='slide-sidebar-item';b.innerHTML='<span class="sidebar-page-no">'+(i+1)+'</span><span>'+title+'</span>';b.addEventListener('click',()=>{if(i===0)intro=0;if(i===2&&step4<basic.length){step4=0;pin4=0;result4=0}if(i===3){step5=0;detail=1;pin5=0;result5=0}showPage(i)});q('#slideSidebarList').append(b)});
 window.hardwareLessonAdapter={resume:showPage};window.infoMotorController={showPage};
 window.addEventListener('load',()=>{window.hardwareConnect.open=()=>{showPage(1);window.hardwareConnect.before(1,2,showPage)};paint()});
 window.addEventListener('resize',()=>requestAnimationFrame(fitCode));document.addEventListener('fullscreenchange',()=>requestAnimationFrame(fitCode));
 window.addEventListener('pagehide',()=>{closeResults();stopPrinciple()});showPage(0);
window.deviceConcept=new DeviceConcept({root:slides[0],openPopup:key=>showIntro(key==='operation'?1:3),closePopup:closePopup,operationTriggers:'#servoPrincipleTrigger,[data-motor-pins] img',pinTriggers:'[data-motor-pins],.motor-module figcaption',onNext:()=>showPage(1)});
})();
