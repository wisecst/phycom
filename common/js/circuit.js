(()=>{
const POWER_COLOR="#e53935",GROUND_COLOR="#222222",SIGNAL_COLORS=["#1976d2","#43a047","#8e24aa","#ef6c00","#f2c200","#00897b","#6d4c41","#3949ab"];
const SAFE_MARGIN=18,LANE_SPACING=24,BOARD_LANE_MARGIN=28,PIN_EXIT_BASE=60,PIN_EXIT_SPACING=0;
const config=window.lessonCircuitConfig||{};
const layout=config.layout?.mode==='separated'?config.layout:null;
const boardDef=config.board||{pins:[{name:"D3",x:.79468,y:.06550},{name:"5V",x:.55263,y:.91500},{name:"GND2",x:.62169,y:.91500}]};
const moduleDef=config.module||{pins:[{name:"IN",x:.77279,y:.39963},{name:"VCC",x:.77538,y:.51097},{name:"GND",x:.77675,y:.62098}]};
const plannedConnections=config.connections||[{from:"VCC",to:"5V"},{from:"GND",to:"GND2"},{from:"IN",to:"D3"}];
let wires=[],currentConnectionStep=0;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const getDisplayPinName=n=>/^GND\d*$/i.test(n)?"GND":n;
const isGroundPin=n=>/^GND\d*$/i.test(n),isPowerPin=n=>/^(VCC|5V|3\.3V)$/i.test(n);
const workspace=()=>document.getElementById("workspace"),getModuleContainer=()=>document.getElementById("module"),getBoardContainer=()=>document.getElementById("board");
const BASE_W=724,BASE_H=390;
function circuitScale(){const w=workspace();return w?Math.min(w.clientWidth/BASE_W,w.clientHeight/BASE_H):1;}
function drawPins(layer,component,role){layer.innerHTML="";component.pins.forEach((p,i)=>{const el=document.createElement("div");el.className="pin";el.style.left=p.x*100+"%";el.style.top=p.y*100+"%";Object.assign(el.dataset,{role,pin:p.name,pinIndex:i,pinX:p.x,pinY:p.y});layer.appendChild(el);});}
function findPin(role,name){return [...document.querySelectorAll('.pin[data-role="'+role+'"]')].find(p=>p.dataset.pin===name)||null;}
function componentPosition(el){const t=getComputedStyle(el).transform;const matrix=t==="none"?null:new DOMMatrixReadOnly(t);return{x:el.offsetLeft+(matrix?.m41||0),y:el.offsetTop+(matrix?.m42||0)};}
function getPinPosition(pin){const p=componentPosition(pin.closest(".circuit-component"));return{x:p.x+pin.offsetLeft+.5,y:p.y+pin.offsetTop+.5};}
function getWireEnds(w){return{modulePin:w.pinA.dataset.role==='module'?w.pinA:w.pinB,boardPin:w.pinA.dataset.role==='board'?w.pinA:w.pinB};}
function getWireColor(a,b,index=0){const names=[a.dataset.pin,b.dataset.pin];if(names.some(isGroundPin))return GROUND_COLOR;if(names.some(isPowerPin))return POWER_COLOR;const signalIndex=layout?plannedConnections.slice(0,index).filter(c=>![c.from,c.to].some(n=>isGroundPin(n)||isPowerPin(n))).length:0;return SIGNAL_COLORS[signalIndex%SIGNAL_COLORS.length];}
function resizeComponents(){const w=workspace(),board=getBoardContainer(),module=getModuleContainer();if(!w||!w.clientWidth)return false;for(const [el,mw,mh] of [[board,w.clientWidth*.60,w.clientHeight*.72],[module,Math.min(w.clientWidth*.24,400),w.clientHeight*.56]]){const img=el.querySelector('.component-image');if(!img.naturalWidth)return false;const rotated=el===board&&boardDef.rotation===90;const s=Math.min(mw/(rotated?img.naturalHeight:img.naturalWidth),mh/(rotated?img.naturalWidth:img.naturalHeight));el.style.width=img.naturalWidth*s+'px';el.style.height=img.naturalHeight*s+'px';}return true;}
function getPinExitSide(pin){const x=+pin.dataset.pinX,y=+pin.dataset.pinY;if(x>=.72)return"right";if(x<=.28)return"left";if(y<=.28)return"top";return"bottom";}
function sameSidePins(pin){return [...pin.parentElement.querySelectorAll('.pin')].filter(p=>getPinExitSide(p)===getPinExitSide(pin)).sort((a,b)=>{const s=getPinExitSide(pin);return(s==='left'||s==='right')?(+a.dataset.pinY-+b.dataset.pinY):(+a.dataset.pinX-+b.dataset.pinX)});}
function getModuleExitPoint(pin,start){const side=getPinExitSide(pin),s=circuitScale(),extra={GND:0,VCC:28,IN:56,OUT:56}[pin.dataset.pin]||0,d=((layout&&plannedConnections.find(c=>c.from===pin.dataset.pin)?.route?.exitDistance)??(PIN_EXIT_BASE+extra))*s;const p={x:start.x,y:start.y};if(side==='right')p.x+=d;else if(side==='left')p.x-=d;else if(side==='top')p.y-=d;else p.y+=d;return{side,point:p};}
function getBoardRouteSide(pin,top,bottom){const e=getPinPosition(pin);return Math.abs(e.y-top)<Math.abs(bottom-e.y)?'top':'bottom';}
function laneMaps(top,bottom){const topW=[],botW=[];wires.forEach(w=>(getBoardRouteSide(getWireEnds(w).boardPin,top,bottom)==='top'?topW:botW).push(w));topW.sort((a,b)=>getPinPosition(getWireEnds(a).boardPin).x-getPinPosition(getWireEnds(b).boardPin).x);botW.sort((a,b)=>getPinPosition(getWireEnds(a).modulePin).y-getPinPosition(getWireEnds(b).modulePin).y);const tm=new Map(),bm=new Map();topW.forEach((w,i)=>tm.set(w,Math.max(SAFE_MARGIN,top-BOARD_LANE_MARGIN-(topW.length-1-i)*LANE_SPACING)));botW.forEach((w,i)=>bm.set(w,Math.min(workspace().clientHeight-SAFE_MARGIN,bottom+BOARD_LANE_MARGIN+i*LANE_SPACING)));return[tm,bm];}
function buildWirePoints(w,left,top,bottom,tm,bm){const e=getWireEnds(w),start=getPinPosition(e.modulePin),end=getPinPosition(e.boardPin),me=getModuleExitPoint(e.modulePin,start),side=me.side,bs=getBoardRouteSide(e.boardPin,top,bottom);const s=circuitScale();if(layout&&w.route?.via){
 const anchors={start,end,exit:me.point},area=workspace();
 return[start,...w.route.via.map(point=>Object.fromEntries(['x','y'].map(axis=>[axis,typeof point[axis]==='number'?point[axis]*(axis==='x'?area.clientWidth:area.clientHeight):anchors[point[axis]][axis]]))),end];
}
// Opt-in orthogonal search. Explicit via routes and the legacy router above/below stay unchanged.
if(w.route?.auto){
 const area=workspace(),gap=12*s,margin=SAFE_MARGIN*s;
 const boxes=[getModuleContainer(),getBoardContainer()].map(el=>{const p=componentPosition(el),inset=(el===getModuleContainer()?moduleDef:boardDef).labelInsets||{};return{left:p.x+(inset.left||0)*el.offsetWidth-gap,right:p.x+el.offsetWidth-(inset.right||0)*el.offsetWidth+gap,top:p.y+(inset.top||0)*el.offsetHeight-gap,bottom:p.y+el.offsetHeight-(inset.bottom||0)*el.offsetHeight+gap};});
 const exit=(p,side,box)=>({x:side==='right'?Math.max(p.x+gap,box.right):side==='left'?Math.min(p.x-gap,box.left):p.x,y:side==='top'?Math.min(p.y-gap,box.top):side==='bottom'?Math.max(p.y+gap,box.bottom):p.y});
 const first=exit(start,side,boxes[0]),last=exit(end,getPinExitSide(e.boardPin),boxes[1]);
 // Earlier wires supply clearance lanes; their exact geometry is never changed.
 const occupied=wires.slice(0,wires.indexOf(w)).flatMap(other=>wireSegments(buildWirePoints(other,left,top,bottom,tm,bm)));
 const xs=[first.x,last.x,margin,area.clientWidth-margin,...boxes.flatMap(b=>[b.left,b.right]),...occupied.flatMap(edge=>[edge.a.x-gap,edge.a.x+gap,edge.b.x-gap,edge.b.x+gap])].filter(x=>x>=margin&&x<=area.clientWidth-margin);
 const ys=[first.y,last.y,margin,area.clientHeight-margin,...boxes.flatMap(b=>[b.top,b.bottom]),...occupied.flatMap(edge=>[edge.a.y-gap,edge.a.y+gap,edge.b.y-gap,edge.b.y+gap])].filter(y=>y>=margin&&y<=area.clientHeight-margin);
 const coordinates=[...new Set(xs)].sort((a,b)=>a-b).flatMap(x=>[...new Set(ys)].sort((a,b)=>a-b).map(y=>({x,y}))).filter(p=>!boxes.some(b=>p.x>b.left+.01&&p.x<b.right-.01&&p.y>b.top+.01&&p.y<b.bottom-.01));
 const source=coordinates.findIndex(p=>p.x===first.x&&p.y===first.y),target=coordinates.findIndex(p=>p.x===last.x&&p.y===last.y);
 if(source>=0&&target>=0){
  const edges=coordinates.map(()=>[]),axis=side==='left'||side==='right'?0:1,endAxis=['left','right'].includes(getPinExitSide(e.boardPin))?0:1;
  const clear=(a,b)=>!boxes.some(r=>a.y===b.y?a.y>r.top+.01&&a.y<r.bottom-.01&&Math.max(a.x,b.x)>r.left+.01&&Math.min(a.x,b.x)<r.right-.01:a.x>r.left+.01&&a.x<r.right-.01&&Math.max(a.y,b.y)>r.top+.01&&Math.min(a.y,b.y)<r.bottom-.01);
  const collisions=(a,b)=>occupied.reduce((n,edge)=>{const h=a.y===b.y,eh=edge.a.y===edge.b.y;if(h===eh){const axis=h?'x':'y',fixed=h?'y':'x';return n+(Math.abs(a[fixed]-edge.a[fixed])<.5&&Math.min(Math.max(a[axis],b[axis]),Math.max(edge.a[axis],edge.b[axis]))-Math.max(Math.min(a[axis],b[axis]),Math.min(edge.a[axis],edge.b[axis]))>.5?1:0);}const horizontal=h?{a,b}:edge,vertical=h?edge:{a,b};return n+(vertical.a.x>=Math.min(horizontal.a.x,horizontal.b.x)&&vertical.a.x<=Math.max(horizontal.a.x,horizontal.b.x)&&horizontal.a.y>=Math.min(vertical.a.y,vertical.b.y)&&horizontal.a.y<=Math.max(vertical.a.y,vertical.b.y)?1:0);},0);
  for(let i=0;i<coordinates.length;i++)for(const direction of [0,1]){
   const a=coordinates[i],candidates=coordinates.map((b,j)=>({b,j})).filter(({b,j})=>j!==i&&(direction===0?a.y===b.y:a.x===b.x));
   for(const sign of [-1,1]){const next=candidates.filter(({b})=>(direction===0?b.x-a.x:b.y-a.y)*sign>0).sort((u,v)=>Math.abs(direction===0?u.b.x-a.x:u.b.y-a.y)-Math.abs(direction===0?v.b.x-a.x:v.b.y-a.y))[0];if(next&&clear(a,next.b))edges[i].push({node:next.j,axis:direction,length:Math.abs(a.x-next.b.x)+Math.abs(a.y-next.b.y),collisions:collisions(a,next.b)});}
  }
  // Lexicographic cost: crossings/overlaps, bends, then total length.
  const better=(a,b)=>!b||a.some((v,i)=>v<b[i]&&a.slice(0,i).every((v,j)=>v===b[j]));
  const costs=new Map(),previous=new Map(),pending=new Set(),initial=source*2+axis;costs.set(initial,[0,0,0]);pending.add(initial);
  while(pending.size){
   let state;for(const item of pending)if(state===undefined||better(costs.get(item),costs.get(state)))state=item;pending.delete(state);
   const node=Math.floor(state/2),direction=state%2;
   for(const edge of edges[node]){const next=edge.node*2+edge.axis,current=costs.get(state),cost=[current[0]+edge.collisions,current[1]+(direction!==edge.axis?1:0),current[2]+edge.length];if(better(cost,costs.get(next))){costs.set(next,cost);previous.set(next,state);pending.add(next);}}
  }
  let finish;for(const direction of [0,1]){const state=target*2+direction,cost=costs.get(state);if(cost){const total=[cost[0],cost[1]+(direction!==endAxis?1:0),cost[2]];if(!finish||better(total,finish.cost))finish={state,cost:total};}}
  if(finish){const points=[];let state=finish.state;while(state!==undefined){points.unshift(coordinates[Math.floor(state/2)]);state=previous.get(state);}const compact=[];for(const point of [start,...points,end]){if(compact.at(-1)?.x===point.x&&compact.at(-1)?.y===point.y)continue;while(compact.length>1&&((compact.at(-2).x===compact.at(-1).x&&compact.at(-1).x===point.x)||(compact.at(-2).y===compact.at(-1).y&&compact.at(-1).y===point.y)))compact.pop();compact.push(point);}return compact;}
 }
}
if(boardDef.facing==='left'){const x=start.x+(end.x-start.x)*({OUT:.35,VCC:.6,GND:.8}[e.modulePin.dataset.pin]||.5);return[start,{x,y:start.y},{x,y:end.y},end];}let lane=bs==='top'?(tm.get(w)??top-BOARD_LANE_MARGIN*s):(bm.get(w)??bottom+BOARD_LANE_MARGIN*s);if(side==='right'||side==='left'){const ex={x:clamp(me.point.x,SAFE_MARGIN,workspace().clientWidth-SAFE_MARGIN),y:clamp(me.point.y,SAFE_MARGIN,workspace().clientHeight-SAFE_MARGIN)};return[start,{x:ex.x,y:start.y},{x:ex.x,y:lane},{x:end.x,y:lane},end];}if(side==='bottom'&&bs==='bottom'){lane=Math.min(workspace().clientHeight-SAFE_MARGIN,Math.max(lane,start.y+PIN_EXIT_BASE,bottom+12));return[start,{x:start.x,y:lane},{x:end.x,y:lane},end];}let x=clamp(left-BOARD_LANE_MARGIN,SAFE_MARGIN,workspace().clientWidth-SAFE_MARGIN);return[start,{x:start.x,y:me.point.y},{x,y:me.point.y},{x,y:lane},{x:end.x,y:lane},end];}
const path=pts=>pts.map((p,i)=>(i?'L ':'M ')+p.x+' '+p.y).join(' ');
function wireSegments(points){let offset=0;return points.slice(1).map((b,i)=>{const a=points[i],length=Math.abs(b.x-a.x)+Math.abs(b.y-a.y),segment={a,b,length,offset};offset+=length;return segment}).filter(s=>s.length>0);}
function intersects(a,b,pad=0){return a.left<b.right+pad&&a.right>b.left-pad&&a.top<b.bottom+pad&&a.bottom>b.top-pad;}
function labelPos(w,pts){
 if(layout){
  const edges=wireSegments(pts),total=edges.reduce((n,s)=>n+s.length,0),at=total*clamp(w.label?.position??.5,0,1),edge=edges.find(s=>s.offset+s.length>=at)||edges.at(-1),t=(at-edge.offset)/edge.length;
  return{x:edge.a.x+(edge.b.x-edge.a.x)*t+(w.label?.offsetX||0),y:edge.a.y+(edge.b.y-edge.a.y)*t+(w.label?.offsetY||0)};
 }
const name=getWireEnds(w).modulePin.dataset.pin,s=circuitScale();return{x:pts[0].x+(config.labelDistance??110)*s,y:pts[0].y+(config.labelOffsets?.[name]??({IN:-28,OUT:-28,VCC:8,GND:32}[name]||0))*s};}
// Collision-aware labels are opt-in. Existing lessons retain labelPos/clamping.
function placeLabels(entries){
 const area=workspace(),margin=layout.labelMargin??2;
 const boxes=[getBoardContainer(),getModuleContainer()].map(el=>{const p=componentPosition(el);const inset=(el===getBoardContainer()?boardDef:moduleDef).labelInsets||{};return{left:p.x+(inset.left||0)*el.offsetWidth,right:p.x+el.offsetWidth-(inset.right||0)*el.offsetWidth,top:p.y+(inset.top||0)*el.offsetHeight,bottom:p.y+el.offsetHeight-(inset.bottom||0)*el.offsetHeight}});
 const segments=entries.flatMap(e=>e.segments),wirePad=Math.max(...entries.map(e=>parseFloat(getComputedStyle(e.path).strokeWidth)||4))/2+2;
 const gap=Math.max(layout.labelGap??6,wirePad+1);
 const options=entries.map(entry=>{
  const onWire=(entry.wire.label?.placement||layout.labelPlacement)==='on-wire',anchor=labelPos(entry.wire,entry.points),width=entry.label.offsetWidth,height=entry.label.offsetHeight,candidates=[];
  const obstacles=onWire?entries.filter(other=>other!==entry).flatMap(other=>other.segments):segments;
  for(const segment of entry.segments){
   const horizontal=segment.a.y===segment.b.y;
   if(onWire&&(!horizontal||segment.length<width+gap*2))continue;
   if(segment.length<(horizontal?width:height)/2)continue;
   const axis=horizontal?'x':'y',inset=onWire?width/2+gap:12,lo=Math.min(segment.a[axis],segment.b[axis])+inset,hi=Math.max(segment.a[axis],segment.b[axis])-inset;
   const baseX=horizontal?anchor.x:segment.a.x+width/2+gap;
   const baseY=horizontal?segment.a.y:clamp(anchor.y-(entry.wire.label?.offsetY||0),lo,hi);
   const xs=[baseX,horizontal?(lo+hi)/2:segment.a.x-width/2-gap,...Array.from({length:10},(_,i)=>[baseX+(i+1)*24,baseX-(i+1)*24]).flat()];
   const positions=entry.wire.route?.auto&&!horizontal?[baseY,(lo+hi)/2,lo+(hi-lo)/4,hi-(hi-lo)/4]:[baseY];
   for(const vertical of positions)for(const value of xs)for(let rise=0;rise<=(onWire?0:6);rise++){
    const x=horizontal?clamp(value,lo,hi):value,y=onWire?segment.a.y:vertical-height/2-gap+(entry.wire.label?.offsetY||0)-rise*8;
    const box={left:x-width/2,right:x+width/2,top:y-height/2,bottom:y+height/2};
    if(box.left<margin||box.right>area.clientWidth-margin||box.top<margin||box.bottom>area.clientHeight-margin)continue;
    if((!onWire&&box.bottom>vertical-gap)||boxes.some(b=>intersects(box,b,4)))continue;
    if(obstacles.some(s=>intersects(box,{left:Math.min(s.a.x,s.b.x),right:Math.max(s.a.x,s.b.x),top:Math.min(s.a.y,s.b.y),bottom:Math.max(s.a.y,s.b.y)},wirePad)))continue;
    if(candidates.some(c=>c.x===x&&c.y===y))continue;
    candidates.push({x,y,box,cost:Math.abs(x-anchor.x)+Math.abs(y-anchor.y)*.6});
   }
  }
  return candidates.sort((a,b)=>a.cost-b.cost).slice(0,40);
 });
 const placed=[];let visits=0;
 function choose(index){
  if(index===entries.length)return true;
  if(++visits>10000)return false;
  for(const candidate of options[index]){
   if(placed.some(p=>intersects(candidate.box,p.box,gap)))continue;
   placed.push(candidate);if(choose(index+1))return true;placed.pop();
  }
  return false;
 }
 const valid=choose(0);
 entries.forEach((entry,index)=>{const pos=valid?placed[index]:(options[index][0]||labelPos(entry.wire,entry.points));entry.label.style.left=pos.x+'px';entry.label.style.top=pos.y+'px';});
 return valid;
}
function drawWires(){
 const w=workspace(),svg=document.getElementById('wireLayer'),ll=document.getElementById('wireLabelLayer');
 if(!wires.length){svg.innerHTML='';ll.innerHTML='';if(layout){svg.dataset.wireOverlaps='0';svg.dataset.wireCrossings='0';svg.dataset.labelsValid='true';}return;}
 const oldPaths=[...svg.querySelectorAll('.wire')],oldLabels=[...ll.querySelectorAll('.wire-label')];
 const board=getBoardContainer(),{x:left,y:top}=componentPosition(board),bottom=top+board.offsetHeight,[tm,bm]=laneMaps(top,bottom),entries=[];
 svg.setAttribute('viewBox',`0 0 ${w.clientWidth} ${w.clientHeight}`);
 wires.forEach((wire,wi)=>{
  const pts=buildWirePoints(wire,left,top,bottom,tm,bm);let p=oldPaths[wi];
  if(!p){p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('class','wire wire-instant');svg.appendChild(p);}
  p.setAttribute('d',path(pts));p.setAttribute('stroke',wire.color);let l=oldLabels[wi];
  if(!l){l=document.createElement('div');l.className='wire-label wire-label-instant';ll.appendChild(l);}
  const e=getWireEnds(wire);const boardFirst=layout?.labelDirection==='auto'&&componentPosition(getModuleContainer()).x+getModuleContainer().offsetWidth/2>componentPosition(board).x+board.offsetWidth/2;l.textContent=boardFirst?getDisplayPinName(e.boardPin.dataset.pin)+' ← '+getDisplayPinName(e.modulePin.dataset.pin):getDisplayPinName(e.modulePin.dataset.pin)+' → '+getDisplayPinName(e.boardPin.dataset.pin);l.style.backgroundColor=wire.color;l.style.color='#fff';
  if(layout)entries.push({wire,points:pts,segments:wireSegments(pts),label:l,path:p});
  else{const pos=labelPos(wire,pts),pad=12*circuitScale();l.style.left=clamp(pos.x,l.offsetWidth/2+pad,w.clientWidth-l.offsetWidth/2-pad)+'px';l.style.top=clamp(pos.y,l.offsetHeight/2+pad,w.clientHeight-l.offsetHeight/2-pad)+'px';}
 });
 oldPaths.slice(wires.length).forEach(x=>x.remove());oldLabels.slice(wires.length).forEach(x=>x.remove());
 if(layout){
  let overlaps=0,crossings=0;
  entries.forEach((entry,i)=>entries.slice(i+1).forEach(other=>entry.segments.forEach(a=>other.segments.forEach(b=>{
   const ah=a.a.y===a.b.y,bh=b.a.y===b.b.y;
   if(ah===bh){const axis=ah?'x':'y',fixed=ah?'y':'x';if(Math.abs(a.a[fixed]-b.a[fixed])<.5&&Math.min(Math.max(a.a[axis],a.b[axis]),Math.max(b.a[axis],b.b[axis]))-Math.max(Math.min(a.a[axis],a.b[axis]),Math.min(b.a[axis],b.b[axis]))>.5)overlaps++;}
   else{const h=ah?a:b,v=ah?b:a;if(v.a.x>Math.min(h.a.x,h.b.x)&&v.a.x<Math.max(h.a.x,h.b.x)&&h.a.y>Math.min(v.a.y,v.b.y)&&h.a.y<Math.max(v.a.y,v.b.y))crossings++;}
  }))));
  svg.dataset.wireOverlaps=String(overlaps);svg.dataset.wireCrossings=String(crossings);svg.dataset.labelsValid=String(placeLabels(entries));
 }
}
function showConnectionsToStep(step){
 const next=clamp(step,0,plannedConnections.length);
 wires=[];
 for(let i=0;i<next;i++){
   const c=plannedConnections[i],a=findPin('module',c.from),b=findPin('board',c.to);
   if(a&&b)wires.push({pinA:a,pinB:b,color:c.color||getWireColor(a,b,i),...(layout?{route:c.route,label:c.label}:{})});
 }
 currentConnectionStep=next;
 drawWires();
}
function refresh(){if(resizeComponents()){drawPins(getModuleContainer().querySelector('.pin-layer'),moduleDef,'module');drawPins(getBoardContainer().querySelector('.pin-layer'),boardDef,'board');const w=workspace();if(w){w.style.setProperty('--circuit-scale',circuitScale());}showConnectionsToStep(currentConnectionStep);}}
function init(){drawPins(getModuleContainer().querySelector('.pin-layer'),moduleDef,'module');drawPins(getBoardContainer().querySelector('.pin-layer'),boardDef,'board');const imgs=[...document.querySelectorAll('#workspace .component-image')];imgs.forEach(img=>{if(!img.complete||!img.naturalWidth)img.addEventListener('load',refresh,{once:true});});refresh();if(layout)new ResizeObserver(refresh).observe(workspace());window.addEventListener('resize',refresh);document.addEventListener('fullscreenchange',()=>requestAnimationFrame(()=>requestAnimationFrame(refresh)));}
window.lessonCircuit={refresh,next(){showConnectionsToStep(currentConnectionStep+1)},prev(){showConnectionsToStep(currentConnectionStep-1)},setStep(n){showConnectionsToStep(n)},getStep(){return currentConnectionStep}};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
