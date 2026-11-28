(()=>{'use strict';const E=window.EntryEngine,ns='http://www.w3.org/2000/svg';
function div(cls){const el=document.createElement('div');el.className=cls;return el}
function reconcile(host,nodes){nodes.forEach((node,i)=>{if(host.children[i]!==node)host.insertBefore(node,host.children[i]||null)});while(host.children.length>nodes.length)host.lastElementChild.remove()}
E.Renderer=class{
constructor(host,onRun){this.host=host;this.onRun=onRun;this.blocks=new Map();this.roots=new Map();this.groups=new Map();host.replaceChildren();host.classList.add('ec-program');const stage=host.closest('.entry-stage');this.observer=typeof ResizeObserver==='function'?new ResizeObserver(entries=>{if(this.writingScale&&entries.some(entry=>entry.target===stage)&&!host.closest('.entry-slide')?.querySelector('.ec-popup:not([hidden])'))this.fitWorkspace();else this.reflow()}):null;if(stage)this.observer?.observe(stage);}
transferBlockTo(id,renderer){const node=this.blocks.get(id);if(!node)return;const old=renderer.blocks.get(id);if(old&&old!==node)renderer.observer?.unobserve(old);this.observer?.unobserve(node);this.blocks.delete(id);renderer.blocks.set(id,node);renderer.observer?.observe(node);}
render(scripts,current){E.validate(scripts);this.scripts=scripts;this.host.style.setProperty('--ec-script-count',scripts.length||1);this.host.classList.toggle('ec-multiple-scripts',scripts.length>1);const roots=scripts.map(s=>{let root=this.roots.get(s.id);if(!root){root=div('ec-script');root.dataset.script=s.id;this.roots.set(s.id,root)}this.sequence(root,s.blocks,current,s.id);return root});reconcile(this.host,roots);this.reflow();this.alignRoots();if(this.workspaceReadingScale)this.fitWorkspace(this.workspaceReadingScale);}
sequence(host,nodes,current,key){const result=[];let group=null;for(const n of nodes){if(n.group){const id=key+":"+n.group;let wrapper=this.groups.get(id);if(!wrapper){wrapper=div('ec-group');wrapper.dataset.group=n.group;this.groups.set(id,wrapper)}if(group!==wrapper){group=wrapper;result.push(wrapper);wrapper.replaceChildren();wrapper.groupNote=n.groupNote;if(n.groupNote){wrapper.dataset.note=n.groupNote.text;for(const [key,value]of Object.entries({color:n.groupNote.color,background:n.groupNote.background,ink:n.groupNote.ink,padding:n.groupNote.padding||'8px 12px'}))wrapper.style.setProperty('--ec-note-'+key,value);}else wrapper.removeAttribute('data-note')}wrapper.append(this.block(n,current));}else{group=null;result.push(this.block(n,current));}}reconcile(host,result);}
block(n,current){let el=this.blocks.get(n.id);if(!el){el=div('ec-block');el.dataset.block=n.id;const svg=document.createElementNS(ns,'svg'),path=document.createElementNS(ns,'path');svg.classList.add('ec-silhouette');svg.setAttribute('aria-hidden','true');svg.append(path);el.append(svg,div('ec-row'));this.blocks.set(n.id,el);this.observer?.observe(el);}
el.dataset.type=n.type;el.dataset.category=n.category;el.style.setProperty('--ec-category',E.categories[n.category].color);el.className='ec-block'+(['reporter','boolean'].includes(n.type)?' ec-reporter':'')+(n.id===current||current?.startsWith(n.id+':')?' entry-current':'');const row=el.children[1];const parts=n.parts.map((p,i)=>{let part=row.querySelector(':scope>[data-part="'+i+'"]');if(!part){part=document.createElement('span');part.dataset.part=i}if(p.text!==undefined){part.className='ec-text';if(part.textContent!==(n.type==='event'&&n.category==='start'?p.text.replace(/^▶\s*/, ''):p.text))part.textContent=n.type==='event'&&n.category==='start'?p.text.replace(/^▶\s*/, ''):p.text;}else{part.className='ec-slot';part.dataset.slot=p.slot.id;this.value(part,p.slot.value,current,E.slotRole(p.slot));part.classList.toggle('ec-slot-current',current===n.id+':'+p.slot.id)}return part});if(n.type==='event'&&n.category==='start'){let icon=row.querySelector('.ec-event-icon')||document.createElement('span');icon.className='ec-event-icon';icon.setAttribute('aria-hidden','true');const text=n.parts.map(p=>p.text||'').join(' ');const kind=/키.*눌/.test(text)?'keyboard':/마우스|오브젝트.*클릭/.test(text)?'mouse':/신호/.test(text)?'signal':/장면/.test(text)?'scene':'play';const paths={play:'<path d="M8 5L19 12L8 19Z" fill="currentColor" stroke="none"/>',keyboard:'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M6 9h1m3 0h1m3 0h1m3 0h1M6 12h1m3 0h1m3 0h1m3 0h1M7 15h10"/>',mouse:'<rect x="6" y="3" width="12" height="18" rx="6"/><path d="M12 3v7M6 10h12"/>',signal:'<path d="M12 10v11M8 21h8M8 7a6 6 0 0 0 0 8m8-8a6 6 0 0 1 0 8M5 4a10 10 0 0 0 0 14M19 4a10 10 0 0 1 0 14"/><circle cx="12" cy="10" r="2" fill="currentColor" stroke="none"/>',scene:'<path d="M3 9h18v11H3Z M3 9L2 5L20 2L21 6Z M7 4l3 3m3-4l3 3"/>'};icon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+paths[kind]+'</svg>';icon.dataset.eventIcon=kind;parts.unshift(icon)}if(n.run){let button=row.querySelector('.ec-run');if(!button){button=document.createElement('button');button.type='button';button.className='ec-run';button.textContent='▶';button.setAttribute('aria-label','실행 또는 정지')}button.dataset.run=n.run;button.onclick=event=>{event.stopPropagation();this.onRun(n.run,button)};parts.push(button)}reconcile(row,parts);
const children=[el.children[0],row];(n.branches||[]).forEach((branch,i)=>{let host=el.querySelector(':scope>.ec-branch[data-branch="'+i+'"]');if(!host){host=div('ec-branch');host.dataset.branch=i}this.sequence(host,branch,current,n.id+":"+i);children.push(host);if(n.type==='e'&&i===0){let bar=el.querySelector(':scope>.ec-else');if(!bar){bar=div('ec-row ec-else');bar.textContent='아니면'}children.push(bar)}});if(n.branches){let bottom=el.querySelector(':scope>.ec-bottom')||div('ec-bottom');children.push(bottom)}const outputState=E.digitalOutputState(n);if(outputState){let badge=el.querySelector(':scope>.ec-output-status')||document.createElement('span');badge.className='ec-output-status';badge.dataset.state=outputState;badge.textContent=outputState;badge.setAttribute('aria-label',outputState==='ON'?'디지털 핀 켜짐':'디지털 핀 꺼짐');children.push(badge)}el.classList.toggle('ec-has-output-status',!!outputState);reconcile(el,children);return el;}
value(slot,v,current,role){slot.dataset.slotRole=role;slot.style.removeProperty('--ec-slot-color');if(v.kind==='block'){slot.className='ec-slot ec-filled';[...slot.childNodes].filter(n=>n.nodeType===3).forEach(n=>n.remove());reconcile(slot,[this.block(v.block,current)]);return;}slot.className='ec-slot ec-'+v.kind+' ec-role-'+role+(role==='input'?' ec-input':'');const value=String(v.value??'');if(role==='color'){slot.style.setProperty('--ec-slot-color',value);slot.setAttribute('aria-label','색상 '+value);slot.replaceChildren();return;}slot.removeAttribute('aria-label');if(role==='dropdown'){let label=slot.querySelector('.ec-dropdown-label'),caret=slot.querySelector('.ec-caret');if(!label||!caret){label=document.createElement('span');label.className='ec-dropdown-label';caret=document.createElement('span');caret.className='ec-caret';caret.textContent='▼';slot.replaceChildren(label,caret)}if(label.textContent!==value)label.textContent=value;}else if(slot.textContent!==value)slot.textContent=value;}
alignRoots(){for(const script of this.scripts||[]){const root=this.roots.get(script.id);root.style.paddingTop="";if(!script.align)continue;const anchor=this.blocks.get(script.align.block);const source=this.roots.get(script.align.script);if(!anchor?.isConnected||!source)continue;let y=anchor.offsetTop;for(let parent=anchor.offsetParent;parent&&parent!==this.host;parent=parent.offsetParent)y+=parent.offsetTop;if(script.align.edge==="body")y+=anchor.children[1].offsetHeight;root.style.paddingTop=Math.max(0,y-source.offsetTop)+"px";}}
fitWorkspace(maxScale=1.15,fit=null){
 maxScale=this.writingScale||maxScale;
 const host=this.host,stage=host.closest('.entry-stage');if(!stage||!stage.clientHeight)return;
 const scrollTop=host.scrollTop,scrollLeft=host.scrollLeft;
 host.classList.add('ec-writing');host.style.setProperty('transform','none','important');host.style.maxHeight='';host.style.overflow='';host.style.removeProperty('width');
 const sr=stage.getBoundingClientRect(),hr=host.getBoundingClientRect(),ratio=sr.width/stage.offsetWidth;
 const width=(sr.right-hr.left)/ratio-8,height=(sr.bottom-hr.top)/ratio-18;if(width<=0||height<=0)return;
 const roots=[...host.children];let w=0,h=0,scale;
 if(!this.writingScale&&this.workspaceReadingScale&&!this.scripts.some(s=>s.align)&&roots.every(root=>root.style.left!==''&&root.style.top!=='')){
  scale=this.workspaceReadingScale;
  for(const root of roots){w=Math.max(w,root.offsetLeft+root.offsetWidth);h=Math.max(h,root.offsetTop+root.offsetHeight);}
  host.style.height=h+'px';
  if(this.writingScale)host.style.setProperty('width',width/scale+'px','important');
  if(h*scale>height+.5||w*scale>width+.5){host.style.maxHeight=height/scale+'px';host.style.setProperty('width',width/scale+'px','important');host.style.overflow='auto';}
  host.style.setProperty('transform','scale('+scale+')','important');host.scrollTop=scrollTop;host.scrollLeft=scrollLeft;this.reflow();return;
 }

 if(!this.scripts.some(s=>s.align)){
  host.classList.add('ec-workspace');
  const placements=this.workspaceColumns ||= new Map(),active=new Set(roots.map(r=>r.dataset.script));
  for(const key of placements.keys())if(!active.has(key))placements.delete(key);
  if(!roots.length){placements.clear();this.workspaceReadingScale=null;}
  if(roots.length&&!this.workspaceReadingScale)this.workspaceReadingScale=this.writingScale||Math.min(maxScale,width/Math.max(1,roots[0].offsetWidth));
  const natural=Math.min(maxScale,this.workspaceReadingScale||maxScale),columns=[];
  for(const root of roots){
   root.style.paddingTop='';const rw=Math.max(root.offsetWidth,root.scrollWidth),rh=root.offsetHeight,key=root.dataset.script;
   let column=placements.get(key);
   if(column===undefined){column=columns.length;placements.set(key,column);}
   const c=columns[column] ||= {roots:[],width:0,height:0};c.roots.push(root);c.width=Math.max(c.width,rw);c.height+=rh;
  }
  let x=0;
  for(const c of columns){
   if(!c)continue;const gap=18;let y=0;
   for(const root of c.roots){if(this.scripts.find(s=>s.id===root.dataset.script)?.reusePreview)y+=64;Object.assign(root.style,{left:x+'px',top:y+'px'});y+=root.offsetHeight+gap;}
   w=Math.max(w,x+c.width);h=Math.max(h,y-gap);x+=c.width+28;
  }
  scale=natural;
 }else{
  host.classList.remove('ec-workspace');host.style.height='';for(const root of roots){root.style.left='';root.style.top='';}
  this.alignRoots();w=host.scrollWidth;h=host.scrollHeight;scale=this.writingScale||Math.min(maxScale,width/w,height/h);
 }
 if(fit?.width>0&&fit.height>0&&w&&h){
  const included=roots.filter(root=>!fit.exclude?.includes(root.dataset.script));
  const fitWidth=Math.max(1,...included.map(root=>root.offsetLeft+root.scrollWidth)),fitHeight=Math.max(1,...included.map(root=>root.offsetTop+root.offsetHeight));
  scale=Math.min(scale,fit.width/fitWidth,fit.height/fitHeight);
  if(fit.beside?.anchor){const anchor=fit.beside.anchor,box=anchor.getBoundingClientRect(),outline=anchor.hasAttribute('data-note')?parseFloat(getComputedStyle(anchor,'::after').width):anchor.offsetWidth;const edge=(box.left-hr.left)/ratio+host.scrollLeft+Math.max(anchor.offsetWidth,outline);scale=Math.min(scale,(fit.width-fit.beside.width-fit.beside.gap)/edge);}
 }
 if(this.writingScale){
  // The viewport belongs to the Stage, not to the changing script dimensions.
  host.style.setProperty('max-width','none','important');host.style.setProperty('width',width/scale+'px','important');host.style.height=height/scale+'px';host.style.overflow=fit?.exclude?.length?'hidden':'auto';
 }else if(!this.scripts.some(s=>s.align)){
  host.style.height=h+'px';if(h*scale>height+.5||w*scale>width+.5){host.style.maxHeight=height/scale+'px';host.style.setProperty('width',width/scale+'px','important');host.style.overflow='auto';}
 }
 if((w&&h)||this.writingScale)host.style.setProperty('transform','scale('+scale+')','important');
 host.scrollTop=scrollTop;host.scrollLeft=scrollLeft;this.reflow();
}
animateNode(node,before,scope){
 if(!node)return null;const after=node.getBoundingClientRect(),scale=after.width/(node.offsetWidth||after.width)||1;
 const animation=scope.animation(node.animate(before?[{transform:'translate('+((before.left-after.left)/scale)+'px,'+((before.top-after.top)/scale)+'px)'},{transform:'translate(0,0)'}]:[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:before?900:300,easing:'ease-in-out'}));return animation;
}
revealCurrent(current){
 const block=this.blocks.get(current?.split(':')[0]),group=[...this.groups.values()].find(g=>g.isConnected&&g.dataset.group===current&&g.hasAttribute('data-note'));
 if((!block?.isConnected&&!group)||!this.host.classList.contains('ec-writing'))return;
 const target=block&&current?.includes(':')?[...block.querySelectorAll('[data-slot]')].find(slot=>slot.dataset.slot===current.slice(current.indexOf(':')+1)):null;
 const host=this.host,v=host.getBoundingClientRect(),scale=v.width/host.offsetWidth;if(!scale)return;
 let r;
 if(group){const box=group.getBoundingClientRect(),note=getComputedStyle(group,'::before'),width=parseFloat(note.width)+(note.boxSizing==='border-box'?0:parseFloat(note.paddingLeft)+parseFloat(note.paddingRight)+parseFloat(note.borderLeftWidth)+parseFloat(note.borderRightWidth)),height=parseFloat(note.height)+(note.boxSizing==='border-box'?0:parseFloat(note.paddingTop)+parseFloat(note.paddingBottom)+parseFloat(note.borderTopWidth)+parseFloat(note.borderBottomWidth));const left=box.left+parseFloat(note.left)*scale,top=box.top+parseFloat(note.top)*scale-height*scale/2;r={left,top,right:left+width*scale,bottom:top+height*scale,width:width*scale,height:height*scale};}
 else r=(target||block.children[1]).getBoundingClientRect();
 const dx=r.left<v.left?(r.left-v.left)/scale:r.right>v.right?Math.min((r.right-v.right)/scale,(r.left-v.left)/scale):0;
 const dy=r.top<v.top?(r.top-v.top)/scale:r.bottom>v.bottom?Math.min((r.bottom-v.bottom)/scale,(r.top-v.top)/scale):0;
 if(Math.abs(dx)>.5||Math.abs(dy)>.5)host.scrollTo({left:host.scrollLeft+dx,top:host.scrollTop+dy,behavior:'smooth'});
}
reflow(){for(const el of this.blocks.values()){if(!el.isConnected)continue;// The subtree owns layout space; each silhouette owns only its row width.
const w=el.children[1].offsetWidth,h=el.offsetHeight;if(!w||!h)continue;const svg=el.children[0],path=svg.firstElementChild;svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.setAttribute('width',w);svg.setAttribute('height',h);const rowH=el.children[1].offsetHeight,t=el.dataset.type,I=22;let d;if(t==='reporter')d=`M ${h/2} 0 H ${w-h/2} Q ${w} 0 ${w} ${h/2} Q ${w} ${h} ${w-h/2} ${h} H ${h/2} Q 0 ${h} 0 ${h/2} Q 0 0 ${h/2} 0 Z`;else if(t==='boolean')d=`M 12 0 H ${w-12} L ${w} ${h/2} L ${w-12} ${h} H 12 L 0 ${h/2} Z`;else{const top=t==='event'?`M 0 ${Math.min(14,rowH/3)} Q 12 -4 38 2 H ${w-18}`:`M 0 2 H 14 l 6 5 h 18 l 6 -5 H ${w-18}`;d=top+` Q ${w} 2 ${w} 18 V ${rowH-14} Q ${w} ${rowH} ${w-18} ${rowH}`;if(t==='c'||t==='e'||t==='definition'){const branches=[...el.querySelectorAll(':scope>.ec-branch')];let y=rowH;for(let i=0;i<branches.length;i++){const bh=branches[i].offsetHeight;d+=` H ${I+42} l -6 5 h -18 l -6 -5 H ${I} V ${y+bh}`;y+=bh;if(t==='e'&&i===0){const bar=el.querySelector(':scope>.ec-else'),barH=bar.offsetHeight,barW=bar.offsetWidth;d+=` H ${barW-18} Q ${barW} ${y} ${barW} ${y+14} V ${y+barH-14} Q ${barW} ${y+barH} ${barW-18} ${y+barH}`;y+=barH;}}d+=` H ${Math.max(150,w*.6)-14} Q ${Math.max(150,w*.6)} ${h-14} ${Math.max(150,w*.6)} ${h-2} H 44 l -6 5 h -18 l -6 -5 H 0 Z`;}else d+=` H 44 l -6 5 h -18 l -6 -5 H 0 Z`;}path.setAttribute('d',d);}
for(const group of this.groups.values()){
 const note=group.groupNote;if(!note||!group.isConnected)continue;
 const anchor=this.blocks.get(note.anchor),target=this.blocks.get(note.centerBlock)||group.firstElementChild;
 const center=note.center==='else'?target.querySelector(':scope>.ec-else'):note.center==='row'?target.children[1]:target;
 if(!anchor?.isConnected||!center)continue;
 const box=group.getBoundingClientRect(),edge=(note.anchorPart==='else'?anchor.querySelector(':scope>.ec-else'):note.anchorPart==='row'?anchor.children[1]:anchor).getBoundingClientRect(),focus=center.getBoundingClientRect(),scale=box.width/group.offsetWidth;if(!scale)continue;
 group.style.setProperty('--ec-note-left',((edge.right-box.left)/scale+(note.gap??24))+'px');
 group.style.setProperty('--ec-note-top',((focus.top+focus.height/2-box.top)/scale)+'px');
 if(note.inside){const style=getComputedStyle(group,'::before'),width=parseFloat(style.width)+(style.boxSizing==='border-box'?0:parseFloat(style.paddingLeft)+parseFloat(style.paddingRight)+parseFloat(style.borderLeftWidth)+parseFloat(style.borderRightWidth));group.style.setProperty('--ec-note-outline-width',Math.max(group.offsetWidth,parseFloat(group.style.getPropertyValue('--ec-note-left'))+width+4)+'px');}else group.style.removeProperty('--ec-note-outline-width');
}}
destroy(){this.observer?.disconnect();this.blocks.clear();this.roots.clear()}
};
// A command and each reporter in its value slots are separate construction steps.
E.blockStages=node=>{const pending=[];function bare(n){const copy=E.clone(n);copy.parts.forEach((part,i)=>{if(part.slot?.value.kind==='block'){pending.push({parent:n.id,index:i,node:part.slot.value.block});part.slot.value={kind:'literal',value:0};}});return copy;}const main=bare(node),states=[null,{node:E.clone(main),current:node.id,tab:node.category}];for(let i=0;i<pending.length;i++){const item=pending[i],value=bare(item.node);let parent;E.walk([{id:'build',blocks:[main]}],n=>{if(n.id===item.parent)parent=n;});parent.parts[item.index].slot.value={kind:'block',block:value};states.push({node:E.clone(main),current:value.id,tab:value.category});}return states;};
})();
