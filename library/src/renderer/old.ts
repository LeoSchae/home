/**
 * Text align given as a binary representation.
 * By `align & 0b1100` one obtains the vertical align (T / C / B).
 * Similarly for `align & 0b0011` one obtains the horizontal align (L / C / R).
 */
export enum TextAlign {
  C = 0b0000,
  T = 0b1000,
  L = 0b0010,
  R = 0b0001,
  B = 0b0100,
  TL = 0b1010,
  TR = 0b1001,
  BL = 0b0110,
  BR = 0b0101,
}

export type SetOptions2D = {
  lineWidth?: number;
  fontSize?: number;
  fill?: string;
  stroke?: string;
};

/**
 * A type for different rendering backends.
 * By default all coordinates should be provided
 * with the origin in the top left corner.
 */
export interface Renderer2D {
  /*
  get lineWidth(): number;
  set lineWidth(lineWidth: number);

  get fontSize(): number;
  set fontSize(fontSize: number);

  get fillStyle(): string;
  set fillStyle(fillStyle: string);

  get strokeStyle(): string;
  set strokeStyle(strokeStyle: string);
  */

  set(options: SetOptions2D): this;

  /**
   * @param align The alignment of the text. Defaults to `C = 0`.
   */
  drawText(text: string, x: number, y: number, align?: TextAlign): this;

  /** Begin a new Path. This clears all points from the current path. */
  begin(): this;

  /** Move the path to a location without drawing a line. */
  move(x: number, y: number): this;

  /** Draw a line from the current to the target location. */
  line(x: number, y: number): this;

  /** Draw a quadratic curve from the current location. */
  quadratic(cpX: number, cpY: number, x: number, y: number): this;

  /** Draw a cubic curve (bezier curve) from the current location. */
  cubic(
    cp1X: number,
    cp1Y: number,
    cp2X: number,
    cp2Y: number,
    x: number,
    y: number
  ): this;

  /** Close the current path. */
  close(): this;

  /**
   * Draw a arc of a circle centered at (x,y).
   * Drawing a full circle is not possible.
   * The angle is measured in the mathematical sense
   * (counterclockwise starting at positive x axis).
   * @param x center x
   * @param y center y
   * @param radius radius
   * @param startAngle The start angle in radians.
   * @param endAngle The end angle in radians.
   * @param cw Whether the arc should run clockwise. Defaults to false (counterclockwise).
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