/* Source: 2022 Physical Computing textbook, printed pp. 32–33 (PDF pp. 33–34).
   Selection/success screenshots are cropped from the supplied original.
   ON and RX anchors are measured on the existing OrangeBoard.png.
   One shared inserted page. Existing lesson indices remain stable; presentation
   numbers are mapped here so existing code/action sequences are untouched. */
(() => {
  "use strict";
  const q = (s) => document.querySelector(s),
    asset = new URL("../../assets/", document.currentScript.src).href;
  const actionSteps = [0, 4, 5];
  const original = [...document.querySelectorAll(".slide")];
  const page = document.createElement("section");
  page.className = "slide entry-slide hardware-connect-slide";
  page.setAttribute("aria-label", "3. 하드웨어 연결");
  page.innerHTML = `<div class="entry-workspace hc-workspace"><div class="entry-scene-tabs entry-code-toolbar"><button class="entry-scene-tab active">장면 1</button><span class="entry-brand">entry</span><b class="entry-lesson-title">하드웨어 연결</b></div><aside class="entry-tabs"><div class="entry-tab hardware-tab" aria-label="하드웨어"><img class="entry-tab-image entry-tab-image-unselected" src="${asset}tab14_hardware_unselected.png" alt="하드웨어"><img class="entry-tab-image entry-tab-image-selected" src="${asset}tab14_hardware_selected.png" alt=""></div></aside><div class="hc-content"><h2></h2><div class="hc-usb"><div class="hc-laptop"><img src="${asset}hardware-laptop-transparent.png" alt="확정 시안의 노트북"><strong>노트북 · USB</strong></div><svg viewBox="0 0 250 180" role="img" aria-label="Micro USB 5핀과 USB 케이블"><path d="M20 112 H80 Q125 112 125 92 T180 72 H230" stroke="#526579" stroke-width="14"/><rect x="0" y="82" width="45" height="60" rx="8" fill="#929da7"/><rect x="205" y="52" width="45" height="40" rx="4" fill="#929da7"/></svg></div><div class="hc-board-panel"><div class="hc-board"><img src="${asset}OrangeBoard.png" alt="오렌지보드 실물 ON 및 RX 램프"><span class="hc-led hc-on"></span><span class="hc-led hc-rx hc-panel-rx" hidden></span></div><p class="hc-board-status">ON · USB 전원 연결</p></div><div class="hc-entry"><div class="hc-connect-buttons"><button data-hc-action="tab">하드웨어 연결하기</button><button data-hc-action="open">연결 프로그램 열기</button></div><div class="hc-program-window" role="dialog" aria-label="엔트리 하드웨어 연결 프로그램" hidden><img class="hc-program-shot" alt="교과서의 엔트리 하드웨어 연결 프로그램"></div><p class="hc-install">처음 연결하는 컴퓨터는 드라이버 설치가 필요합니다.<br>엔트리 첫 연결 또는 다른 언어로 사용한 뒤에는 펌웨어를 설치합니다.</p><div class="hc-block-list"><div class="hc-palette-canvas"></div></div></div></div></div><div class="hc-overlay" hidden><div class="entry-result-card hc-result" role="dialog" aria-modal="true" aria-label="오렌지보드 연결 결과"><button class="entry-result-close" aria-label="닫기">×</button><div class="hc-board"><img src="${asset}OrangeBoard.png" alt="오렌지보드 ON 및 RX LED 위치"><span class="hc-led hc-on"></span><span class="hc-led hc-rx"></span></div><p></p></div></div>`;
  original[1].after(page);
  page.querySelector(".hc-program-window").insertAdjacentHTML("beforeend", '<span class="hc-orange-choice" aria-hidden="true"></span>');
  // Captured Orange palette order; obscured defaults checked against Entry's Orange definitions.
  const paletteBlocks=[{"id":"hc-analog","type":"reporter","category":"hardware","parts":[{"text":"아날로그"},{"slot":{"id":"pin","value":{"kind":"dropdown","value":"A0"}}},{"text":"번 센서값"}]},{"id":"hc-map","type":"reporter","category":"hardware","parts":[{"slot":{"id":"sensor","value":{"kind":"block","block":{"id":"hc-map-analog","type":"reporter","category":"hardware","parts":[{"text":"아날로그"},{"slot":{"id":"pin","value":{"kind":"dropdown","value":"A0"}}},{"text":"번 센서값"}]}}}},{"text":"의 범위를"},{"slot":{"id":"from","value":{"kind":"number","value":0}}},{"text":"~"},{"slot":{"id":"to","value":{"kind":"number","value":1023}}},{"text":"에서"},{"slot":{"id":"min","value":{"kind":"number","value":0}}},{"text":"~"},{"slot":{"id":"max","value":{"kind":"number","value":100}}},{"text":"로 바꾼값"}]},{"id":"hc-ultra","type":"reporter","category":"hardware","parts":[{"text":"울트라소닉 Trig"},{"slot":{"id":"trig","value":{"kind":"dropdown","value":2}}},{"text":"Echo"},{"slot":{"id":"echo","value":{"kind":"dropdown","value":4}}},{"text":"센서값"}]},{"id":"hc-digital","type":"boolean","category":"hardware","parts":[{"text":"디지털"},{"slot":{"id":"pin","value":{"kind":"dropdown","value":2}}},{"text":"번 센서값"}]},{"id":"hc-switch","type":"command","category":"hardware","parts":[{"text":"디지털"},{"slot":{"id":"pin","value":{"kind":"dropdown","value":3}}},{"text":"번 핀"},{"slot":{"id":"action","value":{"kind":"dropdown","value":"켜기"}}}]},{"id":"hc-pwm","type":"command","category":"hardware","parts":[{"text":"디지털"},{"slot":{"id":"pin","value":{"kind":"dropdown","value":3}}},{"text":"번 핀을"},{"slot":{"id":"brightness","value":{"kind":"number","value":255}}},{"text":"(으)로 정하기"}]},{"id":"hc-servo","type":"command","category":"hardware","parts":[{"text":"디지털"},{"slot":{"id":"pin","value":{"kind":"dropdown","value":3}}},{"text":"번 핀의 서보모터를"},{"slot":{"id":"angle","value":{"kind":"number","value":10}}},{"text":"의 각도로 정하기"}]},{"id":"hc-tone","type":"command","category":"hardware","parts":[{"text":"디지털"},{"slot":{"id":"pin","value":{"kind":"dropdown","value":3}}},{"text":"번 핀의 피에조 부저를"},{"slot":{"id":"octave","value":{"kind":"dropdown","value":4}}},{"text":"옥타브"},{"slot":{"id":"note","value":{"kind":"dropdown","value":"도"}}},{"text":"음으로"},{"slot":{"id":"seconds","value":{"kind":"number","value":1}}},{"text":"초 연주하기"}]},{"id":"hc-no-tone","type":"command","category":"hardware","parts":[{"text":"디지털"},{"slot":{"id":"pin","value":{"kind":"dropdown","value":3}}},{"text":"번 핀의 피에조 부저 소리 끄기"}]},{"id":"hc-neo-init","type":"command","category":"hardware","parts":[{"text":"디지털"},{"slot":{"id":"pin","value":{"kind":"dropdown","value":6}}},{"text":"번 핀에 연결된"},{"slot":{"id":"count","value":{"kind":"number","value":25}}},{"text":"개의 네오픽셀 LED 사용하기"}]},{"id":"hc-neo-color","type":"command","category":"hardware","parts":[{"text":"디지털"},{"slot":{"id":"pin","value":{"kind":"dropdown","value":6}}},{"text":"번 핀에 연결된"},{"slot":{"id":"index","value":{"kind":"number","value":0}}},{"text":"번째 네오픽셀 LED를 R:"},{"slot":{"id":"red","value":{"kind":"number","value":255}}},{"text":", G:"},{"slot":{"id":"green","value":{"kind":"number","value":255}}},{"text":", B:"},{"slot":{"id":"blue","value":{"kind":"number","value":255}}},{"text":"색으로 켜기"}]},{"id":"hc-dht-init","type":"command","category":"hardware","parts":[{"text":"디지털"},{"slot":{"id":"pin","value":{"kind":"dropdown","value":3}}},{"text":"번 핀에 연결된 온습도센서 사용하기"}]},{"id":"hc-temperature","type":"reporter","category":"hardware","parts":[{"text":"온습도센서의 온도값"}]},{"id":"hc-humidity","type":"reporter","category":"hardware","parts":[{"text":"온습도센서의 습도값"}]}];
  const paletteRenderer=new window.EntryEngine.Renderer(page.querySelector(".hc-palette-canvas"),()=>{});
  paletteRenderer.render(paletteBlocks.map((block,i)=>({id:"hc-palette-"+i,blocks:[block]})));

  let active = false,
    step = 0,
    bypass = false,
    resume = null;
  const overlay = page.querySelector(".hc-overlay");
  const titles = [
    "USB 연결 상태와 오렌지보드의 ON 파란불을 확인하세요.",
    "USB 연결 결과를 확인하세요.",
    "블록 탭에서 하드웨어를 선택하세요.",
    "연결 프로그램 열기를 누르세요.",
    "검색 창에서 오렌지 보드를 검색한 후 선택하세요.",
    "하드웨어 연결 성공을 확인하세요.",
    "연결을 누르세요.",
  ];
  function alignUsb() {
    const row=page.querySelector(".hc-usb"),svg=row.querySelector(":scope > svg");
    const box=row.getBoundingClientRect(),laptop=row.querySelector("img").getBoundingClientRect();
    const board=page.querySelector(".hc-board-panel img").getBoundingClientRect();
    if(!box.width)return;
    // Convert viewport positions back to the shared stage coordinates.
    const scale=box.width/row.clientWidth;
    const ax=(laptop.right-box.left-laptop.width*.012)/scale;
    const ay=(laptop.top+laptop.height*.83-box.top)/scale;
    const bx=(board.left+board.width*.031-box.left)/scale;
    const by=(board.top+board.height*.26-box.top)/scale;
    svg.setAttribute("viewBox",`0 0 ${row.clientWidth} ${row.clientHeight}`);
    svg.querySelector("path").setAttribute("d",`M${ax} ${ay} C${(ax+bx)/2} ${ay},${(ax+bx)/2} ${by},${bx} ${by}`);
    svg.querySelector("path").setAttribute("fill","none");
    svg.querySelector("path").setAttribute("stroke","#586b80");
    [...svg.querySelectorAll("rect")].forEach((r,i)=>{
      // The cable starts at the laptop's existing plug; the board plug enters its USB socket.
      r.hidden=!i;
      r.style.display=i?"":"none";
      r.setAttribute("x",bx-20);r.setAttribute("y",by-9);
      r.setAttribute("width",24);r.setAttribute("height",18);r.setAttribute("fill","#fff");
    });
  }
  const realignUsb=()=>requestAnimationFrame(alignUsb);
  page.querySelectorAll(".hc-laptop img,.hc-board-panel img").forEach(img=>img.addEventListener("load",realignUsb));
  new ResizeObserver(realignUsb).observe(page.querySelector(".hc-usb"));
  window.addEventListener("resize",realignUsb);

  function close() {
    overlay.hidden = true;
    page.querySelector(".hc-program-window").hidden = true;
    overlay.querySelector(".hc-rx").classList.remove("hc-blinking");
  }
  function render() {
    close();
    const rxStep = step === 5;
    page.classList.toggle("hc-success-rx", rxStep);
    page.classList.toggle("hc-select-phase", step === 4 || step === 6);
    page.classList.toggle("hc-usb-phase", step === 0);
    page.querySelector(".entry-tabs").hidden = step === 0;
    page.querySelector(".hc-board-panel").hidden = false;
    if(step === 0)requestAnimationFrame(alignUsb);
    const panelRx = page.querySelector(".hc-panel-rx");
    panelRx.hidden = !rxStep;
    panelRx.classList.toggle("hc-blinking", rxStep);
    page.querySelector(".hc-board-status").textContent = rxStep ? "RX · 데이터 수신" : "ON · USB 전원 연결";
    page.querySelector("h2").textContent = titles[step];
    page.querySelector(".hc-usb").hidden = step >= 2;
    page.querySelector(".hc-entry").hidden = step < 2;
    page
      .querySelector(".hardware-tab")
      .classList.toggle("active-tab", step >= 3);
    page.querySelector(".hc-connect-buttons").hidden = false;
    page.querySelector('[data-hc-action="tab"]').hidden = step < 3 || rxStep;
    page.querySelector('[data-hc-action="tab"]').textContent = step === 6 ? "연결" : rxStep ? "하드웨어가 연결되었습니다." : "하드웨어 연결";
    page.querySelector('[data-hc-action="open"]').hidden = step < 3;
    page.querySelector('[data-hc-action="open"]').textContent = rxStep ? "클라우드 PC 연결하기" : "연결 프로그램 열기";
    page.querySelector(".hc-entry").classList.toggle("hc-connected", rxStep);
    page
      .querySelector('[data-hc-action="open"]')
      .classList.toggle("hc-focus", step === 4);
    page
      .querySelector(".hardware-tab")
      .classList.toggle("hc-focus", step === 4);
    const shot = page.querySelector(".hc-program-shot");
    const choice=page.querySelector(".hc-orange-choice");
    choice.hidden=!(step === 4 || step === 6);
    const alignChoice=()=>{
      const w=shot.clientWidth;
      choice.style.left=(w*.07)+"px";choice.style.top=(w*223/1019)+"px";
      choice.style.width=(w*210/1019)+"px";choice.style.height=(w*190/1019)+"px";
    };
    shot.onload=alignChoice;requestAnimationFrame(alignChoice);
    shot.alt=rxStep?"Entry 하드웨어 연결 성공 화면":"Entry 하드웨어 선택 화면";
    page.querySelector(".hc-program-window").hidden = step < 4;
    shot.src =
      asset +
      (step === 4 || step === 6
        ? "hardware-connect-select-reference.png"
        : "hardware-connect-success-reference.png");
    page.querySelector(".hc-install").hidden = true;
    page.querySelector(".hc-block-list").hidden = !rxStep;
    if(rxStep)requestAnimationFrame(()=>paletteRenderer.reflow());
    q("#prev").disabled = false;
    q("#next").disabled = false;
    q("#slides").textContent = window.lessonPages.counter(page);
    const subtitle = q("#slideSubtitle") || q("#subtitle");
    if (subtitle) subtitle.textContent = document.body.dataset.motor === "servo" ? "하드웨어 연결" : "3. 하드웨어 연결";
    document
      .querySelectorAll(".slide-sidebar-item")
      .forEach((b) => {
        b.classList.remove("active");
        b.removeAttribute("aria-current");
      });
    sidebar.classList.add("active");
    sidebar.setAttribute("aria-current", "page");
  }
  function enter(reverse, callback) {
    resume = callback;
    active = true;
    step = reverse ? 5 : 0;
    original.forEach((s) => s.classList.remove("active"));
    page.classList.add("active");
    document.body.classList.add("entry-page", "after-intro");
    render();
  }
  function leave(target) {
    close();
    active = false;
    page.classList.remove("active");
    sidebar.classList.remove("active");
    bypass = true;
    try {
      resume(target);
    } finally {
      bypass = false;
    }
  }
  function move(direction) {
    close();
    if (direction > 0 && step === 5) leave(2);
    else if (direction < 0 && step === 0) leave(1);
    else {
      step = actionSteps[actionSteps.indexOf(step) + direction];
      render();
    }
  }
  const sidebar = document.createElement("button");
  sidebar.type = "button";
  sidebar.className = "hc-sidebar-item";
  sidebar.innerHTML =
    '<span class="sidebar-page-no">'+window.lessonPages.number(page)+'</span><span>' + (document.body.dataset.motor === "servo" ? "하드웨어 연결" : "3. 하드웨어 연결") + '</span>';
  const list = q("#slideSidebarList");
  list.children[1].after(sidebar);
  [...list.querySelectorAll(".slide-sidebar-item")].forEach((b, i) => {
    b.addEventListener(
      "click",
      () => {
        bypass = true;
        if (active) {
          close();
          active = false;
          page.classList.remove("active");
          sidebar.classList.remove("active");
        }
      },
      true,
    );
    b.addEventListener("click", () => {
      bypass = false;
    });
  });
  sidebar.addEventListener("click", () => {
    if (window.hardwareLessonAdapter) enter(false, window.hardwareLessonAdapter.resume);
    else if (resume) enter(false, resume);
    else window.hardwareConnect.open?.();
  });
  document.addEventListener(
    "click",
    (e) => {
      if (!active) return;
      const button = e.target.closest("#prev,#next,#mobilePrev,#mobileNext");
      if (button) {
        e.preventDefault();
        e.stopImmediatePropagation();
        move(button.id.toLowerCase().includes("prev") ? -1 : 1);
      }
    },
    true,
  );
  const supportsPages = true;
  document.addEventListener(
    "keydown",
    (e) => {
      if (!active) return;
      const forward = [
          "ArrowRight",
          ...(supportsPages ? ["PageDown", " "] : []),
        ],
        back = ["ArrowLeft", ...(supportsPages ? ["PageUp"] : [])];
      if (forward.includes(e.key) || back.includes(e.key)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        move(forward.includes(e.key) ? 1 : -1);
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        close();
      }
    },
    true,
  );
  overlay.querySelector("button").addEventListener("click", close);
  window.lessonUI.bindOutside({key:'hardware-result',isOpen:()=>!overlay.hidden,inside:'.hc-result',close});
  page.querySelector(".hc-entry").addEventListener("click", e => {
    if (step === 5 && !e.target.closest(".hc-program-window,[data-hc-action]")) {
      close();
      page.querySelector(".hc-program-window").hidden = true;
      page.querySelector(".hc-install").hidden = true;
    }
  });
  page.querySelector('[data-hc-action="tab"]').addEventListener("click", () => {
    if (step === 6) move(1);

  });
  page.querySelector(".hardware-tab").addEventListener("click", () => {
    if (step === 2) move(1);
  });
  page
    .querySelector('[data-hc-action="open"]')
    .addEventListener("click", () => {
      if (step === 4) move(1);
    });
  page.querySelector(".hc-program-shot").addEventListener("click", () => {
    if (step === 4 || step === 6) move(1);
  });
  document.querySelectorAll(".pin13-board-view").forEach(board => {
    board.insertAdjacentHTML("beforeend", '<span class="hc-led hc-on hc-pin-status" aria-hidden="true"></span><span class="hc-led hc-rx hc-pin-status" aria-hidden="true"></span>');
  });
  window.addEventListener("pagehide", close);
  window.hardwareConnect = {
    before(from, to, callback) {
      if (bypass) return false;
      if (active) {
        close();
        active = false;
        page.classList.remove("active");
        sidebar.classList.remove("active");
      }
      resume = callback;
      if ((from === 1 && to === 2) || (from === 2 && to === 1)) {
        enter(to === 1, callback);
        return true;
      }
      return false;
    },
    number(index, total) {
      return window.lessonPages.counter(original[index]);
    },
    getState: () => ({
      active,
      step,
      popup: !overlay.hidden,
      animation: page.querySelector(".hc-rx").classList.contains("hc-blinking"),
    }),
  };
})();



