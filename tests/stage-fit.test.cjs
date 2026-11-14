/* Run: node middle/phyCom/tests/stage-fit.test.cjs
   Geometry and mocked event tests; these are NOT browser layout measurements. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),geometry=require('../common/js/stage-geometry.js');
const code=fs.readFileSync(path.join(root,'common/js/stage-fit.js'),'utf8');
const viewports=[[1920,1080],[1600,900],[1366,768],[1363,936],[1280,720],[1024,768]];
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const within=(r,b)=>assert.ok(r.x>=b.x-1e-8&&r.y>=b.y-1e-8&&r.right<=b.right+1e-8&&r.bottom<=b.bottom+1e-8);
const rect=(x,y,width,height)=>({x,y,width,height,right:x+width,bottom:y+height});
const dc={wrap:rect(190,0,1410,900),slide:rect(206,12,1378,846),workspace:rect(206,12,1378,846),entry:rect(284,64,1300,794)};
function physical(r,m){return rect(m.x+r.x*m.scale,m.y+r.y*m.scale,r.width*m.scale,r.height*m.scale)}
for(const [w,h] of viewports){
 const m=geometry.fit(w,h);close(m.width/m.height,16/9);within(rect(m.x,m.y,m.width,m.height),rect(0,0,w,h));
 within(dc.workspace,dc.slide);within(dc.entry,dc.workspace);
 for(const r of Object.values(dc))within(physical(r,m),rect(0,0,w,h));
 // Sidebar, fullscreen button, page count and both navigation buttons.
 for(const r of [rect(0,0,190,900),rect(1546,14,40,40),rect(202,405,54,90),rect(1534,405,54,90)])within(physical(r,m),rect(0,0,w,h));
 console.log(`${w}x${h}: scale=${m.scale} Stage=${m.width}x${m.height} at ${m.x},${m.y} PASS (calculated)`);
}
for(const [w,h] of [[844,390],[1024,768],[1180,820]]){
 const safe={left:47,right:47,top:0,bottom:21},offset={left:3,top:5};const m=geometry.fit(w,h,safe,offset);
 within(rect(m.x,m.y,m.width,m.height),rect(m.availableX,m.availableY,m.availableWidth,m.availableHeight));
}
function events(){return {listeners:{},addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)},fire(type,event={}){for(const fn of this.listeners[type]||[])fn(event)}}}
function host(w,h,touch=0,screenSize=[1920,1080],module='dc-motor'){
 const frame=Object.assign(events(),{style:{},dataset:{},hidden:false,inert:false,contentDocument:{querySelector:()=>null},contentWindow:null});
 const notice={hidden:true},viewport={dataset:{}};const doc=Object.assign(events(),{currentScript:{src:'https://example.test/class/middle/phyCom/common/js/stage-fit.js'},documentElement:{requestFullscreen(){doc.fullscreenElement=this;doc.fire('fullscreenchange');return Promise.resolve()}},getElementById:id=>({phycomStage:frame,phycomViewport:viewport,phycomPortraitNotice:notice}[id]),exitFullscreen(){this.fullscreenElement=null;this.fire('fullscreenchange');return Promise.resolve()}});
 let tasks=[];const win=events();const v=Object.assign(events(),{width:w,height:h,offsetLeft:0,offsetTop:0});
 const ctx={document:doc,window:win,location:{href:`https://example.test/class/middle/phyCom/common/stage.html?lesson=${encodeURIComponent(`https://example.test/class/middle/phyCom/${module}/index.html?edit=1`)}`,origin:'https://example.test'},URL,history:{replaceState(){}},innerWidth:w,innerHeight:h,navigator:{maxTouchPoints:touch},screen:{width:screenSize[0],height:screenSize[1]},getComputedStyle:()=>({getPropertyValue:()=>0}),requestAnimationFrame:fn=>{tasks.push(fn);return tasks.length},cancelAnimationFrame(){},setTimeout:fn=>{tasks.push(fn)},Promise};
 Object.assign(win,{visualViewport:v,phycomStageGeometry:geometry});vm.runInNewContext(code,ctx);
 const flush=()=>{const pending=tasks;tasks=[];pending.forEach(fn=>fn())};return {frame,notice,doc,win,v,flush};
}
(async()=>{
 for(const module of ['led','buzzer','dc-motor','servo-motor']){
  const h=host(1363,936,0,[1920,1080],module);assert.ok(h.frame.src.endsWith(module+'/index.html?edit=1'));close(h.win.lessonStage.scale,.851875);assert.equal(h.frame.hidden,false);
  h.v.width=1920;h.v.height=1080;h.v.fire('resize');h.flush();close(h.win.lessonStage.scale,1.2);
  await h.win.lessonStage.toggleFullscreen();assert.ok(h.doc.fullscreenElement);close(h.win.lessonStage.scale,1.2);
  await h.win.lessonStage.toggleFullscreen();assert.equal(h.doc.fullscreenElement,null);
 }
 const phone=host(390,844,5,[390,844]);assert.equal(phone.notice.hidden,false);assert.equal(phone.frame.style.visibility,'hidden');assert.equal(phone.frame.inert,true);
 phone.v.width=844;phone.v.height=390;phone.win.fire('orientationchange');phone.flush();assert.equal(phone.notice.hidden,true);assert.equal(phone.frame.style.visibility,'visible');assert.equal(phone.frame.inert,false);
 phone.v.width=390;phone.v.height=844;phone.win.fire('orientationchange');phone.flush();assert.equal(phone.frame.style.visibility,'hidden');
 const tablet=host(768,1024,5,[768,1024]);assert.equal(tablet.frame.style.visibility,'visible');
 const h=host(1600,900);let key='';h.frame.contentWindow={document:{body:{dispatchEvent:e=>{key=e.key}}},KeyboardEvent:class {constructor(type,options){Object.assign(this,options)}}};
 h.doc.fire('keydown',{key:'ArrowRight',target:{closest:()=>null},preventDefault(){}});assert.equal(key,'ArrowRight');
 // Child class detection must include a non-last Entry page, and ignore number.
 let active={classList:{contains:c=>c==='entry-slide'}},entry=false,top='';
 const wrap={querySelector:s=>s.includes('header')?{getBoundingClientRect:()=>({bottom:100})}:active,getBoundingClientRect:()=>({top:0}),style:{getPropertyValue:()=>top,setProperty:(k,v)=>{top=v}}};
 let mutation;const childDoc=Object.assign(events(),{readyState:'complete',currentScript:{src:'https://example.test/class/middle/phyCom/common/js/stage-fit.js'},documentElement:{dataset:{}},body:{classList:{toggle:(c,on)=>{entry=on}}},getElementById:()=>null,querySelector:()=>wrap});
 const childWin=events();childWin.frameElement={hasAttribute:()=>true};const parent={lessonStage:{design:geometry.design,scale:.851875,toggleFullscreen:()=>Promise.resolve(),syncFullscreen(){},audit(){}}};
 vm.runInNewContext(code,{document:childDoc,window:childWin,parent,location:{origin:'https://example.test'},URL,MutationObserver:class{constructor(fn){mutation=fn}observe(){}},requestAnimationFrame:fn=>{fn();return 1},cancelAnimationFrame(){}});
 assert.equal(entry,true);assert.equal(top,'12px');
 active={classList:{contains:()=>false}};mutation();assert.equal(entry,false);assert.equal(top,'112px');
 for(const name of ['common/css/slides.css','common/css/motor-lesson.css','common/css/hardware-connect.css','buzzer/buzzer.css','led/page8.css']){
  const css=fs.readFileSync(path.join(root,name),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
  assert.ok(!/\d(?:dvh|svh|lvh|vw|vh|vmin|vmax)\b|:fullscreen|@media[^{}]*(?:width|height|orientation)/.test(css),`${name} retains viewport-responsive layout`);
 }
 // Exercise the runtime overflow audit against the known 102px regression.
 const overflowHost=host(1363,936);
 const clip={id:'slide',tagName:'SECTION',classList:[],parentElement:null,getBoundingClientRect:()=>rect(206,112,1141,782)};
 const workspace={id:'workspace',tagName:'DIV',classList:[],parentElement:clip,closest:()=>null,getBoundingClientRect:()=>rect(206,112,1141,884)};
 overflowHost.frame.getBoundingClientRect=()=>rect(0,84.65625,1363,766.6875);
 overflowHost.frame.contentDocument={querySelector:()=>null,querySelectorAll:()=>[workspace],defaultView:{getComputedStyle:el=>el===clip?{overflowX:'hidden',overflowY:'hidden'}:{visibility:'visible',opacity:'1'}}};
 assert.equal(overflowHost.win.lessonStage.audit().issues.length,1);
 clip.getBoundingClientRect=()=>dc.slide;workspace.getBoundingClientRect=()=>dc.workspace;
 const audit=overflowHost.win.lessonStage.audit();assert.equal(audit.issues.length,0);assert.equal(audit.stageFits,true);
 // An explicit intentional marker and an internally scrollable area are distinct.
 workspace.closest=()=>({});assert.equal(overflowHost.win.lessonStage.audit().issues.length,0);
 workspace.closest=()=>null;overflowHost.frame.contentDocument.defaultView.getComputedStyle=el=>el===clip?{overflowX:'auto',overflowY:'auto'}:{visibility:'visible',opacity:'1'};
 assert.equal(overflowHost.win.lessonStage.audit().scrollable.length,1);
 console.log('PASS: runtime overflow audit catches known clipping and distinguishes contained, intentional and scrollable elements (synthetic DOM).');
 console.log('PASS: all module routes, viewport/fullscreen, phone rotate round-trip, tablet, keyboard, non-last Entry detection and CSS constraints (mock/static).');
 console.log('DC4 1363x936 expected physical rects:',JSON.stringify(Object.fromEntries(Object.entries(dc).map(([name,r])=>[name,physical(r,geometry.fit(1363,936))]))));
})().catch(error=>{console.error(error);process.exitCode=1});
