/* =========================================================
   CONNECTION PANEL
========================================================= */


/* =========================================================
   GET MODULE PINS
========================================================= */

function getCurrentModulePins() {

  const moduleContainer =
    getModuleContainer();


  if (!moduleContainer) {
    return [];
  }


  return Array.from(
    moduleContainer.querySelectorAll(".pin")
  );
}


/* =========================================================
   GET BOARD SIGNAL PINS
========================================================= */

function getSelectableBoardPins() {

  const boardContainer =
    getBoardContainer();


  if (!boardContainer) {
    return [];
  }


  return Array.from(
    boardContainer.querySelectorAll(".pin")
  )
  .filter(
    pin => {

      const name =
        pin.dataset.pin;

      /*
         VCC/GND는 자동 연결하므로
         신호 핀 선택창에서는 제외.
      */

      return (
        !isPowerPin(name) &&
        !isGroundPin(name)
      );

    }
  );
}


/* =========================================================
   BUILD CONNECTION PANEL
========================================================= */

function buildConnectionPanel() {

  const panel =
    document.getElementById(
      "connectionPanel"
    );


  if (!panel) {
    return;
  }


  panel.innerHTML = "";


  const modulePins =
    getCurrentModulePins();


  const boardPins =
    getSelectableBoardPins();


  if (
    modulePins.length === 0 ||
    boardPins.length === 0
  ) {
    return;
  }


  modulePins.forEach(
    modulePin => {

      const pinName =
        modulePin.dataset.pin;


      const row =
        document.createElement("div");


      row.className =
        "connection-row";


      const from =
        document.createElement("span");


      from.className =
        "connection-from";


      from.textContent =
        pinName;


      const arrow =
        document.createElement("span");


      arrow.textContent = "→";


      row.appendChild(from);

      row.appendChild(arrow);


      /* ===================================================
         VCC → 5V 고정
      =================================================== */

      if (isPowerPin(pinName)) {

        const fixed =
          document.createElement("span");


        fixed.className =
          "connection-fixed";


        fixed.textContent =
          "5V";


        row.dataset.from =
          pinName;

        row.dataset.to =
          "5V";


        row.appendChild(fixed);

      }


      /* ===================================================
         GND → GND2 고정
      =================================================== */

      else if (isGroundPin(pinName)) {

        const fixed =
          document.createElement("span");


        fixed.className =
          "connection-fixed";


        fixed.textContent =
          "GND2";


        row.dataset.from =
          pinName;

        row.dataset.to =
          "GND2";


        row.appendChild(fixed);

      }


      /* ===================================================
         SIGNAL PIN
      =================================================== */

      else {

        const select =
          document.createElement(
            "select"
          );


        select.className =
          "connection-select";


        select.dataset.from =
          pinName;


        boardPins.forEach(
          boardPin => {

            const option =
              document.createElement(
                "option"
              );


            option.value =
              boardPin.dataset.pin;


            option.textContent =
              getDisplayPinName(
                boardPin.dataset.pin
              );


            select.appendChild(
              option
            );

          }
        );


        select.setAttribute("aria-label", pinName + " 연결 핀");
        const signalIndex = panel.querySelectorAll(".connection-select").length;
        const defaultPin = "D" + (2 + signalIndex);
        if (boardPins.some(pin => pin.dataset.pin === defaultPin)) select.value = defaultPin;
        select.addEventListener("change", () => {
          clearCircuit();
          document.getElementById("status").textContent = "설정이 변경되었습니다. 연결 과정 시작을 눌러주세요.";
        });
        row.appendChild(select);

      }


      panel.appendChild(row);

    }
  );


  /* =======================================================
     START BUTTON
  ======================================================= */

  const startButton =
    document.createElement("button");


  startButton.type =
    "button";


  startButton.className =
    "connection-start";


  startButton.textContent =
    "연결 과정 시작";


  startButton.addEventListener(
    "click",
    startConnectionPresentation
  );


  panel.appendChild(
    startButton
  );


  /* =======================================================
     STEP CONTROLS
  ======================================================= */

  const controls =
    document.createElement("div");


  controls.className =
    "connection-step-controls";


  controls.innerHTML = `
    <button
      type="button"
      id="previousConnectionButton"
    >
      ◀ 이전
    </button>

    <span id="connectionStepDisplay">
      0 / 0
    </span>

    <button
      type="button"
      id="nextConnectionButton"
    >
      다음 ▶
    </button>
  `;


  panel.appendChild(
    controls
  );


  document
    .getElementById(
      "previousConnectionButton"
    )
    .addEventListener(
      "click",
      previousConnectionStep
    );


  document
    .getElementById(
      "nextConnectionButton"
    )
    .addEventListener(
      "click",
      nextConnectionStep
    );


  updateConnectionStepDisplay();
}


/* =========================================================
   READ CONNECTION SETTINGS
========================================================= */

function readConnectionSettings() {

  const panel =
    document.getElementById(
      "connectionPanel"
    );


  if (!panel) {
    return [];
  }


  const result = [];


  const rows =
    panel.querySelectorAll(
      ".connection-row"
    );


  rows.forEach(
    row => {

      const select =
        row.querySelector(
          ".connection-select"
        );


      if (select) {

        result.push({
          from:
            select.dataset.from,

          to:
            select.value
        });

        return;
      }


      if (
        row.dataset.from &&
        row.dataset.to
      ) {

        result.push({
          from:
            row.dataset.from,

          to:
            row.dataset.to
        });

      }

    }
  );


  return result;
}


/* =========================================================
   START PRESENTATION
========================================================= */

function startConnectionPresentation() {

  const connections =
    readConnectionSettings();


  if (connections.length === 0) {
    return;
  }


  /*
     같은 보드 핀을 두 신호가 선택한 경우 방지
  */

  const targets =
    connections.map(
      connection =>
        connection.to
    );


  const duplicateTargets =
    targets.filter(
      (target, index) =>
        targets.indexOf(target)
        !== index
    );


  if (duplicateTargets.length > 0) {

    const statusBox =
      document.getElementById(
        "status"
      );


    if (statusBox) {

      statusBox.textContent =
        "같은 보드 핀을 두 번 선택할 수 없습니다.";

    }


    return;
  }


  setConnectionPlan(
    connections
  );


  const statusBox =
    document.getElementById(
      "status"
    );


  if (statusBox) {

    statusBox.textContent =
      "다음 ▶ 을 눌러 연결 과정을 확인하세요.";

  }
}


/* =========================================================
   STEP DISPLAY
========================================================= */

function updateConnectionStepDisplay() {

  const display =
    document.getElementById(
      "connectionStepDisplay"
    );


  const previous = document.getElementById("previousConnectionButton");
  const next = document.getElementById("nextConnectionButton");
  if (previous) previous.disabled = currentConnectionStep <= 0;
  if (next) next.disabled = currentConnectionStep >= plannedConnections.length;

  if (!display) {
    return;
  }


  display.textContent =
    `${currentConnectionStep} / ${plannedConnections.length}`;
}
