import { Renderer2D, MeasureText, TextAlign } from "./";

const PI_2 = 2 * Math.PI;
const _PI_2 = 0.5 / Math.PI;

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
    this.fontSize = 13;
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
    this._ctx.font = fontSize + "px Times New Roman";
    this._fontSize = fontSize;
    const tm = this._ctx.measureText("1ATOgjp");
    this.fontAscent = tm.fontBoundingBoxAscent || tm.actualBoundingBoxAscent;
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
    this._ctx.textAlign = "center";
    const tm = this._ctx.measureText(text);
    let c = (this.fontAscent + this.fontDescent) / 2;
    return {
      top: c * 1.3,
      bot: c * 1,
      left: tm.actualBoundingBoxLeft,
      right: tm.actualBoundingBoxRight,
    };
  }

  drawText(text: string, x: number, y: number, align: TextAlign) {
    let bl: CanvasTextBaseline = "middle",
      al: CanvasTextAlign = "center";
    switch (align & 0b1100) {
      case TextAlign.T:
        bl = "top";
        break;
      case TextAlign.B:
        bl = "bottom";
        break;
    }
    switch (align & 0b0011) {
      case TextAlign.L:
        al = "left";
        break;
      case TextAlign.R:
        al = "right";
        break;
    }
    this._ctx.textBaseline = bl;
    this._ctx.textAlign = al;
    this._ctx.fillText(text, x, y);
    return this;
  }

  begin() {
    this._ctx.beginPath();
    return this;
  }

  move(x: number, y: number) {
    this._ctx.moveTo(x, y);
    return this;
  }

  line(x: number, y: number) {
    this._ctx.lineTo(x, y);
    return this;
  }

  quadratic(cpX: number, cpY: number, x: number, y: number) {
    this._ctx.quadraticCurveTo(cpX, cpY, x, y);
    return this;
  }

  cubic(
    cp1X: number,
    cp1Y: number,
    cp2X: number,
    cp2Y: number,
    x: number,
    y: number
  ) {
    this._ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, x, y);
    return this;
  }

  close() {
    this._ctx.closePath();
    return this;
  }

  rect(x: number, y: number, w: number, h: number) {
    this._ctx.rect(x, y, w, h);
    return this;
  }

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    cw?: boolean
  ) {
    startAngle = startAngle - PI_2 * Math.floor(_PI_2 * startAngle);
    endAngle = endAngle - PI_2 * Math.floor(_PI_2 * endAngle);
    this._ctx.arc(x, y, radius, -startAngle, -endAngle, !cw);
    return this;
  }

  stroke() {
    this._ctx.stroke();
    return this;
  }

  fill() {
    this._ctx.fill();
    return this;
  }

  fillAndStroke() {
    this.fill();
    this.stroke();
    return this;
  }
}
