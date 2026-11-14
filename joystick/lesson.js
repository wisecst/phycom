(()=>{'use strict';
const E=EntryEngine,q=s=>document.querySelector(s),pages=[...document.querySelectorAll('main.wrap>.slide')],controllers=new Map(),ran=new Set();let page=0,circuit=0,setupActive=false,variablesActive=false,setup;
// The top physical switch terminal is S-K; keep the existing physical pin coordinate.
lessonCircuitConfig.module.pins.find(pin=>pin.name==='OUT').name='K';
lessonCircuitConfig.connections.find(wire=>wire.from==='OUT'&&wire.to==='D7').from='K';
q('#circuit .explanation-context').textContent='D7 ← K · A1 ← Y · A0 ← X · 5V ← VCC · GND ← GND';
const objects=[
 {id:1,name:'웃는 하얀 꽃',asset:'white-flower',x:-216,y:110,size:45,width:50,height:48},
 {id:2,name:'나팔꽃',asset:'morning-glory',x:220,y:105,size:50,width:53,height:55},
 {id:3,name:'잔디조각',asset:'grass',x:-215,y:-110,size:40,width:54,height:49},
 {id:4,name:'장미',asset:'rose',x:215,y:-105,size:40,width:47,height:51},
 {id:5,name:'커서(1)',asset:'cursor',x:0,y:0,size:20,width:45,height:47,bookX:'-',bookY:'-'},
 {id:6,name:'흙',asset:'soil',x:0,y:0,size:300,width:120,height:120*50/85}
];
const t=text=>({text}),v=(id,value,kind=typeof value==='number'?'number':'string')=>({slot:{id,value:{kind,value}}}),b=(id,block)=>({slot:{id,value:{kind:'block',block}}}),drop=(id,value)=>v(id,value,'dropdown');
const node=(id,type,category,parts,branches)=>({id,type,category,parts,...(branches?{branches}:{})});
const command=(id,category,parts)=>node(id,'command',category,parts),report=(id,category,parts)=>node(id,'reporter',category,parts),bool=(id,category,parts)=>node(id,'boolean',category,parts);
const start=id=>node(id,'event','start',[t('시작하기 버튼을 클릭했을 때')]);
const analog=(id,pin)=>report(id,'hardware',[t('아날로그'),drop('pin',pin),t('번 센서값')]);
const digital=id=>bool(id,'hardware',[t('디지털'),drop('pin',7),t('번 센서값')]);
const not=(id,inner)=>bool(id,'judge',[b('condition',inner),t('이(가) 아니다')]);
const value=(id,name)=>report(id,'data',[drop('variable',name),t('값')]);
const set=(id,name,input)=>command(id,'data',[drop('variable',name),t('를'),input,t('(으)로 정하기')]);
const say=(id,input,seconds)=>command(id,'looks',[input,t('을(를)'),v('seconds',seconds),t('초 동안'),drop('action','말하기')]);
const touch=(id,target)=>bool(id,'judge',[drop('object',target),t('에 닿았는가?')]);
const and=(id,left,right)=>bool(id,'judge',[b('left',left),drop('operator','그리고'),b('right',right)]);
const iff=(id,condition,yes,no)=>node(id,no?'e':'c','flow',[t('만일'),b('condition',condition),t('(이)라면')],no?[yes,no]:[yes]);
const loop=(id,body,run)=>({...node(id,'c','flow',[t('계속 반복하기')],[body]),...(run?{run}:{})});
const basicScripts=[{id:'basic-main',blocks:[start('basic-start'),loop('basic-loop',[
 set('basic-x','X',b('value',analog('basic-a0','A0'))),set('basic-y','Y',b('value',analog('basic-a1','A1'))),
 iff('basic-if',digital('basic-d7'),[set('basic-b1','B',v('value',1))],[set('basic-b0','B',v('value',0))])
 ],'basic')]}];
const selectionNames=['웃는 하얀 꽃','나팔꽃','잔디','장미'];
function flowerScripts(index,selection=selectionNames[index]){const id='flower'+index;return[{id:id+'-main',blocks:[start(id+'-start'),loop(id+'-loop',[
 iff(id+'-if',and(id+'-and',touch(id+'-touch','커서(1)'),not(id+'-not',digital(id+'-d7'))),[set(id+'-set','선택모양이름',v('value',selection)),say(id+'-say',b('message',value(id+'-value','선택모양이름')),0.5)])
 ])]}]}
const map=(id,pin)=>report(id,'hardware',[b('sensor',analog(id+'-analog',pin)),t('의 범위를'),v('from',0),t('~'),v('to',1023),t('에서'),v('min',-3),t('~'),v('max',3),t('로 바꾼값')]);
const negative=(id,inner)=>report(id,'calculation',[b('left',inner),t('×'),v('right',-1)]);
const move=(id,axis,input)=>command(id,'motion',[t(axis+' 좌표를'),b('distance',input),t('만큼 바꾸기')]);
const costume=(id,input)=>command(id,'looks',[input,t('모양으로 바꾸기')]);
const cursorScripts=[{id:'cursor-main',blocks:[start('cursor-start'),loop('cursor-loop',[
 move('cursor-x','x',map('cursor-mapx','A0')),
 move('cursor-y','y',negative('cursor-negy',map('cursor-mapy','A1'))),
 iff('cursor-wall',touch('cursor-touch-wall','벽'),[
  move('cursor-backx','x',negative('cursor-negx',map('cursor-mapbackx','A0'))),
  move('cursor-backy','y',map('cursor-mapbacky','A1'))
 ]),
 iff('cursor-click',and('cursor-pressed',digital('cursor-d7'),touch('cursor-touch-soil','흙')),[
  iff('cursor-select',bool('cursor-empty','judge',[b('left',value('cursor-selected','선택모양이름')),t('='),v('right',0)]),[
   say('cursor-error',v('message','모양 선택 후 도장을 찍어주세요!'),2)
  ],[
   costume('cursor-shape',b('costume',value('cursor-name','선택모양이름'))),
   command('cursor-wait','flow',[v('seconds',0.2),t('초 기다리기')]),
   command('cursor-stamp','pen',[t('도장 찍기')]),costume('cursor-reset',drop('costume','커서'))
  ])
 ])
 ],'stamp')]}];
// Keep the textbook check intact, then investigate the actual pull-up module.
const pullupScripts=E.clone(basicScripts),pullupLoop=pullupScripts[0].blocks[1];
pullupLoop.branches[0][2]=iff('basic-if',not('pullup-not',digital('basic-d7')),[set('basic-b1','B',v('value',1))],[set('basic-b0','B',v('value',0))]);
pullupLoop.run='pullup';pullupLoop.branches[0][2].run='pullup';
const cursorCode=E.clone(cursorScripts);cursorCode[0].blocks.splice(0,1,...E.startBlocks());
const finalCursor=E.clone(cursorCode),cursorBody=finalCursor[0].blocks[2].branches[0];
cursorBody[0]=move('cursor-x','x',negative('cursor-x-invert',map('cursor-mapx','A0')));
cursorBody[1]=move('cursor-y','y',map('cursor-mapy','A1'));
cursorBody[2].branches[0]=[move('cursor-backx','x',map('cursor-mapbackx','A0')),move('cursor-backy','y',negative('cursor-wall-y-invert',map('cursor-mapbacky','A1')))];
cursorBody[3].parts[1].slot.value.block.parts[0]=b('left',not('cursor-not',digital('cursor-d7')));
const allScripts=[pullupScripts,finalCursor,...objects.slice(0,4).map((o,i)=>flowerScripts(i))];
const writingCopy=scripts=>{const copy=E.clone(scripts);E.walk(copy,block=>{if(block.run!=='common-pin13')delete block.run});return copy};
function frame(root,title,object,scene,book){root.innerHTML=`<div class="entry-workspace"><div class="entry-scene-tabs entry-code-toolbar"><button class="entry-scene-tab ${scene===1?'active':''}" data-scene="1">장면 1</button>${scene===2?'<button class="entry-scene-tab active" data-scene="2">장면 2</button>':''}<span class="entry-brand">entry</span><b class="entry-lesson-title">조이스틱 · ${title}</b><div class="entry-top-actions"><button class="entry-complete-btn" disabled>학습 완료</button><div class="entry-save-wrap"><button class="entry-save-btn" disabled aria-expanded="false">저장하기</button><div class="entry-save-menu" aria-hidden="true"><button type="button">컴퓨터에 저장하기</button></div></div></div></div><aside class="entry-tabs"></aside><div class="entry-stage"><div class="joystick-object"><strong>${object}</strong><span>교과서 ${book}쪽</span></div><div class="entry-program"></div></div></div>`;}
const codePages=pages.slice(2);
codePages.forEach((root,i)=>{const scene=i?2:1,object=i===1?'커서(1)':i?objects[i-2].name:'엔트리봇',scripts=allScripts[i];frame(root,i?'그림 도장 찍기':'작동 확인 코드',object,scene,i===0?54:i===1||i>3?56:55);
 const writing=i>1?writingCopy(scripts):null;
 let states;
 if(i<2){
  const scriptId=i===0?'basic-main':'cursor-main',loopId=i===0?'basic-loop':'cursor-loop';
  const starts=E.startBlocks().map(block=>i===0&&block.id==='common-start'?{...block,id:'basic-start'}:block);
  const startStates=E.startStates().slice(0,4).map(state=>({...state,current:i===0&&state.current==='common-start'?'basic-start':state.current,scripts:state.scripts.map(script=>({...script,id:scriptId,blocks:script.blocks.map(block=>i===0&&block.id==='common-start'?{...block,id:'basic-start'}:block)}))}));
  if(i===0){
   const [xCode,yCode,buttonCode]=pullupLoop.branches[0];
   const buttonInput=iff('basic-if',digital('basic-d7'),[]);
   states=[...startStates,...[
    {scripts:[{id:scriptId,blocks:[...starts,loop(loopId,[])]}],current:loopId},
    {body:[xCode]},
    {body:[xCode],current:'basic-x',result:'observe-x'},
    {body:[xCode,yCode]},
    {body:[xCode,yCode],current:'basic-y',result:'observe-y'},
    {body:[xCode,yCode,buttonInput]},
    {body:[xCode,yCode,buttonInput],current:'basic-if',result:'observe-d7'},
    {body:[xCode,yCode,buttonCode]},
    {body:[xCode,yCode,buttonCode],current:'basic-if',run:'pullup',result:'pullup',guide:'풀업 버튼을 눌러 D7 → 아니다 → B를 확인합니다.'},
    {body:[xCode,yCode,buttonCode],current:'basic-if',run:'pullup'}
   ].map(({body,run,...state})=>body?{...state,update:{id:loopId,branches:[body],run:run??null}}:state)];
  }else{
   const book=cursorCode[0].blocks[2].branches[0],fixed=finalCursor[0].blocks[2].branches[0];
   states=[...startStates,...[
    {scripts:[{id:scriptId,blocks:[...starts,loop(loopId,[])]}],current:loopId},
    {body:[book[0]]},
    {body:[book[0]],current:'cursor-x',run:'x-book',result:'x-book',guide:'X 좌표: 조이스틱과 커서가 반대로 움직입니다.'},
    {body:[fixed[0]],current:'cursor-x-invert'},
    {body:[fixed[0]],current:'cursor-x',run:'x-fixed',result:'x-fixed',guide:'좌우 방향이 일치합니다.'},
    {body:[fixed[0],book[1]]},
    {body:[fixed[0],book[1]],current:'cursor-y',run:'y-book',result:'y-book',guide:'Y 좌표: 조이스틱과 커서가 반대로 움직입니다.'},
    {body:[fixed[0],fixed[1]],current:'cursor-y'},
    {body:[fixed[0],fixed[1]],current:'cursor-y',run:'y-fixed',result:'y-fixed',guide:'상하 방향이 일치합니다. 계속 움직이면 화면 밖으로 벗어납니다.'},
    {body:fixed.slice(0,3)},
    {body:fixed.slice(0,3),current:'cursor-wall',run:'axes-fixed',result:'axes-fixed',guide:'벽에서 되돌리는 값은 평상시 이동을 정확히 상쇄합니다.'},
    {body:fixed},
    {body:fixed,current:loopId,run:'stamp',complete:true}
   ].map(({body,run,...state})=>body?{...state,update:{id:loopId,branches:[body],run:run??null}}:state)];
  }
 }else{states=[{scripts:[]},{scripts:writing},{scripts,current:'flower'+(i-2)+'-loop',complete:true}];}

 const results={[i?'stamp':'basic']:result(i?'stamp':'basic',root),'observe-x':inquiry('observe-x',root),'observe-y':inquiry('observe-y',root),'observe-d7':inquiry('observe-d7',root),pullup:result('pullup',root),'axes-book':result('axes-book',root),'axes-fixed':result('axes-fixed',root),...Object.fromEntries(['x-book','x-fixed','y-book','y-fixed'].map(kind=>[kind,inquiry(kind,root)])),'common-pin13':EntryPin13.result(()=>controllers.get(i+2).execution)};
 let controller;
 if(i===1){const flowerObject=index=>({id:'flower'+index,name:objects[index].name,image:'assets/'+objects[index].asset+'.png',...(index===0?{copyable:true}:{copyFrom:'flower0'}),states:index===0?[{scripts:[]},{scripts:writingCopy(flowerScripts(index))}]:[{scripts:[]},{scripts:flowerScripts(index,selectionNames[0]),edit:'paste'},{scripts:flowerScripts(index),guide:'선택모양이름의 값을 '+selectionNames[index]+'(으)로 수정합니다.'}]});controller=new E.ObjectWorkspace({root,book:'교과서 55~56쪽',objects:[{id:'cursor',name:'커서(1)',image:'assets/cursor.png',states},...[0,3,2,1].map(flowerObject)],results,finalResult:'stamp'});}
 else{controller=new E.Controller({root,program:root.querySelector('.entry-program'),states,results,assetBase:'../assets/'});const bar=new E.ObjectBar({root,objects:[{id:'entrybot',name:'엔트리봇',image:'../assets/entrybot.png'}],book:'교과서 54쪽',run:()=>{const key=bar.run.dataset.run;if(key)controller.execution.toggleResult(key)}});controller.guide=bar.guide;const update=()=>{const state=controller.states[controller.index];let key=state.result;E.walk(state.scripts,n=>{if(n.run)key=n.run});bar.update('entrybot',new Set(['entrybot']),key)};root.querySelector('.entry-program').addEventListener('entry:state',update);update();}
 if(i===0){
  controller.states.forEach(state=>{const ids=new Set();E.walk(state.scripts,block=>ids.add(block.id));E.walk(state.scripts,block=>{if(block.id==='basic-x'&&ids.has('basic-a0'))block.run='observe-x';if(block.id==='basic-y'&&ids.has('basic-a1'))block.run='observe-y';if(block.id==='basic-if'&&ids.has('basic-d7')&&!ids.has('pullup-not'))block.run='observe-d7';});});

 }

 controllers.set(i+2,controller);
 root.querySelector('.entry-complete-btn').onclick=next;
 new E.Save(root);
 root.querySelectorAll('[data-scene]').forEach(button=>button.onclick=()=>{if(button.dataset.scene==='1')show(2,false,true);else if(setup.ready)show(3)});
});
const inputVariableState={variables:{}},variableRoot=document.createElement('section');variableRoot.className='slide entry-slide entry-setup-slide coding-setup-inserted joystick-variable-setup';pages[2].before(variableRoot);
let inputMonitors;
function renderInputVariables(){if(!inputMonitors)return;document.querySelectorAll('.joystick-input-monitors [data-input-variable]').forEach(monitor=>{const name=monitor.dataset.inputVariable;monitor.hidden=!Object.hasOwn(inputVariableState.variables,name);monitor.querySelector('b').textContent=inputVariableState.variables[name]??0;});}
const inputVariables=EntryCodingSetup.mount({root:variableRoot,kind:'joystick-input-variables',settingsOnly:true,projectState:inputVariableState,title:'조이스틱 · X / Y / B 변수 추가',start:{mode:'new',scene:1,addScene:false},search:'엔트리봇',defaultId:1,variable:'X',variables:['X','Y','B'],slider:false,
 options:[{id:1,name:'엔트리봇',icon:'<img class="entry-led-icon" src="../assets/entrybot.png" alt="엔트리봇">'}],objectProperties:[{id:1,image:'../assets/entrybot.png',width:160,fields:[],model:{name:'엔트리봇',x:0,y:0,size:100,direction:90}}],
 onRender:({root})=>{root.querySelector('#stageVariable').hidden=true;renderInputVariables();},
 onNext:()=>{variablesActive=false;controllers.get(2).activate(false);show(2,false,true);},
 onPrevious:()=>{variablesActive=false;variableRoot.classList.remove('active');if(!hardwareConnect.before(2,1,show))show(1);}});variableRoot.hidden=true;
inputMonitors=document.createElement('div');inputMonitors.className='joystick-input-monitors';for(const name of ['X','Y','B']){const monitor=variableRoot.querySelector('#stageVariable').cloneNode(true);monitor.removeAttribute('id');monitor.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));monitor.querySelector('input')?.remove();monitor.dataset.inputVariable=name;monitor.querySelector('span').textContent=name;inputMonitors.append(monitor);}variableRoot.querySelector('.entry-setup-canvas').append(inputMonitors);const codeMonitors=inputMonitors.cloneNode(true);codeMonitors.classList.add('joystick-code-monitors');pages[2].querySelector('.entry-stage').append(codeMonitors);renderInputVariables();
pages[2].projectState=inputVariableState;
function inputMarkup(){return '<div class="joystick-input"><label>X · A0 <input data-axis="x" type="range" min="0" max="1023" value="512"></label><label>Y · A1 <input data-axis="y" type="range" min="0" max="1023" value="512"></label><button type="button" data-press>조이스틱 버튼 · D7</button></div>'}
function joystickInput(a0,a1,d7,corrected=true,correctedY=corrected){const x=a0*6/1023-3,y=a1*6/1023-3;return{dx:corrected?-x:x,dy:correctedY?y:-y,b:Number(!d7)}}
function joystickVisual(){return '<div class="joystick-visual" role="img" aria-label="본체가 고정된 조이스틱"><img src="../assets/Joystick.png" alt="조이스틱 본체"><span class="joystick-stick" aria-hidden="true"></span><span class="joystick-arrow" data-direction="왼쪽">←</span><span class="joystick-arrow" data-direction="오른쪽">→</span><span class="joystick-arrow" data-direction="위">↑</span><span class="joystick-arrow" data-direction="아래">↓</span><span class="joystick-push" data-direction="버튼">누름 ⇓</span></div>'}
class JoystickSimulation{
 constructor(host){this.host=host;this.visual=host.querySelector('.joystick-visual');}
 read(a0,a1,down){const stickX=1-a0*2/1023,stickY=1-a1*2/1023,direction=down?'버튼':Math.abs(stickX)>.015?(stickX<0?'왼쪽':'오른쪽'):Math.abs(stickY)>.015?(stickY<0?'위':'아래'):'중앙';const state={stickX,stickY,down,direction,A0:a0,A1:a1,D7:down?0:1,X:a0,Y:a1,B:Number(down)};if(this.visual){this.visual.querySelector('.joystick-stick').style.transform=this.visual.closest('#basic')?'translate(-50%,-50%) translate('+stickX*15+'%,'+(stickY*14+(down?9:0))+'%) scale('+(down?.88:1)+')':'translate(-50%,-50%) translate('+stickX*12+'px,'+(stickY*10+(down?6:0))+'px) scale('+(down?.88:1)+')';this.visual.querySelectorAll('[data-direction]').forEach(arrow=>arrow.classList.toggle('active',arrow.dataset.direction===direction));this.visual.setAttribute('aria-label','조이스틱 '+direction+(down?' 누름':''));}return this.state=state;}
 sample(elapsed,mode,stage=0){if(mode==='observe'){const period=12800,phase=stage===3?Math.floor(elapsed/period)%3:stage,t=stage===3?elapsed%period:elapsed,amount=Math.floor(t/3200)%2===0?-1:1;return this.read(Math.round((1-(phase===1?amount:0))*511.5),Math.round((1-(phase===2?amount:0))*511.5),phase===0&&Math.floor(t/1200)%3===1)}if(mode==='principle'){const sequence=[[0,0,false],[-1,0,false],[0,0,false],[1,0,false],[0,0,false],[0,-1,false],[0,0,false],[0,1,false],[0,0,false],[0,0,true],[0,0,false]],index=Math.floor(elapsed/1000)%sequence.length,[tx,ty,down]=sequence[index],[px,py]=sequence[(index+sequence.length-1)%sequence.length],progress=Math.min(1,(elapsed%1000)/300);return this.read(Math.round((1-px-(tx-px)*progress)*511.5),Math.round((1-py-(ty-py)*progress)*511.5),down)}let phase=stage,t=elapsed;if(mode==='axes'){phase=1+Math.floor(elapsed/3600)%2;t=elapsed%3600;}else if(stage===3){phase=Math.floor(elapsed/3600)%3;t=elapsed%3600;}let sx=0,sy=0,down=false;if(phase===0)down=Math.floor(t/1200)%3===1;else{const amount=Math.sin((t%1800)/1800*Math.PI)*(Math.floor(t/1800)%2===0?-1:1);if(phase===1)sx=amount;else sy=amount;}return this.read(Math.round((1-sx)*511.5),Math.round((1-sy)*511.5),down);}
}
function inquiry(kind,root){const directionCheck=/^[xy]-(book|fixed)$/.test(kind),axes=directionCheck||kind==='axes-book'||kind==='axes-fixed',corrected=kind.endsWith('fixed'),partial=kind.startsWith('observe-'),rawButton=kind==='observe-d7'||kind==='basic';return{policy:'continuous',view(){const host=document.createElement('div');host.className='joystick-result joystick-inquiry';host.innerHTML='<h3>'+(axes?(corrected?'방향 보정 후 다시 실행':'교과서 방식으로 먼저 실행'):kind==='basic'?'조이스틱 모듈 작동 확인하기':'풀업 조이스틱 입력 확인')+'</h3>'+joystickVisual()+'<p data-segment></p><p data-readings></p>'+(axes?'<canvas width="480" height="200" aria-label="조이스틱 방향과 커서 이동 비교"></canvas><p>'+(corrected?'조이스틱과 커서의 이동 방향이 같습니다.':'조이스틱을 움직인 방향과 커서의 이동 방향이 같아지려면 코드를 어떻게 바꾸어야 할까?')+'</p>':(partial?'':(rawButton?'':'<p>B에는 ‘아니다’ 결과를 저장합니다.</p>')+'<button type="button" data-input-next>다음 · 상하/A1</button>'));return host},run({host,interval,cleanup}){
 ran.add(kind);const simulation=new JoystickSimulation(host),canvas=host.querySelector('canvas'),ctx=canvas?.getContext('2d'),cursor=new Image();cursor.src='assets/cursor.png';let began=performance.now(),stage=axes?0:kind==='observe-y'?2:kind==='observe-d7'?0:1,x=0,y=0,lastReading=-Infinity,lastPhase=null;const next=host.querySelector('[data-input-next]');if(next){const advance=event=>{event.stopPropagation();const order=[1,2,0,3];stage=order[Math.min(3,order.indexOf(stage)+1)];began=performance.now();next.hidden=stage===3;lastReading=-Infinity;next.textContent=stage===2?'다음 · 버튼/B':'다음 · 전체 동작';paint();};next.addEventListener('click',advance);cleanup(()=>next.removeEventListener('click',advance));}
 const paint=()=>{const elapsed=performance.now()-began,input=simulation.sample(directionCheck?elapsed/3+1600:elapsed,directionCheck?'observe':axes?'axes':'observe',directionCheck?(kind==='y-fixed'?1+Math.floor(elapsed/19200)%2:kind.startsWith('x-')?1:2):stage),calculated=axes?joystickInput(input.A0,input.A1,input.D7,corrected||kind==='y-book',corrected):{b:Number(!input.D7)},phase=axes?null:stage===3?Math.floor(elapsed/12800)%3:stage;if(directionCheck&&kind.startsWith('x-'))calculated.dy=0;host.querySelector('[data-segment]').textContent=(axes?'실제 조이스틱: '+input.direction:['버튼 입력','좌우 입력','위아래 입력'][phase])+(stage===3?' · 전체 반복':'');if(axes||phase===0||phase!==lastPhase||elapsed-lastReading>=200){lastReading=elapsed;lastPhase=phase;host.querySelector('[data-readings]').textContent=axes?'A0 '+input.A0+' · A1 '+input.A1+' → x 변화 '+calculated.dx.toFixed(2)+' · y 변화 '+calculated.dy.toFixed(2):rawButton&&phase===0?'D7 센서값 = '+input.D7:phase===0?'D7 센서값 = '+input.D7+'\n→ 아니다 '+input.D7+' = '+calculated.b+'\n→ B = '+calculated.b:phase===1?'A0 센서값 = '+input.A0+' → X = '+input.X:'A1 센서값 = '+input.A1+' → Y = '+input.Y;}
 if(canvas){x+=calculated.dx;y+=calculated.dy;if(!directionCheck&&(Math.abs(x)>205||Math.abs(y)>75)){x-=calculated.dx;y-=calculated.dy;}ctx.clearRect(0,0,480,200);ctx.strokeStyle='#c8d8df';ctx.beginPath();ctx.moveTo(240,0);ctx.lineTo(240,200);ctx.moveTo(0,100);ctx.lineTo(480,100);ctx.stroke();if(cursor.complete&&cursor.naturalWidth)ctx.drawImage(cursor,240+x-10,100-y-10,20,20);}
 if(!axes&&inputVariables.ready){if(phase===1)inputVariableState.variables.X=input.X;else if(phase===2)inputVariableState.variables.Y=input.Y;else if(!rawButton)inputVariableState.variables.B=calculated.b;renderInputVariables();}
 root.dataset.joystickInquiry=JSON.stringify({kind,stage,phase,...input,...calculated,...(!axes?{B:rawButton?inputVariableState.variables.B??0:calculated.b}:{}),x,y});};interval(paint,50);paint();
}}}
function result(kind,root){if(['basic','pullup','axes-book','axes-fixed'].includes(kind))return inquiry(kind,root);return{policy:'continuous',view(){const host=document.createElement('div');host.className='joystick-result';host.innerHTML=kind==='stamp'?'<h3>그림 도장 찍기</h3><div class="joystick-stage"><canvas width="480" height="270" aria-label="조이스틱 그림 도장 실행 화면"></canvas><div class="entry-stage-variable"><span>선택모양이름</span><b data-selected-value>0</b></div></div><p data-message></p>'+inputMarkup():'<h3>조이스틱 모듈 작동 확인하기</h3>'+joystickVisual()+inputMarkup()+'<p>X: <b data-x>512</b> · Y: <b data-y>512</b> · B: <b data-button>0</b></p>';return host},run({host,interval,timeout,cleanup}){
 if(kind!=='operation'){ran.add(kind);lessonUI.completeResult(root);requestAnimationFrame(()=>controllers.get(page)?.fit());cleanup(()=>requestAnimationFrame(()=>controllers.get(page)?.fit()))}
 const ranges={x:host.querySelector('[data-axis=x]'),y:host.querySelector('[data-axis=y]')},press=host.querySelector('[data-press]');let down=false,x=0,y=0,selected=0,shape='커서',busyUntil=0,messageUntil=0,message='',pressedKeys=new Set();const stamps=[];
 const simulation=new JoystickSimulation(host),canvas=host.querySelector('canvas'),ctx=canvas?.getContext('2d'),images=objects.map(o=>{const image=new Image();image.src='assets/'+o.asset+'.png';return image});
 const setDown=value=>{down=value;press.setAttribute('aria-pressed',String(value))};
 const bind=(el,type,fn)=>{el.addEventListener(type,fn);cleanup(()=>el.removeEventListener(type,fn))};
 bind(press,'pointerdown',event=>{event.preventDefault();press.setPointerCapture(event.pointerId);setDown(true)});bind(press,'pointerup',()=>setDown(false));bind(press,'pointercancel',()=>setDown(false));
 bind(press,'keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();setDown(true)}});bind(press,'keyup',event=>{if(event.key==='Enter'||event.key===' '){event.stopPropagation();setDown(false)}});
 if(canvas){bind(canvas,'pointerdown',event=>{event.preventDefault();canvas.focus()});canvas.tabIndex=0;
  const keys=event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(event.key))return;event.preventDefault();event.stopPropagation();const active=event.type==='keydown';active?pressedKeys.add(event.key):pressedKeys.delete(event.key);ranges.x.value=pressedKeys.has('ArrowLeft')?1023:pressedKeys.has('ArrowRight')?0:511.5;ranges.y.value=pressedKeys.has('ArrowUp')?1023:pressedKeys.has('ArrowDown')?0:511.5;setDown(pressedKeys.has(' '))};bind(canvas,'keydown',keys);bind(canvas,'keyup',keys);bind(canvas,'blur',()=>{pressedKeys.clear();ranges.x.value=ranges.y.value=511.5;setDown(false)});
 }
 const spriteSize=index=>{const o=objects[index];return{w:o.width*o.size/100,h:o.height*o.size/100}};
 const touches=index=>{const o=objects[index],s=spriteSize(index);return Math.abs(x-o.x)<s.w/2+4.5&&Math.abs(y-o.y)<s.h/2+4.7};
 function drawSprite(index,px,py){const s=spriteSize(index),image=images[index];if(image.complete&&image.naturalWidth)ctx.drawImage(image,px+240-s.w/2,135-py-s.h/2,s.w,s.h)}
 const paint=()=>{
  const a=Number(ranges.x.value),c=Number(ranges.y.value),now=performance.now(),input=simulation.read(a,c,down);if(!canvas){host.querySelector('[data-x]').textContent=Math.round(a);host.querySelector('[data-y]').textContent=Math.round(c);host.querySelector('[data-button]').textContent=down?1:0;return;}
  const {dx,dy,b:pressed}=joystickInput(input.A0,input.A1,input.D7);
  if(now>=busyUntil){x+=dx;y+=dy;if(x-4.5<=-240||x+4.5>=240||y-4.7<=-135||y+4.7>=135){x-=dx;y-=dy;}
   if(pressed){const target=objects.slice(0,4).findIndex((o,i)=>touches(i));if(target>=0){selected=selectionNames[target];message=selected;messageUntil=now+500;busyUntil=now+500;}
    else if(touches(5)){if(selected===0){message='모양 선택 후 도장을 찍어주세요!';messageUntil=now+2000;busyUntil=now+2000;}
    else{shape=selected;busyUntil=now+200;const px=x,py=y,name=selected;timeout(()=>{stamps.push({x:px,y:py,name});shape='커서';},200);}}
   }
  }
  ctx.clearRect(0,0,480,270);drawSprite(5,objects[5].x,objects[5].y);
  for(const stamp of stamps)drawSprite(selectionNames.indexOf(stamp.name),stamp.x,stamp.y);for(let i=0;i<4;i++)drawSprite(i,objects[i].x,objects[i].y);drawSprite(shape==='커서'?4:selectionNames.indexOf(shape),x,y);
  host.querySelector('[data-selected-value]').textContent=selected;
  host.querySelector('[data-message]').textContent=now<messageUntil?message:'';
  root.dataset.joystickResult=JSON.stringify({x,y,selected,stamps:stamps.length,shape});
 };interval(paint,1000/30);paint();
}}}
const concept=new DeviceConcept({root:pages[0],operation:{policy:'continuous',view(){const div=document.createElement('div');div.className='joystick-result';div.innerHTML='<h3>작동 원리</h3>'+joystickVisual()+'<p>스틱을 상하좌우로 움직이면 축의 기울기가 변합니다.</p><p>내부의 2개 가변저항으로 X축과 Y축의 움직임을 측정합니다.</p><p>X/Y 값은 아날로그 값 0~1023으로 입력됩니다.</p><p>스틱을 누르면 내부 버튼으로 디지털 값을 입력합니다.</p>';return div},run({host,interval}){const simulation=new JoystickSimulation(host),began=performance.now(),paint=()=>simulation.sample(performance.now()-began,'principle');interval(paint,50);paint()}},pins:q('#joystickPinRoles'),onNext:()=>show(1)});
const names=['개념','회로 연결','작동 확인 코드 · 장면 1','그림 도장 찍기 · 장면 2'];
names.forEach((name,i)=>{const button=document.createElement('button');button.className='slide-sidebar-item';button.innerHTML='<span class="sidebar-page-no"></span><span>'+name+'</span>';button.onclick=()=>show(i,false,true);q('#slideSidebarList').append(button)});
const variablesButton=document.createElement('button');variablesButton.className='slide-sidebar-item';variablesButton.innerHTML='<span class="sidebar-page-no"></span><span>X·Y·B 변수 추가</span>';variablesButton.onclick=()=>enterVariables();q('#slideSidebarList').insertBefore(variablesButton,q('#slideSidebarList').children[2]);
const properties=objects.map(o=>({id:o.id,image:'assets/'+o.asset+'.png',width:o.width,height:o.height,...(o.id===6?{layer:'back',initial:{size:398},sizeLocked:true,propertySteps:[
 {size:398,locked:true,highlight:'lock',caption:'흙 · 398% · 크기 잠금'},
 {size:398,locked:false,action:'unlock',highlight:'lock',caption:'흙 · 자물쇠 클릭 → 잠금 해제 · 398% 유지'},
 {from:398,size:300,locked:false,action:'size',highlight:'size',caption:'흙 · 크기 398% → 300%'},
 {size:300,locked:true,action:'lock',highlight:'lock',caption:'흙 · 자물쇠 클릭 → 다시 잠금 · 300% 유지'}
 ]}:{}),fields:o.id===5?['size']:['x','y','size'],...(o.id===5?{display:{x:'-',y:'-'}}:{}),model:{name:o.name,x:o.x,y:o.y,size:o.size,direction:0}}));
