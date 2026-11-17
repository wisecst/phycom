/* RGB page data and adapters only; shared concept, hardware, Stage and Controllers own UI. */
(()=>{'use strict';
const ids=['concept','circuit','basic','setup','mix'],titles=['개념 및 활용','회로 연결','기본코드','코딩 전 설정','가산 혼합 탐구'],pages=ids.map(id=>document.getElementById(id)),list=document.getElementById('slideSidebarList'),controllers=RgbLedCode.controllers;let page=0;
ids.forEach((id,index)=>{const button=document.createElement('button');button.className='slide-sidebar-item';button.dataset.pageTarget=id;const number=document.createElement('span');number.className='sidebar-page-no';const title=document.createElement('span');title.textContent=titles[index];button.append(number,title);button.onclick=()=>show(index);list.append(button);});
// This common-cathode module has one common ground pin, not a separate power pin.
document.querySelector('#rgbPinRoles .pin-power')?.remove();
const concept=new DeviceConcept({root:pages[0],pins:document.getElementById('rgbPinRoles'),operation:RgbLedSimulation.result('concept'),onNext:()=>show(1)});
// Keep the textbook wording; distinguish the correction and lesson-only note.
const reading=concept.reading,article=reading.querySelector('article'),typo=[...article.querySelectorAll('mark')].find(mark=>mark.textContent.includes('공통 애소드'));
if(typo){
 const original=typo.textContent,anchor=document.createElement('span');anchor.className='rgb-typo-anchor';const word=document.createElement('span');word.className='rgb-typo-word';word.textContent='공통 애소드';anchor.append(word);
 const bubble=document.createElement('span');bubble.className='diode-bubble rgb-textbook-correction';bubble.setAttribute('role','note');bubble.hidden=true;bubble.textContent='오타수정 : 공통 애소드 → 공통 애노드(Anode)';anchor.append(bubble);
 typo.replaceChildren(anchor,document.createTextNode(original.slice('공통 애소드'.length)));
 const highlight=concept.highlight.bind(concept);concept.highlight=index=>{highlight(index);const revealed=index>=Number(typo.dataset.key);anchor.classList.toggle('revealed',revealed);bubble.hidden=!revealed;if(anchor.classList.contains('revealed'))bubble.style.setProperty('--rgb-arrow-x',anchor.offsetWidth/2+'px');};
}
const connectionNote=document.createElement('aside');connectionNote.className='card rgb-connection-note';connectionNote.setAttribute('aria-label','수업 보조설명');
connectionNote.innerHTML='<h3>알아두기 | RGB LED의 연결 방식</h3><table class="rgb-connection-table" aria-label="RGB LED 연결 방식 비교"><colgroup><col style="width:var(--rgb-label-column)"><col><col></colgroup><thead><tr><th scope="col">비교 항목</th><th scope="col">공통 애노드<small>Common Anode</small></th><th scope="col">공통 캐소드<small>Common Cathode</small></th></tr></thead><tbody><tr><th scope="row">공통 핀 연결</th><td><b>전원(+)</b>에 연결</td><td><b>GND(-)</b>에 연결</td></tr><tr><th scope="row">밝아지는 조건</th><td>출력값이 <b>작을수록</b></td><td>출력값이 <b>클수록</b></td></tr></tbody></table><strong>이 수업에서는 공통 캐소드(Common Cathode) 방식의 RGB LED를 사용합니다.</strong>';
article.append(connectionNote);
// Two additional reading actions reuse DeviceConcept's existing next/previous state machine.
concept.data.notes.push('','');concept.data.noteDisplay.push(false,false);
const highlightReading=concept.highlight.bind(concept);
concept.highlight=index=>{
 highlightReading(index);connectionNote.hidden=index<4;
 connectionNote.querySelector('table').classList.toggle('rgb-lesson-focus',index===5);
 if(index>=4)requestAnimationFrame(()=>{if(reading.hidden||concept.readIndex!==index)return;const grid=reading.querySelector('.device-concept-reading-grid');grid.scrollTo({top:grid.scrollHeight,behavior:'smooth'});});
};
concept.highlight(0);

DeviceConcept.heading(pages[1],{name:'RGB LED',type:'출력장치',page:177,subtitle:'회로 연결'});
const projectState={scene:1,variables:{}};
const setup=EntryCodingSetup.mount({root:pages[3],kind:'rgb-led-variables',search:'엔트리봇',defaultId:1,title:'RGB LED · 코딩 전 설정',settingsOnly:true,start:{mode:'continue',addScene:false,scene:1,split:false},variable:'빨강',variables:['빨강','초록','파랑'],slider:false,projectState,
 initialScripts:()=>controllers.basic.states.at(-1).scripts,
 options:[{id:1,name:'엔트리봇',image:'entrybot.png',width:200,height:250,crop:'0 0 200 250'}],
 objectProperties:[{id:1,image:'../assets/entrybot.png',width:200,model:{name:'엔트리봇',x:0,y:0,size:100,direction:90},fields:[]}],
 onRender({root}){
  const original=root.querySelector('#stageVariable'),names=['빨강','초록','파랑'];let top=28;
  names.forEach((name,index)=>{
   let monitor=index===0?original:root.querySelector('[data-rgb-variable="'+name+'"]');
   if(!monitor){monitor=original.cloneNode(true);monitor.removeAttribute('id');monitor.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));monitor.querySelector('input')?.remove();original.parentElement.append(monitor);}
   monitor.dataset.rgbVariable=name;monitor.hidden=!Object.hasOwn(projectState.variables,name);
   monitor.querySelector('span').textContent=name;monitor.querySelector('b').textContent=projectState.variables[name]??0;
   if(index)monitor.style.top=top+'px';if(!monitor.hidden)top+=monitor.offsetHeight+8;
  });
 },
 onNext:()=>show(4),onPrevious:()=>show(2)
});
function show(index,last=false){
 if(!pages[index])return;Object.values(controllers).forEach(c=>c.stop());concept.close();page=index;
 pages.forEach((p,i)=>p.classList.toggle('active',i===index));document.body.classList.toggle('entry-page',index>=2);document.body.classList.toggle('after-intro',index>0);
 [...list.children].forEach(b=>b.classList.toggle('active',b.dataset.pageTarget===ids[index]));lessonPages.refresh();
 document.getElementById('prev').disabled=index===0&&concept.phase===0;document.getElementById('next').disabled=index===ids.length-1&&controllers.mix.index===controllers.mix.states.length-1;
 if(index===0)concept.render();if(index===1)requestAnimationFrame(()=>lessonCircuit.refresh());if(index===3)setup.enter(last);const controller=controllers[ids[index]];if(controller)requestAnimationFrame(()=>controller.render());
}
function move(direction){
 if(page===0)return;
 if(page===3){direction>0?setup.next():setup.prev();return;}
 if(page===1){const step=lessonCircuit.getStep();if(direction>0&&step<4){lessonCircuit.next();return;}if(direction<0&&step>0){lessonCircuit.prev();return;}}
 const controller=controllers[ids[page]];
 if(controller){
  if(direction>0&&controller.execution.key==='common-pin13'){controller.stop();return;}
  if(direction>0&&controller.index<controller.states.length-1)controller.next();
  else if(direction<0&&controller.index>0)controller.prev();
  else if(direction>0&&page===2){show(3);return;}
  else if(direction<0){if(hardwareConnect.before(page,page-1,show))return;show(page-1,true);return;}
  document.getElementById('next').disabled=page===ids.length-1&&controller.index===controller.states.length-1;return;
 }
 const target=page+direction;if(window.hardwareConnect?.before(page,target,show))return;show(target);
}
document.getElementById('next').onclick=()=>move(1);document.getElementById('prev').onclick=()=>move(-1);document.getElementById('fullscreenBtn').onclick=()=>lessonStage.toggleFullscreen();
document.addEventListener('keydown',event=>{const direction=lessonUI.direction(event);if(page!==0&&direction){event.preventDefault();move(direction);}});
window.hardwareLessonAdapter={resume:show};
document.addEventListener('DOMContentLoaded',()=>{const hardware=document.querySelector('.hardware-connect-slide');hardware.id='hardware-connect';list.children[2].dataset.pageTarget=hardware.id;lessonPages.refresh();},{once:true});
window.addEventListener('pagehide',()=>{Object.values(controllers).forEach(c=>c.stop());concept.close();});show(0);
})();
