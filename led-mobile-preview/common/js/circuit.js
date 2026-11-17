(()=>{
const POWER_COLOR="#e53935",GROUND_COLOR="#222222",SIGNAL_COLORS=["#1976d2","#43a047","#8e24aa","#ef6c00","#f2c200","#00897b","#6d4c41","#3949ab"];
const SAFE_MARGIN=18,LANE_SPACING=24,BOARD_LANE_MARGIN=28,PIN_EXIT_BASE=60,PIN_EXIT_SPACING=0;
const boardDef={pins:[{name:"D3",x:.79468,y:.06550},{name:"5V",x:.55263,y:.91500},{name:"GND2",x:.62169,y:.91500}]};
const moduleDef={pins:[{name:"IN",x:.77279,y:.39963},{name:"VCC",x:.77538,y:.51097},{name:"GND",x:.77675,y:.62098}]};
const plannedConnections=[{from:"VCC",to:"5V"},{from:"GND",to:"GND2"},{from:"IN",to:"D3"}];
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
function getWireColor(a,b){const names=[a.dataset.pin,b.dataset.pin];if(names.some(isGroundPin))return GROUND_COLOR;if(names.some(isPowerPin))return POWER_COLOR;return SIGNAL_COLORS[0];}
function resizeComponents(){const w=workspace(),board=getBoardContainer(),module=getModuleContainer();if(!w||!w.clientWidth)return false;for(const [el,mw,mh] of [[board,w.clientWidth*.60,w.clientHeight*.72],[module,Math.min(w.clientWidth*.24,400),w.clientHeight*.56]]){const img=el.querySelector('.component-image');if(!img.naturalWidth)return false;const s=Math.min(mw/img.naturalWidth,mh/img.naturalHeight);el.style.width=img.naturalWidth*s+'px';el.style.height=img.naturalHeight*s+'px';}return true;}
function getPinExitSide(pin){const x=+pin.dataset.pinX,y=+pin.dataset.pinY;if(x>=.72)return"right";if(x<=.28)return"left";if(y<=.28)return"top";return"bottom";}
function sameSidePins(pin){return [...pin.parentElement.querySelectorAll('.pin')].filter(p=>getPinExitSide(p)===getPinExitSide(pin)).sort((a,b)=>{const s=getPinExitSide(pin);return(s==='left'||s==='right')?(+a.dataset.pinY-+b.dataset.pinY):(+a.dataset.pinX-+b.dataset.pinX)});}
function getModuleExitPoint(pin,start){const side=getPinExitSide(pin),s=circuitScale(),extra={GND:0,VCC:28,IN:56}[pin.dataset.pin]||0,d=(PIN_EXIT_BASE+extra)*s;const p={x:start.x,y:start.y};if(side==='right')p.x+=d;else if(side==='left')p.x-=d;else if(side==='top')p.y-=d;else p.y+=d;return{side,point:p};}
function getBoardRouteSide(pin,top,bottom){const e=getPinPosition(pin);return Math.abs(e.y-top)<Math.abs(bottom-e.y)?'top':'bottom';}
function laneMaps(top,bottom){const topW=[],botW=[];wires.forEach(w=>(getBoardRouteSide(getWireEnds(w).boardPin,top,bottom)==='top'?topW:botW).push(w));topW.sort((a,b)=>getPinPosition(getWireEnds(a).boardPin).x-getPinPosition(getWireEnds(b).boardPin).x);botW.sort((a,b)=>getPinPosition(getWireEnds(a).modulePin).y-getPinPosition(getWireEnds(b).modulePin).y);const tm=new Map(),bm=new Map();topW.forEach((w,i)=>tm.set(w,Math.max(SAFE_MARGIN,top-BOARD_LANE_MARGIN-(topW.length-1-i)*LANE_SPACING)));botW.forEach((w,i)=>bm.set(w,Math.min(workspace().clientHeight-SAFE_MARGIN,bottom+BOARD_LANE_MARGIN+i*LANE_SPACING)));return[tm,bm];}
function buildWirePoints(w,left,top,bottom,tm,bm){const e=getWireEnds(w),start=getPinPosition(e.modulePin),end=getPinPosition(e.boardPin),me=getModuleExitPoint(e.modulePin,start),side=me.side,bs=getBoardRouteSide(e.boardPin,top,bottom);const s=circuitScale();let lane=bs==='top'?(tm.get(w)??top-BOARD_LANE_MARGIN*s):(bm.get(w)??bottom+BOARD_LANE_MARGIN*s);if(side==='right'||side==='left'){const ex={x:clamp(me.point.x,SAFE_MARGIN,workspace().clientWidth-SAFE_MARGIN),y:clamp(me.point.y,SAFE_MARGIN,workspace().clientHeight-SAFE_MARGIN)};return[start,{x:ex.x,y:start.y},{x:ex.x,y:lane},{x:end.x,y:lane},end];}if(side==='bottom'&&bs==='bottom'){lane=Math.min(workspace().clientHeight-SAFE_MARGIN,Math.max(lane,start.y+PIN_EXIT_BASE,bottom+12));return[start,{x:start.x,y:lane},{x:end.x,y:lane},end];}let x=clamp(left-BOARD_LANE_MARGIN,SAFE_MARGIN,workspace().clientWidth-SAFE_MARGIN);return[start,{x:start.x,y:me.point.y},{x,y:me.point.y},{x,y:lane},{x:end.x,y:lane},end];}
const path=pts=>pts.map((p,i)=>(i?'L ':'M ')+p.x+' '+p.y).join(' ');
function labelPos(w,pts){const name=getWireEnds(w).modulePin.dataset.pin,s=circuitScale();return{x:pts[0].x+110*s,y:pts[0].y+({IN:-28,VCC:8,GND:32}[name]||0)*s};}
function drawWires(){const w=workspace(),svg=document.getElementById('wireLayer'),ll=document.getElementById('wireLabelLayer');if(!wires.length){svg.innerHTML='';ll.innerHTML='';return;}const oldPaths=[...svg.querySelectorAll('.wire')],oldLabels=[...ll.querySelectorAll('.wire-label')];const board=getBoardContainer(),{x:left,y:top}=componentPosition(board),bottom=top+board.offsetHeight,[tm,bm]=laneMaps(top,bottom);svg.setAttribute('viewBox',`0 0 ${w.clientWidth} ${w.clientHeight}`);wires.forEach((wire,wi)=>{const pts=buildWirePoints(wire,left,top,bottom,tm,bm);let p=oldPaths[wi];if(!p){p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('class','wire wire-instant');svg.appendChild(p);}p.setAttribute('d',path(pts));p.setAttribute('stroke',wire.color);let l=oldLabels[wi];if(!l){l=document.createElement('div');l.className='wire-label wire-label-instant';ll.appendChild(l);}const e=getWireEnds(wire);l.textContent=getDisplayPinName(e.modulePin.dataset.pin)+' → '+getDisplayPinName(e.boardPin.dataset.pin);l.style.backgroundColor=wire.color;l.style.color='#fff';const pos=labelPos(wire,pts);const pad=12*circuitScale();l.style.left=clamp(pos.x,l.offsetWidth/2+pad,w.clientWidth-l.offsetWidth/2-pad)+'px';l.style.top=clamp(pos.y,l.offsetHeight/2+pad,w.clientHeight-l.offsetHeight/2-pad)+'px';});oldPaths.slice(wires.length).forEach(x=>x.remove());oldLabels.slice(wires.length).forEach(x=>x.remove());}
function showConnectionsToStep(step){
 const next=clamp(step,0,plannedConnections.length);
 wires=[];
 for(let i=0;i<next;i++){
   const c=plannedConnections[i],a=findPin('module',c.from),b=findPin('board',c.to);
   if(a&&b)wires.push({pinA:a,pinB:b,color:getWireColor(a,b)});
 }
 currentConnectionStep=next;
 drawWires();
}
function refresh(){if(resizeComponents()){drawPins(getModuleContainer().querySelector('.pin-layer'),moduleDef,'module');drawPins(getBoardContainer().querySelector('.pin-layer'),boardDef,'board');const w=workspace();if(w){w.style.setProperty('--circuit-scale',circuitScale());}showConnectionsToStep(currentConnectionStep);}}
function init(){drawPins(getModuleContainer().querySelector('.pin-layer'),moduleDef,'module');drawPins(getBoardContainer().querySelector('.pin-layer'),boardDef,'board');const imgs=[...document.querySelectorAll('#workspace .component-image')];imgs.forEach(img=>{if(!img.complete||!img.naturalWidth)img.addEventListener('load',refresh,{once:true});});refresh();window.addEventListener('resize',refresh);document.addEventListener('fullscreenchange',()=>requestAnimationFrame(()=>requestAnimationFrame(refresh)));}
window.lessonCircuit={refresh,next(){showConnectionsToStep(currentConnectionStep+1)},prev(){showConnectionsToStep(currentConnectionStep-1)},setStep(n){showConnectionsToStep(n)},getStep(){return currentConnectionStep}};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();