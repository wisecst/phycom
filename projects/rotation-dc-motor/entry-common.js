/* Present the existing fan lesson state with the shared Entry renderer. */
(()=>{'use strict';
const E=window.EntryEngine,ids=new WeakMap();let serial=0,pending=0;
const id=n=>{if(!ids.has(n))ids.set(n,'fan-block-'+(++serial));return ids.get(n)};
const text=n=>n.textContent.replace(/▼/g,'').trim();
function parts(host){const out=[];for(const n of host.childNodes){if(n.nodeType===3){if(n.textContent.trim())out.push({text:n.textContent.trim()});continue}
 if(n.nodeType!==1||n.matches('button,.select-arrow,.play-dot'))continue;
 if(n.matches('[data-entry-slot]'))out.push({slot:{id:id(n),value:{kind:n.dataset.entrySlot,value:text(n)}}});
 else if(n.matches('.field'))out.push({slot:{id:id(n),value:{kind:'dropdown',value:text(n)}}});
 else if(n.matches('.number-field'))out.push({slot:{id:id(n),value:{kind:'number',value:text(n)}}});
 else if(n.matches('.entry-block,.project-map,.project-variable,.project-product'))out.push({slot:{id:id(n)+'-slot',value:{kind:'block',block:reporter(n)}}});
 else out.push(...parts(n));
}return out}
function reporter(n){return{id:id(n),type:'reporter',category:n.matches('.project-variable')?'data':n.matches('.project-product')?'calculation':'hardware',parts:parts(n)}}
const runs=new Map();
function block(n){const run=n.querySelector(':scope>button');if(run)runs.set(run.id,run);
 const b={id:id(n),type:n.matches('.start-block')?'event':n.matches('.repeat-block')?'c':'command',category:n.matches('.start-block')?'start':n.matches('.repeat-block')?'flow':n.matches('.data-block')?'data':n.matches('.looks-block')?'looks':'hardware',parts:parts(n)};
 if(run)b.run=run.id;
 if(b.type==='c'){const body=n.nextElementSibling;b.branches=[body?.matches('.repeat-body')?sequence(body):[]]}
 return b;
}
function sequence(host){return [...host.children].filter(n=>n.matches('.entry-block.entry-show')).map(block)}
window.fanSetupCode=()=>{const copy=document.querySelector('#studyCode').cloneNode(true);copy.querySelectorAll('[data-entry-step]').forEach(n=>n.classList.add('entry-show'));copy.querySelectorAll('button').forEach(n=>n.remove());copy.querySelector('#studySaySlot').replaceChildren(document.querySelector('#studySensor').cloneNode(true));const main=sequence(copy),motor=sequence(copy.querySelector('#studyMotorCode')),a1=sequence(copy.querySelector('#studyA1Set'));return [{id:'setup-fan-main',blocks:[...main,...a1]},{id:'setup-fan-motor',blocks:motor}]};
function current(host){const key=host.closest('.slide').dataset.entryCurrent,n=key?document.querySelector('[data-palette-key="'+key+'"]'):null;return n&&host.contains(n)?id(n):null}
function make(source,cls){const host=document.createElement('div');host.className=cls;source.after(host);source.classList.add('fan-entry-source');const renderer=new E.Renderer(host,key=>{const b=runs.get(key);if(b&&!b.disabled)b.click()});return{source,host,renderer}}
const study=make(document.querySelector('#studyCode'),'fan-common-code'),task=make(document.querySelector('#projectCode'),'fan-common-code');
const guide=['guideVariable','guideInputHint','guideOutputHint'].map(key=>make(document.getElementById(key),'fan-common-guide'));
const studySlide=study.source.closest('.slide'),taskSlide=task.source.closest('.slide');
const tabs=[{view:study,slide:studySlide,tabs:new E.Tabs(studySlide.querySelector('.entry-tabs'),'../../assets/')},{view:task,slide:taskSlide,tabs:new E.Tabs(taskSlide.querySelector('.entry-tabs'),'../../assets/')}];
function buttons(view){for(const [key,n]of runs){const button=view.host.querySelector('[data-run="'+key+'"]');if(!button)continue;button.disabled=n.disabled;button.textContent=n.textContent;button.classList.toggle('running',n.classList.contains('running'));button.setAttribute('aria-label',n.getAttribute('aria-label')||'실행')}}
/* A restored dropdown must not retain a previously nested reporter's label. */
function restoreDropdowns(renderer,scripts){E.walk(scripts,n=>{const row=renderer.blocks.get(n.id)?.children[1];n.parts.forEach((part,i)=>{if(part.slot?.value.kind!=='dropdown')return;const slot=row?.querySelector(':scope>[data-part="'+i+'"]');if(slot?.classList.contains('ec-filled'))slot.replaceChildren()})})}
// Outline the rendered rows without wrapping or moving the connected blocks.
const sourceLayer=document.createElement('div');sourceLayer.className='fan-source-layer';sourceLayer.hidden=true;
const sourceGroups=[
 {keys:['.repeat-block','.repeat-body>.data-block','.repeat-body>.looks-block'],page:'49'},
 {keys:['.repeat-body>.hardware-block'],page:'81'}
].map(group=>{const box=document.createElement('div'),label=document.createElement('span');box.className='fan-source-box';box.dataset.sourcePage=group.page;box.setAttribute('aria-label','교과서 p.'+group.page+' 코드');label.className='fan-source-label';label.textContent='교과서 p.'+group.page;box.append(label);sourceLayer.append(box);return {...group,box}});
taskSlide.querySelector('.entry-stage').append(sourceLayer);
function sourceEmphasis(){
 const source49Ready=!document.querySelector('#taskShapeSum').hidden;
 const source81Ready=source49Ready&&document.querySelector('#taskMultiplier').textContent.trim()==='30';
 taskSlide.classList.toggle('fan-source-stage',source49Ready);sourceLayer.hidden=!source49Ready;taskSlide.classList.toggle('fan-source-page81',source81Ready);if(sourceLayer.hidden)return;
 const stage=sourceLayer.parentElement,origin=stage.getBoundingClientRect(),scale=origin.width/stage.offsetWidth,measures=[];
 for(const group of sourceGroups){if(group.page==='81'&&!source81Ready)continue;const rows=group.keys.map(key=>task.renderer.blocks.get(id(task.source.querySelector(key)))?.children[1]).filter(Boolean);if(rows.length!==group.keys.length)continue;
 const rects=rows.map(row=>row.getBoundingClientRect()),left=(Math.min(...rects.map(r=>r.left))-origin.left)/scale,top=(Math.min(...rects.map(r=>r.top))-origin.top)/scale,right=(Math.max(...rects.map(r=>r.right))-origin.left)/scale,end=(Math.max(...rects.map(r=>r.bottom))-origin.top)/scale;
 measures.push({group,left,top,right,end});
 }
 if(!measures.length)return;
 const commonLeft=Math.min(...measures.map(m=>m.left))-6,commonRight=Math.max(...measures.map(m=>m.right))+6;
 for(const m of measures)Object.assign(m.group.box.style,{left:commonLeft+'px',top:(m.top-5)+'px',width:(commonRight-commonLeft)+'px',height:(m.end-m.top+10)+'px'});
}
function sync(){
 pending=0;
 const a1=document.querySelector('#studyA1Set'),motor=document.querySelector('#studyMotorCode');
 const left=[...sequence(study.source),...sequence(a1)];
 const scripts=[{id:'fan-study-main',blocks:left}];if(!motor.hidden)scripts.push({id:'fan-study-motor',blocks:sequence(motor)});
 restoreDropdowns(study.renderer,scripts);study.renderer.render(scripts,current(study.source));
 const taskScripts=[{id:'fan-task-main',blocks:sequence(task.source)}];restoreDropdowns(task.renderer,taskScripts);task.renderer.render(taskScripts,current(task.source));
 for(const view of [study,task])buttons(view);
 for(const g of guide){g.host.hidden=g.source.hidden;if(g.host.hidden)continue;const nodes=[...g.source.children].map(n=>n.matches('.entry-block')?block(n):reporter(n));g.renderer.render([{id:id(g.source)+'-guide',blocks:nodes}])}
 for(const item of tabs){const cats=[];E.walk(item.view.renderer.scripts,n=>cats.push(n.category));const legacy=item.view.source.querySelector('.entry-block.entry-current'),active=legacy?.dataset.tab==='math'?'calculation':legacy?.dataset.tab;
 const selected=item.slide.dataset.entryCategory;
 if(selected)cats.push(selected==='math'?'calculation':selected);
 item.tabs.render(cats,(selected==='math'?'calculation':selected)||active||null);const math=item.tabs.nodes.get('calculation');if(math)math.dataset.tab='math';
 }
 study.renderer.reflow();task.renderer.reflow();study.renderer.fitWorkspace();task.renderer.fitWorkspace();sourceEmphasis();
}
function schedule(){if(!pending)pending=requestAnimationFrame(sync)}
document.addEventListener('fan-entry-state',()=>{if(pending)cancelAnimationFrame(pending);sync()});
const observer=new MutationObserver(schedule);
for(const n of [study.source,task.source,...guide.map(g=>g.source)])observer.observe(n,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','hidden','disabled']});
for(const slide of [studySlide,taskSlide])observer.observe(slide,{attributes:true,attributeFilter:['class']});
window.addEventListener('resize',schedule);window.addEventListener('load',schedule,{once:true});
sync();
})();
