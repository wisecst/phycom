/* Role-preference grouping. Student data stays in this tab's sessionStorage;
   no network requests, source records or cross-class allocation. */
(()=>{'use strict';
const roles=ProjectActivitiesData.roles,roleName=id=>roles.find(role=>role.id===id)?.name||id;
function parseRosters(raw){
 const rosters=Object.fromEntries(roles.map(role=>[role.id,[]])),seen=[],errors=[];
 for(const role of roles){
  const lines=String(raw[role.id]||'').split(/[\n,;]+/).map(line=>line.normalize('NFKC').trim().replace(/\s+/g,' ')).filter(Boolean);
  for(const label of lines){
   const match=label.match(/^(\d+)\s*(?:번|[.)\-:])?\s*(.*)$/u),number=match?String(Number(match[1])):null,name=(match?match[2]:label).replace(/\s+/g,'').toLocaleLowerCase();
   if(!name||!/[\p{L}]/u.test(name)){errors.push(role.name+' 명단의 학생 이름을 확인하세요: '+label);continue;}
   const duplicate=seen.find(student=>number&&student.number===number||student.name===name&&(!number||!student.number));
   if(duplicate){errors.push('중복 학생: '+label+' ('+roleName(duplicate.role)+' / '+role.name+')');continue;}
   seen.push({number,name,role:role.id});rosters[role.id].push(label);
  }
 }
 return{rosters,count:seen.length,errors};
}
function groupSizes(count){
 if(!Number.isInteger(count)||count<3)throw Error('학급 전체 인원을 3명 이상의 정수로 입력하세요.');
 const q=Math.floor(count/4),r=count%4;
 if(r===0)return Array(q).fill(4);
 if(r===1)return [...Array(q-1).fill(4),5];
 if(r===2){if(q<2)throw Error('이 인원은 지정한 3·4·5인 구성 규칙을 만족할 수 없습니다. 학급 인원을 확인하세요.');return [...Array(q-2).fill(4),5,5];}
 return [...Array(q).fill(4),3];
}
function shuffle(items,random){const result=items.slice();for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
function createGroups({year,classId,count,raw},random=Math.random){
 const parsed=parseRosters(raw);
 if(parsed.errors.length)throw Error(parsed.errors.join('\n'));
 if(parsed.count!==count)throw Error('학급 인원은 '+count+'명인데 명단에는 '+parsed.count+'명이 있습니다. 누락되거나 더 입력한 학생을 확인하세요.');
 const sizes=groupSizes(count),groups=sizes.map((size,i)=>({year,classId,number:i+1,size,roles:Object.fromEntries(roles.map(role=>[role.id,[]])),changes:[],...(size===3?{sharedRoles:{engineer:'producer'}}:{})}));
 const required=Object.fromEntries(roles.map(role=>[role.id,groups.length-(role.id==='engineer'&&sizes.includes(3)?1:0)])),extraRoles=new Map();
 // Each extra slot goes to a supported surplus role. This maximizes the number
 // of unchanged preferences before any shortage is filled from other pools.
 for(const group of groups.filter(group=>group.size===5)){
  const extra=shuffle(roles,random).reduce((best,role)=>parsed.rosters[role.id].length-required[role.id]>parsed.rosters[best.id].length-required[best.id]?role:best);
  extraRoles.set(group.number,extra.id);required[extra.id]++;
 }
 const slots=[];
 for(const group of groups)for(const role of roles){if(group.size===3&&role.id==='engineer')continue;for(let n=0;n<(extraRoles.get(group.number)===role.id?2:1);n++)slots.push({group,role:role.id,student:null});}
 const remaining=[];
 const assign=(slot,student,preferred)=>{slot.student=student;slot.group.roles[slot.role].push(student);if(slot.role!==preferred)slot.group.changes.push({student,from:preferred,to:slot.role});};
 for(const role of roles){
  const pool=shuffle(parsed.rosters[role.id],random),targets=shuffle(slots.filter(slot=>slot.role===role.id),random);
  while(pool.length&&targets.length)assign(targets.pop(),pool.pop(),role.id);
  pool.forEach(student=>remaining.push({student,preferred:role.id}));
 }
 const missing=shuffle(slots.filter(slot=>!slot.student),random),left=shuffle(remaining,random);
 missing.forEach((slot,i)=>assign(slot,left[i].student,left[i].preferred));
 return groups;
}
function roleText(group,role){
 const shared=group.sharedRoles?.[role];if(shared)return(group.roles[shared]||[]).join(', ')+' ('+roleName(shared)+' 겸임)';
 return(group.roles?.[role]||[]).map(student=>{const change=group.changes?.find(change=>change.student===student&&change.to===role);return student+(change?' (희망: '+roleName(change.from)+')':'');}).join('\n')||'명단 없음';
}
function mount({root,data,onResult,onView}){
 const form=root.querySelector('form'),yearInput=root.querySelector('#groupYear'),classInput=root.querySelector('#groupClass'),countInput=root.querySelector('#groupCount'),fields=root.querySelector('#groupRosterFields'),errorBox=root.querySelector('#groupErrors'),summary=root.querySelector('#groupSummary'),table=root.querySelector('#groupResultTable'),rows=root.querySelector('#groupResultRows'),changes=root.querySelector('#groupChanges'),viewButton=root.querySelector('#viewGroupStatus'),storageNote=root.querySelector('#groupStorageNote'),storageKey='phycom.project-grouping.session.v1';
 let saved={drafts:{},groups:[],selection:{year:data.years[0],classId:1}};
 try{const parsed=JSON.parse(sessionStorage.getItem(storageKey));if(parsed?.version===1&&parsed.drafts&&typeof parsed.drafts==='object'&&!Array.isArray(parsed.drafts)&&Array.isArray(parsed.groups))saved=parsed;}catch{}
 data.groups.splice(0,data.groups.length,...saved.groups);let selection={...saved.selection};
 const key=()=>selection.year+':'+selection.classId;
 const currentGroups=()=>data.groups.filter(group=>group.year===selection.year&&group.classId===selection.classId).slice().sort((a,b)=>a.number-b.number);
 function persist(){try{sessionStorage.setItem(storageKey,JSON.stringify({version:1,drafts:saved.drafts,groups:data.groups,selection}));}catch{storageNote.textContent='이 브라우저에서는 세션 저장이 제한되어 새로고침하면 명단과 결과가 사라집니다.';}}
 for(const year of data.years){const option=document.createElement('option');option.value=year;option.textContent=year+'학년도';yearInput.append(option);}
 for(const role of roles){
  const label=document.createElement('label');label.className='grouping-roster';const name=document.createElement('strong');name.textContent=role.name;const textarea=document.createElement('textarea');textarea.id='roster-'+role.id;textarea.name=role.id;textarea.rows=4;textarea.autocomplete='off';textarea.spellcheck=false;textarea.placeholder='한 줄에 한 명씩 입력';textarea.setAttribute('aria-describedby','groupRosterHelp');const total=document.createElement('output');total.dataset.rosterCount=role.id;label.append(name,textarea,total);fields.append(label);
 }
 function draft(){return saved.drafts[key()]||{count:'',raw:Object.fromEntries(roles.map(role=>[role.id,'']))};}
 function isStale(year=selection.year,classId=selection.classId){return data.groups.some(group=>group.year===year&&group.classId===classId)&&saved.drafts[year+':'+classId]?.resultStale!==false;}
 function updateDraft(){
  const previous=draft(),next={count:countInput.value,raw:Object.fromEntries(roles.map(role=>[role.id,form.elements[role.id].value]))};
  const changed=previous.count!==next.count||roles.some(role=>(previous.raw[role.id]||'')!==next.raw[role.id]);
  next.resultStale=!!currentGroups().length&&(previous.resultStale!==false||changed);saved.drafts[key()]=next;
  for(const role of roles){const raw=form.elements[role.id].value;root.querySelector('[data-roster-count="'+role.id+'"]').textContent=raw.split(/[\n,;]+/).filter(s=>s.trim()).length+'명';}persist();renderSummary();
 }
 function renderSummary(){
  const groups=currentGroups(),stale=isStale(),sizeCount=size=>groups.filter(group=>group.size===size).length;
  const text=groups.length?(stale?'이전 실행 결과입니다. 현재 입력 기준으로 자동 조편성을 다시 실행하세요.\n':'')+selection.year+'학년도 '+selection.classId+'반 · '+groups.length+'개 모둠 · '+groups.reduce((n,g)=>n+g.size,0)+'명 ('+[3,4,5].filter(size=>sizeCount(size)).map(size=>size+'인 '+sizeCount(size)+'개').join(', ')+') · 희망 역할 변경 '+groups.reduce((n,g)=>n+(g.changes?.length||0),0)+'명':'명단을 입력하고 자동 조편성을 실행하세요.';
  summary.classList.toggle('grouping-errors',stale);if(summary.textContent!==text)summary.textContent=text;
  table.setAttribute('aria-label',stale?'이전 조편성 결과 · 현재 입력으로 다시 실행 필요':'현재 조편성 결과');viewButton.textContent=stale?'이전 결과 현황 보기':'모둠 현황 보기';
 }
 function renderResult(){
  const groups=currentGroups();
  rows.replaceChildren();changes.replaceChildren();root.querySelector('.grouping-result-scroll').scrollTop=0;errorBox.hidden=true;viewButton.disabled=!groups.length;table.hidden=!groups.length;renderSummary();
  for(const group of groups){
   const row=document.createElement('tr');for(const text of [group.number+'조',group.size+'명',...roles.map(role=>roleText(group,role.id))]){const cell=document.createElement('td');cell.textContent=text;row.append(cell);}rows.append(row);
   for(const change of group.changes||[]){const li=document.createElement('li');li.textContent=group.number+'조 · '+change.student+' · '+roleName(change.from)+' → '+roleName(change.to);changes.append(li);}
  }
  const details=root.querySelector('#groupChangeDetails');details.hidden=!changes.children.length;details.open=!!changes.children.length;details.querySelector('summary').textContent='희망 역할 변경 '+changes.children.length+'명';
 }
 function choose(year,classId){
  selection.year=data.years.includes(Number(year))?Number(year):data.years[0];const classes=data.classesForYear(selection.year);selection.classId=classes.some(item=>item.id===Number(classId))?Number(classId):classes[0].id;
  yearInput.value=selection.year;classInput.replaceChildren();for(const item of classes){const option=document.createElement('option');option.value=item.id;option.textContent=item.name;classInput.append(option);}classInput.value=selection.classId;
  const selected=draft();countInput.value=selected.count;for(const role of roles)form.elements[role.id].value=selected.raw[role.id]||'';updateDraft();renderResult();
 }
 form.addEventListener('input',updateDraft);yearInput.onchange=()=>choose(yearInput.value,1);classInput.onchange=()=>choose(yearInput.value,classInput.value);
 form.onsubmit=event=>{
  event.preventDefault();errorBox.hidden=true;
  try{
   const count=Number(countInput.value);if(!Number.isInteger(count)||count<3)throw Error('학급 전체 인원을 3명 이상의 정수로 입력하세요.');
   const previous=currentGroups(),groups=createGroups({...selection,count,raw:draft().raw}).map(group=>({...previous.find(old=>old.number===group.number),...group}));
   data.groups.splice(0,data.groups.length,...data.groups.filter(group=>group.year!==selection.year||group.classId!==selection.classId),...groups);saved.drafts[key()].resultStale=false;persist();renderResult();onResult({...selection});
  }catch(error){errorBox.textContent=error.message;errorBox.hidden=false;}
 };
 viewButton.onclick=()=>{onResult({...selection});onView();};choose(selection.year,selection.classId);
 return{select:choose,isStale,get selection(){return{...selection}}};
}
window.ProjectGrouping={parseRosters,groupSizes,createGroups,roleText,mount};
})();
