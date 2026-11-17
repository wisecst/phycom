window.phycomShellBase=new URL('../',document.currentScript.src).href;
(()=>{'use strict';
const shell=document.getElementById('buzzerShell'),frame=document.getElementById('buzzerFrame');
const catalogue=window.phycomNavigation;
let current=null;
function focusLesson(){if(!shell.hidden)frame.contentWindow?.focus()}
function send(key){frame.contentWindow?.postMessage({type:'info-key',key},location.origin)}
function open(id,section){if(id===current&&!section){navigation.close();focusLesson();return}
 const module=catalogue.lessons.find(m=>m.id===id&&m.enabled);if(!module)return;
 current=id;shell.hidden=false;document.body.style.overflow='hidden';navigation.close();navigation.update(id);
 const lesson=new URL('../'+module.path,window.phycomShellBase);if(section)lesson.hash=section;
 frame.title=module.name+' 수업';frame.src=new URL('stage.html?lesson='+encodeURIComponent(lesson.href)+'&embedded=1&student=1&ui=20261009-final-ui3',window.phycomShellBase).href;
}
function close(){window.studentDashboard?.activateTab(catalogue.lessons.find(item=>item.id===current)?.unit||'modules');shell.hidden=true;current=null;navigation.close();frame.src='about:blank';document.body.style.overflow='';document.querySelector('[data-open-module]')?.focus()}
const fullscreen=()=>window.infoFullscreen.toggle();
const navigation=catalogue.create({home:close,previous:()=>send('ArrowLeft'),next:()=>send('ArrowRight'),select:open,fullscreen});
shell.append(navigation.element);
function credit(){const p=document.createElement('p');p.className='creator-credit';const c=window.INFO_UI_CREATOR||{};const text=document.createElement('span');text.textContent=`© ${c.year||'2026'} ${c.name||'B.K.Son'}${c.rights?` · ${c.rights}`:''}`;p.append(text);return p}
navigation.element.append(credit());document.querySelector('.lesson-screen').append(credit());
window.infoFullscreen.subscribe(on=>{frame.contentWindow?.postMessage({type:'info-fullscreen',on},location.origin);focusLesson()});
window.infoShell={fullscreen,focusLesson};
frame.addEventListener('load',()=>{focusLesson();window.infoFullscreen.sync()});
document.addEventListener('click',event=>{const button=event.target.closest('[data-open-module]');if(button&&!button.disabled)open(button.dataset.openModule,button.dataset.lessonSection)});
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow)return;if(e.data==='phycom-home'){close();return}if(e.data?.type==='info-toc')navigation.update(current,e.data.items)});
document.addEventListener('keydown',e=>{if(shell.hidden||e.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])'))return;if(['ArrowLeft','ArrowRight','PageUp','PageDown'].includes(e.key)){e.preventDefault();send(e.key)}else if(e.key.toLowerCase()==='f'){e.preventDefault();fullscreen().catch(()=>{})}});
})();


