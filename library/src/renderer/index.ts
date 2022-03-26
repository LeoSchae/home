/**
 * A type for different rendering backends.
 * By default all coordinates should be provided
 * with the origin in the top left corner.
 */
export interface Renderer2D {
  get lineWidth(): number;
  set lineWidth(lineWidth: number);

  get fontSize(): number;
  set fontSize(fontSize: number);

  get fillStyle(): string;
  set fillStyle(fillStyle: string);

  get strokeStyle(): string;
  set strokeStyle(strokeStyle: string);

  fillText(text: string, x: number, y: number): this;

  /** Begin a new Path. This clears all points from the current path. */
  beginPath(): this;

  /** Move the path to a location without drawing a line. */
  moveTo(x: number, y: number): this;

  /** Draw a line from the current to the target location. */
  lineTo(x: number, y: number): this;

  /** Close the current path. */
  closePath(): void;

  rect(x: number, y: number, w: number, h: number): this;

  /**
   * Draw a arc of a circle centered at (x,y).
   * Drawing a full circle is not possible.
   * @param x center x
   * @param y center y
   * @param radius radius
   * @param startAngle The start angle in radians
   * @param endAngle The end angle in radians
   * @param cw Whether the arc should run clockwise. Defaults to false.
   */
  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    cw?: boolean
  ): this;

  /** Stroke the current path */
  stroke(): this;
  /** Fill the current path */
  fill(): this;
  /** Stroke and Fill the current path */
  fillAndStroke(): this;
}

export interface MeasureText {
  measureText(text: string): {
    top: number;
    bot: number;
    left: number;
    right: number;
  };
}

export { default as Canvas } from "./Canvas";
export { default as SVG } from "./SVG";
export { default as TikZ } from "./TikZ";
