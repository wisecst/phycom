/* Shared module catalogue and compact navigation; lesson coordinates stay inside Stage. */
(()=>{'use strict';
 const modules=Object.freeze([
  {id:'rotation',name:'가변저항',path:'potentiometer/',enabled:true,unit:'modules',group:'input'},
  {id:'joystick',name:'조이스틱',path:'joystick/',enabled:true,unit:'modules',group:'input'},
  {id:'led',name:'LED',path:'led/',enabled:true,unit:'modules',group:'output'},
  {id:'buzzer',name:'수동버저',path:'buzzer/',enabled:true,unit:'modules',group:'output'},
  {id:'dc-motor',name:'DC모터',path:'dc-motor/',enabled:true,unit:'modules',group:'output'},
  {id:'servo-motor',name:'서보모터',path:'servo-motor/',enabled:true,unit:'modules',group:'output'},
  {id:'lcd',name:'I2C LCD',path:'lcd/',enabled:true,unit:'modules',group:'output'},
  {id:'rgb-led',name:'RGB LED',path:'rgb-led/',enabled:true,unit:'modules',group:'output'},
  {id:'neopixel',name:'네오픽셀',path:'neopixel/',enabled:true,unit:'modules',group:'output'}
 ]);
 // Latest lesson-design pathway data supplied by the author from Notion.
 const assignments=Object.freeze([
  {id:'rotation-dc-motor',name:'다이얼 선풍기',focus:'가변저항으로 모터 속도 제어',devices:['가변저항','DC모터'],learning:'아날로그 입력값을 0~5단계로 변환하고 단계에 따라 모터 출력값을 제어합니다.',path:'projects/rotation-dc-motor/',enabled:true},
  {id:'dial-roulette',name:'다이얼 룰렛',focus:'가변저항으로 회전 각도 제어',devices:['가변저항','서보모터'],learning:'가변저항값을 0~180° 회전 각도로 변환합니다.'},
  {id:'distance-alarm',name:'거리 감지 경보기',focus:'거리 조건에 따른 경보음 출력',devices:['초음파 센서','수동버저'],learning:'측정 거리의 구간·조건에 따라 경보음을 출력합니다.'},
  {id:'automatic-light',name:'자동 조명',focus:'밝기 조건으로 LED 자동 제어',devices:['빛 센서','LED'],learning:'빛의 양에 따른 조건 판단과 LED 자동 제어를 학습합니다.'},
  {id:'button-fan',name:'버튼 선풍기',focus:'버튼으로 모터 0~3단계 제어',devices:['버튼','DC모터'],learning:'버튼 입력에 따라 모터 단계를 0~3단계로 바꾸고 속도를 제어합니다.'},
  {id:'queue-alert',name:'대기 줄 감지 알림',focus:'거리 조건으로 대기·호출 표시',devices:['초음파 센서','LED'],learning:'측정 거리의 조건에 따라 대기·호출 상태를 LED로 표현합니다.'},
  {id:'lcd-call',name:'LCD 호출 알림',focus:'학급 번호와 호출 상태 표시',devices:['LCD','LED'],learning:'학급 번호와 대기·호출 상태를 함께 표시합니다.'},
  {id:'motion-alert',name:'움직임 감지 알림',focus:'움직임 감지에 따른 LED 표시',devices:['초음파 센서','LED'],learning:'움직임 감지 여부에 따라 LED 상태를 표시합니다.'},
  {id:'staged-alarm',name:'단계별 경보음 만들기',focus:'주의·위험 경보음 패턴 만들기',devices:['수동버저'],learning:'주의·위험 상황을 가정하여 서로 다른 음높이·길이·반복 패턴의 경보음을 구현합니다.'}
 ].map(item=>({...item,description:'과제 : '+item.devices.join(' + '),enabled:!!item.enabled,unit:'projects',group:'assignments'})));
 const finalProjects=Object.freeze([
  {id:'single-household',name:'1인 가구 살핌이',focus:'무움직임 시간으로 주의·위험 판단',devices:['초음파 센서','수동버저','노랑·빨강 LED'],flow:'움직임 감지 → 무움직임 시간 측정 → 주의·위험 판단 → 단계별 LED·경보음 출력 → 움직임 감지 시 초기화'},
  {id:'scarecrow',name:'빙글빙글 허수아비',focus:'거리 기준 설정과 접근 상태 판단',devices:['가변저항','초음파 센서','서보모터','수동버저'],flow:'감지 거리 기준 설정 → 초음파 거리 측정 → 주의·위험 판단 → 서보모터 회전·경보음 출력'},
  {id:'lunch-order',name:'급식 순서 알림이',focus:'대기 줄에 맞춰 학급 순차 호출',devices:['초음파 센서','LCD','초록·노랑 LED'],flow:'대기 줄 감지 → 학급 호출·대기 표시 → 이동 시간 부여 → 모든 학급 호출 후 종료'},
  {id:'fire-safe-classroom',name:'화재 예방 교실',focus:'문 상태에 따른 전등·선풍기 정지',devices:['빛 센서','흰색·파란색 버튼','LED','DC모터'],flow:'교실 문이 열리면 버튼으로 전등·선풍기 제어 → 문이 닫히면 자동 정지·선풍기 단계 변수 초기화'}
 ].map(item=>({...item,enabled:false,unit:'projects',group:'group-projects'})));
 const projectLinks=Object.freeze([
  {assignment:'motion-alert',project:'single-household',bridge:'감지에 시간 누적 조건 더하기',focus:'무움직임 시간 측정 · 감지 시 초기화',extension:'움직임이 없는 시간을 초시계로 누적하여 주의·위험을 판단하고 노랑·빨강 LED를 표시합니다. 움직임이 다시 감지되면 시간을 초기화합니다.'},
  {assignment:'staged-alarm',project:'single-household',bridge:'경보 패턴을 상태 판단에 연결',focus:'주의·위험 판단에 맞는 경보음 호출',extension:'무움직임 경과 시간에 따른 주의·위험 판단에 맞춰 서로 다른 경보음 함수를 호출합니다.'},
  {assignment:'dial-roulette',project:'scarecrow',bridge:'입력값의 역할 바꾸기',focus:'가변저항으로 감지 거리 기준 설정',extension:'가변저항의 역할을 각도 조절에서 감지 거리 기준 설정으로 변경합니다. 서보모터의 회전 기능은 새를 쫓는 동작에 재활용합니다.'},
  {assignment:'distance-alarm',project:'scarecrow',bridge:'고정 기준을 조절 가능한 기준으로',focus:'고정 거리 → 조절 가능한 접근 기준',extension:'고정 거리 조건을 가변저항으로 조절 가능한 기준 거리로 확장합니다. 초음파 측정값과 비교하여 주의·위험을 판단하고 경보음을 출력합니다.'},
  {assignment:'queue-alert',project:'lunch-order',bridge:'감지 결과를 호출 조건으로 연결',focus:'대기 줄 변화 → 다음 학급 호출 판단',extension:'줄이 줄어드는 상황을 판단하여 다음 학급 호출 조건으로 활용합니다. 노랑 LED는 대기, 초록 LED는 호출 상태를 표현합니다.'},
  {assignment:'lcd-call',project:'lunch-order',bridge:'한 번 표시에서 순차 호출로',focus:'학급 번호 증가 · 이동 시간 · 종료',extension:'학급 번호를 증가시키며 LCD·LED로 호출 상태를 표시하고 이동 시간을 부여합니다. 모든 학급 호출 후 LCD와 LED를 정리합니다.'},
  {assignment:'automatic-light',project:'fire-safe-classroom',bridge:'밝기값을 문 상태로 해석하기',focus:'밝기 판단 → 문 상태 판단 · 자동 정지',extension:'빛 센서를 걸쇠에 설치하여 문의 열림·닫힘 상태를 판단합니다. 전등을 버튼으로 제어하되 문이 닫히면 자동 정지하도록 확장합니다.'},
  {assignment:'button-fan',project:'fire-safe-classroom',bridge:'수동 조작에 자동 정지 조건 추가',focus:'문이 닫히면 정지 · 단계 초기화',extension:'버튼으로 0~3단계 속도를 제어하는 기능에 빈 교실 판단을 추가합니다. 문이 닫히면 버튼 조작과 관계없이 선풍기를 정지하고 단계 변수를 초기화합니다.'},
  {assignment:'rotation-dc-motor',project:'fire-safe-classroom',bridge:'모터 제어는 재사용하고 입력 교체',focus:'모터 속도 제어 기능 재사용',extension:'다이얼 선풍기의 모터 속도 제어 기능을 재사용합니다. 가변저항 입력과 버튼 입력은 서로 다르므로 버튼 선풍기와는 별도 과제입니다.'}
 ]);
 // Keep existing Stage and shortcut routing limited to actual learning pages.
 const projects=Object.freeze([...assignments.filter(item=>item.enabled),{id:'project-activities',name:'프로젝트 활동',path:'projects/activities/',enabled:true,unit:'project-work',group:'learning'}]);
 const lessons=Object.freeze([...modules,...projects]);
 function choices(onSelect,items=modules){
  const grid=document.createElement('div');grid.className='shortcut-groups';
  const units=[['understand','Ⅰ 이해'],['modules','Ⅱ 설계'],['projects','Ⅲ 활용'],['ai','Ⅳ AI'],['project-work','Ⅴ 프로젝트']];
  const groups={modules:[['input','입력장치'],['output','출력장치']],projects:[['assignments','과제'],['group-projects','프로젝트']],'project-work':[['learning','프로젝트 학습']]};
  function appendItems(parent,rows){const buttons=document.createElement('div');buttons.className='module-grid';for(const module of rows){const b=document.createElement('button');b.type='button';b.dataset.module=module.id;b.textContent=module.name;b.addEventListener('click',()=>onSelect(module.id));buttons.append(b)}parent.append(buttons)}
  for(const [unit,label]of units){const rows=items.filter(m=>m.enabled&&m.unit===unit);if(!rows.length)continue;const section=document.createElement('section'),h=document.createElement('h3');h.textContent=label;section.append(h);
   if(groups[unit]){for(const [group,name]of groups[unit]){const subset=rows.filter(m=>m.group===group);if(!subset.length)continue;const heading=document.createElement('h4');heading.textContent=name;section.append(heading);appendItems(section,subset)}}else appendItems(section,rows);
   if(section.querySelector('button'))grid.append(section);
  }
  return grid;
 }
 function create({home,previous,next,select,fullscreen,catalogue=lessons}){
  const nav=document.createElement('nav');nav.className='lesson-navigation';nav.setAttribute('aria-label','수업 이동');
  const controls=document.createElement('div');controls.className='lesson-navigation-controls';nav.append(controls);
  const button=(label,action,key,icon)=>{const b=document.createElement('button');b.type='button';b.textContent=icon;b.setAttribute('aria-label',label);b.title=label;b.dataset.action=key;b.addEventListener('click',action);controls.append(b);return b};
  button('홈',home,'home','⌂');const prev=button('이전',previous,'previous','←');
  const position=document.createElement('span');position.className='lesson-position';position.setAttribute('aria-live','polite');controls.append(position);
  const forward=button('다음',next,'next','→');
  const picker=button('바로가기',()=>setOpen(panel.hidden),'modules','▦');picker.setAttribute('aria-expanded','false');
  const panel=document.createElement('section');panel.className='module-panel';panel.hidden=true;panel.setAttribute('aria-label','바로가기');
  const title=document.createElement('h2');title.textContent='바로가기';panel.append(title,choices(id=>{setOpen(false);select(id)},catalogue));nav.append(panel);
  const full=button('전체화면',fullscreen,'fullscreen','⛶');full.setAttribute('aria-label','전체화면 / 프리젠터');
  function setOpen(on){panel.hidden=!on;picker.setAttribute('aria-expanded',String(on));if(on)(panel.querySelector('[aria-current]')||panel.querySelector('button:not(:disabled)'))?.focus()}
  document.addEventListener('click',e=>{if(!nav.contains(e.target))setOpen(false)});
  nav.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.preventDefault();e.stopPropagation();setOpen(false);picker.focus()}});
  function update(id,items=[]){const module=catalogue.find(m=>m.id===id),index=items.findIndex(i=>i.active);position.textContent=module?`${index<0?'–':index+1} / ${items.length||'–'}`:'';
   for(const b of panel.querySelectorAll('[data-module]')){if(b.dataset.module===id)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current')}
   // Controllers own step boundaries, including actions within the first/last page.
   prev.disabled=forward.disabled=!module;
  }
  return {element:nav,update,close:()=>setOpen(false)};
 }
 window.phycomNavigation=Object.freeze({modules,projects,assignments,finalProjects,projectLinks,lessons,choices,create});
})();

