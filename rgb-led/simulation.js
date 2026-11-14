/* RGB-only artwork and textbook I/O model; shared Execution owns the popup and resources. */
(()=>{'use strict';
const ns='http://www.w3.org/2000/svg';
function view(kind){
 const section=document.createElement('section');section.className='rgb-result';section.dataset.kind=kind;if(kind==='concept')section.classList.add('rgb-concept-operation');
 if(kind!=='mix'){const title=document.createElement('h3');title.textContent=kind==='basic'?'RGB LED 기본 제어':'빨강·초록·파랑 빛의 가산 혼합';section.append(title);}
 const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox',kind==='mix'?'100 200 1200 820':'0 0 1346 1168');svg.setAttribute('role','img');svg.setAttribute('aria-label','RGB LED의 혼합 색상');
 const image=document.createElementNS(ns,'image');image.setAttribute('href','../assets/RGB_LED.png');image.setAttribute('width','1346');image.setAttribute('height','1168');svg.append(image);
 if(kind==='mix'){
  const defs=document.createElementNS(ns,'defs');
  for(const [name,stops]of [['core',[[0,1],[.14,.95],[.4,.8],[.72,.28],[1,0]]],['halo',[[0,.6],[.35,.38],[.7,.1],[1,0]]]]){
   const gradient=document.createElementNS(ns,'radialGradient');gradient.id='rgb-mix-'+name;gradient.dataset.rgbGlow=name;
   for(const [offset,opacity]of stops){const stop=document.createElementNS(ns,'stop');stop.setAttribute('offset',offset);stop.setAttribute('stop-opacity',opacity);gradient.append(stop);}defs.append(gradient);
  }svg.append(defs);
  const halo=document.createElementNS(ns,'circle');halo.dataset.rgbHalo='';halo.setAttribute('cx','470');halo.setAttribute('cy','640');halo.setAttribute('r','190');halo.setAttribute('fill','url(#rgb-mix-halo)');svg.append(halo);
 }
 const light=document.createElementNS(ns,'circle');light.dataset.rgbLight='';light.setAttribute('cx','470');light.setAttribute('cy','640');light.setAttribute('r',kind==='mix'?'130':'100');if(kind==='mix')light.setAttribute('fill','url(#rgb-mix-core)');svg.append(light);section.append(svg);
 const values=document.createElement('p');values.dataset.rgbOutput='';section.append(values);
 if(kind==='mix'){
  const variables=document.createElement('p');variables.dataset.rgbVariables='';section.append(variables);
  const controls=document.createElement('div');controls.className='rgb-key-controls';
  for(const key of [...RgbLedCode.programs.keys.filter(k=>k.delta>0),...RgbLedCode.programs.keys.filter(k=>k.delta<0)]){const button=document.createElement('button');button.type='button';button.dataset.rgbKey=key.key;button.textContent=key.key.toUpperCase()+' · '+key.name+' '+(key.delta>0?'+':'')+key.delta;controls.append(button);}section.append(controls);
 }
 if(kind==='concept'){
  const panel=document.createElement('div');panel.className='rgb-concept-panel';
  const name=document.createElement('h4');name.dataset.rgbColour='';panel.append(name);
  const channels=document.createElement('div');channels.className='rgb-concept-channels';
  ['R · 빨강','G · 초록','B · 파랑'].forEach((name,i)=>{const row=document.createElement('div');row.dataset.rgbChannel=i;const label=document.createElement('span');label.textContent=name;const value=document.createElement('output');const meter=document.createElement('meter');meter.min=0;meter.max=255;meter.setAttribute('aria-label',name+' 밝기');row.append(label,value,meter);channels.append(row);});panel.append(channels);
  const mix=document.createElement('p');mix.dataset.rgbCombination='';panel.append(mix);
  const explanation=document.createElement('p');explanation.className='rgb-concept-summary';explanation.textContent='RGB LED는 하나의 LED에서 R·G·B 빛의 밝기를 조절하여 다양한 색을 표현한다.';panel.append(explanation);section.append(panel);
 }
 if(kind!=='mix'){const help=document.createElement('p');help.className='rgb-help';help.textContent=kind==='concept'?'0 = 꺼짐 · 255 = 최대 밝기 · 세 빛의 가산 혼합':'공통 GND · 0은 꺼짐, 255는 가장 밝음';section.append(help);}return section;
}
function paint(host,rgb){
 const light=host.querySelector('[data-rgb-light]'),peak=Math.max(...rgb),colour='rgb('+rgb.join(',')+')';
 if(host.querySelector('.rgb-result').dataset.kind==='mix'){
  // Display-only exposure correction: retain RGB ratios and leave the real output values untouched.
  const intensity=peak?Math.pow(peak/255,.3):0,hue=rgb.map(value=>peak?Math.round(value*255/peak):0),tint=white=>'rgb('+hue.map(value=>Math.round(value+(255-value)*white)).join(',')+')';
  host.querySelectorAll('[data-rgb-glow="core"] stop').forEach((stop,i)=>stop.setAttribute('stop-color',tint(i===0?.85:i===1?.5:0)));
  host.querySelectorAll('[data-rgb-glow="halo"] stop').forEach(stop=>stop.setAttribute('stop-color',tint(0)));
  light.style.opacity=intensity;host.querySelector('[data-rgb-halo]').style.opacity=intensity;
 }else{light.setAttribute('fill',colour);light.style.opacity=peak?'.85':'0';light.style.filter=peak?'drop-shadow(0 0 24px '+colour+')':'none';}light.dataset.rgb=rgb.join(',');
 host.querySelector('[data-rgb-output]').textContent='R(D9) '+rgb[0]+' · G(D10) '+rgb[1]+' · B(D11) '+rgb[2];
}
function result(kind){return{
 preserveCode:true,policy:'continuous',
 get placement(){
  if(kind==='concept')return undefined;
  if(kind!=='mix')return{right:16,top:110,width:440};
  const root=document.getElementById('mix'),block=root.querySelector('[data-block="mix-repeat"]'),bounds=root.getBoundingClientRect(),scale=bounds.width/root.offsetWidth;
  return{below:'[data-block="mix-repeat"]',gap:8,left:block?(block.getBoundingClientRect().left-bounds.left)/scale:22,width:block?block.getBoundingClientRect().width/scale:465};
 },
 view:()=>view(kind),
 run(ctx){
  const rgb=[0,0,0];paint(ctx.host,rgb);
  if(kind==='basic'){
   const commands=RgbLedCode.programs.basic[0].branches[0];
   const step=start=>{let index=start;for(;;){const command=commands[index],value=id=>command.parts.find(p=>p.slot?.id===id).slot.value.value;if(command.category==='flow'){ctx.timeout(()=>step((index+1)%commands.length),value('seconds')*1000);return;}rgb[value('pin')-9]=value('action')==='켜기'?255:0;paint(ctx.host,rgb);index=(index+1)%commands.length;}};step(0);return;
  }
  if(kind==='mix'){
   const variables=[0,0,0];let held=null,resumeAt=0,nextAuto=performance.now()+300,manualPending=false,previousOrder='';
   const label=ctx.host.querySelector('[data-rgb-variables]'),panel=ctx.host.querySelector('.rgb-result'),buttons=[...ctx.host.querySelectorAll('[data-rgb-key]')];
   const showVariables=()=>{label.textContent='변수 · 빨강 '+variables[0]+' / 초록 '+variables[1]+' / 파랑 '+variables[2];label.dataset.values=variables.join(',');};
   showVariables();
   const highlight=key=>buttons.forEach(button=>button.classList.toggle('is-active',button.dataset.rgbKey===key));
   const adjust=(key,manual=true)=>{const action=RgbLedCode.programs.keys.find(a=>a.key===key);if(!action)return;const current=variables[action.channel];if(action.delta>0?current<action.limit:current>action.limit)variables[action.channel]+=action.delta;highlight(key);showVariables();if(manual){resumeAt=performance.now()+1500;manualPending=true;}};
   let phase=0,cycle=0,plan;
   const newCycle=()=>{
    const order=[0,1,2];for(let i=2;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
    if(order.join('')===previousOrder)[order[0],order[1]]=[order[1],order[0]];previousOrder=order.join('');
    const goal=[0,0,0];plan=order.map((channel,i)=>{goal[channel]=40+20*Math.floor(Math.random()*3);return{name:['single','two','three'][i],goal:goal.slice()};});plan.push({name:'dim',goal:[20,20,20]});phase=0;panel.dataset.demoCycle=++cycle;
   };
   newCycle();
   const autoStep=()=>{
    if(manualPending){plan=[{name:'resume',goal:variables.map(v=>Math.min(255,v+40))},{name:'dim',goal:[20,20,20]}];phase=0;manualPending=false;}
    const current=plan[phase];panel.dataset.demoStage=current.name;
    const possible=RgbLedCode.programs.keys.filter(k=>k.delta>0?variables[k.channel]<current.goal[k.channel]:variables[k.channel]>current.goal[k.channel]);
    if(possible.length){adjust(possible[Math.floor(Math.random()*possible.length)].key,false);return;}
    if(++phase<plan.length)return;
    variables.fill(0);showVariables();highlight(null);newCycle();
   };
   const keydown=e=>{if(e.ctrlKey||e.altKey||e.metaKey||e.target.closest('input,textarea,select,[contenteditable="true"]'))return;const key=e.key.toLowerCase();if(RgbLedCode.programs.keys.some(a=>a.key===key)){e.preventDefault();e.stopImmediatePropagation();adjust(key);}};
   const release=()=>{if(held){held=null;resumeAt=performance.now()+1500;}};
   window.addEventListener('keydown',keydown,true);document.addEventListener('pointerup',release);document.addEventListener('pointercancel',release);window.addEventListener('blur',release);
   ctx.cleanup(()=>{window.removeEventListener('keydown',keydown,true);document.removeEventListener('pointerup',release);document.removeEventListener('pointercancel',release);window.removeEventListener('blur',release);buttons.forEach(button=>button.onpointerdown=null);highlight(null);});
   buttons.forEach(button=>button.onpointerdown=e=>{e.preventDefault();held=button.dataset.rgbKey;adjust(held);});
   const delay=150;
   ctx.interval(()=>{const now=performance.now();if(held){adjust(held);return;}if(now<resumeAt||now<nextAuto)return;nextAuto=now+300;autoStep();},100);
   ctx.interval(()=>paint(ctx.host,variables),delay);return;
  }

  const colours=[[[255,0,0],'빨강','R'],[[0,255,0],'초록','G'],[[0,0,255],'파랑','B'],[[255,255,0],'노랑','R + G'],[[255,0,255],'자홍','R + B'],[[0,255,255],'청록','G + B'],[[255,255,255],'흰색','R + G + B']];let index=0;
  const show=()=>{const [rgb,name,combination]=colours[index];paint(ctx.host,rgb);ctx.host.querySelector('[data-rgb-colour]').textContent=name;ctx.host.querySelector('[data-rgb-combination]').textContent=combination+' → '+name;ctx.host.querySelectorAll('[data-rgb-channel]').forEach((row,i)=>{row.querySelector('output').value=rgb[i];row.querySelector('meter').value=rgb[i];row.classList.toggle('lit',rgb[i]>0);});index=(index+1)%colours.length;};show();ctx.interval(show,1400);
 }
};}
window.RgbLedSimulation={result};
})();
