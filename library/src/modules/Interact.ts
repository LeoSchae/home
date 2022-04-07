/**
 * A class that allows easy interaction with an canvas or other HTML element.
 * When registered on an element, the listeners passed to the constructor are
 * called when the respective event takes place.
 */
export class DragZoomHover {
  /**
   * Create a new instance with listeners.
   * All values are mesured in CSS pixels measured
   * as offset from the target element.
   * @param onDrag drag listener
   * @param onZoom zoom listener
   * @param onHover hover listener
   */
  constructor(
    public onDrag: (delta: [number, number]) => any,
    public onZoom: (factor: number, center: [number, number]) => any,
    public onHover: (pos: [number, number] | null) => any
  ) {}

  private state: Array<{
    id: number;
    x: number;
    y: number;
  }> = new Array();

  private down = (e: PointerEvent) => {
    if (e.pointerType == "mouse" && e.button != 0) return;

    const { pointerId, offsetX: x, offsetY: y } = e;
    let state = this.state.find(({ id }) => id === pointerId);
    if (state === undefined) {
      state = { id: pointerId, x, y };
      this.state.push(state);
    }
    if (this.state.length <= 1) this.onHover([x, y]);
    else this.onHover(null);
    (e.currentTarget as HTMLElement).setPointerCapture(pointerId);
  };
  private move = (e: PointerEvent) => {
    const { pointerId, offsetX: x, offsetY: y } = e;

    if (this.state.length === 0) {
      this.onHover([x, y]);
      return;
    }

    const ind = this.state.findIndex(({ id }) => id === pointerId);
    if (ind === -1) return;
    const state = this.state[ind];

    if (this.state.length === 1) {
      this.onHover([x, y]);
      this.onDrag([x - state.x, y - state.y]);
    } else if (this.state.length === 2) {
      // Drag and zoom so that both pointers
      // have the same center and distance

      const s1 = state;
      const s2 = this.state[1 - ind];

      const dOld = (s1.x - s2.x) ** 2 + (s1.y - s2.y) ** 2,
        dNew = (x - s2.x) ** 2 + (y - s2.y) ** 2;
      const drag = [0.5 * (x - s1.x), 0.5 * (y - s1.y)] as [number, number];

      this.onHover(null);
      this.onDrag(drag);
      this.onZoom(dNew / dOld, [0.5 * (x + s2.x), 0.5 * (y + s2.y)]);
    }

    state.x = x;
    state.y = y;
  };
  private up = (e: PointerEvent) => {
    if (e.pointerType == "mouse" && e.button != 0) return;
    const { pointerId, offsetX: x, offsetY: y } = e;
    let ind = this.state.findIndex(({ id }) => id === pointerId);
    this.state.splice(ind, 1);

    (e.currentTarget as HTMLElement).releasePointerCapture(pointerId);
  };
  private cancel = (e: PointerEvent) => {
    if (e.pointerType == "mouse" && e.button != 0) return;

    const { pointerId, offsetX: x, offsetY: y } = e;
    let ind = this.state.findIndex(({ id }) => id === pointerId);
    this.state.splice(ind, 1);

    (e.currentTarget as HTMLElement).releasePointerCapture(pointerId);
  };
  private leave = (e: PointerEvent) => {
    if (e.pointerType == "mouse" && e.button != 0) return;
    // Release pointer if no capture is present

    if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;

    const { pointerId, offsetX: x, offsetY: y } = e;
    let ind = this.state.findIndex(({ id }) => id === pointerId);
    this.state.splice(ind, 1);

    (e.currentTarget as HTMLElement).releasePointerCapture(pointerId);
  };
  private wheel = (e: WheelEvent) => {
    e.preventDefault();
    this.onZoom(Math.exp(-e.deltaY * (e.deltaMode == 1 ? 0.03333 : 0.001)), [
      e.offsetX,
      e.offsetY,
    ]);
  };

  /**
   * Add the listeners to an HTMLElement.
   */
  registerListeners(e: HTMLElement) {
    e.addEventListener("pointerup", this.up);
    e.addEventListener("pointerdown", this.down);
    e.addEventListener("pointermove", this.move);
    e.addEventListener("pointercancel", this.cancel);
    e.addEventListener("pointerleave", this.leave);
    e.addEventListener("wheel", this.wheel);
  }

  /**
   * Remove the listeners from an HTMLElement.
   */
  removeListeres(e: HTMLElement) {
    e.removeEventListener("pointerup", this.up);
    e.removeEventListener("pointerdown", this.down);
    e.removeEventListener("pointermove", this.move);
    e.removeEventListener("pointercancel", this.cancel);
    e.removeEventListener("wheel", this.wheel);
  }
}
