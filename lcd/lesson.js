// LCD lesson data and adapters for the shared concept, circuit and Entry UI.
(()=>{'use strict';
// Display order includes the one page inserted by the canonical hardware adapter.
const pageDefinitions=[
 {id:'concept',title:'LCD 개념'},
 {id:'circuit',title:'회로 연결'},
 {id:'hardware-connect',title:'하드웨어 연결',shared:true},
 {id:'basic',title:'기본코드'},
 {id:'setup',title:'사전 설정'},
 {id:'ai-code',title:'인공지능 코드 완성'}
];
const localPages=pageDefinitions.filter(definition=>!definition.shared);
const pages=localPages.map(definition=>document.getElementById(definition.id)),list=document.querySelector('#slideSidebarList');
let page=0;
for(const [index,{id,title}]of localPages.entries()){
 const button=document.createElement('button');button.className='slide-sidebar-item';button.dataset.pageTarget=id;button.innerHTML='<span class="sidebar-page-no"></span><span>'+title+'</span>';button.onclick=()=>show(index);list.append(button);
}
// hardware-connect.js runs after this file. Bind its existing page/menu once,
// without creating another hardware page or changing its original index contract.
document.addEventListener('DOMContentLoaded',()=>{
 const hardware=document.querySelector('.hardware-connect-slide');
 if(hardware)hardware.id='hardware-connect';
 pageDefinitions.forEach(({id,title},index)=>{
  const item=list.children[index];if(!item)return;
  item.dataset.pageTarget=id;item.lastElementChild.textContent=title;
 });
 lessonPages.refresh();
},{once:true});
const pinDialog=document.querySelector('#lcdPinRoles');
const animationRoot=document.querySelector('#lcdConceptAnimation').content.firstElementChild;
const animation=new LcdConceptAnimation(animationRoot,()=>Number(animationRoot.dataset.action||0));
const conceptExecution=new EntryEngine.Execution(pages[0],{operation:{
 policy:'continuous',view:()=>animationRoot,
 run({cleanup}){cleanup(()=>animation.stop());animation.sync();}
}});
animationRoot.querySelector('[data-play-all]').onclick=()=>{if(!conceptExecution.running)conceptExecution.start();animation.playAll();};
const concept=new DeviceConcept({root:pages[0],pins:pinDialog,onNext:()=>show(1),
 openPopup(key){if(key==='pins')pinDialog.show();else conceptExecution.open(key);},
 closePopup(){conceptExecution.close();if(pinDialog.open)pinDialog.close();}
});
const pinImage=pinDialog.querySelector('.pin-module-image'),pinImageFrame=document.createElement('div');
pinImageFrame.className='lcd-pin-image';pinImage.before(pinImageFrame);pinImageFrame.append(pinImage);
pinDialog.querySelector('.pin-title').textContent='LCD · 핀 연결 방법';
for(const [name,top]of [['GND',33],['VCC',43.5],['SDA',54],['SCL',64.5]]){
 const pinFocus=document.createElement('span');pinFocus.className='lcd-pin-focus';pinFocus.setAttribute('aria-hidden','true');pinFocus.style.top=top+'%';pinImageFrame.append(pinFocus);
 const card=[...pinDialog.querySelectorAll('.pin-role-card')].find(card=>card.querySelector('.pin-name').textContent===name);
 pinDialog.querySelector('.pin-role-list').append(card);
}
// Shared DeviceConcept owns reading, closing and page phases. Only popup detail steps are local.
const nextConcept=concept.next.bind(concept),previousConcept=concept.prev.bind(concept);
const operationPhase=concept.data.notes.length+2,pinsPhase=operationPhase+1;
concept.next=()=>{
 if(!concept.exploring){
  if(conceptExecution.key==='operation'&&Number(animationRoot.dataset.action)<animation.lastAction){animation.advance(1);return;}
  if(concept.phase===operationPhase-1)animationRoot.dataset.action=0;
 }
 nextConcept();
};
concept.prev=()=>{
 if(!concept.exploring){
  if(conceptExecution.key==='operation'&&Number(animationRoot.dataset.action)>0){animation.advance(-1);return;}
  if(concept.phase===pinsPhase)animationRoot.dataset.action=animation.lastAction;
 }
 previousConcept();
};
DeviceConcept.heading(pages[1],{name:'LCD',type:'출력장치',page:178,subtitle:'회로 연결'});
// Textbook p.178, “I2C LCD 모듈 작동 확인하기”. Controller expands this
// declarative code into direct build steps, including nested slots.
const E=EntryEngine,root=pages[2];
const scripts=[{id:'main',blocks:[...E.startBlocks(),
 {id:'lcd-init',type:'command',category:'hardware',parts:[{text:'I2C LCD사용하기'}]},
 {id:'lcd-hello',type:'command',category:'hardware',parts:[{text:'I2C LCD의'},{slot:{id:'row',value:{kind:'dropdown',value:'0'}}},{text:'번째 줄,'},{slot:{id:'column',value:{kind:'dropdown',value:'0'}}},{text:'번째 칸에'},{slot:{id:'message',value:{kind:'literal',value:'Hello World!'}}},{text:'출력하기'}]},
 {id:'lcd-physical',type:'command',category:'hardware',parts:[{text:'I2C LCD의'},{slot:{id:'row',value:{kind:'dropdown',value:'1'}}},{text:'번째 줄,'},{slot:{id:'column',value:{kind:'dropdown',value:'0'}}},{text:'번째 칸에'},{slot:{id:'message',value:{kind:'literal',value:'Physical Computing'}}},{text:'출력하기'}]},
 {id:'lcd-ask',type:'command',category:'data',parts:[{slot:{id:'question',value:{kind:'literal',value:'어떤 메시지를 출력할까요?'}}},{text:'을(를) 묻고 대답 기다리기'}]},
 {id:'lcd-clear',type:'command',category:'hardware',parts:[{text:'I2C LCD의 화면 모두 지우기'}]},
 {id:'lcd-answer',type:'command',category:'hardware',parts:[{text:'I2C LCD의'},{slot:{id:'row',value:{kind:'dropdown',value:'0'}}},{text:'번째 줄,'},{slot:{id:'column',value:{kind:'dropdown',value:'0'}}},{text:'번째 칸에'},{slot:{id:'message',value:{kind:'block',block:{id:'lcd-answer-value',type:'reporter',category:'data',parts:[{text:'대답'}]}}}},{text:'출력하기'}]},
 {id:'lcd-if',type:'c',category:'flow',parts:[{text:'만일'},{slot:{id:'condition',value:{kind:'block',block:{id:'lcd-longer',type:'boolean',category:'judge',parts:[{slot:{id:'left',value:{kind:'block',block:{id:'lcd-length',type:'reporter',category:'calculation',parts:[{slot:{id:'text',value:{kind:'block',block:{id:'lcd-length-answer',type:'reporter',category:'data',parts:[{text:'대답'}]}}}},{text:'의 글자 수'}]}}}},{text:'>'},{slot:{id:'right',value:{kind:'literal',value:16}}}]}}}},{text:'(이)라면'}],branches:[[
  {id:'lcd-second-line',type:'command',category:'hardware',parts:[{text:'I2C LCD의'},{slot:{id:'row',value:{kind:'dropdown',value:'1'}}},{text:'번째 줄,'},{slot:{id:'column',value:{kind:'dropdown',value:'0'}}},{text:'번째 칸에'},{slot:{id:'message',value:{kind:'block',block:{id:'lcd-substring',type:'reporter',category:'calculation',parts:[{slot:{id:'text',value:{kind:'block',block:{id:'lcd-substring-answer',type:'reporter',category:'data',parts:[{text:'대답'}]}}}},{text:'의'},{slot:{id:'start',value:{kind:'literal',value:17}}},{text:'번째 글자부터'},{slot:{id:'end',value:{kind:'block',block:{id:'lcd-substring-length',type:'reporter',category:'calculation',parts:[{slot:{id:'text',value:{kind:'block',block:{id:'lcd-substring-length-answer',type:'reporter',category:'data',parts:[{text:'대답'}]}}}},{text:'의 글자 수'}]}}}},{text:'번째 글자까지의 글자'}]}}}},{text:'출력하기'}]}
 ]]}
]}];
const lcdPreview=document.createElement('section');lcdPreview.className='lcd-code-preview';lcdPreview.hidden=true;
lcdPreview.setAttribute('aria-label','LCD 출력 화면');root.querySelector('.entry-stage').append(lcdPreview);
function paintLcd(host,first='',second=''){
 let panel=host.querySelector('.lcd-code-display');
 if(!panel){panel=document.createElement('div');panel.className='lcd-code-display';panel.setAttribute('aria-label','16자 × 2줄 LCD');for(let i=0;i<2;i++){const row=document.createElement('output');for(let j=0;j<16;j++)row.append(document.createElement('span'));panel.append(row);}const frame=document.createElement('div');frame.className='lcd-coordinate-frame';const columns=document.createElement('div'),rows=document.createElement('div');columns.className='lcd-column-numbers';columns.setAttribute('aria-label','열 번호');rows.className='lcd-row-numbers';rows.setAttribute('aria-label','행 번호');for(let i=0;i<16;i++){const label=document.createElement('span');label.textContent=i;columns.append(label);}for(let i=0;i<2;i++){const label=document.createElement('span');label.textContent=i;rows.append(label);}frame.append(columns,rows,panel);host.prepend(frame);}
 [...panel.children].forEach((row,index)=>{const text=Array.from(index?second:first);[...row.children].forEach((cell,column)=>cell.textContent=text[column]||' ');});
}
const basicBlocks=E.clone(scripts[0].blocks);
for(const block of basicBlocks)if(['lcd-hello','lcd-physical'].includes(block.id))block.run=block.id;
const basicStates=[...E.startStates()];
basicBlocks.slice(2).forEach((block,index)=>{
 const state={scripts:[{id:'main',blocks:basicBlocks.slice(0,index+3)}],guide:'교과서 178쪽 LCD 코드를 순서대로 작성합니다.'};basicStates.push(state);
 if(block.id==='lcd-hello'||block.id==='lcd-physical')basicStates.push({update:{id:block.id,run:block.id},progression:'exact',guide:block.id==='lcd-hello'?'LCD 첫 번째 줄에 Hello World!가 출력됩니다.':'한 줄은 16자입니다. Physical Computing의 마지막 ng는 두 번째 줄에 표시되지 않습니다.',lcdOutput:block.id==='lcd-hello'?'hello':'two-lines'});
});
const lcdFinalScripts=[{id:'main',blocks:E.clone(basicBlocks)}];lcdFinalScripts[0].blocks.at(-1).run='lcd-message';
basicStates.push({scripts:lcdFinalScripts,progression:'exact',result:'lcd-message',guide:'예시 문장이 자동 입력되어 LCD 두 줄에 출력되는 과정을 확인합니다.'});
let controller;
function lcdResult(def){let exampleIndex=0;return {
  preserveCode:true,placement:{top:0,right:16,width:'min(62%, 800px)'},policy:'repeat',repeatDelay:2400,
  view(){
   const view=document.createElement('section');view.className='lcd-output-result';paintLcd(view,def.row===1?'Hello World!':'');
   if(def.examples){const input=document.createElement('p');input.className='lcd-auto-input';input.textContent=def.inputLabel||'자동 입력: ';const value=document.createElement('output');value.dataset.lcdExample='';input.append(value);view.prepend(input);}
   const note=document.createElement('p');note.textContent='한 줄 16자 · 두 줄 32자';view.append(note);return view;
  },run({host,timeout,done}){
   const example=def.examples?def.examples[exampleIndex++%def.examples.length]:def.message;
   const message=Array.from(example.translation||example),source=Array.from(example.source||example),input=host.querySelector('[data-lcd-example]');
   const print=()=>{const visible=message.slice(0,def.examples?32:16);let count=0;
    const write=()=>{count++;const text=visible.slice(0,count).join('');paintLcd(host,def.row===1?'Hello World!':text.slice(0,16),def.row===1?text:def.examples?text.slice(16,32):'');if(count<visible.length)timeout(write,110);else done();};timeout(write,180);
   };
   if(input){let count=0;const type=()=>{input.textContent=source.slice(0,++count).join('');if(count<source.length)timeout(type,45);else timeout(print,400);};timeout(type,250);}else print();
  }
 };}
controller=new E.Controller({root,program:root.querySelector('.entry-program'),states:basicStates,writing:'direct',results:{
 'common-pin13':EntryPin13.result(()=>controller.execution),
 ...Object.fromEntries([
  {key:'lcd-hello',message:'Hello World!',row:0},
  {key:'lcd-physical',message:'Physical Computing',row:1},
  {key:'lcd-message',examples:['Hello everyone! Welcome to LCD.','Physical Computing is fun!','123456789012345678901234567890123456']}
 ].map(def=>[def.key,lcdResult(def)]))
},assetBase:'../assets/'});
root.querySelector('.entry-program').addEventListener('entry:state',()=>{
 const state=controller.states[controller.index],blocks=state.scripts[0].blocks;
 lcdPreview.hidden=!blocks.some(block=>block.id==='lcd-init')||!!state.result;
 const hello=controller.states.slice(0,controller.index+1).some(item=>item.lcdOutput==='hello');
 const twoLines=controller.states.slice(0,controller.index+1).some(item=>item.lcdOutput==='two-lines');
 paintLcd(lcdPreview,hello?'Hello World!':'',twoLines?'Physical Computing':'');
 controller.fit();
});
const bar=new E.ObjectBar({root,objects:[{id:'entrybot',name:'엔트리봇',image:'../assets/entrybot.png'}],book:'교과서 178쪽'});
bar.update('entrybot',new Set(['entrybot']));controller.guide=bar.guide;
// Entry's existing teacher asset, reused without drawing a substitute:
// entrylabs/entry-offline, uploads/7b/a2/image/7ba2af983ce153dc977f8b904fc3bac6.png
const projectState={scene:1,variables:{},aiLoaded:false};
const aiImport=document.querySelector('#lcdAiImport').content.firstElementChild;
const setupDataTabs=new E.Tabs(aiImport.querySelector('[data-ai-data]'),'../assets/');
const aiCaptions=['인공지능 블록 불러오기를 선택합니다.','번역을 선택합니다.','읽어주기를 선택합니다.','선택한 인공지능 블록을 불러옵니다.','불러오기 완료 · 설정창을 닫습니다.','자료 → 변수 만들기로 진행합니다.'];
const setup=EntryCodingSetup.mount({
 root:pages[3],kind:'lcd',title:'LCD · 사전 설정',search:'선생님',searchTip:'선생님을 검색합니다.',defaultId:1,variable:'번역문장',variables:['번역문장'],slider:false,
 start:{mode:'continue',scene:2,addScene:true,split:false},initialScripts:()=>scripts,projectState,
 options:[
  {id:1,name:'선생님',icon:'<img class="entry-led-icon" src="assets/teacher.png" alt="선생님">'}
 ],
 objectProperties:[
  {id:1,image:'assets/teacher.png',width:380,height:380,fields:[],propertySteps:[],initial:{x:100,y:0,size:100,direction:90},model:{name:'선생님',x:100,y:0,size:100,direction:90}}
 ],
 extraSteps:aiCaptions.map((caption,index)=>({tab:'블록',caption,render(ui){
  ui.content.previousElementSibling.textContent='인공지능 블록';ui.content.append(aiImport);
  const dialog=aiImport.querySelector('[data-ai-dialog]');dialog.hidden=index===0||index===5;
  aiImport.querySelector('[data-ai-open]').hidden=index!==0;aiImport.querySelector('[data-ai-summary]').hidden=index!==5;
  aiImport.querySelector('[data-ai-data]').hidden=index!==5;if(index===5)setupDataTabs.render(['data'],'data');
  const translation=aiImport.querySelector('[data-ai-translation]'),speech=aiImport.querySelector('[data-ai-speech]');
  translation.checked=index>=2;speech.checked=index>=3;translation.disabled=index!==1;speech.disabled=index!==2;
  aiImport.querySelector('[data-ai-load]').disabled=index!==3;aiImport.querySelector('[data-ai-load]').textContent=index>=4?'불러오기 완료':'불러오기';
  aiImport.querySelector('[data-ai-close]').disabled=index!==4;projectState.aiLoaded=index>=4;
 }})),
 reset(last){projectState.aiLoaded=last;},
 onRender({root,step,added}){
  // Scene 1 retains its code; the newly added scene starts without Entrybot.
  root.querySelector('.entry-setup-bot').hidden=step>0;root.querySelector('.entry-setup-bot-object').hidden=step>0;
  if(added){root.querySelector('[data-setup-object]')?.click();root.querySelector('#ledProperty .entry-property-grid').hidden=true;}
 },
 onNext:()=>show(4),onPrevious:()=>show(2)
});
for(const control of aiImport.querySelectorAll('button,input'))control.onclick=()=>{setup.next();};
// Complete teacher code from the supplied image; unchanged LCD commands reuse
// the textbook data. These are final scripts, not a second block-building flow.
const aiScripts=E.clone(scripts);
aiScripts[0].id='ai-main';aiScripts[0].blocks=aiScripts[0].blocks.filter(block=>block.id!=='common-pin13');
E.walk(aiScripts,block=>{
 block.id='ai-'+block.id;delete block.run;
 if(block.type==='reporter'&&block.category==='data'&&block.parts.length===1&&block.parts[0].text==='대답'){
  block.parts=[{slot:{id:'variable',value:{kind:'dropdown',value:'번역문장'}}},{text:'값'}];
 }
});
aiScripts[0].blocks.find(block=>block.id==='ai-lcd-hello').parts.find(part=>part.slot?.id==='message').slot.value.value='Hello everyone';
aiScripts[0].blocks.find(block=>block.id==='ai-lcd-physical').parts.find(part=>part.slot?.id==='message').slot.value.value='Enter the sentence!';
aiScripts[0].blocks.find(block=>block.id==='ai-lcd-ask').parts[0].slot.value.value='번역할 문장을 입력하세요.';
aiScripts[0].blocks.splice(aiScripts[0].blocks.findIndex(block=>block.id==='ai-lcd-clear'),0,
 {id:'ai-set-translation',type:'command',category:'data',parts:[{slot:{id:'variable',value:{kind:'dropdown',value:'번역문장'}}},{text:'을(를)'},{slot:{id:'value',value:{kind:'block',block:{id:'ai-translate',type:'reporter',category:'ai',parts:[{slot:{id:'source',value:{kind:'dropdown',value:'한국어'}}},{slot:{id:'text',value:{kind:'block',block:{id:'ai-translation-answer',type:'reporter',category:'data',parts:[{text:'대답'}]}}}},{text:'을(를)'},{slot:{id:'target',value:{kind:'dropdown',value:'영어'}}},{text:'(으)로 번역한 값'}]}}}},{text:'(으)로 정하기'}]},
 {id:'ai-speak',type:'command',category:'ai',parts:[{slot:{id:'text',value:{kind:'block',block:{id:'ai-read-value',type:'reporter',category:'data',parts:[{slot:{id:'variable',value:{kind:'dropdown',value:'번역문장'}}},{text:'값'}]}}}},{text:'읽어주기'}]}
);
E.categories.ai={order:12,label:'인공지능',asset:'tab12_ai',color:'#8b1aff'};
// Page 6 starts from page 4 and changes only the differences in the AI image.
// Common blockStages/update/render provide the nested edits and keep block IDs.
const aiBaseline=E.clone(scripts);aiBaseline[0].id='ai-main';
E.walk(aiBaseline,block=>{block.id='ai-'+block.id;delete block.run;});
const [aiStart,,aiInit,oldHello,oldSentence,oldQuestion,aiClear,oldOutput,oldCondition]=aiBaseline[0].blocks;
const [,,aiHello,newSentence,newQuestion,aiSet,aiSpeak]=aiScripts[0].blocks;
const aiPrefix=[aiStart,aiInit,aiHello,newSentence,newQuestion];
const translationSteps=E.blockStages(aiSet).slice(1),speechSteps=E.blockStages(aiSpeak).slice(1);
const variableParts=aiScripts[0].blocks.find(block=>block.id==='ai-lcd-answer').parts.find(part=>part.slot?.id==='message').slot.value.block.parts;
const aiStates=[
 {scripts:aiBaseline,progression:'exact',guide:'4페이지 기본코드에서 바뀌는 부분을 수정합니다.'},
 {scripts:[{id:'ai-main',blocks:[aiStart,aiInit,oldHello,oldSentence,oldQuestion,aiClear,oldOutput,oldCondition]}],progression:'exact',tab:'hardware',guide:'디지털 13번 핀 블록을 제거합니다.'},
 {update:{id:aiHello.id,parts:aiHello.parts},progression:'exact',current:aiHello.id,guide:'첫 번째 줄의 문구를 Hello everyone으로 바꿉니다.'},
 {update:{id:newSentence.id,parts:newSentence.parts},progression:'exact',current:newSentence.id,guide:'두 번째 줄의 안내를 Enter the sentence!로 바꿉니다.'},
 {update:{id:newQuestion.id,parts:newQuestion.parts},progression:'exact',current:newQuestion.id,guide:'질문을 번역할 문장을 입력하세요.로 바꿉니다.'},
 {scripts:[{id:'ai-main',blocks:[...aiPrefix,translationSteps[0].node,aiClear,oldOutput,oldCondition]}],progression:'exact',current:translationSteps[0].current,guide:'번역문장을 정하는 블록을 추가합니다.'},
 ...translationSteps.slice(1).map(step=>({update:step.node,progression:'exact',current:step.current,guide:'한국어 대답을 영어로 번역한 값을 결합합니다.'})),
 {scripts:[{id:'ai-main',blocks:[...aiPrefix,aiSet,speechSteps[0].node,aiClear,oldOutput,oldCondition]}],progression:'exact',current:speechSteps[0].current,guide:'읽어주기 블록을 추가합니다.'},
 ...speechSteps.slice(1).map(step=>({update:step.node,progression:'exact',current:step.current,guide:'번역문장 값을 읽어주기에 결합합니다.'})),
 ...['ai-lcd-answer-value','ai-lcd-length-answer','ai-lcd-substring-answer','ai-lcd-substring-length-answer'].map(id=>({update:{id,parts:variableParts},progression:'exact',current:id,guide:'대답 대신 번역문장 값을 사용하도록 바꿉니다.'}))
];
aiStates.push({update:{id:oldCondition.id,run:'lcd-translation'},progression:'exact',result:'lcd-translation',guide:'한글 예시문을 입력하고 영어 번역문을 LCD에 출력합니다.'});
const aiRoot=pages[4];
const aiController=new E.Controller({root:aiRoot,program:aiRoot.querySelector('.entry-program'),states:aiStates,writing:'direct',results:{'lcd-translation':lcdResult({inputLabel:'한글 입력: ',examples:[
 {source:'안녕하세요 여러분! LCD에 오신 것을 환영합니다.',translation:'Hello everyone! Welcome to LCD.'},
 {source:'피지컬 컴퓨팅은 재미있어요!',translation:'Physical Computing is fun!'},
 {source:'오늘은 멋진 날입니다.',translation:'Today is a wonderful day.'}
]})},assetBase:'../assets/',layout:{fit:true,maxScale:.85}});
aiRoot.querySelector('.entry-program').addEventListener('entry:state',()=>aiController.fit());
const aiObjects=[{id:'teacher',name:'선생님',image:'assets/teacher.png'}];
const aiBar=new E.ObjectBar({root:aiRoot,objects:aiObjects,book:'인공지능 코드 완성',select(id){aiBar.update(id,new Set(aiObjects.map(o=>o.id)));}});
aiController.guide=aiBar.guide;aiBar.update('teacher',new Set(aiObjects.map(o=>o.id)));
function show(index,last=false){
 if(!pages[index])return;
 controller.stop();aiController.stop();page=index;pages.forEach((slide,i)=>slide.classList.toggle('active',i===index));
 document.body.classList.toggle('entry-page',index>=2);document.body.classList.toggle('after-intro',index>0);
 [...list.children].forEach(button=>button.classList.toggle('active',button.dataset.pageTarget===pages[index].id));
 lessonPages.refresh();document.querySelector('#slides').textContent=lessonPages.counter(pages[index]);
 document.querySelector('#prev').disabled=index===0&&concept.phase===0;document.querySelector('#next').disabled=index===pages.length-1&&aiController.index===aiController.states.length-1;
 if(index===0)concept.render();else concept.close();
 if(index===1)requestAnimationFrame(()=>lessonCircuit.refresh());
 if(index===2)requestAnimationFrame(()=>controller.render());
 if(index===3)setup.enter(last);
 if(index===4)requestAnimationFrame(()=>aiController.render());
}
function move(direction){
 if(page===0)return;
 if(page===1){
  const step=lessonCircuit.getStep();
  if(direction>0&&step<4){lessonCircuit.next();return;}
  if(direction<0&&step>0){lessonCircuit.prev();return;}
 }
 if(page===3){
  if(direction>0)setup.next();
  else{
   const step=setup.step;setup.prev();
   // Match the shared chooser's forward search/confirmation checkpoints.
   if(step===5&&setup.step===4)setup.next();
   else if(step===3&&setup.step===2)setup.prev();
  }
  return;
 }
 if(page===4){
  if(direction>0)aiController.next();
  else if(aiController.index>0)aiController.prev();
  else{show(3,true);return;}
  document.querySelector('#next').disabled=aiController.index===aiController.states.length-1;return;
 }
 if(page===2){
  if(direction>0&&controller.index===controller.states.length-1){show(3);return;}
  if(direction>0)controller.next();
  else if(controller.index>0){controller.prev();}
  else{if(window.hardwareConnect?.before(page,1,show))return;show(1);return;}
  document.querySelector('#next').disabled=false;return;
 }
 const target=page+direction;if(target<0||target>=pages.length)return;
 if(window.hardwareConnect?.before(page,target,show))return;show(target);
}
document.querySelector('#next').onclick=()=>move(1);document.querySelector('#prev').onclick=()=>move(-1);
document.querySelector('#fullscreenBtn').onclick=()=>lessonStage.toggleFullscreen();
document.addEventListener('keydown',event=>{if(event.target.matches('input,textarea,select')||event.target.isContentEditable)return;const direction=lessonUI.direction(event);if(page!==0&&direction){event.preventDefault();move(direction);}});
window.hardwareLessonAdapter={resume:show};window.addEventListener('pagehide',()=>{controller.stop();aiController.stop();concept.close();});show(0);
})();
