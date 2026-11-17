(()=>{
const POWER_COLOR="#e53935",GROUND_COLOR="#222222",SIGNAL_COLORS=["#1976d2","#43a047","#8e24aa","#ef6c00","#f2c200","#00897b","#6d4c41","#3949ab"];

const boardDef={pins:[{name:"D3",x:.79468,y:.06550},{name:"5V",x:.55263,y:.91500},{name:"GND2",x:.62169,y:.91500}]};
// Connector socket centers measured from each uploaded image, independently of LED.
const servo=document.body.dataset.motor==='servo';
const moduleDef={pins:servo?[{name:"S",x:.902,y:.490},{name:"V",x:.902,y:.548},{name:"G",x:.902,y:.606}]:[{name:"S",x:.941,y:.475},{name:"V",x:.941,y:.544},{name:"G",x:.941,y:.614}]};
const plannedConnections=[{from:"V",to:"5V"},{from:"G",to:"GND2"},{from:"S",to:"D3"}];
let wires=[],currentConnectionStep=0;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const getDisplayPinName=n=>(/^GND\d*$/i.test(n)?"GND":n);
const isGroundPin=n=>/^GND\d*$/i.test(n),isPowerPin=n=>/^(VCC|5V|3\.3V)$/i.test(n);
const workspace=()=>document.getElementById("workspace"),getModuleContainer=()=>document.getElementById("module"),getBoardContainer=()=>document.getElementById("board");
const BASE_W=724,BASE_H=390;
function circuitScale(){const w=workspace();return w?Math.min(w.clientWidth/BASE_W,w.clientHeight/BASE_H):1;}
function drawPins(layer,component,role){layer.innerHTML="";component.pins.forEach((p,i)=>{const el=document.createElement("div");el.className="pin";el.style.left=p.x*100+"%";el.style.top=p.y*100+"%";Object.assign(el.dataset,{role,pin:p.name,pinIndex:i,pinX:p.x,pinY:p.y});layer.appendChild(el);});}
function findPin(role,name){return [...document.querySelectorAll('.pin[data-role="'+role+'"]')].find(p=>p.dataset.pin===name)||null;}
function componentPosition(el){const t=getComputedStyle(el).transform;const matrix=t==="none"?null:new DOMMatrixReadOnly(t);return{x:el.offsetLeft+(matrix?.m41||0),y:el.offsetTop+(matrix?.m42||0)};}
function getPinPosition(pin){const p=componentPosition(pin.closest(".circuit-component"));return{x:p.x+pin.offsetLeft+.5,y:p.y+pin.offsetTop+.5};}
function getWireEnds(w){return{modulePin:w.pinA.dataset.role==='module'?w.pinA:w.pinB,boardPin:w.pinA.dataset.role==='board'?w.pinA:w.pinB};}
function getWireColor(a,b){if(a.dataset.role==='module'&&a.dataset.pin==='G')return servo?"#795548":GROUND_COLOR; const names=[a.dataset.pin,b.dataset.pin];if(names.some(isGroundPin))return GROUND_COLOR;if(names.some(isPowerPin))return POWER_COLOR;return "#d4ae00";}
function resizeComponents(){const w=workspace(),board=getBoardContainer(),module=getModuleContainer();if(!w)return false;{const slide=w.parentElement,style=getComputedStyle(slide);const availableWidth=slide.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight),availableHeight=slide.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);const scale=Math.min(availableWidth/BASE_W,availableHeight/BASE_H);w.style.setProperty('width',BASE_W*scale+'px','important');w.style.setProperty('height',BASE_H*scale+'px','important');}if(!w.clientWidth)return false;for(const [el,mw,mh] of [[board,w.clientWidth*.52,w.clientHeight*.68],[module,w.clientWidth*(servo?.34:.44),w.clientHeight*.66]]){const img=el.querySelector('.component-image');if(!img.naturalWidth)return false;const s=Math.min(mw/img.naturalWidth,mh/img.naturalHeight);el.style.width=img.naturalWidth*s+'px';el.style.height=img.naturalHeight*s+'px';}return true;}
function buildWirePoints(w,left,top){
 const e=getWireEnds(w),start=getPinPosition(e.modulePin),end=getPinPosition(e.boardPin),s=circuitScale();
 const index={G:0,V:1,S:2}[e.modulePin.dataset.pin];
 const module=getModuleContainer(),mp=componentPosition(module);
 const lane=Math.max(mp.y+module.offsetHeight,top+getBoardContainer().offsetHeight)+(12+(1-index)*32)*s;
 {
  const channel=mp.x+module.offsetWidth+(12+index*10)*s;
  if(e.modulePin.dataset.pin==='S'){
   const upper=Math.max(10,top-24*s);
   return[start,{x:channel,y:start.y},{x:channel,y:upper},{x:end.x,y:upper},end];
  }
  return[start,{x:channel,y:start.y},{x:channel,y:lane},{x:end.x,y:lane},end];
 }

}
const path=pts=>pts.map((p,i)=>(i?'L ':'M ')+p.x+' '+p.y).join(' ');
function labelPos(w,pts){
 const i=2;
 return{x:(pts[i].x+pts[i+1].x)/2,y:pts[i].y};
}
function drawWires(){const w=workspace(),svg=document.getElementById('wireLayer'),ll=document.getElementById('wireLabelLayer');if(!wires.length){svg.innerHTML='';ll.innerHTML='';return;}const oldPaths=[...svg.querySelectorAll('.wire')],oldLabels=[...ll.querySelectorAll('.wire-label')];const board=getBoardContainer(),{x:left,y:top}=componentPosition(board);svg.setAttribute('viewBox',`0 0 ${w.clientWidth} ${w.clientHeight}`);wires.forEach((wire,wi)=>{const pts=buildWirePoints(wire,left,top);let p=oldPaths[wi];if(!p){p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('class','wire wire-instant');svg.appendChild(p);}p.setAttribute('d',path(pts));p.setAttribute('stroke',wire.color);let l=oldLabels[wi];if(!l){l=document.createElement('div');l.className='wire-label wire-label-instant';ll.appendChild(l);}const e=getWireEnds(wire);l.textContent=getDisplayPinName(e.modulePin.dataset.pin)+' → '+getDisplayPinName(e.boardPin.dataset.pin);l.style.backgroundColor=wire.color;l.style.color='#fff';const pos=labelPos(wire,pts);const pad=12*circuitScale();l.style.left=clamp(pos.x,l.offsetWidth/2+pad,w.clientWidth-l.offsetWidth/2-pad)+'px';l.style.top=clamp(pos.y,l.offsetHeight/2+pad,w.clientHeight-l.offsetHeight/2-pad)+'px';});oldPaths.slice(wires.length).forEach(x=>x.remove());oldLabels.slice(wires.length).forEach(x=>x.remove());}
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
