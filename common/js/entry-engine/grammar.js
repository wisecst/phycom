/* Schema shared by commands, events, controls, functions and nested reporters. */
(()=>{'use strict';const E=window.EntryEngine=window.EntryEngine||{};
// Roles are schema metadata, never inferred from displayed values or slot names.
E.slotRole=slot=>{const kind=slot.type||slot.value.kind;if(slot.value.kind==='block')return 'value';if(['literal','number','text','string','input'].includes(kind))return 'input';if(kind==='dropdown')return 'dropdown';if(kind==='boolean')return 'boolean';if(kind==='color')return 'color';return 'value';};
E.clone=value=>JSON.parse(JSON.stringify(value));
E.walk=(scripts,visit)=>{function node(n,parent=null){visit(n,parent);(n.parts||[]).forEach(p=>{if(p.slot?.value?.kind==='block')node(p.slot.value.block,n)});(n.branches||[]).forEach(b=>b.forEach(c=>node(c,n)))}scripts.forEach(s=>s.blocks.forEach(n=>node(n)));};
E.validate=scripts=>{const ids=new Set();scripts.forEach(s=>{if(!s.id||!Array.isArray(s.blocks))throw Error('Invalid script root')});E.walk(scripts,n=>{if(!n.id||ids.has(n.id))throw Error('Duplicate/missing block id: '+n.id);ids.add(n.id);if(!['event','command','c','e','reporter','boolean','definition'].includes(n.type))throw Error('Unknown grammar: '+n.type);if(n.type==='e'&&n.branches?.length!==2)throw Error('E requires two branches');if(['c','definition'].includes(n.type)&&n.branches?.length!==1)throw Error('C requires one branch');if(!n.category)throw Error('Missing category')});return true;};
// Entry's Block.copy(): a reporter tree, or the selected command and its thread tail.
// Reference: entrylabs/entryjs/src/playground/block.js (copy/copyToClipboard).
E.CodeReuse={
 capture(scripts,id,object){
  let selected;
  function sequence(blocks){for(let i=0;i<blocks.length&&!selected;i++){const node=blocks[i];if(node.id===id){selected=E.clone(['reporter','boolean'].includes(node.type)?[node]:blocks.slice(i));return}for(const part of node.parts||[])if(part.slot?.value?.kind==='block')sequence([part.slot.value.block]);for(const branch of node.branches||[])sequence(branch)}}
  for(const script of scripts)sequence(script.blocks);
  return selected?{object,scripts:[{id:'reuse-source',blocks:selected}]}:null;
 },
 matches(source,target){
  const shape=scripts=>{const result=[];E.walk(scripts,node=>result.push([node.type,node.category,node.parts.map(p=>p.slot?['slot',p.slot.id,p.slot.value.kind==='block']:['text',p.text]),node.branches?.map(b=>b.length)||[]]));return JSON.stringify(result)};
  return source?.length===target?.length&&shape(source)===shape(target);
 },
 clone(payload,template,namespace){
  if(!payload)return null;const scripts=E.clone(payload.scripts),ids=[];
  if(template){if(!this.matches(scripts,template))throw Error('Selected code does not match the lesson target');E.walk(template,node=>ids.push(node.id));}
  let index=0;const prefix=namespace||'reuse-'+crypto.randomUUID();
  E.walk(scripts,node=>{node.id=template?ids[index++]:prefix+'-'+index++;if(template)delete node.run});
  scripts.forEach((script,i)=>script.id=template?template[i].id:prefix+'-script-'+i);E.validate(scripts);return scripts;
 },
 insert(scripts,copied,target){
  const result=E.clone(scripts),copy=E.clone(copied);
  if(target){let parent;E.walk(result,node=>{if(node.id===target.block)parent=node});const slot=parent?.parts.find(p=>p.slot?.id===target.slot)?.slot;
   if(!slot||copy.length!==1||copy[0].blocks.length!==1||!['reporter','boolean'].includes(copy[0].blocks[0].type))throw Error('A value slot requires one reporter tree');slot.value={kind:'block',block:copy[0].blocks[0]};
  }else result.push(...copy);
  E.validate(result);return result;
 }
};
// Digital switch semantics are shared across pin numbers and lessons.
E.digitalOutputState=n=>{if(n.type!=='command'||n.category!=='hardware')return null;const words=n.parts.map(p=>p.text??(p.slot?.value?.kind==='dropdown'?String(p.slot.value.value):'')).join(' ');if(!/디지털/.test(words)||!/번\s*핀/.test(words))return null;const action=n.parts.map(p=>p.text??(p.slot?.value?.kind==='dropdown'?String(p.slot.value.value):'')).find(v=>/^(켜기|끄기)$/.test(v?.trim()));return action?.trim()==='켜기'?'ON':action?.trim()==='끄기'?'OFF':null;};
E.startBlocks=()=>[{id:'common-start',type:'event',category:'start',parts:[{text:'▶ 시작하기 버튼을 클릭했을 때'}]},{id:'common-pin13',type:'command',category:'hardware',parts:[{text:'디지털'},{slot:{id:'pin',value:{kind:'dropdown',value:'13'}}},{text:'번 핀'},{slot:{id:'action',value:{kind:'dropdown',value:'켜기'}}}],run:'common-pin13'}];
E.startStates=()=>[{scripts:[{id:'main',blocks:[]}],guide:'다음 블록을 눌러 시작하세요.'},{scripts:[{id:'main',blocks:E.startBlocks().slice(0,1)}],current:'common-start',tab:'start',guide:'시작하기 버튼을 클릭했을 때'},{scripts:[{id:'main',blocks:E.startBlocks()}],current:'common-pin13',tab:'hardware',guide:'디지털 13번 핀 켜기'},{scripts:[{id:'main',blocks:E.startBlocks()}],current:'common-pin13',tab:'hardware',guide:'13번 핀 실행 결과를 확인하세요.',result:'common-pin13'},{scripts:[{id:'main',blocks:E.startBlocks()}],tab:'hardware',guide:'실행 팝업을 닫고 수업 코드를 작성합니다.'}];
})();
