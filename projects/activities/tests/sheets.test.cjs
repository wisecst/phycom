/* Synthetic fixtures only. Run: node tests/sheets.test.cjs */
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const dir=path.resolve(__dirname,'..'),M=require(path.join(dir,'sheets-model.js'));
const context={ProjectActivitiesData:{roles:M.roles.map((id,i)=>({id,name:M.names[i]}))},window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(dir,'grouping.js'),'utf8'),context);
const clone=x=>JSON.parse(JSON.stringify(x)),groups=n=>clone(context.window.ProjectGrouping.createGroups({year:2026,classId:1,count:n,raw:{producer:Array.from({length:n},(_,i)=>'학생'+(i+1)).join('\n')}}));
for(let n=24;n<=32;n++){
 const g=M.validate(groups(n),2026,1),back=M.fromRows(M.rows(g,'time'),2026,1);assert.equal(M.signature(g),M.signature(back));assert.equal(g.reduce((n,g)=>n+g.size,0),n);
}
assert.throws(()=>M.validate([{...groups(24)[0],size:5}],2026,1));
const double=groups(24);double[1].roles.producer[0]=double[0].roles.producer[0];assert.throws(()=>M.validate(double,2026,1));
assert.throws(()=>M.slideId('https://example.com/fake'));
for(const n of [27,28,29]){const g=M.validate(groups(n),2026,1).at(-1),before=M.members(g);[g.roles.producer,g.roles.programmer]=[g.roles.programmer,g.roles.producer];M.validate([g],2026,1);assert.equal(M.members(g),before);}

