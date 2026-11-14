/* Project data adapter. Shared Stage, lessonUI and lessonPages retain navigation mechanics. */
(()=>{'use strict';
const data=ProjectActivitiesData,pages=[...document.querySelectorAll('main.wrap>.slide')],list=document.getElementById('slideSidebarList'),previous=document.getElementById('prev'),next=document.getElementById('next'),dialog=document.getElementById('topicDialog');let page=0,selectedYear=data.years[0],selectedClass=data.classes[0]?.id,topicTrigger,worksheetShown=false;
for(const [i,slide]of pages.entries()){
 const button=document.createElement('button');button.type='button';button.className='slide-sidebar-item';button.dataset.pageTarget=slide.id;const number=document.createElement('span');number.className='sidebar-page-no';const title=document.createElement('span');title.textContent=slide.querySelector('h2').textContent;button.append(number,title);button.onclick=()=>show(i);list.append(button);
}
// Exact crops from physical-computing textbook PDF3, printed pp.125–126.
const worksheets={
 roles:{title:'우리 모둠을 소개합니다 · 교과서 125쪽',guide:'교과서 125쪽에 우리 모둠을 소개하는 내용을 기록해 봅시다.',images:[['worksheet-p125-group.png','교과서 125쪽 우리 모둠을 소개합니다 활동 영역']]},
 planning:{title:'우리가 제작할 작품을 소개합니다 · 교과서 125쪽',guide:'교과서 125쪽에 우리가 제작할 작품의 기획 내용을 기록해 봅시다.',images:[['worksheet-p125-planning.png','교과서 125쪽 우리가 제작할 작품을 소개합니다 활동 영역']]},
 evaluation:{title:'작업 내용 · 스스로 평가 · 교과서 126쪽',guide:'교과서 126쪽에 제작 과정을 기록하고 스스로 평가해 봅시다.',images:[['worksheet-p126-work.png','교과서 126쪽 작업 내용 기록 영역'],['worksheet-p126-evaluation.png','교과서 126쪽 스스로 평가 영역']]}
};
// Planning references use the existing dialog and page-local revealed links.
const planningReferences={
 examples:{kind:'planning-reference',title:'프로젝트 예시 보기',guide:'1. 작품명은 예시 프로젝트, 2. 제작 배경은 문제 상황 시나리오를 참고해요.',template:'planningExamplesTemplate'},
 exterior:{kind:'planning-reference',title:'작품 외형 예시 보기',guide:'작품 크기: 가로·세로·높이 각각 20cm 이하',images:[['planning-exterior.svg','서보 모터·LED 모듈·조도 센서·인체 감지 센서·온습도 센서·소리 감지 센서·오렌지보드의 원본 배치와 세 방향 20cm 이하 조건']]}
};
function openDetails(trigger,title,guide,worksheet){
 topicTrigger=trigger;dialog.dataset.content=worksheet?.kind||(worksheet?'worksheet':'topic');document.getElementById('topicTitle').textContent=title;dialog.querySelector('.lead').textContent=guide;dialog.querySelector('.topic-details').hidden=!!worksheet;
 const content=document.getElementById('worksheetContent');content.replaceChildren();content.hidden=!worksheet;
 if(worksheet?.template){content.dataset.layout='single';content.append(document.getElementById(worksheet.template).content.cloneNode(true));}
 else if(worksheet){content.dataset.layout=worksheet.images.length===2?'pair':'single';for(const [file,alt]of worksheet.images){const figure=document.createElement('figure'),image=document.createElement('img');image.src='assets/'+file;image.alt=alt;figure.append(image);content.append(figure);}}
 dialog.showModal();dialog.querySelector('button').focus();
}
function openWorksheet(id,trigger){const worksheet=worksheets[id];if(!worksheet)return;worksheetShown=true;openDetails(trigger,worksheet.title,worksheet.guide,worksheet);}
function openPlanningReference(key,trigger){const reference=planningReferences[key];if(!reference)return;openDetails(trigger,reference.title,reference.guide,reference);const table=dialog.querySelector('.planning-table-scroll');if(table)table.dataset.focus=trigger.dataset.referenceColumn||'';}
function move(direction){if(dialog.open&&dialog.dataset.content!=='topic'){dialog.close();return;}const id=pages[page].id;if(direction>0&&worksheets[id]&&!worksheetShown){openWorksheet(id,next);return;}if(direction>0&&id==='planning'){const pending=pages[page].querySelector('[data-planning-reference][hidden]');if(pending){const key=pending.dataset.planningReference;for(const button of pages[page].querySelectorAll('[data-planning-reference="'+key+'"]'))button.hidden=false;openPlanningReference(key,next);return;}}show(page+direction);}
for(const button of document.querySelectorAll('[data-worksheet],[data-planning-reference]'))button.onclick=()=>button.dataset.worksheet?openWorksheet(button.dataset.worksheet,button):openPlanningReference(button.dataset.planningReference,button);
function show(index){if(!pages[index])return;if(index!==page){worksheetShown=false;if(pages[index].id==='planning')for(const button of pages[index].querySelectorAll('[data-planning-reference]'))button.hidden=true;}if(page===7){const selection=grouping.selection;selectClass(selection.classId,selection.year);}dialog.close();page=index;pages.forEach((slide,i)=>slide.classList.toggle('active',i===index));[...list.children].forEach((button,i)=>{button.classList.toggle('active',i===index);if(i===index)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current')});previous.disabled=index===0;next.disabled=index===pages.length-1;document.body.classList.toggle('after-intro',index>0);lessonPages.refresh();if(index===7)grouping.select(selectedYear,selectedClass);if(index===8)selectClass(selectedClass,selectedYear);}
previous.onclick=()=>move(-1);next.onclick=()=>move(1);document.getElementById('fullscreenBtn').onclick=()=>lessonStage.toggleFullscreen();
document.addEventListener('keydown',event=>{if(dialog.open&&dialog.dataset.content==='topic'||event.target.closest('[role="tablist"]'))return;const direction=lessonUI.direction(event);if(direction){event.preventDefault();move(direction)}});
for(const role of data.roles){
 const card=document.querySelector('#roleCards [data-role="'+role.id+'"]');card.setAttribute('aria-description',role.description);card.title=role.focus;
 const record=document.createElement('li');const name=document.createElement('strong');name.textContent=role.name;record.append(name,document.createTextNode('내가 작업한 내용 기록'));document.getElementById('roleRecords').append(record);
 const header=document.createElement('th');header.scope='col';header.textContent=role.name;document.getElementById('groupHead').append(header);
}
for(const title of ['프로젝트 개요','Google 슬라이드']){const th=document.createElement('th');th.scope='col';th.textContent=title;document.getElementById('groupHead').append(th)}
for(const [name,question]of data.evaluation){const row=document.createElement('tr'),title=document.createElement('th'),text=document.createElement('td');title.scope='row';title.textContent=name;text.textContent=question;row.append(title,text);document.getElementById('evaluationRows').append(row)}
const tabs=document.getElementById('classTabs'),panel=document.getElementById('classPanel'),statusYear=document.getElementById('statusYear');
for(const year of data.years){const option=document.createElement('option');option.value=year;option.textContent=year+'학년도';statusYear.append(option);}
function renderClassTabs(){
 tabs.replaceChildren();const classes=data.classesForYear(selectedYear);tabs.style.setProperty('--activity-class-count',classes.length);
 for(const item of classes){
  const button=document.createElement('button');button.type='button';button.id='class-tab-'+item.id;button.dataset.classId=item.id;button.setAttribute('role','tab');button.setAttribute('aria-controls','classPanel');button.textContent=item.name;button.onclick=()=>selectClass(item.id);
  button.onkeydown=event=>{const buttons=[...tabs.children],i=buttons.indexOf(button);let n;if(event.key==='ArrowRight')n=(i+1)%buttons.length;else if(event.key==='ArrowLeft')n=(i+buttons.length-1)%buttons.length;else if(event.key==='Home')n=0;else if(event.key==='End')n=buttons.length-1;else return;event.preventDefault();event.stopPropagation();buttons[n].click();buttons[n].focus()};tabs.append(button);
 }
}
statusYear.onchange=()=>selectClass(1,Number(statusYear.value));
function selectClass(id,year=selectedYear){
 if(year!==selectedYear||!tabs.children.length){selectedYear=year;renderClassTabs();}const classes=data.classesForYear(selectedYear);selectedClass=classes.some(item=>item.id===id)?id:classes[0].id;statusYear.value=selectedYear;const item=classes.find(item=>item.id===selectedClass),groups=data.groups.filter(group=>group.classId===selectedClass&&(!group.year||group.year===selectedYear)).slice().sort((a,b)=>a.number-b.number);for(const button of tabs.children){const on=Number(button.dataset.classId)===selectedClass;button.setAttribute('aria-selected',String(on));button.tabIndex=on?0:-1;}panel.setAttribute('aria-labelledby','class-tab-'+selectedClass);const stale=grouping.isStale(selectedYear,selectedClass);document.getElementById('classCaption').textContent=item.name+' · 모둠별 프로젝트'+(stale?' · 이전 실행 결과':'');const summary=document.getElementById('classSummary');summary.classList.toggle('grouping-errors',stale);summary.textContent=(stale?'이전 실행 결과입니다. 현재 입력 기준으로 자동 조편성을 다시 실행하세요.\n':'')+(groups.length?item.name+' · '+groups.length+'개 모둠':item.name+' · 등록된 모둠 정보가 없습니다.');
 const rows=document.getElementById('groupRows');rows.replaceChildren();panel.scrollTop=0;
 if(!groups.length){const row=document.createElement('tr'),cell=document.createElement('td');cell.colSpan=8;cell.className='activity-empty';cell.append(document.createTextNode(item.name+'의 모둠 정보가 아직 없습니다.'));const help=document.createElement('p');help.textContent='조편성 결과와 프로젝트 자료를 연결하면 이곳에서 함께 확인합니다.';cell.append(help);row.append(cell);rows.append(row);return;}
 for(const group of groups){const row=document.createElement('tr');const values=[group.number+'조',group.topic||'미정',...data.roles.map(role=>ProjectGrouping.roleText(group,role.id)),group.overview||'개요 없음'];for(const value of values){const cell=document.createElement('td');cell.textContent=value;row.append(cell)}const linkCell=document.createElement('td');let url;try{url=new URL(group.slidesUrl)}catch{}if(url?.protocol==='https:'&&url.hostname==='docs.google.com'&&url.pathname.startsWith('/presentation/')){const link=document.createElement('a');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Google 슬라이드 열기';linkCell.append(link)}else linkCell.textContent='연결 없음';row.append(linkCell);rows.append(row)}
}
for(const button of document.querySelectorAll('#topicCards .activity-topic-card')){const names=button.dataset.topics.split(',').map(index=>data.topics[Number(index)]);button.onclick=()=>openDetails(button,button.querySelector('h3').textContent+' · 주제 탐색',names.join(' · ')+' 분야에서 해결하고 싶은 불편을 떠올려 봅시다.');}
dialog.querySelector('[data-close-topic]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>topicTrigger?.focus());lessonUI.bindOutside({key:'project-topic',isOpen:()=>dialog.open,inside:'#topicDialog .lesson-dialog-card',close:()=>dialog.close()});
const grouping=ProjectGrouping.mount({root:document.getElementById('grouping'),data,onResult:selection=>selectClass(selection.classId,selection.year),onView:()=>show(8)});selectedYear=grouping.selection.year;selectedClass=grouping.selection.classId;selectClass(selectedClass,selectedYear);const initial=pages.findIndex(slide=>'#'+slide.id===location.hash);show(initial<0?0:initial);
})();
