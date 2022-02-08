export type PointerEventHandler = {
  pointerdown?: (ev: PointerEvent) => void;
  pointerup?: (ev: PointerEvent) => any;
  pointercancel?: (ev: PointerEvent) => any;
  pointerover?: (ev: PointerEvent) => any;
  pointerout?: (ev: PointerEvent) => any;
  pointerenter?: (ev: PointerEvent) => any;
  pointerleave?: (ev: PointerEvent) => any;
  pointermove?: (ev: PointerEvent) => any;
  gotpointercapture?: (ev: PointerEvent) => any;
  lostpointercapture?: (ev: PointerEvent) => any;
};

type PointerState = {
  x: number;
  y: number;
  down: boolean;
  capture: boolean;
};

export class DNDEventListener implements PointerEventHandler {
  pointers: { [key: number]: PointerState | undefined } = {};

  _hover(_pos: [number, number]) {
    console.log("hover");
  }

  _scroll(pos: [number, number], delta: [number, number]) {
    console.log("scroll");
  }

  _zoom(pos: [number, number], dz: number) {
    console.log("zoom");
  }

  getState(e: PointerEvent) {
    var state = this.pointers[e.pointerId];
    if (state === undefined) {
      state = {
        x: 0,
        y: 0,
        down: false,
        capture: false,
      };
      this.pointers[e.pointerId] = state;
    }
    return state;
  }
  pointerdown = (e: PointerEvent) => {
    var state: PointerState = this.getState(e);

    state.x = e.clientX;
    state.y = e.clientY;
    state.down = true;

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  pointerup = (e: PointerEvent) => {
    var state: PointerState = this.getState(e);

    state.down = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };
  pointercancel = (e: PointerEvent) => {
    delete this.pointers[e.pointerId];
    console.log("cancel");
  };
  pointerover = (e: PointerEvent) => {
    var state: PointerState = this.getState(e);
    console.log("over");
  };
  pointerout = (e: PointerEvent) => {
    var state: PointerState = this.getState(e);
    console.log("out");
  };
  pointermove = (e: PointerEvent) => {
    var state: PointerState = this.getState(e);
    var dx = e.clientX - state.x,
      dy = e.clientY - state.y;
    state.x = e.clientX;
    state.y = e.clientY;

    if (!state.down) this._hover([state.x, state.y]);
    else this._scroll([state.x, state.y], [dx, dy]);
  };
  gotpointercapture = (e: PointerEvent) => {
    var state: PointerState = this.getState(e);
    state.capture = true;
    console.log("got");
  };
  lostpointercapture = (e: PointerEvent) => {
    var state: PointerState = this.getState(e);
    state.capture = false;
    console.log("lost");
  };
}

export function registerPointerEvents(e: HTMLElement, h: PointerEventHandler) {
  if (h.pointerdown)
    e.addEventListener("pointerdown", h.pointerdown, { passive: false });
  if (h.pointerup) e.addEventListener("pointerup", h.pointerup);
  if (h.pointercancel) e.addEventListener("pointercancel", h.pointercancel);
  if (h.pointerover) e.addEventListener("pointerover", h.pointerover);
  if (h.pointerout) e.addEventListener("pointerout", h.pointerout);
  if (h.pointerenter) e.addEventListener("pointerenter", h.pointerenter);
  if (h.pointerleave) e.addEventListener("pointerleave", h.pointerleave);
  if (h.pointermove) e.addEventListener("pointermove", h.pointermove);
  if (h.gotpointercapture)
    e.addEventListener("gotpointercapture", h.gotpointercapture);
  if (h.lostpointercapture)
    e.addEventListener("lostpointercapture", h.lostpointercapture);
}
