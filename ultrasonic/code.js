/* Textbook PDF2 printed pp.39–41. Data only; common Controller owns construction. */
(()=>{'use strict';const E=EntryEngine,t=text=>({text}),s=(id,value,kind='number')=>({slot:{id,value:{kind,value}}}),v=(id,block)=>({slot:{id,value:{kind:'block',block}}}),b=(id,category,parts,type='command',branches)=>({id,category,parts,type,...(branches?{branches}:{})});
const sensor=id=>b(id,'hardware',[t('울트라소닉 Trig'),s('trig',3,'dropdown'),t('Echo'),s('echo',2,'dropdown'),t('센서값')],'reporter');
const variable=id=>b(id,'data',[s('variable','계이름번호','dropdown'),t('값')],'reporter');
const inquiries={
 quotient:{question:'측정 거리를 5로 나눈 몫을 사용하는 이유는 무엇일까요?',phases:['question','visual','rule'],rule:'5cm씩 같은 구간으로 나누면 같은 구간은 같은 계이름번호가 됩니다.'},
 limit:{question:'계이름번호가 6보다 크면 왜 6으로 정할까요?',phases:['question','visual','rule'],rule:'도~시 7개 건반의 계이름번호는 0~6입니다. 6보다 큰 값은 6(시)으로 제한합니다.'},
 costume:{question:'모양 번호에는 왜 계이름번호에 1을 더할까요?',phases:['question','visual','rule'],rule:'계이름번호는 0부터, 모양 번호는 1부터 시작합니다. 모양 번호 = 계이름번호 + 1'},
 position:{question:'도에서 레, 미로 이동할 때 X좌표는 어떤 규칙으로 바뀔까요?',phases:['question','do','re','mi','rule'],rule:'X좌표 = 15 + (계이름번호 × 33)'}
};
function build(kind){const states=E.startStates(),scripts=E.clone(states.at(-1).scripts),list=scripts[0].blocks;const save=current=>states.push({scripts:E.clone(scripts),current});
 if(kind==='piano')list.push(b('greeting','looks',[s('message','초음파 센서 거리로 피아노 연주 시작!','string'),t('을(를)'),s('seconds',2),t('초 동안 말하기')])),save('greeting');
 const explain=(topic,current)=>inquiries[topic].phases.forEach((phase,index)=>states.push({scripts:E.clone(scripts),current,progression:'exact',result:'inquiry-'+topic+'-'+phase,inquiry:{topic,phase:index}}));
 const loop=b('loop','flow',[t('계속 반복하기')],'c',[[]]);list.push(loop);save('loop');const body=loop.branches[0];const add=block=>{body.push(block);save(block.id)};
 if(kind==='basic'){add(b('distance-say','looks',[v('message',sensor('distance-sensor')),t('을(를) 말하기')]));add(b('wait','flow',[s('seconds',.5),t('초 기다리기')]));}
 if(kind==='lamp'){add(b('near','flow',[t('만일'),v('condition',b('near-condition','judge',[v('left',sensor('lamp-sensor')),t('<'),s('right',10)],'boolean')),t('(이)라면')],'e',[[b('lamp-on','looks',[s('shape','전등_켜짐','dropdown'),t('모양으로 바꾸기')])],[b('lamp-off','looks',[s('shape','전등_꺼짐','dropdown'),t('모양으로 바꾸기')])]]));}
 if(kind==='piano'){
  add(b('set-note','data',[s('variable','계이름번호','dropdown'),t('을'),v('value',b('quotient','calculation',[v('left',sensor('piano-sensor')),t('/'),s('right',5),t('의 몫')],'reporter')),t('(으)로 정하기')]));explain('quotient','set-note');
  add(b('limit','flow',[t('만일'),v('condition',b('over-six','judge',[v('left',variable('limit-value')),t('>'),s('right',6)],'boolean')),t('(이)라면')],'c',[[b('set-limit','data',[s('variable','계이름번호','dropdown'),t('을'),s('value',6),t('(으)로 정하기')])]]));explain('limit','limit');
  add(b('costume','looks',[v('shape',b('costume-number','calculation',[v('left',variable('costume-value')),t('+'),s('right',1)],'reporter')),t('모양으로 바꾸기')]));explain('costume','costume');explain('position','costume');
  add(b('move','motion',[t('x:'),v('x',b('x-sum','calculation',[s('left',15),t('+'),v('right',b('x-product','calculation',[v('left',variable('x-value')),t('×'),s('right',33)],'reporter'))],'reporter')),t('위치로 이동하기')]));
  add(b('wait','flow',[s('seconds',.2),t('초 기다리기')]));
 }
 loop.run=kind;save('loop');states.at(-1).result=kind;return states;
}
const programs={basic:build('basic'),lamp:build('lamp'),piano:build('piano')};
// Extension follows the unmodified textbook run: copy the same 1-based costume expression.
const soundScripts=E.clone(programs.piano.at(-1).scripts),soundStates=[{scripts:E.clone(soundScripts),progression:'exact'}];
const soundLoop=soundScripts[0].blocks.find(n=>n.id==='loop');delete soundLoop.run;
const soundBlock=b('play-note','sound',[s('sound','피아노 04_도','dropdown'),t('소리 재생하기')]);soundLoop.branches[0].splice(3,0,soundBlock);
soundStates.push({scripts:E.clone(soundScripts),current:soundBlock.id});
const copy=E.CodeReuse.clone(E.CodeReuse.capture(soundScripts,'costume-number','piano'),null,'sound-note');
Object.assign(soundStates.at(-1),{progression:'exact',reuse:{demonstrate:true,object:'piano',source:'costume-number',template:copy,target:{block:'play-note',slot:'sound'}},guide:'모양 번호와 같은 방법으로 소리 번호를 연결합니다.'});
const inserted=E.CodeReuse.insert(soundScripts,copy,{block:'play-note',slot:'sound'});soundStates.push({scripts:inserted,current:copy[0].blocks[0].id,progression:'exact'});
const final=E.clone(inserted);E.walk(final,n=>{if(n.id==='loop')n.run='pianoSound'});soundStates.push({scripts:final,current:'play-note',result:'pianoSound',progression:'exact'});programs.pianoSound=soundStates;
window.ultraCode={programs,sensor,variable,inquiries};
})();
