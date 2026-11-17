(()=>{
 const root=document.querySelector('.pwm-range-slide');if(!root)return;
 const pairs=[...root.querySelectorAll('.page8-code-pair')],prompt=root.querySelector('#page8Prompt'),secondPrompt=root.querySelector('#page8SecondPrompt'),scale=root.querySelector('#page8Scale'),deltas=[...root.querySelectorAll('.page8-scale-delta')];
 const totalSteps=5;let step=0;
 function render(){pairs.forEach(pair=>{pair.classList.toggle('is-grouped',step>=1);pair.classList.toggle('is-value-focus',step>=3);pair.querySelector('.ec-block[data-category="hardware"] .ec-literal').classList.toggle('is-value-marked',step>=3)});secondPrompt.hidden=step<2;scale.hidden=step<4;scale.style.setProperty('display',step>=4?'block':'none','important');deltas.forEach(delta=>delta.classList.toggle('is-visible',step>=4));}
 function nextStep(){if(step<totalSteps-1){step++;render();return true;}return false;}
 function previousStep(){if(step>0){step--;render();return true;}return false;}
 window.pwmRangeLesson={activate(finalState=false){step=finalState?totalSteps-1:0;render();},next:nextStep,prev:previousStep};
 render();
})();


(()=>{
 const root=document.querySelector('.p9-learning:not(.p9-code-learning)');if(!root)return;
 const repeatQuestion='같은 동작을 반복하여 <span class="question-keyword">여러 단계</span>의 밝기를 만들려면,<br><span class="question-keyword">밝기값</span>을 어떻게 변화 시키면 좋을까?';
 const questions=['0에서 255까지, <span class="question-keyword">같은 간격</span>의 <span class="question-keyword">4단계 밝기값</span>을 어떻게 정하면 좋을까?',repeatQuestion,repeatQuestion,'<span class="question-keyword">4단계</span>를 만들려면 몇 개의 <span class="question-keyword">간격</span>으로 나누어야 할까?','<span class="question-keyword">4단계</span>를 만들려면 몇 개의 <span class="question-keyword">간격</span>으로 나누어야 할까?','<span class="question-keyword">4단계</span>를 만들려면 몇 개의 <span class="question-keyword">간격</span>으로 나누어야 할까?','각 단계의 <span class="question-keyword">값</span>을 스스로 완성하자.','각 단계의 <span class="question-keyword">값</span>을 스스로 완성하자.'];let step=0;
 const equation=root.querySelector('#p9Equation'),finalLine=root.querySelector('[data-p9-line="divide3"]');equation.textContent='③ 255 ÷ 3 = 85';finalLine.before(equation);
 root.querySelectorAll('[data-p9-line]').forEach(row=>row.style.minHeight='140px');
 function render(){root.querySelector('#p9Question').innerHTML=step===0?'':'<div>'+questions[step]+'</div>';root.querySelector('#p9Question').style.display=step===0?'none':'';root.querySelector('#p9Support').textContent='';root.querySelector('#p9StepCount').textContent=`${step+1} / ${questions.length}`;
 root.querySelectorAll('[data-p9-line]').forEach(row=>{const kind=row.dataset.p9Line;row.hidden=kind==='existing'?false:kind==='target'?step<2:step<7;row.classList.toggle('is-gap-focus',kind==='target'&&step>=4);row.querySelector('.p9-point-gap-summary').textContent=step>=4&&kind==='target'?'점 4개\n간격 3개':'';});equation.hidden=step<5;
 }
 window.page9Lesson={activate(finalState=false){step=finalState?questions.length-1:0;render();},next(){if(step<questions.length-1){step++;render();return true;}return false;},prev(){if(step){step--;render();return true;}return false;}};render();
})();


