# Synthetic OAuth/Sheets fixtures; no real Google account or student records.
import asyncio,threading,functools,json,copy,tempfile
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.async_api import async_playwright
class Q(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
root=str(Path(__file__).resolve().parents[5]);out=Path(tempfile.mkdtemp(prefix='project-google-test-'))
s=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Q,directory=root));threading.Thread(target=s.serve_forever,daemon=True).start()
async def main():
 async with async_playwright()as pw:
  b=await pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for width,height in [(1600,900),(1024,768)]:
   p=await b.new_page(viewport={'width':width,'height':height});errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
   await p.add_init_script("localStorage.setItem('phycom.google-settings.v1',JSON.stringify({clientId:'old.apps.googleusercontent.com',scriptId:'old-script'}))")
   decisions={'accept':False};p.on('dialog',lambda d:d.accept()if decisions['accept']else d.dismiss())
   store={};requests=[];fail={'save':False,'read':False};serial=0
   await p.route('https://accounts.google.com/gsi/client',lambda route:route.fulfill(content_type='text/javascript',body="window.google={accounts:{oauth2:{initTokenClient:opts=>{window.oauthClientId=opts.client_id;window.oauthScope=opts.scope;return {requestAccessToken:()=>opts.callback({access_token:'test-only-memory',expires_in:3600})}}}}};"))
   async def api(route):
    nonlocal serial
    assert route.request.url.endswith('/AKfycbyHDMkpSK41sBmlHtR_4H5LW2ML0vtcL2YOSaVZz4dEOI1baFmPcwjITFntNlsLc4NQ:run');body=route.request.post_data_json;req=body['parameters'][0];requests.append(copy.deepcopy(req));assert route.request.headers['authorization']=='Bearer test-only-memory'
    k=(req['year'],req['classId']);old=store.get(k,{'groups':[],'revision':'missing','spreadsheetId':None})
    if fail[req['action']]:await route.fulfill(status=503,body='Unavailable');return
    if req['action']=='save':
     if req['expectedRevision']!=old['revision']:
      await route.fulfill(json={'error':{'message':'revision conflict'}});return
     serial+=1;store[k]={'groups':copy.deepcopy(req['groups']),'revision':'revision-'+str(serial),'spreadsheetId':'test-spreadsheet'}
    await route.fulfill(json={'response':{'result':copy.deepcopy(store.get(k,old))}})
   await p.route('https://script.googleapis.com/v1/scripts/**',api)
   await p.goto(f'http://127.0.0.1:{s.server_port}/middle/phyCom/projects/activities/');await p.locator('#phycomStage').wait_for();f=await(await p.locator('#phycomStage').element_handle()).content_frame();await f.wait_for_function('window.ProjectGoogleSheets')
   await f.locator('[data-page-target=grouping]').click();await f.locator('#groupCount').fill('27')
   for role,n in [('producer',7),('engineer',6),('programmer',7),('designer',7)]:await f.locator('#roster-'+role).fill('\n'.join(role+str(i)for i in range(n)))
   await f.locator('#groupingForm [type=submit]').click();assert await f.locator('#groupResultRows tr').count()==7
   assert not requests,'disconnected app sent data'
   local=await f.evaluate('JSON.parse(sessionStorage.getItem("phycom.project-grouping.session.v1"))')
   await f.locator('#grouping [data-cloud-connect]').click()
   await f.wait_for_function("document.querySelector('#groupCloudStatus').textContent.includes('로컬 결과 유지')")
   assert await f.evaluate('JSON.parse(sessionStorage.getItem("phycom.project-grouping.session.v1")).groups')==local['groups']
   decisions['accept']=True;await f.locator('#grouping [data-cloud-save]').click();await f.wait_for_function("document.querySelector('#groupCloudStatus').textContent.includes('저장 성공')")
   assert await f.evaluate('window.oauthClientId')=='836304695634-8j5hndgbv7dcmicob4thu3qvsq0ihcpf.apps.googleusercontent.com';assert await f.evaluate('window.oauthScope')=='https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email'
   assert len(store[(2026,1)]['groups'])==7
   await f.locator('#viewGroupStatus').click();await f.wait_for_function("document.querySelector('#statusCloudStatus').textContent.includes('최신 데이터')")
   # Valid same-group primary-role swap; producer remains the engineer in the 3-person group.
   three=next(g for g in store[(2026,1)]['groups']if g['size']==3);row=f.locator('#groupRows tr').nth(three['number']-1);await row.locator('.google-role-edit').click()
   selects=f.locator('.google-form select');await selects.nth(0).select_option('programmer');await selects.nth(1).select_option('producer');await f.locator('.google-form [type=submit]').click();await f.wait_for_function("document.querySelector('#statusCloudStatus').textContent.includes('역할 변경 저장 성공')")
   changed=next(g for g in store[(2026,1)]['groups']if g['number']==three['number']);assert changed['roles']['producer']==three['roles']['programmer'];assert changed['sharedRoles']=={'engineer':'producer'}
   # Direct teacher edits are reflected on reload.
   store[(2026,1)]['groups'][0]['topic']='테스트 주제';store[(2026,1)]['groups'][0]['slidesUrl']='https://docs.google.com/presentation/d/example/edit';store[(2026,1)]['groups'][0]['slidesId']='example';store[(2026,1)]['revision']='manual-edit'
   await f.locator('#status [data-cloud-load]').click();await f.wait_for_function("document.querySelector('#statusCloudStatus').textContent.includes('최신 데이터')")
   assert '테스트 주제' in await f.locator('#groupRows').inner_text();assert await f.locator('#groupRows a').get_attribute('href')=='https://docs.google.com/presentation/d/example/edit'
   await p.screenshot(path=str(out/f'{width}-status.png'))
   # Class isolation / failed writes keep durable data and local session.
   first=copy.deepcopy(store[(2026,1)]);await f.locator('#classTabs button').nth(1).click();await f.wait_for_function("document.querySelector('#statusCloudStatus').textContent.includes('2반 Sheets 최신 데이터')");assert await f.locator('.activity-empty').is_visible();assert store[(2026,1)]==first
   await f.locator('[data-page-target=grouping]').click();await f.locator('#groupClass').select_option('1');await f.wait_for_function("document.querySelector('#groupCloudStatus').textContent.includes('최신 데이터')")
   fail['save']=True;await f.locator('#groupingForm [type=submit]').click();await f.wait_for_function("document.querySelector('#groupCloudStatus').textContent.includes('저장 실패')");assert store[(2026,1)]==first
   assert await f.locator('#groupResultRows tr').count()==7
   # Auth tokens are never persisted. Existing session data survives reload.
   values=await f.evaluate('Object.values(localStorage).join(" ")');assert 'test-only-memory'not in values
   await p.reload();f=await(await p.locator('#phycomStage').element_handle()).content_frame();await f.wait_for_function('window.ProjectGoogleSheets');await f.locator('[data-page-target=grouping]').click();assert await f.locator('#groupResultRows tr').count()==7
   device=await b.new_page(viewport={'width':width,'height':height});device.on('dialog',lambda d:d.accept())
   await device.route('https://accounts.google.com/gsi/client',lambda route:route.fulfill(content_type='text/javascript',body="window.google={accounts:{oauth2:{initTokenClient:opts=>{window.oauthClientId=opts.client_id;window.oauthScope=opts.scope;return {requestAccessToken:()=>opts.callback({access_token:'test-only-memory',expires_in:3600})}}}}};"))
   await device.route('https://script.googleapis.com/v1/scripts/**',api)
   await device.goto(f'http://127.0.0.1:{s.server_port}/middle/phyCom/projects/activities/');await device.locator('#phycomStage').wait_for();df=await(await device.locator('#phycomStage').element_handle()).content_frame();await df.wait_for_function('window.ProjectGoogleSheets')
   await df.locator('[data-page-target=status]').click();await df.locator('#status [data-cloud-connect]').click();await df.wait_for_function("document.querySelector('#statusCloudStatus').textContent.includes('최신 데이터')")
   assert await df.locator('#groupRows tr').count()==7
   await df.locator('[data-page-target=grouping]').click();await df.wait_for_function("document.querySelector('#groupCloudStatus').textContent.includes('최신 데이터')");assert await df.locator('#groupCount').input_value()=='27';assert await df.locator('#groupRosterFields textarea').evaluate_all("els=>els.reduce((n,e)=>n+e.value.split('\\n').filter(Boolean).length,0)")==27
   await df.locator('#groupCount').fill('28');old=await df.locator('#roster-producer').input_value();await df.locator('#roster-producer').fill(old+'\n추가학생');await df.locator('#groupingForm [type=submit]').click();assert await df.evaluate("ProjectActivitiesData.groups.filter(g=>g.year===2026&&g.classId===1).every(g=>g.size===4&&!g.sharedRoles)")
   await device.close()
   await f.locator('#grouping [data-cloud-connect]').click();await f.wait_for_function("document.querySelector('#groupCloudStatus').textContent.includes('최신 데이터')");await f.locator('#grouping [data-cloud-connect]').click();assert await f.locator('.google-form input').count()==0;await f.locator('.google-form button').filter(has_text='연결 해제').click();assert await f.locator('#groupResultRows tr').count()==7;assert await f.locator('#grouping [data-cloud-save]').is_disabled()
   assert not errors,errors
   print(width,'PASS: disconnected local flow, OAuth API bridge, conflict confirmation/migration, 3-person role swap, manual Sheets reload, class isolation, save failure, session restore, token-memory only',flush=True)
   await p.close()
  await b.close()
asyncio.run(main());s.shutdown()
