(()=>{'use strict';const E=window.EntryEngine;
function categories(scripts){const set=new Set();E.walk(scripts,n=>set.add(n.category));return [...set]}
E.Controller=class{
constructor({root,program,states,results,guide,count,assetBase,complete,layout,writing}){this.writing=writing;this.root=root;this.program=program;this.guide=guide;this.count=count;this.onComplete=complete;this.index=0;this.layout=layout;this.program.classList.toggle('ec-fit-program',!!layout?.fit);this.states=[];let last=[],seen=[];
for(const input of states){
const state=input.update?{...input,scripts:E.clone(last)}:input;
if(input.update){let matched=false;E.walk(state.scripts,block=>{if(block.id===input.update.id){Object.assign(block,E.clone(input.update));matched=true;}});if(!matched)throw Error('Missing state update block: '+input.update.id);delete state.update;}
E.validate(state.scripts);let tab=state.tab;E.walk(state.scripts,n=>{if(n.id===state.current||state.current?.startsWith(n.id+':'))tab=n.category});if(state.progression==='exact'){const visible=categories(state.scripts);this.states.push({...E.clone(state),visible,tab,phase:'build'});last=state.scripts;seen=visible;continue;}const known=new Set(),previous=new Map();E.walk(last,n=>{known.add(n.id);previous.set(n.id,n)});const added=[];E.walk(state.scripts,n=>{if(!known.has(n.id))added.push(n)});
const partial=allowed=>{function trim(n){if(!allowed.has(n.id))return null;const copy=E.clone(n);(copy.parts||[]).forEach((p,i)=>{if(p.slot?.value?.kind==='block'){const child=trim(p.slot.value.block);if(child)p.slot.value.block=child;else{const old=previous.get(n.id)?.parts[i]?.slot?.value;p.slot.value=old&&old.kind!=='block'?E.clone(old):{kind:'literal',value:0}}}});if(copy.branches)copy.branches=copy.branches.map(branch=>branch.map(trim).filter(Boolean));return copy;}return state.scripts.map(script=>({...script,blocks:script.blocks.map(trim).filter(Boolean)}));};
for(let i=0;i<added.length;i++){
 const candidate=added[i],tab=candidate.category,before=i===0?E.clone(last):partial(known);
 const visible=[...new Set([...seen,...categories(before),tab])];
 known.add(candidate.id);seen=visible;
 const final=i===added.length-1;
 this.states.push({...(final?E.clone(state):{guide:state.guide}),scripts:final?E.clone(state.scripts):partial(known),visible:[...new Set([...visible,...categories(final?state.scripts:partial(known))])],tab,current:final?(state.current||candidate.id):candidate.id,phase:'build'});
}
if(!added.length){const visible=[...new Set([...seen,...categories(state.scripts),...(tab?[tab]:[])])];this.states.push({...E.clone(state),visible,tab,phase:'build'});seen=visible;}
last=state.scripts;
}

this.tabs=new E.Tabs(root.querySelector('.entry-tabs'),assetBase);this.execution=new E.Execution(root,results);this.renderer=new E.Renderer(program,(key)=>this.execution.toggleResult(key));this.renderer.writingScale=1.15;this.execution.renderer=this.renderer;root.dataset.entryEngine='1';this.reuseCopies=new Map();if(this.states.some(state=>state.reuse)){this.codeMenu=new E.CodeMenu({root,actions:{duplicate:id=>this.duplicate(id)},can:(action,id)=>action==='duplicate'&&id===this.states[this.index].reuse?.source&&(!this.reuseCopies.has(this.index)||this.reuseCopies.get(this.index)?.phase==='menu')})}this.render();}
enablePalette(host){
 // The common writing flow creates each block directly in its code-tree position.
 // Retained as a compatibility method for modules that still call enablePalette().
 return null;
}
prepareNext(index=this.index+1){
 // No detached palette or transfer step: the next state renders the joined block.
 return false;
}
render(){this.demonstration?.close();this.demonstration=null;this.program.dispatchEvent(new CustomEvent('entry:before-state',{bubbles:true}));this.execution.close();const s=this.states[this.index],reused=this.reuseCopies.get(this.index),scripts=reused?.scripts||s.scripts,current=reused?.current||s.current,changed=this.renderer.current!==current;this.renderer.current=current;this.root.dataset.engineState=this.index;const previous=this.root.querySelector('[data-engine-previous]');if(previous)previous.disabled=this.index===0;const next=this.root.querySelector('[data-engine-next]');if(next)next.disabled=this.index===this.states.length-1;this.root.dataset.engineStates=this.states.length;this.root.dataset.enginePhase=s.phase;if(s.reuse?.demonstrate&&reused?.phase==='copy'){this.renderer.workspaceColumns ||= new Map();this.renderer.workspaceColumns.set(scripts.at(-1).id,0)}this.renderer.render(scripts,current);if(this.reuseHint)this.reuseHint.removeAttribute('title');this.reuseHint=s.reuse&&!reused?this.renderer.blocks.get(s.reuse.source):null;if(this.reuseHint)this.reuseHint.title=s.guide||'우클릭하여 복제하기를 선택하세요.';this.tabs.render(reused?[...new Set([...s.visible,...categories(scripts)])]:s.visible,this.renderer.blocks.get(current)?.dataset.category||s.tab);if(this.guide)this.guide.textContent=s.guide||'';if(!this.renderer.workspaceReadingScale)this.fit();if(changed&&!s.result)this.renderer.revealCurrent(current);if(this.count)this.count.textContent=(this.index+1)+' / '+this.states.length;this.root.querySelectorAll('.entry-block-count b').forEach(b=>{let n=0;E.walk(scripts,()=>n++);b.textContent=n});this.root.classList.toggle('page7-final-actions',!!s.complete);this.root.querySelector('.entry-code-toolbar')?.classList.toggle('page7-final-actions',!!s.complete);this.root.querySelectorAll('[data-completion-hint]').forEach(h=>h.hidden=!s.complete);if(s.result)this.execution.open(s.result);if(s.complete){window.lessonUI?.completeResult(this.root);this.onComplete?.(this.root)}this.program.dispatchEvent(new CustomEvent('entry:state',{bubbles:true,detail:{index:this.index,phase:s.phase}}));this.root.dataset.reusePhase=s.reuse?.demonstrate?(reused?.phase||'ready'):'';if(s.reuse?.demonstrate&&reused?.phase==='menu')this.codeMenu.show(s.reuse.source,this.renderer.blocks.get(s.reuse.source));}
duplicate(id){const state=this.states[this.index],reuse=state.reuse,previous=this.reuseCopies.get(this.index);if(!reuse||reuse.source!==id||previous&&previous.phase!=='menu')return false;const payload=E.CodeReuse.capture(state.scripts,id,reuse.object),copied=E.CodeReuse.clone(payload,reuse.template);if(reuse.demonstrate)copied.forEach(script=>script.reusePreview=true);this.reuseCopies.set(this.index,{scripts:E.CodeReuse.insert(state.scripts,copied),current:copied[0].blocks[0].id,phase:'copy'});this.render();if(reuse.demonstrate){const scope=this.demonstration=new E.Resources();this.renderer.animateNode(this.renderer.roots.get(copied[0].id),null,scope)}return true}
get busy(){return !!(this.codeMenu?.busy||this.demonstration?.busy)}
fit(){this.renderer.fitWorkspace(this.renderer.writingScale);}
next(){
 const state=this.states[this.index],reused=this.reuseCopies.get(this.index);if(this.busy)return true;
 if(state.reuse?.demonstrate){if(!reused){this.reuseCopies.set(this.index,{phase:'menu',current:state.reuse.source});this.render();return true}if(reused.phase==='menu'){if(this.codeMenu.element.hidden){this.render();return true}this.codeMenu.press('duplicate',()=>this.duplicate(state.reuse.source));return true}}
 if(state.reuse&&!reused)return true;let before,moved;
 if(state.reuse?.target&&reused&&this.index+1<this.states.length){const next=this.states[this.index+1],fragment=E.CodeReuse.capture(reused.scripts,reused.current,state.reuse.object);before=state.reuse.demonstrate?this.renderer.blocks.get(reused.current)?.getBoundingClientRect():null;moved=reused.current;this.reuseCopies.set(this.index+1,{scripts:E.CodeReuse.insert(next.scripts,fragment.scripts,state.reuse.target),current:next.current})}
 if(this.index>=this.states.length-1){this.execution.close();return false}
 const upcoming=this.states[this.index+1],valueNode=upcoming.demonstrateValue?this.slot(upcoming.current):null,oldValue=valueNode?.textContent;this.index++;this.render();
 if(before){const scope=this.demonstration=new E.Resources();scope.busy=true;const animation=this.renderer.animateNode(this.renderer.blocks.get(moved),before,scope);this.root.dataset.reusePhase='moving';animation.finished.then(()=>{if(scope.alive){scope.busy=false;this.root.dataset.reusePhase='inserted'}}).catch(()=>{});}
 if(valueNode){const node=this.slot(upcoming.current),newValue=node.textContent,scope=this.demonstration=new E.Resources();scope.busy=true;node.textContent=oldValue;scope.cleanup(()=>{node.textContent=newValue});const animation=scope.animation(node.animate([{background:'#ffe678'},{background:'#fff4ba'}],{duration:500}));animation.finished.then(()=>{if(scope.alive){node.textContent=newValue;scope.busy=false}}).catch(()=>{});}
 return true;
}
slot(current){const split=current?.lastIndexOf(':');return split>0?this.renderer.blocks.get(current.slice(0,split))?.querySelector(':scope>.ec-row>[data-slot="'+current.slice(split+1)+'"]'):null}
prev(){const state=this.states[this.index],reuse=this.reuseCopies.get(this.index);if(state.reuse?.demonstrate&&reuse){if(reuse.phase==='copy')this.reuseCopies.set(this.index,{phase:'menu',current:state.reuse.source});else this.reuseCopies.delete(this.index);this.render();return true}if(!this.index){this.execution.close();return false}this.index--;this.render();return true}
activate(last=false){this.index=last?this.states.length-1:0;this.render()}
stop(){this.demonstration?.close();this.demonstration=null;this.codeMenu?.close();this.execution.close()}
};})();
