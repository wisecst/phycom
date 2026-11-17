/* =========================================================
   CIRCUIT EDITOR - APP
========================================================= */


/* =========================================================
   CHANGE MODULE
========================================================= */

async function changeModule(moduleKey) {

  if (!MODULES[moduleKey]) {
    return;
  }


  const wireLayer =
    document.getElementById("wireLayer");

  const wireLabelLayer =
    document.getElementById("wireLabelLayer");

  const workspace =
    document.getElementById("workspace");

  const statusBox =
    document.getElementById("status");


  /* 기존 배선 삭제 */

  clearCircuit();
  wires = [];

  wireLayer.innerHTML = "";
  wireLabelLayer.innerHTML = "";


  /* 선택 중인 핀 해제 */

  if (selectedPin) {

    selectedPin.classList.remove(
      "selected"
    );

    selectedPin = null;

  }


  workspace.classList.remove(
    "circuit-complete"
  );


  /* 현재 모듈 변경 */

  currentModuleKey =
    moduleKey;


  statusBox.textContent =
    "모듈을 불러오는 중입니다.";


  /* 새 모듈만 다시 로드 */

  await loadComponent(
    MODULES[currentModuleKey]
  );


  resizeComponents();

  updatePinVisibility();


  requestAnimationFrame(
    drawWires
  );


  statusBox.textContent =
    "핀을 선택하세요.";

}


/* =========================================================
   MODULE SELECT
========================================================= */

function setupModuleSelector() {

  const moduleSelect =
    document.getElementById(
      "moduleSelect"
    );


  if (!moduleSelect) {
    return;
  }


  moduleSelect.value =
    currentModuleKey;


  moduleSelect.addEventListener(
    "change",

    async function() {

      try {

        await changeModule(
          moduleSelect.value
        );

      }

      catch (error) {

        console.error(error);


        const statusBox =
          document.getElementById(
            "status"
          );


        statusBox.textContent =
          "모듈을 불러오지 못했습니다.";

      }

    }
  );

}


/* =========================================================
   CLEAR BUTTON
========================================================= */

function setupClearButton() {

  const clearButton =
    document.getElementById(
      "clearButton"
    );


  if (!clearButton) {
    return;
  }


  clearButton.addEventListener(
    "click",
    clearCircuit
  );

}


/* =========================================================
   WINDOW RESIZE
========================================================= */

function setupResize() {

  window.addEventListener(
    "resize",

    function() {

      resizeComponents();


      /*
         이미지 크기 변경이 DOM에 적용된 뒤
         핀 좌표를 다시 읽어 배선을 그린다.
      */

      requestAnimationFrame(
        function() {

          requestAnimationFrame(
            drawWires
          );

        }
      );

    }
  );

}


/* =========================================================
   START
========================================================= */

async function start() {

  const statusBox =
    document.getElementById(
      "status"
    );


  try {

    statusBox.textContent =
      "부품을 불러오는 중입니다.";


    /* OrangeBoard */

    await loadComponent(
      BOARD_COMPONENT
    );


    /* 현재 선택된 모듈 */

    await loadComponent(
      MODULES[currentModuleKey]
    );


    resizeComponents();

    updatePinVisibility();


    requestAnimationFrame(
      drawWires
    );


    statusBox.textContent =
      "핀을 선택하세요.";

  }

  catch (error) {

    console.error(error);

    statusBox.textContent =
      "부품을 불러오지 못했습니다.";

  }

}


/* =========================================================
   INITIALIZE
========================================================= */

function initializeEditor() {

  document.getElementById("moduleSelect").disabled = true;
  setupModuleSelector();

  setupClearButton();

  setupResize();

  start().finally(() => { document.getElementById("moduleSelect").disabled = false; });

}


/*
   index.html의 DOM 생성이 끝난 뒤 실행
*/

document.addEventListener(
  "DOMContentLoaded",
  initializeEditor
);
