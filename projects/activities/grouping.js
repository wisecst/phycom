/* Role-preference grouping with existing session drafts; optional teacher storage adapter. */
(()=>{'use strict';
const roles=ProjectActivitiesData.roles,roleName=id=>roles.find(role=>role.id===id)?.name||id;
function studentIdentity(label){
 const match=label.match(/^(\d+)\s*(?:번|[.)\-:])?\s*(.*)$/u);
 return{number:match?String(Number(match[1])):null,name:(match?match[2]:label).replace(/\s+/g,'').toLocaleLowerCase()};
}
function parseRosters(raw){
 const rosters=Object.fromEntries(roles.map(role=>[role.id,[]])),seen=[],errors=[];
 for(const role of roles){
  const lines=String(raw[role.id]||'').split(/[\n,;]+/).map(line=>line.normalize('NFKC').trim().replace(/\s+/g,' ')).filter(Boolean);
  for(const label of lines){
   const {number,name}=studentIdentity(label);
   if(!name||!/[\p{L}]/u.test(name)){errors.push(role.name+' 명단의 학생 이름을 확인하세요: '+label);continue;}
   const duplicate=seen.find(student=>number&&student.number===number||student.name===name&&(!number||!student.number));
   if(duplicate){errors.push('중복 학생: '+label+' ('+roleName(duplicate.role)+' / '+role.name+')');continue;}
   seen.push({number,name,role:role.id});rosters[role.id].push(label);
  }
 }
 return{rosters,count:seen.length,errors};
}
function draftFromGroups(groups){
 return{count:groups.length?String(groups.reduce((n,g)=>n+g.size,0)):'',raw:Object.fromEntries(roles.map(role=>[role.id,groups.flatMap(g=>roles.flatMap(assigned=>g.roles[assigned.id].filter(student=>(g.changes?.find(c=>c.student===student)?.from||assigned.id)===role.id))).join('\n')]))};
}
function draftMatchesGroups(draft,groups){
 const expected=draftFromGroups(groups),actual=parseRosters(draft.raw),saved=parseRosters(expected.raw);
 if(actual.errors.length||saved.errors.length||actual.count!==Number(expected.count)||draft.count&&Number(draft.count)!==actual.count)return false;
 const rosterKey=labels=>JSON.stringify(labels.map(label=>JSON.stringify(studentIdentity(label))).sort());
 return roles.every(({id})=>rosterKey(actual.rosters[id])===rosterKey(saved.rosters[id]));
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
function roleEntries(group,role){
 const shared=group.sharedRoles?.[role];
 return(group.roles?.[shared||role]||[]).map(student=>{
  const change=!shared&&group.changes?.find(change=>change.student===student&&change.to===role);
  return{student,note:shared?' ('+roleName(shared)+' 겸임)':change?' (희망: '+roleName(change.from)+')':''};
 });
}
function roleText(group,role){return roleEntries(group,role).map(({student,note})=>student+note).join('\n')||'명단 없음';}
function roleContent(group,role){
 const fragment=document.createDocumentFragment(),entries=roleEntries(group,role);
 if(!entries.length)fragment.append('명단 없음');
 for(const {student,note}of entries){
  const line=document.createElement('span'),name=document.createElement('span');line.className='group-student';name.className=group.leader===student?'group-student-name group-leader':'group-student-name';name.textContent=student;line.append(name,document.createTextNode(note));fragment.append(line);
 }
 return fragment;
}
function groupLink(group,verified){
 const name=group.number+'조';if(!(typeof verified==='function'?verified():verified)||!/^https:\/\/docs\.google\.com\/presentation\/d\/[\w-]+(?:[/?#]|$)/.test(group.slidesUrl||''))return document.createTextNode(name);
 const link=document.createElement('a');link.href=group.slidesUrl;link.target='_blank';link.rel='noopener noreferrer';link.textContent=name;link.setAttribute('aria-label',name+' Google 슬라이드 열기');link.onclick=event=>{if(typeof verified==='function'&&!verified())event.preventDefault()};return link;
}
function mount({root,data,onResult,onView,onSave,onSelection,verified=()=>false}){
 const form=root.querySelector('form'),yearInput=root.querySelector('#groupYear'),classInput=root.querySelector('#groupClass'),countInput=root.querySelector('#groupCount'),fields=root.querySelector('#groupRosterFields'),errorBox=root.querySelector('#groupErrors'),summary=root.querySelector('#groupSummary'),table=root.querySelector('#groupResultTable'),rows=root.querySelector('#groupResultRows'),changes=root.querySelector('#groupChanges'),viewButton=root.querySelector('#viewGroupStatus'),storageNote=root.querySelector('#groupStorageNote'),storageKey='phycom.project-grouping.session.v1';
 let saved={drafts:{},groups:[],selection:{year:data.years[0],classId:1}};
 try{const parsed=JSON.parse(sessionStorage.getItem(storageKey));if(parsed?.version===1&&parsed.drafts&&typeof parsed.drafts==='object'&&!Array.isArray(parsed.drafts)&&Array.isArray(parsed.groups))saved=parsed;}catch{}
 data.groups.splice(0,data.groups.length,...saved.groups);let selection={...saved.selection};
 const key=()=>selection.year+':'+selection.classId;
 const currentGroups=()=>data.groups.filter(group=>group.year===selection.year&&group.classId===selection.classId).slice().sort((a,b)=>a.number-b.number);
 function persist(){try{sessionStorage.setItem(storageKey,JSON.stringify({version:1,drafts:saved.drafts,groups:data.groups,selection}));}catch{(storageNote.querySelector('[role=status]')||storageNote).textContent='이 브라우저에서는 세션 저장이 제한되어 새로고침하면 명단과 결과가 사라집니다.';}}
 for(const year of data.years){const option=document.createElement('option');option.value=year;option.textContent=year+'학년도';yearInput.append(option);}
 for(const role of roles){
  const label=document.createElement('label');label.className='grouping-roster';const name=document.createElement('strong');name.textContent=role.name;const textarea=document.createElement('textarea');textarea.id='roster-'+role.id;textarea.name=role.id;textarea.rows=4;textarea.autocomplete='off';textarea.spellcheck=false;textarea.placeholder='한 줄에 한 명씩 입력';textarea.setAttribute('aria-describedby','groupRosterHelp');const total=document.createElement('output');total.dataset.rosterCount=role.id;label.append(name,textarea,total);fields.append(label);
 }
 function draft(){return saved.drafts[key()]||{count:'',raw:Object.fromEntries(roles.map(role=>[role.id,'']))};}
 function isStale(year=selection.year,classId=selection.classId){return data.groups.some(group=>group.year===year&&group.classId===classId)&&saved.drafts[year+':'+classId]?.resultStale!==false;}
 function updateDraft(){
  const previous=draft(),next={count:countInput.value,raw:Object.fromEntries(roles.map(role=>[role.id,form.elements[role.id].value]))};
  const changed=previous.count!==next.count||roles.some(role=>(previous.raw[role.id]||'')!==next.raw[role.id]);
  next.inputEdited=!!previous.inputEdited||changed;
  next.resultStale=!!currentGroups().length&&(previous.resultStale!==false||changed);saved.drafts[key()]=next;
  for(const role of roles){const raw=form.elements[role.id].value;root.querySelector('[data-roster-count="'+role.id+'"]').textContent=raw.split(/[\n,;]+/).filter(s=>s.trim()).length+'명';}persist();renderSummary();
 }
 function renderSummary(){
  const groups=currentGroups(),stale=isStale(),sizeCount=size=>groups.filter(group=>group.size===size).length;
  const text=groups.length?(stale?'이전 실행 결과입니다. 현재 입력 기준으로 자동 조편성을 다시 실행하세요.\n':'')+selection.year+'학년도 '+selection.classId+'반 · '+groups.length+'개 모둠 · '+groups.reduce((n,g)=>n+g.size,0)+'명 ('+[3,4,5].filter(size=>sizeCount(size)).map(size=>size+'인 '+sizeCount(size)+'개').join(', ')+') · 희망 역할 변경 '+groups.reduce((n,g)=>n+(g.changes?.length||0),0)+'명':'명단을 입력하고 자동 조편성을 실행하세요.';
  summary.classList.toggle('grouping-errors',stale);if(summary.textContent!==text)summary.textContent=text;
  table.setAttribute('aria-label',stale?'이전 조편성 결과 · 현재 입력으로 다시 실행 필요':'현재 조편성 결과');viewButton.textContent=stale?'이전 결과 현황 보기':'모둠 현황 보기';
 }
 function renderResult({clearError=true}={}){
  const groups=currentGroups();
  rows.replaceChildren();changes.replaceChildren();root.querySelector('.grouping-result-scroll').scrollTop=0;if(clearError)errorBox.hidden=true;viewButton.disabled=!groups.length;table.hidden=!groups.length;renderSummary();
  for(const group of groups){
   const row=document.createElement('tr');for(const text of [group.number+'조',group.size+'명',...roles.map(role=>roleText(group,role.id))]){const cell=document.createElement('td');if(!row.children.length)cell.append(groupLink(group,()=>verified(group)));else if(row.children.length>=2)cell.append(roleContent(group,roles[row.children.length-2].id));else cell.textContent=text;row.append(cell);}rows.append(row);
   for(const change of group.changes||[]){const li=document.createElement('li');li.textContent=group.number+'조 · '+change.student+' · '+roleName(change.from)+' → '+roleName(change.to);changes.append(li);}
  }
  const details=root.querySelector('#groupChangeDetails');details.hidden=!changes.children.length;details.open=!!changes.children.length;details.querySelector('summary').textContent='희망 역할 변경 '+changes.children.length+'명';
 }
 function choose(year,classId,notify=true){
  selection.year=data.years.includes(Number(year))?Number(year):data.years[0];const classes=data.classesForYear(selection.year);selection.classId=classes.some(item=>item.id===Number(classId))?Number(classId):classes[0].id;
  yearInput.value=selection.year;classInput.replaceChildren();for(const item of classes){const option=document.createElement('option');option.value=item.id;option.textContent=item.name;classInput.append(option);}classInput.value=selection.classId;
  const selected=draft();countInput.value=selected.count;for(const role of roles)form.elements[role.id].value=selected.raw[role.id]||'';updateDraft();renderResult();if(notify)onSelection?.({...selection});
 }
 form.addEventListener('input',updateDraft);yearInput.onchange=()=>choose(yearInput.value,1);classInput.onchange=()=>choose(yearInput.value,classInput.value);
 form.onsubmit=event=>{
  event.preventDefault();errorBox.hidden=true;
  try{
   const count=Number(countInput.value);if(!Number.isInteger(count)||count<3)throw Error('학급 전체 인원을 3명 이상의 정수로 입력하세요.');
   const previous=currentGroups(),groups=createGroups({...selection,count,raw:draft().raw}).map(group=>({...previous.find(old=>old.number===group.number),...group,sharedRoles:group.sharedRoles}));
   data.groups.splice(0,data.groups.length,...data.groups.filter(group=>group.year!==selection.year||group.classId!==selection.classId),...groups);saved.drafts[key()].resultStale=false;persist();renderResult();onResult({...selection});onSave?.({...selection});
  }catch(error){errorBox.textContent=error.message;errorBox.hidden=false;}
 };
 viewButton.onclick=()=>{onResult({...selection});onView();};choose(selection.year,selection.classId);
 function getGroups(s){return data.groups.filter(g=>g.year===s.year&&g.classId===s.classId).slice().sort((a,b)=>a.number-b.number);}
 function replaceClass(s,groups,{fresh=false}={}){
  ProjectSheetModel.validate(groups,s.year,s.classId);const hadResults=getGroups(s).length>0;
  data.groups.splice(0,data.groups.length,...data.groups.filter(g=>g.year!==s.year||g.classId!==s.classId),...groups);
  const draftKey=s.year+':'+s.classId;
  const oldDraft=saved.drafts[draftKey],fillDraft=!oldDraft||!hadResults&&!oldDraft.inputEdited&&!oldDraft.count&&roles.every(role=>!oldDraft.raw[role.id]);
  if(fillDraft)saved.drafts[draftKey]={...draftFromGroups(groups),resultStale:false};
  // A fresh result may differ from role preferences after assignment or a Sheets role edit.
  // Only an already-dirty input draft can make an incoming result stale.
  else if(fresh||groups.length)saved.drafts[draftKey].resultStale=!fresh&&oldDraft.resultStale!==false&&!draftMatchesGroups(oldDraft,groups);
  persist();
  if(selection.year===s.year&&selection.classId===s.classId){
   if(fillDraft){const next=draft();countInput.value=next.count;for(const role of roles)form.elements[role.id].value=next.raw[role.id];updateDraft();}
   renderResult({clearError:false});
  }
 }
 function getDraft(s=selection){const value=saved.drafts[s.year+':'+s.classId]||{count:'',raw:Object.fromEntries(roles.map(role=>[role.id,'']))};return ProjectSheetModel.validateDraft(value);}
 function replaceDraft(s,value){
  const next=ProjectSheetModel.validateDraft(value),draftKey=s.year+':'+s.classId,groups=getGroups(s);
  saved.drafts[draftKey]={...next,inputEdited:false,resultStale:!!groups.length&&!draftMatchesGroups(next,groups)};
  persist();if(selection.year===s.year&&selection.classId===s.classId)choose(s.year,s.classId,false);
 }
 return{refreshResults:()=>renderResult({clearError:false}),select:choose,isStale,getGroups,replaceClass,getDraft,replaceDraft,draftEdited:s=>!!saved.drafts[s.year+':'+s.classId]?.inputEdited,get selection(){return{...selection}}};
}
window.ProjectGrouping={parseRosters,groupSizes,createGroups,roleText,roleContent,groupLink,mount};
})();
