/* Concept content comes from lesson data; existing device demonstrations are reused. */
(()=>{'use strict';
window.DeviceConcept=class{
 static emphasize(parent,text,phrases,key){
  let offset=0;
  while(offset<text.length){
   const match=(phrases||[]).map(phrase=>({phrase,start:text.indexOf(phrase,offset)})).filter(m=>m.start>=0).sort((a,b)=>a.start-b.start||b.phrase.length-a.phrase.length)[0];
   if(!match){parent.append(document.createTextNode(text.slice(offset)));break}
   parent.append(document.createTextNode(text.slice(offset,match.start)));
   const mark=document.createElement('mark');mark.dataset.key=key;mark.textContent=match.phrase;parent.append(mark);offset=match.start+match.phrase.length;
  }
 }
 static referenceHeading(root,{name,subtitle}={}){
  const devices=root.querySelector('.pot-concept-devices');if(devices)devices.style.setProperty('--device-count',devices.children.length);
  const header=root.querySelector(':scope>.device-concept-header');header.classList.add('pot-concept-heading');
  const title=header.querySelector('.device-concept-title'),heading=title.querySelector('h1'),meta=header.querySelector('.device-concept-meta'),kind=meta.firstElementChild,pageLabel=meta.lastElementChild,description=title.querySelector('.device-concept-subtitle');
  if(name)heading.textContent=name;if(subtitle)description.textContent=subtitle;kind.className='pot-device-kind';pageLabel.className='pot-textbook-page';
  const textbook=title.querySelector('button');textbook.className='pot-textbook-page pot-click-target';textbook.setAttribute('aria-label',pageLabel.textContent+' 본문 보기');textbook.replaceChildren(...pageLabel.childNodes);pageLabel.replaceWith(textbook);
  const context=document.createElement('div');context.className='pot-title-context';context.append(textbook,description);title.prepend(kind);header.replaceChildren(title,context);
 }
 static heading(root,d,onConcept){
  root.classList.add('device-explanation');
  if(!onConcept){const body=document.createElement('div');body.className='device-explanation-body';[...root.children].forEach(el=>{if(el.tagName==='H2')el.hidden=true;else body.append(el)});root.append(body);}
  const header=document.createElement('div');header.className='device-concept-header';
  header.innerHTML='<div class="device-concept-meta"><span></span><span></span></div><div class="device-concept-title"><h1></h1><span class="device-concept-subtitle"></span></div>';
  header.querySelector('.device-concept-meta span').textContent=d.type;header.querySelector('.device-concept-meta span:last-child').textContent=d.page?'교과서 '+d.page+'쪽':'';header.querySelector('h1').textContent=d.name;header.querySelector('.device-concept-subtitle').textContent=d.subtitle;
  if(onConcept){const button=document.createElement('button');button.type='button';button.setAttribute('aria-haspopup','dialog');button.textContent=d.concept;button.onclick=onConcept;header.querySelector('.device-concept-title').insertBefore(button,header.querySelector('.device-concept-subtitle'));}
  root.prepend(header);
  return header;
 }
 constructor({root,operation,pins,onNext,openPopup,closePopup,operationTriggers='[data-device-module]',pinTriggers='[data-device-pins]'}){
  this.root=root;root.classList.add('device-concept');this.phase=0;this.onNext=onNext;
  this.data=JSON.parse(document.getElementById('deviceConceptData')?.textContent||'null');
  this.pins=pins?.showModal?pins:null;
  if(openPopup){this.openPopup=openPopup;this.closePopup=closePopup;}
  else{this.execution=new EntryEngine.Execution(root,{operation,...(this.pins?{}:{pins})});this.openPopup=key=>{if(key==='pins'&&this.pins)this.pins.showModal();else this.execution.open(key)};this.closePopup=()=>{this.execution.close();if(this.pins?.open)this.pins.close()};}
  this.pins?.querySelector('[data-close-dialog]')?.addEventListener('click',()=>this.pins.close());
  if(!this.data){root.querySelector(operationTriggers)?.addEventListener('click',()=>this.open('operation'));root.querySelector(pinTriggers)?.addEventListener('click',()=>this.open('pins'));return;}
  const d=this.data;DeviceConcept.heading(root,d,()=>this.read(true));
  const firstLabel=document.querySelector('#slideSidebarList .slide-sidebar-item:first-child span:last-child');if(firstLabel)firstLabel.textContent=d.subtitle;
  document.querySelectorAll('[data-explanation-subtitle]').forEach(slide=>DeviceConcept.heading(slide,{type:d.type,name:d.name,page:slide.dataset.textbookPage||'',subtitle:slide.dataset.explanationSubtitle}));
  const overlay=document.createElement('section');overlay.className='device-concept-reading';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-label','교과서 '+d.page+'쪽 개념 설명');
  overlay.innerHTML='<button class="device-concept-close" aria-label="개념 설명 닫기">×</button><h2></h2><div class="device-concept-reading-grid"><article></article></div><aside class="device-concept-lesson" hidden aria-live="polite"></aside><button class="device-concept-explore-next" hidden>다음 설명 →</button>';
  overlay.querySelector('h2').textContent=d.name+' · 교과서 '+d.page+'쪽';overlay.querySelector('article').innerHTML=d.paragraphs.map(p=>'<p>'+p+'</p>').join('');root.append(overlay);this.reading=overlay;
  d.supplements?.forEach((extra,i)=>extra?.links?.forEach(phrase=>{
   const walker=document.createTreeWalker(overlay.querySelector('article'),NodeFilter.SHOW_TEXT);let text;
   while(text=walker.nextNode()){
    const start=text.textContent.indexOf(phrase);if(start<0)continue;
    if(text.parentElement.tagName==='MARK'&&text.textContent===phrase)text.parentElement.dataset.link=i+1;
    else{const match=text.splitText(start);match.splitText(phrase.length);const mark=document.createElement('mark');mark.dataset.key=i+1;mark.dataset.link=i+1;match.replaceWith(mark);mark.append(match)}
    break;
   }
  }));
  d.supplements?.forEach((extra,i)=>{
   if(!extra)return;
   const source=document.createElement('aside');source.className='device-concept-source';source.classList.toggle('source-left',extra.side==='left');source.setAttribute('aria-live','polite');
   if(extra.design)source.dataset.design=extra.design;
   const title=document.createElement('h3');
   if(extra.icon){const icon=document.createElement('img');icon.src=extra.icon;icon.alt=extra.title;title.append(icon)}
   else title.textContent='교과서 보조설명 · '+extra.title;
   source.append(title);
   if(extra.image){const image=document.createElement('img');image.src=extra.image;image.alt=extra.alt||extra.title;source.append(image)}
   extra.paragraphs.forEach((text,index)=>{const p=document.createElement('p');if(extra.accentParagraphs?.includes(index))p.classList.add('source-accent');DeviceConcept.emphasize(p,text,extra.highlights,i+1);source.append(p)});
   source.querySelectorAll('mark').forEach(mark=>mark.dataset.link=i+1);
   const article=overlay.querySelector('article'),link=article.querySelector('[data-link="'+(i+1)+'"]');
   article.insertBefore(source,link?.closest('p')||article.firstChild);
  });
  overlay.querySelector('.device-concept-close').onclick=()=>this.close();overlay.querySelector('.device-concept-explore-next').onclick=()=>this.next();
  root.querySelectorAll(pinTriggers).forEach(el=>{if(el.tagName!=='BUTTON'){el.setAttribute('role','button');el.tabIndex=0;el.style.cursor='pointer';el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();this.open('pins')}})}});
  const active=()=>root.classList.contains('active');
  document.addEventListener('click',e=>{
   if(!active())return;
   if(e.target.closest('#next,#mobileNext,#touchNext')){e.preventDefault();e.stopImmediatePropagation();this.next();}
   else if(e.target.closest('#prev,#mobilePrev,#touchPrev')){e.preventDefault();e.stopImmediatePropagation();this.prev();}
   else if(e.target.closest(operationTriggers)){e.preventDefault();e.stopImmediatePropagation();this.open('operation');}
   else if(e.target.closest(pinTriggers)){e.preventDefault();e.stopImmediatePropagation();this.open('pins');}
  },true);
  document.addEventListener('keydown',e=>{
   if(!active()||e.target.matches('input,textarea')||e.target.isContentEditable)return;
   const direction=window.lessonUI?.direction(e);
   if(direction){e.preventDefault();e.stopImmediatePropagation();direction>0?this.next():this.prev();}
   else if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();this.close();}
  },true);
  new MutationObserver(()=>{if(!active())this.close();else this.syncNav()}).observe(root,{attributes:true,attributeFilter:['class']});
 }
 syncNav(){if(!this.root.classList.contains('active'))return;const b=document.querySelector('#prev');if(b)b.disabled=this.phase===0&&!this.exploring;}
 open(key){this.close();this.openPopup(key);
  if(key==='operation'){
   this.operationLayouts=new Map();
   for(const popup of document.querySelectorAll('dialog[open],[role="dialog"]')){
    if(!popup.getClientRects().length||getComputedStyle(popup).visibility==='hidden')continue;
    this.operationLayouts.set(popup,popup.getAttribute('style'));popup.classList.add('device-operation-popup');
    for(const [name,value]of Object.entries({position:'fixed',inset:'12px 16px 12px calc(var(--lesson-left,0px) + 16px)',width:'calc(100% - var(--lesson-left,0px) - 32px)',height:'calc(100% - 24px)','max-width':'none','max-height':'none',margin:'0',transform:'none',overflow:'auto','box-sizing':'border-box'}))popup.style.setProperty(name,value,'important');
   }
  }
  this.syncNav();}
 read(free=false,index=0){this.close();this.exploring=free;this.readIndex=index;this.reading.hidden=false;this.reading.querySelector('.device-concept-explore-next').hidden=!free;this.highlight(index);this.syncNav();}
 highlight(index){const lesson=this.reading.querySelector('.device-concept-lesson');
  const note=this.data.noteDisplay?.[index-1]===false?'':this.data.notes[index-1]||'';lesson.hidden=!note;lesson.replaceChildren();if(note){const label=document.createElement('strong');label.textContent='수업용 핵심 설명';const p=document.createElement('p');DeviceConcept.emphasize(p,note,this.data.noteHighlights?.[index-1],index);lesson.append(label,p)}this.reading.querySelectorAll('mark').forEach(m=>{m.classList.toggle('past',+m.dataset.key<index);m.classList.toggle('current',+m.dataset.key===index);m.classList.toggle('connected',!!m.dataset.link||!!m.closest('.device-concept-source'))});
  requestAnimationFrame(()=>{
   if(this.reading.hidden||this.readIndex!==index)return;
   const grid=this.reading.querySelector('.device-concept-reading-grid'),target=this.reading.querySelector('article > p mark.current:not(.connected)')||this.reading.querySelector('article > p mark.current');
   if(!target){if(index===0)grid.scrollTo({top:0,behavior:'smooth'});return}
   const box=grid.getBoundingClientRect(),focus=target.getBoundingClientRect();
   if(focus.top<box.top||focus.bottom>box.bottom)grid.scrollTo({top:grid.scrollTop+focus.top-box.top-(box.height-focus.height)/2,behavior:'smooth'});
  });
 }
 render(){const count=this.data.notes.length;if(this.phase===0)this.close();else if(this.phase<=count+1)this.read(false,this.phase-1);else this.open(this.phase===count+2?'operation':'pins');this.syncNav();}
 next(){
  if(!this.data){if(this.phase===0){this.open('operation');this.phase=1}else if(this.phase===1){this.close();this.phase=2}else if(this.phase===2){this.open('pins');this.phase=3}else if(this.phase===3){this.close();this.phase=4}else{this.close();this.onNext()}return;}
  if(this.exploring){if(this.readIndex<this.data.notes.length)this.highlight(++this.readIndex);else this.close();return;}
  if(this.phase<this.data.notes.length+3){this.phase++;this.render()}else{this.close();this.onNext()}
 }
 prev(){if(!this.data){this.close();if(this.phase)this.phase--;if(this.phase===1)this.open('operation');if(this.phase===3)this.open('pins');return;}if(this.exploring){if(this.readIndex>0)this.highlight(--this.readIndex);else this.close();return;}this.phase=Math.max(0,this.phase-1);this.render();}
 close(){for(const [popup,style]of this.operationLayouts||[]){popup.classList.remove('device-operation-popup');if(style===null)popup.removeAttribute('style');else popup.setAttribute('style',style);}this.operationLayouts=null;if(this.reading)this.reading.hidden=true;this.exploring=false;this.closePopup();if(this.data)this.syncNav();}
};
DeviceConcept.sidebarIcons=Object.freeze({"개념설명":"<svg viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" stroke=\"#19254c\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14 27Q7 19 12 11Q17 3 26 9Q34 16 26 27Z\" fill=\"#ffe267\"/><path d=\"M16 28h10v5H16z\" fill=\"#8ea9d8\"/><path d=\"M18 24v-7l3 3 3-3v7M30 5l2-3M35 13l3-1M9 5L7 2\" stroke=\"#efaa22\"/></svg>","회로 연결":"<svg viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" stroke=\"#19254c\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"5\" y=\"7\" width=\"30\" height=\"26\" rx=\"4\" fill=\"#ffac42\"/><rect x=\"9\" y=\"11\" width=\"15\" height=\"11\" rx=\"2\" fill=\"#f6c47b\"/><rect x=\"11\" y=\"13\" width=\"11\" height=\"7\" rx=\"1\" fill=\"#385f7e\"/><rect x=\"28\" y=\"12\" width=\"4\" height=\"9\" rx=\"1\" fill=\"#5e748a\"/><path d=\"M10 27h20\" stroke=\"#8b5527\"/><circle cx=\"12\" cy=\"29\" r=\"1\" fill=\"#fff\"/><circle cx=\"18\" cy=\"29\" r=\"1\" fill=\"#fff\"/><circle cx=\"24\" cy=\"29\" r=\"1\" fill=\"#fff\"/><path d=\"M7 3v4m6-4v4m6-4v4m6-4v4m6-4v4M7 33v4m6-4v4m6-4v4m6-4v4m6-4v4\" stroke=\"#d18b38\"/></svg>","하드웨어 연결":"<svg viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" stroke=\"#19254c\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"7\" y=\"6\" width=\"26\" height=\"22\" rx=\"3\" fill=\"#b9dfff\"/><rect x=\"10\" y=\"9\" width=\"20\" height=\"16\" rx=\"1\" fill=\"#e8f5ff\"/><path d=\"M5 29h30l3 5H2Z\" fill=\"#9ab0cb\"/><path d=\"M16 31h8\" stroke=\"#516784\"/></svg>","코딩 전 설정":"<svg viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" stroke=\"#19254c\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M17 3h7l1 5 4 2 5-2 4 7-4 3v5l4 3-4 7-5-2-4 2-1 5h-7l-1-5-4-2-5 2-4-7 4-3v-5l-4-3 4-7 5 2 4-2Z\" fill=\"#b9a0ff\"/><circle cx=\"20.5\" cy=\"20.5\" r=\"7\" fill=\"#fff\"/></svg>","기본 코드":"<svg viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" stroke=\"#19254c\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 8h24q4 0 4 4v8H16l-5 5v-5H5Z\" fill=\"#b48dff\"/><path d=\"M5 23h21v12H5Z\" fill=\"#ffd65e\"/><circle cx=\"29\" cy=\"29\" r=\"8\" fill=\"#77dc80\"/></svg>","볼륨 크기 조절하기":"<svg viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" stroke=\"#19254c\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 16h8l10-8v25l-10-8H5Z\" fill=\"#b8a0ff\"/><path d=\"M28 14q8 6 0 13M32 9q13 11 0 23\" stroke=\"#7354e8\"/></svg>"});
})();