(()=>{
 const root=document.querySelector('.p10-learning');if(!root)return;
 let step=0;const question=root.querySelector('#p10Question'),support=root.querySelector('#p10Support'),board=root.querySelector('#p10Board');
 question.innerHTML='<div><span class="question-keyword">4단계 규칙</span>을 <span class="question-keyword">8단계</span>로 바꾸려면?</div>';
 const four=document.querySelector('[data-p9-line="divide3"]').cloneNode(true),gapTemplate=four.querySelector('.p9-gap-mark').cloneNode(true);four.hidden=false;four.classList.add('is-gap-focus');four.querySelectorAll('.p9-gap-mark text').forEach(el=>el.remove());four.querySelectorAll('.p9-delta-label').forEach(el=>el.setAttribute('y',125));four.querySelector('h3').innerHTML='<span class="p12-order">①</span> 4단계<span class="p9-point-gap-summary">점 4개 · 간격 3개</span>';board.replaceChildren(four);
 const eight=four.cloneNode(true);eight.removeAttribute('data-p9-line');const final=eight.cloneNode(true);support.classList.add('p12-equation-row');board.append(eight,support,final);const ns='http://www.w3.org/2000/svg';
 function draw(row,values){const svg=row.querySelector('svg');svg.replaceChildren();svg.setAttribute('aria-label',values?'8단계 밝기값 0부터 255.01까지':'8단계 수직선');function add(tag,attrs,text){const el=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));if(text!==undefined)el.textContent=text;svg.append(el);}add('line',{class:'p9-axis',x1:'3%',x2:'97%',y1:53,y2:53});
 for(let i=0;i<8;i++){const x=3+i*94/7;add('circle',{class:'p9-value-point',cx:x+'%',cy:53,r:8});if(values)add('text',{class:'p9-value-label',x:x+'%',y:90},String(Number((i*36.43).toFixed(2))));
 if(i<7&&step>=2){const mark=gapTemplate.cloneNode(true),bracket=mark.querySelector('svg');bracket.setAttribute('x',(x+1.175)+'%');bracket.setAttribute('width',(94/7-2.35)+'%');if(values){mark.querySelector('text').remove();add('text',{class:'p9-delta-label',x:(x+47/7)+'%',y:125},'+36.43');}else{mark.querySelector('text').setAttribute('x',(x+47/7)+'%');mark.querySelector('text').textContent=i+1;}svg.append(mark);}}}
 function render(){eight.hidden=step<1;eight.classList.toggle('is-gap-focus',step>=2);eight.querySelector('h3').innerHTML='<span class="p12-order">②</span> 8단계'+(step>=2?'<span class="p9-point-gap-summary">점 8개 · 간격 7개</span>':'');draw(eight,false);support.hidden=step<3;support.textContent='③ 255 ÷ 7 ≈ 36.43';final.hidden=step<4;final.querySelector('h3').innerHTML='<span class="p12-order">④</span> 8단계<span class="p9-point-gap-summary">255.01 &gt; 255</span>';draw(final,true);root.querySelector('#p10StepCount').textContent=(step+1)+' / 5';}
 window.page10Lesson={activate(last=false){step=last?4:0;render();},next(){if(step<4){step++;render();return true;}return false;},prev(){if(step){step--;render();return true;}return false;}};render();
})();


(()=>{
 const root=document.querySelector('.p11-learning');if(!root)return;let step=0;
 const board=root.querySelector('.learning-board'),q=root.querySelector('#p11Question'),support=root.querySelector('#p11Support');
 board.innerHTML='<div class="p14-comparison"><div>4단계 → <b>간격 3개</b>　255 ÷ 3 = <strong>85</strong></div><div>8단계 → <b>간격 7개</b>　255 ÷ 7 ≈ <strong>36.43</strong></div><div>100단계 → <b>간격 99개</b>　255 ÷ 99 ≈ <strong>2.58</strong></div></div>';
 function render(){q.innerHTML='<div><span class="question-keyword">n단계</span>의 <span class="question-keyword">간격</span>은 몇 개일까?</div>';support.innerHTML=step?'간격 <b class="p14-solution">(n−1)</b>개, 증가값 = <b class="p14-solution">255 ÷ (n−1)</b>':'';root.querySelector('#p11StepCount').textContent=(step+1)+' / 2';}
 window.page11Lesson={activate(last=false){step=last?1:0;render();},next(){if(!step){step=1;render();return true;}return false;},prev(){if(step){step=0;render();return true;}return false;}};render();
})();

