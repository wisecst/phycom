/* =========================================================
   CIRCUIT EDITOR - PINS
========================================================= */


/* =========================================================
   PIN NAME
========================================================= */

function getDisplayPinName(name) {

  // GND1, GND2 등은 화면에서 GND로 표시
  if (/^GND\d*$/i.test(name)) {
    return "GND";
  }

  return name;
}


/* =========================================================
   PIN TYPE
========================================================= */

function isGroundPin(name) {
  return /^GND\d*$/i.test(name);
}


function isPowerPin(name) {
  return /^(VCC|5V|3\.3V)$/i.test(name);
}


/* =========================================================
   DRAW PINS
========================================================= */

function drawPins(
  pinLayer,
  component,
  definition
) {

  pinLayer.innerHTML = "";


  component.pins.forEach(
    (pin, index) => {

      const pinElement =
        document.createElement("div");


      pinElement.className = "pin";


      pinElement.style.left =
        Number(pin.x) * 100 + "%";

      pinElement.style.top =
        Number(pin.y) * 100 + "%";


      /*
         핀 정보를 DOM에 저장한다.

         routing.js에서도 이 값을 사용하므로
         x/y 좌표를 반드시 보존한다.
      */

      pinElement.dataset.component =
        definition.containerId;

      pinElement.dataset.componentId =
        component.id;

      pinElement.dataset.role =
        definition.role;

      pinElement.dataset.pin =
        pin.name;

      pinElement.dataset.pinIndex =
        index;

      pinElement.dataset.pinX =
        Number(pin.x);

      pinElement.dataset.pinY =
        Number(pin.y);


      /* --------------------------
         PIN LABEL
      -------------------------- */

      const label =
        document.createElement("div");

      label.className =
        "pin-label";

      label.textContent =
        getDisplayPinName(
          pin.name
        );


      pinElement.appendChild(
        label
      );


      /* --------------------------
         CLICK
      -------------------------- */

      pinElement.addEventListener(
        "click",
        function(event) {

          event.stopPropagation();

          selectPin(
            pinElement
          );

        }
      );


      pinLayer.appendChild(
        pinElement
      );

    }
  );

}


/* =========================================================
   PIN POSITION
========================================================= */

function getPinPosition(pin) {

  const workspace =
    document.getElementById(
      "workspace"
    );


  const workspaceRect =
    workspace.getBoundingClientRect();

  const pinRect =
    pin.getBoundingClientRect();


  return {

    x:
      pinRect.left +
      pinRect.width / 2 -
      workspaceRect.left,

    y:
      pinRect.top +
      pinRect.height / 2 -
      workspaceRect.top

  };

}


/* =========================================================
   SELECT PIN

   selectedPin / wires / createWire()는
   wires.js에서 관리한다.
========================================================= */

function selectPin(pin) {

  const statusBox =
    document.getElementById(
      "status"
    );


  if (plannedConnections.length > 0) {
    statusBox.textContent = "단계별 연결 중입니다. 수동 연결은 배선 전체 삭제 후 시작하세요.";
    return;
  }

  if (isCircuitComplete()) {
    return;
  }


  /* --------------------------
     첫 번째 핀 선택
  -------------------------- */

  if (!selectedPin) {

    selectedPin = pin;

    pin.classList.add(
      "selected"
    );


    statusBox.textContent =
      getDisplayPinName(
        pin.dataset.pin
      ) +
      " 선택됨 → 연결할 핀을 선택하세요.";


    return;
  }


  /* --------------------------
     같은 핀 다시 클릭
  -------------------------- */

  if (selectedPin === pin) {

    selectedPin.classList.remove(
      "selected"
    );

    selectedPin = null;


    statusBox.textContent =
      "핀 선택이 취소되었습니다.";


    return;
  }


  /* --------------------------
     같은 부품끼리는 연결 금지
  -------------------------- */

  if (
    selectedPin.dataset.component ===
    pin.dataset.component
  ) {

    statusBox.textContent =
      "서로 다른 부품의 핀을 선택하세요.";

    return;
  }


  /* --------------------------
     배선 생성
  -------------------------- */

  createWire(
    selectedPin,
    pin
  );


  selectedPin.classList.remove(
    "selected"
  );

  selectedPin = null;


  if (isCircuitComplete()) {

    statusBox.textContent =
      "연결이 완료되었습니다.";

  }

  else {

    statusBox.textContent =
      "배선이 연결되었습니다.";

  }

}


/* =========================================================
   CIRCUIT COMPLETE

   현재 모듈의 모든 핀이 연결되면 완료.
========================================================= */

function isCircuitComplete() {

  const moduleContainer =
    getModuleContainer();


  if (!moduleContainer) {
    return false;
  }


  const modulePins =
    Array.from(
      moduleContainer.querySelectorAll(
        ".pin"
      )
    );


  if (modulePins.length === 0) {
    return false;
  }


  return modulePins.every(
    pin =>

      wires.some(
        wire =>
          wire.pinA === pin ||
          wire.pinB === pin
      )
  );

}


/* =========================================================
   PIN VISIBILITY
========================================================= */

function updatePinVisibility() {

  const workspace =
    document.getElementById(
      "workspace"
    );


  const allPins =
    document.querySelectorAll(
      ".pin"
    );


  /* --------------------------
     회로 미완성
  -------------------------- */

  if (!isCircuitComplete()) {

    workspace.classList.remove(
      "circuit-complete"
    );


    allPins.forEach(
      pin =>

        pin.classList.remove(
          "hidden-pin"
        )
    );


    return;
  }


  /* --------------------------
     회로 완성
  -------------------------- */

  workspace.classList.add(
    "circuit-complete"
  );


  const connectedPins =
    new Set();


  wires.forEach(
    wire => {

      connectedPins.add(
        wire.pinA
      );

      connectedPins.add(
        wire.pinB
      );

    }
  );


  /*
     연결된 핀은 남기고
     사용하지 않은 보드 핀은 숨긴다.
  */

  allPins.forEach(
    pin => {

      if (
        connectedPins.has(pin)
      ) {

        pin.classList.remove(
          "hidden-pin"
        );

      }

      else {

        pin.classList.add(
          "hidden-pin"
        );

      }

    }
  );

}
