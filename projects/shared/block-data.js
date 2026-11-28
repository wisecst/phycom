/* Project lesson data helpers only; construction, reuse and animation belong to EntryEngine. */
(()=>{'use strict';const E=EntryEngine,t=text=>({text}),s=(id,value,kind=typeof value==='number'?'number':'dropdown')=>({slot:{id,value:{kind,value}}}),v=(id,block)=>({slot:{id,value:{kind:'block',block}}}),b=(id,category,parts,type='command',branches)=>({id,category,parts,type,...(branches?{branches}:{})});
const variable=(id,name)=>b(id,'data',[s('name',name),t('값')],'reporter');
const analog=id=>b(id,'hardware',[t('아날로그'),s('pin','A0'),t('센서값')],'reporter');
const distance=id=>b(id,'hardware',[t('울트라소닉 Trig'),s('trig','3'),t('Echo'),s('echo','2'),t('센서값')],'reporter');
const map=(id,max)=>b(id,'hardware',[t('아날로그'),s('pin','A0'),t('번 센서값의 범위를'),s('inMin',0),t('~'),s('inMax',1023),t('에서'),s('outMin',0),t('~'),s('outMax',max),t('로 바꾼 값')],'reporter');
const tone=(id,pin,note,seconds)=>b(id,'hardware',[t('디지털'),s('pin',String(pin)),t('번 핀의 피에조 부저를'),s('octave','4'),t('옥타브'),s('note',note),t('음으로'),s('seconds',seconds),t('초 연주하기')]);
const servo=(id,value)=>b(id,'hardware',[t('디지털'),s('pin','3'),t('번 핀에 연결된 서보모터를'),...(typeof value==='object'?[v('angle',value)]:[s('angle',value)]),t('도로 회전하기')]);
function builder(){const states=E.startStates(),scripts=E.clone(states.at(-1).scripts);let inLoop=false;const branch=()=>inLoop?scripts[0].blocks.find(n=>n.id==='repeat').branches[0]:scripts[0].blocks;
 const save=(current,extra={})=>states.push({scripts:E.clone(scripts),current,...extra});
 return{states,scripts,save,add(node){branch().push(node);save(node.id);return node},loop(){const node=b('repeat','flow',[t('계속 반복하기')],'c',[[]]);branch().push(node);save(node.id);inLoop=true;return node},reuse(source,parent,slot){scripts.push({id:'reuse-source',blocks:[source]});save(source.id,{guide:'기존 코드에서 재사용할 전체 수식 블록을 살펴보세요.'});const copied=E.CodeReuse.clone(E.CodeReuse.capture(scripts,source.id,'project'),null,'project-copy'),copy=copied[0].blocks[0];save(source.id,{progression:'exact',reuse:{demonstrate:true,object:'project',source:source.id,template:copied,target:{block:parent.id,slot}},guide:'같은 오브젝트의 수식을 복제하여 새 코드의 입력칸에 결합합니다.'});const next=E.CodeReuse.insert(scripts,copied,{block:parent.id,slot});scripts.splice(0,scripts.length,...next);save(copy.id,{progression:'exact'});return copy},removeSource(){const i=scripts.findIndex(s=>s.id==='reuse-source');if(i>=0)scripts.splice(i,1)},finish(current){this.removeSource();const loop=scripts[0].blocks.find(n=>n.id==='repeat');loop.run='project';save(current,{result:'project',progression:'exact'});return states}};
}
window.ProjectBlockData={t,s,v,b,variable,analog,distance,map,tone,servo,builder};
})();