const properties=new Map([['TEACHER_EMAILS','["teacher@example.test"]'],['CREATE_YEARS','[2026,2027]'],['SCHOOL_YEARS','{"2026":13,"2027":2}']]),books=new Map();let created=0,failCreate=false,failWrite=false,email='teacher@example.test',locked=false;
class Sheet{
 constructor(name,id){this.name=name;this.id=id;this.values=[];this.maxRows=1000;}
 setName(name){this.name=name;return this;}
 getSheetId(){return this.id;}getMaxRows(){return this.maxRows;}
 getRange(){return{setValues:values=>{this.values=clone(values);}};}
 getDataRange(){return{getValues:()=>{const width=Math.max(1,...this.values.map(r=>r.length));return this.values.map(r=>Array.from({length:width},(_,i)=>r[i]??''));}};}
}
const env={ProjectSheetModel:M,PropertiesService:{getScriptProperties:()=>({getProperty:key=>properties.get(key)||null,setProperty:(key,value)=>properties.set(key,value)})},Session:{getActiveUser:()=>({getEmail:()=>email})},LockService:{getScriptLock:()=>({tryLock:()=>{if(locked)return false;locked=true;return true;},releaseLock:()=>{locked=false;}})},Utilities:{DigestAlgorithm:{SHA_256:1},computeDigest:(_algorithm,text)=>[...crypto.createHash('sha256').update(text).digest()]},SpreadsheetApp:{
 create:()=>{if(failCreate)throw Error('creation failed');const id='book-'+(++created),book={id,sheets:[new Sheet('Sheet1',1)],getId(){return id;},getSheets(){return this.sheets;},insertSheet(name){const s=new Sheet(name,this.sheets.length+1);this.sheets.push(s);return s;},getSheetByName(name){return this.sheets.find(s=>s.name===name);}};books.set(id,book);return book;},openById:id=>{if(!books.has(id))throw Error('missing file');return books.get(id);},flush:()=>{}},Sheets:{Spreadsheets:{Values:{get:(id,range)=>{const sheet=books.get(id).getSheetByName(range.match(/'(\d+반)'/)[1]);return {values:sheet.getDataRange().getValues()};}},batchUpdate:({requests},id)=>{
 if(failWrite)throw Error('atomic write failed');const book=books.get(id);
 for(const req of requests){
  if(req.appendDimension)continue;
  const u=req.updateCells,range=u.range||u.start,sheet=book.sheets.find(s=>s.id===range.sheetId),startRow=range.startRowIndex??range.rowIndex??0,startCol=range.startColumnIndex??range.columnIndex??0;
  if(u.range)for(let r=startRow;r<range.endRowIndex;r++){sheet.values[r]??=[];for(let c=startCol;c<range.endColumnIndex;c++)sheet.values[r][c]='';}
  u.rows.forEach((row,i)=>{sheet.values[startRow+i]??=[];row.values.forEach((cell,j)=>{const value=cell.userEnteredValue;sheet.values[startRow+i][startCol+j]=value.numberValue??value.stringValue;});});
 }
}}}};
vm.createContext(env);vm.runInContext(fs.readFileSync(path.join(dir,'apps-script/Code.gs'),'utf8'),env);
const run=request=>clone(env.projectStore({year:2026,classId:1,classCount:13,...request}));
assert.equal(run({action:'read'}).revision,'missing');assert.equal(created,0);
locked=true;assert.throws(()=>run({action:'read'}));locked=false;
let g=groups(27),request={action:'save',groups:g,expectedRevision:'missing',requestId:'request-00000000001'};
let first=run(request);assert.equal(created,1);assert.equal(books.get('book-1').sheets.length,13);
assert.equal(run(request).revision,first.revision);assert.equal(created,1);
assert.throws(()=>run({...request,groups:groups(28)}));
let read=run({action:'read'});assert.equal(M.signature(read.groups),M.signature(M.validate(g,2026,1)));
const other=groups(30).map(g=>({...g,classId:2}));run({classId:2,action:'save',groups:other,expectedRevision:run({classId:2,action:'read'}).revision,requestId:'request-00000000002'});
assert.equal(M.signature(run({action:'read'}).groups),M.signature(first.groups));assert.equal(created,1);
const book=books.get('book-1'),sheet=book.getSheetByName('1반');for(const row of sheet.values.slice(1))if(row[0]===1){row[4]='교사가 수정한 주제';row[7]='https://docs.google.com/presentation/d/example/edit';row[6]='example';}
assert.throws(()=>run({...request,requestId:'request-00000000003',expectedRevision:first.revision}));
read=run({action:'read'});assert.equal(read.groups[0].topic,'교사가 수정한 주제');
const fresh=clone(read.groups),a=fresh[0].roles.producer[0],b=fresh[1].roles.producer[0];fresh[0].roles.producer[0]=b;fresh[1].roles.producer[0]=a;
assert.throws(()=>run({action:'save',groups:fresh,expectedRevision:read.revision,requestId:'request-00000000004'}));
const confirmed=run({action:'save',groups:fresh,confirmedGroups:[1],expectedRevision:read.revision,requestId:'request-00000000004'});assert.equal(confirmed.groups[0].topic,'교사가 수정한 주제');assert.equal(confirmed.groups[0].slidesId,'example');
const saved=JSON.stringify(sheet.values);failWrite=true;assert.throws(()=>run({action:'save',groups:confirmed.groups,expectedRevision:confirmed.revision,requestId:'request-00000000005'}));assert.equal(JSON.stringify(sheet.values),saved);failWrite=false;
assert.throws(()=>run({action:'save',groups:confirmed.groups,expectedRevision:read.revision,requestId:'request-00000000006'}));
email='not-teacher@example.test';assert.throws(()=>run({action:'read'}));email='';assert.throws(()=>run({action:'read'}));email='teacher@example.test';
const yearGroups=groups(24).map(g=>({...g,year:2027}));run({year:2027,classCount:2,action:'save',groups:yearGroups,expectedRevision:'missing',requestId:'request-00000000007'});assert.equal(created,2);assert.equal(JSON.stringify(sheet.values),saved);
assert.throws(()=>run({classCount:12,action:'read'}));
properties.set('SPREADSHEET_2026',JSON.stringify({state:'creating'}));assert.throws(()=>run({action:'read'}));assert.throws(()=>run(request));assert.equal(created,2);
properties.set('SPREADSHEET_2026',JSON.stringify({id:'missing-id',state:'ready'}));assert.throws(()=>run(request));assert.equal(created,2);
console.log('PASS: 24–32 members/round-trip; 3/4/5 roles; teacher auth; one file/year; 13 tabs; class/year isolation; idempotency; revision conflicts; metadata confirmation; atomic failure; pending/missing-file fail closed.');
