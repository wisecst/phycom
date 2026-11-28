/* OAuth tokens remain in memory. No anonymous Web App endpoint or API key. */
(()=>{'use strict';
 const config=Object.freeze({clientId:'836304695634-8j5hndgbv7dcmicob4thu3qvsq0ihcpf.apps.googleusercontent.com',scriptId:'AKfycbyHDMkpSK41sBmlHtR_4H5LW2ML0vtcL2YOSaVZz4dEOI1baFmPcwjITFntNlsLc4NQ'});
 const M=ProjectSheetModel,scope='https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/presentations';
 function mount({data,grouping,refreshStatus,selection,resultsOnly=false}){
  const dialog=document.getElementById('topicDialog'),notes=[document.getElementById('groupCloudStatus'),document.getElementById('statusCloudStatus')];
  let token='',expires=0,connected=false,busy=false,authenticating=false,sequence=0,pending=null,draftPending=null;
  const cache=new Map(),draftCache=new Map(),key=s=>s.year+':'+s.classId,copy=value=>JSON.parse(JSON.stringify(value));
  function status(message){for(const note of notes)note.textContent=message;}
  function sheetUrl(){
   if(!connected||!token||Date.now()>=expires)return '';
   const prefix=selection().year+':';
   for(const [classKey,result]of cache)if(classKey.startsWith(prefix)&&typeof result.spreadsheetId==='string'&&/^[\w-]+$/.test(result.spreadsheetId))return 'https://docs.google.com/spreadsheets/d/'+encodeURIComponent(result.spreadsheetId)+'/edit';
   return '';
  }
  function controls(){for(const button of document.querySelectorAll('[data-cloud-sheet]'))button.disabled=!sheetUrl();for(const button of document.querySelectorAll('[data-cloud-save],[data-cloud-load],[data-cloud-save-draft],[data-cloud-load-draft]'))button.disabled=!connected||busy;for(const button of document.querySelectorAll('[data-cloud-connect]')){button.textContent=connected?'Google 연결 관리':'Google 연결';button.disabled=busy||authenticating||!!(gis&&!window.google?.accounts?.oauth2);}}
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
    token=response.access_token;expires=Date.now()+Number(response.expires_in)*1000-60000;connected=true;cache.clear();draftCache.clear();draftPending=null;pending=null;sequence++;controls();status('교사 권한과 Sheets 데이터를 확인합니다.');resolve();setTimeout(()=>load(selection()),0);refreshStatus();
   },error_callback:()=>reject(Error('로그인 팝업을 완료하지 못했습니다.'))});client.requestAccessToken({prompt:'consent'});}).finally(()=>{authenticating=false;controls();});
  }
  function configure(){
   if(busy){status('저장 완료 후 연결 설정을 변경하세요.');return;}
   if(!window.google?.accounts?.oauth2){prepareGIS();return;}
   if(!connected){authenticate().catch(error=>status(error.message));return;}
   modal('Google Sheets 연결 관리','교사 계정으로 연결되어 있습니다. 다른 계정으로 다시 연결하거나 현재 연결을 해제할 수 있습니다.',form=>{
    const button=document.createElement('button');button.type='submit';button.className='grouping-action';button.textContent='Google 계정으로 다시 연결';form.append(button);
    const sync=document.createElement('button');sync.type='button';sync.className='grouping-action';sync.textContent='현재 학급 슬라이드 다시 연동';sync.onclick=async()=>{if(busy)return;const s=selection(),known=cache.get(key(s));if(!known){status('먼저 기존 결과를 다시 불러오세요.');return;}busy=true;const ticket=++sequence;controls();try{status(s.classId+'반 기존 Sheets 결과 유지'+await slideRequests(s,known,'syncSlides',ticket));}finally{busy=false;controls();}};form.append(sync);
    const disconnect=document.createElement('button');disconnect.type='button';disconnect.textContent='연결 해제';disconnect.className='grouping-action';disconnect.onclick=()=>{sequence++;token='';expires=0;connected=false;cache.clear();draftCache.clear();draftPending=null;controls();status('Google 연결 해제 · 기존 로컬 결과는 보존됩니다.');dialog.close();refreshStatus();};form.append(disconnect);
   },authenticate);
  }
  function prepareGIS(){const loading=loadGIS();controls();loading.then(()=>{controls();}).catch(error=>{controls();status(error.message);});}
  async function call(action,s,extra={}){
   if(!connected||!token||Date.now()>=expires){connected=false;token='';controls();throw Error('Google 연결을 눌러 교사 계정으로 다시 인증하세요.');}
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),['syncSlides','readSlideInfo'].includes(action)?45000:30000);
   try{
   const response=await fetch('https://script.googleapis.com/v1/scripts/'+encodeURIComponent(config.scriptId)+':run',{method:'POST',signal:controller.signal,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({function:'projectStore',parameters:[{action,year:s.year,classId:s.classId,classCount:data.classesForYear(s.year).length,...extra}]})});
   if(response.status===401){token='';connected=false;controls();}
   if(!response.ok)throw Error('Google API 요청 실패 ('+response.status+'). 계정·권한·API 배포 설정을 확인하세요.');
   const body=await response.json();if(body.error)throw Error(body.error.details?.[0]?.errorMessage||body.error.message||'Google 저장 오류');
   const result=body.response?.result;if(!result||typeof result.revision!=='string')throw Error('Google 응답을 확인할 수 없습니다. 성공으로 처리하지 않았습니다.');
   if(['readDraft','saveDraft'].includes(action)){if(!Object.hasOwn(result,'draft')||action==='saveDraft'&&result.draft===null)throw Error('입력 명단 응답을 확인하세요.');result.draft=result.draft===null?null:M.validateDraft(result.draft);}else result.groups=M.validate(result.groups,s.year,s.classId);return result;
   }finally{clearTimeout(timer);}
  }
  function mergeSlideResult(s,result){
   const prior=cache.get(key(s));
   for(const group of result.groups){const old=prior?.groups.find(g=>g.number===group.number);if(group.leader===undefined&&old&&M.signature([old])===M.signature([group]))group.leader=old.leader||'';}
   cache.set(key(s),copy(result));
   if(M.signature(grouping.getGroups(s))===M.signature(result.groups)||prior&&M.signature(grouping.getGroups(s))===M.signature(prior.groups)){grouping.replaceClass(s,result.groups,{fresh:!grouping.isStale(s.year,s.classId)});refreshStatus({results:false});}
  }
  async function slideRequests(s,snapshot,action,ticket){
   if(action==='readSlideInfo'){
    try{
     const result=await call(action,s,{expectedRevision:snapshot.revision});
     if(ticket!==sequence)return '';
     const states=result.slideState?.groups;
     if(!Array.isArray(states)||states.length!==result.groups.length||new Set(states.map(state=>state.groupNumber)).size!==states.length||result.groups.some(group=>!states.some(state=>state.groupNumber===group.number&&['matched','empty','mismatch','missingLink','failed'].includes(state.status)&&group.leaderStatus===state.status&&(state.status==='matched'?!!group.leader&&M.roles.some(role=>group.roles[role].includes(group.leader)):group.leader===''))))throw Error('학급별 조장 조회 응답을 확인하세요. 서버 API 버전을 확인하세요.');
     mergeSlideResult(s,result);
     const labels={empty:'조장 미입력',mismatch:'조장 명단 불일치',missingLink:'슬라이드 주소 없음',failed:'조장 조회 실패'};
     const issues=states.filter(state=>state.status!=='matched').map(state=>state.groupNumber+'조 '+labels[state.status]+(state.message?': '+state.message:''));
     return ' · 슬라이드 조장 조회 완료'+(issues.length?' · '+issues.join(' / '):'');
    }catch(error){return ' · 학급 조장 조회 실패: '+error.message;}
   }
   if(!snapshot.groups.length)return '';
   const prior=snapshot.slideState,resume=prior?.done===false&&Number.isInteger(prior.afterGroup)&&prior.afterGroup>0&&Array.isArray(prior.groups)&&prior.groups.length&&prior.groups.every(item=>item.ok===true);
   let afterGroup=resume?prior.afterGroup:0;const processed=resume?prior.groups.slice():[],issues=()=>processed.filter(item=>!item.ok).map(item=>item.groupNumber+'조 슬라이드 연동 실패: '+(item.message||'서버 응답을 확인하세요.'));
   while(true){
    if(ticket!==sequence)return '';
    try{
     const next=snapshot.groups.find(group=>group.number>afterGroup);
     const result=await call(action,s,{groupNumber:next.number,afterGroup,expectedRevision:snapshot.revision});
     if(ticket!==sequence)return '';
     // Older deployed APIs can still process the first requested group without a second loop/probe.
     if(!Array.isArray(result.slideState?.groups)&&result.slideState?.groupNumber===next.number&&typeof result.slideState.ok==='boolean'){
      const item=result.slideState;result.slideState={ok:item.ok,groups:[item],afterGroup:next.number,done:!result.groups.some(group=>group.number>next.number)};
     }
     const state=result.slideState,states=state?.groups,numbers=states?.map(item=>item.groupNumber);
     if(!Array.isArray(states)||typeof state.done!=='boolean'||!Number.isInteger(state.afterGroup)||states.some((item,index)=>typeof item.ok!=='boolean'||item.groupNumber<=(index?numbers[index-1]:afterGroup)||!result.groups.some(group=>group.number===item.groupNumber))||state.afterGroup!==(numbers.length?numbers[numbers.length-1]:afterGroup)||state.done===result.groups.some(group=>group.number>state.afterGroup)||!state.done&&!states.length)throw Error('슬라이드 연동 진행 응답을 확인하세요. 서버 API 버전을 확인하세요.');
     processed.push(...states);state.groups=processed.slice();state.ok=processed.every(item=>item.ok);
     mergeSlideResult(s,result);snapshot=result;afterGroup=state.afterGroup;
     if(state.done){const errors=issues();return errors.length?' · '+errors.join(' / '):' · 슬라이드 연동 완료';}
     status(s.classId+'반 Sheets 결과 유지 · 슬라이드 '+result.groups.filter(group=>group.number<=afterGroup).length+'/'+result.groups.length+'개 처리 중…');
    }catch(error){return ' · '+issues().concat('학급 슬라이드 연동 실패: '+error.message).join(' / ');}
   }
  }
  async function load(s){
   if(!connected)return;if(busy){status('저장 중입니다. 완료 후 다시 불러오세요.');return;}const ticket=++sequence,localBefore=M.signature(grouping.getGroups(s));status(s.classId+'반 Sheets 불러오는 중…');
   try{
    const result=await call('read',s);if(ticket!==sequence)return;
    if(resultsOnly&&key(s)!==key(selection())){status('학급 선택이 변경됐습니다. 다시 불러오기를 눌러주세요.');return;}
    cache.set(key(s),copy(result));controls();
    const local=grouping.getGroups(s);
    if(M.signature(local)!==localBefore){status('불러오는 동안 로컬 결과가 변경됐습니다. 다시 불러오세요.');return;}
    if(local.length&&M.signature(local)!==M.signature(result.groups)){
     const prompt='Google Sheets 결과로 현재 학급의 조편성 결과를 바꿀까요?';
     if(!confirm(prompt+(resultsOnly?' 현재 입력 명단은 유지됩니다.':' 로컬 결과를 먼저 이전하려면 현재 결과 저장을 누르세요.'))){status('현재 조편성 결과를 유지했습니다.');return;}
    }
    grouping.replaceClass(s,result.groups);refreshStatus({results:false});status(s.classId+'반 Sheets 최신 데이터 · '+result.groups.length+'개 모둠');
    const slideStatus=await slideRequests(s,result,'readSlideInfo',ticket);if(ticket===sequence)status(s.classId+'반 Sheets 최신 데이터 · '+result.groups.length+'개 모둠'+slideStatus);
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
    const known=cache.get(key(s)),remote=await call('read',s);if(known&&known.revision!==remote.revision)throw Error('Sheets가 마지막 조회 후 변경됐습니다. 다시 불러온 뒤 저장하세요.');if(!known&&remote.groups.length&&!explicit&&!confirm('Sheets에 기존 조편성이 있습니다. 현재 새 조편성으로 갱신할까요?'))throw Error('기존 Sheets 데이터 갱신을 취소했습니다.');cache.set(key(s),copy(remote));
    if(explicit&&M.signature(source)!==M.signature(remote.groups)&&!confirm('현재 로컬 결과를 이 학급의 Sheets에 저장할까요? 다른 학급은 변경하지 않습니다.')){status('저장 취소 · 로컬과 Sheets 모두 유지');return false;}
    const confirmedGroups=[],merged=M.mergeMetadata(M.validate(source,s.year,s.classId),remote.groups,number=>{const ok=confirm(number+'조 구성이 변경됩니다. 기존 프로젝트 주제·개요·슬라이드를 같은 번호의 새 모둠에 연결할까요?');if(ok)confirmedGroups.push(number);return ok;});
    const payload={groups:merged,expectedRevision:remote.revision,confirmedGroups};
    const identity=JSON.stringify([key(s),payload]);
    if(pending?.identity!==identity)pending={identity,id:crypto.randomUUID()};
    const result=await call('save',s,{...payload,requestId:pending.id});cache.set(key(s),copy(result));pending=null;
    const unchanged=M.signature(grouping.getGroups(s))===M.signature(source);if(unchanged){grouping.replaceClass(s,result.groups,{fresh:!grouping.isStale(s.year,s.classId)});refreshStatus({results:false});}
    const slideStatus=await slideRequests(s,result,'syncSlides',sequence);status(s.classId+'반 Google Sheets 저장 성공'+(unchanged?'':' · 저장 중 변경된 로컬 결과는 아직 저장되지 않았습니다.')+slideStatus);return true;
   }catch(error){status('저장 실패 · 로컬 결과 유지, 다시 불러오거나 재시도하세요: '+error.message);return false;}
   finally{busy=false;controls();}
  }
  async function loadDraft(){
   if(busy)return;const s=grouping.selection;busy=true;sequence++;controls();status(s.classId+'반 입력 명단 불러오는 중…');
   try{
    const result=await call('readDraft',s);if(key(grouping.selection)!==key(s))return;
    draftCache.set(key(s),result);
    if(!result.draft){status(s.classId+'반에 저장된 입력 명단이 없습니다. 현재 입력은 유지됩니다.');return;}
    const local=grouping.getDraft(s),different=JSON.stringify(local)!==JSON.stringify(result.draft),hasInput=!!local.count||M.roles.some(role=>local.raw[role]);
    if(different&&(hasInput||grouping.draftEdited(s))&&!confirm('저장하지 않은 입력 변경 사항이 있을 수 있습니다. 이 반의 저장된 입력 명단으로 덮어쓸까요? 조편성 결과는 변경하지 않습니다.')){status('입력 명단 불러오기 취소 · 현재 입력 유지');return;}
    grouping.replaceDraft(s,result.draft);status(s.classId+'반 입력 명단 불러오기 성공 · 조편성 결과 유지');
   }catch(error){status('입력 명단 불러오기 실패 · 현재 입력 유지: '+error.message);}
   finally{busy=false;controls();}
  }
  async function saveDraft(){
   if(busy)return;const s=grouping.selection;busy=true;sequence++;controls();status(s.classId+'반 입력 명단 저장 전 확인 중…');
   try{
    const source=grouping.getDraft(s);
    const known=draftCache.get(key(s)),remote=await call('readDraft',s);
    if(known&&known.revision!==remote.revision)throw Error('저장된 입력 명단이 변경됐습니다. 입력 명단을 다시 불러온 뒤 저장하세요.');
    if(!known&&remote.draft&&JSON.stringify(remote.draft)!==JSON.stringify(source)&&!confirm('이 반에 저장된 입력 명단이 있습니다. 현재 입력 명단으로 갱신할까요? 확정 조편성 결과는 유지됩니다.')){status('입력 명단 저장 취소 · 기존 데이터 유지');return;}
    const payload={draft:source,expectedRevision:remote.revision},identity=JSON.stringify([key(s),payload]);
    if(draftPending?.identity!==identity)draftPending={identity,id:crypto.randomUUID()};
    const result=await call('saveDraft',s,{...payload,requestId:draftPending.id});draftCache.set(key(s),result);draftPending=null;
    status(s.classId+'반 입력 명단 저장 성공'+(JSON.stringify(grouping.getDraft(s))!==JSON.stringify(source)?' · 저장 중 추가한 입력은 아직 저장되지 않았습니다.':''));
   }catch(error){status('입력 명단 저장 실패 · 현재 입력과 조편성 결과 유지: '+error.message);}
   finally{busy=false;controls();}
  }
  function editRoles(group){
   if(busy){status('저장 완료 후 역할을 변경하세요.');return;}
   if(!connected){status('역할을 변경하려면 Google 교사 계정으로 연결하세요.');return;}
   const s={year:group.year,classId:group.classId},snapshot=cache.get(key(s));if(!snapshot){status('최신 Sheets를 먼저 불러오세요.');return;}
   const original=snapshot.groups.find(g=>g.number===group.number);if(!original||M.signature([original])!==M.signature([group])){status('현재 화면이 Sheets와 다릅니다. 다시 불러오세요.');return;}
   const students=data.roles.flatMap(({id:role})=>group.roles[role].map(student=>({student,role}))),draft=copy(group);
   modal(group.number+'조 역할 변경','같은 모둠 안에서만 변경합니다. 3인 모둠은 프로듀서가 엔지니어를 겸임합니다.',form=>{
    students.forEach(({student,role},i)=>{const label=document.createElement('label'),select=document.createElement('select');label.textContent=student;select.name='role'+i;data.roles.forEach(({id,name})=>{if(group.size===3&&id==='engineer')return;const option=document.createElement('option');option.value=id;option.textContent=name;select.append(option);});select.value=role;label.append(select);form.append(label);});const button=document.createElement('button');button.type='submit';button.className='grouping-action';button.textContent='역할 저장';form.append(button);
   },async form=>{
    draft.roles=Object.fromEntries(M.roles.map(r=>[r,[]]));draft.changes=[];
    students.forEach(({student,role},i)=>{const to=form.elements['role'+i].value;draft.roles[to].push(student);const from=group.changes?.find(c=>c.student===student)?.from||role;if(from!==to)draft.changes.push({student,from,to});});
    M.validate([draft],s.year,s.classId);
    // Use the version shown in this dialog: never silently apply to a newer group.
    const localBefore=M.signature(grouping.getGroups(s));busy=true;controls();sequence++;
    try{
     const result=await call('save',s,{groups:snapshot.groups.map(g=>g.number===draft.number?draft:g),expectedRevision:snapshot.revision,requestId:crypto.randomUUID()});cache.set(key(s),copy(result));const unchanged=M.signature(grouping.getGroups(s))===localBefore;if(unchanged){grouping.replaceClass(s,result.groups,{fresh:!grouping.isStale(s.year,s.classId)});refreshStatus({results:false});}const slideStatus=await slideRequests(s,result,'syncSlides',sequence);status(s.classId+'반 역할 변경 저장 성공'+(unchanged?'':' · 변경된 로컬 조편성은 아직 저장되지 않았습니다.')+slideStatus);
    }catch(error){status('역할 저장 실패 · 기존 데이터 유지: '+error.message);throw error;}
    finally{busy=false;controls();}
   });
  }
  document.querySelectorAll('[data-cloud-sheet]').forEach(button=>button.onclick=()=>{const url=sheetUrl();if(url)window.open(url,'_blank','noopener,noreferrer');else controls();});
  document.querySelectorAll('[data-cloud-connect]').forEach(button=>button.onclick=configure);
  document.querySelectorAll('[data-cloud-save]').forEach(button=>button.onclick=()=>save(selection(),true));
  document.querySelectorAll('[data-cloud-load]').forEach(button=>button.onclick=()=>load(selection()));
  document.querySelectorAll('[data-cloud-save-draft]').forEach(button=>button.onclick=saveDraft);
  document.querySelectorAll('[data-cloud-load-draft]').forEach(button=>button.onclick=loadDraft);
  controls();status(resultsOnly?'Google 미연결':'Google 미연결 · 기존 결과는 현재 탭의 세션에 보관됩니다.');prepareGIS();
  return{load,save,editRoles,refreshControls:controls,verified:group=>connected&&Date.now()<expires&&!!cache.get(key(group))?.groups.some(stored=>stored.number===group.number&&M.signature([stored])===M.signature([group])),get connected(){return connected}};
 }
 window.ProjectGoogleSheets={mount};
})();
