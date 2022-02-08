import * as math from "./math";
import * as paint from "./painter";

var group: math.Moebius[] = [new math.Moebius(1, 0, 0, 1)];
math.congruenceSubgroups.Gamma.cosetRepresentativesAsync(10).then((g) => {
  group = g;
  requestRepaint(true, true);
});
var fgCtx: paint.HyperbolicContext;
var bgCtx: paint.HyperbolicContext;

var mouse: [number, number] | null = null;

var domain = math.congruenceSubgroups.Domain1;

var pixelRatio = 1;

function repaintFg() {
  const ctx = fgCtx;
  fgReq = false;
  const { width, height } = ctx.context.canvas;
  ctx.context.clearRect(0, 0, width, height);

  let m: math.Moebius | undefined;

  if (mouse != null) m = domain.findCosetOf(fgCtx.projection.map(...mouse));

  // manually checked for undefined (required in for-each)
  if (m) {
    ctx.fillStyle = "rgba(100,100,255,0.3)";
    ctx.beginShape();
    ctx.polyLine(domain.corners.map((x) => (m as math.Moebius).transform(x)));
    ctx.closeShape();
    ctx.fill();
    //ctx.stroke();
  }
  ctx.context.globalAlpha = 1;

  ctx.axis(pixelRatio * 12, pixelRatio * 1.25);
  ctx.annotateFrac("Re", pixelRatio * 9, [1, 2]);
}

function repaintBg() {
  const ctx = bgCtx;
  bgReq = false;
  const { width, height } = ctx.context.canvas;
  ctx.context.clearRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,100,100,0.5)";
  ctx.strokeStyle = "rgb(255,0,0)";
  ctx.lineWidth = pixelRatio;

  for (let g of group) {
    ctx.beginShape();
    ctx.polyLine(domain.corners.map((x) => g.transform(x)));
    ctx.closeShape();
    ctx.fill();
    ctx.stroke();
  }
}

var fgReq = false;
var bgReq = false;

function requestRepaint(fg: boolean = true, bg: boolean = true) {
  if (!fgReq && fg) requestAnimationFrame(repaintFg);
  if (!bgReq && bg) requestAnimationFrame(repaintBg);
  fgReq = fgReq || fg;
  bgReq = bgReq || bg;
}

export function initialize(
  root: HTMLElement,
  fgCanvas: HTMLCanvasElement,
  bgCanvas: HTMLCanvasElement
) {
  pixelRatio = window.devicePixelRatio;

  fgCtx = new paint.HyperbolicContext(
    fgCanvas.getContext("2d") as CanvasRenderingContext2D
  );
  bgCtx = new paint.HyperbolicContext(
    bgCanvas.getContext("2d") as CanvasRenderingContext2D
  );
  bgCtx.projection = fgCtx.projection;
  let projection = fgCtx.projection;

  function fixSize(width: number, height: number) {
    fgCanvas.width = pixelRatio * width;
    fgCanvas.height = pixelRatio * height;
    bgCanvas.width = pixelRatio * width;
    bgCanvas.height = pixelRatio * height;
    requestRepaint();
  }
  window.addEventListener("resize", (ev) => {
    fixSize(root.clientWidth, root.clientHeight);
    requestRepaint();
  });

  registerDragAndZoom(
    fgCanvas,
    (dZ, center) => {
      projection.zoom(dZ, center[0] * pixelRatio, center[1] * pixelRatio);
      requestRepaint();
    },
    (dir) => {
      projection.translate(dir[0] * pixelRatio, dir[1] * pixelRatio);
      requestRepaint();
    },
    (pos) => {
      if (pos == null) mouse = null;
      else mouse = [pos[0] * pixelRatio, pos[1] * pixelRatio];
      requestRepaint(true, false); // only fg update
    }
  );

  fixSize(root.clientWidth, root.clientHeight);
  requestRepaint();

  new ResizeObserver(() => {
    if (
      fgCanvas.width != pixelRatio * root.clientWidth ||
      fgCanvas.height != pixelRatio * root.clientHeight
    ) {
      fixSize(root.clientWidth, root.clientHeight);
    }
  }).observe(fgCanvas);

  window.setInterval(() => {
    if (
      fgCanvas.width != pixelRatio * root.clientWidth ||
      fgCanvas.height != pixelRatio * root.clientHeight
    ) {
      fixSize(root.clientWidth, root.clientHeight);
    }
  }, 5000);
}

