/* =========================================================
   CIRCUIT EDITOR - ROUTING
========================================================= */


/* =========================================================
   PIN EXIT SIDE

   부품 이름을 사용하지 않는다.
   component.json의 핀 좌표를 기준으로
   가장 가까운 가장자리를 출구 방향으로 판단한다.
========================================================= */

function getPinExitSide(pin) {

  const x = Number(pin.dataset.pinX);
  const y = Number(pin.dataset.pinY);

  const distances = {
    left: x,
    right: 1 - x,
    top: y,
    bottom: 1 - y
  };

  let side = "right";
  let minimum = Infinity;

  Object.entries(distances).forEach(
    ([key, value]) => {

      if (value < minimum) {
        minimum = value;
        side = key;
      }

    }
  );

  return side;
}


/* =========================================================
   SAME-SIDE PIN ORDER

   같은 방향으로 나가는 핀들끼리만 정렬한다.

   left / right :
   위 → 아래

   top / bottom :
   왼쪽 → 오른쪽
========================================================= */

function getSameSidePins(modulePin) {

  const container =
    getModuleContainer();

  if (!container) {
    return [];
  }

  const side =
    getPinExitSide(modulePin);

  const pins =
    Array.from(
      container.querySelectorAll(".pin")
    )
    .filter(
      pin =>
        getPinExitSide(pin) === side
    );


  if (
    side === "left" ||
    side === "right"
  ) {

    pins.sort(
      (a, b) =>
        Number(a.dataset.pinY) -
        Number(b.dataset.pinY)
    );

  }
  else {

    pins.sort(
      (a, b) =>
        Number(a.dataset.pinX) -
        Number(b.dataset.pinX)
    );

  }

  return pins;
}


function getSameSidePinOrder(modulePin) {

  return getSameSidePins(
    modulePin
  ).indexOf(modulePin);

}


/* =========================================================
   MODULE EXIT POINT

   같은 방향의 핀이 여러 개 있으면
   첫 꺾임 거리를 서로 다르게 해서
   배선이 겹치지 않게 한다.

   left / right 핀은
   조금 더 길게 수평 이동한 뒤 꺾는다.
========================================================= */

function getModuleExitPoint(
  modulePin,
  start
) {

  const side =
    getPinExitSide(modulePin);

  const order =
    Math.max(
      0,
      getSameSidePinOrder(modulePin)
    );


  /*
     오른쪽/왼쪽 핀은
     기존보다 70px 더 길게 빠져나간다.

     bottom/top 핀에는 적용하지 않는다.
  */

  const horizontalExtra =
    (
      side === "right" ||
      side === "left"
    )
      ? 70
      : 0;


  const distance =
    PIN_EXIT_BASE +
    horizontalExtra +
    order * PIN_EXIT_SPACING;


  switch (side) {

    case "right":

      return {
        side,
        point: {
          x: start.x + distance,
          y: start.y
        }
      };


    case "left":

      return {
        side,
        point: {
          x: start.x - distance,
          y: start.y
        }
      };


    case "top":

      return {
        side,
        point: {
          x: start.x,
          y: start.y - distance
        }
      };


    default:

      return {
        side: "bottom",
        point: {
          x: start.x,
          y: start.y + distance
        }
      };

  }

}


/* =========================================================
   BOARD ROUTE SIDE

   보드 핀이 보드 위쪽과 아래쪽 중
   어디에 가까운지 판단한다.
========================================================= */

function getBoardRouteSide(
  boardPin,
  boardTop,
  boardBottom
) {

  const end =
    getPinPosition(boardPin);

  const topDistance =
    Math.abs(
      end.y - boardTop
    );

  const bottomDistance =
    Math.abs(
      boardBottom - end.y
    );

  return (
    topDistance < bottomDistance
      ? "top"
      : "bottom"
  );

}


/* =========================================================
   TOP LANE MAP

   보드 위쪽으로 들어가는 배선들이
   서로 다른 수평 통로를 사용하도록 한다.
========================================================= */

