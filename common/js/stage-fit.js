/* One browsing-context Stage for desktop, tablet and phone. Native dialog,
   fixed overlays, SVG, audio gestures and lesson coordinates stay in this
   context; only the host applies the physical viewport transform. */
(()=>{
 'use strict';
 const scriptURL=new URL(document.currentScript.src),base=new URL('../../',scriptURL);
 const routes=window.phycomNavigation?.lessons||[{id:'led',path:'led/'},{id:'buzzer',path:'buzzer/'},{id:'dc-motor',path:'dc-motor/'},{id:'servo-motor',path:'servo-motor/'}];
 const validLesson=url=>url.origin===location.origin&&routes.some(m=>url.pathname===base.pathname+m.path||url.pathname===base.pathname+m.path+'index.html');
 const frame=document.getElementById('phycomStage');
 if(!frame){
  const owner=window.frameElement;
  if(owner?.hasAttribute('data-phycom-stage')&&parent.lessonStage){
   document.documentElement.dataset.lessonStage='1600x900';
   // Child rects are logical pixels: the host iframe transform is deliberately
   // outside this document and never enters its getBoundingClientRect values.
   const rect=element=>element.getBoundingClientRect();
   window.lessonStage={design:parent.lessonStage.design,rect,
    measure:element=>({width:element.scrollWidth,height:element.scrollHeight}),
    toggleFullscreen:()=>parent.lessonStage.toggleFullscreen(),
    get scale(){return parent.lessonStage.scale},audit:()=>parent.lessonStage.audit()};
   const isEditable=target=>target.closest?.('input,textarea,select,[contenteditable="true"]');
   function fullscreen(event){
    if(event.type==='click'&&!event.target.closest('#fullscreenBtn'))return;
    if(event.type==='keydown'&&(!['f','F'].includes(event.key)||isEditable(event.target)))return;
    event.preventDefault();event.stopImmediatePropagation();parent.lessonStage.toggleFullscreen();
   }
   document.addEventListener('click',fullscreen,true);
   document.addEventListener('keydown',fullscreen,true);
   function install(){
    const wrap=document.querySelector('main.wrap'),header=wrap?.querySelector(':scope>header');
    if(!wrap)return;
    let raf=0;
    function sync(){
     const slide=wrap.querySelector(':scope>.slide.active');
     const entry=!!slide?.classList.contains('entry-slide');
     document.body.classList.toggle('entry-page',entry);
     const withoutHeader=entry||slide?.classList.contains('hardware-connect-slide');
     const top=withoutHeader?12:Math.max(112,(header?rect(header).bottom-rect(wrap).top:104)+8);
     const value=top+'px';
     if(wrap.style.getPropertyValue('--lesson-content-top')!==value)wrap.style.setProperty('--lesson-content-top',value);
    }
    const schedule=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(sync)};
    new MutationObserver(schedule).observe(wrap,{subtree:true,attributes:true,attributeFilter:['class','hidden'],childList:true});
    if(header&&typeof ResizeObserver==='function')new ResizeObserver(schedule).observe(header);

    sync();parent.lessonStage.syncFullscreen();
    window.addEventListener('load',schedule,{once:true});
   }
   if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
   return;
  }
  const lesson=new URL(location.href);
  if(!validLesson(lesson))return;
  document.documentElement.style.visibility='hidden';
  const host=new URL('../stage.html',scriptURL);host.searchParams.set('lesson',lesson.href);host.searchParams.set('v','20261009-fan-five2');
  location.replace(host.href);return;
 }
 const params=new URL(location.href).searchParams;
 const embedded=params.get('embedded')==='1'&&parent!==window;
 const student=params.get('student')==='1';
 const lessonValue=params.get('lesson');
 const lesson=lessonValue?new URL(lessonValue,location.href):null;
 if(lesson&&embedded)lesson.searchParams.set('v',lesson.pathname.includes('/buzzer/')?'20261009-final-ui3':lesson.pathname.includes('/projects/')?'20261009-fan-five2':'20261009-final-stage3');
 if(lesson&&!validLesson(lesson))return;
 let current=lesson?routes.find(m=>lesson.pathname===base.pathname+m.path||lesson.pathname===base.pathname+m.path+'index.html')?.id:null;
 let navigation=null,homeView=null;
 const geometry=window.phycomStageGeometry,viewport=document.getElementById('phycomViewport');
 const notice=document.getElementById('phycomPortraitNotice');
 let metrics={scale:1},raf=0,presentation=false;
 function fit(){
  const v=window.visualViewport,width=v?.width||innerWidth,height=v?.height||innerHeight;
  const style=getComputedStyle(viewport),safe={};
  for(const edge of ['left','right','top','bottom'])safe[edge]=parseFloat(style.getPropertyValue('--safe-'+edge))||0;
  if(navigation&&!navigation.element.hidden)safe.bottom=Math.max(safe.bottom,navigation.element.getBoundingClientRect().height);
  metrics=geometry.fit(width,height,safe,{left:v?.offsetLeft,top:v?.offsetTop});
  frame.style.transform=`scale(${metrics.scale})`;frame.style.left=metrics.x+'px';frame.style.top=metrics.y+'px';
  const phone=navigator.maxTouchPoints>0&&Math.min(screen.width,screen.height)<=600;
  const portrait=phone&&width<height;
  frame.style.visibility=portrait||metrics.scale<=0?'hidden':'visible';frame.inert=portrait;
  notice.hidden=!portrait;viewport.dataset.orientation=width<height?'portrait':'landscape';
 }
 function schedule(){cancelAnimationFrame(raf);raf=requestAnimationFrame(fit)}
 function syncFullscreen(){
  const button=frame.contentDocument?.querySelector('#fullscreenBtn');if(!button)return;
  const on=!!document.fullscreenElement||presentation;
  frame.contentDocument.body.classList.toggle("stage-presenter",on);
  button.textContent=on?'×':'⛶';button.setAttribute('aria-pressed',String(on));
  button.setAttribute('aria-label',on?'전체화면 종료':'전체화면으로 보기');button.title=on?'전체화면 종료':'전체화면';
 }
 async function toggleFullscreen(){
  if(embedded&&parent.infoShell){await parent.infoShell.fullscreen();return}
  if(document.fullscreenElement){await document.exitFullscreen();return}
  if(presentation){presentation=false;schedule();syncFullscreen();return}
  try{await document.documentElement.requestFullscreen();presentation=false}
  catch(error){presentation=true}
  schedule();syncFullscreen();
 }
 function audit(){
  const doc=frame.contentDocument;if(!doc)return {ready:false};
  const slide=doc.querySelector('.slide.active'),issues=[],scrollable=[];
  const box=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}};
  const describe=el=>el.id?'#'+el.id:el.tagName.toLowerCase()+'.'+[...el.classList].join('.');
  const candidates=doc.querySelectorAll('.slide-sidebar,main.wrap>header,.slide-nav button,#fullscreenBtn,.wrap>#slides,.slide.active .entry-workspace,.slide.active .entry-stage,.slide.active img,.slide.active button,.slide.active .entry-block,.slide.active .wire-label,.slide.active h2,.slide.active p,dialog[open] .pin-content,.motor-result:not([hidden]),.buzzer-overlay:not([hidden]) .buzzer-dialog');
  for(const el of candidates){
   const r=box(el),style=doc.defaultView.getComputedStyle(el);
   if(!r.width||!r.height||style.visibility==='hidden'||style.opacity==='0'||el.closest('[data-stage-overflow="intentional"]'))continue;
   let parent=el.parentElement;
   while(parent){
    const ps=doc.defaultView.getComputedStyle(parent);
    if(/auto|scroll/.test(ps.overflowX+' '+ps.overflowY)){scrollable.push(describe(el));break}
    if(/hidden|clip/.test(ps.overflowX+' '+ps.overflowY)){
     const p=box(parent);
     if(r.x<p.x-1||r.y<p.y-1||r.right>p.right+1||r.bottom>p.bottom+1){issues.push({element:describe(el),clip:describe(parent),rect:r,bounds:p});break}
    }
    parent=parent.parentElement;
   }
  }
  const physical=el=>{const r=box(el);return {x:metrics.x+r.x*metrics.scale,y:metrics.y+r.y*metrics.scale,width:r.width*metrics.scale,height:r.height*metrics.scale,right:metrics.x+r.right*metrics.scale,bottom:metrics.y+r.bottom*metrics.scale}};
  const stage=box(frame),stageFits=stage.x>=metrics.availableX-1&&stage.y>=metrics.availableY-1&&stage.right<=metrics.availableX+metrics.availableWidth+1&&stage.bottom<=metrics.availableY+metrics.availableHeight+1;
  return {ready:true,coordinateSpace:'child rects: logical pixels; stage/physical: host CSS pixels',design:geometry.design,metrics,viewport:{width:innerWidth,height:innerHeight},stage,stageFits,
   physical:{activeSlide:slide?physical(slide):null,workspace:slide?.querySelector('.entry-workspace')?physical(slide.querySelector('.entry-workspace')):null,content:slide?.querySelector('.entry-stage')?physical(slide.querySelector('.entry-stage')):null},
   activeSlide:slide?box(slide):null,workspace:slide?.querySelector('.entry-workspace')?box(slide.querySelector('.entry-workspace')):null,
   content:slide?.querySelector('.entry-stage')?box(slide.querySelector('.entry-stage')):null,issues,scrollable};
 }
 window.lessonStage={design:geometry.design,get scale(){return metrics.scale},get metrics(){return {...metrics}},toggleFullscreen,syncFullscreen,audit};
 window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);
 window.addEventListener('orientationchange',()=>{schedule();setTimeout(schedule,100);setTimeout(schedule,350)});
 document.addEventListener('fullscreenchange',()=>{schedule();syncFullscreen()});
 // Keyboard works immediately even before the user focuses the iframe.
 document.addEventListener('keydown',event=>{
  if(event.target.closest?.('input,textarea,select,[contenteditable="true"]'))return;
  if(['f','F'].includes(event.key)){event.preventDefault();toggleFullscreen();return}
  const child=frame.contentWindow;
  if(child&&['ArrowLeft','ArrowRight','PageUp','PageDown',' ','Home','End','Escape'].includes(event.key)){
   event.preventDefault();child.document.body.dispatchEvent(new child.KeyboardEvent('keydown',{key:event.key,bubbles:true,cancelable:true}));
  }
 });
 function installSwipe(doc){
  const wrap=doc?.querySelector('main.wrap');if(!wrap)return;
  // Passive touch detection delegates to the same controls as keyboard/navigation.
    let swipe=null;
    const blocked=target=>{
     if(!(target instanceof doc.defaultView.Element))return true;
     if(target.closest('button,a,input,textarea,select,label,[contenteditable]:not([contenteditable="false"]),[role="button"],[role="slider"],[role="spinbutton"],[role="dialog"],[aria-modal="true"],dialog,[draggable="true"],[onclick],.entry-workspace,.modal,.popup,.overlay'))return true;
     for(let el=target;el&&el!==wrap;el=el.parentElement){
      if(/dial|knob|slider|joystick|draggable/i.test(el.id+' '+el.className))return true;
     }
     return false;
    };
    docTouch('touchstart',event=>{
     swipe=null;
     const target=event.target;
     if(event.touches.length!==1||!target.closest?.('.slide.active')||blocked(target))return;
     const touch=event.touches[0];
     swipe={id:touch.identifier,x:touch.clientX,y:touch.clientY};
    });
    docTouch('touchcancel',()=>{swipe=null});
    docTouch('touchend',event=>{
     const start=swipe;swipe=null;
     if(!start||event.touches.length||blocked(event.target))return;
     const touch=[...event.changedTouches].find(t=>t.identifier===start.id);
     if(!touch)return;
     const dx=touch.clientX-start.x,dy=touch.clientY-start.y;
     const threshold=48/Math.max(metrics.scale,.01);
     if(Math.abs(dx)<threshold||Math.abs(dx)<Math.abs(dy)*2.5)return;
     const control=doc.getElementById(dx<0?'next':'prev');
     if(control&&!control.disabled)control.click();
    });
    function docTouch(type,listener){doc.addEventListener(type,listener,{passive:true})}
 }
 frame.addEventListener('load',()=>{
  document.title=frame.contentDocument?.title||document.title;schedule();syncFullscreen();
  const doc=frame.contentDocument;installSwipe(doc);
  const list=doc?.querySelector('#slideSidebarList');
  if(!list)return;
  let previous='';
  function report(){
   const items=[...list.children].map(b=>({label:b.textContent.trim(),active:b.classList.contains('active')}));
   const value=JSON.stringify(items);
   if(value!==previous){previous=value;if(embedded)parent.postMessage({type:'info-toc',items},location.origin);else navigation?.update(current,items)}
  }
  new MutationObserver(report).observe(list,{subtree:true,attributes:true,childList:true,characterData:true});report();
  if(student && !parent.location.pathname.startsWith('/2022-M-phycom/')){
   const names={'오정훈':'오OO','이예준':'이OO','백연정':'백OO','정아주':'정OO'};
   function anonymizeText(value){
    for(const [name,alias] of Object.entries(names)){
     value=value.replace(new RegExp('(?:2026학년도\\s*)?(?:수남중\\s*)?1\\d{4}\\s*'+name,'g'),'1학년 '+alias).split(name).join(alias);
    }
    return value;
   }
   function anonymize(root){
    const walker=doc.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
    while(node=walker.nextNode()){
     if(node.parentElement?.closest('script,style'))continue;
     let value=anonymizeText(node.nodeValue);
     if(value!==node.nodeValue)node.nodeValue=value;
    }
   }
   anonymize(doc.body);
   new MutationObserver(records=>{
    for(const record of records){
     if(record.type==='characterData'){
      const node=record.target;if(node.parentElement?.closest('script,style'))continue;
      let value=anonymizeText(node.nodeValue);
      if(value!==node.nodeValue)node.nodeValue=value;
     }else for(const node of record.addedNodes){
      if(node.nodeType===Node.ELEMENT_NODE)anonymize(node);
      else if(node.nodeType===Node.TEXT_NODE){let value=anonymizeText(node.nodeValue);if(value!==node.nodeValue)node.nodeValue=value;}
     }
    }
   }).observe(doc.body,{childList:true,subtree:true,characterData:true});
  }
 });
 window.addEventListener('message',e=>{
  if(!embedded||e.source!==parent||e.origin!==location.origin)return;
  const d=e.data,doc=frame.contentDocument;if(!doc)return;
  if(d?.type==='info-key')doc.querySelector(['ArrowLeft','PageUp'].includes(d.key)?'#prev':'#next')?.click();
  else if(d?.type==='info-jump')doc.querySelector('#slideSidebarList')?.children[d.index]?.click();
  else if(d?.type==='info-fullscreen'){presentation=!!d.on;syncFullscreen();schedule()}
 });
 if(!embedded&&window.phycomNavigation){
  const catalogue=window.phycomNavigation;
  function open(id){if(id===current&&!homeView?.hidden)return;if(id===current&&frame.getAttribute('src')!=='about:blank')return;
   const module=catalogue.lessons.find(m=>m.id===id&&m.enabled);if(!module)return;
   current=id;homeView.hidden=true;viewport.hidden=false;navigation.element.hidden=false;navigation.close();navigation.update(id);
   const url=new URL(module.path,base);url.searchParams.set('v','20261009-fan-five2');frame.src=url.href;history.replaceState(history.state,'',url.href);schedule();
  }
  function home(){current=null;frame.src='about:blank';viewport.hidden=true;homeView.hidden=false;navigation.element.hidden=true;navigation.close();document.title='피지컬 컴퓨팅';history.replaceState(history.state,'',new URL('index.html',base).href)}
  navigation=catalogue.create({home,previous:()=>frame.contentDocument?.querySelector('#prev')?.click(),next:()=>frame.contentDocument?.querySelector('#next')?.click(),select:open,fullscreen:toggleFullscreen});
  navigation.element.classList.add('stage-navigation');document.body.append(navigation.element);
  const creator=window.INFO_UI_CREATOR||{},credit=document.createElement('p');
  credit.className='creator-credit';
  credit.textContent=`© ${creator.year||'2026'} ${creator.name||'B.K.Son'}${creator.rights?` · ${creator.rights}`:''}`;
  navigation.element.append(credit);
  if(typeof ResizeObserver==='function')new ResizeObserver(schedule).observe(navigation.element);
  homeView=document.createElement('main');homeView.className='stage-module-home';const heading=document.createElement('h1');heading.textContent='피지컬 컴퓨팅';const projectHeading=document.createElement('h2');projectHeading.textContent='프로젝트';homeView.append(heading,catalogue.choices(open),projectHeading,catalogue.choices(open,catalogue.projects));document.body.append(homeView);
  homeView.hidden=!!lesson;navigation.element.hidden=!lesson;navigation.update(current);if(!lesson)home();
 }
 if(lesson){frame.src=lesson.href;if(!embedded)history.replaceState(history.state,'',lesson.href)}fit();
})();

