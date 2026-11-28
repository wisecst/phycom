/* HC-SR04 principle visualization only. DeviceConcept / Execution own the popup and resources. */
(()=>{'use strict';
const steps=[
 {title:'초음파란?',text:'사람에게 들리지 않는 높은 주파수의 소리입니다.',teacher:'가청 주파수 약 20Hz~20kHz · HC-SR04 사용 주파수 40kHz'},
 {title:'초음파의 송신과 수신',text:'초음파를 보내면 물체에 반사되어 센서로 돌아옵니다.',teacher:'Trig 입력 펄스 10μs 이상 → 40kHz 초음파 8주기 송신 · Echo HIGH 유지 시간으로 왕복 시간 측정'},
 {title:'거리와 왕복 시간',text:'같은 속력으로 움직여도 가까운 물체의 소리가 먼저 돌아옵니다.',teacher:'소리의 속력 약 343m/s(20℃) · 10cm 왕복 약 583μs · 20cm 왕복 약 1,166μs'},
 {title:'거리 측정 원리',text:'갔다가 돌아오므로 소리가 이동한 길은 실제 거리의 약 두 배입니다.',teacher:'거리 = 소리의 속력 × 왕복 시간 ÷ 2 · 거리(cm) ≈ 왕복 시간(μs) ÷ 58.3'},
 {title:'직접 탐구하기',text:'물체를 움직이며 거리가 멀어질수록 돌아오는 시간이 길어지는지 살펴보세요.',teacher:'HC-SR04 일반적인 측정 범위 약 2~400cm · 환경과 물체의 특성에 따라 측정 범위·정확도가 달라질 수 있습니다.'}
];
const roundTrip=distance=>Math.round(distance*20000/343),speed=300;
const sensor=()=>document.querySelector('#pinRoles').dataset.moduleImage;
function lane(id,y,end,label){return `<g data-lane="${id}" data-origin="360" data-length="${end-360}" data-y="${y}"><image href="${sensor()}" x="20" y="${y-8}" width="280" height="136"/><text x="20" y="${y-24}">${label}</text><path data-send d="M360 ${y}H${end}" marker-end="url(#ultra-principle-send)"/><path data-reflect d="M${end} ${y}V${y+74}"/><path data-echo d="M${end} ${y+74}H360" marker-end="url(#ultra-principle-echo)"/><rect data-obstacle x="${end+18}" y="${y-30}" width="38" height="140" rx="10"/><text data-obstacle-label x="${end+36}" y="${y-45}" text-anchor="middle">물체</text><circle data-pulse r="12"/><text data-status x="365" y="${y+(['near','far'].includes(id)?125:165)}"></text></g>`;}
function diagram(lanes,extra=''){const id=lanes.match(/data-lane="([^"]+)"/)[1];return `<svg viewBox="0 0 1200 430" role="img" aria-label="초음파 송신과 반사 경로"><defs>${[['send','#2563eb'],['echo','#ea580c'],['distance','#16855b']].map(([name,color])=>`<marker id="ultra-principle-${name}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="${color}"/></marker>`).join('')}</defs>${lanes}${extra}</svg>`.replaceAll('ultra-principle-','ultra-principle-'+id+'-');}
function view(){
 const el=document.createElement('div');el.className='ultra-operation';
 el.innerHTML=`<header class="pot-principle-heading"><h3></h3><p></p></header><div class="ultra-principle-visual">
 <section data-principle-pane="0"><svg viewBox="0 0 1200 350" role="img" aria-label="가청 주파수와 초음파 범위 비교"><rect x="40" y="65" width="510" height="200" rx="24" fill="#dbeafe"/><rect x="610" y="65" width="550" height="200" rx="24" fill="#fef3c7"/><text x="295" y="110" text-anchor="middle">사람에게 들리는 소리</text><text x="885" y="110" text-anchor="middle">사람에게 들리지 않는 초음파</text><path d="${wave(70,500,180,70)}" stroke="#2563eb"/><path d="${wave(640,1130,180,20)}" stroke="#b45309"/><text x="600" y="315" text-anchor="middle">소리의 높이(주파수)가 높아져요 →</text></svg><p class="ultra-student-key">박쥐·돌고래도 소리가 돌아오는 것을 이용해 물체를 감지해요.</p></section>
 <section data-principle-pane="1">${diagram(lane('send-receive',165,1000,'초음파 센서'),'<path class="ultra-transducer-link" d="M95 167V155H360V165" stroke="#2563eb"/><path class="ultra-transducer-link" d="M360 239H300L270 217" stroke="#ea580c"/><circle class="ultra-transducer ultra-transmit" cx="95" cy="217" r="50"/><circle class="ultra-transducer ultra-receive" cx="220" cy="217" r="50"/><text class="ultra-send-label" x="95" y="330" text-anchor="middle">송신부</text><text class="ultra-echo-label" x="220" y="330" text-anchor="middle">수신부</text><text class="ultra-send-label" x="620" y="120">보내기 →</text><text class="ultra-echo-label" x="620" y="285">← 돌아오기</text>')}</section>
 <section data-principle-pane="2">${diagram(lane('near',65,660,'가까운 물체')+lane('far',275,960,'먼 물체'))}</section>
 <section data-principle-pane="3">${diagram(lane('double',120,1000,'초음파 센서'),'<path class="ultra-real-distance" d="M360 350H1000" marker-start="url(#ultra-principle-distance)" marker-end="url(#ultra-principle-distance)"/><text class="ultra-distance-label" x="680" y="402" text-anchor="middle">센서에서 물체까지의 실제 거리</text><text class="ultra-send-label" x="620" y="78">가는 길 →</text><text class="ultra-echo-label" x="620" y="244">← 돌아오는 길</text>')}</section>
 <section data-principle-pane="4">${diagram(lane('explore',125,390,'초음파 센서'),'<text data-live-distance x="730" y="350" text-anchor="middle"></text>')}<div class="ultra-explore-controls"><label>물체 위치 <input type="range" min="2" max="400" step="1" value="20" aria-label="탐구 물체 거리"></label><button type="button" class="pot-moon-reveal" data-auto>자동 변화</button></div></section>
 </div><p class="ultra-observation-speed">초음파의 움직임은 관찰을 위해 느리게 표현했습니다.</p><aside class="ultra-teacher-reference"><strong>교사 참고</strong><p data-teacher></p><p data-live-time></p></aside>`;
 let step=0,distance=20,auto=false,direction=1,epoch=performance.now(),last=epoch;
 const range=el.querySelector('input'),button=el.querySelector('[data-auto]');
 const paint=now=>{
  const delta=Math.min(100,Math.max(0,now-last));last=now;
  if(step===4&&auto){distance=Math.max(2,Math.min(400,distance+direction*delta*.05));if(distance===2||distance===400)direction*=-1;range.value=Math.round(distance)}
  const measured=Math.round(distance),time=roundTrip(measured),length=measured*1.5;
  el.dataset.distance=measured;el.dataset.roundTrip=time;el.dataset.auto=String(auto);
  el.querySelector('[data-live-distance]').textContent='측정 거리 '+measured+'cm';
  const live=el.querySelector('[data-live-time]');live.hidden=step!==4;live.textContent='현재 왕복 시간 약 '+time.toLocaleString('en-US')+'μs';
  const explore=el.querySelector('[data-lane="explore"]'),end=360+length;
  explore.dataset.length=length;explore.querySelector('[data-send]').setAttribute('d','M360 125H'+end);explore.querySelector('[data-echo]').setAttribute('d','M'+end+' 199H360');explore.querySelector('[data-reflect]').setAttribute('d','M'+end+' 125V199');explore.querySelector('[data-obstacle]').setAttribute('x',end+18);explore.querySelector('[data-obstacle-label]').setAttribute('x',end+36);
  button.textContent=auto?'자동 변화 정지':'자동 변화';
  // The comparison lanes share one clock and one speed: the shorter path returns first.
  const elapsed=(now-epoch)/1000,period=step===2?5:(2*(step===4?length:640)+74)/speed+1,t=elapsed%period;
  el.querySelectorAll(`[data-principle-pane="${step}"] [data-lane]`).forEach(lane=>{
   const length=+lane.dataset.length,origin=+lane.dataset.origin,y=+lane.dataset.y,travel=t*speed,reflecting=travel>=length&&travel<length+74,returning=travel>=length+74,received=travel>=2*length+74,pulse=lane.querySelector('[data-pulse]');
   lane.dataset.received=String(received);pulse.hidden=received;pulse.style.display=received?'none':'';pulse.setAttribute('cx',received?origin:returning?origin+2*length+74-travel:reflecting?origin+length:origin+travel);pulse.setAttribute('cy',returning?y+74:reflecting?y+travel-length:y);pulse.setAttribute('fill',returning||reflecting?'#ea580c':'#2563eb');lane.querySelector('[data-status]').textContent=received?'돌아왔어요!':reflecting?'물체에서 반사':returning?'반사되어 돌아오는 중':'초음파를 보내는 중';
  });
 };
 range.oninput=()=>{distance=+range.value;auto=false;epoch=performance.now();paint(epoch)};
 button.onclick=()=>{auto=!auto;last=performance.now();paint(last)};
 el.setStep=value=>{step=value;epoch=last=performance.now();if(step!==4)auto=false;el.dataset.step=step;el.querySelector('h3').textContent=(step+1)+'단계 · '+steps[step].title;el.querySelector('header p').textContent=steps[step].text;el.querySelector('[data-teacher]').textContent=steps[step].teacher;el.querySelectorAll('[data-principle-pane]').forEach(pane=>pane.hidden=+pane.dataset.principlePane!==step);paint(epoch)};
 el.paint=paint;el.setStep(0);return el;
}
function wave(from,to,y,period){let d='M'+from+' '+y;for(let x=from;x<to;x+=period)d+='q'+period/4+' -38 '+period/2+' 0t'+period/2+' 0';return d;}
function run({host,interval,cleanup}){const el=host.firstElementChild;interval(()=>el.paint(performance.now()),40);cleanup(()=>{el.querySelector('input').oninput=null;el.querySelector('[data-auto]').onclick=null;});}
window.ultraPrinciple={view,run,roundTrip};
})();
