/* =========================================================
   CIRCUIT EDITOR - WIRES
========================================================= */


/* =========================================================
   STATE
========================================================= */

let selectedPin = null;

let wires = [];

/*
   단계별 연결 표시 상태
*/

let plannedConnections = [];

let currentConnectionStep = 0;


/* =========================================================
   WIRE ENDS
========================================================= */

function getWireEnds(wire) {

  let modulePin = null;
  let boardPin = null;


  if (wire.pinA.dataset.role === "module") {
    modulePin = wire.pinA;
  }

  if (wire.pinB.dataset.role === "module") {
    modulePin = wire.pinB;
  }


  if (wire.pinA.dataset.role === "board") {
    boardPin = wire.pinA;
  }

  if (wire.pinB.dataset.role === "board") {
    boardPin = wire.pinB;
  }


  return {
    modulePin,
    boardPin
  };
}


/* =========================================================
   SIGNAL COLOR
========================================================= */

function getSignalColor(pinA, pinB) {

  let modulePin = null;


  if (pinA.dataset.role === "module") {
    modulePin = pinA;
  }

  if (pinB.dataset.role === "module") {
    modulePin = pinB;
  }


  if (!modulePin) {
    modulePin = pinA;
  }


  const moduleContainer =
    document.getElementById(
      modulePin.dataset.component
    );


  const signalPins =
    Array.from(
      moduleContainer.querySelectorAll(".pin")
    )
    .filter(
      pin =>
        !isGroundPin(pin.dataset.pin) &&
        !isPowerPin(pin.dataset.pin)
    );


  const index =
    Math.max(
      0,
      signalPins.indexOf(modulePin)
    );


  return SIGNAL_COLORS[
    index % SIGNAL_COLORS.length
  ];
}


/* =========================================================
   WIRE COLOR
========================================================= */

function getWireColor(pinA, pinB) {

  const names = [
    pinA.dataset.pin,
    pinB.dataset.pin
  ];


  if (names.some(isGroundPin)) {
    return GROUND_COLOR;
  }


  if (names.some(isPowerPin)) {
    return POWER_COLOR;
  }


  return getSignalColor(
    pinA,
    pinB
  );
}


/* =========================================================
   FIND PIN

   화면에 이미 그려진 핀 중에서
   이름으로 핀 요소를 찾는다.
========================================================= */

function findPin(role, pinName) {

  const pins =
    document.querySelectorAll(
      `.pin[data-role="${role}"]`
    );


  return Array.from(pins).find(
    pin =>
      pin.dataset.pin === pinName
  ) || null;
}


/* =========================================================
   CREATE WIRE

   기존 수동 연결 기능과도 호환되도록 유지한다.
========================================================= */

function createWire(pinA, pinB) {

  const statusBox =
    document.getElementById("status");


  if (!pinA || !pinB) {
    return;
  }


  const duplicate =
    wires.some(
      wire =>
        (
          wire.pinA === pinA &&
          wire.pinB === pinB
        )
        ||
        (
          wire.pinA === pinB &&
          wire.pinB === pinA
        )
    );


  if (duplicate) {

    if (statusBox) {
      statusBox.textContent =
        "이미 연결된 핀입니다.";
    }

    return;
  }


  const pinAlreadyUsed =
    wires.some(
      wire =>
        wire.pinA === pinA ||
        wire.pinB === pinA ||
        wire.pinA === pinB ||
        wire.pinB === pinB
    );


  if (pinAlreadyUsed) {

    if (statusBox) {
      statusBox.textContent =
        "이미 사용 중인 핀입니다.";
    }

    return;
  }


  wires.push({
    pinA,
    pinB,

    color:
      getWireColor(
        pinA,
        pinB
      )
  });


  drawWires();

  updatePinVisibility();
}


/* =========================================================
   SET CONNECTION PLAN

   connection-panel.js에서 선택한 연결 정보를 받는다.
========================================================= */

function setConnectionPlan(connections) {

  if (selectedPin) selectedPin.classList.remove("selected");
  selectedPin = null;
  plannedConnections =
    connections.map(
      connection => ({
        from: connection.from,
        to: connection.to
      })
    );


  currentConnectionStep = 0;

  wires = [];


  drawWires();

  updatePinVisibility();

  updateConnectionStepDisplay();
}


/* =========================================================
   SHOW CONNECTIONS TO STEP
========================================================= */

