/* Textbook p.177 scripts and basic observation; shared Controller owns block construction. */
(()=>{'use strict';const E=EntryEngine;
const programs={"basic":[{"id":"basic-repeat","type":"c","category":"flow","parts":[{"text":"계속 반복하기"}],"branches":[[{"id":"basic-blue-off","type":"command","category":"hardware","parts":[{"text":"디지털"},{"slot":{"id":"pin","value":{"kind":"dropdown","value":11}}},{"text":"번 핀"},{"slot":{"id":"action","value":{"kind":"dropdown","value":"끄기"}}}]},{"id":"basic-red-on","type":"command","category":"hardware","parts":[{"text":"디지털"},{"slot":{"id":"pin","value":{"kind":"dropdown","value":9}}},{"text":"번 핀"},{"slot":{"id":"action","value":{"kind":"dropdown","value":"켜기"}}}]},{"id":"basic-wait-red","type":"command","category":"flow","parts":[{"slot":{"id":"seconds","value":{"kind":"number","value":0.5}}},{"text":"초 기다리기"}]},{"id":"basic-red-off","type":"command","category":"hardware","parts":[{"text":"디지털"},{"slot":{"id":"pin","value":{"kind":"dropdown","value":9}}},{"text":"번 핀"},{"slot":{"id":"action","value":{"kind":"dropdown","value":"끄기"}}}]},{"id":"basic-green-on","type":"command","category":"hardware","parts":[{"text":"디지털"},{"slot":{"id":"pin","value":{"kind":"dropdown","value":10}}},{"text":"번 핀"},{"slot":{"id":"action","value":{"kind":"dropdown","value":"켜기"}}}]},{"id":"basic-wait-green","type":"command","category":"flow","parts":[{"slot":{"id":"seconds","value":{"kind":"number","value":0.5}}},{"text":"초 기다리기"}]},{"id":"basic-green-off","type":"command","category":"hardware","parts":[{"text":"디지털"},{"slot":{"id":"pin","value":{"kind":"dropdown","value":10}}},{"text":"번 핀"},{"slot":{"id":"action","value":{"kind":"dropdown","value":"끄기"}}}]},{"id":"basic-blue-on","type":"command","category":"hardware","parts":[{"text":"디지털"},{"slot":{"id":"pin","value":{"kind":"dropdown","value":11}}},{"text":"번 핀"},{"slot":{"id":"action","value":{"kind":"dropdown","value":"켜기"}}}]},{"id":"basic-wait-blue","type":"command","category":"flow","parts":[{"slot":{"id":"seconds","value":{"kind":"number","value":0.5}}},{"text":"초 기다리기"}]}]]}],"mix":[{"id":"mix-repeat","type":"c","category":"flow","parts":[{"text":"계속 반복하기"}],"branches":[[{"id":"mix-output-0","type":"command","category":"hardware","parts":[{"text":"디지털"},{"slot":{"id":"pin","value":{"kind":"dropdown","value":9}}},{"text":"번 핀을"},{"slot":{"id":"value","value":{"kind":"block","block":{"id":"mix-value-0","type":"reporter","category":"data","parts":[{"slot":{"id":"name","value":{"kind":"dropdown","value":"빨강"}}},{"text":"값"}]}}}},{"text":"(으)로 정하기"}]},{"id":"mix-output-1","type":"command","category":"hardware","parts":[{"text":"디지털"},{"slot":{"id":"pin","value":{"kind":"dropdown","value":10}}},{"text":"번 핀을"},{"slot":{"id":"value","value":{"kind":"block","block":{"id":"mix-value-1","type":"reporter","category":"data","parts":[{"slot":{"id":"name","value":{"kind":"dropdown","value":"초록"}}},{"text":"값"}]}}}},{"text":"(으)로 정하기"}]},{"id":"mix-output-2","type":"command","category":"hardware","parts":[{"text":"디지털"},{"slot":{"id":"pin","value":{"kind":"dropdown","value":11}}},{"text":"번 핀을"},{"slot":{"id":"value","value":{"kind":"block","block":{"id":"mix-value-2","type":"reporter","category":"data","parts":[{"slot":{"id":"name","value":{"kind":"dropdown","value":"파랑"}}},{"text":"값"}]}}}},{"text":"(으)로 정하기"}]},{"id":"mix-wait","type":"command","category":"flow","parts":[{"slot":{"id":"seconds","value":{"kind":"number","value":0.5}}},{"text":"초 기다리기"}]}]]}],"handlers":[{"id":"key-w","blocks":[{"id":"w-event","type":"event","category":"start","parts":[{"slot":{"id":"key","value":{"kind":"dropdown","value":"w"}}},{"text":"키를 눌렀을 때"}]},{"id":"w-if","type":"c","category":"flow","parts":[{"text":"만일"},{"slot":{"id":"condition","value":{"kind":"block","block":{"id":"w-compare","type":"boolean","category":"judge","parts":[{"slot":{"id":"left","value":{"kind":"block","block":{"id":"w-value","type":"reporter","category":"data","parts":[{"slot":{"id":"name","value":{"kind":"dropdown","value":"빨강"}}},{"text":"값"}]}}}},{"text":"<"},{"slot":{"id":"limit","value":{"kind":"number","value":255}}}]}}}},{"text":"(이)라면"}],"branches":[[{"id":"w-change","type":"command","category":"data","parts":[{"slot":{"id":"name","value":{"kind":"dropdown","value":"빨강"}}},{"text":"에"},{"slot":{"id":"amount","value":{"kind":"number","value":5}}},{"text":"만큼 더하기"}]}]]}]},{"id":"key-s","blocks":[{"id":"s-event","type":"event","category":"start","parts":[{"slot":{"id":"key","value":{"kind":"dropdown","value":"s"}}},{"text":"키를 눌렀을 때"}]},{"id":"s-if","type":"c","category":"flow","parts":[{"text":"만일"},{"slot":{"id":"condition","value":{"kind":"block","block":{"id":"s-compare","type":"boolean","category":"judge","parts":[{"slot":{"id":"left","value":{"kind":"block","block":{"id":"s-value","type":"reporter","category":"data","parts":[{"slot":{"id":"name","value":{"kind":"dropdown","value":"빨강"}}},{"text":"값"}]}}}},{"text":">"},{"slot":{"id":"limit","value":{"kind":"number","value":0}}}]}}}},{"text":"(이)라면"}],"branches":[[{"id":"s-change","type":"command","category":"data","parts":[{"slot":{"id":"name","value":{"kind":"dropdown","value":"빨강"}}},{"text":"에"},{"slot":{"id":"amount","value":{"kind":"number","value":-5}}},{"text":"만큼 더하기"}]}]]}]},{"id":"key-e","blocks":[{"id":"e-event","type":"event","category":"start","parts":[{"slot":{"id":"key","value":{"kind":"dropdown","value":"e"}}},{"text":"키를 눌렀을 때"}]},{"id":"e-if","type":"c","category":"flow","parts":[{"text":"만일"},{"slot":{"id":"condition","value":{"kind":"block","block":{"id":"e-compare","type":"boolean","category":"judge","parts":[{"slot":{"id":"left","value":{"kind":"block","block":{"id":"e-value","type":"reporter","category":"data","parts":[{"slot":{"id":"name","value":{"kind":"dropdown","value":"초록"}}},{"text":"값"}]}}}},{"text":"<"},{"slot":{"id":"limit","value":{"kind":"number","value":255}}}]}}}},{"text":"(이)라면"}],"branches":[[{"id":"e-change","type":"command","category":"data","parts":[{"slot":{"id":"name","value":{"kind":"dropdown","value":"초록"}}},{"text":"에"},{"slot":{"id":"amount","value":{"kind":"number","value":5}}},{"text":"만큼 더하기"}]}]]}]},{"id":"key-d","blocks":[{"id":"d-event","type":"event","category":"start","parts":[{"slot":{"id":"key","value":{"kind":"dropdown","value":"d"}}},{"text":"키를 눌렀을 때"}]},{"id":"d-if","type":"c","category":"flow","parts":[{"text":"만일"},{"slot":{"id":"condition","value":{"kind":"block","block":{"id":"d-compare","type":"boolean","category":"judge","parts":[{"slot":{"id":"left","value":{"kind":"block","block":{"id":"d-value","type":"reporter","category":"data","parts":[{"slot":{"id":"name","value":{"kind":"dropdown","value":"초록"}}},{"text":"값"}]}}}},{"text":">"},{"slot":{"id":"limit","value":{"kind":"number","value":0}}}]}}}},{"text":"(이)라면"}],"branches":[[{"id":"d-change","type":"command","category":"data","parts":[{"slot":{"id":"name","value":{"kind":"dropdown","value":"초록"}}},{"text":"에"},{"slot":{"id":"amount","value":{"kind":"number","value":-5}}},{"text":"만큼 더하기"}]}]]}]},{"id":"key-r","blocks":[{"id":"r-event","type":"event","category":"start","parts":[{"slot":{"id":"key","value":{"kind":"dropdown","value":"r"}}},{"text":"키를 눌렀을 때"}]},{"id":"r-if","type":"c","category":"flow","parts":[{"text":"만일"},{"slot":{"id":"condition","value":{"kind":"block","block":{"id":"r-compare","type":"boolean","category":"judge","parts":[{"slot":{"id":"left","value":{"kind":"block","block":{"id":"r-value","type":"reporter","category":"data","parts":[{"slot":{"id":"name","value":{"kind":"dropdown","value":"파랑"}}},{"text":"값"}]}}}},{"text":"<"},{"slot":{"id":"limit","value":{"kind":"number","value":255}}}]}}}},{"text":"(이)라면"}],"branches":[[{"id":"r-change","type":"command","category":"data","parts":[{"slot":{"id":"name","value":{"kind":"dropdown","value":"파랑"}}},{"text":"에"},{"slot":{"id":"amount","value":{"kind":"number","value":5}}},{"text":"만큼 더하기"}]}]]}]},{"id":"key-f","blocks":[{"id":"f-event","type":"event","category":"start","parts":[{"slot":{"id":"key","value":{"kind":"dropdown","value":"f"}}},{"text":"키를 눌렀을 때"}]},{"id":"f-if","type":"c","category":"flow","parts":[{"text":"만일"},{"slot":{"id":"condition","value":{"kind":"block","block":{"id":"f-compare","type":"boolean","category":"judge","parts":[{"slot":{"id":"left","value":{"kind":"block","block":{"id":"f-value","type":"reporter","category":"data","parts":[{"slot":{"id":"name","value":{"kind":"dropdown","value":"파랑"}}},{"text":"값"}]}}}},{"text":">"},{"slot":{"id":"limit","value":{"kind":"number","value":0}}}]}}}},{"text":"(이)라면"}],"branches":[[{"id":"f-change","type":"command","category":"data","parts":[{"slot":{"id":"name","value":{"kind":"dropdown","value":"파랑"}}},{"text":"에"},{"slot":{"id":"amount","value":{"kind":"number","value":-5}}},{"text":"만큼 더하기"}]}]]}]}],"keys":[{"key":"w","name":"빨강","channel":0,"limit":255,"delta":5},{"key":"s","name":"빨강","channel":0,"limit":0,"delta":-5},{"key":"e","name":"초록","channel":1,"limit":255,"delta":5},{"key":"d","name":"초록","channel":1,"limit":0,"delta":-5},{"key":"r","name":"파랑","channel":2,"limit":255,"delta":5},{"key":"f","name":"파랑","channel":2,"limit":0,"delta":-5}]};
window.RgbLedCode={programs,controllers:{}};
function mountBasicObservation(controller){
 const root=controller.root,program=controller.program,ns='http://www.w3.org/2000/svg';
 const question=document.createElement('aside');question.className='rgb-basic-question';question.hidden=true;question.textContent='한 가지 색을 켤 때, 나머지 두 색 중 하나만 꺼도 되는 이유는 무엇일까요?';
 const lamps=document.createElement('section');lamps.className='rgb-basic-lamps';lamps.hidden=true;lamps.setAttribute('aria-label','빨강·초록·파랑 전등의 코드 실행');
 const summary=document.createElement('aside');summary.className='rgb-basic-summary';summary.hidden=true;summary.innerHTML='<strong>이전에 켰던 전등만 끄면 돼요!</strong><p>다른 전등은 이미 꺼져 있기 때문이에요.</p>';root.append(summary);
 const colours=['#ef4444','#22c55e','#3b82f6'],names=['빨강','초록','파랑'];
 names.forEach((name,i)=>{const lamp=document.createElement('figure');lamp.className='rgb-basic-lamp';lamp.style.setProperty('--lamp-colour',colours[i]);lamp.innerHTML='<svg viewBox="0 0 100 120" aria-hidden="true"><path d="M30 82V73C30 60 14 56 14 37a36 36 0 0 1 72 0c0 19-16 23-16 36v9Z" fill="currentColor" stroke="#526779" stroke-width="3"/><path d="M29 84h42v19H29ZM36 105h28l-7 10H43Z" fill="#94a3b8" stroke="#526779" stroke-width="3"/></svg><strong>'+name+'<span>'+(i+9)+'번 핀</span></strong>';lamps.append(lamp);});
 root.querySelector('.ec-object-toolbar').insertBefore(question,root.querySelector('.ec-object-source'));root.append(lamps);
 const arrows=document.createElementNS(ns,'svg');arrows.classList.add('rgb-basic-links');arrows.setAttribute('aria-hidden','true');
 const defs=document.createElementNS(ns,'defs'),paths=colours.map((colour,i)=>{const marker=document.createElementNS(ns,'marker');for(const [key,value]of Object.entries({id:'rgb-basic-arrow-'+i,viewBox:'0 0 8 8',refX:8,refY:4,markerWidth:36,markerHeight:28,markerUnits:'userSpaceOnUse',orient:'auto'}))marker.setAttribute(key,value);const tip=document.createElementNS(ns,'path');tip.setAttribute('d','M0 0L8 4L0 8Z');tip.setAttribute('fill',colour);marker.append(tip);defs.append(marker);const path=document.createElementNS(ns,'path');path.setAttribute('fill','none');path.setAttribute('stroke',colour);path.setAttribute('stroke-width',9);path.setAttribute('stroke-linejoin','round');path.setAttribute('pathLength',1);path.setAttribute('marker-end','url(#rgb-basic-arrow-'+i+')');return path;});
 let scope=null,highlighted=null,values=[0,0,0],visibleArrows=0;
 const paint=()=>[...lamps.children].forEach((lamp,i)=>{lamp.classList.toggle('is-on',!!values[i]);lamp.dataset.on=String(!!values[i]);});
 const stop=()=>{scope?.close();scope=null;highlighted?.classList.remove('entry-current');highlighted=null;};
 const originalStop=controller.stop.bind(controller);controller.stop=()=>{stop();originalStop();};
 const originalOpen=controller.execution.open.bind(controller.execution);controller.execution.open=key=>{if(key==='basic')stop();originalOpen(key);};
 function layout(){
  const state=controller.states[controller.index],phase=state.basicObservation;if(!phase||!root.classList.contains('active'))return;
  const bounds=root.getBoundingClientRect(),scale=bounds.width/root.offsetWidth,script=program.querySelector('.ec-script'),code=script.getBoundingClientRect(),placement=controller.execution.definitions.basic.placement;
  const panelLeft=root.offsetWidth-placement.right-placement.width;
  lamps.style.left=((code.right-bounds.left)/scale+84)+'px';lamps.style.width=Math.max(0,panelLeft-24-(code.right-bounds.left)/scale)+'px';
  summary.style.left=(parseFloat(lamps.style.left)+parseFloat(lamps.style.width)+24)+'px';
  const commands=programs.basic[0].branches[0];
  commands.forEach((command,index)=>{if(!command.id.endsWith('-on'))return;const before=controller.renderer.blocks.get(commands[index-1].id)?.children[1].getBoundingClientRect(),after=controller.renderer.blocks.get(command.id)?.children[1].getBoundingClientRect();if(!before||!after)return;const pin=command.parts.find(part=>part.slot?.id==='pin').slot.value.value;lamps.children[pin-9].style.top=((before.top+before.height/2+after.top+after.height/2)/2-bounds.top)/scale+'px';});
  const count=typeof phase==='number'?phase:0;if(!count){visibleArrows=0;return;}
  script.append(arrows);arrows.replaceChildren(defs,...paths.slice(0,count));arrows.setAttribute('viewBox','0 0 '+script.offsetWidth+' '+script.offsetHeight);
  const box=script.getBoundingClientRect(),codeScale=box.width/script.offsetWidth;
  ['red','green','blue'].slice(0,count).forEach((colour,i)=>{
   const start=controller.renderer.blocks.get('basic-'+colour+'-on').querySelector(':scope>.ec-output-status').getBoundingClientRect(),end=controller.renderer.blocks.get('basic-'+colour+'-off').querySelector(':scope>.ec-output-status').getBoundingClientRect();
   const x=(start.right-box.left)/codeScale,endX=(end.right-box.left)/codeScale,y=(start.top+start.height/2-box.top)/codeScale,to=(end.top+end.height/2-box.top)/codeScale,lane=script.offsetWidth+24+i*16,bend=6,direction=to>y?1:-1;
   paths[i].setAttribute('d','M '+x+' '+y+' H '+(lane-bend)+' Q '+lane+' '+y+' '+lane+' '+(y+direction*bend)+' V '+(to-direction*bend)+' Q '+lane+' '+to+' '+(lane-bend)+' '+to+' H '+endX);
   if(i>=visibleArrows)paths[i].animate([{strokeDasharray:'1',strokeDashoffset:1,opacity:0},{strokeDasharray:'1',strokeDashoffset:0,opacity:1}],{duration:900,easing:'ease-out'});
  });
  visibleArrows=count;
 }
 program.addEventListener('entry:state',()=>{
  stop();const phase=controller.states[controller.index].basicObservation;question.hidden=!phase;lamps.hidden=!phase||phase==='popup';
  summary.getAnimations().forEach(animation=>animation.cancel());summary.hidden=phase!==3;
  if(phase===3)summary.animate([{opacity:0,transform:'translateY(calc(-50% + 8px))'},{opacity:1,transform:'translateY(-50%)'}],{delay:900,duration:320,easing:'ease-out',fill:'backwards'});
  if(phase==='ready'){values=[0,0,0];paint();}
  if(phase==='play'){
   const resources=scope=new E.Resources();
   RgbLedSimulation.runBasic({timeout:(fn,ms)=>resources.timeout(fn,ms)},(rgb,command)=>{values=rgb.slice();paint();highlighted?.classList.remove('entry-current');highlighted=controller.renderer.blocks.get(command.id);highlighted?.classList.add('entry-current');controller.renderer.revealCurrent(command.id);},350);
  }
  layout();
 });
 program.addEventListener('scroll',layout,{passive:true});
 const observer=new ResizeObserver(layout);observer.observe(root);observer.observe(program.querySelector('.ec-script'));
}
for(const kind of ['basic','mix']){
 const root=document.getElementById(kind),common=E.startStates(),starts=E.startBlocks();
 const scripts=[{id:'main',blocks:[...starts,...E.clone(programs[kind])]}];
 if(kind==='mix')scripts[0].blocks[2].id='basic-repeat';
 let states=[...common.slice(0,2),{...common[2],result:common[3].result},{scripts:E.clone(scripts),guide:kind==='basic'?'교과서 177쪽 · 빨강 → 초록 → 파랑, 각각 0.5초':'교과서 177쪽 · 변수 빨강·초록·파랑의 초기값은 0입니다.'}];
 if(kind==='mix')for(const script of programs.handlers){scripts.push(script);states.push({scripts:E.clone(scripts),guide:'W/S: 빨강, E/D: 초록, R/F: 파랑 · 키마다 5만큼 조절합니다.'});}
 if(kind==='mix'){
  const baseline=E.clone(RgbLedCode.controllers.basic.states.at(-1).scripts);
  const moved=E.clone(baseline),repeat=moved[0].blocks[2];delete repeat.run;
  moved.push({id:'basic-reference',blocks:repeat.branches[0]});repeat.branches=[[]];
  const replacement=E.clone(scripts);replacement[0].blocks[2].id=repeat.id;
  states=[{scripts:baseline,progression:'exact',guide:'4페이지에서 완성한 코드를 그대로 살펴봅니다.'},
   {scripts:moved,progression:'exact',guide:'반복문 안의 기존 블록을 오른쪽으로 옮겨 비교합니다.'},
   {scripts:[...replacement.slice(0,1),moved[1]],guide:'변수 빨강·초록·파랑 값으로 출력을 바꿉니다.'},
   ...states.slice(4).map(state=>({...state,scripts:[...state.scripts,moved[1]]}))];
 }
 const final=E.clone(scripts);final[0].blocks[2].run=kind;states.push({scripts:final,result:kind,progression:'exact',guide:kind==='basic'?'D9·D10·D11 출력과 LED 색을 비교합니다.':'키 또는 실행창의 버튼으로 밝기를 조절합니다. 0.5초마다 LED에 출력합니다.'});
 if(kind==='basic'){
  states.at(-1).basicObservation='popup';
  for(const phase of ['ready','play',1,2,3])states.push({scripts:E.clone(final),progression:'exact',basicObservation:phase,guide:states.at(-1).guide});
 }
 const controller=new E.Controller({root,program:root.querySelector('.entry-program'),states,writing:'direct',results:{'common-pin13':EntryPin13.result(),basic:RgbLedSimulation.result('basic'),[kind]:RgbLedSimulation.result(kind)},assetBase:'../assets/images/',layout:{maxScale:.85}});
 if(kind==='mix'){
  // Use stable columns sized for the completed handlers, rather than caching their small event-only heights.
  const columns=[['main',0],['key-w',1],['key-e',1],['key-r',1],['key-s',2],['key-d',2],['key-f',2],['basic-reference',3]];
  const place=()=>{
   const renderer=controller.renderer;
   renderer.workspaceColumns=new Map(columns);renderer.workspaceReadingScale=null;
   renderer.writingScale=1.15;renderer.host.style.removeProperty('max-width');
  };
  const fitComplete=()=>{
   if(controller.index!==controller.states.length-1)return;
   const renderer=controller.renderer,program=renderer.host,stage=program.closest('.entry-stage');
   const roots=[...program.children],bounds=stage.getBoundingClientRect(),origin=program.getBoundingClientRect(),ratio=bounds.width/stage.offsetWidth;
   const width=(bounds.right-origin.left)/ratio-12,height=(bounds.bottom-origin.top)/ratio-18;
   const contentWidth=Math.max(...roots.map(r=>r.offsetLeft+r.scrollWidth)),contentHeight=Math.max(...roots.map(r=>r.offsetTop+r.offsetHeight));
   renderer.writingScale=Math.min(1.15,width/contentWidth,height/contentHeight);renderer.workspaceReadingScale=renderer.writingScale;
   renderer.fitWorkspace();program.style.setProperty('max-width','none','important');program.style.setProperty('width',width/renderer.writingScale+'px','important');program.scrollTo(0,0);controller.execution.place();
  };
  root.querySelector('.entry-program').addEventListener('entry:before-state',place);
  root.querySelector('.entry-program').addEventListener('entry:state',fitComplete);place();
 }
 const bar=new E.ObjectBar({root,objects:[{id:'entrybot',name:'엔트리봇',image:'../assets/images/entrybot.png'}],book:'교과서 부록 177쪽'});bar.update('entrybot',new Set(['entrybot']));controller.guide=bar.guide;RgbLedCode.controllers[kind]=controller;
 if(kind==='basic')mountBasicObservation(controller);
}
})();
