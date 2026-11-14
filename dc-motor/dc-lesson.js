/* DC-only flow: shared servo controller is intentionally left unchanged. */
(()=>{
 'use strict';
 const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
 const slides=qa('main.wrap > .slide'),basic=qa('[data-entry-step]'),code=qa('#dc5Code [data-step]');
 const principle=q('#dcPrincipleOverlay'),pins=q('#pinDialog'),pinResult=q('#pin13Modal'),result=q('#motorResult'),final=q('#dc5Result');
 let page=0,intro=0,circuit=0,step4=0,step5=0,pin4=0,pin5=0,motor4=0,final5=0,timer=null,runButton=null,value=0;
 let detail=1;
 const button=q('#dc5Button'),lastStep5=17;
 function comparison(left,right){return '<span class="'+(left==='단계'?'dc5-variable':'number-field')+'">'+left+(left==='단계'?'<span class="select-arrow">▼</span> 값':'')+'</span><b>=</b><span class="number-field">'+right+'</span>';}
 function paintCondition(){
  const condition=q('[data-condition]');
  q('.dc5-true').hidden=step5>=8;condition.hidden=step5<8;
  condition.innerHTML=comparison(step5>=10?'단계':'10',step5>=11?'3':'10');
  condition.classList.toggle('entry-current',step5===8);condition.classList.toggle('condition-inserting',step5===8);
  condition.querySelector('.dc5-variable')?.classList.toggle('entry-current',step5===10);condition.lastElementChild.classList.toggle('entry-current',step5===11);

 }
 function closeResults(){
  clearTimeout(timer);timer=null;autoRunning=false;stopTrace();flowChanged=null;table.querySelectorAll('.current-state,.changed-value').forEach(el=>el.classList.remove('current-state','changed-value'));
  [pinResult,result,final].forEach(el=>{el.hidden=true;el.setAttribute('aria-hidden','true')});
  qa('.motor-motion-fan.running').forEach(el=>el.classList.remove('running'));
  q('.motor-program').classList.remove('running');
  if(runButton){runButton.textContent='▶';runButton.classList.remove('running');runButton=null}

 }
 function closePopup(){
  if(!principle.hidden){intro=2;principle.hidden=true;principle.setAttribute('aria-hidden','true')}
  if(pins.open){intro=4;pins.close()}
  if(!pinResult.hidden){if(page===2)pin4=2;else pin5=2}
  if(!result.hidden)motor4=2;
  if(!final.hidden)final5=2;
  closeResults();paint();
 }
 function showIntro(n){
  intro=n;principle.hidden=n!==1;principle.setAttribute('aria-hidden',String(n!==1));
  if(n===3){if(!pins.open)pins.showModal()}else if(pins.open)pins.close();
  if(n===1)q('#dcPrincipleClose').focus();paint();
 }
 function openResult(el,btn){
  closeResults();el.hidden=false;el.setAttribute('aria-hidden','false');
  if((el===result&&step4>=basic.length)||(el===final&&step5>=lastStep5))window.lessonUI.completeResult(slides[page]);
  if(btn){runButton=btn;btn.textContent='■';btn.classList.add('running')}paint();
 }
 function showPin(){
  if(page===2)pin4=1;else pin5=1;
  openResult(pinResult,q(page===2?'#runPin13':'#dc5RunPin13'));
  // Keep the familiar result inside the active Entry workspace.
  slides[page].append(pinResult);requestAnimationFrame(fitCode);
 }
 function runMotor(){
  motor4=1;openResult(result,q('#runMotor'));q('.motor-program').classList.add('running');
  let on=true;
  function tick(){result.querySelector('.motor-motion-fan').classList.toggle('running',on);q('#motorResultText').textContent=on?'회전 중':'정지';on=!on;timer=setTimeout(tick,2000)}
  tick();
 }
 function update(v){
  value=v;cycleRow=v===0?(cycleRow===3?4:0):v;paintTable();finalButton.querySelector('.dc5-number').textContent=v;q('#dc5LiveStep').textContent=v;button.querySelector('.dc5-number').textContent=v;
  q('#dc5LiveMotor').textContent=v?'회전 중 · 출력 '+v*50:'정지 · 출력 0';
  const rotor=final.querySelector('.motor-motion-fan');rotor.classList.toggle('running',v>0);
  rotor.style.animationDuration=(v?1.26/v:.42)+'s';
 }
 function execute(){
  tracePanel.hidden=true;final.querySelector('.dc5-result-title').after(table);final5=1;openResult(final);
  q('.dc5-save').classList.add('enabled');q('.dc5-complete').classList.add('enabled');startFlow();
 }
 function fitCode(){
  if(page<2)return;
  (page===2?basicRenderer:fanRenderer).fitWorkspace();

 }
 // Retain lesson data and use the established shared Entry geometry and tabs.
 const E=window.EntryEngine,assetBase=new URL('../assets/',document.currentScript.src).href;
 const basicHost=q('.motor-program'),fanHost=q('#dc5Code');
 E.categories.judge ||= {order:7,label:'판단',asset:'tab07_control',color:getComputedStyle(q('.dc5-condition')).backgroundColor};
 const legacy=document.createElement('div');legacy.hidden=true;legacy.id='dcLegacyBlocks';
 for(const host of [basicHost,fanHost])while(host.firstChild)legacy.append(host.firstChild);
 document.body.append(legacy);
 // Change construction order only; the two condition branches stay in place.
 for(const el of code){const n=+el.dataset.step;el.dataset.step=n>=12&&n<=14?n+3:n>=15?n-3:n;}
 const byStep=new Map(code.map(el=>[+el.dataset.step,el]));
 const text=v=>({text:v}),slot=(id,value,kind='literal')=>({slot:{id,value:{kind,value}}});
 const nested=(id,node)=>({slot:{id,value:{kind:'block',block:node}}});
 const variable=id=>({id,type:'reporter',category:'data',parts:[slot('name','단계','dropdown'),text('값')]});
 function condition(){return {id:'fan-equal',type:'boolean',category:'judge',parts:[step5>=10?nested('left',variable('fan-condition-value')):slot('left',10),text('='),slot('right',step5>=11?3:10)]};}
 function sourceNode(el,id){
  const category=el.dataset.tab|| (el.classList.contains('start-block')?'start':el.classList.contains('wait-block')||el.classList.contains('repeat-block')?'flow':'hardware');
  const n={id,type:category==='start'?'event':'command',category,parts:[]};
  for(const part of el.children){
   if(part.matches('button,.play-dot,.dc5-true,.dc5-condition'))continue;
   if(part.classList.contains('dc5-variable'))n.parts.push(nested('value',variable(id+'-value')));
   else if(part.classList.contains('dc5-formula'))n.parts.push(nested('formula',{id:id+'-multiply',type:'reporter',category:'calculation',parts:[nested('left',variable(id+'-multiply-value')),text('×'),slot('right',50)]}));
   else if(part.matches('.field,.number-field'))n.parts.push(slot('slot-'+n.parts.length,part.textContent.replace(/▼/g,'').trim(),part.matches('.field')?'dropdown':'literal'));
   else if(part.textContent.trim())n.parts.push(text(part.textContent.trim()));
  }
  if(el.querySelector('#runPin13,#dc5RunPin13'))n.run='pin13';
  return n;
 }
 window.dcSetupCode=()=>{const blocks=basic.map(el=>sourceNode(el,'setup-b'+el.dataset.entryStep)),loop=blocks.find(n=>n.id==='setup-b3');if(loop){loop.type='c';loop.branches=[blocks.filter(n=>+n.id.slice(7)>3)]}return [{id:'setup-dc',blocks:blocks.filter(n=>+n.id.slice(7)<=3)}]};
 const basicRenderer=new E.Renderer(basicHost,runShared),fanRenderer=new E.Renderer(fanHost,runShared);
 const tabs=slides.slice(2).map(root=>new E.Tabs(root.querySelector('.entry-tabs'),assetBase));
 function construction(n){const node=byStep.get(n);return node&&![6,8,10].includes(n)?E.blockStages(sourceNode(node,'f'+n)):null;}
 let trace=0,traceTimers=[],tracePath=[],cycleRow=0;
 const flowRows=[['시작',0,0,0],['1회 클릭',1,1,50],['2회 클릭',2,2,100],['3회 클릭',3,3,150],['한 번 더 클릭',0,0,'정지']];
 const table=document.createElement('table');table.id='dcFlowTable';table.className='dc-flow-table';
 const tracePanel=document.createElement('aside');tracePanel.className='dc-flow-explanation';tracePanel.hidden=true;
 const traceTitle=document.createElement('p');traceTitle.className='dc-flow-caption';tracePanel.append(traceTitle);q('.dc5-stage').append(tracePanel);
 function markCodeGroups(){
  const control=fanRenderer.blocks.get('f6');
  for(const [branch,ready,label,kind] of [[0,step5>=17,'종료 조건','stop'],[1,step5>=14,'단계 증가','increase']]){
   const host=control?.querySelector(':scope > .ec-branch[data-branch="'+branch+'"]');if(!host)continue;
   host.classList.toggle('dc-code-group',ready);host.dataset.groupLabel=ready?label:'';host.dataset.codeGroup=kind;
  }
 }
 function highlightCodeGroup(id){
  qa('#dc5Code .dc-group-active').forEach(el=>el.classList.remove('dc-group-active'));
  const group=fanRenderer.blocks.get(id)?.closest('.dc-code-group');group?.classList.add('dc-group-active');
 }
 final.querySelector('.dc5-result-title').after(table);
 final.querySelectorAll('.dc5-live-value,#dc5LiveMotor,.dc5-result-hint').forEach(el=>el.hidden=true);
 const finalButton=button.cloneNode(true);finalButton.removeAttribute('id');finalButton.setAttribute('aria-label','선풍기 단계 변경');finalButton.classList.add('dc-final-button');final.append(finalButton);
 finalButton.addEventListener('click',()=>button.click());finalButton.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();button.click()}});
 // One code event drives both manual explanation and automatic demonstration.
 const flowEvents=[];
 function event(row,id,label,field=null,next=null){flowEvents.push({row,id,label,field,next});}
 event(0,'f1','시작하기 버튼을 클릭했을 때');event(0,'f2','13번 핀 켜기');
 event(0,'f3','버튼 모양을 0으로 바꾸기','button',0);event(0,'f4','모터 정지','speed',0);
 for(let row=1;row<=4;row++){
  event(row,'f5',row===4?'한 번 더 클릭':row+'회 클릭');
  event(row,'f6',row===4?'단계 = 3 → 참: 종료 조건':'단계 = 3 → 거짓: 아니면 실행');
  event(row,row===4?'f15':'f12',row===4?'단계를 0으로 정하기':'단계에 1만큼 더하기','stage',row===4?0:row);
  event(row,row===4?'f16':'f13',row===4?'버튼 모양을 0으로 바꾸기':'단계 값 모양으로 바꾸기','button',row===4?0:row);
  event(row,row===4?'f17':'f14',row===4?'모터 정지':'모터 속도를 단계 × 50으로 정하기','speed',row===4?0:row*50);
 }
 let flowState={stage:0,button:0,speed:0},flowSnapshots=[],flowChanged=null,autoRunning=false,autoIndex=0,flowCycle=0;
 const fields=['stage','button','speed'];
 function stateAt(index){
  let state={stage:0,button:0,speed:0},rows=[],change=null;
  for(let i=0;i<=index;i++){
   const e=flowEvents[i];if(!rows[e.row])rows[e.row]={...state};
   if(i===index&&e.field&&state[e.field]!==e.next)change={field:e.field,before:state[e.field],after:e.next};
   if(e.field)state[e.field]=e.next;rows[e.row]={...state};
  }
  return {state,rows,change};
 }
 function paintTable(visible=5,row=cycleRow){
  table.innerHTML='<thead><tr><th>상태</th><th>단계</th><th>버튼</th><th>모터 속도</th></tr></thead><tbody>'+flowRows.slice(0,visible).map((r,i)=>{
   const snapshot=flowSnapshots[i]||{stage:r[1],button:r[2],speed:typeof r[3]==='number'?r[3]:0};
   return '<tr'+(i===row?' class="current-state" aria-current="true"':'')+'><th scope="row">'+r[0]+'</th>'+fields.map(field=>{
    const changed=i===row&&flowChanged?.field===field,v=snapshot[field],shown=field==='speed'&&i===4&&v===0?'정지':v;
    return '<td data-field="'+field+'" data-value="'+v+'"'+(changed?' class="changed-value"':'')+'>'+(changed?'<small>'+flowChanged.before+' → </small>':'')+'<strong>'+shown+'</strong></td>';
   }).join('')+'</tr>';
  }).join('')+'</tbody>';
 }
 function stopTrace(){qa('#dc5Code .dc-group-active').forEach(el=>el.classList.remove('dc-group-active'));traceTimers.forEach(clearTimeout);traceTimers=[];qa('#dc5Code .trace-current,#dc5Code .trace-played').forEach(el=>el.classList.remove('trace-current','trace-played'));}
 function syncFlowView(){
  value=flowState.stage;button.querySelector('.dc5-number').textContent=flowState.button;finalButton.querySelector('.dc5-number').textContent=flowState.button;
  const rotor=final.querySelector('.motor-motion-fan');rotor.classList.toggle('running',autoRunning&&flowState.speed>0);
  rotor.style.animationDuration=(flowState.speed?1.26/(flowState.speed/50):.42)+'s';
 }
 function applyFlow(index,automatic=false){
  const e=flowEvents[index],snapshot=stateAt(index);flowState=snapshot.state;flowSnapshots=snapshot.rows;flowChanged=snapshot.change;cycleRow=e.row;
  stopTrace();fanRenderer.blocks.get(e.id)?.classList.add('trace-current');highlightCodeGroup(e.id);
  paintTable(automatic?5:e.row+1,e.row);syncFlowView();
  traceTitle.textContent=e.label;
  table.dataset.flowEvent=index;table.dataset.flowCycle=flowCycle;table.dataset.mode=automatic?'auto':'manual';
 }
 function showTrace(n){trace=n;tracePanel.hidden=false;tracePanel.append(table);paint();applyFlow(n-1);}
 function stopFlow(){
  clearTimeout(timer);timer=null;autoRunning=false;stopTrace();flowChanged=null;paintTable(5,-1);syncFlowView();
  qa('#dc5Code [data-run="fan"]').forEach(btn=>{btn.textContent='▶';btn.setAttribute('aria-pressed','false')});
  table.dataset.mode='stopped';
 }
 function startFlow(){
  clearTimeout(timer);autoRunning=true;autoIndex=0;flowCycle=0;
  function tick(){if(!autoRunning||final.hidden||page!==3)return;applyFlow(autoIndex,true);autoIndex++;
   if(autoIndex===flowEvents.length){autoIndex=0;flowCycle++;}
   timer=setTimeout(tick,800);
  }
  tick();paint();applyFlow(0,true);
 }
 function runShared(key,btn){
  if(key==='pin13'){if(pinResult.hidden)showPin();else closePopup();}
  else if(key==='motor'){if(result.hidden)runMotor();else closePopup();}
  else if(key==='fan'){if(autoRunning)stopFlow();else execute();}
 }
 function renderShared(){
  const b=basic.filter(el=>+el.dataset.entryStep<=step4).map(el=>sourceNode(el,'b'+el.dataset.entryStep));
  const loop=b.find(n=>n.id==='b3');if(loop){loop.type='c';loop.branches=[b.filter(n=>+n.id.slice(1)>3)];loop.run=step4>=basic.length?'motor':undefined;}
  basicRenderer.render([{id:'basic-main',blocks:b.filter(n=>+n.id.slice(1)<=3)}],'b'+step4);
  const nodes=new Map([...byStep].map(([step,el])=>[step,sourceNode(el,'f'+step)]));
  const progress=construction(step5);if(progress)nodes.set(step5,progress[detail]?.node||progress.at(-1).node);
  const control=nodes.get(6);control.type='e';control.category='flow';control.parts=[text('만일'),step5>=8?nested('condition',condition()):slot('condition','참','dropdown'),text('(이)라면')];
  control.branches=[[15,16,17].filter(n=>n<=step5).map(n=>nodes.get(n)),[12,13,14].filter(n=>n<=step5).map(n=>nodes.get(n))];
  const startNodes=[1,2,3,4].filter(n=>n<=step5).map(n=>nodes.get(n));
  if(step5>=17)nodes.get(5).run='fan';
  const scripts=[{id:'fan-start',blocks:startNodes}];if(step5>=5)scripts.push({id:'fan-click',blocks:[nodes.get(5),...(step5>=6?[control]:[])]});
  fanRenderer.render(scripts,(trace||!final.hidden)?null:progress?.[detail]?.current||({8:'fan-equal',10:'fan-condition-value',11:'fan-equal:right'}[step5]||'f'+step5));
  for(const [i,scriptsForTab] of [[0,[{id:'basic-main',blocks:b.filter(n=>+n.id.slice(1)<=3)}]],[1,scripts]]){
   const cats=[];E.walk(scriptsForTab,n=>{if(!cats.includes(n.category))cats.push(n.category)});
   if(i===1&&step5===7)cats.push('judge');if(i===1&&step5===9)cats.push('data');
   const active=i===0?(basic.find(el=>+el.dataset.entryStep===step4)?.dataset.tab||(step4===1?'start':'hardware')):({7:'judge',8:'judge',9:'data',10:'data',11:'judge'}[step5]||byStep.get(step5)?.dataset.tab||'start');
   const n=i===0?step4:step5;tabs[i].render(cats,n===0?null:(i===1?progress?.[detail]?.tab:null)||active);
  }
  markCodeGroups();
  tracePanel.hidden=trace===0||!final.hidden||page!==3;
  if(page===3)slides[3].classList.toggle('dc-tracing',trace>0||!final.hidden);
  for(const btn of qa('.ec-run')){const on=btn.dataset.run==='pin13'?!pinResult.hidden:btn.dataset.run==='motor'?!result.hidden:autoRunning;btn.textContent=on?'■':'▶';btn.setAttribute('aria-pressed',String(on));}
 }

 function paint(){
  basic.forEach(el=>{const n=+el.dataset.entryStep;el.classList.toggle('entry-show',n<=step4);el.classList.toggle('entry-current',n===step4)});
  q('[data-repeat-body]').classList.toggle('repeat-show',step4>=3);q('#runMotor').disabled=step4<basic.length;
  code.forEach(el=>{const n=+el.dataset.step;el.classList.toggle('show',n<=step5);el.classList.toggle('entry-current',n===step5)});
  qa('[data-container-step]').forEach(el=>el.classList.toggle('show',+el.dataset.containerStep<=step5));
  paintCondition();
  qa('.dc5-indent').forEach(el=>el.classList.toggle('has-code',!!el.querySelector('.show')));
  q('.dc5-click-script').hidden=step5<5;
  renderShared();
  const current=page===2?basic.find(el=>+el.dataset.entryStep===step4):code.find(el=>+el.dataset.step===step5);
  const conditionTab=page===3?({7:'judge',8:'judge',9:'data',10:'data',11:'judge'}[step5]):null;

  q('#prev').disabled=page===0&&intro===0;q('#next').disabled=page===3&&final5===2;
  if(!window.hardwareConnect?.getState().active){
   q('#slides').textContent=window.hardwareConnect?.number(page,slides.length)||(page+1)+' / 5';
   const titles=['개념설명','회로 연결','기본 코드','3단 선풍기'];q('#slideSubtitle').textContent='DC모터 '+titles[page];
   qa('.slide-sidebar-item').forEach((b,i)=>{b.classList.toggle('active',i===page);if(i===page)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  }
  requestAnimationFrame(fitCode);
 }
 function showPage(n){
  closeResults();principle.hidden=true;principle.setAttribute('aria-hidden','true');if(pins.open)pins.close();
  if(window.hardwareConnect?.before(page,n,showPage))return;
  page=Math.max(0,Math.min(slides.length-1,n));
  slides.forEach((el,i)=>el.classList.toggle('active',i===page));
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
   if(motor4===0){runMotor();return}
   step5=0;detail=1;pin5=0;final5=0;showPage(3);return;
  }
  if(step5===2&&pin5===0){showPin();return}
  const progress=construction(step5);if(progress&&detail<progress.length-1){detail++;paint();return;}
  if(step5<lastStep5){detail=1;step5++;if([7,9].includes(step5))step5++;paint();return}
  if(trace<flowEvents.length){showTrace(trace+1);return;}
  if(final5===0)execute();
 }
 function prev(){
  if(page===0){showIntro(Math.max(0,intro-1));return}
  if(page===1){if(circuit>0)window.lessonCircuit.setStep(--circuit);else {intro=4;showPage(0)}return}
  if(!pinResult.hidden){closeResults();if(page===2)pin4=0;else pin5=0;paint();return}
  if(!result.hidden||!final.hidden){closeResults();if(page===2)motor4=0;else final5=0;paint();return}
  if(page===2){
   if(motor4===2){runMotor();return}
   if(step4===2&&pin4===2){showPin();return}
   if(step4>0){step4--;if(step4===2)pin4=2;motor4=0;paint()}else showPage(1);return;
  }
  if(final5===2){execute();return}
  if(detail>1&&construction(step5)){detail--;paint();return;}
  if(trace>0){if(trace>1)showTrace(trace-1);else{trace=0;stopTrace();paint()}return;}
  if(step5===2&&pin5===2){showPin();return}
  if(step5>0){step5--;if([7,9].includes(step5))step5--;detail=construction(step5)?.length-1||1;if(step5===2)pin5=2;final5=0;paint()}else showPage(2);
 }
 q('#prev').addEventListener('click',prev);q('#next').addEventListener('click',next);
 q('#dcPrincipleTrigger').addEventListener('click',()=>showIntro(principle.hidden?1:2));
 q('#dcPrincipleClose').addEventListener('click',closePopup);
 principle.addEventListener('click',e=>{if(e.target===principle)closePopup()});
 q('[data-motor-pins]').addEventListener('click',()=>showIntro(3));
 pins.querySelector('[data-close-dialog]').addEventListener('click',closePopup);
 pins.addEventListener('cancel',e=>{e.preventDefault();closePopup()});
 pins.addEventListener('click',e=>{if(e.target===pins)closePopup()});
 qa('.motor-result .entry-result-close').forEach(b=>b.addEventListener('click',closePopup));
 q('#runPin13').addEventListener('click',()=>pinResult.hidden?showPin():closePopup());
 q('#dc5RunPin13').addEventListener('click',()=>pinResult.hidden?showPin():closePopup());
 q('#runMotor').addEventListener('click',()=>result.hidden?runMotor():closePopup());
 button.addEventListener('click',()=>{});
 button.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();button.click()}});
 window.lessonUI.bindOutside({key:'dc-results',isOpen:()=>[pinResult,result,final].some(x=>!x.hidden),inside:'.motor-result,.ec-run,#runPin13,#runMotor,#dc5RunPin13,#dc5Button',close:closePopup});
 document.addEventListener('keydown',e=>{
  if(/input|textarea|select/i.test(e.target.tagName)||e.target.isContentEditable)return;
  const direction=window.lessonUI.direction(e);
  if(direction){e.preventDefault();direction>0?next():prev()}
  else if(e.key==='Escape')closePopup();
  else if(e.key.toLowerCase()==='f'){e.preventDefault();window.lessonStage.toggleFullscreen().catch(()=>{})}
  else if(e.key==='Home'){e.preventDefault();intro=0;showPage(0)}
  else if(e.key==='End'){e.preventDefault();showPage(3)}
 });
 q('#fullscreenBtn').addEventListener('click',()=>window.lessonStage.toggleFullscreen().catch(()=>{}));
 const titles=['개념설명','회로 연결','기본 코드','3단 선풍기'];
 titles.forEach((title,i)=>{const b=document.createElement('button');b.type='button';b.className='slide-sidebar-item';b.innerHTML='<span class="sidebar-page-no">'+(i+1)+'</span><span>'+title+'</span>';b.addEventListener('click',()=>{if(i===0)intro=0;if(i===2&&step4<basic.length){step4=0;pin4=0;motor4=0}if(i===3){step5=0;detail=1;pin5=0;final5=0;trace=0}showPage(i)});q('#slideSidebarList').append(b)});
 window.hardwareLessonAdapter={resume:showPage};window.infoMotorController={showPage};
 window.addEventListener('load',()=>{window.hardwareConnect.open=()=>{showPage(1);window.hardwareConnect.before(1,2,showPage)};paint()});
 window.addEventListener('resize',()=>requestAnimationFrame(fitCode));document.addEventListener('fullscreenchange',()=>requestAnimationFrame(fitCode));
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&autoRunning)stopFlow()});
 window.addEventListener('pagehide',closeResults);
 showPage(0);
window.deviceConcept=new DeviceConcept({root:slides[0],openPopup:key=>showIntro(key==='operation'?1:3),closePopup:closePopup,operationTriggers:'#dcPrincipleTrigger,[data-motor-pins] img',pinTriggers:'[data-motor-pins],.motor-module figcaption',onNext:()=>showPage(1)});
})();