function showConnectionsToStep(step) {

  const statusBox =
    document.getElementById("status");


  const targetStep =
    clamp(
      step,
      0,
      plannedConnections.length
    );


  /*
     현재 배선을 전부 다시 구성한다.

     이렇게 하면 이전/다음 이동 시
     상태가 꼬이지 않는다.
  */

  wires = [];


  for (
    let i = 0;
    i < targetStep;
    i++
  ) {

    const connection =
      plannedConnections[i];


    const modulePin =
      findPin(
        "module",
        connection.from
      );


    const boardPin =
      findPin(
        "board",
        connection.to
      );


    if (
      !modulePin ||
      !boardPin
    ) {

      console.warn(
        "핀을 찾을 수 없습니다:",
        connection
      );

      continue;
    }


    wires.push({
      pinA: modulePin,
      pinB: boardPin,

      color:
        getWireColor(
          modulePin,
          boardPin
        )
    });
  }


  currentConnectionStep =
    targetStep;


  drawWires();

  updatePinVisibility();

  updateConnectionStepDisplay();


  if (statusBox) {

    if (targetStep === 0) {

      statusBox.textContent =
        "연결 과정을 시작하세요.";

    }

    else {

      const current =
        plannedConnections[
          targetStep - 1
        ];


      statusBox.textContent =
        `${current.from} → ${current.to}`;

    }

  }
}


/* =========================================================
   NEXT CONNECTION
========================================================= */

function nextConnectionStep() {

  if (
    currentConnectionStep >=
    plannedConnections.length
  ) {
    return;
  }


  showConnectionsToStep(
    currentConnectionStep + 1
  );
}


/* =========================================================
   PREVIOUS CONNECTION
========================================================= */

function previousConnectionStep() {

  if (
    currentConnectionStep <= 0
  ) {
    return;
  }


  showConnectionsToStep(
    currentConnectionStep - 1
  );
}


/* =========================================================
   DRAW WIRES
========================================================= */

function drawWires() {

  const workspace =
    document.getElementById("workspace");

  const wireLayer =
    document.getElementById("wireLayer");

  const wireLabelLayer =
    document.getElementById(
      "wireLabelLayer"
    );


  if (
    !workspace ||
    !wireLayer ||
    !wireLabelLayer
  ) {
    return;
  }


  wireLayer.innerHTML = "";
  wireLabelLayer.innerHTML = "";


  if (wires.length === 0) {
    return;
  }


  const workspaceRect =
    workspace.getBoundingClientRect();


  const boardContainer =
    getBoardContainer();


  if (!boardContainer) {
    return;
  }


  const boardRect =
    boardContainer.getBoundingClientRect();


  const boardLeft =
    boardRect.left -
    workspaceRect.left;

  const boardTop =
    boardRect.top -
    workspaceRect.top;

  const boardBottom =
    boardRect.bottom -
    workspaceRect.top;


  const topLaneMap =
    getTopLaneMap(
      boardTop,
      boardBottom
    );


  const bottomLaneMap =
    getBottomLaneMap(
      boardTop,
      boardBottom
    );


  wires.forEach(
    wire => {

      const ends =
        getWireEnds(wire);


      if (
        !ends.modulePin ||
        !ends.boardPin
      ) {
        return;
      }


      const points =
        buildWirePoints(
          wire,

          boardLeft,
          boardTop,
          boardBottom,

          topLaneMap,
          bottomLaneMap
        );


      const path =
        document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );


      path.setAttribute(
        "d",
        pointsToPath(points)
      );

      path.setAttribute(
        "class",
        "wire"
      );

      path.setAttribute(
        "stroke",
        wire.color
      );


      wireLayer.appendChild(path);


      drawWireLabel(
        wire,
        ends,
        points,
        boardTop,
        boardBottom
      );

    }
  );
}


/* =========================================================
   CLEAR CIRCUIT
========================================================= */

function clearCircuit() {

  const wireLayer =
    document.getElementById("wireLayer");

  const wireLabelLayer =
    document.getElementById(
      "wireLabelLayer"
    );

  const statusBox =
    document.getElementById("status");


  wires = [];
  plannedConnections = [];

  currentConnectionStep = 0;


  if (wireLayer) {
    wireLayer.innerHTML = "";
  }


  if (wireLabelLayer) {
    wireLabelLayer.innerHTML = "";
  }


  if (selectedPin) {

    selectedPin.classList.remove(
      "selected"
    );

    selectedPin = null;

  }


  updatePinVisibility();

  updateConnectionStepDisplay();


  if (statusBox) {

    statusBox.textContent =
      "연결 과정을 시작하세요.";

  }
}
