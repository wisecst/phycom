/* OAuth tokens remain in memory. No anonymous Web App endpoint or API key. */
(()=>{'use strict';
 const config=Object.freeze({clientId:'836304695634-8j5hndgbv7dcmicob4thu3qvsq0ihcpf.apps.googleusercontent.com',scriptId:'AKfycbyHDMkpSK41sBmlHtR_4H5LW2ML0vtcL2YOSaVZz4dEOI1baFmPcwjITFntNlsLc4NQ'});
 const M=ProjectSheetModel,scope='https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email';
 function mount({data,grouping,refreshStatus,selection}){
  const dialog=document.getElementById('topicDialog'),notes=[document.getElementById('groupCloudStatus'),document.getElementById('statusCloudStatus')];
  let token='',expires=0,connected=false,busy=false,authenticating=false,sequence=0,pending=null;
  const cache=new Map(),key=s=>s.year+':'+s.classId,copy=value=>JSON.parse(JSON.stringify(value));
  function status(message){for(const note of notes)note.textContent=message;}
  function controls(){for(const button of document.querySelectorAll('[data-cloud-save],[data-cloud-load]'))button.disabled=!connected||busy;for(const button of document.querySelectorAll('[data-cloud-connect]')){button.textContent=connected?'Google 연결 관리':'Google 연결';button.disabled=busy||authenticating||!!(gis&&!window.google?.accounts?.oauth2);}}
  function modal(title,guide,build,submit){
   if(dialog.open)dialog.close();dialog.dataset.content='google';document.getElementById('topicTitle').textContent=title;dialog.querySelector('.lead').textContent=guide;dialog.querySelector('.topic-details').hidden=true;
   const content=document.getElementById('worksheetContent');content.hidden=false;content.dataset.layout='single';content.replaceChildren();
   const form=document.createElement('form');form.className='google-form';build(form);const error=document.createElement('p');error.className='activity-note';error.setAttribute('role','alert');form.append(error);content.append(form);
   form.onsubmit=async event=>{event.preventDefault();const button=form.querySelector('[type=submit]');button.disabled=true;try{await submit(form);if(form.isConnected&&content.contains(form))dialog.close();}catch(e){error.textContent=e.message;}finally{button.disabled=false;}};
   dialog.showModal();return form;
  }
  let gis;
  function loadGIS(){if(window.google?.accounts?.oauth2)return Promise.resolve();if(gis)return gis;gis=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.onload=resolve;script.onerror=()=>{script.remove();gis=null;reject(Error('Google 로그인 라이브러리를 불러오지 못했습니다. 네트워크와 팝업 차단을 확인하세요.'));};document.head.append(script);});return gis;}
  function authenticate(){
   if(authenticating)return Promise.reject(Error('Google 인증이 진행 중입니다.'));authenticating=true;controls();
   // Always invoked from a button gesture after GIS is ready; tokens stay in memory.
   return new Promise((resolve,reject)=>{const client=google.accounts.oauth2.initTokenClient({client_id:config.clientId,scope,callback:response=>{
    if(response.error){reject(Error('Google 인증 실패: '+response.error));return;}
    token=response.access_token;expires=Date.now()+Number(response.expires_in)*1000-60000;connected=true;cache.clear();pending=null;sequence++;controls();status('교사 권한과 Sheets 데이터를 확인합니다.');resolve();setTimeout(()=>load(selection()),0);
   },error_callback:()=>reject(Error('로그인 팝업을 완료하지 못했습니다.'))});client.requestAccessToken({prompt:'consent'});}).finally(()=>{authenticating=false;controls();});
  }
  function configure(){
   if(busy){status('저장 완료 후 연결 설정을 변경하세요.');return;}
   if(!window.google?.accounts?.oauth2){prepareGIS();return;}
   if(!connected){authenticate().catch(error=>status(error.message));return;}
   modal('Google Sheets 연결 관리','교사 계정으로 연결되어 있습니다. 다른 계정으로 다시 연결하거나 현재 연결을 해제할 수 있습니다.',form=>{
    const button=document.createElement('button');button.type='submit';button.className='grouping-action';button.textContent='Google 계정으로 다시 연결';form.append(button);
    const disconnect=document.createElement('button');disconnect.type='button';disconnect.textContent='연결 해제';disconnect.className='grouping-action';disconnect.onclick=()=>{sequence++;token='';expires=0;connected=false;cache.clear();controls();status('Google 연결 해제 · 기존 로컬 결과는 보존됩니다.');dialog.close();refreshStatus();};form.append(disconnect);
   },authenticate);
  }
  function prepareGIS(){const loading=loadGIS();controls();loading.then(()=>{controls();}).catch(error=>{controls();status(error.message);});}
  async function call(action,s,extra={}){
   if(!connected||!token||Date.now()>=expires){connected=false;token='';controls();throw Error('Google 연결을 눌러 교사 계정으로 다시 인증하세요.');}
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
   try{
   const response=await fetch('https://script.googleapis.com/v1/scripts/'+encodeURIComponent(config.scriptId)+':run',{method:'POST',signal:controller.signal,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({function:'projectStore',parameters:[{action,year:s.year,classId:s.classId,classCount:data.classesForYear(s.year).length,...extra}]})});
   if(response.status===401){token='';connected=false;controls();}
   if(!response.ok)throw Error('Google API 요청 실패 ('+response.status+'). 계정·권한·API 배포 설정을 확인하세요.');
   const body=await response.json();if(body.error)throw Error(body.error.details?.[0]?.errorMessage||body.error.message||'Google 저장 오류');
   const result=body.response?.result;if(!result||typeof result.revision!=='string')throw Error('Google 응답을 확인할 수 없습니다. 성공으로 처리하지 않았습니다.');
   result.groups=M.validate(result.groups,s.year,s.classId);return result;
   }finally{clearTimeout(timer);}
  }
  async function load(s){
   if(!connected)return;if(busy){status('저장 중입니다. 완료 후 다시 불러오세요.');return;}const ticket=++sequence,localBefore=M.signature(grouping.getGroups(s));status(s.classId+'반 Sheets 불러오는 중…');
   try{
    const result=await call('read',s);if(ticket!==sequence)return;cache.set(key(s),result);
    const local=grouping.getGroups(s);
    if(M.signature(local)!==localBefore){status('불러오는 동안 로컬 결과가 변경됐습니다. 다시 불러오세요.');return;}
    if(local.length&&M.signature(local)!==M.signature(result.groups)){
     if(!confirm('Google Sheets와 현재 로컬 결과가 다릅니다. Sheets 결과로 화면을 갱신할까요? 취소하면 로컬 결과를 유지합니다. 로컬 결과를 이전하려면 현재 결과 저장을 누르세요.')){status('로컬 결과 유지 · Sheets와 다릅니다. 저장하려면 현재 결과 저장을 누르세요.');return;}
    }
    grouping.replaceClass(s,result.groups);refreshStatus();status(s.classId+'반 Sheets 최신 데이터 · '+result.groups.length+'개 모둠');
   }catch(error){if(ticket===sequence)status('불러오기 실패 · 기존 로컬 결과 유지: '+error.message);}
  }
  async function save(s,explicit=false,provided){
   if(!connected){status('로컬 결과만 저장됨 · Google 연결 후 현재 결과 저장으로 이전하세요.');return false;}
   if(busy){status('저장 중입니다. 완료 후 다시 시도하세요.');return false;}
   busy=true;sequence++;controls();const source=copy(provided||grouping.getGroups(s));
   try{
    if(!source.length)throw Error('저장할 조편성 결과가 없습니다.');
    if(explicit&&grouping.isStale(s.year,s.classId))throw Error('이전 실행 결과입니다. 현재 명단으로 다시 조편성하세요.');
    status(s.classId+'반 Sheets 저장 전 확인 중…');
    const known=cache.get(key(s)),remote=await call('read',s);if(known&&known.revision!==remote.revision)throw Error('Sheets가 마지막 조회 후 변경됐습니다. 다시 불러온 뒤 저장하세요.');if(!known&&remote.groups.length&&!explicit&&!confirm('Sheets에 기존 조편성이 있습니다. 현재 새 조편성으로 갱신할까요?'))throw Error('기존 Sheets 데이터 갱신을 취소했습니다.');cache.set(key(s),remote);
    if(explicit&&M.signature(source)!==M.signature(remote.groups)&&!confirm('현재 로컬 결과를 이 학급의 Sheets에 저장할까요? 다른 학급은 변경하지 않습니다.')){status('저장 취소 · 로컬과 Sheets 모두 유지');return false;}
    const confirmedGroups=[],merged=M.mergeMetadata(M.validate(source,s.year,s.classId),remote.groups,number=>{const ok=confirm(number+'조 구성이 변경됩니다. 기존 프로젝트 주제·개요·슬라이드를 같은 번호의 새 모둠에 연결할까요?');if(ok)confirmedGroups.push(number);return ok;});
    const payload={groups:merged,expectedRevision:remote.revision,confirmedGroups};
    const identity=JSON.stringify([key(s),payload]);
    if(pending?.identity!==identity)pending={identity,id:crypto.randomUUID()};
    const result=await call('save',s,{...payload,requestId:pending.id});cache.set(key(s),result);pending=null;
    const unchanged=M.signature(grouping.getGroups(s))===M.signature(source);if(unchanged){grouping.replaceClass(s,result.groups,{fresh:!grouping.isStale(s.year,s.classId)});refreshStatus();}
    status(s.classId+'반 Google Sheets 저장 성공'+(unchanged?'':' · 저장 중 변경된 로컬 결과는 아직 저장되지 않았습니다.'));return true;
   }catch(error){status('저장 실패 · 로컬 결과 유지, 다시 불러오거나 재시도하세요: '+error.message);return false;}
   finally{busy=false;controls();}
  }
  function editRoles(group){
   if(busy){status('저장 완료 후 역할을 변경하세요.');return;}
   if(!connected){status('역할을 변경하려면 Google 교사 계정으로 연결하세요.');return;}
   const s={year:group.year,classId:group.classId},snapshot=cache.get(key(s));if(!snapshot){status('최신 Sheets를 먼저 불러오세요.');return;}
   const original=snapshot.groups.find(g=>g.number===group.number);if(!original||M.signature([original])!==M.signature([group])){status('현재 화면이 Sheets와 다릅니다. 다시 불러오세요.');return;}
   const students=M.roles.flatMap(role=>group.roles[role].map(student=>({student,role}))),draft=copy(group);
   modal(group.number+'조 역할 변경','같은 모둠 안에서만 변경합니다. 3인 모둠은 프로듀서가 엔지니어를 겸임합니다.',form=>{
    students.forEach(({student,role},i)=>{const label=document.createElement('label'),select=document.createElement('select');label.textContent=student;select.name='role'+i;M.roles.forEach((id,n)=>{if(group.size===3&&id==='engineer')return;const option=document.createElement('option');option.value=id;option.textContent=M.names[n];select.append(option);});select.value=role;label.append(select);form.append(label);});const button=document.createElement('button');button.type='submit';button.className='grouping-action';button.textContent='역할 저장';form.append(button);
   },async form=>{
    draft.roles=Object.fromEntries(M.roles.map(r=>[r,[]]));draft.changes=[];
    students.forEach(({student,role},i)=>{const to=form.elements['role'+i].value;draft.roles[to].push(student);const from=group.changes?.find(c=>c.student===student)?.from||role;if(from!==to)draft.changes.push({student,from,to});});
    M.validate([draft],s.year,s.classId);
    // Use the version shown in this dialog: never silently apply to a newer group.
    const localBefore=M.signature(grouping.getGroups(s));busy=true;controls();sequence++;
    try{
     const result=await call('save',s,{groups:snapshot.groups.map(g=>g.number===draft.number?draft:g),expectedRevision:snapshot.revision,requestId:crypto.randomUUID()});cache.set(key(s),result);const unchanged=M.signature(grouping.getGroups(s))===localBefore;if(unchanged){grouping.replaceClass(s,result.groups,{fresh:!grouping.isStale(s.year,s.classId)});refreshStatus();}status(s.classId+'반 역할 변경 저장 성공'+(unchanged?'':' · 변경된 로컬 조편성은 아직 저장되지 않았습니다.'));
    }catch(error){status('역할 저장 실패 · 기존 데이터 유지: '+error.message);throw error;}
    finally{busy=false;controls();}
   });
  }
  document.querySelectorAll('[data-cloud-connect]').forEach(button=>button.onclick=configure);
  document.querySelectorAll('[data-cloud-save]').forEach(button=>button.onclick=()=>save(selection(),true));
  document.querySelectorAll('[data-cloud-load]').forEach(button=>button.onclick=()=>load(selection()));
  controls();status('Google 미연결 · 기존 결과는 현재 탭의 세션에 보관됩니다.');prepareGIS();
  return{load,save,editRoles,get connected(){return connected}};
 }
 window.ProjectGoogleSheets={mount};
})();
