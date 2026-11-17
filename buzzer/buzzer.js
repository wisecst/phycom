(()=>{
'use strict';
const assetBase=new URL('../assets/',document.currentScript.src).href,lessonBase=new URL('./',document.currentScript.src).href;
// Transcribed visually from the 2022 textbook, printed page 77 (PDF page 78).
// [Entry note name, octave, seconds, MIDI semitone]. Do not infer this from a tune.
const birthday=[
 ['도',4,.75,60],['도',4,.25,60],['레',4,1,62],['도',4,1,60],['파',4,1,65],['미',4,2,64],
 ['도',4,.75,60],['도',4,.25,60],['레',4,1,62],['도',4,1,60],['솔',4,1,67],['파',4,2,65],
 ['도',4,.75,60],['도',4,.25,60],['도',5,1,72],['라',4,1,69],['파',4,1,65],['미',4,1,64],['레',4,2,62],
 ['라#(시♭)',4,.75,70],['라#(시♭)',4,.25,70],['라',4,1,69],['파',4,1,65],['솔',4,1,67],['파',4,2,65]
];
// One curated educational melody drives playback, notation and abbreviated code.
const canon=window.buzzerCanonScore.notes,canonBPM=window.buzzerCanonScore.bpm,canonScorePageSize=24;
const triad=[['도',4,.5,60],['미',4,.5,64],['솔',4,.5,67]];
const limits=[4,3,8,2,2,2,2,2,2,5],titles=['개념','회로 연결','도·미·솔 연주하기','생일축하노래 연주하기','캐논 연주하기','예시 · 언제나 몇 번이라도','예시 · Hedwig’s Theme','예시 · 알라딘 OST','예시 · Summer','악보를 엔트리 코드로 표현하기'];
const $=s=>document.querySelector(s),pages=[...document.querySelectorAll('[data-page]')];
let page=0,step=0,dialog=null,returnFocus=null,audio=null,voice=null,gain=null,frame=0,session=0,startedAt=0,duration=0,scheduledCycle=-1;
function getAudioContext(){
 const Audio=window.AudioContext||window.webkitAudioContext;
 if(!Audio)throw new Error('AudioContext unavailable');
 if(navigator.audioSession){
  try{navigator.audioSession.type='playback';}
  catch{}
 }
 audio??=new Audio();
 return audio;
}
function unlockAudio(){
 const context=getAudioContext();
 if(context.state==='suspended'||context.state==='interrupted')context.resume().catch(()=>{});
 try{
  const silent=context.createOscillator(),zero=context.createGain();
  zero.gain.setValueAtTime(0,context.currentTime);
  silent.connect(zero);zero.connect(context.destination);
  silent.start();silent.stop(context.currentTime+.01);
  silent.onended=()=>{silent.disconnect();zero.disconnect();};
 }catch{}
 return context;
}
async function ensureAudioReady(){
 const context=unlockAudio();
 if(context.state!=='running')await context.resume();
 if(context.state!=='running')throw new Error('AudioContext suspended');
 return context;
}
const field=v=>`<span class="field">${v}<span class="select-arrow">▼</span></span>`;
const block=(type,text)=>`<div class="entry-block ${type}">${text}</div>`;
const start=space=>block('start-block',`<span class="play-dot">${space?'<svg viewBox="0 0 32 24" aria-hidden="true"><rect x="2" y="3" width="28" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 8h3m3 0h3m3 0h3m3 0h2M6 12h3m3 0h3m3 0h3m3 0h2M8 17h16" stroke="currentColor" stroke-width="2"/></svg>':'▶'}</span><b>${space?'스페이스 키를 눌렀을 때':'시작하기 버튼을 클릭했을 때'}</b>`);
const noteBlock=n=>block('hardware-block',`<b>디지털</b>${field(3)}<b>번 핀의 피에조 부저를</b>${field(n[1])}<b>옥타브</b>${field(n[0])}<b>음으로</b><span class="number-field">${n[2]}</span><b>초 연주하기</b><span class="hardware-symbol" aria-hidden="true">↔</span>`);
$('#triadPage').innerHTML='<div class="entry-workspace">\n  <div class="entry-scene-tabs entry-code-toolbar"><button type="button" class="entry-scene-tab active">장면 1</button><button type="button" class="entry-scene-add" aria-label="장면 추가">＋</button><span class="entry-brand">entry</span><b class="entry-lesson-title">[피컴] 수동버저 · 도·미·솔</b><div class="entry-top-actions"><button type="button" class="entry-goal-btn">목표 작품</button><button type="button" class="entry-complete-btn">학습 완료</button><div class="entry-save-wrap"><button type="button" class="entry-save-btn" aria-label="저장 메뉴"><span class="entry-save-icon">▣</span><span class="entry-save-caret">⌃</span></button><div class="entry-save-menu" aria-hidden="true"><button type="button" class="entry-save-item">저장하기</button><button type="button" class="entry-save-item">내 작품으로 저장하기</button></div></div></div></div>\n  <aside class="entry-tabs">\n    <div class="entry-tab start-tab" data-tab="start" aria-label="시작"><img class="entry-tab-image entry-tab-image-unselected" src="'+assetBase+'tab01_start_unselected.png" alt=""><img class="entry-tab-image entry-tab-image-selected" src="'+assetBase+'tab01_start_selected.png" alt=""></div>\n    <div class="entry-tab flow-tab" data-tab="flow" aria-label="흐름"><img class="entry-tab-image entry-tab-image-unselected" src="'+assetBase+'tab02_flow_unselected.png" alt=""><img class="entry-tab-image entry-tab-image-selected" src="'+assetBase+'tab02_flow_selected.png" alt=""></div>\n    <div class="entry-tab hardware-tab" data-tab="hardware" aria-label="하드웨어"><img class="entry-tab-image entry-tab-image-unselected" src="'+assetBase+'tab14_hardware_unselected.png" alt=""><img class="entry-tab-image entry-tab-image-selected" src="'+assetBase+'tab14_hardware_selected.png" alt=""></div>\n  </aside>\n  <div class="entry-stage">\n    <div class="entry-object-info">\n      <span class="entrybot-thumb"><img src="'+assetBase+'entrybot.png" alt="엔트리봇"></span>\n      <strong>엔트리봇</strong>\n      <span class="entry-block-count">블록 <b class="triad-block-count">0</b>개</span><span class="entry-code-page-label">도·미·솔 코드</span>\n    </div>\n    <div class="entry-program">\n      <div class="entry-block start-block" data-entry-step="1"><span class="play-dot">▶</span><b>시작하기 버튼을 클릭했을 때</b></div>\n      <div class="entry-block hardware-block indent-0" data-entry-step="2"><b>디지털</b><span class="field">13<span class="select-arrow">▼</span></span><b>번 핀</b><span class="field">켜기<span class="select-arrow">▼</span></span><button type="button" class="entry-run-btn" data-buzzer-result="pin13" aria-label="13번 핀 실행 결과">▶</button></div>\n      <div class="entry-block repeat-block" data-entry-step="4"><b>계속 반복하기</b><button type="button" class="entry-loop-run-btn" data-buzzer-result="triad" aria-label="도·미·솔 실행 결과">▶</button></div>\n      <div class="repeat-body basic-repeat-body" data-repeat-body>\n        <div class="entry-basic-four">\n          <div class="entry-block hardware-block indent-1" data-entry-step="5"><b>디지털</b><span class="field">3<span class="select-arrow">▼</span></span><b>번 핀의 피에조 부저를</b><span class="field">4<span class="select-arrow">▼</span></span><b>옥타브</b><span class="field">도<span class="select-arrow">▼</span></span><b>음으로</b><span class="number-field">0.5</span><b>초 연주하기</b></div>\n          <div class="entry-block hardware-block indent-1" data-entry-step="6"><b>디지털</b><span class="field">3<span class="select-arrow">▼</span></span><b>번 핀의 피에조 부저를</b><span class="field">4<span class="select-arrow">▼</span></span><b>옥타브</b><span class="field">미<span class="select-arrow">▼</span></span><b>음으로</b><span class="number-field">0.5</span><b>초 연주하기</b></div>\n          <div class="entry-block hardware-block indent-1" data-entry-step="7"><b>디지털</b><span class="field">3<span class="select-arrow">▼</span></span><b>번 핀의 피에조 부저를</b><span class="field">4<span class="select-arrow">▼</span></span><b>옥타브</b><span class="field">솔<span class="select-arrow">▼</span></span><b>음으로</b><span class="number-field">0.5</span><b>초 연주하기</b></div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n';const birthdayRoot=$('#birthdayPage');
birthdayRoot.innerHTML=$('#triadPage').innerHTML;
birthdayRoot.querySelector('.entry-lesson-title').textContent='[피컴] 수동버저 · 생일축하노래 연주하기';
birthdayRoot.querySelector('.entry-object-info').innerHTML='<span class="entrybot-thumb"><img src="'+lessonBase+'cake-2.png" alt="생일케이크"></span><strong>생일케이크</strong><span class="entry-code-page-label">생일축하노래 완성 코드</span>';
const looksTab=birthdayRoot.querySelector('.flow-tab').cloneNode(true);
looksTab.className='entry-tab looks-tab';looksTab.dataset.tab='looks';looksTab.setAttribute('aria-label','생김새');
looksTab.querySelectorAll('img').forEach(img=>img.src=img.src.replace('02_flow','04_looks'));
birthdayRoot.querySelector('.hardware-tab').before(looksTab);
const shown=html=>html.replaceAll('entry-block ', 'entry-block entry-show ');
const cakeCode=block('hardware-block looks-block',`${field('생일케이크_2')}<b>모양으로 바꾸기</b>`)+block('hardware-block looks-block',`<span class="field speech-field">스페이스키를 누르면 생일 축하 노래가 나와요!</span><b>을(를) 말하기</b>`);
birthdayRoot.querySelector('.entry-program').innerHTML='<div class="birthday-code-grid"><div class="birthday-melody">'+shown(start(true)+birthday.map((n,i)=>noteBlock(n).replace('entry-block hardware-block',`entry-block hardware-block birthday-note-${i}`)).join(''))+'</div><div class="birthday-cake-code">'+shown(start(false)+cakeCode)+'<div class="companion-code">'+shown(start(true)+block('hardware-block looks-block',`${field('생일케이크_1')}<b>모양으로 바꾸기</b>`))+'</div><button type="button" class="birthday-run" data-buzzer-result="birthday">실행 결과 ▶</button></div></div>';
const canonRoot=$('#canonPage');
canonRoot.innerHTML=birthdayRoot.innerHTML;
canonRoot.querySelector('.entry-lesson-title').textContent='[피컴] 수동버저 · 캐논 연주하기';
canonRoot.querySelector('.entry-object-info').innerHTML='<span class="entrybot-thumb"><img src="'+assetBase+'entrybot.png" alt="엔트리봇"></span><strong>엔트리봇</strong><span class="entry-code-page-label">캐논 · 교육용 주선율 · BPM '+canonBPM+'</span>';
const canonVisible=canon.map((note,index)=>[note,index]);
const canonBlock=([note,index])=>(note[3]===null?block('hardware-block',`<b>디지털</b>${field(3)}<b>번 핀의 피에조 부저를</b>${field('무음')}<b>으로</b><span class="number-field">${note[2]}</span><b>초 연주하기</b>`):noteBlock([note[0],note[1],note[2],note[3]])).replace('entry-block hardware-block',`entry-block hardware-block canon-note-${index}`);
canonRoot.querySelector('.entry-program').innerHTML='<div class="canon-unified-layout"><section class="student-code-card"><h3>메인 실행 코드</h3><div class="student-code-scroll"><div class="canon-code-program">'+shown(start(false)+canonVisible.map(canonBlock).join(''))+'</div></div></section><section class="student-score-card"><h3>캐논 · 파헬벨</h3><p class="canon-time-basis">4분음표 = 1초 · 8분음표 = 0.5초</p><div class="canon-score-view">'+canonScoreSVG(0)+'</div><button type="button" class="birthday-run" data-direct-play="canon">실행 결과 ▶</button><p class="canon-demo-note">※ 악보는 4분음표 1초, 8분음표 0.5초를 기준으로 하며, 재생은 빠른 확인을 위해 '+(canonBPM/60)+'배속으로 들려줍니다.</p><p class="canon-progress" aria-live="polite">완성된 코드를 확인한 뒤 다음 버튼으로 실행하세요.</p><a class="canon-source" href="https://sheetmusic.lyco.org.au/Pachelbel%20-%20Canon%20in%20D/" target="_blank" rel="noopener">원곡 악보: LYCO</a></section></div>';
// Original Carnegie Hall Recorder Star score: mm.12–15, then the half rest
// opening m.16. One contiguous source excerpt; pitches and written rhythm intact.
// Seconds here use this activity's chosen quarter-note duration of 1 second.
const activityNotes=[
 ['도',4,2,60,{type:'half',name:'2분음표'}],
 ['미',4,1,64,{type:'quarter',name:'4분음표'}],
 ['솔',4,0.75,67,{type:'eighth',dots:1,name:'점8분음표'}],
 ['라',4,0.5,69,{type:'eighth',name:'8분음표'}],
 ['시',4,0.25,71,{type:'16th',name:'16분음표'}]
];
limits[9]=7;
const activityRoot=$('#scoreActivityPage');
activityRoot.innerHTML=$('#triadPage').innerHTML;
activityRoot.querySelector('.entry-lesson-title').textContent='[피컴] 악보 읽기 · 음표와 쉼표의 시간';
activityRoot.querySelector('.entry-stage').innerHTML='<div class="activity-layout"><div class="activity-score"><h3>When the Saints Go Marching In · 한 구절</h3>'+activityScoreSVG()+'<a class="canon-source" href="https://www.carnegiehall.org/Education/Programs/Link-Up/National-Program/The-Orchestra-Swings/When-the-Saints-Go-Marching-In" target="_blank" rel="noopener">악보: Carnegie Hall · Recorder Star, 12~15마디와 다음 2분쉼표</a></div><div class="activity-explanation" aria-live="polite"></div></div>';
function activityScoreSVG(){
 const notes=activityNotes;
 let svg='<svg class="score activity-score-svg" viewBox="0 0 1280 300" role="img" aria-label="한 줄 악보: 2분음표, 4분음표, 점8분음표, 8분음표, 16분음표">';
 for(let y=90;y<=170;y+=20)svg+=`<path d="M20 ${y} H1260" stroke="#687f8d" stroke-width="2"/>`;
 const x0=180, gap=220, bottom=170;
 notes.forEach((n,i)=>{const x=x0+i*gap,y=130-(i%3)*20,m=n[4],filled=!['half','whole'].includes(m.type);
   svg+=`<g data-activity-note="${i}" class="activity-note activity-${m.type}"><ellipse cx="${x}" cy="${y}" rx="20" ry="14" transform="rotate(-15 ${x} ${y})" fill="${filled?'currentColor':'white'}" stroke="currentColor" stroke-width="4"/>`;
   if(m.type!=='whole')svg+=`<path d="M${x+17} ${y}v-62" stroke="currentColor" stroke-width="4"/>`;
   const flags=m.type==='16th'?2:m.type==='eighth'?1:0;
   for(let f=0;f<flags;f++)svg+=`<path d="M${x+17} ${y-62+f*12} q34 12 22 30" fill="none" stroke="currentColor" stroke-width="5"/>`;
   if(m.dots)svg+=`<circle cx="${x+38}" cy="${y-4}" r="5" fill="currentColor"/>`;
   svg+=`<text x="${x}" y="238" text-anchor="middle" font-size="24">${m.name}</text><text class="activity-seconds" x="${x}" y="276" text-anchor="middle" font-size="24" visibility="hidden">${n[2]}초</text></g>`;
 });
 return svg+'</svg>';
}
const activityTypes=[...new Map(activityNotes.map(n=>[n[4].name,n])).values()];
function durationBar(seconds){return '<span class="duration-bar" aria-label="'+(seconds/.25)+'칸">'+'<i aria-hidden="true"></i>'.repeat(seconds/.25)+'</span>';}
function durationSymbol(type,dots=0,down=false){
 const whole=type==='whole',open=whole||type==='half';
 let shape='<ellipse cx="26" cy="63" rx="13" ry="9" transform="rotate(-15 26 63)" fill="'+(open?'white':'currentColor')+'" stroke="currentColor" stroke-width="3"/>';
 if(!whole)shape+='<path d="M37 61V12" fill="none" stroke="currentColor" stroke-width="3"/>';
 const flags=type==='16th'?2:type==='eighth'?1:0;
 for(let i=0;i<flags;i++)shape+='<path d="M37 '+(12+i*12)+'q28 10 16 30" fill="none" stroke="currentColor" stroke-width="4"/>';
 if(down)shape='<g transform="translate(76 86) rotate(180)">'+shape+'</g>';
 if(dots)shape+='<circle cx="'+(down?69:53)+'" cy="'+(down?23:61)+'" r="4"/>';
 return '<svg class="duration-symbol" viewBox="0 0 76 86" aria-hidden="true">'+shape+'</svg>';
}
function beamedExample(flags,down=false){
 const body=[22,62].map(x=>'<ellipse cx="'+x+'" cy="65" rx="9" ry="6" fill="currentColor"/><path d="M'+(x+8)+' 64V20" stroke="currentColor" stroke-width="3"/>').join('')+Array.from({length:flags},(_,i)=>'<path d="M30 '+(20+i*10)+'H70" stroke="currentColor" stroke-width="6"/>').join('');
 return '<svg viewBox="0 0 100 86" aria-hidden="true">'+(down?'<g transform="translate(100 86) rotate(180)">'+body+'</g>':body)+'</svg>';
}
function linkedNotesSVG(tied){
 return '<svg viewBox="0 0 290 130" role="img" aria-label="'+(tied?'같은 높이의 음표를 붙임줄로 연결':'다른 높이의 음표를 이음줄로 연결')+'"><path d="M20 40H270M20 55H270M20 70H270M20 85H270M20 100H270" fill="none" stroke="#6d8491"/>'+[65,tied?65:50].map((y,i)=>'<ellipse cx="'+(80+i*130)+'" cy="'+y+'" rx="13" ry="9" fill="currentColor"/><path d="M'+(92+i*130)+' '+y+'V'+(y-40)+'" stroke="currentColor" stroke-width="3"/>').join('')+'<path d="M80 85Q145 120 210 '+(tied?85:70)+'" stroke="currentColor" stroke-width="3" fill="none"/></svg>';
}
function linkedNotesGuide(){return '<aside class="activity-linked"><h3>연결된 음표</h3><h4>붙임줄 · 같은 음높이</h4>'+linkedNotesSVG(true)+'<p>한 번만 소리 내고 길이를 합칩니다.<br><b>1초 + 1초 = 2초</b></p><h4>이음줄 · 다른 음높이</h4>'+linkedNotesSVG(false)+'<p>각 음의 길이는 그대로,<br>음을 부드럽게 이어 연주합니다.</p></aside>';}
const rhythmComparison=[
 ['4분음표','quarter',0,1],['2분음표','half',0,2],['점4분음표','quarter',1,1.5],
 ['온음표','whole',0,4],['8분음표','eighth',0,.5],['점8분음표','eighth',1,.75],['16분음표','16th',0,.25]
];
function renderActivity(){
 const visible=rhythmComparison.slice(0,step);
 activityRoot.querySelectorAll('[data-activity-note]').forEach(el=>el.classList.toggle('activity-current',visible.some(n=>n[0]===activityNotes[+el.dataset.activityNote][4].name)));
 activityRoot.querySelectorAll('.activity-seconds').forEach((el,i)=>el.setAttribute('visibility',visible.some(n=>n[0]===activityNotes[i][4].name)?'visible':'hidden'));
 const row=([name,type,dots,seconds],i)=>'<div class="duration-row'+(i===step-1?' duration-current':'')+'"><div class="duration-variants">'+durationSymbol(type,dots)+(type==='whole'?'':durationSymbol(type,dots,true))+'</div><b>'+name+'</b><span class="duration-equation">1초 × '+seconds+' = <strong>'+seconds+'초</strong></span><span class="duration-ratio">'+(seconds===1?'기준':'4분음표의 '+seconds+'배')+'</span></div>';
 const guide='<aside class="activity-linked"><h3>모양이 달라도 길이는 같아요</h3><p>줄기가 위·아래로 향해도 같은 음표입니다. 점은 원래 길이의 절반을 더합니다.</p><div class="beam-example"><b>8분음표 · 꼬리 1개</b>'+beamedExample(1)+beamedExample(1,true)+'</div><div class="beam-example"><b>16분음표 · 꼬리 2개</b>'+beamedExample(2)+beamedExample(2,true)+'</div><p>꼬리를 묶어도 각 음표의 길이는 그대로입니다.</p><h4>붙임줄 / 이음줄</h4>'+linkedNotesSVG(true)+'<p>붙임줄: 같은 음을 합쳐 연주<br>이음줄: 다른 음을 부드럽게 연결</p></aside>';
 activityRoot.querySelector('.activity-explanation').innerHTML='<div class="activity-duration"><p class="activity-basis">이번 활동의 기준: <b>4분음표 = 1초</b></p><h3>'+(step===0?'다음 버튼으로 음표 길이를 비교해 봅시다.':step===7?'음표 길이 한눈에 보기':'음표별 길이를 차례로 비교해 봅시다.')+'</h3>'+visible.map(row).join('')+'</div>'+guide;
 activityRoot.querySelectorAll('.entry-tab').forEach(el=>el.classList.toggle('active-tab',el.dataset.tab==='hardware'));
}
document.querySelectorAll('img').forEach(img=>{const path=img.getAttribute('src');if(path?.startsWith('../assets/')||path?.includes('/phycom/assets/'))img.src=assetBase+path.split('/').pop();else if(path?.startsWith('./cake-'))img.src=lessonBase+path.slice(2);});
const studentRoot=$('#studentWorkPage');
const studentNotes=window.buzzerStudentWork.notes;
window.buzzerStudentWork.init(studentRoot,{start,noteBlock});
const studentRoot2=$('#studentWorkPage2'),student2Notes=window.buzzerStudentWork2.notes;
window.buzzerStudentWork2.init(studentRoot2,{start,noteBlock});
for(const id of [3,4])window.buzzerStudentImageWorks.init(id,$('#studentWorkPage'+id),{start,noteBlock});
// Reuse the existing compact Entry button on the controlling block.
for(const root of [birthdayRoot,canonRoot,studentRoot,studentRoot2,$('#studentWorkPage3'),$('#studentWorkPage4')]){
 const button=root.querySelector('[data-direct-play],[data-buzzer-result="birthday"]');
 const block=[...(root===birthdayRoot?root.querySelector('.birthday-melody'):root).querySelectorAll('.repeat-block')].find(e=>e.textContent.includes('계속 반복하기'))||(root===birthdayRoot?root.querySelector('.birthday-melody'):root).querySelector('.start-block');
 if(!button||!block)continue;
 button.className=block.classList.contains('repeat-block')?'entry-loop-run-btn':'entry-run-btn';
 button.textContent='▶';button.setAttribute('aria-label','연주 재생 / 정지');button.setAttribute('aria-pressed','false');block.append(button);
 const title=root.querySelector('.student2-song');if(title){const panel=title.parentElement;panel.prepend(title);}
}
let canonCompleted=false,canonSaved=false;
const saveWrap=canonRoot.querySelector('.entry-save-wrap'),saveButton=canonRoot.querySelector('.entry-save-btn'),saveMenu=canonRoot.querySelector('.entry-save-menu'),completeButton=canonRoot.querySelector('.entry-complete-btn');
function resetCanonFlow(){canonCompleted=false;canonSaved=false;saveButton.disabled=true;completeButton.disabled=true;saveWrap.classList.remove('save-focus');completeButton.classList.remove('complete-focus');saveMenu.classList.remove('show');saveMenu.setAttribute('aria-hidden','true');canonRoot.querySelector('.canon-progress').textContent='캐논을 마지막 음까지 연주하면 저장할 수 있어요.';}
function canonFinished(){canonCompleted=true;saveButton.disabled=false;saveWrap.classList.add('save-focus');canonRoot.querySelector('.canon-progress').textContent='연주 완료! 상단 저장 메뉴에서 저장하기를 눌러 주세요.';}
saveButton.addEventListener('click',()=>{if(!canonCompleted)return;const visible=saveMenu.classList.toggle('show');saveMenu.setAttribute('aria-hidden',String(!visible));});
canonRoot.querySelectorAll('.entry-save-item').forEach(b=>b.addEventListener('click',()=>{if(!canonCompleted)return;try{localStorage.setItem('buzzer-canon-work',JSON.stringify({title:'캐논',pin:3,notes:canon,tempo:canonBPM}));}catch{canonRoot.querySelector('.canon-progress').textContent='저장 공간을 사용할 수 없습니다. 다시 저장해 주세요.';return;}canonSaved=true;saveWrap.classList.remove('save-focus');saveMenu.classList.remove('show');saveMenu.setAttribute('aria-hidden','true');completeButton.disabled=false;completeButton.classList.add('complete-focus');canonRoot.querySelector('.canon-progress').textContent='저장 완료! 학습 완료를 눌러 주세요.';}));
completeButton.addEventListener('click',()=>{if(!canonCompleted)return;completeButton.classList.remove('complete-focus');canonRoot.querySelector('.canon-progress').textContent='캐논 연주 활동을 완료했습니다.';});
resetCanonFlow();
// Preserve the lesson's step order and score references; delegate block geometry to EntryEngine.
const E=window.EntryEngine,commonViews=new Map(),commonExecutions=new Map();
let blockSerial=0;
function commonSequence(host){
 const nodes=[];
 for(const el of [...host.children]){
  if(el.classList.contains('repeat-body'))continue;
  if(!el.classList.contains('entry-block')){nodes.push(...commonSequence(el));continue;}
  const isFunction=/^함수 .*호출/.test(el.textContent),control=el.classList.contains('repeat-block')&&!isFunction;
  const category=isFunction?'function':el.classList.contains('start-block')?'start':el.classList.contains('looks-block')?'looks':control||el.classList.contains('wait-block')?'flow':'hardware';
  const n={id:'buzzer-block-'+(++blockSerial),type:category==='start'?'event':control?'c':'command',category,parts:[],source:el};
  for(const part of [...el.children]){
   if(part.matches('button,.play-dot,.function-call-mark,.hardware-symbol'))continue;
   const value=part.textContent.replace(/▼/g,'').trim();
   if(part.matches('.field,.number-field'))n.parts.push({slot:{id:'slot-'+n.parts.length,value:{kind:part.matches('.number-field')?'literal':'dropdown',value}}});
   else if(value)n.parts.push({text:value});
  }
  const button=el.querySelector('[data-direct-play],[data-buzzer-result]');if(button)n.run=button.dataset.directPlay||button.dataset.buzzerResult;
  if(control){const body=el.nextElementSibling;n.branches=[body?.classList.contains('repeat-body')?commonSequence(body):[]];}
  nodes.push(n);
 }
 return nodes;
}
function commonConvert(host){
 commonViews.get(host)?.renderer.destroy();
 const nodes=commonSequence(host),bodyNodes=new Set();function mark(n){for(const branch of n.branches||[])for(const child of branch){bodyNodes.add(child.id);mark(child)}}nodes.forEach(mark);
 let blocks=nodes.filter(n=>!bodyNodes.has(n.id));if(host.classList.contains('student2-code-list'))blocks=[{id:'buzzer-definition-'+(++blockSerial),type:'definition',category:'function',parts:[{text:host.previousElementSibling.textContent}],branches:[blocks]}];
 const scripts=[{id:'buzzer-script-'+blockSerial,blocks}];
 const renderer=new E.Renderer(host,key=>commonRun(key));renderer.render(scripts);
 E.walk(scripts,n=>{const rendered=renderer.blocks.get(n.id),source=n.source;if(!source)return;source.className=rendered.className+' '+[...source.classList].filter(c=>!['entry-block','indent-0','indent-1','repeat-block','hardware-block','looks-block','start-block','wait-block'].includes(c)).join(' ');source.style.cssText=rendered.style.cssText;source.dataset.block=n.id;source.dataset.type=n.type;source.dataset.category=n.category;source.replaceChildren(...rendered.childNodes);rendered.replaceWith(source);renderer.blocks.set(n.id,source);renderer.observer?.observe(source);});
 renderer.reflow();commonViews.set(host,{renderer,scripts});return scripts;
}
for(const root of pages.slice(2,9)){
 root.classList.add('buzzer-common-entry');
 const hosts=root.querySelectorAll('.birthday-melody,.companion-code,.canon-code-program,.student-code-program,.student2-code-main,.student2-code-list,.student-image-code-program');
 if(root.id==='triadPage')commonConvert(root.querySelector('.entry-program'));
 else {for(const host of hosts)commonConvert(host);if(root===birthdayRoot){const host=root.querySelector('.birthday-cake-code'),wrapper=document.createElement('div');for(const el of [...host.children])if(el.classList.contains('entry-block'))wrapper.append(el);host.prepend(wrapper);commonConvert(wrapper);}}
 const frame=root.querySelector('.entry-workspace,.student-image-work,.student1-workspace');const tabs=root.querySelector('.entry-tabs')||frame?.insertBefore(document.createElement('aside'),frame.children[1]);
 if(tabs){tabs.className='entry-tabs';root.commonTabs=new E.Tabs(tabs,assetBase);const cats=[...new Set([...root.querySelectorAll('.ec-block')].map(el=>el.dataset.category))];root.commonTabs.render(root.id==='triadPage'?['start']:cats,'start');}
 const definitions={};for(const key of ['pin13','triad','birthday','canon','student','student2','student3','student4'])definitions[key]={policy:'once',view(){const el=document.createElement('div');el.innerHTML=key==='pin13'?window.pin13ResultMarkup({image:assetBase+'OrangeBoard.png'}):key==='triad'?triadScoreSVG():key==='birthday'?scoreSVG():key==='canon'?'<div class="canon-score-view">'+canonScoreSVG(0)+'</div>':commonStudentResult(root);return el;},run({cleanup,done}){cleanup(stopAudio);if(key==='pin13')return;const notes=key==='triad'?triad.slice(0,Math.max(1,Math.min(3,step-4))):key==='birthday'?birthday:key==='canon'?canon:key==='student'?studentNotes:key==='student2'?student2Notes:window.buzzerStudentImageWorks.works[Number(key.at(-1))].notes;play(notes,['triad','canon','student4'].includes(key),key,null,done);}};
 commonExecutions.set(root,new E.Execution(root,definitions));
}
function commonStudentResult(root){const score=root.querySelector('.student-score-view,.student2-score-view,.student-image-score');return (root.querySelector('.student2-song,.student-song')?.outerHTML||'')+(score?.innerHTML||'');}
function commonRun(key){
 unlockAudio();
 if(page>=4&&page<=8){
  if(voice){stopAudio();return;}
  const notes=key==='canon'?canon:key==='student'?studentNotes:key==='student2'?student2Notes:window.buzzerStudentImageWorks.works[Number(key.at(-1))].notes;
  play(notes,key==='canon'||key==='student4',key,pages[page].querySelector('[data-run]'));return;
 }
 commonExecutions.get(pages[page])?.toggleResult(key);
}
function fitInlineScores(){
 for(const root of pages.slice(4,9)){
  const viewer=root.querySelector('.canon-score-view,.student-score-view,.student2-score-view,.student-image-score');
  const svg=viewer?.querySelector('svg');if(!svg||!viewer.clientHeight)continue;
  const rows=svg.viewBox.baseVal.height/(root===canonRoot?200:190);
  svg.style.height=(viewer.clientHeight*rows/3.5)+'px';svg.setAttribute('preserveAspectRatio','none');
 }
}
const scoreObserver=new ResizeObserver(fitInlineScores);
for(const root of pages.slice(4,9))scoreObserver.observe(root.querySelector('.canon-score-view,.student-score-view,.student2-score-view,.student-image-score'));

window.buzzerCommonConvert=commonConvert;
function commonTriad(){
 const root=pages[2],view=commonViews.get(root.querySelector('.entry-program')),scripts=E.clone(view.scripts.map(s=>({id:s.id,blocks:s.blocks.map(function clean(n){const {source,...rest}=n;return {...rest,branches:n.branches?.map(b=>b.map(clean))}})})));
 scripts[0].blocks=scripts[0].blocks.filter(n=>Number(view.renderer.blocks.get(n.id).dataset.entryStep)<=step);
 const loop=scripts[0].blocks.find(n=>n.type==='c');if(loop){loop.branches[0]=loop.branches[0].filter(n=>Number(view.renderer.blocks.get(n.id).dataset.entryStep)<=step);if(step<5)delete loop.run;}
 const pin=scripts[0].blocks.find(n=>n.run==='pin13');if(pin&&step>=4)delete pin.run;
 const current=[...view.renderer.blocks.values()].find(el=>Number(el.dataset.entryStep)===(step===3?2:Math.min(step,7)));
 view.renderer.render(scripts,step<8?current?.dataset.block:null);
 root.querySelector('.triad-block-count').textContent=root.querySelectorAll('.ec-block').length;
 const cats=step<2?['start']:step<4?['start','hardware']:['start','flow','hardware'];
 root.commonTabs.render(cats,step===0?null:step<2?'start':step===4?'flow':'hardware');
}

function renderTriad(){commonTriad();}
function fitCode(){
 const root=pages[page];if(page!==2&&page!==3)return;
 if(page===2)commonViews.get(root.querySelector('.entry-program')).renderer.fitWorkspace();
 const program=root.querySelector('.entry-program');program.style.transform='none';
 const grid=program.querySelector('.birthday-code-grid,.score-activity-grid');
 const naturalWidth=grid?grid.scrollWidth:Math.max(...[...program.querySelectorAll('.entry-show')].map(el=>(el.getBoundingClientRect().right-program.getBoundingClientRect().left)/(window.infoLessonScale||1)),1);
 const available=root.querySelector('.entry-stage').clientWidth*(dialog? .43:1)-32;
 const naturalHeight=program.scrollHeight;
 const height=root.querySelector('.entry-stage').clientHeight-program.offsetTop-20;
 const scale=Math.min(1,available/naturalWidth,height/naturalHeight);
 program.style.transform=`scale(${Math.max(.1,scale)})`;
}
function renderCode(birth){if(!birth)renderTriad();requestAnimationFrame(fitCode);}
function render(){pages.forEach((p,i)=>p.classList.toggle('active',i===page));document.body.classList.toggle('after-intro',(page>=2));document.body.classList.toggle('entry-page',page>=2);document.querySelectorAll('.slide-sidebar-item').forEach((b,i)=>{b.classList.toggle('active',i===page);if(i===page)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});$('#subtitle').textContent=titles[page];$('#slides').textContent=window.hardwareConnect?.number(page,pages.length)||`${page+1} / ${pages.length}`;$('#prev').disabled=page===0&&step===0;$('#next').disabled=false;
 if(page===1){window.lessonCircuit.refresh();window.lessonCircuit.setStep(step);$('#circuitGuide').textContent=['VCC → 5V, GND → GND, IN → D3 순서로 연결합니다.','VCC → 5V : 전원 공급','GND → GND : 전원의 −극 연결','IN → D3 : 소리 제어 신호 연결'][step];}
 if(page>=2){if(page===9)renderActivity();else renderCode(page!==2);requestAnimationFrame(fitCode);}
 if(page===4&&step===1)commonRun('canon');
 if(page===0&&step===1)openDialog('principle');else if(page===0&&step===3)openDialog('pins');else if(page===2&&step===3)commonRun('pin13');else if(page===2&&step===8)commonRun('triad');else if(page===3&&step===1)commonRun('birthday');
 if(page>=5&&page<=8&&step===1)commonRun(page===5?'student2':page===6?'student4':page===7?'student3':'student');
}
function move(direction){
 closeDialog(false);
 const target=direction>0&&step===limits[page]?page+1:direction<0&&step===0?page-1:page;
 if(window.hardwareConnect?.before(page,target,n=>{page=n;step=n===1?limits[1]:0;render();}))return;
 if(direction>0){if(step<limits[page])step++;else if(page<pages.length-1){page++;step=0;}}
 else if(step>0)step--;else if(page>0){page--;step=limits[page];}
 render();
}
function triadScoreSVG(){
 const bottom=220,spacing=32,xs=[280,580,880],ys=[bottom+spacing,bottom,bottom-spacing];
 let s='<svg class="triad-score" viewBox="0 0 1160 380" role="img" aria-label="높은음자리표 오선보: 4옥타브 도, 미, 솔"><title>도4 → 미4 → 솔4 · 각 0.5초</title>';
 for(let i=0;i<5;i++)s+=`<path class="staff-line" d="M 75 ${bottom-i*spacing} H 1100"/>`;
 s+='<text x="92" y="226" font-size="150" fill="#243447">𝄞</text>';
 triad.forEach((n,i)=>{const x=xs[i],y=ys[i];
  s+=`<g class="triad-note" data-note="${i}" aria-label="${n[0]}4"><circle class="note-halo" cx="${x}" cy="${y}" r="35"/>`;
  if(i===0)s+=`<path d="M ${x-34} ${y} H ${x+34}" fill="none" stroke-width="3"/>`;
  s+=`<ellipse cx="${x}" cy="${y}" rx="22" ry="15" transform="rotate(-15 ${x} ${y})"/><path d="M ${x+20} ${y} V ${y-92}" fill="none" stroke-width="4"/><text class="note-label" x="${x}" y="342" text-anchor="middle">${n[0]}</text></g>`;
 });return s+'</svg>';
}
function scoreSVG(){const phraseEnds=[6,12,19,25],positions={도:0,레:1,미:2,파:3,솔:4,라:5,'라#(시♭)':6};let s='<svg class="score" viewBox="0 0 1160 510" role="img" aria-label="생일축하노래 악보, 교과서 77페이지 코드의 음과 박자"><title>생일축하노래 · 3/4박자 · 1박 = 1초</title>';let begin=0;
 for(let row=0;row<4;row++){const bottom=92+row*123,notes=birthday.slice(begin,phraseEnds[row]),spacing=940/(notes.length-1);
  for(let l=0;l<5;l++)s+=`<path d="M 75 ${bottom-l*12} H 1125" fill="none" stroke="#6d8491" stroke-width="1.5"/>`;
  s+=`<text x="24" y="${bottom-5}" font-size="55">𝄞</text>`;if(row===0)s+=`<text x="80" y="${bottom-25}" font-size="23">3</text><text x="80" y="${bottom-3}" font-size="23">4</text>`;
  let beat=0;
  notes.forEach((n,j)=>{const x=125+j*spacing,diatonic=(n[1]-4)*7+positions[n[0]],y=bottom+12-diatonic*6;const up=y>=bottom-24,stemX=x+(up?8:-8),stemY=y+(up?-36:36),open=n[2]===2;
   if(j>0&&Math.abs((beat-1)%3)<.001)s+=`<path d="M ${x-spacing/2} ${bottom-48} V ${bottom}" stroke="#738a96" fill="none"/>`;
   s+=`<g class="score-note" data-note="${begin+j}"><circle class="note-halo" cx="${x}" cy="${y}" r="22"/>`;
   if(y>=bottom+12)s+=`<path d="M ${x-15} ${bottom+12} H ${x+15}" stroke-width="2"/>`;
   if(n[0].includes('#'))s+=`<text x="${x-25}" y="${y+5}" font-size="22">♭</text>`;
   s+=`<ellipse cx="${x}" cy="${y}" rx="9" ry="6" transform="rotate(-15 ${x} ${y})" ${open?'fill="white"':''} stroke-width="2"/><path d="M ${stemX} ${y} V ${stemY}" fill="none" stroke-width="2"/>`;
   if(n[2]<1)s+=`<path d="M ${stemX} ${stemY} q 20 10 9 27" fill="none" stroke-width="3"/>`;
   if(n[2]===.25)s+=`<path d="M ${stemX} ${stemY+(up?9:-9)} q 20 10 9 27" fill="none" stroke-width="3"/>`;
   if(n[2]===.75)s+=`<circle cx="${x+18}" cy="${y-3}" r="3"/>`;
   s+=`<text x="${x}" y="${bottom+39}" text-anchor="middle" stroke="none" font-size="19">${n[0].includes('#')?'시♭':n[0]}${n[1]===5?'⁵':''}</text><text x="${x}" y="${bottom+62}" text-anchor="middle" stroke="none" font-size="16">${n[2]}초</text></g>`;beat+=n[2];
  });s+=`<path d="M 1125 ${bottom-48} V ${bottom}" stroke="#738a96"/>`;begin=phraseEnds[row];
 }return s+'</svg>';}
function canonScoreSVG(first=0){
 const visible=canon.slice(first),letters={도:0,레:1,미:2,파:3,솔:4,라:5,시:6};
 let svg='<svg class="score" viewBox="0 0 1160 '+(Math.ceil(canon.length/6)*200)+'" role="img" aria-label="현재 재생 구간의 캐논 단선율 악보">' ;
 for(let row=0;row<Math.ceil(canon.length/6);row++){
  const bottom=80+row*200;
  for(let line=0;line<5;line++)svg+=`<path d="M75 ${bottom-line*12} H1125" stroke="#6d8491" stroke-width="1.5" fill="none"/>`;
  svg+=`<g transform="translate(42 ${bottom-12}) scale(.6)" aria-label="높은음자리표"><path d="M2 58 C-22 43 -22 14 0 -5 C23 -25 19 -55 9 -57 C-5 -58 -9 -36 0 -13 C9 10 18 30 9 43 C-1 57 -23 43 -15 29 C-11 21 0 26 -3 34 M0 -5 C-26 -2 -29 27 -7 31 C14 37 27 18 12 6 C1 -3 -13 8 -8 20 M9 -57 L1 58" fill="none" stroke="#243447" stroke-width="4" stroke-linecap="round"/></g>`;
  for(let j=0;j<6;j++){
   const n=visible[row*6+j];if(!n)break;
   const index=first+row*6+j,x=165+j*180,rest=n[3]===null,y=rest?bottom-24:bottom+12-((n[1]-4)*7+letters[n[0][0]])*6,up=y>=bottom-24,meta=n[4];
   svg+=`<g class="score-note" data-note="${index}"><circle class="note-halo" cx="${x}" cy="${y}" r="32"/>`;
   if(rest){svg+=`<text x="${x}" y="${y+8}" text-anchor="middle" font-size="34">${meta.type==='eighth'?'𝄾':meta.type==='half'?'𝄼':'𝄽'}</text>`;}
   else{
    if(n[0].includes('#'))svg+=`<text x="${x-26}" y="${y+5}" font-size="22">♯</text>`;
    if(n[0].includes('♮'))svg+=`<text x="${x-26}" y="${y+5}" font-size="22">♮</text>`;
    for(let ledger=bottom+12;ledger<=y;ledger+=12)svg+=`<path d="M${x-15} ${ledger} H${x+15}" stroke-width="2"/>`;
    for(let ledger=bottom-60;ledger>=y;ledger-=12)svg+=`<path d="M${x-15} ${ledger} H${x+15}" stroke-width="2"/>`;
    svg+=`<ellipse cx="${x}" cy="${y}" rx="14" ry="10" ${['half','whole'].includes(meta.type)?'fill="white"':''} transform="rotate(-15 ${x} ${y})"/>`;
    if(meta.type!=='whole')svg+=`<path d="M${x+(up?8:-8)} ${y} v${up?-36:36}" stroke-width="2" fill="none"/>`;
    const flags={eighth:1,'16th':2,'32nd':3}[meta.type]||0;
    for(let flag=0;flag<flags;flag++)svg+=`<path d="M${x+(up?8:-8)} ${y+(up?-36:36)+(up?flag*8:-flag*8)} q18 ${up?8:-8} 10 ${up?22:-22}" stroke-width="3" fill="none"/>`;
    for(let dot=0;dot<meta.dots;dot++)svg+=`<circle cx="${x+17+dot*6}" cy="${y-3}" r="2.5"/>`;
    if(meta.tieStop)svg+=`<path d="M${x-34} ${y+18} Q${x-17} ${y+29} ${x} ${y+18}" stroke-width="2" fill="none"/>`;
    if(meta.tieStart)svg+=`<path d="M${x} ${y+18} Q${x+17} ${y+29} ${x+34} ${y+18}" stroke-width="2" fill="none"/>`;
   }
   svg+=`<text x="${x}" y="${bottom+84}" text-anchor="middle" stroke="none" font-size="32" font-weight="900">${rest?'쉼표':n[0]+n[1]}</text><text x="${x}" y="${bottom+116}" text-anchor="middle" stroke="none" font-size="26">${n[2]}초</text></g>`;
  }
 }
 return svg+'</svg>';
}
function openDialog(kind){if(dialog)closeDialog(false);returnFocus=document.activeElement;dialog=kind;if(kind==='pins'){$('#pinDialog').showModal();return;}const overlay=$('#dialogOverlay');if(['triad','pin13','birthday','canon','activity'].includes(kind)){const stage=pages[page].querySelector('.entry-stage');stage.appendChild(overlay);overlay.classList.add('code-result');stage.classList.add('code-result-open');$('.buzzer-dialog').setAttribute('aria-modal','false');requestAnimationFrame(fitCode);}overlay.hidden=false;const content=$('#dialogContent');$('#dialogTitle').textContent={principle:'수동버저는 어떻게 소리를 낼까요?',pin13:'실행 결과 · 13번 핀',triad:'실행 결과 · 도·미·솔',birthday:'실행 결과 · 생일축하노래',canon:'실행 결과 · 캐논',activity:'실행 결과 · 완성한 구절'}[kind];
 if(kind==='principle'){content.innerHTML=`<div class="principle-demo">
  <div class="principle-flow-labels"><span>전기 신호</span><b>→</b><span>진동판의 진동</span><b>→</b><span>공기의 진동</span><b>→</b><span>소리</span></div>
  <div class="principle-sound"><svg class="principle-stage" viewBox="0 0 1100 320" role="img" aria-label="전기 신호가 버저에 들어오면 내부 진동판이 위아래로 떨리고 주변 공기의 진동이 소리로 퍼집니다.">
    <defs><marker id="signalArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#e38b12"/></marker></defs>
    <text class="diagram-label signal-label" x="125" y="65" text-anchor="middle">전기 신호</text>
    <rect x="40" y="95" width="165" height="76" rx="18" fill="#fff1ca" stroke="#e7aa36" stroke-width="3"/>
    <text class="signal-on" x="123" y="146" text-anchor="middle">ON</text><text class="signal-off" x="123" y="146" text-anchor="middle">OFF</text>
    <path d="M205 133 H345" fill="none" stroke="#e38b12" stroke-width="8" marker-end="url(#signalArrow)"/>
    <circle class="signal-pulse" cx="215" cy="133" r="10" fill="#ffc438"/>
    <rect x="360" y="30" width="310" height="236" rx="65" fill="#e9f2f6" stroke="#27465b" stroke-width="7"/>
    <path d="M390 65 Q515 25 640 65" fill="none" stroke="#9ab1bf" stroke-width="5"/>
    <text class="diagram-label" x="515" y="100" text-anchor="middle">수동버저</text>
    <g class="diaphragm"><rect x="402" y="144" width="226" height="15" rx="7" fill="#f2b635" stroke="#a76a08" stroke-width="3"/></g>
    <path d="M515 213 V180" fill="none" stroke="#a76a08" stroke-width="3"/>
    <text class="diaphragm-label" x="515" y="245" text-anchor="middle">진동판</text>
    <path class="sound-wave wave-one" d="M705 100 Q765 148 705 196"/>
    <path class="sound-wave wave-two" d="M705 86 Q786 148 705 210"/>
    <path class="sound-wave wave-three" d="M705 72 Q807 148 705 224"/>
    <text class="diagram-label air-label" x="885" y="285" text-anchor="middle">공기가 떨리며 소리가 퍼짐</text>

  </svg>
  <p class="principle-key">전기 신호에 따라 진동판이 빠르게 떨리면,<br>주변 공기도 떨리고, 그 진동이 귀에 전달되어 소리를 듣습니다.</p>

  <section class="chord-concept" aria-label="버저 개수와 멜로디·화음"><h3>수동버저 1개는 한 번에 하나의 음을 냅니다.</h3><div class="chord-comparison"><article><strong class="chord-notes">도</strong><b>버저 1개</b><span>한 번에 하나의 음</span><span>→ 멜로디 연주 가능</span></article><article><strong class="chord-notes">도 + 미</strong><b>버저 2개</b><span>서로 다른 음을 동시에</span><span>→ 두 음의 화음 가능</span></article></div></section></div>
  <div class="pitch-comparison"><article class="pitch-panel pitch-low" style="--vibration-cycle:1.2s">
      <div class="pitch-result">느린 진동 → 낮은 음</div>
      <svg class="pitch-stage" viewBox="0 0 540 150" role="img" aria-label="낮은 음: 전기 신호와 진동판은 느리게, 파동은 넓은 간격">
        <rect x="15" y="45" width="90" height="54" rx="12" fill="#fff1ca" stroke="#e7aa36" stroke-width="2"/>
        <text class="signal-on" x="60" y="80" text-anchor="middle">ON</text><text class="signal-off" x="60" y="80" text-anchor="middle">OFF</text>
        <path d="M105 72 H174" stroke="#e38b12" stroke-width="5"/>
        <path class="pitch-signal-pattern" d="M15 132 H15 V116 H33.0 V132 H51 V116 H69.0 V132 H87 V116 H105.0 V132 H123 V116 H141.0 V132 H160"/>
        <rect x="180" y="16" width="120" height="112" rx="27" fill="#e9f2f6" stroke="#27465b" stroke-width="4"/>
        <g class="diaphragm"><rect x="195" y="66" width="90" height="10" rx="5" fill="#f2b635" stroke="#a76a08" stroke-width="2"/></g>
        <text x="240" y="108" text-anchor="middle" class="pitch-diaphragm-label">진동판</text>
        <path class="pitch-wave" style="animation-delay:-0.0s" d="M310 40 Q345 72 310 104"/><path class="pitch-wave" style="animation-delay:-1.2s" d="M310 40 Q345 72 310 104"/>
      </svg>
      <dl class="pitch-details"><div><dt>전기 신호</dt><dd><strong>느리게</strong></dd></div><div><dt>진동판</dt><dd><strong>느리게</strong></dd></div><div><dt>소리 파동</dt><dd><strong>넓은 간격</strong></dd></div></dl>
    </article><article class="pitch-panel pitch-high" style="--vibration-cycle:0.4s">
      <div class="pitch-result">빠른 진동 → 높은 음</div>
      <svg class="pitch-stage" viewBox="0 0 540 150" role="img" aria-label="높은 음: 전기 신호와 진동판은 빠르게, 파동은 좁은 간격">
        <rect x="15" y="45" width="90" height="54" rx="12" fill="#fff1ca" stroke="#e7aa36" stroke-width="2"/>
        <text class="signal-on" x="60" y="80" text-anchor="middle">ON</text><text class="signal-off" x="60" y="80" text-anchor="middle">OFF</text>
        <path d="M105 72 H174" stroke="#e38b12" stroke-width="5"/>
        <path class="pitch-signal-pattern" d="M15 132 H15 V116 H21.0 V132 H27 V116 H33.0 V132 H39 V116 H45.0 V132 H51 V116 H57.0 V132 H63 V116 H69.0 V132 H75 V116 H81.0 V132 H87 V116 H93.0 V132 H99 V116 H105.0 V132 H111 V116 H117.0 V132 H123 V116 H129.0 V132 H135 V116 H141.0 V132 H147 V116 H153.0 V132 H160"/>
        <rect x="180" y="16" width="120" height="112" rx="27" fill="#e9f2f6" stroke="#27465b" stroke-width="4"/>
        <g class="diaphragm"><rect x="195" y="66" width="90" height="10" rx="5" fill="#f2b635" stroke="#a76a08" stroke-width="2"/></g>
        <text x="240" y="108" text-anchor="middle" class="pitch-diaphragm-label">진동판</text>
        <path class="pitch-wave" style="animation-delay:-0.0s" d="M310 40 Q345 72 310 104"/><path class="pitch-wave" style="animation-delay:-0.4s" d="M310 40 Q345 72 310 104"/><path class="pitch-wave" style="animation-delay:-0.8s" d="M310 40 Q345 72 310 104"/><path class="pitch-wave" style="animation-delay:-1.2000000000000002s" d="M310 40 Q345 72 310 104"/><path class="pitch-wave" style="animation-delay:-1.6s" d="M310 40 Q345 72 310 104"/><path class="pitch-wave" style="animation-delay:-2.0s" d="M310 40 Q345 72 310 104"/>
      </svg>
      <dl class="pitch-details"><div><dt>전기 신호</dt><dd><strong>빠르게</strong></dd></div><div><dt>진동판</dt><dd><strong>빠르게</strong></dd></div><div><dt>소리 파동</dt><dd><strong>좁은 간격</strong></dd></div></dl>
    </article></div>
</div><small class="pitch-note">※ 실제 진동은 매우 빠르기 때문에 움직임을 느리게 표현했습니다.</small>`;}
 overlay.classList.toggle('pin13-image-result',kind==='pin13');$('#dialogTitle').hidden=kind==='pin13';
 if(kind==='pin13'){content.innerHTML=window.pin13ResultMarkup({image:assetBase+'OrangeBoard.png'});$('.buzzer-dialog').classList.add('entry-result-card');const b=$('#triadPage [data-buzzer-result="pin13"]');b.dataset.idleText=b.textContent;b.textContent='■';b.classList.add('running');}
 if(['triad','birthday','canon','activity'].includes(kind)){
  if(kind==='canon')canonCompleted=true;
  content.innerHTML=kind==='triad'?triadScoreSVG():kind==='birthday'?scoreSVG():kind==='activity'?activityScoreSVG():'<div class="canon-score-view">'+canonScoreSVG()+'</div>';
  if(kind==='birthday')content.insertAdjacentHTML('beforeend','<div class="birthday-object"><img src="'+lessonBase+'cake-1.png" alt="생일케이크_1"><strong>생일케이크</strong></div>');
  play(kind==='triad'?triad:kind==='birthday'?birthday:kind==='activity'?activityNotes:canon,kind==='triad'||kind==='canon',kind,pages[page].querySelector(`[data-buzzer-result="${kind}"],[data-direct-play="${kind}"]`));
 }
 if(['triad','birthday','canon','activity'].includes(kind)&&(kind!=='triad'||step>=limits[2])){window.lessonUI.completeResult(pages[page]);if(kind==='canon'){canonCompleted=true;completeButton.classList.add('complete-focus');}}
 $('.buzzer-dialog').focus();
}
function scrollPlayingCode(viewer,active){const scale=viewer.getBoundingClientRect().height/viewer.offsetHeight,offset=(active.getBoundingClientRect().top-viewer.getBoundingClientRect().top)/scale+viewer.scrollTop;if(offset<viewer.scrollTop||offset+active.getBoundingClientRect().height/scale>viewer.scrollTop+viewer.clientHeight)viewer.scrollTop=Math.max(0,offset-viewer.clientHeight*.25);}
function clearHighlight(){document.querySelectorAll('[data-note].playing,[data-student-note].playing,.code-playing').forEach(el=>el.classList.remove('playing','code-playing'));}
function stopAudio(){session++;canonRoot.querySelector('.student-code-scroll').scrollTop=0;canonRoot.querySelectorAll('.canon-score-view').forEach(view=>view.innerHTML=canonScoreSVG(0));window.buzzerStudentWork.reset();window.buzzerStudentWork2.reset();window.buzzerStudentImageWorks.reset();document.querySelectorAll('[data-direct-play].running,[data-buzzer-result].running,.inline-running').forEach(b=>{b.classList.remove('running','inline-running');b.textContent=b.dataset.idleText||'▶';b.setAttribute('aria-pressed','false');});pages.slice(4,9).forEach(root=>{const view=root.querySelector('.canon-score-view,.student-score-view,.student2-score-view,.student-image-score');view.scrollTop=0;});fitInlineScores();cancelAnimationFrame(frame);frame=0;clearHighlight();if(voice){try{voice.stop();}catch{}voice.disconnect();voice=null;}if(gain){gain.gain.cancelScheduledValues(0);gain.disconnect();gain=null;}}
function closeDialog(restore=true){commonExecutions.forEach(execution=>execution.close());if(restore&&page===4&&dialog==='canon'){step=2;$('#next').disabled=false;}stopAudio();$('#pinDialog').close();dialog=null;const overlay=$('#dialogOverlay');overlay.hidden=true;overlay.classList.remove('pin13-image-result');$('.buzzer-dialog').classList.remove('entry-result-card');$('#dialogTitle').hidden=false;$('#dialogContent').innerHTML='';if(overlay.classList.contains('code-result')){const stage=overlay.parentElement;stage.classList.remove('code-result-open');overlay.classList.remove('code-result');$('.buzzer-dialog').setAttribute('aria-modal','true');(document.getElementById('lessonCanvas')||document.body).appendChild(overlay);}requestAnimationFrame(fitCode);if(restore&&returnFocus?.isConnected)returnFocus.focus();}
async function play(notes,repeat=false,kind=dialog,button=null,onDone=null){
 stopAudio();if(kind==='student2')notes=window.buzzerStudentWork2.getPlayback();if(button){button.dataset.idleText=button.textContent;button.textContent='■';button.classList.add('running','inline-running');button.setAttribute('aria-pressed','true');}
 if(kind==='student')window.buzzerStudentWork.reset();if(kind==='student2')window.buzzerStudentWork2.reset();fitInlineScores();
 const loop=repeat,speed=kind==='birthday'?1.5:kind==='canon'?canonBPM/60:1,token=session,status=$('.audio-status');
 try{audio=await ensureAudioReady();if(token!==session)return;
 if(audio.state!=='running')throw new Error('Audio suspended');
 voice=audio.createOscillator();gain=audio.createGain();voice.type='square';voice.connect(gain);gain.connect(audio.destination);
 startedAt=audio.currentTime+.06;const ends=[];duration=0;for(const n of notes){duration+=n[2]/speed;ends.push(duration);}
 gain.gain.setValueAtTime(0,audio.currentTime);voice.start();scheduledCycle=-1;
 function schedule(cycle){let t=startedAt+cycle*duration;for(let i=0;i<notes.length;i++){const n=notes[i],seconds=n[2]/speed,meta=n[4],tied=kind==='canon'&&meta?.tieStop&&i>0&&notes[i-1][4]?.tieStart&&notes[i-1][3]===n[3],continues=kind==='canon'&&meta?.tieStart&&notes[i+1]?.[4]?.tieStop&&notes[i+1][3]===n[3];
   if(n[3]===null){gain.gain.setValueAtTime(0,t);}else{voice.frequency.setValueAtTime(440*Math.pow(2,(n[3]-69)/12),t);if(!tied){gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.055,t+.004);}if(!continues){gain.gain.setValueAtTime(.055,t+seconds-.006);gain.gain.linearRampToValueAtTime(0,t+seconds);}}t+=seconds;}scheduledCycle=cycle;}
 schedule(0);if(loop)schedule(1);else voice.stop(startedAt+duration);
 let previous=-1,cursor=0,lastCycle=0,lastClock=0;
 function tick(){if(token!==session||!voice)return;
  const output=audio.getOutputTimestamp?.();const sampled=output?.contextTime>0?output.contextTime:audio.currentTime;
  // Output timestamps may briefly regress: never move the playhead backwards.
  const clock=Math.max(lastClock,Math.min(audio.currentTime,sampled));lastClock=clock;
  if(clock<startedAt){frame=requestAnimationFrame(tick);return;}
  const elapsed=Math.max(0,clock-startedAt);
  if(!loop&&elapsed>=duration){stopAudio();if(status)status.textContent='연주 완료';if(kind==='canon')canonFinished();onDone?.();return;}
  const cycle=loop?Math.floor(elapsed/duration):0;if(loop&&scheduledCycle<cycle+1)schedule(cycle+1);
  if(cycle!==lastCycle){cursor=0;previous=-1;lastCycle=cycle;if(kind==='canon')canonFinished();}
  const phase=elapsed-cycle*duration;while(cursor<notes.length-1&&phase>=ends[cursor])cursor++;
  if(cursor!==previous){clearHighlight();if(kind==='canon')canonRoot.querySelectorAll(`[data-note="${cursor}"]`).forEach(note=>{note.classList.add('playing');scrollPlayingCode(canonRoot.querySelector('.canon-score-view'),note)});else $('#dialogContent').querySelector(`[data-note="${cursor}"]`)?.classList.add('playing');
   if(kind==='student')window.buzzerStudentWork.highlight(cursor);if(kind==='student2')window.buzzerStudentWork2.highlight(cursor);if(kind==='student3'||kind==='student4')window.buzzerStudentImageWorks.highlight(Number(kind.at(-1)),cursor);
   commonExecutions.forEach(execution=>{if(execution.running)execution.content.querySelector(`[data-note="${cursor}"]`)?.classList.add('playing');});
   if(kind.startsWith('student')){
    const viewer=pages[page].querySelector('.student-score-view,.student2-score-view,.student-image-score');
    const active=viewer.querySelector('.playing');if(active)scrollPlayingCode(viewer,active);
   }
   if(kind==='triad')$('#triadPage').querySelector(`[data-entry-step="${cursor+5}"]`)?.classList.add('code-playing');
   if(kind==='activity'){activityRoot.querySelector(`.activity-note-${cursor}`)?.classList.add('code-playing');activityRoot.querySelector(`[data-activity-note="${cursor}"]`)?.classList.add('playing');}
   if(kind==='birthday')birthdayRoot.querySelector(`.birthday-note-${cursor}`)?.classList.add('code-playing');
   if(kind==='canon'){const active=canonRoot.querySelector(`.canon-note-${cursor}`);active.classList.add('code-playing');scrollPlayingCode(canonRoot.querySelector('.student-code-scroll'),active);}
   if(status)status.textContent=notes[cursor][3]===null?'쉼표':notes[cursor][0];previous=cursor;
  }frame=requestAnimationFrame(tick);
 }frame=requestAnimationFrame(tick);
 }catch(error){if(token===session){stopAudio();if(status)status.textContent='코드의 재생 버튼으로 다시 시작하세요.';onDone?.();}}
}
// Same sidebar DOM, item structure and fullscreen visibility as the LED lesson.
titles.forEach((title,i)=>{
 const b=document.createElement('button');b.type='button';b.className='slide-sidebar-item';
 b.innerHTML='<span class="sidebar-page-no">'+(i+1)+'</span><span>'+title+'</span>';
 b.addEventListener('click',()=>{closeDialog(false);page=i;step=0;render();});$('#slideSidebarList').appendChild(b);
});
document.querySelectorAll('[data-direct-play]').forEach(b=>b.addEventListener('click',()=>{if(b.classList.contains('running')){stopAudio();if(page>=4&&page<=8)step=2;return;}unlockAudio();closeDialog(false);const kind=b.dataset.directPlay;if(kind==='canon'){step=1;play(canon,true,kind,b);return;}if(page>=4&&page<=8)step=1;play(kind==='student'?studentNotes:kind==='student2'?student2Notes:kind==='student3'||kind==='student4'?window.buzzerStudentImageWorks.works[Number(kind.at(-1))].notes:kind==='triad'?triad:kind==='birthday'?birthday:canon,kind==='canon'||kind==='student4',kind,b);}));
document.querySelectorAll('[data-buzzer-result]').forEach(b=>b.addEventListener('click',()=>{if(b.classList.contains('running')){closeDialog();return;}unlockAudio();if(b.dataset.buzzerResult==='canon'){step=1;render();}else{if(b.dataset.buzzerResult==='birthday')step=1;openDialog(b.dataset.buzzerResult);}}));
$('#pinDialog [data-close-dialog]').addEventListener('click',()=>closeDialog());$('#pinDialog').addEventListener('click',e=>{if(e.target===$('#pinDialog'))closeDialog();});$('#pinDialog').addEventListener('cancel',e=>{e.preventDefault();closeDialog();});
$('#next').addEventListener('click',()=>move(1));$('#prev').addEventListener('click',()=>move(-1));$('#closeDialog').addEventListener('click',()=>closeDialog());window.lessonUI.bindOutside({key:'buzzer-result',isOpen:()=>!$('#dialogOverlay').hidden,inside:'#next,#prev,#touchNext,#touchPrev,.buzzer-dialog,.ec-run,[data-buzzer-result],[data-direct-play],[data-dialog],.run-result',close:()=>closeDialog()});
document.querySelectorAll('[data-dialog]').forEach(b=>b.addEventListener('click',()=>openDialog(b.dataset.dialog)));document.querySelectorAll('.run-result').forEach(b=>b.addEventListener('click',()=>openDialog(page===2?'triad':'birthday')));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDialog();return;}const tag=(e.target.tagName||'').toLowerCase();if((e.key==='f'||e.key==='F')&&tag!=='input'&&tag!=='textarea'&&!e.target.isContentEditable){e.preventDefault();$('#fullscreenBtn').click();return;}if(e.target.closest('.student-code-scroll,.student2-code-scroll')&&['ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(e.key))return;const direction=window.lessonUI.direction(e);if(direction){e.preventDefault();move(direction);}if(e.key==='Tab'&&dialog&&dialog!=='pins'&&dialog!=='triad'&&dialog!=='pin13'&&dialog!=='birthday'&&dialog!=='canon'){const buttons=[...$('.buzzer-dialog').querySelectorAll('button')];const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===$('.buzzer-dialog'))){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
function syncFullscreen(){const on=!!document.fullscreenElement;$('#fullscreenBtn').textContent=on?'×':'⛶';$('#fullscreenBtn').setAttribute('aria-label',on?'전체화면 종료':'전체화면으로 보기');$('#fullscreenBtn').setAttribute('aria-pressed',String(on));window.lessonCircuit.refresh();}
$('#fullscreenBtn').addEventListener('click',()=>window.lessonStage.toggleFullscreen());document.addEventListener('fullscreenchange',syncFullscreen);syncFullscreen();
window.addEventListener('resize',fitCode);document.addEventListener('fullscreenchange',fitCode);
function stopCommonAudio(){commonExecutions.forEach(execution=>execution.stop());stopAudio();}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopCommonAudio();});window.addEventListener('pagehide',stopCommonAudio);
// Read-only state for direct lesson verification, without affecting the LED controller.
window.buzzerLesson={getState:()=>({page:page+1,step,dialog,playing:!!voice}),canon:canon.map(n=>n.slice()),birthday:birthday.map(n=>n.slice()),triad:triad.map(n=>n.slice()),student:studentNotes.map(n=>n.slice()),activity:activityNotes.map(n=>n.slice()),student2:student2Notes.map(n=>n.slice())};window.addEventListener("load",()=>{window.hardwareConnect.open=()=>{closeDialog(false);window.hardwareConnect.before(1,2,n=>{page=n;step=n===1?limits[1]:0;render();});};render();});render();
window.deviceConcept=new DeviceConcept({root:pages[0],openPopup:key=>openDialog(key==='operation'?'principle':'pins'),closePopup:()=>closeDialog(false),operationTriggers:'[data-dialog="principle"],.module-button img',pinTriggers:'[data-dialog="pins"]',onNext:()=>{closeDialog(false);page=1;step=0;render();}});
})();
