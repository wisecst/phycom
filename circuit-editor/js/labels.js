/* =========================================================
   CIRCUIT EDITOR - LABELS
========================================================= */


/* =========================================================
   WIRE LABEL TEXT
========================================================= */

function getWireLabel(wire) {

  const ends = getWireEnds(wire);

  if (!ends.modulePin || !ends.boardPin) {
    return "";
  }

  return (
    getDisplayPinName(ends.modulePin.dataset.pin)
    + " → "
    + getDisplayPinName(ends.boardPin.dataset.pin)
  );
}


/* =========================================================
   GET MODULE PIN ORDER

   같은 방향으로 배치된 모듈 핀의
   원래 위치 순서를 구한다.

   left / right :
   위 → 아래

   top / bottom :
   왼쪽 → 오른쪽
========================================================= */

function getModuleSidePinOrder(modulePin) {

  const pins =
    getSameSidePins(modulePin);

  return Math.max(
    0,
    pins.indexOf(modulePin)
  );
}


/* =========================================================
   GET SIMILAR ROUTE WIRES
========================================================= */

function getSimilarRouteWires(
  moduleSide,
  boardSide,
  boardTop,
  boardBottom
) {

  const result =
    wires.filter(
      wire => {

        const ends =
          getWireEnds(wire);

        if (
          !ends.modulePin ||
          !ends.boardPin
        ) {
          return false;
        }

        return (
          getPinExitSide(
            ends.modulePin
          ) === moduleSide
          &&
          getBoardRouteSide(
            ends.boardPin,
            boardTop,
            boardBottom
          ) === boardSide
        );
      }
    );


  result.sort(
    (a, b) => {

      const aPin =
        getWireEnds(a).modulePin;

      const bPin =
        getWireEnds(b).modulePin;

      return (
        getModuleSidePinOrder(aPin)
        -
        getModuleSidePinOrder(bPin)
      );
    }
  );


  return result;
}


/* =========================================================
   BOTTOM PIN LABEL SLOT

   하단에 여러 핀이 있는 경우
   라벨 위치가 겹치지 않도록
   사용할 구간을 분산한다.

   예: 하단 핀이 4개라면

   핀 1 → 구간 1
   핀 2 → 구간 3
   핀 3 → 구간 4
   핀 4 → 구간 2

   따라서 한곳에 라벨이 몰리지 않는다.

   핀 이름은 사용하지 않는다.
========================================================= */

function getBottomPinLabelSlot(
  modulePin
) {

  const pins =
    getSameSidePins(modulePin);


  const order =
    Math.max(
      0,
      pins.indexOf(modulePin)
    );


  const count =
    pins.length;


  if (count <= 1) {
    return 0;
  }


  /*
     첫 핀 = 첫 구간
     마지막 핀 = 두 번째 구간

     가운데 핀들은
     세 번째 구간부터 순서대로 배치.
  */

  if (order === 0) {
    return 0;
  }


  if (order === count - 1) {
    return 1;
  }


  return order + 1;
}


/* =========================================================
   LABEL POSITION
========================================================= */

function getWireLabelPosition(
  wire,
  modulePin,
  boardPin,
  points,
  boardTop,
  boardBottom
) {

  const moduleSide =
    getPinExitSide(modulePin);


  const boardSide =
    getBoardRouteSide(
      boardPin,
      boardTop,
      boardBottom
    );


  let segmentIndex = 0;


  /* =======================================================
     BOTTOM PIN

     기존 초음파 센서 라벨 배치 유지.
  ======================================================= */

  if (moduleSide === "bottom") {

    const desiredSlot =
      getBottomPinLabelSlot(
        modulePin
      );


    segmentIndex =
      Math.min(
        desiredSlot,
        points.length - 2
      );

  }


  /* =======================================================
     LEFT / RIGHT PIN

     핀 순서에 따라 서로 다른
     배선 구간에 라벨을 배치한다.

     예:
     첫 번째 핀 → 첫 번째 구간
     두 번째 핀 → 두 번째 구간
     세 번째 핀 → 세 번째 구간
  ======================================================= */

  else if (
    moduleSide === "left" ||
    moduleSide === "right"
  ) {

    const order =
      getModuleSidePinOrder(
        modulePin
      );


    segmentIndex =
      Math.min(
        order,
        points.length - 2
      );

  }


  /* =======================================================
     TOP PIN
  ======================================================= */

  else {

    const order =
      getModuleSidePinOrder(
        modulePin
      );


    segmentIndex =
      Math.min(
        order,
        points.length - 2
      );

  }


  const segment =
    getSegmentCenter(
      points,
      segmentIndex
    );


  /* 수평 구간 */

  if (segment.horizontal) {

    return {
      x: segment.x,
      y: segment.y - 24
    };

  }


  /* 세로 구간 */

  return {
    x: segment.x - 72,
    y: segment.y
  };
}


/* =========================================================
   KEEP LABEL INSIDE WORKSPACE
========================================================= */

function keepLabelInsideWorkspace(
  label,
  position
) {

  const workspace =
    document.getElementById(
      "workspace"
    );


  label.style.left =
    position.x + "px";

  label.style.top =
    position.y + "px";


  const width =
    label.offsetWidth;

  const height =
    label.offsetHeight;

  const margin = 12;


  const x =
    clamp(
      position.x,
      width / 2 + margin,
      workspace.clientWidth
        - width / 2
        - margin
    );


  const y =
    clamp(
      position.y,
      height / 2 + margin,
      workspace.clientHeight
        - height / 2
        - margin
    );


  label.style.left =
    x + "px";

  label.style.top =
    y + "px";
}


/* =========================================================
   DRAW WIRE LABEL
========================================================= */

function drawWireLabel(
  wire,
  ends,
  points,
  boardTop,
  boardBottom
) {

  const wireLabelLayer =
    document.getElementById(
      "wireLabelLayer"
    );


  if (!wireLabelLayer) {
    return;
  }


  const label =
    document.createElement("div");


  label.className =
    "wire-label";


  label.textContent =
    getWireLabel(wire);


  label.style.backgroundColor =
    wire.color;


  if (wire.color === "#f2c200") {

    label.style.color =
      "#111111";

  }

  else {

    label.style.color =
      "#ffffff";

  }


  wireLabelLayer.appendChild(
    label
  );


  const position =
    getWireLabelPosition(
      wire,
      ends.modulePin,
      ends.boardPin,
      points,
      boardTop,
      boardBottom
    );


  keepLabelInsideWorkspace(
    label,
    position
  );
}