function getTopLaneMap(
  boardTop,
  boardBottom
) {

  const topItems = [];


  wires.forEach(
    wire => {

      const ends =
        getWireEnds(wire);

      if (!ends.boardPin) {
        return;
      }

      if (
        getBoardRouteSide(
          ends.boardPin,
          boardTop,
          boardBottom
        ) === "top"
      ) {

        topItems.push(wire);

      }

    }
  );


  /*
     보드 핀의 x 위치 기준 정렬.
     사용자가 연결한 순서와 무관하게
     같은 배치가 나오도록 한다.
  */

  topItems.sort(
    (a, b) => {

      const aEnd =
        getPinPosition(
          getWireEnds(a).boardPin
        );

      const bEnd =
        getPinPosition(
          getWireEnds(b).boardPin
        );

      return aEnd.x - bEnd.x;

    }
  );


  const map = new Map();

  if (topItems.length === 0) {
    return map;
  }


  const desiredHighestY =
    boardTop -
    BOARD_LANE_MARGIN -
    (
      (topItems.length - 1) *
      LANE_SPACING
    );


  const shiftDown =
    Math.max(
      0,
      SAFE_MARGIN -
      desiredHighestY
    );


  topItems.forEach(
    (wire, index) => {

      const reverseIndex =
        topItems.length -
        1 -
        index;

      const y =
        boardTop -
        BOARD_LANE_MARGIN -
        reverseIndex *
        LANE_SPACING +
        shiftDown;

      map.set(
        wire,
        y
      );

    }
  );


  return map;
}


/* =========================================================
   BOTTOM LANE MAP

   보드 아래쪽으로 들어가는 배선들도
   각각 별도의 수평 통로를 사용한다.
========================================================= */

function getBottomLaneMap(
  boardTop,
  boardBottom
) {

  const bottomItems = [];


  wires.forEach(
    wire => {

      const ends =
        getWireEnds(wire);

      if (!ends.boardPin) {
        return;
      }

      if (
        getBoardRouteSide(
          ends.boardPin,
          boardTop,
          boardBottom
        ) === "bottom"
      ) {

        bottomItems.push(wire);

      }

    }
  );


  /*
     모듈 핀의 실제 위치를 기준으로 정렬한다.

     right / left 방향 핀:
     위 → 아래

     top / bottom 방향 핀:
     왼쪽 → 오른쪽
  */

  bottomItems.sort(
    (a, b) => {

      const aEnds =
        getWireEnds(a);

      const bEnds =
        getWireEnds(b);


      const aPin =
        aEnds.modulePin;

      const bPin =
        bEnds.modulePin;


      const aSide =
        getPinExitSide(aPin);

      const bSide =
        getPinExitSide(bPin);


      if (aSide === bSide) {

        if (
          aSide === "left" ||
          aSide === "right"
        ) {

          return (
            Number(aPin.dataset.pinY) -
            Number(bPin.dataset.pinY)
          );

        }

        return (
          Number(aPin.dataset.pinX) -
          Number(bPin.dataset.pinX)
        );

      }


      const aStart =
        getPinPosition(aPin);

      const bStart =
        getPinPosition(bPin);

      return (
        aStart.y - bStart.y ||
        aStart.x - bStart.x
      );

    }
  );


  const map = new Map();

  if (bottomItems.length === 0) {
    return map;
  }


  const desiredLastY =
    boardBottom +
    BOARD_LANE_MARGIN +
    (
      (bottomItems.length - 1) *
      LANE_SPACING
    );


  const maxY =
    workspace.clientHeight -
    SAFE_MARGIN;


  const shiftUp =
    Math.max(
      0,
      desiredLastY - maxY
    );


  bottomItems.forEach(
    (wire, index) => {

      let y =
        boardBottom +
        BOARD_LANE_MARGIN +
        index * LANE_SPACING -
        shiftUp;


      y =
        Math.max(
          boardBottom + 12,
          y
        );


      map.set(
        wire,
        y
      );

    }
  );


  return map;
}


/* =========================================================
   BUILD WIRE POINTS

   공통 라우팅 원칙

   1. 모듈 핀의 방향으로 먼저 빠져나온다.
   2. 같은 방향 핀은 서로 다른 위치에서 꺾는다.
   3. 보드 위/아래의 전용 lane을 사용한다.
   4. 마지막에는 보드 핀으로 수직 진입한다.

   특정 센서나 모듈 이름은 사용하지 않는다.
========================================================= */

