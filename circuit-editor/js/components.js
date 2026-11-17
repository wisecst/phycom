/* =========================================================
   CIRCUIT EDITOR - COMPONENTS
========================================================= */


/* =========================================================
   COMPONENT REGISTRY
========================================================= */

const BOARD_COMPONENT = {

  id: "orangeboard",

  containerId: "board",
  role: "board",

  json:
    "./components/boards/orangeboard/component.json",

  base:
    "../assets/"

};


const MODULES = {
  led: {
    id: "led",
    containerId: "module",
    role: "module",
    json: "./components/modules/led/component.json",
    base: "../assets/"
  }
};


/* =========================================================
   STATE
========================================================= */

let currentModuleKey =
  "led";


const loadedComponents = {};


/* =========================================================
   CURRENT COMPONENTS
========================================================= */

function getCurrentComponents() {

  return [

    BOARD_COMPONENT,

    MODULES[
      currentModuleKey
    ]

  ];

}


/* =========================================================
   LOAD COMPONENT
========================================================= */

async function loadComponent(
  definition
) {

  const response =
    await fetch(

      definition.json +
      "?t=" +
      Date.now()

    );


  if (!response.ok) {

    throw new Error(

      "component.json load failed: " +
      response.status

    );

  }


  const component =
    await response.json();


  loadedComponents[
    definition.id
  ] = component;


  await renderComponent(
    component,
    definition
  );

}


/* =========================================================
   RENDER COMPONENT
========================================================= */

function renderComponent(
  component,
  definition
) {

  const container =
    document.getElementById(
      definition.containerId
    );


  if (!container) {
    return;
  }


  container.innerHTML = "";


  container.dataset.component =
    definition.containerId;


  /* =======================================================
     IMAGE
  ======================================================= */

  const image =
    document.createElement(
      "img"
    );


  image.className =
    "component-image";


  image.src =
    definition.base +
    component.image;


  image.alt =
    component.name ||
    definition.id;


  image.draggable =
    false;


  /* =======================================================
     PIN LAYER
  ======================================================= */

  const pinLayer =
    document.createElement(
      "div"
    );


  pinLayer.className =
    "pin-layer";


  /* =======================================================
     TITLE
  ======================================================= */

  const title =
    document.createElement(
      "div"
    );


  title.className =
    "component-title";


  title.textContent =
    component.name ||
    definition.id;


  /* =======================================================
     ADD
  ======================================================= */

  container.appendChild(
    image
  );


  container.appendChild(
    pinLayer
  );


  container.appendChild(
    title
  );


  /* =======================================================
     IMAGE READY
  ======================================================= */

  return new Promise((resolve, reject) => {
  const ready = function() {
    resizeComponents();
    drawPins(pinLayer, component, definition);
    drawWires();
    resolve();
  };
  image.addEventListener("error", () => reject(new Error("부품 이미지를 불러오지 못했습니다.")), { once: true });
  if (image.complete && image.naturalWidth) { ready(); return; }
  image.addEventListener(

    "load",

    ready,
    { once: true }
  );
  });

}


/* =========================================================
   RESIZE COMPONENTS
========================================================= */

function resizeComponents() {

  const workspace =
    document.getElementById(
      "workspace"
    );


  if (!workspace) {
    return;
  }


  const board =
    getBoardContainer();


  const module =
    getModuleContainer();


  /* =======================================================
     BOARD
  ======================================================= */

  if (board) {

    const image =
      board.querySelector(
        ".component-image"
      );


    if (
      image &&
      image.naturalWidth &&
      image.naturalHeight
    ) {

      const maxWidth =
        workspace.clientWidth *
        0.60;


      const maxHeight =
        workspace.clientHeight *
        0.72;


      const scale =
        Math.min(

          maxWidth /
          image.naturalWidth,

          maxHeight /
          image.naturalHeight

        );


      board.style.width =
        image.naturalWidth *
        scale +
        "px";


      board.style.height =
        image.naturalHeight *
        scale +
        "px";

    }

  }


  /* =======================================================
     MODULE
  ======================================================= */

  if (module) {

    const image =
      module.querySelector(
        ".component-image"
      );


    if (
      image &&
      image.naturalWidth &&
      image.naturalHeight
    ) {

      // Size each module while preserving image/pin alignment.
      const isUltrasonic = currentModuleKey === "ultrasonic";
      const maxWidth = Math.min(
        workspace.clientWidth * (isUltrasonic ? 0.32 : 0.24),
        isUltrasonic ? 560 : 400
      );
      const maxHeight =
        workspace.clientHeight * (isUltrasonic ? 0.64 : 0.56);

      // Override the CSS caps so the image and its pin layer resize together.
      module.style.maxWidth = isUltrasonic ? "560px" : "400px";
      module.style.maxHeight = "none";


      const scale =
        Math.min(

          maxWidth /
          image.naturalWidth,

          maxHeight /
          image.naturalHeight

        );


      module.style.width =
        image.naturalWidth *
        scale +
        "px";


      module.style.height =
        image.naturalHeight *
        scale +
        "px";

    }

  }

}


/* =========================================================
   CONTAINER HELPERS
========================================================= */

function getModuleContainer() {

  return document.getElementById(
    "module"
  );

}


function getBoardContainer() {

  return document.getElementById(
    "board"
  );

}
