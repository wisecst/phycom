/* Shared validation for the browser and Apps Script (copy as Model.gs). */
var ProjectSheetModel=(()=>{
 'use strict';
 const roles=['producer','engineer','programmer','designer'];
 const names=['프로듀서','엔지니어','프로그래머','디자이너'];
 const roleId=value=>roles.includes(value)?value:roles[names.indexOf(value)];
 const headers=['모둠 번호','학생 이름','배정 역할','겸임 역할','프로젝트 주제','프로젝트 개요','Google 슬라이드 ID','Google 슬라이드 URL','최종 수정 시각','희망 역할'];
 const text=value=>String(value??'').trim();
 function slideId(url){if(!url)return '';const match=String(url).match(/^https:\/\/docs\.google\.com\/presentation\/d\/([\w-]+)(?:[/?#]|$)/);if(!match)throw Error('Google 슬라이드 URL을 확인하세요.');return match[1];}
 function validate(groups,year,classId){
  if(!Array.isArray(groups)||groups.length>30)throw Error('모둠 데이터를 확인하세요.');
  const seen=[],numbers=new Set();
  return groups.map(source=>{
   const group=JSON.parse(JSON.stringify(source));
   if(group.year!==year||group.classId!==classId||!Number.isInteger(group.number)||group.number<1||numbers.has(group.number))throw Error('학년도·학급·모둠 번호를 확인하세요.');
   numbers.add(group.number);let size=0;
   for(const role of roles){
    if(!Array.isArray(group.roles?.[role]))throw Error('역할 명단을 확인하세요.');
    for(const label of group.roles[role]){
     if(typeof label!=='string'||!label.trim()||label.length>100)throw Error('학생 이름을 확인하세요.');
     const normalized=label.normalize('NFKC').trim().replace(/\s+/g,' '),m=normalized.match(/^(\d+)\s*(?:번|[.)\-:])?\s*(.*)$/u),number=m?String(Number(m[1])):null,name=(m?m[2]:normalized).replace(/\s+/g,'').toLocaleLowerCase();
     if(!name||!/[\p{L}]/u.test(name)||seen.some(old=>number&&old.number===number||old.name===name&&(!number||!old.number)))throw Error('학생 중복 또는 빈 이름이 있습니다.');
     seen.push({number,name});size++;
    }
   }
   const counts=roles.map(role=>group.roles[role].length);
   if(size===3){if(counts.join(',')!=='1,0,1,1'||group.sharedRoles?.engineer!=='producer'||Object.keys(group.sharedRoles).length!==1)throw Error('3인 모둠은 프로듀서가 엔지니어를 겸임해야 합니다.');}
   else if(size===4||size===5){if(counts.some(n=>n<1||n>2)||counts.filter(n=>n===2).length!==size-4||Object.keys(group.sharedRoles||{}).length)throw Error('4·5인 모둠의 역할 구성을 확인하세요.');}
   else throw Error('모둠은 3·4·5인만 가능합니다.');
   if(group.size!==size)throw Error('모둠 인원과 명단이 다릅니다.');
   for(const field of ['topic','overview','slidesId','slidesUrl']){group[field]=text(group[field]);if(group[field].length>(field==='overview'?5000:1000))throw Error('프로젝트 정보가 너무 깁니다.');}
   const id=slideId(group.slidesUrl);if(group.slidesId&&id&&group.slidesId!==id)throw Error('슬라이드 ID와 URL이 다릅니다.');group.slidesId=group.slidesId||id;
   group.changes=(group.changes||[]).filter(c=>roles.includes(c.from)&&roles.includes(c.to)&&group.roles[c.to].includes(c.student)&&c.from!==c.to);
   return group;
  }).sort((a,b)=>a.number-b.number);
 }
 function rows(groups,updated){return groups.flatMap(g=>roles.flatMap((role,i)=>g.roles[role].map(student=>[g.number,student,names[i],g.sharedRoles?.engineer===role?'엔지니어':'',g.topic||'',g.overview||'',g.slidesId||'',g.slidesUrl||'',updated,names[roles.indexOf(g.changes?.find(c=>c.student===student&&c.to===role)?.from||role)]])));}
 function fromRows(values,year,classId){
  const groups=new Map();
  for(const row of values){
   if(row.slice(0,10).every(value=>value===''||value==null))continue;
   const number=Number(row[0]),student=text(row[1]),role=roleId(text(row[2])),shared=text(row[3]);
   if(!role)throw Error('시트의 배정 역할을 확인하세요.');
   const metadata={topic:text(row[4]),overview:text(row[5]),slidesId:text(row[6]),slidesUrl:text(row[7])};
   if(!groups.has(number))groups.set(number,{year,classId,number,size:0,roles:Object.fromEntries(roles.map(r=>[r,[]])),changes:[],...metadata});
   const g=groups.get(number);if(Object.keys(metadata).some(k=>metadata[k]!==g[k]))throw Error('같은 모둠의 프로젝트 정보가 서로 다릅니다.');
   g.roles[role].push(student);g.size++;if(shared){if(role!=='producer'||roleId(shared)!=='engineer')throw Error('겸임 역할을 확인하세요.');g.sharedRoles={engineer:'producer'};}
   const preferred=roleId(text(row[9]));if(row[9]&&!preferred)throw Error('희망 역할을 확인하세요.');if(preferred&&preferred!==role)g.changes.push({student,from:preferred,to:role});
  }
  return validate([...groups.values()],year,classId);
 }
 const members=g=>roles.flatMap(role=>g.roles[role]).slice().sort().join('\n');
 function validateDraft(value){
  if(!value||typeof value!=='object'||typeof value.count!=='string'||value.count.length>64||!value.raw||typeof value.raw!=='object')throw Error('입력 명단 형식을 확인하세요.');
  const raw={};for(const role of roles){if(typeof value.raw[role]!=='string'||value.raw[role].length>45000)throw Error('역할별 입력 명단 형식을 확인하세요.');raw[role]=value.raw[role];}
  return{count:value.count,raw};
 }
 const signature=groups=>JSON.stringify(groups.map(g=>({number:g.number,roles:Object.fromEntries(roles.map(role=>[role,g.roles[role]])),sharedRoles:Object.fromEntries(roles.filter(role=>g.sharedRoles?.[role]).map(role=>[role,g.sharedRoles[role]])),topic:g.topic||'',overview:g.overview||'',slidesId:g.slidesId||'',slidesUrl:g.slidesUrl||''})).sort((a,b)=>a.number-b.number));
 function mergeMetadata(candidate,stored,confirmChange){
  for(const old of stored){
   const next=candidate.find(g=>g.number===old.number),hasInfo=['topic','overview','slidesId','slidesUrl'].some(k=>old[k]);
   if(!next&&hasInfo)throw Error('프로젝트 정보가 있는 '+old.number+'조를 삭제할 수 없습니다. 시트에서 연결 정보를 먼저 정리하세요.');
   if(next){if(hasInfo&&members(next)!==members(old)&&!confirmChange(old.number))throw Error('모둠 구성 변경에 따른 연결 정보 이전을 취소했습니다.');for(const k of ['topic','overview','slidesId','slidesUrl'])next[k]=old[k]||'';}
  }
  return candidate;
 }
 return{roles,names,headers,roleId,slideId,validate,validateDraft,rows,fromRows,members,signature,mergeMetadata};
})();
if(typeof module!=='undefined')module.exports=ProjectSheetModel;
