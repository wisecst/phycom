(()=>{
 'use strict';
 const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
 window.renderCommonPinRoles=function(target,config){
  const root=typeof target==='string'?document.querySelector(target):target;
  if(!root)return;
  const row=(role,label,helper,value,lesson)=>`<div class="pin-role-card pin-${role}"><b class="pin-name">${escape(label)}</b><div><span class="pin-role">${escape(helper)}</span>${lesson?'<span class="pin-role">이번 수업:</span>':''}<strong class="pin-connection">${escape(value)}</strong></div></div>`;
  const signals=config.signals||(config.pinSignals?JSON.parse(config.pinSignals):[{label:config.signalLabel,description:(config.signalType==='analog'?'A0~A5':'D0~D13')+' 연결 가능',pin:config.lessonPin}]);
  root.innerHTML=signals.map(signal=>row('signal',signal.label,signal.description,signal.pin,true)).join('')+row('power',config.voltageLabel,config.voltageRole||'3.3V / 5V 사용 가능',config.lessonVoltage,true)+row('ground',config.groundLabel,config.groundRole||'GND에 연결','GND',false);
 };
 document.querySelectorAll('dialog.phycom-pin-window[data-module-name]').forEach(dialog=>{
  const config=dialog.dataset;
  dialog.innerHTML=`<div class="pin-content"><button class="pin-close" type="button" data-close-dialog aria-label="핀 역할 설명 닫기">×</button><h2 class="pin-title" id="pinDialogTitle">${escape(config.moduleName)} 모듈의 핀 역할</h2><div class="pin-layout"><img class="pin-module-image" src="${escape(config.moduleImage)}" alt="${escape(config.moduleName)} 모듈의 핀 역할"><div class="pin-role-list"></div></div></div>`;
  if(config.pinLayout==='table'){
   const images=JSON.parse(config.pinImages),rows=JSON.parse(config.pinRows);
   const content=dialog.querySelector('.pin-content');
   content.classList.add('pin-dual-pot');
   content.style.setProperty('--pin-image-count',images.length);
   content.style.setProperty('--pin-row-count',rows.length);
   dialog.querySelector('.pin-title').textContent=config.pinTitle;
   const layout=dialog.querySelector('.pin-layout');
   layout.innerHTML=`<div class="pin-dual-images">${images.map(image=>`<figure><figcaption>${escape(image.caption)}</figcaption><img src="${escape(image.src)}" alt="${escape(image.alt)}"></figure>`).join('')}</div><div class="pin-dual-details"><div class="pin-dual-head"><span>핀 이름</span><span>역할과 연결 가능한 범위</span><span>오렌지보드</span></div>${rows.map(row=>`<div class="pin-dual-row" style="--row-color:${escape(row.color)};--row-bg:${escape(row.background)}"><b>${escape(row.name)}<small>${escape(row.caption)}</small></b><div><strong>${escape(row.role)}</strong>${row.range?`<p>${escape(row.range.label)} ${row.range.values.map(value=>`<em>${escape(value)}</em>`).join(escape(row.range.separator||''))}${escape(row.range.suffix||'')}</p>`:''}${row.note?`<small>${escape(row.note)}</small>`:''}</div><output>${escape(row.pin)}</output></div>`).join('')}</div>`;
   layout.querySelector('.pin-dual-details').style.gridTemplateRows='80px '+rows.map(row=>(row.weight||1)+'fr').join(' ');
   const summary=document.createElement('div');
   summary.className='pin-dual-summary';
   summary.innerHTML='<strong>연결 정리</strong>'+rows.map(row=>`<span style="background:${escape(row.summaryBackground||row.background)};color:${escape(row.summaryColor||'inherit')}">${escape(row.name)} → ${escape(row.pin)}</span>`).join('');
   content.append(summary);
   return;
  }
  window.renderCommonPinRoles(dialog.querySelector('.pin-role-list'),config);
 });
 // Locked D13 connection check. Changes require explicit user approval (WORK_RULES.md).
 const boardImage=new URL('../../assets/images/OrangeBoard.png',document.currentScript.src).href;
 const placement=Object.freeze({left:'auto',right:56,top:106,width:'min(48%,740px)'});
 const definitions=new WeakSet();
 const result=onRun=>{
  if(onRun!==undefined&&typeof onRun!=='function')throw TypeError('D13 accepts a lesson checkpoint callback only');
  const definition=Object.freeze({preserveCode:true,policy:'continuous',placement,
   view(){const content=document.createElement('div');content.className='pin13-content';content.innerHTML=`<strong>실행 결과</strong><div class="pin13-board-view"><img src="${escape(boardImage)}" alt="오렌지보드"><span class="pin13-led-glow" aria-hidden="true"></span><span class="pin13-led-dot" aria-hidden="true"></span><span class="hc-led hc-on hc-pin-status" aria-hidden="true"></span><span class="hc-led hc-rx hc-pin-status" aria-hidden="true"></span><svg class="pin13-check-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M 16 -0.5 L 36 25"/></svg><span class="pin13-check" aria-hidden="true"></span><span class="pin13-check-bubble">여기 확인!</span></div><p>13번 핀에 연결된 LED에 노란불이 켜졌는지 확인하세요.</p>`;return content;},
   run(){onRun?.();}
  });definitions.add(definition);return definition;
 };
 const mount=root=>{const execution=new EntryEngine.Execution(root,{pin13:result()});execution.overlay.pin13Execution=execution;return execution.overlay;};
 const close=overlay=>{const execution=(overlay||legacy)?.pin13Execution;if(execution){if(execution.pin13Button){execution.pin13Button.textContent='▶';execution.pin13Button.classList.remove('running');}execution.onClose=null;execution.close();}};
 const open=(overlay,root,button,onClose)=>{
  const execution=overlay.pin13Execution;close(overlay);execution.root=root;root.append(overlay);execution.open('pin13');
  execution.pin13Button=button;if(button){button.textContent='■';button.classList.add('running');}
  execution.onClose=()=>{if(button){button.textContent='▶';button.classList.remove('running');}onClose?.();};
 };
 let legacy;
 Object.defineProperty(window,'EntryPin13',{value:Object.freeze({result,owns:definition=>definitions.has(definition),mount,open,close,toggle(overlay){overlay.pin13Execution.toggleResult('pin13');},
  show(root,button,onClose){legacy??=mount(root);open(legacy,root,button,onClose);},
  closeLegacy(){close(legacy);}
 }),writable:false,configurable:false});
 // Measure the real usable content region rather than applying resolution offsets.
 function fitLessonPopups(){
  const {width,height,sidebar:left}=window.lessonStage.design;
  document.documentElement.style.setProperty('--lesson-left',left+'px');
  document.querySelectorAll('.phycom-pin-window').forEach(d=>{
   const scale=Math.min(1,(width-left)*.94/1600,height*.88/900);
   d.style.setProperty('--pin-scale',scale);d.style.width=1600*scale+'px';d.style.height=900*scale+'px';
   d.style.marginLeft=left+(width-left-1600*scale)/2+'px';
  });
 }
 // Content fit is constant in the logical lesson area; the host alone handles resize/fullscreen.
 fitLessonPopups();
 // Keep the original navigation buttons reachable in the modal top layer.
 const nav=document.querySelector('.slide-nav');
 if(nav){
  const anchor=document.createComment('slide navigation position');nav.before(anchor);
  const syncNavigation=()=>{
   const active=[...document.querySelectorAll('dialog[open]')].find(dialog=>dialog.matches(':modal'));
   if(active){if(nav.parentElement!==active)active.appendChild(nav);}
   else if(nav.previousSibling!==anchor)anchor.after(nav);
  };
  const observer=new MutationObserver(syncNavigation);
  document.querySelectorAll('dialog').forEach(dialog=>observer.observe(dialog,{attributes:true,attributeFilter:['open']}));
 }
})();

