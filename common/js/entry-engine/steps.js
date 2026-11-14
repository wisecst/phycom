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

this.tabs=new E.Tabs(root.querySelector('.entry-tabs'),assetBase);this.execution=new E.Execution(root,results);this.renderer=new E.Renderer(program,(key)=>this.execution.toggleResult(key));this.renderer.writingScale=1.15;root.dataset.entryEngine='1';this.render();}
enablePalette(host){
 // The common writing flow creates each block directly in its code-tree position.
 // Retained as a compatibility method for modules that still call enablePalette().
 return null;
}
prepareNext(index=this.index+1){
 // No detached palette or transfer step: the next state renders the joined block.
 return false;
}
render(){this.program.dispatchEvent(new CustomEvent('entry:before-state',{bubbles:true}));this.execution.close();const s=this.states[this.index],changed=this.renderer.current!==s.current;this.renderer.current=s.current;this.root.dataset.engineState=this.index;const previous=this.root.querySelector('[data-engine-previous]');if(previous)previous.disabled=this.index===0;const next=this.root.querySelector('[data-engine-next]');if(next)next.disabled=this.index===this.states.length-1;this.root.dataset.engineStates=this.states.length;this.root.dataset.enginePhase=s.phase;this.renderer.render(s.scripts,s.current);this.tabs.render(s.visible,s.tab);if(this.guide)this.guide.textContent=s.guide||'';if(!this.renderer.workspaceReadingScale)this.fit();if(changed&&!s.result)this.renderer.revealCurrent(s.current);if(this.count)this.count.textContent=(this.index+1)+' / '+this.states.length;this.root.querySelectorAll('.entry-block-count b').forEach(b=>{let n=0;E.walk(s.scripts,()=>n++);b.textContent=n});this.root.classList.toggle('page7-final-actions',!!s.complete);this.root.querySelector('.entry-code-toolbar')?.classList.toggle('page7-final-actions',!!s.complete);this.root.querySelectorAll('[data-completion-hint]').forEach(h=>h.hidden=!s.complete);if(s.result)this.execution.open(s.result);if(s.complete){window.lessonUI?.completeResult(this.root);this.onComplete?.(this.root)}this.program.dispatchEvent(new CustomEvent('entry:state',{bubbles:true,detail:{index:this.index,phase:s.phase}}));}
fit(){this.renderer.fitWorkspace(this.renderer.writingScale);}
next(){if(this.index>=this.states.length-1){this.execution.close();return false}this.index++;this.render();return true}
prev(){if(!this.index){this.execution.close();return false}this.index--;this.render();return true}
activate(last=false){this.index=last?this.states.length-1:0;this.render()}
stop(){this.execution.close()}
};})();
