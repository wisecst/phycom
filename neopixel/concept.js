/* Neopixel concept and adapters to canonical page/Entry/setup/hardware APIs. */
(()=>{'use strict';
const ids=['concept','circuit','basic','scene-setup','setup','rotation'],titles=['개념 및 동작 원리','회로 연결','기본코드','빙글빙글 돌아가는 불빛 · 장면·오브젝트 추가','빙글빙글 돌아가는 불빛 · LED번호 변수 추가','빙글빙글 돌아가는 불빛 · 코드 작성'],pages=ids.map(id=>document.getElementById(id)),list=document.getElementById('slideSidebarList'),controllers=NeoPixelCode.controllers;
let page=0;
ids.forEach((id,index)=>{const button=document.createElement('button');button.className='slide-sidebar-item';button.dataset.pageTarget=id;const number=document.createElement('span');number.className='sidebar-page-no';const title=document.createElement('span');title.textContent=titles[index];button.append(number,title);button.onclick=()=>show(index);list.append(button);});
const rgbOperation=NeoPixelSimulation.operation();
const concept=new DeviceConcept({root:pages[0],pins:document.getElementById('neoPinRoles'),operation:rgbOperation,onNext:()=>show(1)});
// Only the operation popup consumes its RGB steps; DeviceConcept retains page and popup navigation.
for(const [method,direction]of [['next',1],['prev',-1]]){const proceed=concept[method].bind(concept);concept[method]=()=>{if(concept.execution.key==='operation'&&rgbOperation.advance(direction))return;proceed();};}
DeviceConcept.heading(pages[1],{name:'네오픽셀',type:'출력장치',page:84,subtitle:'회로 연결'});
const projectState={scene:1,variables:{}};
const sceneSetup=EntryCodingSetup.mount({root:pages[3],kind:'neopixel-scene',title:'빙글빙글 돌아가는 불빛 · 장면·오브젝트 추가',start:{mode:'continue',addScene:true,scene:2},initialScripts:()=>controllers.basic.states.at(-1).scripts,search:'엔트리봇',defaultId:1,variable:'LED번호',slider:false,projectState,
 options:[{id:1,name:'엔트리봇',image:'entrybot.png',width:200,height:250,crop:'0 0 200 250'}],
 onRender({root}){root.querySelector('#ledProperty').hidden=true;},
 onNext:()=>show(4),onPrevious:()=>show(2)
});
const setup=EntryCodingSetup.mount({root:pages[4],kind:'neopixel-variable',title:'빙글빙글 돌아가는 불빛 · LED번호 변수 추가',settingsOnly:true,start:{mode:'continue',addScene:false,scene:2,split:false},search:'엔트리봇',defaultId:1,variable:'LED번호',variables:['LED번호'],slider:false,projectState,
 options:[{id:1,name:'엔트리봇',image:'entrybot.png',width:200,height:250,crop:'0 0 200 250'}],
 objectProperties:[{id:1,image:'../assets/entrybot.png',width:200,model:{name:'엔트리봇',x:0,y:0,size:100,direction:90},fields:[]}],
 onRender({root}){root.querySelector('#sceneAdd').disabled=true;},
 onNext:()=>show(5),onPrevious:()=>show(3,true)
});
function show(index,last=false){
 if(!pages[index])return;Object.values(controllers).forEach(c=>c.stop());concept.close();page=index;
 pages.forEach((p,i)=>p.classList.toggle('active',i===index));document.body.classList.toggle('entry-page',index>=2);document.body.classList.toggle('after-intro',index>0);
 [...list.children].forEach(b=>b.classList.toggle('active',b.dataset.pageTarget===ids[index]));lessonPages.refresh();
 document.getElementById('prev').disabled=index===0&&concept.phase===0;document.getElementById('next').disabled=index===5&&controllers.rotation.index===controllers.rotation.states.length-1;
 if(index===0)concept.render();if(index===1)requestAnimationFrame(()=>lessonCircuit.refresh());if(index===4)setup.enter(last);
 if(index===3){sceneSetup.enter(last);if(last)while(sceneSetup.step>5)sceneSetup.prev();}
 if(index===2||index===5)requestAnimationFrame(()=>controllers[ids[index]].render());
}
function move(direction){
 if(page===0)return;
 if(page===1){const step=lessonCircuit.getStep();if(direction>0&&step<3){lessonCircuit.next();return;}if(direction<0&&step>0){lessonCircuit.prev();return;}}
 if(page===3){
  if(direction>0&&sceneSetup.step===5){show(4);return;}
  // Restore the common chooser confirmation before undoing object addition.
  if(direction<0&&sceneSetup.step===5){sceneSetup.prev();sceneSetup.next();return;}
  if(direction>0)sceneSetup.next();
  else{const step=sceneSetup.step;sceneSetup.prev();if(step===3&&sceneSetup.step===2)sceneSetup.prev();}
  return;
 }
 if(page===4){direction>0?setup.next():setup.prev();return;}
 const controller=controllers[ids[page]];
 if(controller){
  if(direction>0&&controller.execution.key==='common-pin13'){controller.stop();return;}
  if(direction>0&&controller.index<controller.states.length-1)controller.next();
  else if(direction<0&&controller.index>0)controller.prev();
  else if(direction>0&&page===2){show(3);return;}
  else if(direction<0){if(page===2&&hardwareConnect.before(2,1,show))return;show(page-1,true);return;}
  document.getElementById('next').disabled=page===5&&controller.index===controller.states.length-1;return;
 }
 const target=page+direction;if(window.hardwareConnect?.before(page,target,show))return;show(target);
}
document.getElementById('next').onclick=()=>move(1);document.getElementById('prev').onclick=()=>move(-1);document.getElementById('fullscreenBtn').onclick=()=>lessonStage.toggleFullscreen();
document.addEventListener('keydown',event=>{const direction=lessonUI.direction(event);if(page!==0&&direction){event.preventDefault();move(direction);}});
window.hardwareLessonAdapter={resume:show};
document.addEventListener('DOMContentLoaded',()=>{const hardware=document.querySelector('.hardware-connect-slide');hardware.id='hardware-connect';const button=list.children[2];button.dataset.pageTarget=hardware.id;lessonPages.refresh();},{once:true});
window.addEventListener('pagehide',()=>{Object.values(controllers).forEach(c=>c.stop());concept.close();});show(0);
})();