function buildWirePoints(
  wire,
  boardLeft,
  boardTop,
  boardBottom,
  topLaneMap,
  bottomLaneMap
) {

  const ends =
    getWireEnds(wire);

  const modulePin =
    ends.modulePin;

  const boardPin =
    ends.boardPin;


  const start =
    getPinPosition(modulePin);

  const end =
    getPinPosition(boardPin);


  const moduleExit =
    getModuleExitPoint(
      modulePin,
      start
    );


  const moduleSide =
    moduleExit.side;


  const boardSide =
    getBoardRouteSide(
      boardPin,
      boardTop,
      boardBottom
    );


  /* =======================================================
     BOTTOM PIN → BOARD BOTTOM
  ======================================================= */

  if (
    moduleSide === "bottom" &&
    boardSide === "bottom"
  ) {

    let laneY =
      bottomLaneMap.get(wire);


    if (laneY === undefined) {

      laneY =
        boardBottom +
        BOARD_LANE_MARGIN;

    }


    laneY =
      Math.max(
        laneY,
        start.y +
        PIN_EXIT_BASE,
        boardBottom + 12
      );


    laneY =
      Math.min(
        laneY,
        workspace.clientHeight -
        SAFE_MARGIN
      );


    return [
      {
        x: start.x,
        y: start.y
      },
      {
        x: start.x,
        y: laneY
      },
      {
        x: end.x,
        y: laneY
      },
      {
        x: end.x,
        y: end.y
      }
    ];

  }


  /* =======================================================
     TARGET LANE
  ======================================================= */

  let targetLaneY;


  if (boardSide === "top") {

    targetLaneY =
      topLaneMap.get(wire);

    if (targetLaneY === undefined) {

      targetLaneY =
        boardTop -
        BOARD_LANE_MARGIN;

    }

  }
  else {

    targetLaneY =
      bottomLaneMap.get(wire);

    if (targetLaneY === undefined) {

      targetLaneY =
        boardBottom +
        BOARD_LANE_MARGIN;

    }

  }


  /* =======================================================
     SAFE EXIT POINT
  ======================================================= */

  const exitPoint = {

    x:
      clamp(
        moduleExit.point.x,
        SAFE_MARGIN,
        workspace.clientWidth -
        SAFE_MARGIN
      ),

    y:
      clamp(
        moduleExit.point.y,
        SAFE_MARGIN,
        workspace.clientHeight -
        SAFE_MARGIN
      )

  };


  /* =======================================================
     RIGHT / LEFT PIN

     핀 방향으로 먼저 길게 수평 이동한 뒤
     전용 lane으로 이동한다.
  ======================================================= */

  if (
    moduleSide === "right" ||
    moduleSide === "left"
  ) {

    return [
      {
        x: start.x,
        y: start.y
      },

      {
        x: exitPoint.x,
        y: start.y
      },

      {
        x: exitPoint.x,
        y: targetLaneY
      },

      {
        x: end.x,
        y: targetLaneY
      },

      {
        x: end.x,
        y: end.y
      }
    ];

  }


  /* =======================================================
     TOP / BOTTOM PIN → BOARD TOP
  ======================================================= */

  if (boardSide === "top") {

    const order =
      Math.max(
        0,
        getSameSidePinOrder(
          modulePin
        )
      );


    let outsideLeftX =
      boardLeft -
      BOARD_LANE_MARGIN -
      order * LANE_SPACING;


    outsideLeftX =
      clamp(
        outsideLeftX,
        SAFE_MARGIN,
        workspace.clientWidth -
        SAFE_MARGIN
      );


    return [
      {
        x: start.x,
        y: start.y
      },

      {
        x: start.x,
        y: exitPoint.y
      },

      {
        x: outsideLeftX,
        y: exitPoint.y
      },

      {
        x: outsideLeftX,
        y: targetLaneY
      },

      {
        x: end.x,
        y: targetLaneY
      },

      {
        x: end.x,
        y: end.y
      }
    ];

  }


  /* =======================================================
     GENERIC FALLBACK
  ======================================================= */

  return [
    {
      x: start.x,
      y: start.y
    },

    {
      x: start.x,
      y: exitPoint.y
    },

    {
      x: end.x,
      y: exitPoint.y
    },

    {
      x: end.x,
      y: targetLaneY
    },

    {
      x: end.x,
      y: end.y
    }
  ];

}


/* =========================================================
   POINTS → SVG PATH
========================================================= */

function pointsToPath(points) {

  if (points.length === 0) {
    return "";
  }


  let path =
    "M " +
    points[0].x +
    " " +
    points[0].y;


  for (
    let i = 1;
    i < points.length;
    i++
  ) {

    path +=
      " L " +
      points[i].x +
      " " +
      points[i].y;

  }


  return path;
}


/* =========================================================
   SEGMENT CENTER

   labels.js에서도 사용한다.
========================================================= */

function getSegmentCenter(
  points,
  segmentIndex
) {

  const maximumIndex =
    points.length - 2;


  const safeIndex =
    Math.max(
      0,
      Math.min(
        segmentIndex,
        maximumIndex
      )
    );


  const a =
    points[safeIndex];

  const b =
    points[safeIndex + 1];


  return {

    x:
      (a.x + b.x) / 2,

    y:
      (a.y + b.y) / 2,

    horizontal:
      Math.abs(a.y - b.y) <
      Math.abs(a.x - b.x)

  };

}