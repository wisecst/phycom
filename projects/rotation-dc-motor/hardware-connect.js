/* Source: 2022 Physical Computing textbook, printed pp. 32–33 (PDF pp. 33–34).
   Selection/success screenshots are cropped from the supplied original.
   ON and RX anchors are measured on the existing OrangeBoard.png.
   One shared inserted page. Existing lesson indices remain stable; presentation
   numbers are mapped here so existing code/action sequences are untouched. */
(() => {
  "use strict";
  const q = (s) => document.querySelector(s),
    asset = new URL("../../assets/", document.currentScript.src).href;
  const actionSteps = [0, 1, 2, 3, 4, 5];
  const original = [...document.querySelectorAll(".slide")];
  const page = document.createElement("section");
  page.className = "slide entry-slide hardware-connect-slide";
  page.setAttribute("aria-label", "3. 하드웨어 연결");
  page.innerHTML = `<div class="entry-workspace hc-workspace"><div class="entry-scene-tabs entry-code-toolbar"><button class="entry-scene-tab active">장면 1</button><span class="entry-brand">entry</span><b class="entry-lesson-title">하드웨어 연결</b></div><aside class="entry-tabs"><div class="entry-tab hardware-tab" aria-label="하드웨어"><img class="entry-tab-image entry-tab-image-unselected" src="${asset}tab14_hardware_unselected.png" alt="하드웨어"><img class="entry-tab-image entry-tab-image-selected" src="${asset}tab14_hardware_selected.png" alt=""></div></aside><div class="hc-content"><h2></h2><div class="hc-usb"><div><img src="${asset}OrangeBoard.png" alt="오렌지보드"><strong>오렌지보드 · Micro USB 5핀</strong></div><svg viewBox="0 0 250 180" role="img" aria-label="Micro USB 5핀과 USB 케이블"><path d="M20 90 H230" stroke="#526579" stroke-width="14"/><rect x="0" y="60" width="45" height="60" rx="8" fill="#929da7"/><rect x="205" y="70" width="45" height="40" rx="4" fill="#929da7"/><text x="125" y="150" text-anchor="middle" font-size="24">USB 케이블</text></svg><div><svg viewBox="0 0 260 210" role="img" aria-label="컴퓨터 USB 포트"><rect x="20" y="10" width="220" height="145" rx="10" fill="#51677b"/><rect x="32" y="22" width="196" height="120" fill="#d6efff"/><path d="M130 155 V185 M70 190 H190" stroke="#51677b" stroke-width="16"/><rect x="201" y="90" width="26" height="12" fill="#263645"/></svg><strong>컴퓨터 · USB</strong></div></div><div class="hc-entry"><div class="hc-connect-buttons"><button data-hc-action="tab">하드웨어 연결하기</button><button data-hc-action="open">연결 프로그램 열기</button></div><div class="hc-program-window" role="dialog" aria-label="엔트리 하드웨어 연결 프로그램" hidden><button class="entry-result-close hc-program-close" aria-label="연결 프로그램 닫기">×</button><img class="hc-program-shot" alt="교과서의 엔트리 하드웨어 연결 프로그램"></div><p class="hc-install">처음 연결하는 컴퓨터는 드라이버 설치가 필요합니다.<br>엔트리 첫 연결 또는 다른 언어로 사용한 뒤에는 펌웨어를 설치합니다.</p><div class="hc-block-list"><div class="entry-block hardware-block entry-show"><b>디지털</b><span class="field">13 ▼</span><b>번 핀</b><span class="field">켜기 ▼</span></div><div class="entry-block hardware-block entry-show"><b>디지털</b><span class="field">3 ▼</span><b>번 핀을</b><span class="number-field">255</span><b>(으)로 정하기</b></div><div class="entry-block hardware-block entry-show"><b>디지털</b><span class="field">3 ▼</span><b>번 핀의 서보모터를</b><span class="number-field">90</span><b>의 각도로 정하기</b></div></div></div></div></div><div class="hc-overlay" hidden><div class="entry-result-card hc-result" role="dialog" aria-modal="true" aria-label="오렌지보드 연결 결과"><button class="entry-result-close" aria-label="닫기">×</button><div class="hc-board"><img src="${asset}OrangeBoard.png" alt="오렌지보드 ON 및 RX LED 위치"><span class="hc-led hc-on"></span><span class="hc-led hc-rx"></span></div><p></p></div></div>`;
  original[1].after(page);
  let active = false,
    step = 0,
    bypass = false,
    resume = null;
  const overlay = page.querySelector(".hc-overlay");
  const titles = [
    "오렌지보드와 컴퓨터를 USB 케이블로 연결하세요.",
    "USB 연결 결과를 확인하세요.",
    "블록 탭에서 하드웨어를 선택하세요.",
    "연결 프로그램 열기를 누르세요.",
    "검색 창에서 오렌지 보드를 검색한 후 선택하세요.",
    "하드웨어 연결 성공을 확인하세요.",
  ];
  function close() {
    overlay.hidden = true;
    page.querySelector(".hc-program-window").hidden = true;
    page.querySelector(".hc-rx").classList.remove("hc-blinking");
  }
  function render() {
    close();
    const rxStep = step === 5;
    page.classList.toggle("hc-success-rx", rxStep);
    page.querySelector("h2").textContent = titles[step];
    page.querySelector(".hc-usb").hidden = step >= 2;
    page.querySelector(".hc-entry").hidden = step < 2;
    page
      .querySelector(".hardware-tab")
      .classList.toggle("active-tab", step >= 3);
    page.querySelector(".hc-connect-buttons").hidden = step >= 6;
    page.querySelector('[data-hc-action="tab"]').hidden = step >= 4;
    page.querySelector(".hc-entry").classList.toggle("hc-connected", step >= 5);
    page
      .querySelector('[data-hc-action="open"]')
      .classList.toggle("hc-focus", step === 3);
    page
      .querySelector(".hardware-tab")
      .classList.toggle("hc-focus", step === 2);
    const shot = page.querySelector(".hc-program-shot");
    page.querySelector(".hc-program-window").hidden = step < 4 || step >= 6;
    shot.src =
      asset +
      (step === 4
        ? "hardware-connect-select.png"
        : "hardware-connect-success.png");
    page.querySelector(".hc-install").hidden = true;
    page.querySelector(".hc-block-list").hidden = step < 5;
    if (step === 1 || rxStep) {
      overlay.hidden = false;
      page.querySelector(".hc-rx").hidden = !rxStep;
      page.querySelector(".hc-rx").classList.toggle("hc-blinking", rxStep);
      overlay.querySelector("p").textContent =
        step === 1
          ? "USB를 연결하면 ON LED가 켜집니다."
          : "연결 후 데이터가 오갈 때 RX LED가 깜빡입니다.";
    }
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
    '<span class="sidebar-page-no">'+window.lessonPages.number(page)+'</span><span>' + "하드웨어 연결" + '</span>';
  const list = q("#slideSidebarList");
  list.children[1].after(sidebar);
  [...list.children].forEach((button, i) => { button.querySelector(".sidebar-page-no").textContent = i + 1; });;
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
  page.querySelector(".hc-program-close").addEventListener("click", () => {
    if (step === 5) { close(); return; }
    page.querySelector(".hc-program-window").hidden = true;
    page.querySelector(".hc-install").hidden = true;
  });
  window.lessonUI.bindOutside({key:'hardware-result',isOpen:()=>!overlay.hidden,inside:'.hc-result',close});
  page.querySelector(".hc-entry").addEventListener("click", e => {
    if (step === 5 && !e.target.closest(".hc-program-window")) {
      close();
      page.querySelector(".hc-program-window").hidden = true;
      page.querySelector(".hc-install").hidden = true;
    }
  });
  page.querySelector(".hardware-tab").addEventListener("click", () => {
    if (step === 2) move(1);
  });
  page
    .querySelector('[data-hc-action="open"]')
    .addEventListener("click", () => {
      if (step === 3) move(1);
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



