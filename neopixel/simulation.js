/* Neopixel-only output, scheduled and cleaned up by the shared Execution. */
(()=>{'use strict';
const ns='http://www.w3.org/2000/svg';
function view(kind){
 const section=document.createElement('section');section.className='neo-result';section.dataset.kind=kind;
 const title=document.createElement('h3');title.textContent=kind==='rotation'?'빙글빙글 돌아가는 불빛':kind==='basic'?'네오픽셀 기본 제어':'네오픽셀 · 개별 LED와 RGB';section.append(title);
 const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 1536 1024');svg.setAttribute('role','img');svg.setAttribute('aria-label','0번부터 11번까지 12개 LED');
 const image=document.createElementNS(ns,'image');image.setAttribute('href','../assets/neopixel12ring.png');image.setAttribute('width','1536');image.setAttribute('height','1024');svg.append(image);
 const centres=[[1101,496],[1053,681],[928,815],[730,875],[532,817],[400,680],[350,494],[400,306],[540,168],[731,124],[927,170],[1056,306]];
 for(let i=0;i<12;i++){
  const [x,y]=centres[i];
  const light=document.createElementNS(ns,'circle');light.dataset.led=i;light.setAttribute('cx',x);light.setAttribute('cy',y);light.setAttribute('r',40);light.setAttribute('fill','transparent');svg.append(light);
  const number=document.createElementNS(ns,'text');number.textContent=i;number.setAttribute('x',725+(x-725)*.70);number.setAttribute('y',505+(y-500)*.70);number.setAttribute('text-anchor','middle');number.setAttribute('font-size','42');svg.append(number);
 }
 section.append(svg);const status=document.createElement('p');status.dataset.neoStatus='';section.append(status);
 if(kind==='operation'){const note=document.createElement('p');note.className='neo-explanation';note.textContent='빨강(R)·초록(G)·파랑(B)을 조합합니다. D8로 전달한 제어값에 따라 각 LED의 컨트롤러가 해당 번호의 색상과 밝기를 바꿉니다. 연결 단자 쪽 LED가 0번입니다.';section.append(note);}
 return section;
}
function paint(host,leds,label){const rotation=host.querySelector('.neo-result').dataset.kind==='rotation';host.querySelectorAll('[data-led]').forEach((led,i)=>{const rgb=leds[i];led.dataset.on=String(!!rgb);led.dataset.rgb=rgb?rgb.join(','):'';const peak=rgb?Math.max(...rgb):0,hue=peak?rgb.map(v=>Math.round(v*255/peak)):null;led.setAttribute('fill',hue?'rgb('+hue.join(',')+')':rotation?'#17242c':'transparent');led.style.opacity=peak?'1':rotation?'.8':'0';led.setAttribute('stroke',hue?'#ffffff':'transparent');led.setAttribute('stroke-width',hue?'8':'0');led.style.filter=hue?'drop-shadow(0 0 12px rgb('+hue.join(',')+')) drop-shadow(0 0 22px rgb('+hue.join(',')+'))':'none';});host.querySelector('[data-neo-status]').textContent=label;}
// RGB exploration uses the same view, paint and shared Execution resource scope.
function operation(){
 const steps=[[[0,0,0],'꺼짐','RGB 값이 모두 0이면 빛을 내지 않습니다.'],[[255,0,0],'빨강','R만 최대로 켜면 빨강이 됩니다.'],[[0,255,0],'초록','G만 최대로 켜면 초록이 됩니다.'],[[0,0,255],'파랑','B만 최대로 켜면 파랑이 됩니다.'],[[255,255,0],'노랑','빨강과 초록 빛을 섞으면 노랑이 됩니다.'],[[255,0,255],'자홍','빨강과 파랑 빛을 섞으면 자홍이 됩니다.'],[[0,255,255],'청록','초록과 파랑 빛을 섞으면 청록이 됩니다.'],[[255,255,255],'흰색','세 색의 빛을 모두 최대로 켜면 흰색이 됩니다.']];
 let section,stage=0,previous=[0,0,0];
 function update(rgb,name,explanation,leds){
  section.dataset.rgbStage=stage+1;
  paint(section.parentElement,leds||Array(12).fill(rgb.some(Boolean)?rgb:null),name);
  section.querySelectorAll('.neo-rgb-channel').forEach((row,i)=>{row.classList.toggle('changed',rgb[i]!==previous[i]);row.querySelector('output').value=rgb[i];row.querySelector('meter').value=rgb[i];});
  section.querySelector('.neo-rgb-caption').textContent=explanation;previous=rgb.slice();
 }
 function render(){const [rgb,name,text]=steps[stage]||[[255,0,0],'자동 색상 변화','R·G·B의 밝기를 조금씩 바꾸면 다양한 색이 이어집니다.'];update(rgb,(stage+1)+' / 9 · '+name,text);}
 return{
  preserveCode:true,policy:'continuous',
  view(){
   section=view('operation');stage=0;previous=[0,0,0];section.classList.add('neo-rgb-operation');
   const panel=document.createElement('div');panel.className='neo-rgb-panel';
   const heading=document.createElement('h4');heading.textContent='RGB 밝기 · 0~255';panel.append(heading);
   ['R · 빨강','G · 초록','B · 파랑'].forEach((name,i)=>{const row=document.createElement('div');row.className='neo-rgb-channel';row.dataset.channel=i;const label=document.createElement('label');label.textContent=name;const output=document.createElement('output');const meter=document.createElement('meter');meter.min=0;meter.max=255;meter.setAttribute('aria-label',name+' 밝기');row.append(label,output,meter);panel.append(row);});
   const caption=document.createElement('p');caption.className='neo-rgb-caption';caption.setAttribute('aria-live','polite');section.append(panel,caption);
   // The photograph has twelve uniformly spaced LEDs; keep the exploration overlay at exact 30° intervals.
   section.querySelectorAll('[data-led]').forEach((led,i)=>{const angle=i*Math.PI/6;led.setAttribute('cx',725+375*Math.cos(angle));led.setAttribute('cy',500+375*Math.sin(angle));});
   const detail=document.createElement('p');detail.className='neo-pixel-inside';detail.innerHTML='<span class="neo-primary-r">R</span> + <span class="neo-primary-g">G</span> + <span class="neo-primary-b">B</span> + <b>제어 칩(IC)</b><small>LED 하나의 내부</small>';section.append(detail);
   const flow=document.createElement('div');flow.className='neo-data-flow';flow.setAttribute('aria-label','LED의 물리적 연결 순서와 같은 데이터 전달');
   flow.innerHTML='<h4>하나의 데이터 경로 · 각 IC가 자기 색상 정보를 저장하고 나머지를 전달</h4><div class="neo-data-chain"><div class="neo-data-source"><b>오렌지보드 D8</b><small>색상 12묶음 전송</small></div><span aria-hidden="true">→</span><div data-pixel="0"><b>첫 번째 · 0번 IC</b><small>빨강 (255, 0, 0)</small><em>수신 대기</em></div><span aria-hidden="true">→</span><div data-pixel="1"><b>두 번째 · 1번 IC</b><small>초록 (0, 255, 0)</small><em>수신 대기</em></div><span aria-hidden="true">→</span><div data-pixel="2"><b>세 번째 · 2번 IC</b><small>파랑 (0, 0, 255)</small><em>수신 대기</em></div><span aria-hidden="true">→ 나머지 9개</span></div>';section.append(flow);
   section.querySelector('.neo-explanation').textContent='네오픽셀은 각 LED에 제어 칩이 있어 하나의 데이터 경로로 전달된 색상 정보를 순서대로 처리하고, LED마다 서로 다른 색을 표현할 수 있다. 색상 정보 묶음으로 단순화한 그림이며, 실제 비트 순서·통신 시간은 생략했습니다. 수신 중에는 색상을 저장하고 전송 완료 후 표시를 갱신합니다.';
   const svg=section.querySelector('svg'),pathLayer=document.createElementNS(ns,'g');pathLayer.classList.add('neo-data-path');
   for(let i=0;i<12;i++){const path=document.createElementNS(ns,'path');path.dataset.hop=i;const angle=i*Math.PI/6,prev=(i-1)*Math.PI/6;path.setAttribute('d',i===0?'M 1450 451 L 1396 451 L 1200 451 L 1100 500':'M '+(725+375*Math.cos(prev))+' '+(500+375*Math.sin(prev))+' A 375 375 0 0 1 '+(725+375*Math.cos(angle))+' '+(500+375*Math.sin(angle)));pathLayer.append(path);}
   svg.insertBefore(pathLayer,svg.querySelector('[data-led]'));
   return section;
  },
  advance(direction){if(!section?.isConnected||stage+direction<0||stage+direction>8)return false;stage+=direction;render();return true;},
  run({interval}){
   render();let tick=0;
   const colours=[[255,0,0],[255,255,0],[0,255,0],[0,255,255],[0,0,255],[255,0,255],[255,0,0]],individual=[[255,0,0],[0,255,0],[0,0,255]];
   const chain=(phase,received,hop)=>{section.dataset.transfer=phase;section.querySelectorAll('[data-pixel]').forEach((card,i)=>{card.dataset.ready=String(i<received);card.classList.toggle('receiving',i===hop);card.querySelector('em').textContent=i<received?'색상 저장됨':'수신 대기';});section.querySelectorAll('[data-hop]').forEach(path=>{path.classList.toggle('active',+path.dataset.hop===hop);path.style.strokeDashoffset=String(-tick*3);});};
   interval(()=>{
    if(stage!==8){tick=0;chain('waiting',0,-1);return;}
    const frame=tick++%420;
    if(frame<180){const progress=frame/30,index=Math.floor(progress),ratio=progress-index,rgb=colours[index].map((v,i)=>Math.round(v+(colours[index+1][i]-v)*ratio));chain('rgb',0,-1);section.querySelector('.neo-rgb-panel h4').textContent='RGB 밝기 · 0~255';update(rgb,'9 / 9 · 공통 원리: RGB 가산 혼합','각 LED도 R·G·B의 밝기를 조절하여 색을 만듭니다. 이어서 LED별 독립 제어를 관찰합니다.');return;}
    const time=frame-180,leds=Array(12).fill(null);let rgb=[0,0,0],label,text,received=0,hop=-1;
    if(time<20){label='보드 → 색상 정보 전송';text='첫 3개는 빨강·초록·파랑, 나머지 9개는 꺼짐 정보를 보냅니다.';}
    else if(time<110){const index=Math.min(2,Math.floor((time-20)/30));rgb=individual[index];received=index+1;hop=index;label=index+'번 IC · 색상 저장';text=index+'번 IC에 색상 저장 → 남은 정보는 다음 LED로 전달. 아직 점등하지 않습니다.';}
    else if(time<140){received=3;hop=3+Math.min(8,Math.floor((time-110)/3));label='남은 LED에도 순서대로 전달';text='같은 물리적 연결 순서로 나머지 9개 LED에도 꺼짐 정보를 전달합니다.';}
    else if(time<160){received=3;label='전송 완료 · 표시 갱신 준비';text='전송 완료 후 표시 갱신을 준비합니다. 실제 대기 시간을 느리게 표현했습니다.';}
    else{received=3;individual.forEach((rgb,i)=>leds[i]=rgb);label='0번 빨강 · 1번 초록 · 2번 파랑';text='전송 완료 후 저장한 색상으로 함께 켜집니다. LED마다 색상이 다릅니다.';}
    const selected=time<20?-1:time<110?Math.min(2,Math.floor((time-20)/30)):2;if(selected>=0)rgb=individual[selected];section.querySelector('.neo-rgb-panel h4').textContent=selected<0?'색상 정보 수신 준비':selected+'번 IC에 저장한 RGB 값';chain(time<160?'receiving':'display',received,hop);update(rgb,label,text,leds);
   },50);

  }
 };
}
function result(kind){return{
 preserveCode:true,placement:kind==='operation'?undefined:{top:110,right:16,width:440},policy:kind==='basic'?'repeat':'continuous',repeatDelay:2000,
 view:()=>view(kind),
 run({host,timeout,interval,done}){
  const leds=Array(12).fill(null);
  if(kind==='basic'){
   const blocks=NeoPixelCode.programs.basic[0].blocks,commands=blocks.filter(b=>b.category==='hardware').slice(1),delay=blocks.find(b=>b.id==='basic-wait-red').parts[0].slot.value.value*1000;
   const step=i=>{const b=commands[i],value=id=>b.parts.find(p=>p.slot?.id===id).slot.value.value,n=value('index');leds[n]=[value('red'),value('green'),value('blue')];paint(host,leds,n+'번 LED · R '+leds[n][0]+' / G '+leds[n][1]+' / B '+leds[n][2]);if(i+1<commands.length)timeout(()=>step(i+1),delay);else done();};step(0);return;
  }
  if(kind==='rotation'){
   const body=NeoPixelCode.programs.rotation[0].blocks[2].branches[0],on=body[0],rgb=['red','green','blue'].map(id=>on.parts.find(p=>p.slot?.id===id).slot.value.value),delay=body.find(b=>b.id==='rotation-wait').parts[0].slot.value.value*1000;
   let number=0;const step=()=>{leds[number]=rgb;leds[number===0?11:number-1]=null;paint(host,leds,'LED번호 '+number+' · 이전 LED 끄기 → 다음 LED 켜기');host.dataset.ledNumber=number;number=(number+1)%12;};step();interval(step,delay);return;
  }
  let number=0;const colours=[[255,0,0],[0,255,0],[0,0,255]],step=()=>{leds.fill(null);leds[number]=colours[number%3];paint(host,leds,number+'번 LED · RGB 색상 · 시계 방향 순차 제어');number=(number+1)%12;};step();interval(step,600);
 }
};}
window.NeoPixelSimulation={result,operation};
})();
