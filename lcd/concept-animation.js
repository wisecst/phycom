// Presentation uses the existing LCD popup action index and shared Resources.
(()=>{'use strict';
const bits='01000001',glyph=['01110','10001','10001','11111','10001','10001','10001','00000'];
window.LcdConceptAnimation=class{
 constructor(root,getAction){
  this.root=root;this.getAction=getAction;this.scope=null;
  const ns='http://www.w3.org/2000/svg';
  for(const [selector,x,y,dx,dy,size]of [['[data-dot-cell]',446,44,1.8,3,1.5],['[data-dot-zoom]',0,0,5,6,4]]){
   const group=root.querySelector(selector);
   for(let row=0;row<8;row++)for(let col=0;col<5;col++){const dot=document.createElementNS(ns,'rect');dot.classList.add('lcd-dot');dot.dataset.row=row;dot.dataset.lit=glyph[row][col];dot.setAttribute('x',x+col*dx);dot.setAttribute('y',y+row*dy);dot.setAttribute('width',size);dot.setAttribute('height',size);group.append(dot);}
  }
  const bitRow=root.querySelector('[data-bits]');
  for(const bit of bits){const span=document.createElement('span');span.textContent=bit;bitRow.append(span);}
  this.lastAction=14;
 }
 stop(){this.scope?.close();this.scope=null;this.root.dataset.busy='false';}
 advance(direction){
  if(direction>0&&this.root.dataset.busy==='true')return false;
  this.root.dataset.action=Math.max(0,Math.min(this.lastAction,this.getAction()+direction));this.sync(direction<0);return true;
 }
 sync(immediate=false){
  this.stop();if(!this.root.closest('.slide').classList.contains('active'))return;
  const action=this.getAction();this.paint(action,immediate?1600:0);
  if(action===2&&!immediate){const scope=this.scope=new EntryEngine.Resources();scope.timeout(()=>this.paint(action,600),600);scope.timeout(()=>{this.paint(action,1600);this.stop();},1600);}
  if(action>=5&&action<=12){
   if(immediate)this.signal(action-5,'complete');
   else{this.scope=new EntryEngine.Resources();this.root.dataset.busy='true';this.transferBit(action-5,()=>this.stop());}
  }
 }
 signal(index,phase){
  const q=s=>this.root.querySelector(s),high=phase==='read',received=phase==='complete'?index+1:index,bit=bits[index];
  q('[data-sda-wave]').setAttribute('d','M155 80H205V'+(bit==='1'?60:80)+'H423');
  q('[data-scl-wave]').setAttribute('d','M155 119H205V'+(high?99:119)+'H423');
  q('[data-sda-level]').textContent=bit+' · '+(bit==='1'?'HIGH':'LOW');q('[data-scl-level]').textContent=high?'HIGH':'LOW';
  q('[data-bit-status]').textContent=(index+1)+'/8 비트';q('[data-received]').textContent=bits.slice(0,received)||'—';
  q('[data-signal-phase]').textContent={prepare:'SCL LOW — 데이터 준비',read:'SCL HIGH — 데이터 읽기',complete:'1비트 전송 완료'}[phase];
  this.root.querySelectorAll('[data-bits] span').forEach((span,i)=>{span.classList.toggle('current',i===index);span.classList.toggle('received',i<received);});
  const token=q('[data-data-token]');token.hidden=phase==='complete';token.setAttribute('cx',high?410:205);token.setAttribute('cy',bit==='1'?60:80);
  this.root.dataset.sda=bit;this.root.dataset.scl=high?'1':'0';this.root.dataset.received=bits.slice(0,received);this.root.dataset.phase=phase;
 }
 transferBit(index,complete){
  const scope=this.scope;if(!scope?.alive)return;
  this.signal(index,'prepare');scope.timeout(()=>this.signal(index,'read'),500);
  scope.timeout(()=>this.signal(index,'complete'),1000);scope.timeout(complete,1400);
 }
 playAll(){
  this.stop();this.paint(13,0);this.scope=new EntryEngine.Resources();this.root.dataset.busy='true';
  const next=index=>{if(index<8)this.transferBit(index,()=>next(index+1));else this.displayCharacter();};next(0);
 }
 displayCharacter(){
  const scope=this.scope,q=s=>this.root.querySelector(s);
  q('[data-animation-caption]').textContent='개념적 전송 결과를 I²C 변환 회로에서 LCD 제어 회로로 전달합니다.';
  q('[data-converter]').classList.add('active');scope.timeout(()=>q('[data-controller]').classList.add('active'),500);
  for(let rows=1;rows<=8;rows++)scope.timeout(()=>{this.dots(rows);if(rows===8){q('[data-animation-caption]').textContent='LCD 제어 회로는 전달받은 문자 정보를 바탕으로 5×8 도트에 문자 A를 표시합니다.';this.stop();}},1000+rows*120);
 }
 dots(rows){this.root.querySelectorAll('.lcd-dot').forEach(dot=>dot.classList.toggle('on',+dot.dataset.row<rows&&dot.dataset.lit==='1'));this.root.dataset.rows=rows;}
 paint(action,elapsed){
  const q=s=>this.root.querySelector(s);this.root.dataset.action=action;
  q('[data-character]').hidden=action<1;q('[data-decimal]').hidden=action<2||action===2&&elapsed<600;q('[data-binary]').hidden=action<2||action===2&&elapsed<1400;
  q('[data-sda-label]').textContent='SDA · 데이터';q('[data-scl-label]').textContent='SCL · 클록';
  q('[data-sda-wave]').style.opacity=q('[data-scl-wave]').style.opacity=action>=4?'1':'.25';
  q('[data-sda-wave]').setAttribute('d','M155 80H423');q('[data-scl-wave]').setAttribute('d','M155 119H423');
  q('[data-sda-level]').textContent=q('[data-scl-level]').textContent='LOW';q('[data-data-token]').hidden=true;
  q('[data-converter]').classList.toggle('active',action===14);q('[data-controller]').classList.toggle('active',action===14);this.dots(action===14?8:0);
  q('[data-bit-status]').textContent='';q('[data-received]').textContent=action>=13?bits:'—';q('[data-signal-phase]').textContent='';
  this.root.querySelectorAll('[data-bits] span').forEach(span=>{span.classList.remove('current');span.classList.toggle('received',action>=13);});
  q('.lcd-transfer-controls').hidden=action<13;this.root.dataset.sda='0';this.root.dataset.scl='0';this.root.dataset.received=action>=13?bits:'';this.root.dataset.phase='ready';
  q('[data-animation-caption]').textContent=action<=4?[
   '오렌지보드 → I²C 변환 회로 → LCD 제어 회로 → 문자 표시의 흐름을 살펴봅니다.',
   '출력할 문자 A를 준비합니다.',
   '문자 A의 코드값 65를 8비트 01000001로 나타낸 개념적 예시입니다.',
   'SDA는 데이터를 전달하고, SCL은 수신 측이 데이터를 읽는 타이밍을 맞춥니다.',
   'SCL이 LOW일 때 다음 비트를 준비하고 HIGH인 동안 SDA 값을 안정적으로 유지합니다.'
  ][action]:action<=12?'다음을 한 번 누를 때마다 한 비트의 준비 → 읽기 → 완료를 관찰합니다.':action===13?'8비트 탐구 완료 · 전체 재생으로 같은 신호 변화를 연속 관찰합니다.':'I²C 변환 회로와 LCD 제어 회로를 거쳐 문자 A가 표시됩니다.';
 }
};
})();
