(()=>{
const steps=[
 {tab:'start',title:'시작하기 버튼을 클릭했을 때',text:'시작 탭에서 가져옵니다.'},
 {tab:'hardware',title:'디지털 13번 핀 켜기',text:'하드웨어 탭에서 가져옵니다.'},
 {tab:'flow',title:'계속 반복하기',text:'흐름 탭에서 가져옵니다.'},
 {tab:'hardware',title:'디지털 3번 핀 켜기',text:'하드웨어 탭에서 가져옵니다.'},
 {tab:'flow',title:'0.2초 기다리기',text:'흐름 탭에서 가져옵니다.'},
 {tab:'hardware',title:'디지털 3번 핀 끄기',text:'하드웨어 탭에서 가져옵니다.'},
 {tab:'flow',title:'0.2초 기다리기',text:'흐름 탭에서 가져옵니다.'},
 {tab:'hardware',title:'디지털 3번 핀을 255로 정하기',text:'같은 동작을 PWM 값으로 바꾸어 봅니다.'},
 {tab:'flow',title:'0.2초 기다리기',text:'흐름 탭에서 가져옵니다.'},
 {tab:'hardware',title:'디지털 3번 핀을 0으로 정하기',text:'하드웨어 탭에서 가져옵니다.'},
 {tab:'flow',title:'0.2초 기다리기',text:'흐름 탭에서 가져옵니다.'}
];
let step=0, phase='build', pin13Done=false, timer=null, activeButton=null, autoResult=null, savePending=null, guidedResult=false;
const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
function closeSaveMenu(){
  const wrap=q('.slide.active .entry-save-wrap')||q('.entry-save-wrap');
  const menu=wrap?.querySelector('.entry-save-menu');
  menu?.classList.remove('show'); menu?.setAttribute('aria-hidden','true');
  wrap?.classList.remove('save-focus');
  menu?.querySelector('.entry-save-item')?.classList.remove('save-click');
 }
 function openSaveMenu(){
  const wrap=q('.slide.active .entry-save-wrap')||q('.entry-save-wrap');
  const menu=wrap?.querySelector('.entry-save-menu');
  const item=menu?.querySelector('.entry-save-item');
  if(!wrap||!menu||!item)return;
  wrap.classList.add('save-focus'); menu.classList.add('show'); menu.setAttribute('aria-hidden','false');
  item.classList.add('save-click');
 }
 function closeResults(){
 closeSaveMenu();
 guidedResult=false;
 q('.entry-program')?.classList.remove('result-running');
 autoResult=null;
 if(timer){clearInterval(timer);timer=null}
 q('#pin13Modal')?.classList.remove('show'); q('#pin13Modal')?.setAttribute('aria-hidden','true');
 q('#entryLedTestModal')?.classList.remove('show'); q('#entryLedTestModal')?.setAttribute('aria-hidden','true');
 q('#entryFinalResult')?.classList.remove('show'); q('#entryFinalResult')?.setAttribute('aria-hidden','true');
 qa('.entry-block-run-btn.running').forEach(b=>{b.classList.remove('running');b.textContent='▶'});
 if(activeButton&&activeButton.id==='runLoop')activeButton.textContent='▶';
 if(activeButton&&activeButton.id==='runPin13')activeButton.textContent='▶';
 activeButton=null;
}
function ledResult(mode,button=null,guided=false){
 closeResults(); guidedResult=guided; activeButton=button;
 const program=q('.entry-program'); if(program)program.classList.toggle('result-running',mode==='blink');
 if(button){button.classList.add('running');button.textContent='■'}
 const m=q('#entryLedTestModal'),t=q('#entryLedTestText'),l=m?.querySelector('.entry-led-test-light');
 const paint=on=>{l?.classList.toggle('off',!on);if(t)t.textContent=on?'LED가 켜졌습니다.':'LED가 꺼졌습니다.';m?.classList.add('show');m?.setAttribute('aria-hidden','false')};
 if(mode==='blink'){let on=true;paint(on);timer=setInterval(()=>{on=!on;paint(on)},200)}else paint(mode==='on'); if(guided)openSaveMenu();
}
function render(){
 qa('[data-entry-step]').forEach(el=>{const n=+el.dataset.entryStep;el.classList.toggle('entry-show',n<=step);el.classList.toggle('entry-current',n===step&&step>0)});
 qa('[data-repeat-body]').forEach(el=>el.classList.toggle('repeat-show',step>=3));
 const compare=phase==='compare'||phase==='done';
 const cleared=phase==='cleared';
 q('#entryBasicFour')?.classList.toggle('compare-right',compare);
 q('#entryBasicFour')?.classList.toggle('entry-cleared',cleared);
 q('#entryBasicFour')?.classList.toggle('group-selected',cleared);
 q('#entryCompareFour')?.classList.toggle('compare-left',compare);
 qa('.entry-tab').forEach(el=>el.classList.remove('active-tab'));
 if(step){const info=steps[step-1];q('.entry-tab[data-tab="'+info.tab+'"]')?.classList.add('active-tab');if(q('#entryGuideTitle'))q('#entryGuideTitle').textContent=info.title;if(q('#entryGuideText'))q('#entryGuideText').textContent=info.text}
 else{if(q('#entryGuideTitle'))q('#entryGuideTitle').textContent='다음 블록을 눌러 시작하세요.';if(q('#entryGuideText'))q('#entryGuideText').textContent='블록이 추가될 때 왼쪽에서 해당 블록의 탭이 함께 강조됩니다.'}
 if(q('#back'))q('#back').disabled=step===0&&phase==='build';
 if(q('#forward'))q('#forward').disabled=false;
 if(q('#step'))q('#step').textContent=step+' / '+steps.length;
 if(q('#entryBlockCount'))q('#entryBlockCount').textContent=step;
}
function showPin13(){
 closeResults();const m=q('#pin13Modal'),b=q('#runPin13');m?.classList.add('show');m?.setAttribute('aria-hidden','false');if(b)b.textContent='■';activeButton=b;
}
function showSaveThen(action){
  closeResults();
  const wrap=q('.slide.active .entry-save-wrap')||q('.entry-save-wrap');
  const menu=wrap?.querySelector('.entry-save-menu');
  const item=menu?.querySelector('.entry-save-item');
  if(!wrap||!menu||!item){action();return}
  savePending=action;
  wrap.classList.add('save-focus');
  menu.classList.add('show'); menu.setAttribute('aria-hidden','false');
  setTimeout(()=>{item.classList.add('save-click')},350);
  setTimeout(()=>{
    item.classList.remove('save-click'); menu.classList.remove('show');
    menu.setAttribute('aria-hidden','true'); wrap.classList.remove('save-focus');
    const done=savePending; savePending=null; if(done)done();
  },850);
 }
 function next(){
 if(savePending)return;
 if(autoResult){
   const done=autoResult;
   closeResults();
   if(done==='on4'){step=5;render();return}
   if(done==='off6'){step=7;render();return}
   if(done==='on8'){step=9;render();return}
   if(done==='off10'){step=11;render();return}
 }
 closeResults();
 if(step===2&&!pin13Done){showPin13();pin13Done=true;return}
 if(step===4){const b=q('[data-entry-step="4"] .entry-block-run-btn');ledResult('on',b,true);autoResult='on4';return}
 if(step===6){const b=q('[data-entry-step="6"] .entry-block-run-btn');ledResult('off',b,true);autoResult='off6';return}
 if(step===7&&phase==='build'){ledResult('blink',q('#runLoop'),true);phase='blinked';return}
 if(step===7&&phase==='blinked'){closeResults();phase='cleared';render();return}
 if(step===7&&phase==='cleared'){phase='compare';step=8;render();return}
 if(step===8&&phase==='compare'){const b=q('[data-entry-step="8"] .entry-block-run-btn');ledResult('on',b,true);autoResult='on8';return}
 if(step===10&&phase==='compare'){const b=q('[data-entry-step="10"] .entry-block-run-btn');ledResult('off',b,true);autoResult='off10';return}
 if(step===11&&phase==='compare'){ledResult('blink',q('#runLoop'),true);phase='done';return}
 if(phase==='done'){closeResults();q('[data-entry-step="11"]')?.classList.remove('entry-current');phase='finished';render();return}
 if(phase==='finished'){return}
 step=Math.min(steps.length,step+1);render();
}
function prev(){
 closeResults();
 if(phase==='done'){phase='compare';return}
 if(phase==='cleared'){phase='blinked';render();return}
 if(phase==='blinked'){phase='build';render();return}
 if(phase==='compare'&&step===8){phase='build';step=7;render();return}
 step=Math.max(0,step-1);if(step<2)pin13Done=false;render();
}
function init(){
 render();
 q('#runPin13')?.addEventListener('click',e=>{e.stopPropagation();const was=activeButton===e.currentTarget;if(was)closeResults();else showPin13()});
 q('#runLoop')?.addEventListener('click',e=>{e.stopPropagation();const was=activeButton===e.currentTarget;if(was)closeResults();else{ledResult('blink',e.currentTarget)}});
 qa('.entry-block-run-btn').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const was=activeButton===b;if(was){closeResults();return}ledResult(b.dataset.ledState==='on'?'on':'off',b)}));
 q('#pin13Close')?.addEventListener('click',closeResults);
 q('#pin13Modal')?.addEventListener('click',e=>{if(e.target===q('#pin13Modal'))closeResults()});
}
function showCompleted(){
 closeResults();
 step=steps.length;
 phase='finished';
 pin13Done=true;
 render();
 q('#entryBasicFour')?.classList.add('compare-right');
 q('#entryBasicFour')?.classList.remove('entry-cleared','group-selected');
 q('#entryCompareFour')?.classList.add('compare-left');
 qa('.entry-block.entry-current').forEach(el=>el.classList.remove('entry-current'));
}
window.entryLesson={next,prev,getStep:()=>step,max:steps.length,render,closeResults,isFinished:()=>phase==='finished',showCompleted};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();