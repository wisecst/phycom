/* One setup routine, extracted from the established LED lesson. */
(()=>{'use strict';const E=window.EntryEngine,asset=new URL('../../assets/',document.currentScript.src).href;
const template="<section class=\"slide entry-slide entry-scene-slide entry-setup-slide\" aria-label=\"6. PWM 코딩 전 설정\">\n<div class=\"entry-workspace\">\n<div class=\"entry-scene-tabs entry-code-toolbar\">\n<button type=\"button\" class=\"entry-scene-tab active\" data-scene=\"1\">장면 1</button>\n<button type=\"button\" class=\"entry-scene-tab\" data-scene=\"2\" hidden>장면 2</button>\n<button type=\"button\" class=\"entry-scene-add\" id=\"sceneAdd\" aria-label=\"장면 추가\">＋</button>\n<span class=\"entry-brand\">entry</span><b class=\"entry-lesson-title\">[피컴09] 출력장치-LED1</b>\n<div class=\"entry-top-actions\"><button type=\"button\" class=\"entry-goal-btn\">목표 작품</button><button type=\"button\" class=\"entry-complete-btn\">학습 완료</button></div></div>\n<div class=\"entry-setup-layout\">\n  <div class=\"entry-setup-left\">\n    <div class=\"entry-setup-stage\">\n      <div class=\"entry-setup-stage-bar\">◷ <span>X: -68.6, Y: -4.2</span><span>▦　⛶</span></div>\n      <div class=\"entry-setup-canvas\"><div class=\"entry-stage-variable\" id=\"stageVariable\" hidden><span id=\"stageVariableName\">LED밝기</span><b id=\"stageVariableValue\">0</b><input id=\"stageVariableSlider\" type=\"range\" min=\"0\" max=\"255\" value=\"0\" aria-label=\"LED밝기 값\" hidden></div><img class=\"entry-setup-bot\" src=\"../assets/entrybot.png\" alt=\"엔트리봇\"><div class=\"entry-setup-led yellow\" aria-label=\"추가한 노란LED 오브젝트\"><svg class=\"entry-led-icon\" viewBox=\"0 0 86 100\" aria-hidden=\"true\"><g fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"><path d=\"M43 4v8M15 17l7 7M71 17l-7 7M5 47h8M73 47h8M12 28l7 4M74 28l-7 4\"/></g><path d=\"M26 71V43a17 17 0 0 1 34 0v28Z\" fill=\"currentColor\" opacity=\".84\"/><path d=\"M31 66V43a12 12 0 0 1 21-8\" fill=\"none\" stroke=\"#fff\" stroke-width=\"4\" opacity=\".78\"/><path d=\"M24 70Q43 80 62 70v10Q43 90 24 80Z\" fill=\"currentColor\"/><path d=\"M23 79Q43 89 63 79v7Q43 96 23 86Z\" fill=\"currentColor\" opacity=\".72\"/></svg><span class=\"entry-selection-handles\" aria-hidden=\"true\"></span></div></div><div id=\"objectCompleteCallout\" class=\"entry-object-complete-callout\" role=\"note\" hidden>추가된 오브젝트 확인</div>\n    </div>\n    <div class=\"entry-setup-actions\"><button type=\"button\" id=\"openObjectChooser\">＋ 오브젝트 추가하기</button><button type=\"button\" class=\"entry-setup-run\">▶ 시작하기</button></div>\n    <div class=\"entry-setup-objects\"><span>오브젝트</span><div class=\"entry-setup-object entry-setup-bot-object\"><img src=\"../assets/entrybot.png\" alt=\"\">엔트리봇</div><div class=\"entry-setup-object added-led yellow\"><span class=\"entry-object-icon\"><svg class=\"entry-led-icon\" viewBox=\"0 0 86 100\" aria-hidden=\"true\"><g fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"><path d=\"M43 4v8M15 17l7 7M71 17l-7 7M5 47h8M73 47h8M12 28l7 4M74 28l-7 4\"/></g><path d=\"M26 71V43a17 17 0 0 1 34 0v28Z\" fill=\"currentColor\" opacity=\".84\"/><path d=\"M31 66V43a12 12 0 0 1 21-8\" fill=\"none\" stroke=\"#fff\" stroke-width=\"4\" opacity=\".78\"/><path d=\"M24 70Q43 80 62 70v10Q43 90 24 80Z\" fill=\"currentColor\"/><path d=\"M23 79Q43 89 63 79v7Q43 96 23 86Z\" fill=\"currentColor\" opacity=\".72\"/></svg></span><input id=\"addedLedLabel\" aria-label=\"오브젝트 이름\" value=\"노란LED\"></div>\n      <div class=\"entry-led-property\" id=\"ledProperty\" hidden><div class=\"entry-property-head\"><b id=\"propertyLedName\">노란LED</b><span>⌃　×</span></div><div class=\"entry-property-grid\"><label><input aria-label=\"X 위치\" value=\"0.0\"> X</label><label><input aria-label=\"Y 위치\" value=\"0.0\"> Y</label><label><input aria-label=\"크기\" value=\"100.0\"> % 크기</label><label><input aria-label=\"방향\" value=\"90.0\"> ° 방향</label></div></div>\n    </div>\n  </div>\n  <div class=\"entry-setup-right\">\n    <div class=\"entry-setup-tabs\"><span>블록</span><span>모양</span><span>소리</span><span class=\"active\">속성</span></div>\n    <div class=\"entry-setup-property\"><div class=\"entry-setup-categories\"><span>전체</span><button type=\"button\" class=\"setup-variable-tab\" id=\"selectVariableTab\">? 변수</button><span>⚑ 신호</span><span>▤ 리스트</span><span>⚒ 함수</span></div>\n      <button type=\"button\" id=\"openVariableChooser\">변수 추가하기</button>\n      <div class=\"entry-variable-folder\" id=\"variableFolder\">모든 오브젝트에서 사용하는 변수 (<b id=\"variableCount\">0</b>) <span>▱</span></div>\n      <div class=\"entry-variable-form\" id=\"variableChooser\" hidden><label>변수 이름<input id=\"variableName\" type=\"text\" value=\"LED밝기\" maxlength=\"20\" aria-label=\"변수 이름\"></label><div class=\"entry-variable-scope\">모든 오브젝트에서 사용</div><label><input type=\"radio\" name=\"variableScope\" checked> 일반 변수로 사용 (작품에 저장)</label><label><input type=\"radio\" name=\"variableScope\"> 공유 변수로 사용</label><div class=\"entry-variable-form-actions\"><button type=\"button\" data-setup-close>취소</button><button type=\"button\" id=\"confirmVariable\">변수 추가</button></div></div>\n      <div class=\"entry-setup-variable\" id=\"setupVariable\" hidden><div class=\"entry-variable-header\"><input id=\"variablePropertyName\" aria-label=\"변수 이름\" value=\"LED밝기\"></div><div class=\"entry-variable-settings\"><b>변수 속성</b><label>변수 기본값<input id=\"variableDefault\" aria-label=\"변수 기본값\" value=\"0\"></label><label class=\"entry-slider-toggle\"><input id=\"enableVariableSlider\" type=\"checkbox\"> 슬라이드</label><div class=\"entry-variable-range\" id=\"variableRange\" hidden><input id=\"variableMin\" aria-label=\"슬라이드 최소값\" value=\"0\"> ~ <input id=\"variableMax\" aria-label=\"슬라이드 최대값\" value=\"100\"></div></div></div>\n    </div>\n  </div>\n  \n  \n  \n  \n  \n</div>\n<div class=\"setup-number n1\">1</div><div class=\"setup-number n2\">2</div><div class=\"setup-number n3\">3</div><div class=\"setup-number n4\">4</div><div class=\"setup-number n5\">5</div><div class=\"setup-number n6\">6</div><div class=\"setup-number n7\">7</div><div class=\"setup-number n8\">8</div><div class=\"setup-number n9\">9</div><div class=\"setup-number n10\">10</div><div class=\"setup-number n11\">11</div><div class=\"setup-number n12\">12</div><div class=\"led-search-tip\">LED는 대문자로 입력하세요</div><div class=\"entry-setup-caption\" id=\"sceneGuide\">장면 1 옆의 +를 눌러 새 장면을 만듭니다.</div>\n<div class=\"entry-setup-dialog\" id=\"objectChooser\" role=\"dialog\" aria-label=\"오브젝트 추가하기\" hidden>\n  <div class=\"entry-object-window\"><div class=\"entry-object-head\"><button type=\"button\" data-setup-close aria-label=\"닫기\">×</button><b>오브젝트 추가하기</b><button type=\"button\" id=\"confirmObject\">추가하기</button></div>\n  <span class=\"setup-object-number object-n1\">1</span><span class=\"setup-object-number object-n2\">2</span><span class=\"setup-object-number object-n3\">3</span><div class=\"entry-object-toolbar\"><span class=\"active\">오브젝트 선택</span><span>파일 올리기</span><span>새로 그리기</span><span>글상자</span><label><input id=\"objectSearch\" type=\"search\" placeholder=\"오브젝트 검색\" aria-label=\"오브젝트 검색\" autocomplete=\"off\"><em class=\"led-search-callout\">대문자 LED</em><span>⌕</span></label></div>\n  <div class=\"entry-object-content\"><nav class=\"entry-object-categories\"><b>엔트리봇</b><span>유엔보</span><span>사람</span><span>동물</span></nav>\n  <div class=\"entry-object-results\"><div class=\"entry-result-tabs\">전체　 레벨　 이모티콘　 예전</div><div class=\"entry-led-options\" id=\"ledOptions\"><button type=\"button\" class=\"entry-result yellow\" data-led-option=\"4\"><svg class=\"entry-led-icon\" viewBox=\"0 0 86 100\" aria-hidden=\"true\"><g fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"><path d=\"M43 4v8M15 17l7 7M71 17l-7 7M5 47h8M73 47h8M12 28l7 4M74 28l-7 4\"/></g><path d=\"M26 71V43a17 17 0 0 1 34 0v28Z\" fill=\"currentColor\" opacity=\".84\"/><path d=\"M31 66V43a12 12 0 0 1 21-8\" fill=\"none\" stroke=\"#fff\" stroke-width=\"4\" opacity=\".78\"/><path d=\"M24 70Q43 80 62 70v10Q43 90 24 80Z\" fill=\"currentColor\"/><path d=\"M23 79Q43 89 63 79v7Q43 96 23 86Z\" fill=\"currentColor\" opacity=\".72\"/></svg><span>노란LED</span></button><button type=\"button\" class=\"entry-result red\" data-led-option=\"3\"><svg class=\"entry-led-icon\" viewBox=\"0 0 86 100\" aria-hidden=\"true\"><g fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"><path d=\"M43 4v8M15 17l7 7M71 17l-7 7M5 47h8M73 47h8M12 28l7 4M74 28l-7 4\"/></g><path d=\"M26 71V43a17 17 0 0 1 34 0v28Z\" fill=\"currentColor\" opacity=\".84\"/><path d=\"M31 66V43a12 12 0 0 1 21-8\" fill=\"none\" stroke=\"#fff\" stroke-width=\"4\" opacity=\".78\"/><path d=\"M24 70Q43 80 62 70v10Q43 90 24 80Z\" fill=\"currentColor\"/><path d=\"M23 79Q43 89 63 79v7Q43 96 23 86Z\" fill=\"currentColor\" opacity=\".72\"/></svg><span>빨간LED</span></button><button type=\"button\" class=\"entry-result green\" data-led-option=\"2\"><svg class=\"entry-led-icon\" viewBox=\"0 0 86 100\" aria-hidden=\"true\"><g fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"><path d=\"M43 4v8M15 17l7 7M71 17l-7 7M5 47h8M73 47h8M12 28l7 4M74 28l-7 4\"/></g><path d=\"M26 71V43a17 17 0 0 1 34 0v28Z\" fill=\"currentColor\" opacity=\".84\"/><path d=\"M31 66V43a12 12 0 0 1 21-8\" fill=\"none\" stroke=\"#fff\" stroke-width=\"4\" opacity=\".78\"/><path d=\"M24 70Q43 80 62 70v10Q43 90 24 80Z\" fill=\"currentColor\"/><path d=\"M23 79Q43 89 63 79v7Q43 96 23 86Z\" fill=\"currentColor\" opacity=\".72\"/></svg><span>초록LED</span></button><button type=\"button\" class=\"entry-result blue\" data-led-option=\"1\"><svg class=\"entry-led-icon\" viewBox=\"0 0 86 100\" aria-hidden=\"true\"><g fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"><path d=\"M43 4v8M15 17l7 7M71 17l-7 7M5 47h8M73 47h8M12 28l7 4M74 28l-7 4\"/></g><path d=\"M26 71V43a17 17 0 0 1 34 0v28Z\" fill=\"currentColor\" opacity=\".84\"/><path d=\"M31 66V43a12 12 0 0 1 21-8\" fill=\"none\" stroke=\"#fff\" stroke-width=\"4\" opacity=\".78\"/><path d=\"M24 70Q43 80 62 70v10Q43 90 24 80Z\" fill=\"currentColor\"/><path d=\"M23 79Q43 89 63 79v7Q43 96 23 86Z\" fill=\"currentColor\" opacity=\".72\"/></svg><span>파란LED</span></button></div></div>\n  <aside class=\"entry-selected-list\"><b>전체(<span id=\"objectSelectedCount\">0</span>)</b><div id=\"objectSelectedPreview\" hidden><svg class=\"entry-led-icon\" viewBox=\"0 0 86 100\" aria-hidden=\"true\"><g fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"><path d=\"M43 4v8M15 17l7 7M71 17l-7 7M5 47h8M73 47h8M12 28l7 4M74 28l-7 4\"/></g><path d=\"M26 71V43a17 17 0 0 1 34 0v28Z\" fill=\"currentColor\" opacity=\".84\"/><path d=\"M31 66V43a12 12 0 0 1 21-8\" fill=\"none\" stroke=\"#fff\" stroke-width=\"4\" opacity=\".78\"/><path d=\"M24 70Q43 80 62 70v10Q43 90 24 80Z\" fill=\"currentColor\"/><path d=\"M23 79Q43 89 63 79v7Q43 96 23 86Z\" fill=\"currentColor\" opacity=\".72\"/></svg><span id=\"objectSelectedName\">노란LED</span></div></aside></div></div>\n</div>\n</div>\n</section>";
function objectIcon(cfg,id){const o=cfg.options.find(o=>o.id===id)||cfg.options[0];return o.icon||'<svg class="entry-led-icon" viewBox="'+o.crop+'" aria-hidden="true"><image href="'+asset+o.image+'" width="'+o.width+'" height="'+o.height+'"/></svg>'}
function mount(cfg){
 const root=cfg.root||document.createElement('section');
 if(!cfg.root){root.className='slide entry-slide entry-scene-slide entry-setup-slide coding-setup-inserted';cfg.before.before(root);}
 const holder=document.createElement('template');holder.innerHTML=template;root.replaceChildren(...holder.content.firstElementChild.childNodes);
 root.setAttribute('aria-label','코딩 전 설정');root.dataset.setupKind=cfg.kind;if(cfg.projectState)root.projectState=cfg.projectState;
 root.querySelectorAll('img[src="../assets/entrybot.png"]').forEach(img=>img.src=asset+'entrybot.png');
 root.querySelector('.entry-lesson-title').textContent=cfg.title;
 const icon=id=>objectIcon(cfg,id);
 const options=root.querySelector('#ledOptions');options.replaceChildren();
 for(const o of cfg.options){const button=document.createElement('button');button.type='button';button.className='entry-result '+(o.color||'object');button.dataset.ledOption=o.id;button.innerHTML=icon(o.id)+'<span>'+o.name+'</span>';options.append(button)}
 root.querySelectorAll('#variableName,#variablePropertyName').forEach(n=>n.value=cfg.variable);root.querySelector('#stageVariableName').textContent=cfg.variable;root.querySelector('#stageVariableSlider').setAttribute('aria-label',cfg.variable+' 값');
 const searchCallout=root.querySelector('.led-search-callout');if(cfg.searchTip)searchCallout.textContent=cfg.searchTip;else searchCallout.remove();
 const initial=document.createElement('div');initial.className='coding-setup-initial';const code=document.createElement('div');initial.append(code);root.querySelector('.entry-workspace').append(initial);
 const renderer=new E.Renderer(code,()=>{});
 let startPhase=0,extraIndex=-1,extraComplete=false;
 const fresh=cfg.start?.mode==='new',addScene=cfg.start?.addScene??!fresh,sceneNumber=cfg.start?.scene??(addScene?2:(cfg.projectState?.scene||1));
 root.dataset.setupStart=fresh?'new':'continue';
 const settings=[...(cfg.variables||[]).map(name=>({kind:'변수',name:typeof name==='string'?name:name.name,value:name.value??0})),...(cfg.signals||[]).map(name=>({kind:'신호',name})),...(cfg.sounds||[]).map(sound=>({kind:'소리',...(typeof sound==='string'?{name:sound}:sound)}))];
 let settingIndex=-1,settingPhase=0,ready=false;
 if(cfg.start?.removeDefault){const deleteDefault=document.createElement('button');deleteDefault.type='button';deleteDefault.textContent='×';deleteDefault.setAttribute('aria-label','엔트리봇 삭제');deleteDefault.hidden=!cfg.start?.removeDefault;root.querySelector('.entry-setup-bot-object').append(deleteDefault);
 deleteDefault.onclick=()=>{startPhase=1;updateScene()};}
 function updateStart(){
  if(!cfg.start)return;
  if(cfg.projectState)cfg.projectState.scene=sceneNumber;
  root.querySelector('.coding-setup-initial').hidden=fresh||sceneStep!==0;
  root.querySelector('#sceneAdd').hidden=!addScene;
  const first=root.querySelector('[data-scene="1"]'),second=root.querySelector('[data-scene="2"]');
  if(!addScene){first.textContent='장면 '+sceneNumber;first.classList.add('active');second.hidden=true;second.classList.remove('active');}
  const removed=cfg.start.removeDefault&&(startPhase===1||sceneStep>0);root.dataset.setupDefaultRemoved=String(!!removed);
  if(fresh){root.querySelector('.entry-setup-bot').hidden=removed;root.querySelector('.entry-setup-bot-object').hidden=removed;}
  if(fresh&&sceneStep===0){root.querySelector('.entry-setup-layout').dataset.setupStep='start';const caption=root.querySelector('#sceneGuide');caption.hidden=false;caption.textContent=cfg.start.removeDefault?(removed?'엔트리봇 삭제 완료':'엔트리봇 옆 ×를 눌러 삭제합니다.'):'오브젝트 추가를 준비합니다.';}
 }
 function syncSettings(){
  const completed=settings.filter((entry,i)=>i<settingIndex||i===settingIndex&&settingPhase===3);
  if(cfg.projectState)for(const entry of settings){const included=completed.includes(entry),state=cfg.projectState;
   if(entry.kind==='변수'){state.variables??={};if(included)state.variables[entry.name]??=entry.value;else delete state.variables[entry.name];}
   else{const key=entry.kind==='신호'?'signals':'sounds';state[key]??=[];if(included&&!state[key].includes(entry.name))state[key].push(entry.name);if(!included)state[key]=state[key].filter(name=>name!==entry.name);}
  }
  return completed;
 }
 function updateSettings(){
  if(settingIndex<0||!settings.length)return;
  extension.hidden=true;root.querySelector('.entry-setup-property').hidden=false;
  const current=settings[Math.min(settingIndex,settings.length-1)],kind=current.kind,form=root.querySelector('#variableChooser'),input=form.querySelector('input[type=text]');
  setupTabs.forEach(tab=>tab.classList.toggle('active',tab.textContent===(kind==='소리'?'소리':'속성')));
  root.querySelector('#selectVariableTab').classList.toggle('active',kind==='변수');root.querySelector('.entry-setup-categories').children[2].classList.toggle('active',kind==='신호');
  const open=root.querySelector('#openVariableChooser');open.textContent=kind+' 추가하기';open.hidden=settingPhase===0;form.hidden=settingPhase!==2;
  form.querySelector('label').firstChild.textContent=kind+' 이름';input.value=current.name;input.setAttribute('aria-label',kind+' 이름');form.querySelector('#confirmVariable').textContent=kind+' 추가';
  form.querySelectorAll('label:has(input[type=radio])').forEach(label=>label.hidden=kind!=='변수');form.querySelector('.entry-variable-scope').textContent=kind==='소리'?(current.object?current.object+' 오브젝트의 소리':'오브젝트의 소리'):'모든 오브젝트에서 사용';root.querySelector('#setupVariable').hidden=true;
  const completed=syncSettings();
  const names=completed.filter(entry=>entry.kind===kind).map(entry=>entry.name);root.querySelector('#variableFolder').firstChild.textContent=kind+' · '+names.join(' / ')+' (';root.querySelector('#variableCount').textContent=names.length;
  const variable=completed.find(entry=>entry.kind==='변수');root.querySelector('#stageVariable').hidden=!variable;if(variable){root.querySelector('#stageVariableName').textContent=variable.name;root.querySelector('#stageVariableValue').textContent=cfg.projectState?.variables[variable.name]??variable.value;}
  const caption=root.querySelector('#sceneGuide');caption.hidden=false;caption.textContent=ready?'코딩 전 설정 완료':settingPhase===0?(kind==='소리'?'소리':('속성 → '+kind)):settingPhase===1?kind+' 추가하기':settingPhase===2?kind+' 이름 · '+current.name:current.name+' 추가 완료';
 }
 root.addEventListener('click',event=>{if(settingIndex<0)return;const target=event.target.closest('button,span');if(!target)return;
  if(target.id==='openVariableChooser'||target.id==='confirmVariable'||target.id==='selectVariableTab'||target===root.querySelector('.entry-setup-categories').children[2]||target.hasAttribute('data-setup-close')){
   event.preventDefault();event.stopImmediatePropagation();settingPhase=target.id==='confirmVariable'?3:target.id==='openVariableChooser'?2:1;updateScene();
  }
 },true);
 function nextSetting(){if(settingPhase<3)settingPhase++;else if(settingIndex<settings.length-1){settingIndex++;settingPhase=0;}else{ready=true;root.dataset.ready='true';updateScene();cfg.onNext();return;}updateScene();}

 const propertyObjects=cfg.objectProperties||[],propertyKeys=['x','y','size','direction'],propertyDefaults={x:0,y:0,size:100,direction:0};
 const propertyInitials=propertyObjects.map(o=>({...propertyDefaults,...o.initial}));
 const propertyTargets=propertyObjects.map(o=>({...o.model}));let propertyIndex=0;
 const initialLocks=propertyObjects.map(o=>!!o.sizeLocked),sizeLocks=[...initialLocks];
 const sizeLock=document.createElement('button');sizeLock.type='button';sizeLock.className='coding-size-lock';sizeLock.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path data-shackle></path><rect x="5" y="11" width="14" height="10" rx="2"></rect></svg>';
 sizeLock.onclick=()=>{sizeLocks[propertyIndex]=!sizeLocks[propertyIndex];showPropertyCard(propertyIndex);};
 const propertyOrder=propertyObjects.map((o,index)=>index);const firstProperty=cfg.firstProperty===undefined?-1:propertyObjects.findIndex(o=>o.id===cfg.firstProperty);if(firstProperty>=0)propertyOrder.unshift(...propertyOrder.splice(propertyOrder.indexOf(firstProperty),1));
 const propertyRank=index=>propertyOrder.indexOf(index);
 const propertySteps=[];
 propertyOrder.forEach(index=>{const o=propertyObjects[index];if(o.model.background)return;if(o.propertySteps){for(const step of o.propertySteps)propertySteps.push({objectIndex:index,field:3,caption:step.caption,render:()=>showProperties(index,3,step)});}else for(const field of [0,...(o.fields||propertyKeys).map(key=>propertyKeys.indexOf(key)+1)])propertySteps.push({objectIndex:index,field,caption:o.model.name+' · 위치·크기·방향 설정',render:ui=>showProperties(index,field)});});
 const extraSteps=[...propertySteps,...(cfg.extraSteps||[])];
 const selectedObjects=new Set();let batchPhase=0;
 const batch=cfg.objectSelection;
 if(batch)root.dataset.setupMultiple='true';
 const splitGuide=document.createElement('div');splitGuide.className='coding-setup-split-guide';splitGuide.setAttribute('role','note');splitGuide.hidden=true;splitGuide.innerHTML='<strong>시작 블록과 아래 블록을 분리</strong><span>장면 1의 코드가 장면 2의 코드에 영향을 주지 않도록 합니다.</span>';
 const splitMark=document.createElement('div');splitMark.className='coding-setup-split-mark';splitMark.hidden=true;splitMark.setAttribute('aria-hidden','true');
 initial.append(splitMark,splitGuide);
 function positionSplitGuide(){
  const visible=cfg.start?.split!==false&&!fresh&&addScene&&sceneStep===0&&startPhase===0;splitGuide.hidden=splitMark.hidden=!visible;if(!visible)return;
  const scripts=renderer.scripts,index=scripts.findIndex(script=>script.blocks[0]?.type==='event'),first=scripts[index],rest=scripts[index+1],target=rest&&renderer.blocks.get(rest.blocks[0].id),start=first&&renderer.blocks.get(first.blocks[0].id);
  if(!target||!start)return;
  const box=initial.getBoundingClientRect(),at=target.getBoundingClientRect(),head=start.getBoundingClientRect(),scaleX=box.width/(initial.offsetWidth||box.width)||1,scaleY=box.height/(initial.offsetHeight||box.height)||1;
  const x=(at.left-box.left)/scaleX,y=((head.bottom+at.top)/2-box.top)/scaleY,width=Math.min(at.width,head.width)/scaleX;
  splitMark.style.left=x+'px';splitMark.style.top=y+'px';splitMark.style.width=width+'px';
  splitGuide.style.left=(x+width+24)+'px';splitGuide.style.top=y+'px';
 }
 function paintObjects(editedSizeIndex=-1){
  const canvas=root.querySelector('.entry-setup-canvas');let layer=canvas.querySelector('.coding-setup-stage');
  if(!layer){layer=document.createElement('div');layer.className='coding-setup-stage';canvas.append(layer)}
  const background=propertyObjects.find(o=>o.model.background);layer.style.background=background?'url("'+background.image+'") center/100% 100%':'white';
  layer.replaceChildren();for(const [index,o]of propertyObjects.entries()){if(o.model.background)continue;const model=o.model,img=document.createElement('img');img.src=o.image;img.alt=model.name;img.dataset.setupSprite=index;
   // Keep the Entry size value separate from the pre-size-step visual footprint.
   const step=propertySteps[extraIndex],initialSize=sceneStep===5&&!extraComplete&&
    (extraIndex<0||step&&(propertyRank(index)>propertyRank(step.objectIndex)||index===step.objectIndex&&step.field<3));
   const normalized=initialSize&&index!==editedSizeIndex&&model.size===propertyInitials[index].size;
   const fitInitial=()=>{const w=img.naturalWidth||o.width,h=img.naturalHeight||o.height||w;img.style.width=(64*w/Math.max(w,h)/480*100)+'%'};
   Object.assign(img.style,{left:(50+model.x/480*100)+'%',top:(50-model.y/270*100)+'%',width:(Math.min(o.width||img.naturalWidth||160,480/3)*model.size/100/480*100)+'%',transform:'translate(-50%,-50%)'});
   if(normalized){img.onload=fitInitial;fitInitial();}if(o.layer==='back')layer.prepend(img);else layer.append(img)}
 }
 function showPropertyCard(index){
  propertyIndex=index;const o=propertyObjects[index],panel=root.querySelector('#ledProperty'),heading=root.querySelector('#propertyLedName');heading.innerHTML=objectIcon(cfg,o.id);heading.append(document.createTextNode(o.model.name));panel.hidden=false;
  root.querySelectorAll('[data-setup-object]').forEach(row=>{row.hidden=Number(row.dataset.setupObject)===index;row.classList.toggle('selected',Number(row.dataset.setupObject)===index)});
  root.querySelectorAll('#ledProperty input').forEach((input,i)=>{const key=propertyKeys[i];input.value=o.display?.[key]??o.model[key];input.disabled=(!!o.fields&&!o.fields.includes(key))||(key==='size'&&sizeLocks[index]);input.dataset.property=key;});
  const locked=sizeLocks[index];sizeLock.dataset.locked=String(locked);sizeLock.setAttribute('aria-pressed',String(locked));sizeLock.setAttribute('aria-label',locked?'크기 잠금 해제':'크기 잠금');sizeLock.title=locked?'크기 잠김 — 클릭하여 잠금 해제':'크기 편집 가능 — 클릭하여 잠금';sizeLock.disabled=!!o.fields&&!o.fields.includes('size');sizeLock.querySelector('[data-shackle]').setAttribute('d',locked?'M7 11V7a5 5 0 0 1 10 0v4':'M7 11V7a5 5 0 0 1 9.8-1.4');
 }
 function clearPropertyFocus(){sizeLock.classList.remove('coding-lock-current','coding-lock-click');root.querySelector('[data-property="size"]')?.classList.remove('coding-size-current');}
 function showProperties(index,field,step){
  extraUI.content.previousElementSibling.hidden=true;
  for(let i=0;i<propertyObjects.length;i++){const o=propertyObjects[i];if(o.model.background)continue;propertyKeys.forEach((key,k)=>o.model[key]=propertyRank(i)<propertyRank(index)||i===index&&k<field?propertyTargets[i][key]:propertyInitials[i][key]);}
  clearPropertyFocus();
  if(step){const object=propertyObjects[index];object.model.size=step.from??step.size;if(step.action!=='unlock'&&step.action!=='lock')sizeLocks[index]=step.locked;showPropertyCard(index);
   if((step.action==='unlock'||step.action==='lock')&&sizeLocks[index]!==step.locked)sizeLock.click();
   const input=root.querySelector('[data-property="size"]');if(step.action==='size'){input.value=step.size;input.dispatchEvent(new Event('input',{bubbles:true}));}
   sizeLock.classList.toggle('coding-lock-current',step.highlight==='lock');sizeLock.classList.toggle('coding-lock-click',step.action==='unlock'||step.action==='lock');input.classList.toggle('coding-size-current',step.highlight==='size');
  }else showPropertyCard(index);
  root.querySelectorAll('#ledProperty label').forEach((label,i)=>label.classList.toggle('coding-property-current',!step&&i===field-1));paintObjects();
 }
 function updateObjects(){
  if(!propertyObjects.length)return;const added=sceneStep>=5;root.dataset.setupProperties=String(added);
  const layer=root.querySelector('.coding-setup-stage');if(layer)layer.hidden=!added;
  if(!added){root.querySelectorAll('[data-setup-object]').forEach(row=>row.hidden=true);root.querySelector('.entry-setup-bot-object').hidden=false;return;}
  const list=root.querySelector('.entry-setup-objects'),panel=root.querySelector('#ledProperty');list.querySelector('.entry-setup-bot-object').hidden=true;root.querySelector('.added-led').hidden=true;
  if(!list.querySelector('[data-setup-object]')){
   list.querySelector('span').after(panel);
   propertyObjects.forEach((o,index)=>{const row=document.createElement('button');row.type='button';row.className='entry-setup-object';row.dataset.setupObject=index;row.innerHTML=objectIcon(cfg,o.id);row.append(document.createTextNode(o.model.name));row.onclick=()=>{if(!o.model.background)showPropertyCard(index)};list.append(row)});
   root.querySelectorAll('#ledProperty label').forEach((label,i)=>{const input=label.querySelector('input');label.replaceChildren(document.createTextNode(['X','Y','크기 %','방향 °'][i]),input,...(i===2?[sizeLock]:[]));input.oninput=()=>{if(input.disabled)return;const value=Number(input.value);if(Number.isFinite(value)){propertyObjects[propertyIndex].model[propertyKeys[i]]=value;paintObjects(i===2?propertyIndex:-1)}}});
  }
  if(sceneStep===5&&extraIndex<0)propertyObjects.forEach((o,i)=>{if(!o.model.background)Object.assign(o.model,propertyInitials[i])});
  if(extraIndex<0){clearPropertyFocus();showPropertyCard(propertyIndex);}paintObjects();
 }
 function snapshot(){const scripts=E.clone(fresh?[]:(cfg.initialScripts?.()||[]));E.walk(scripts,n=>{delete n.run;delete n.group});const split=[];for(const script of scripts){if(cfg.start?.split===false){split.push(script);continue;}const first=script.blocks[0];if(first?.type==='event')split.push({id:'setup-start-'+script.id,blocks:[first]});const rest=first?.type==='event'?script.blocks.slice(1):script.blocks;if(rest.length)split.push({id:'setup-rest-'+script.id,blocks:rest});}renderer.render(split);requestAnimationFrame(()=>{renderer.reflow();positionSplitGuide()});}
 const extension=document.createElement('div');extension.className='coding-setup-extension';extension.hidden=true;root.querySelector('.entry-setup-right').append(extension);
 const tip=document.createElement('div');tip.className='coding-setup-tip';tip.hidden=true;tip.setAttribute('role','note');root.querySelector('.entry-workspace').append(tip);
 const setupTabs=[...root.querySelector('.entry-setup-tabs').children];
 const extraUI={root,content:extension,
  listCostumes(host,order){host.replaceChildren();host.classList.add('coding-setup-costumes');order.forEach((value,index)=>{const row=document.createElement('div');row.className='coding-setup-costume';row.dataset.costume=value;const badge=document.createElement('b');badge.className='coding-setup-costume-index';badge.textContent=index+1;const icon=cfg.costumePreview(value);icon.classList.add('coding-setup-costume-icon');const label=document.createElement('span');label.textContent=cfg.costumeLabel(value);const size=document.createElement('small');size.textContent=cfg.costumeSize||'';label.append(size);row.append(badge,icon,label);host.append(row)});return host;},
  showTip(text,detail,render){tip.replaceChildren();const title=document.createElement('strong'),note=document.createElement('p'),body=document.createElement('div');title.textContent=text;note.textContent=detail;tip.append(title,note,body);render?.(body);tip.hidden=false;},
  hideTip(){tip.hidden=true;tip.replaceChildren();}
 };
 function updateExtra(){const current=extraIndex>=0?extraSteps[extraIndex]:null;extension.hidden=!current;root.querySelector('.entry-setup-property').hidden=!!current;setupTabs.forEach(tab=>tab.classList.toggle('active',tab.textContent===(current?.tab||'속성')));if(current){const caption=root.querySelector('#sceneGuide');caption.textContent=current.caption||'';caption.hidden=!current.caption;extension.replaceChildren();const tools=document.createElement('div');tools.className='coding-setup-costume-tools';tools.textContent='모양 추가하기　　새로 그리기';extension.append(tools);const body=document.createElement('div');extension.append(body);extraUI.content=body;current.render(extraUI);}else extraUI.hideTip();}
 let sceneStep=0;
let objectStage='select';
let manualSetupDialog=null;
const defaultObject=cfg.defaultId,maxStep=cfg.slider?10:8;
let chosenLed=defaultObject;
let selectedLed=null;
const ledNames=Object.fromEntries(cfg.options.map(o=>[o.id,o.name]));
const ledColors=Object.fromEntries(cfg.options.map(o=>[o.id,o.color||'object']));
function updateSetupNumbers(slide,step,objectStage){
 const markers=new Map([...slide.querySelectorAll('.setup-number')].map(marker=>[Number(marker.textContent),marker]));
 markers.forEach(marker=>{marker.style.display='none';marker.style.left='';marker.style.top='';});
 const entries=[];
 const add=(number,selector,direction='left',offsetY=0)=>{
  const target=slide.querySelector(selector);
  if(target&&target.getClientRects().length)entries.push({number,target,direction,offsetY});
 };
 if(step===0&&startPhase===1)add(1,'#sceneAdd','right');
 if(step===1){add(1,'[data-scene="2"]','right');add(2,'#openObjectChooser','right');}
 if(step===2||step===3||(step===4&&(objectStage==='select'||objectStage==='confirm')))add(3,'#objectSearch','left');
 if((batch&&(step===2||step===3))||(step===4&&(objectStage==='select'||objectStage==='confirm')))add(4,batch?'#ledOptions [data-led-option]:not([hidden])':'#ledOptions .selected','left');
 if(step===4&&objectStage==='confirm')add(5,'#confirmObject','left',-35/58.8);
 if(step===6){
  add(6,'.entry-setup-tabs .active','left',-34/58.8);
  add(7,'#selectVariableTab','left');
  add(8,'#openVariableChooser','left');
 }
 if(step===7){
  add(6,'.entry-setup-tabs .active','left',-34/58.8);
  add(7,'#selectVariableTab','left');
  add(8,'#openVariableChooser','left');
  add(9,'#variableName','left');
  add(10,'#confirmVariable','left');
 }
 if(step===9)add(11,'#enableVariableSlider','left');
 if(step===10){add(11,'#enableVariableSlider','left');add(12,'#variableMax','right');}
 const slideRect=slide.getBoundingClientRect();
 const scaleX=slideRect.width/(slide.offsetWidth||slideRect.width)||1;
 const scaleY=slideRect.height/(slide.offsetHeight||slideRect.height)||1;
 entries.forEach(({number,target,direction,offsetY})=>{
  const marker=markers.get(number);
  if(!marker)return;
  marker.textContent=String(number);
  marker.style.display='block';
  const box=marker.getBoundingClientRect(),anchor=target.getBoundingClientRect();
  const gap=(box.width/scaleX)*(16/58.8);
  const x=direction==='right'?anchor.right+gap*scaleX:anchor.left-box.width-gap*scaleX;
  const y=anchor.top+box.height*offsetY*scaleY;
  marker.style.left=((x-slideRect.left)/scaleX)+'px';
  marker.style.top=((y-slideRect.top)/scaleY)+'px';
 });
}
function positionObjectCompleteCallout(slide,step){
 const bubble=slide.querySelector('#objectCompleteCallout');
 const caption=slide.querySelector('#sceneGuide');
 if(!bubble)return;
 const visible=step===5&&extraIndex<0;
 bubble.hidden=!visible;
 if(caption)caption.hidden=visible||(sceneStep===0&&startPhase===0);
 if(!visible)return;
 const led=slide.querySelector('.entry-setup-led')?.getBoundingClientRect();
 const actions=slide.querySelector('.entry-setup-actions')?.getBoundingClientRect();
 const stage=slide.querySelector('.entry-setup-stage');
 if(!led||!actions||!stage)return;
 const stageRect=stage.getBoundingClientRect();
 const scaleX=stageRect.width/(stage.offsetWidth||stageRect.width)||1;
 const scaleY=stageRect.height/(stage.offsetHeight||stageRect.height)||1;
 bubble.style.left=((led.left+led.width/2-stageRect.left)/scaleX)+'px';
 bubble.style.top=(((led.bottom+actions.top)/2-stageRect.top)/scaleY)+'px';
}
function updateScene(){
 const slide=root;if(!slide)return;
 const step=sceneStep, second=slide.querySelector('[data-scene="2"]');
 root.querySelector('.coding-setup-initial').hidden=step!==0;
 slide.querySelector('#sceneAdd').disabled=step===0&&startPhase===0;
 slide.querySelector('#sceneAdd').classList.toggle('coding-setup-add-focus',step===0&&startPhase===1);
 positionSplitGuide();
 second.hidden=step<1;
 second.classList.toggle('active',step>=1);
 slide.querySelector('[data-scene="1"]').classList.toggle('active',step<1);
 const layout=slide.querySelector('.entry-setup-layout');
 layout.dataset.setupStep=step===0&&startPhase===0?'split':String(step);
 layout.dataset.objectStage=step===4?objectStage:'';
 const objectDialog=slide.querySelector('#objectChooser');
 const objectOpen=manualSetupDialog==='object'||(!manualSetupDialog&&step>=2&&step<=4);
 objectDialog.hidden=!objectOpen;
 objectDialog.setAttribute('aria-hidden',String(!objectOpen));
 const search=slide.querySelector('#objectSearch');
 if(!manualSetupDialog)search.value=step>=2?(batch?batch[batchPhase].search:cfg.search):'';
 if(batch){
 const term=search.value.trim();options.hidden=!term;
 options.querySelectorAll('[data-led-option]').forEach(button=>{const id=Number(button.dataset.ledOption);button.hidden=!ledNames[id].includes(term);button.classList.toggle('selected',selectedObjects.has(id));});
 const preview=slide.querySelector('#objectSelectedPreview');preview.hidden=!selectedObjects.size;preview.replaceChildren();
 for(const id of selectedObjects){const row=document.createElement('div');row.innerHTML=icon(id)+'<span>'+ledNames[id]+'</span>';preview.append(row)}
 slide.querySelector('#objectSelectedCount').textContent=selectedObjects.size;
 slide.querySelector('#confirmObject').disabled=selectedObjects.size!==cfg.options.length;
 }else{
 slide.querySelector('#ledOptions').hidden=!search.value.trim().toUpperCase().includes(cfg.search.toUpperCase());
 slide.querySelectorAll('[data-led-option]').forEach(button=>button.classList.toggle('selected',Number(button.dataset.ledOption)===selectedLed));
 const preview=slide.querySelector('#objectSelectedPreview');
 preview.hidden=!selectedLed;preview.className=selectedLed?ledColors[selectedLed]:'';
 slide.querySelector('#objectSelectedCount').textContent=selectedLed?'1':'0';
 slide.querySelector('#objectSelectedName').textContent=ledNames[selectedLed||defaultObject];
 slide.querySelector('#confirmObject').disabled=!selectedLed;
 }
 const led=slide.querySelector('.entry-setup-led');
 if(led.dataset.objectId!==String(chosenLed)){led.dataset.objectId=chosenLed;led.innerHTML=icon(chosenLed)+'<span class="entry-selection-handles" aria-hidden="true"></span>';slide.querySelector('.entry-object-icon').innerHTML=icon(chosenLed);}
 if(!batch){slide.querySelector('#objectSelectedPreview .entry-led-icon')?.remove();slide.querySelector('#objectSelectedPreview').insertAdjacentHTML('afterbegin',icon(selectedLed||defaultObject));}
 led.className='entry-setup-led '+ledColors[chosenLed];
 led.setAttribute('aria-label','추가한 '+ledNames[chosenLed]+' 오브젝트');
 slide.querySelector('.added-led').className='entry-setup-object added-led '+ledColors[chosenLed];
 const objectName=slide.querySelector('#addedLedLabel');
 if(document.activeElement!==objectName&&step<5)objectName.value=ledNames[chosenLed];
 slide.querySelector('#propertyLedName').textContent=objectName.value||ledNames[chosenLed];
 slide.querySelector('#ledProperty').hidden=step<5;
 const variableTab=slide.querySelector('#selectVariableTab');
 variableTab.classList.toggle('active',step>=6);
 slide.querySelector('#openVariableChooser').hidden=step<6;
 slide.querySelector('#variableFolder').hidden=step<6;
 slide.querySelector('#variableChooser').hidden=step!==7&&manualSetupDialog!=='variable';
 slide.querySelector('#setupVariable').hidden=step<8;
 slide.querySelector('#variableCount').textContent=step>=8?'1':'0';
 const name=slide.querySelector('#variableName').value.trim()||cfg.variable;
 slide.querySelector('#variablePropertyName').value=name;
 slide.querySelector('#stageVariableName').textContent=name;
  const stageVariable=slide.querySelector('#stageVariable');
 stageVariable.hidden=step<8;
 const sliderOn=cfg.slider&&step>=9;
 slide.querySelector('#enableVariableSlider').checked=sliderOn;
 slide.querySelector('#variableRange').hidden=!sliderOn;
 slide.querySelector('#stageVariableSlider').hidden=!sliderOn;
 slide.querySelector('#variableMax').value=step>=10?'255':'100';
 slide.querySelector('#stageVariableSlider').max=slide.querySelector('#variableMax').value;
 const captions=[
   '장면 1 옆의 +를 눌러 새 장면을 만듭니다.',
   '+오브젝트 추가하기 버튼을 클릭합니다.',
   '',
   cfg.searchTip||cfg.search+'를 검색합니다.',
   '선택한 오브젝트가 전체 리스트에 표기 됩니다',
   '추가한 오브젝트의 이름과 위치, 크기를 설정할 수 있습니다.',
   '속성 탭에서 변수를 선택합니다.',
   '변수 이름에 '+cfg.variable+'를 입력합니다.',
   cfg.variable+' 변수가 기본값 0으로 장면에 표시됩니다.',
   '슬라이드를 체크하면 장면의 변수 표시가 슬라이드로 바뀝니다.',
   '슬라이드 값 범위를 0부터 255까지 설정했습니다.'
 ];
 slide.querySelector('#sceneGuide').textContent=step===4&&objectStage==='confirm'
  ?'추가하기 버튼을 누르면 선택한 오브젝트가 추가됩니다.'
  :step===0&&startPhase===0?'':captions[step];
 updateSetupNumbers(slide,step,step===4?objectStage:'');
 positionObjectCompleteCallout(slide,step);
 updateObjects();
 updateExtra();
 updateStart();
 updateSettings();
 cfg.onRender?.({root,step,extraIndex,selected:[...selectedObjects],added:step>=5});
}
window.addEventListener('resize',()=>{
 const slide=root,layout=slide?.querySelector('.entry-setup-layout');
 if(slide?.classList.contains('active')&&layout){updateSetupNumbers(slide,Number(layout.dataset.setupStep),layout.dataset.objectStage);positionObjectCompleteCallout(slide,Number(layout.dataset.setupStep));positionSplitGuide();}
});
function advanceSetup(){
 if(settingIndex>=0){if(ready){cfg.onNext();return;}nextSetting();return;}
 if(fresh&&sceneStep===0){if(cfg.start.removeDefault&&startPhase===0){startPhase=1;updateScene();return;}sceneStep=1;updateScene();return;}

 if(sceneStep===0&&startPhase===0){startPhase=1;updateScene();return;}
 if(sceneStep===5&&extraSteps.length&&!extraComplete){
  if(extraIndex>=0)extraSteps[extraIndex].leave?.(extraUI);
  if(extraIndex<extraSteps.length-1){extraIndex++;updateScene();return;}
  extraIndex=-1;extraComplete=true;
 }
 if(sceneStep===5&&settings.length){sceneStep=6;settingIndex=0;settingPhase=0;updateScene();return;}
 if(manualSetupDialog)manualSetupDialog=null;
 if(sceneStep===1){sceneStep=3;updateScene();return;}
 if(batch&&(sceneStep===3||sceneStep===4)){
  const phase=batch[batchPhase];if(phase.select)selectedObjects.add(phase.select);
  if(batchPhase<batch.length-1){batchPhase++;sceneStep=4;const next=batch[batchPhase];if(next.select)selectedObjects.add(next.select);objectStage=next.confirm?'confirm':'select';updateScene();return;}
  if(selectedObjects.size!==cfg.options.length)return;chosenLed=defaultObject;sceneStep=5;if(firstProperty>=0)extraIndex=0;manualSetupDialog=null;updateScene();return;
 }
 if(sceneStep===4){
  if(!selectedLed)return;
  if(objectStage==='confirm'){
   chosenLed=selectedLed;
   root.querySelector('#addedLedLabel').value=ledNames[chosenLed];
   sceneStep=5;
   objectStage='select';
   manualSetupDialog=null;
   updateScene();
   return;
  }
  objectStage='confirm';updateScene();return;
 }
 if(sceneStep<maxStep){
  sceneStep++;
  if(sceneStep===4)selectedLed=defaultObject;
  if(sceneStep===5)chosenLed=selectedLed||defaultObject;
  if(sceneStep===7)root.querySelector('#variableName').value=cfg.variable;
  updateScene();
 }else cfg.onNext();
}
function previousSetup(){
 if(cfg.settingsOnly&&settingIndex===0&&settingPhase===0){cfg.onPrevious();return;}
 if(settingIndex>=0){ready=false;root.dataset.ready='false';if(settingPhase>0)settingPhase--;else if(settingIndex>0){settingIndex--;settingPhase=3;}else{settingIndex=-1;sceneStep=5;extraIndex=extraSteps.length-1;extraComplete=false;}updateScene();return;}
 if(fresh&&sceneStep===1){sceneStep=0;startPhase=cfg.start.removeDefault?1:0;updateScene();return;}

 if(sceneStep===0&&startPhase===1&&cfg.start?.split!==false){startPhase=0;updateScene();return;}
 if(extraIndex>=0){extraSteps[extraIndex].leave?.(extraUI);extraIndex--;updateScene();return;}
 if(sceneStep===6&&extraSteps.length){sceneStep=5;extraIndex=extraSteps.length-1;extraComplete=false;updateScene();return;}
 if(manualSetupDialog){manualSetupDialog=null;updateScene();return;}
 if(!batch&&sceneStep===4&&objectStage==='confirm'){objectStage='select';updateScene();return;}
 if(batch&&sceneStep===4&&batchPhase>0){const phase=batch[batchPhase];if(phase.select)selectedObjects.delete(phase.select);batchPhase--;objectStage=batch[batchPhase].confirm?'confirm':'select';updateScene();return;}
 if(batch&&sceneStep===5){batchPhase=batch.length-1;sceneStep=4;objectStage='confirm';updateScene();return;}
 if(sceneStep>0){sceneStep--;if(sceneStep===0)startPhase=1;selectedLed=sceneStep>=4?chosenLed:null;updateScene();}
 else cfg.onPrevious();
}
root.querySelector('#sceneAdd')?.addEventListener('click',()=>{sceneStep=1;objectStage='select';manualSetupDialog=null;selectedLed=null;updateScene();});
root.querySelector('[data-scene="2"]')?.addEventListener('click',()=>{sceneStep=1;objectStage='select';manualSetupDialog=null;selectedLed=null;updateScene();});
root.querySelector('#addedLedLabel')?.addEventListener('input',event=>{root.querySelector('#propertyLedName').textContent=event.target.value;});
root.querySelector('#variablePropertyName')?.addEventListener('input',event=>{root.querySelector('#stageVariableName').textContent=event.target.value;root.querySelector('#variableName').value=event.target.value;});
root.querySelector('#variableDefault')?.addEventListener('input',event=>{root.querySelector('#stageVariableValue').textContent=event.target.value;});
root.querySelector('#openObjectChooser')?.addEventListener('click',()=>{manualSetupDialog='object';sceneStep=Math.max(3,sceneStep);selectedLed=null;root.querySelector('#objectSearch').value='';updateScene();});
root.querySelector('#selectVariableTab')?.addEventListener('click',()=>{sceneStep=Math.max(6,sceneStep);updateScene();});
root.querySelector('#openVariableChooser')?.addEventListener('click',()=>{sceneStep=Math.max(7,sceneStep);manualSetupDialog='variable';updateScene();});
root.querySelectorAll('.entry-setup-slide [data-setup-close]').forEach(button=>button.addEventListener('click',()=>{manualSetupDialog=null;if(sceneStep===7)sceneStep=6;updateScene();}));
root.querySelector('#objectSearch')?.addEventListener('input',event=>{
 if(batch){const term=event.target.value.trim();options.hidden=!term;options.querySelectorAll('[data-led-option]').forEach(button=>button.hidden=!ledNames[Number(button.dataset.ledOption)].includes(term));return;}
 const found=event.target.value.trim().toUpperCase().includes(cfg.search.toUpperCase());
 root.querySelector('#ledOptions').hidden=!found;
 if(!found){selectedLed=null;updateScene();}
});
root.querySelectorAll('[data-led-option]').forEach(button=>button.addEventListener('click',()=>{
 if(batch){const id=Number(button.dataset.ledOption);selectedObjects.has(id)?selectedObjects.delete(id):selectedObjects.add(id);manualSetupDialog='object';sceneStep=4;updateScene();return;}
 selectedLed=Number(button.dataset.ledOption);sceneStep=Math.max(4,sceneStep);objectStage='select';updateScene();
}));
root.querySelector('#confirmObject')?.addEventListener('click',()=>{
 if(batch){if(selectedObjects.size!==cfg.options.length)return;chosenLed=defaultObject;sceneStep=5;if(firstProperty>=0)extraIndex=0;manualSetupDialog=null;updateScene();return;}
 if(!selectedLed)return;
 chosenLed=selectedLed;
 root.querySelector('#addedLedLabel').value=ledNames[chosenLed];
 document.activeElement?.blur?.();
 if(sceneStep===4&&objectStage==='confirm'){manualSetupDialog=null;updateScene();return;}
 sceneStep=5;objectStage='select';manualSetupDialog=null;
 updateScene();
});
root.querySelector('#confirmVariable')?.addEventListener('click',()=>{sceneStep=8;manualSetupDialog=null;updateScene();});
root.querySelector('#enableVariableSlider')?.addEventListener('change',event=>{sceneStep=event.target.checked?9:8;updateScene();});
root.querySelector('#variableMax')?.addEventListener('change',event=>{if(event.target.value==='255'){sceneStep=10;updateScene();}});
root.querySelector('#stageVariableSlider')?.addEventListener('input',event=>{root.querySelector('#stageVariableValue').textContent=event.target.value;});

 const api={root,projectState:cfg.projectState,get ready(){return ready},get step(){return sceneStep},next:advanceSetup,prev:previousSetup,enter(last=false){if(extraIndex>=0)extraSteps[extraIndex].leave?.(extraUI);sceneStep=cfg.settingsOnly?6:last?maxStep:(fresh||addScene?0:1);settingIndex=cfg.settingsOnly?(last?settings.length-1:0):last&&settings.length?settings.length-1:-1;settingPhase=last?3:0;ready=last;root.dataset.ready=String(ready);if(settings.length)syncSettings();propertyIndex=0;batchPhase=0;selectedObjects.clear();if(last&&batch)cfg.options.forEach(o=>selectedObjects.add(o.id));startPhase=cfg.start?.split===false?1:0;extraIndex=-1;extraComplete=last;sizeLocks.splice(0,sizeLocks.length,...initialLocks);propertyObjects.forEach((o,i)=>{if(o.propertySteps)Object.assign(o.model,last?propertyTargets[i]:propertyInitials[i]);});cfg.reset?.(last);manualSetupDialog=null;selectedLed=null;objectStage='select';snapshot();updateScene();requestAnimationFrame(updateScene)}};
 api.enter();return api;
}
function insert(cfg){
 const original=[...document.querySelectorAll('main.wrap>.slide')].filter(n=>!n.classList.contains('hardware-connect-slide')),before=original[cfg.nextIndex];
 const api=mount({...cfg,before,onNext:()=>leave(cfg.nextIndex),onPrevious:()=>leave(cfg.previousIndex)});
 const info=before.querySelector('.entry-object-info'),thumb=document.createElement('span');
 thumb.className='entrybot-thumb coding-setup-object-thumb';thumb.setAttribute('aria-label',cfg.options.find(o=>o.id===cfg.defaultId).name);thumb.innerHTML=objectIcon(cfg,cfg.defaultId);if(info)info.prepend(thumb);
 if(cfg.kind==='dc'){before.querySelector('.dc5-workspace>.dc5-object-button')?.remove();thumb.id='dc5Button';}

 const sidebar=document.createElement('button');sidebar.type='button';sidebar.className='slide-sidebar-item';sidebar.innerHTML='<span class="sidebar-page-no"></span><span>코딩 전 설정</span>';
 const list=document.querySelector('#slideSidebarList');list.insertBefore(sidebar,list.children[[...document.querySelectorAll('main.wrap>.slide')].indexOf(api.root)]);
 let active=false,bypass=false,resume=cfg.resume||(n=>window.infoMotorController.showPage(n));
 function refresh(){const pages=[...document.querySelectorAll('main.wrap>.slide')],index=pages.findIndex(n=>n.classList.contains('active'));[...list.children].forEach((n,i)=>n.classList.toggle('active',i===index));window.lessonPages.refresh();}
 function enter(last=false,callback=resume){resume=callback;active=true;document.querySelectorAll('main.wrap>.slide').forEach(n=>n.classList.toggle('active',n===api.root));document.body.classList.add('entry-page','after-intro');api.enter(last);document.querySelector('#next').disabled=false;document.querySelector('#prev').disabled=false;refresh();}
 function leave(to){active=false;api.root.classList.remove('active');bypass=true;try{resume(to)}finally{bypass=false}refresh();}
 const hardware=window.hardwareConnect,previous=hardware.before.bind(hardware);
 hardware.before=function(from,to,callback){if(bypass)return previous(from,to,callback);if(active){active=false;api.root.classList.remove('active');requestAnimationFrame(refresh);return previous(from,to,callback)}
 if((from===cfg.previousIndex&&to===cfg.nextIndex)||(from===cfg.nextIndex&&to===cfg.previousIndex)){enter(to===cfg.previousIndex,callback);return true}requestAnimationFrame(refresh);return previous(from,to,callback)};
 list.addEventListener('click',event=>{const target=event.target.closest('button');if(target&&target!==sidebar){active=false;api.root.classList.remove('active');bypass=true;setTimeout(()=>{bypass=false;refresh()},0)}},true);
 sidebar.addEventListener('click',()=>{resume(cfg.nextIndex);if(!active)enter()});
 for(const [selector,action]of [['#next',()=>api.next()],['#prev',()=>api.prev()]])document.querySelector(selector).addEventListener('click',event=>{if(active){event.preventDefault();event.stopImmediatePropagation();action();refresh()}},true);
 document.addEventListener('keydown',event=>{if(!active||/input|textarea|select/i.test(event.target.tagName))return;const direction=window.lessonUI.direction(event);if(direction){event.preventDefault();event.stopImmediatePropagation();direction>0?api.next():api.prev();refresh()}},true);
 window.lessonPages.refresh();return api;
}
window.EntryCodingSetup={mount,insert};
})();