setup=EntryCodingSetup.mount({kind:'joystick',title:'조이스틱 · 장면 2 · 코드 작성 전 설정',start:{mode:'continue',scene:2,addScene:true,split:true},initialScripts:()=>basicScripts,search:'꽃',defaultId:1,variable:'선택모양이름',variables:['선택모양이름'],slider:false,before:pages[3],
 options:objects.map(o=>({id:o.id,name:o.name,icon:'<img class="entry-led-icon" src="assets/'+o.asset+'.png" alt="'+o.name+'">'})),
 objectSelection:objects.slice(0,4).flatMap(o=>[{search:o.name,select:o.id},{search:o.name}]).concat([{search:'커서',select:6},{search:'커서',select:5},{search:'커서',confirm:true}]),objectProperties:properties,firstProperty:6,
 onRender({root,step,extraIndex}){const soil=root.querySelector('[data-setup-sprite="5"]');if(soil&&step>=5&&(extraIndex>=0||root.dataset.ready==='true')){soil.style.width='auto';soil.style.height=(objects[5].height*properties[5].model.size/100/270*100)+'%';}if(step>=2&&step<=4){const caption=root.querySelector('#sceneGuide');caption.textContent='3-4. 오브젝트 추가하기';caption.hidden=false}},
 onNext:()=>{setupActive=false;show(3)},onPrevious:()=>{setupActive=false;show(2,true)}});
