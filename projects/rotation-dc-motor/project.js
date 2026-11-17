(()=>{'use strict';
 const q=s=>document.querySelector(s),pages=[...document.querySelectorAll('main.wrap>.slide')],list=q('#slideSidebarList');
 const titles=['프로젝트 안내','회로 연결','연결 확인','코드 작성 안내','과제 해결'];
 let page=0,step=0,circuit=0,guideStep=0,pinSeen=false,completed=false,timer=null,introTimer=null,studyStep=0,studyPinSeen=false,studyInputSeen=false,studyCompleted=false,studyTimer=null,studyValue=0;
 const dialLegDuration=14000/1.5;
 const result=q('#projectResult'),pin=q('#pin13Modal'),code=q('#projectCode');
 // Reuse page 1's existing execution DOM, including dial, readouts and fan.
 const template=q('#introDemo .result-layout').cloneNode(true);
 template.querySelectorAll('[id]').forEach(el=>el.id=el.id.replace(/^intro-/,''));
 template.querySelectorAll('[mask],[clip-path]').forEach(el=>{for(const key of ['mask','clip-path'])if(el.hasAttribute(key))el.setAttribute(key,el.getAttribute(key).replace(/intro-/g,''))});
 result.append(template);
 const motorPanel=result.querySelector('.fan-area'),resultLayout=result.querySelector('.result-layout'),motorReadout=document.createElement('span'),outputValue=q('#liveOutput'),outputLine=outputValue.parentElement;
 motorReadout.append(outputValue.previousSibling,outputValue);outputLine.append(motorReadout);
 const conversionNote=result.querySelector('.conversion-note'),finalConversion=conversionNote.textContent,resultTitle=result.querySelector('h2'),finalTitle=resultTitle.textContent,finalResultLabel=result.getAttribute('aria-label');
 const sharedInput=q('#rotationInput');
const taskSteps=[{}];
 const studySteps=[{}];
 function introduce(steps,key,category,buildText){steps.push({key,category,text:buildText})}
 introduce(taskSteps,'start','start','시작하기 버튼을 클릭했을 때');
 introduce(taskSteps,'pin','hardware','디지털 13번 핀을 켭니다. 실행 결과를 확인하세요.');
 introduce(taskSteps,'loop','flow','계속 반복하기를 연결합니다. 이후 코드는 반복문 안에 넣습니다.');
 introduce(taskSteps,'set','data','단계를 0으로 정하기를 반복문 안에 연결합니다.');
 introduce(taskSteps,'map','hardware','0 자리에 A1 입력값 변환 블록을 넣습니다.');
 taskSteps.push({key:'range',category:'hardware',text:'변환 범위의 100을 5로 바꿉니다.'});
 introduce(taskSteps,'shape','looks','모양 변경 블록을 반복문 안에 연결합니다.');
 introduce(taskSteps,'sum','calculation','모양 번호 자리에 + 계산 블록을 넣습니다.');
 introduce(taskSteps,'shapeValue','data','+ 블록의 왼쪽 입력칸에 단계 값을 넣습니다.');
 taskSteps.push({key:'midRun',category:'looks',text:'단계 + 1 모양의 중간 실행을 확인합니다.'});
 introduce(taskSteps,'output','hardware','D10 출력 블록을 반복문 안에 연결합니다.');
 introduce(taskSteps,'product','calculation','255 대신 곱셈 블록을 넣습니다.');
 introduce(taskSteps,'factorValue','data','첫 번째 10 대신 단계 값을 넣습니다.');
 taskSteps.push({key:'multiplier',category:'calculation',text:'두 번째 10을 30으로 바꿉니다.'});
 taskSteps.push({key:'source',category:'calculation',text:'교과서 p.49 / p.81 · 다음을 눌러 최종 실행결과를 확인하세요.'});
 introduce(studySteps,'start','start','시작하기 버튼을 클릭했을 때');
 introduce(studySteps,'pin','hardware','디지털 13번 핀 켜기 · 옆 ▶로 실행 결과를 확인합니다.');
 introduce(studySteps,'loop','flow','계속 반복하기');
 introduce(studySteps,'say','looks','반복문 안에 안녕! 을 말하기를 넣습니다.');
 introduce(studySteps,'sensor','hardware','안녕! 자리에 센서 블록을 넣습니다. 반복문 옆 ▶로 입력을 확인합니다.');
 introduce(studySteps,'motorLoop','flow','새 계속 반복하기를 만듭니다.');
 introduce(studySteps,'motor','hardware','왼쪽 D10 모터와 오른쪽 A1 입력값을 각각 확인하세요.');
 const buildAt=(steps,key)=>steps.findIndex(s=>s.key===key);
 const T=Object.fromEntries(taskSteps.filter(s=>s.key).map(s=>[s.key,buildAt(taskSteps,s.key)]));
 const S=Object.fromEntries(studySteps.filter(s=>s.key).map(s=>[s.key,buildAt(studySteps,s.key)]));
 const taskEnd=taskSteps.length-1,studyEnd=studySteps.length-1;
 const field=x=>`<span data-entry-slot="dropdown">${x}</span>`,num=x=>`<span class="number-field">${x}</span>`;
 const studyPage=pages[2],taskPage=pages[4],studyCode=q('#studyCode'),studyMotorCode=q('#studyMotorCode'),studyResult=q('#studyResult'),studyPin=q('#studyPinModal');
 const taskPalette=q('#taskPalette'),map=q('#taskMap'),shapeValue=q('#taskShapeValue'),product=q('#taskProduct'),factorValue=q('#taskFactorValue'),sensor=q('#studySensor');
 // Page 3 uses copies of the existing task blocks and object, not a separate block design.
 function guideCopy(node){const copy=node.cloneNode(true);copy.removeAttribute('hidden');[copy,...copy.querySelectorAll('*')].forEach(el=>{el.removeAttribute('id');el.removeAttribute('data-entry-step');el.removeAttribute('data-tab')});return copy}
 for(let value=0;value<=5;value++){const item=document.createElement('div');item.className='guide-number-shape';const shape=guideCopy(q('#introDemo .live-number'));shape.querySelector('b').textContent=value;const number=document.createElement('span');number.className='guide-shape-number';number.textContent=value+1;item.append(number,shape);q('#guideNumberObject').append(item)}
 q('#guideVariable').append(guideCopy(factorValue));
 const guideMap=guideCopy(map);guideMap.querySelectorAll('.number-field')[3].textContent='5';
 const guideInputBlock=guideCopy(code.querySelector('[data-entry-step="6"]'));guideInputBlock.classList.add('entry-show');guideInputBlock.querySelector('span:not(.field):not(.select-arrow)').append(guideMap);q('#guideInputHint').append(guideInputBlock);
 const guideProduct=guideCopy(product);guideProduct.firstElementChild.replaceChildren(guideCopy(factorValue));guideProduct.lastElementChild.textContent='30';
 const guideOutputBlock=guideCopy(code.querySelector('[data-entry-step="11"]'));guideOutputBlock.classList.add('entry-show');guideOutputBlock.querySelector('span:not(.field):not(.select-arrow)').replaceChildren(guideProduct);q('#guideOutputHint').append(guideOutputBlock);
 function renderGuide(){q('#guideInputHint').hidden=guideStep<1;q('#guideOutputHint').hidden=guideStep<2;q('#guideOutputEquation').hidden=guideStep<2}
 // The existing lessons reveal fixed blocks and expand their existing repeat-body.
 // Reporters keep the very same DOM node when moved from palette to value slot.
 function paintProgram(program,n,loopAt){
  program.querySelectorAll('[data-entry-step]').forEach(el=>{const k=Number(el.dataset.entryStep);el.classList.toggle('entry-show',k<=n);el.classList.toggle('entry-current',k===n)});
  program.querySelector('[data-repeat-body]').classList.toggle('repeat-show',n>=loopAt);
 }
 function paintRun(button,running,enabled=true){button.disabled=!enabled;button.textContent=running?'■':'▶';button.classList.toggle('running',running);button.setAttribute('aria-label',running?'실행 중지':'실행')}
 // Commands and reporters retain their node identity between palette and program.
 const taskNodes={start:code.querySelector('[data-entry-step="1"]'),pin:code.querySelector('[data-entry-step="2"]'),loop:code.querySelector('[data-entry-step="4"]'),set:code.querySelector('[data-entry-step="6"]'),shape:code.querySelector('[data-entry-step="8"]'),output:code.querySelector('[data-entry-step="11"]'),map,shapeValue,sum:q('#taskShapeSum'),product,factorValue};
 const studyNodes={start:studyCode.querySelector('[data-entry-step="1"]'),pin:studyCode.querySelector('[data-entry-step="2"]'),loop:q('#studyA1Set .repeat-block'),say:q('#studySayBlock'),sensor,motorLoop:studyMotorCode.querySelector('.repeat-block'),motor:studyMotorCode.querySelector('.hardware-block')};
 const homes=new Map();
 for(const [nodes,at] of [[taskNodes,T],[studyNodes,S]])for(const [key,node]of Object.entries(nodes))if(node.matches('.entry-block')){const home=document.createComment(key);node.before(home);homes.set(node,home);node.dataset.entryStep=at[key]}
 for(const [prefix,nodes]of [['task',taskNodes],['study',studyNodes]])for(const [key,node]of Object.entries(nodes))node.dataset.paletteKey=prefix+'-'+key;
 function restoreCommands(nodes){for(const node of Object.values(nodes)){const home=homes.get(node);if(home)home.after(node)}}

 function selectTab(slide,category){slide.dataset.entryCategory=category;slide.querySelectorAll('.entry-tab').forEach(el=>el.classList.toggle('active-tab',el.dataset.tab===(category==='calculation'?'math':category)))}
 function renderCode(){
  const state=taskSteps[step];restoreCommands(taskNodes);paintProgram(code,step,T.loop);
  if(step>=T.map)q('#taskMapSlot').replaceChildren(map);else{taskPalette.append(map);q('#taskMapSlot').innerHTML=num(0)}
  map.hidden=step<T.map;q('#taskMapMax').textContent=step>=T.range?5:100;
  taskNodes.sum.hidden=step<T.sum;if(step<T.sum)taskPalette.append(taskNodes.sum);
  shapeValue.hidden=step<T.shapeValue;if(step<T.shapeValue)taskPalette.append(shapeValue);
  if(step>=T.shapeValue)q('#taskShapeOperand').replaceChildren(shapeValue);else q('#taskShapeOperand').innerHTML=num(10);
  if(step>=T.sum)q('#taskShape').replaceChildren(taskNodes.sum);else q('#taskShape').innerHTML=field('단계1');
  taskPalette.append(product);product.hidden=step<T.product;
  if(step>=T.product)q('#taskOutput').replaceChildren(product);else q('#taskOutput').innerHTML=num(255);
  taskPalette.append(factorValue);factorValue.hidden=step<T.factorValue;
  if(step>=T.factorValue)q('#taskFactor').replaceChildren(factorValue);else q('#taskFactor').innerHTML=num(10);
  q('#taskMultiplier').textContent=step>=T.multiplier?30:10;
  selectTab(taskPage,state.category||'');taskPage.dataset.entryCurrent=state.key==='range'?'task-map':state.key==='multiplier'?'task-product':taskNodes[state.key]?'task-'+state.key:'';
  taskPage.classList.toggle('fan-source-stage',step===T.source);
  code.classList.toggle('running',!result.hidden||!pin.hidden);code.classList.toggle('result-running',!result.hidden);
  paintRun(q('#projectPinRun'),!pin.hidden);paintRun(q('#projectLoopRun'),!result.hidden,step===T.midRun||step===taskEnd);
  document.dispatchEvent(new Event('fan-entry-state'));
 }
 function renderStudy(){
  const state=studySteps[studyStep];restoreCommands(studyNodes);
  paintProgram(studyCode,studyStep,S.loop);paintProgram(q('#studyA1Set'),studyStep,S.loop);
  studyCode.hidden=false;studyPage.classList.toggle('study-compare',studyStep>=S.motorLoop);
  studyMotorCode.hidden=studyStep<S.motorLoop;paintProgram(studyMotorCode,studyStep,S.motorLoop);
  const pool=q('#studyPalette');pool.append(sensor);sensor.hidden=studyStep<S.sensor;
  if(studyStep>=S.sensor)q('#studySaySlot').replaceChildren(sensor);else q('#studySaySlot').innerHTML='<span data-entry-slot="string">안녕!</span>';
  selectTab(studyPage,state.category||'');studyPage.dataset.entryCurrent=studyNodes[state.key]?'study-'+state.key:'';
  paintRun(q('#studyPinRun'),!studyPin.hidden);paintRun(q('#studyLoopRun'),!studyResult.hidden,studyStep>=S.sensor);
  paintRun(q('#studyMotorRun'),!q('#studyMotorResult').hidden,studyStep>=S.motor);
  studyCode.classList.toggle('running',!studyResult.hidden||!studyPin.hidden);studyCode.classList.toggle('result-running',!studyResult.hidden);
  studyMotorCode.classList.toggle('running',!q('#studyMotorResult').hidden);studyMotorCode.classList.toggle('result-running',!q('#studyMotorResult').hidden);
  document.dispatchEvent(new Event('fan-entry-state'));
 }
 function stop(){cancelAnimationFrame(timer);timer=null;result.hidden=true;result.classList.remove('running');pin.hidden=true;studyPin.hidden=true;studyResult.hidden=true;studyResult.classList.remove('running');q('#studyMotorResult').hidden=true;q('#studyMotorResult').classList.remove('running');cancelAnimationFrame(studyTimer);studyTimer=null;renderCode();renderStudy()}
 function convert(value){return Math.max(0,Math.min(5,Math.round(Number(value)*5/1023)))}
 function updateDemo(scope,prefix,value){const level=convert(value),output=level*30,inputOnly=scope===result&&step===T.midRun;const values=[['analogValue',value],['liveStep',level],['liveNumber',level]];if(!inputOnly)values.push(['liveOutput',output],['liveFan',level?`바람 세기 ${level}단계`:'정지']);for(const [id,text]of values)q('#'+prefix+id).textContent=text;
  if(!inputOnly)scope.style.setProperty('--fan-period',output?`${72/output}s`:'2.4s');scope.classList.toggle('running',!inputOnly&&level>0);scope.querySelector('.dial-pointer').style.transform=`rotate(${-120+value/1023*240}deg)`;q('#'+prefix+'rotationDial').setAttribute('aria-valuenow',value);q('#'+prefix+'rotationInput').value=value;scope.querySelectorAll('[data-level]').forEach(el=>{const active=Number(el.dataset.level)===level;el.classList.toggle('active',active);el.setAttribute('aria-current',active?'true':'false')});if(!prefix)q('#projectNumber').textContent=level;
 }
 function cycle(scope,prefix){
  const started=performance.now();let frame;
  function animate(now){const phase=((now-started)/dialLegDuration)%2;const value=Math.round(1023*(phase<=1?phase:2-phase));updateDemo(scope,prefix,value);frame=requestAnimationFrame(animate);if(prefix)introTimer=frame;else timer=frame}
  updateDemo(scope,prefix,0);frame=requestAnimationFrame(animate);return frame;
 }
 function openResult(){if(step!==T.midRun&&step!==taskEnd)return;stop();const inputOnly=step===T.midRun;result.classList.toggle('input-only',inputOnly);if(inputOnly){motorPanel.remove();motorReadout.remove()}else{resultLayout.append(motorPanel);outputLine.append(motorReadout)}conversionNote.textContent=inputOnly?'연속 입력 → 0~5 범위 변환':finalConversion;resultTitle.textContent=inputOnly?'가변저항 값에 따라 숫자 버튼의 숫자가 바뀝니다.':finalTitle;result.setAttribute('aria-label',inputOnly?'숫자 버튼 실행결과':finalResultLabel);result.hidden=false;if(step===taskEnd){completed=true;window.lessonUI.completeResult(taskPage)}timer=cycle(result,'');renderCode();requestAnimationFrame(fitCode)}
 function openPin(){stop();pin.hidden=false;pinSeen=true;renderCode();requestAnimationFrame(fitCode)}
 function renderCircuit(){q('#projectCircuit').querySelectorAll('[data-circuit-stage]').forEach(el=>{el.style.visibility=Number(el.dataset.circuitStage)<=circuit?'visible':'hidden'});q('#circuitProgress').textContent=['연결할 모듈과 핀을 먼저 확인합니다.','보드 전원: 5V → + / GND → −','모듈 전원: 가변저항 VCC·GND / DC모터 V·G',''][circuit]}
 function show(index){index=Math.max(0,Math.min(4,index));if(window.hardwareConnect?.before(page,index,show)) {stop();cancelAnimationFrame(introTimer);return}
  stop();cancelAnimationFrame(introTimer);page=index;pages.forEach((p,i)=>p.classList.toggle('active',i===page));[...list.querySelectorAll('.slide-sidebar-item')].forEach((b,i)=>b.classList.toggle('active',i===page));q('#slides').textContent=window.hardwareConnect?.number(page,5)||window.lessonPages.counter(pages[page]);q('#prev').disabled=page===0;q('#next').disabled=false;document.body.classList.toggle('entry-page',page===2||page===4);document.body.classList.toggle('after-intro',page>0);renderCode();renderStudy();renderCircuit();renderGuide();if(page===0)introTimer=cycle(q('#introDemo'),'intro-');requestAnimationFrame(fitCode)}
 function next(){if(page===2&&studyStep===S.sensor&&studyInputSeen){stop();studyStep++;renderStudy();requestAnimationFrame(fitCode);return}if(!result.hidden||!pin.hidden||!studyResult.hidden||!studyPin.hidden||!q('#studyMotorResult').hidden){stop();return}if(page===1&&circuit<3){circuit++;renderCircuit();return}
  if(page===3&&guideStep<2){guideStep++;renderGuide();return}
  if(page===2){if(studyStep===S.pin&&!studyPinSeen){openStudyPin();return}if(studyStep===S.sensor&&!studyInputSeen){openStudyResult('input');return}if(studyStep<studyEnd){studyStep++;renderStudy();if(studyStep===S.motor)openStudyResult('motor');requestAnimationFrame(fitCode);return}if(!studyCompleted){openStudyResult('motor');return}show(3);return}
  if(page===4){if(step===T.pin&&!pinSeen){openPin();return}if(step<taskEnd){step++;renderCode();if(step===T.midRun)openResult();requestAnimationFrame(fitCode);return}openResult();return}show(page+1)}
 function previous(){if(page===2&&studyStep===S.motor&&!q('#studyMotorResult').hidden){stop();studyStep--;renderStudy();return}if(!result.hidden||!pin.hidden||!studyResult.hidden||!studyPin.hidden||!q('#studyMotorResult').hidden){stop();return}if(page===1&&circuit>0){circuit--;renderCircuit();return}if(page===3&&guideStep>0){guideStep--;renderGuide();return}if(page===2&&studyStep>0){studyStep--;if(studyStep<S.pin)studyPinSeen=false;if(studyStep<S.sensor)studyInputSeen=false;renderStudy();return}if(page===4&&step>0){step--;if(step<T.pin)pinSeen=false;renderCode();return}show(page-1)}
 // Use the normal motor lesson's stage-fit rule, with no block position calculations.
 function fitCode(){document.dispatchEvent(new Event('fan-entry-state'))}
 function updateStudy(value){studyValue=Math.max(0,Math.min(1023,Math.round(value)));q('#studyInput').value=studyValue;q('#studySpeech').textContent=studyValue;q('#studyDial').setAttribute('aria-valuenow',studyValue);q('#studyDial .dial-pointer').style.transform=`rotate(${-120+studyValue/1023*240}deg)`}
 const studyFan=q('#studyFan'),fanTemplate=q('#introDemo .fan-area svg').cloneNode(true);
 fanTemplate.querySelectorAll('[id]').forEach(el=>el.id=el.id.replace(/^intro-/,'study-'));
 fanTemplate.querySelectorAll('[mask],[clip-path]').forEach(el=>{for(const key of ['mask','clip-path'])if(el.hasAttribute(key))el.setAttribute(key,el.getAttribute(key).replace(/intro-/g,'study-'))});studyFan.insertBefore(fanTemplate,studyFan.firstChild);
 function openStudyPin(){stop();studyPin.hidden=false;studyPinSeen=true;renderStudy();requestAnimationFrame(fitCode)}
 function closeStudyInput(){stopStudyDemo();studyResult.hidden=true;renderStudy()}
 function closeStudyMotor(){q('#studyMotorResult').hidden=true;q('#studyMotorResult').classList.remove('running');renderStudy()}
 function openStudyResult(kind=studyStep>=S.motor?'motor':'input'){
  studyPin.hidden=true;
  if(kind==='input'){if(studyStep<S.sensor)return;studyInputSeen=true;studyResult.hidden=false;stopStudyDemo();startStudyDemo()}
  else{if(studyStep<S.motor)return;const motor=q('#studyMotorResult');motor.hidden=false;motor.classList.toggle('running',studyStep>=S.motor);motor.style.setProperty('--fan-period','.42s');q('#studyMotorStatus').textContent=studyStep<S.motor?'반복할 동작 없음 · 모터 정지':'D10 켜기 · 모터 회전';if(studyStep>=S.motor){studyCompleted=true;window.lessonUI.completeResult(studyPage);studyResult.hidden=false;stopStudyDemo();startStudyDemo()}}
  renderStudy();requestAnimationFrame(fitCode)
 }
 function startStudyDemo(){const started=performance.now();function animate(now){const phase=((now-started)/dialLegDuration)%2;updateStudy(1023*(phase<=1?phase:2-phase));studyTimer=requestAnimationFrame(animate)}updateStudy(0);studyTimer=requestAnimationFrame(animate)}
 function stopStudyDemo(){cancelAnimationFrame(studyTimer);studyTimer=null}
 q('#studyInput').addEventListener('input',e=>{stopStudyDemo();updateStudy(Number(e.target.value))});
 // Pointer motion changes raw A1 input continuously, independently of task levels.
 const dial=q('#studyDial');let dragging=false,lastAngle=0;
 const angle=e=>{const r=dial.getBoundingClientRect();return Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2)*180/Math.PI};
 dial.addEventListener('pointerdown',e=>{stopStudyDemo();dragging=true;lastAngle=angle(e);dial.setPointerCapture(e.pointerId);e.preventDefault()});
 dial.addEventListener('pointermove',e=>{if(!dragging)return;const next=angle(e),delta=(next-lastAngle+540)%360-180;lastAngle=next;updateStudy(studyValue+delta*1023/240)});
 ['pointerup','pointercancel','lostpointercapture'].forEach(type=>dial.addEventListener(type,()=>dragging=false));
 dial.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;e.preventDefault();e.stopPropagation();stopStudyDemo();updateStudy(e.key==='Home'?0:e.key==='End'?1023:studyValue+(['ArrowRight','ArrowUp'].includes(e.key)?1:-1))});
 studyPage.addEventListener('click',e=>{const control=e.target.closest('#studyPinRun,#studyLoopRun,#studyMotorRun');if(!control)return;if(control.id==='studyPinRun'){studyPin.hidden?openStudyPin():stop()}else if(control.id==='studyLoopRun'){studyResult.hidden?openStudyResult('input'):closeStudyInput()}else{q('#studyMotorResult').hidden?openStudyResult('motor'):closeStudyMotor()}});
 studyPage.querySelectorAll('[data-study-close]').forEach(b=>b.addEventListener('click',()=>{const panel=b.closest('#studyResult,#studyMotorResult');if(panel?.id==='studyResult')closeStudyInput();else if(panel)closeStudyMotor();else stop();requestAnimationFrame(fitCode)}));
 window.lessonUI.bindOutside({key:'fan-study',isOpen:()=>!studyResult.hidden||!studyPin.hidden||!q('#studyMotorResult').hidden,inside:'#studyResult,#studyMotorResult,#studyPinModal,#studyPinRun,#studyLoopRun,#studyMotorRun,.fan-common-code .ec-run',close:stop});
 q('#studySave').addEventListener('click',()=>{if(!studyCompleted)return;const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({project:'rotation-dc-motor',study:'연결 확인',input:'A1',range:[0,1023],output:'D10'},null,2)],{type:'application/json'}));a.download='rotation-dc-motor-connection.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)});
 q('#studyComplete').addEventListener('click',()=>{if(!studyCompleted)return;localStorage.setItem('phycom-study-rotation-dc-motor-complete','1');q('#studyComplete').textContent='학습완료 ✓'});
 window.addEventListener('resize',()=>requestAnimationFrame(fitCode));document.addEventListener('fullscreenchange',()=>requestAnimationFrame(fitCode));
 updateStudy(0);
 titles.forEach((title,i)=>{const b=document.createElement('button');b.type='button';b.className='slide-sidebar-item';b.innerHTML=`<span class="sidebar-page-no">${i+1}</span><span>${title}</span>`;b.addEventListener('click',()=>show(i));list.append(b)});
 window.hardwareLessonAdapter={resume:show};q('#next').addEventListener('click',next);q('#prev').addEventListener('click',previous);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){stop();return}const d=window.lessonUI.direction(e);if(!d)return;e.preventDefault();d>0?next():previous()});
 code.addEventListener('click',e=>{const control=e.target.closest('#projectPinRun,#projectLoopRun');if(!control)return;if(control.id==='projectPinRun')pin.hidden?openPin():stop();else result.hidden?openResult():stop()});
 q('#projectResultClose').addEventListener('click',stop);q('#pin13Close').addEventListener('click',stop);
 window.lessonUI.bindOutside({key:'fan-project',isOpen:()=>!result.hidden,inside:'#projectResult,#projectLoopRun,.fan-common-code .ec-run',close:stop});window.lessonUI.bindOutside({key:'fan-pin13',isOpen:()=>!pin.hidden,inside:'#pin13Modal,#projectPinRun,.fan-common-code .ec-run',close:stop});
 sharedInput.addEventListener('input',()=>updateDemo(result,'',Number(sharedInput.value)));
 q('#projectSave').addEventListener('click',()=>{if(!completed)return;const source={project:'rotation-dc-motor',object:'숫자 버튼',variable:'단계',input:'A1',range:[0,1023,0,5],output:'D10',multiplier:30};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(source,null,2)],{type:'application/json'}));a.download='rotation-dc-motor.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)});
 q('#projectComplete').addEventListener('click',()=>{if(!completed)return;localStorage.setItem('phycom-project-rotation-dc-motor-complete','1');q('#projectComplete').textContent='과제제출 ✓'});
 window.addEventListener('pagehide',()=>{stop();cancelAnimationFrame(introTimer)});show(0);
})();