function registerDragAndZoom(
  element: HTMLElement,
  zoom: (dZ: number, center: [number, number]) => void,
  scroll: (direction: [number, number]) => void,
  hover: (pos: [number, number] | null) => void
) {
  // active pointers
  let pEvs: Array<PointerEvent> = new Array();

  // old metrics
  let pDist: number | -1 = -1;
  let pPos: [number, number] | null = null;
  let pCen: [number, number] = [0, 0];

  let relEv = (ev: PointerEvent) => {
    if (ev.pointerType == "mouse" && ev.button != 0) return;

    for (let i = 0; i < pEvs.length; i++)
      if (pEvs[i].pointerId == ev.pointerId) {
        pEvs.splice(i, 1);
        element.releasePointerCapture(ev.pointerId);
        ev.preventDefault();
        break;
      }
    pDist = -1;
  };
  let downEv = (ev: PointerEvent) => {
    if (ev.pointerType == "mouse" && ev.button != 0) return;

    pEvs.push(ev);
    element.setPointerCapture(ev.pointerId);
    pPos = null;
    pDist = -1;
    if (pEvs.length <= 1) hover([ev.offsetX, ev.offsetY]);
    else hover(null);
    ev.preventDefault();
    ev.stopPropagation();
  };
  let moveEv = (ev: PointerEvent) => {
    // Update trackers
    for (let i = 0; i < pEvs.length; i++)
      if (pEvs[i].pointerId == ev.pointerId) {
        pEvs[i] = ev;
        break;
      }

    if (pEvs.length <= 1) hover([ev.offsetX, ev.offsetY]);
    else hover(null);

    if (pEvs.length == 1) {
      // drag
      let pos: [number, number] = [ev.offsetX, ev.offsetY];

      if (pPos != null) {
        scroll([pos[0] - pPos[0], pos[1] - pPos[1]]);
      }

      pPos = pos;
      ev.preventDefault();
    } else if (pEvs.length == 2) {
      // zoom and drag
      let { offsetX: x1, offsetY: y1 } = pEvs[0];
      let { offsetX: x2, offsetY: y2 } = pEvs[1];

      let diff = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
      let cen: [number, number] = [0.5 * (x1 + x2), 0.5 * (y1 + y2)];

      if (pDist > 0) {
        let prDiff = diff / pDist;
        scroll([cen[0] - pCen[0], cen[1] - pCen[1]]);
        zoom(Math.log(prDiff), cen);
      }

      pCen = cen;
      pDist = diff;
      ev.preventDefault();
    }
  };
  let leaveEv = (ev: PointerEvent) => {
    if (ev.pointerType == "mouse") hover(null);
  };

  if (!window.PointerEvent) {
    window.addEventListener("mouseup", relEv as any);
    element.addEventListener("mousedown", downEv as any);
    element.addEventListener("mousemove", moveEv as any);
    element.addEventListener("mouseout", leaveEv as any);
  }

  // global events
  element.addEventListener("wheel", (ev) => {
    zoom(-ev.deltaY * (ev.deltaMode == 1 ? 0.03333 : 0.001), [
      ev.offsetX,
      ev.offsetY,
    ]);
    ev.preventDefault();
  });
  element.addEventListener("pointerup", relEv);
  element.addEventListener("pointercancel", relEv);
  element.addEventListener("pointerdown", downEv, { passive: false });
  element.addEventListener("pointermove", moveEv);
  element.addEventListener("pointerleave", leaveEv);
  element.addEventListener("contextmenu", (e) => {
    console.log(e);
    e.preventDefault();
  });
  element.addEventListener("selectstart", (e) => {
    e.preventDefault();
  });
}