const setupButton=document.createElement('button');setupButton.className='slide-sidebar-item';setupButton.innerHTML='<span class="sidebar-page-no"></span><span>장면 2 추가 · 코드 작성 전 설정</span>';setupButton.onclick=()=>enterSetup();q('#slideSidebarList').insertBefore(setupButton,q('#slideSidebarList').children[4]);
function enterSetup(last=false){stop();variablesActive=false;variableRoot.classList.remove('active');variableRoot.hidden=true;setupActive=true;pages.forEach(p=>p.classList.remove('active'));setup.root.classList.add('active');setup.enter(last);refresh()}
function stop(){concept.close();controllers.forEach(c=>c.stop())}
function refresh(){const active=q('main.wrap>.slide.active');document.body.classList.toggle('entry-page',!!active?.classList.contains('entry-slide'));document.body.classList.toggle('after-intro',active!==pages[0]);const all=[...document.querySelectorAll('main.wrap>.slide')],index=all.indexOf(active);[...q('#slideSidebarList').children].forEach((button,i)=>button.classList.toggle('active',i===index));lessonPages.refresh();q('#slides').textContent=lessonPages.counter(active);q('#prev').disabled=page===0&&!setupActive&&concept.phase===0;requestAnimationFrame(()=>controllers.get(page)?.fit())}
function layoutJoystickCircuit(){
 const w=q('#workspace'),board=q('#board');if(!w.clientWidth)return;const scale=Math.min(w.clientWidth/724,w.clientHeight/390),bottom=board.offsetTop+board.offsetHeight;
 q('#wireLayer').querySelectorAll('.wire').forEach((line,i)=>{const name=lessonCircuitConfig.connections[i].from;if(name==='K')return;const n=line.getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number),index={Y:0,X:1,VCC:2,GND:3}[name];if(n.length!==10)return;
 const elbow=n[0]-(120-index*30)*scale,lane=bottom+(w.clientHeight-bottom-12)*(index+1)/5;n[2]=n[4]=elbow;n[5]=n[7]=lane;line.setAttribute('d',n.map((v,j)=>(j%2===0?(j?'L ':'M '):' ')+v).join(' '));});
 const positions={Y:{segment:2,fraction:0.275},X:{segment:2,fraction:0.78},K:{segment:2,fraction:0.5},VCC:{segment:2,fraction:0.965},GND:{segment:2,fraction:0.35}};
 q('#wireLabelLayer').querySelectorAll('.wire-label').forEach((label,i)=>{const line=q('#wireLayer').children[i],n=line.getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number),p=positions[lessonCircuitConfig.connections[i].from],j=p.segment*2;const connection=lessonCircuitConfig.connections[i];label.textContent=connection.to+' ← '+connection.from;label.style.left=(n[j]+(n[j+2]-n[j])*p.fraction)+'px';label.style.top=n[j+1]+'px';});
}
function enterVariables(last=false){stop();setupActive=false;variablesActive=true;page=2;document.querySelectorAll('main.wrap>.slide').forEach(slide=>slide.classList.toggle('active',slide===variableRoot));variableRoot.hidden=false;if(last)inputVariables.enter(true);else if(!variableRoot.dataset.started){inputVariables.enter();variableRoot.dataset.started='true';}renderInputVariables();refresh();}
function show(index,last=false,skipVariables=false){if(index===2&&!last&&!skipVariables){enterVariables();return;}stop();setupActive=false;variablesActive=false;variableRoot.hidden=true;page=index;document.querySelectorAll('main.wrap>.slide').forEach(p=>p.classList.toggle('active',p===pages[index]));if(last)controllers.get(index)?.activate(true);if(index===1)requestAnimationFrame(()=>{lessonCircuit.refresh();layoutJoystickCircuit()});refresh()}
function next(){if(setupActive){setup.next();refresh();return}if(variablesActive){inputVariables.next();refresh();return;}if(document.querySelector('#pin13Modal.show')){EntryPin13.close();return;}if(page===0){concept.next();refresh();return}const c=controllers.get(page);if(c){if(!c.execution.overlay.hidden){const advance=page===2?c.execution.content.querySelector('[data-input-next]:not([hidden])'):null;if(advance)advance.click();else c.stop();return}if(c.next())return;if(page===2){if(!ran.has('pullup')){c.execution.open('pullup');return}enterSetup();return}if(page<pages.length-1){show(page+1);return}c.execution.open('stamp');return}if(page===1&&circuit<5){lessonCircuit.setStep(++circuit);layoutJoystickCircuit();return}if(hardwareConnect.before(page,page+1,show))return;show(page+1)}
function prev(){if(setupActive){setup.prev();refresh();return}if(variablesActive){inputVariables.prev();refresh();return;}if(document.querySelector('#pin13Modal.show')){EntryPin13.close();return;}if(page===0){concept.prev();refresh();return}const c=controllers.get(page);if(c){if(page===2&&c.index===0){enterVariables(true);return;}if(!c.execution.overlay.hidden){c.stop();return}if(c.prev())return;if(page===3){enterSetup(true);return}}if(page===1&&circuit){lessonCircuit.setStep(--circuit);layoutJoystickCircuit();return}if(hardwareConnect.before(page,page-1,show))return;show(page-1)}
q('#next').onclick=next;q('#prev').onclick=prev;q('#fullscreenBtn').onclick=async()=>{await lessonStage.toggleFullscreen();requestAnimationFrame(()=>requestAnimationFrame(layoutJoystickCircuit));};document.addEventListener('keydown',event=>{const direction=lessonUI.direction(event);if(direction){event.preventDefault();direction>0?next():prev()}});window.addEventListener('pagehide',stop);window.addEventListener('resize',()=>{layoutJoystickCircuit();controllers.get(page)?.fit()});
window.joystickLesson={show,next,prev,setup,enterSetup,controllers,concept,objects,allScripts,get page(){return page}};show(0);
})();


