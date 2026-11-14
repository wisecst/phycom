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
  window.renderCommonPinRoles(dialog.querySelector('.pin-role-list'),config);
 });
 // Shared D13 result content: the LED lesson remains the reference design.
 window.pin13ResultMarkup=({image='../assets/OrangeBoard.png',status=false}={})=>`<strong>실행 결과</strong><div class="pin13-board-view"><img src="${escape(image)}" alt="오렌지보드"><span class="pin13-led-glow" aria-hidden="true"></span><span class="pin13-led-dot" aria-hidden="true"></span>${status?'<span class="hc-led hc-on hc-pin-status" aria-hidden="true"></span><span class="hc-led hc-rx hc-pin-status" aria-hidden="true"></span>':''}</div><p>오렌지보드의 <b>13번 핀</b>이 켜졌습니다.</p>`;
 const ledCard=document.querySelector('#pin13Modal .entry-result-card');
 if(ledCard){const close=ledCard.querySelector('.entry-result-close');ledCard.replaceChildren(close);ledCard.insertAdjacentHTML('beforeend',window.pin13ResultMarkup());}
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

