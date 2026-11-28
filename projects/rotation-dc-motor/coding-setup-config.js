/* Number-costume state and its inline drag demonstration only. */
(()=>{'use strict';
const initialOrder=[1,2,3,4,5,6,7,8,9,10,0],completedOrder=[0,1,2,3,4,5,6,7,8,9,10];
const original=document.querySelector('#introDemo .live-number');let animations=[],observer=null;
function costumePreview(value){const node=original.cloneNode(true);node.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));node.removeAttribute('id');node.querySelector('b').textContent=value;return node;}
function stopDemo(){observer?.disconnect();observer=null;animations.forEach(a=>a.cancel());animations=[];}
function list(ui,values){ui.listCostumes(ui.content,values);ui.root.querySelector('.entry-setup-led').replaceChildren(costumePreview(values[0]));}
function demonstrate(ui){
 stopDemo();list(ui,initialOrder);
 const host=ui.content,rows=[...host.children],zero=rows.at(-1),hand=document.createElement('span');
 hand.className='fan-costume-hand';hand.textContent='✋';hand.setAttribute('aria-hidden','true');zero.append(hand);
 rows.forEach(row=>{const done=document.createElement('b');done.className='fan-costume-done-index';done.textContent=completedOrder.indexOf(Number(row.dataset.costume))+1;row.append(done);});
 let lastHeight=0;
 observer=new ResizeObserver(()=>{
  const height=rows[0].getBoundingClientRect().height/(host.getBoundingClientRect().height/host.clientHeight);
  if(!height||Math.abs(height-lastHeight)<.1)return;lastHeight=height;
  animations.forEach(a=>a.cancel());animations=[];
  const play=(node,frames)=>animations.push(node.animate(frames,{duration:7000,iterations:Infinity,easing:'linear'}));
  play(zero,[{offset:0,transform:'translateY(0)',outline:'0px solid transparent'},{offset:.14,transform:'translateY(0)',outline:'0px solid transparent'},{offset:.22,transform:'translateY(0)',outline:'3px solid #ffbf00'},{offset:.28,transform:'translateY(0)',outline:'3px solid #ffbf00'},{offset:.68,transform:'translateY('+(-10*height)+'px)',outline:'3px solid #ffbf00'},{offset:.88,transform:'translateY('+(-10*height)+'px)',outline:'3px solid #ffbf00'},{offset:.95,transform:'translateY(0)',outline:'0px solid transparent'},{offset:1,transform:'translateY(0)',outline:'0px solid transparent'}]);
  rows.slice(0,-1).forEach((row,index)=>{const pass=.28+(9-index)*.04;play(row,[{offset:0,transform:'translateY(0)'},{offset:pass,transform:'translateY(0)'},{offset:pass+.04,transform:'translateY('+height+'px)'},{offset:.88,transform:'translateY('+height+'px)'},{offset:.95,transform:'translateY(0)'},{offset:1,transform:'translateY(0)'}]);});
  rows.forEach(row=>{play(row.querySelector('.coding-setup-costume-index'),[{offset:0,opacity:1},{offset:.67,opacity:1},{offset:.68,opacity:0},{offset:.88,opacity:0},{offset:.95,opacity:1},{offset:1,opacity:1}]);play(row.querySelector('.fan-costume-done-index'),[{offset:0,opacity:0},{offset:.67,opacity:0},{offset:.68,opacity:1},{offset:.88,opacity:1},{offset:.95,opacity:0},{offset:1,opacity:0}]);});
  play(hand,[{offset:0,opacity:0},{offset:.18,opacity:0},{offset:.23,opacity:1,transform:'scale(.85)'},{offset:.68,opacity:1,transform:'scale(.85)'},{offset:.73,opacity:0,transform:'scale(1)'},{offset:1,opacity:0}]);
 });observer.observe(host);
}
const extraSteps=[
 {tab:'모양',caption:'0번 모양을 1번 모양 앞으로 이동합니다.',render:demonstrate,leave:stopDemo},
 {tab:'모양',caption:'0번 모양이 모양 번호 1이 되었습니다.',render(ui){stopDemo();list(ui,completedOrder);}}
];
window.fanCodingSetup=EntryCodingSetup.insert({kind:'fan',title:'다이얼 선풍기 · 코딩 전 설정',search:'숫자',defaultId:1,variable:'단계',slider:false,previousIndex:2,nextIndex:3,resume:n=>window.hardwareLessonAdapter.resume(n),initialScripts:()=>window.fanSetupCode(),costumePreview,costumeLabel:value=>'숫자 버튼_'+value,costumeSize:'190 × 214',extraSteps,reset:stopDemo,options:[{id:1,name:'숫자 버튼',image:'setup-number-reference.png',width:585,height:354,crop:'144 168 120 109'}]});
})();
