/* Existing servo progression/results feed the established shared Entry renderer. */
(()=>{'use strict';
const E=window.EntryEngine,q=s=>document.querySelector(s),ids=new WeakMap();let serial=0,pending=0;
const id=n=>{if(!ids.has(n))ids.set(n,'servo-block-'+(++serial));return ids.get(n)};
const label=n=>n.textContent.replace(/▼/g,'').trim();
E.categories.judge ||= {order:7,label:'판단',asset:'tab07_control',color:getComputedStyle(q('.tb-condition')).backgroundColor};
E.categories.motion ||= {order:3,label:'움직임',asset:'tab03_motion',color:getComputedStyle(q('.tb-motion')).backgroundColor};
function parts(host){const out=[];for(const n of host.childNodes){if(n.nodeType===3){if(n.textContent.trim())out.push({text:n.textContent.trim()});continue}
if(n.nodeType!==1||n.hidden||n.matches('button,.select-arrow,.play-dot'))continue;
let value;if(n.matches('.field'))value={kind:'dropdown',value:label(n)};
else if(n.matches('.number-field'))value={kind:'literal',value:label(n)};
else if(n.matches('.tb-true'))value={kind:'block',block:{id:id(n),type:'boolean',category:'judge',parts:[{text:label(n)}]}};
else if(n.matches('.tb-variable'))value={kind:'block',block:{id:id(n),type:'reporter',category:'data',parts:[{slot:{id:'name',value:{kind:'dropdown',value:label(n).replace(/\s*값$/,'')}}},{text:'값'}]}};
else if(n.matches('.tb-condition'))value={kind:'block',block:{id:id(n),type:'boolean',category:'judge',parts:parts(n)}};
if(value)out.push({slot:{id:id(n)+'-slot',value}});else out.push(...parts(n));}return out}
const runs=new Map();
function block(n){const button=n.querySelector('button');if(button)runs.set(button.id,button);
const category=n.dataset.tab||(n.matches('.start-block')?'start':n.matches('.wait-block')?'flow':'hardware');
return{id:id(n),type:category==='start'?'event':'command',category,parts:parts(n),...(button?{run:button.id}:{})}}
function sequence(source){const out=[];for(const n of source.children){if(n.hidden||n.classList.contains('tb-hidden')||(n.hasAttribute('data-entry-step')&&!n.classList.contains('entry-show')))continue;
if(n.matches('.entry-block'))out.push(block(n));else if(n.matches('.tb-if')){const header=n.querySelector(':scope>.entry-block');if(header.classList.contains('tb-hidden'))continue;const control=block(header);control.type='c';control.branches=[sequence(n.querySelector('.tb-body'))];out.push(control)}}return out}
window.servoSetupCode=()=>{const copy=basic.cloneNode(true);copy.querySelectorAll('[data-entry-step]').forEach(n=>n.classList.add('entry-show'));return [{id:'setup-servo',blocks:sequence(copy)}]};
const basic=q('.entry-page3-slide .motor-program'),task=q('.servo5-code');
function view(source,cls){const host=document.createElement('div');host.className=cls;source.after(host);source.classList.add('servo-entry-source');return{source,host,renderer:new E.Renderer(host,key=>{const button=runs.get(key);if(button&&!button.disabled)button.click()})}}
const b=view(basic,'servo-common-basic'),t=view(task,'servo-common-task');
window.servoConstruction=(page,n)=>{const source=(page===2?basic:task).querySelector('['+(page===2?'data-entry-step':'data-textbook-step')+'="'+n+'"]');return source?.matches('.entry-block')&&!source.parentElement.matches('.tb-if')?E.blockStages(block(source)):null;};
const tabs=[b,t].map(v=>new E.Tabs(v.source.closest('.slide').querySelector('.entry-tabs'),'../assets/'));
function sync(){pending=0;
for(const [index,v] of [b,t].entries()){v.host.hidden=v.source.hidden;
const sources=index===0?[v.source]:[...v.source.querySelectorAll(':scope>.tb-script')].filter(n=>!n.hidden);
const scripts=sources.map(n=>({id:id(n)+'-script',blocks:sequence(n)}));
const built=[...v.source.querySelectorAll(index===0?'[data-entry-step].entry-show':'[data-textbook-step]:not(.tb-hidden)')].at(-1),progress=built?window.servoConstruction(index===0?2:3,Number(index===0?built.dataset.entryStep:built.dataset.textbookStep)):null,phase=progress?.[Number(v.source.closest('.slide').dataset.entryDetail)||1];if(phase?.node)E.walk(scripts,n=>{if(n.id===phase.node.id)Object.assign(n,phase.node)});
const current=v.source.querySelector('.servo-running.entry-block')||v.source.querySelector('.entry-current:not(.tb-hidden)');
const cats=[];E.walk(scripts,n=>cats.push(n.category));const selected=v.source.closest('.slide').querySelector('.active-tab')?.dataset.tab;
const focus=current?.matches('.servo-running,.tb-condition,.tb-variable')?id(current):current?.matches('.number-field')?id(current.closest('.tb-condition')):phase?.current||(current?id(current):null);v.renderer.render(scripts,focus);
sources.forEach(n=>v.renderer.roots.get(id(n)+'-script')?.classList.toggle('servo-running',n.classList.contains('servo-running')));
for(const [key,source]of runs){const button=v.host.querySelector('[data-run="'+key+'"]');if(button){button.disabled=source.disabled;button.textContent=source.textContent;button.classList.toggle('running',source.classList.contains('running'))}}

const active=!scripts.some(s=>s.blocks.length)?null:phase?.tab||(current?.matches('.tb-variable')?'data':current?.closest('.tb-condition')?'judge':current?.dataset.tab||(current?.matches('.start-block')?'start':current?.matches('.wait-block')?'flow':null))||selected;
if(active)cats.push(active);
tabs[index].render(cats,active);
}

}
function schedule(){if(!pending)pending=requestAnimationFrame(sync)}
const observer=new MutationObserver(schedule);for(const n of [basic,task])observer.observe(n,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','hidden','disabled']});
for(const v of [b,t])observer.observe(v.source.closest('.slide').querySelector('.entry-tabs'),{subtree:true,attributes:true,attributeFilter:['class']});
window.servoFitCode=()=>{for(const v of [b,t])v.renderer.fitWorkspace();};
document.addEventListener('servo-entry-state',()=>{if(pending)cancelAnimationFrame(pending);sync();window.servoFitCode();});
window.addEventListener('load',schedule);sync();
})();
