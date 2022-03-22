import type { Renderer2D, MeasureText } from "./";

export default class Canvas implements Renderer2D, MeasureText {
  private _ctx: CanvasRenderingContext2D;

  private _lineWidth = 1;
  private _fontSize = 13;
  private _fillColor = "#000000";
  private _strokeColor = "#000000";

  private fontAscent: number = -1;
  private fontDescent: number = -1;

  width: number;
  height: number;

  constructor(ctx: CanvasRenderingContext2D, width?: number, height?: number) {
    this._ctx = ctx;
    this.width = width === undefined ? ctx.canvas.width : width;
    this.height = height === undefined ? ctx.canvas.height : height;
  }

  get lineWidth() {
    return this._lineWidth;
  }
  set lineWidth(lineWidth: number) {
    this._ctx.lineWidth = lineWidth;
    this._lineWidth = lineWidth;
  }

  get fontSize() {
    return this._fontSize;
  }
  set fontSize(fontSize: number) {
    this._ctx.textBaseline = "alphabetic";
    this._ctx.font = fontSize + "px Serif";
    this._fontSize = fontSize;
    const tm = this._ctx.measureText("1ATOgjp");
    this.fontAscent =
      tm.fontBoundingBoxAscent ||
      tm.actualBoundingBoxAscent +
        0.15 * tm.actualBoundingBoxAscent +
        0.15 * tm.actualBoundingBoxDescent;
    this.fontDescent = tm.fontBoundingBoxDescent || tm.actualBoundingBoxDescent;
  }

  get fillStyle(): string {
    return this._fillColor;
  }
  set fillStyle(fillStyle: string) {
    this._ctx.fillStyle = fillStyle;
    this._fillColor = fillStyle;
  }

  get strokeStyle(): string {
    return this._strokeColor;
  }
  set strokeStyle(strokeStyle: string) {
    this._ctx.strokeStyle = strokeStyle;
    this._strokeColor = strokeStyle;
  }

  measureText(text: string) {
    const tm = this._ctx.measureText(text);
    return {
      top: this.fontAscent,
      bot: this.fontDescent,
      left: tm.actualBoundingBoxLeft,
      right: tm.actualBoundingBoxRight,
    };
  }

  fillText(text: string, x: number, y: number) {
    this._ctx.fillText(text, x, y);
  }

  beginPath() {
    this._ctx.beginPath();
  }

  moveTo(x: number, y: number) {
    this._ctx.moveTo(x, y);
  }

  lineTo(x: number, y: number) {
    this._ctx.lineTo(x, y);
  }

  closePath() {
    this._ctx.closePath();
  }

  rect(x: number, y: number, w: number, h: number) {
    this._ctx.rect(x, y, w, h);
  }

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    ccw?: boolean
  ): void {
    this._ctx.arc(x, y, radius, startAngle, endAngle, ccw);
  }

  stroke() {
    this._ctx.stroke();
  }

  fill() {
    this._ctx.fill();
  }

  fillAndStroke() {
    this.fill();
    this.stroke();
  }
}