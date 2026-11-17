/* API executable only. No public doGet/doPost. All helpers are private. */
function projectStore(request){
 const properties=PropertiesService.getScriptProperties();
 const email=Session.getActiveUser().getEmail().toLowerCase();
 const allowed=JSON.parse(properties.getProperty('TEACHER_EMAILS')||'[]');
 if(!email||!Array.isArray(allowed)||!allowed.includes(email))throw Error('허용된 교사 계정만 이용할 수 있습니다.');
 const config=JSON.parse(properties.getProperty('SCHOOL_YEARS')||'{}');
 const year=Number(request?.year),classId=Number(request?.classId),classCount=Number(config[year]);
 if(!Number.isInteger(year)||!Number.isInteger(classId)||!Number.isInteger(classCount)||classCount<1||classCount>99||classId<1||classId>classCount)throw Error('서버의 학년도·학급 설정을 확인하세요.');
 if(request.classCount!==classCount)throw Error('웹교재와 서버의 학급 수 설정이 다릅니다.');
 if(request.action==='save'&&(!Array.isArray(request.groups)||!request.groups.length||typeof request.requestId!=='string'||!/^[\w-]{16,100}$/.test(request.requestId)))throw Error('저장 데이터와 요청 번호를 확인하세요.');
 if(!['read','save'].includes(request.action))throw Error('지원하지 않는 요청입니다.');
 const lock=LockService.getScriptLock();if(!lock.tryLock(15000))throw Error('다른 저장이 진행 중입니다. 잠시 후 다시 시도하세요.');
 try{
  const key='SPREADSHEET_'+year,record=JSON.parse(properties.getProperty(key)||'null');
  if(request.action==='read'&&!record)return{groups:[],revision:'missing',spreadsheetId:null};
  let book;
  if(record){
   if(!record.id)throw Error('파일 생성이 중단된 기록이 있습니다. 관리자가 기존 파일과 연결 정보를 확인해야 합니다. 새 파일은 생성하지 않았습니다.');
   book=SpreadsheetApp.openById(record.id); // Permission/missing-file errors never create a replacement.
   if(record.state!=='ready')throw Error('학년도 파일 초기화가 완료되지 않았습니다. 관리자가 연결 정보와 학급 탭을 확인하세요.');
  }else{
   const createYears=JSON.parse(properties.getProperty('CREATE_YEARS')||'[]');if(!Array.isArray(createYears)||!createYears.includes(year))throw Error('학년도 파일 연결 정보를 먼저 확인하세요. 관리자가 신규 생성을 허용하지 않았습니다.');
   if(request.expectedRevision!=='missing')throw Error('다른 기기의 데이터와 다릅니다. 다시 불러오세요.');
   ProjectSheetModel.validate(request.groups,year,classId);
   properties.setProperty(key,JSON.stringify({state:'creating',startedAt:new Date().toISOString()}));
   book=SpreadsheetApp.create(year+'학년도 피지컬 컴퓨팅 프로젝트 조편성');
   properties.setProperty(key,JSON.stringify({id:book.getId(),state:'initializing'}));
   book.getSheets()[0].setName('1반');
   for(let n=2;n<=classCount;n++)book.insertSheet(n+'반');
   for(const sheet of book.getSheets())sheet.getRange(1,1,1,10).setValues([ProjectSheetModel.headers]);
   SpreadsheetApp.flush();properties.setProperty(key,JSON.stringify({id:book.getId(),state:'ready'}));
  }
  const sheet=book.getSheetByName(classId+'반');if(!sheet)throw Error('해당 학급 탭이 없습니다. 기존 파일을 확인하세요.');
  const values=readClassValues_(book.getId(),classId);
  if(ProjectSheetModel.headers.some((name,i)=>values[0]?.[i]!==name))throw Error('시트의 첫 행 항목을 확인하세요.');
  const digest=value=>Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify(value)).map(n=>(n+256).toString(16).slice(-2)).join('');
  const revision=digest(values),stored=ProjectSheetModel.fromRows(values.slice(1),year,classId);
  if(request.action==='read')return{groups:stored,revision,spreadsheetId:book.getId()};
  const groups=ProjectSheetModel.validate(request.groups,year,classId);
  if(typeof request.requestId!=='string'||!/^[\w-]{16,100}$/.test(request.requestId))throw Error('저장 요청 번호를 확인하세요.');
  const payloadHash=digest(groups),previousId=values[0]?.[12],previousHash=values[1]?.[12];
  if(previousId===request.requestId){if(previousHash!==payloadHash)throw Error('같은 요청 번호의 내용이 다릅니다.');if(ProjectSheetModel.signature(stored)!==ProjectSheetModel.signature(groups))throw Error('저장 후 시트가 수정됐습니다. 다시 불러오세요.');return{groups:stored,revision,spreadsheetId:book.getId()};}
  // Newly provisioned empty sheets correspond to the initial "missing" revision.
  const justCreated=!record;
  if(request.expectedRevision!==revision&&!(justCreated&&request.expectedRevision==='missing'))throw Error('다른 교사 또는 시트에서 수정했습니다. 다시 불러온 뒤 저장하세요.');
  // Metadata can only move with an explicit confirmation, never disappear implicitly.
  ProjectSheetModel.mergeMetadata(groups,stored,number=>(request.confirmedGroups||[]).includes(number));
  const updated=new Date().toISOString(),data=[ProjectSheetModel.headers,...ProjectSheetModel.rows(groups,updated)];
  const cells=data.map(row=>({values:row.map(value=>({userEnteredValue:typeof value==='number'?{numberValue:value}:{stringValue:String(value)}}))}));
  const requiredRows=Math.max(data.length,2),requests=[];
  if(sheet.getMaxRows()<requiredRows)requests.push({appendDimension:{sheetId:sheet.getSheetId(),dimension:'ROWS',length:requiredRows-sheet.getMaxRows()}});
  requests.push({updateCells:{range:{sheetId:sheet.getSheetId(),startRowIndex:0,endRowIndex:Math.max(values.length,data.length),startColumnIndex:0,endColumnIndex:10},rows:cells,fields:'userEnteredValue'}});
  requests.push({updateCells:{start:{sheetId:sheet.getSheetId(),rowIndex:0,columnIndex:11},rows:[{values:[{userEnteredValue:{stringValue:'마지막 저장 요청'}},{userEnteredValue:{stringValue:request.requestId}}]},{values:[{userEnteredValue:{stringValue:'요청 내용 SHA256'}},{userEnteredValue:{stringValue:payloadHash}}]}],fields:'userEnteredValue'}});
  // One atomic Sheets request: failed writes cannot partially clear/replace a class.
  Sheets.Spreadsheets.batchUpdate({requests},book.getId());
  const result=readClassValues_(book.getId(),classId);
  return{groups,revision:digest(result),spreadsheetId:book.getId()};
 }finally{lock.releaseLock();}
}

function readClassValues_(spreadsheetId,classId){
 const values=Sheets.Spreadsheets.Values.get(spreadsheetId,"'"+classId+"반'!A:M",{valueRenderOption:'UNFORMATTED_VALUE'}).values||[];
 return values.map(row=>Array.from({length:13},(_,i)=>row[i]??''));
}
