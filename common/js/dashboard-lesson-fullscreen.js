/* One fullscreen state for the module shell and directly opened lessons. */
(()=>{'use strict';
let presentation=false,external=false;
const listeners=new Set();
function sync(){
 const on=!!document.fullscreenElement||presentation||external;
 document.body.classList.toggle('shell-fullscreen',on);
 const button=document.getElementById('fullscreenBtn');
 if(button){button.setAttribute('aria-pressed',String(on));button.setAttribute('aria-label',on?'전체화면 종료':'전체화면으로 보기');button.textContent=on?'×':'⛶'}
 for(const listener of listeners)listener(on);
 window.dispatchEvent(new Event('resize'));
}
async function toggle(){
 if(document.fullscreenElement){await document.exitFullscreen();return}
 if(presentation){presentation=false;sync();return}
 try{await document.documentElement.requestFullscreen();presentation=false}
 catch(error){presentation=true;console.warn('Native fullscreen unavailable:',error.message)}
 sync();
}
window.infoFullscreen={toggle,sync,setExternal(on){external=!!on;sync()},subscribe(listener){listeners.add(listener)}};
document.addEventListener('fullscreenchange',sync);
})();
