import type { Renderer2D, TextAlign } from "./";

enum DrawOp {
  BEGIN,
  MOVE,
  LINE,
  ARC,
  CLOSE,
  STROKE,
  FILL,
  TEXTNODE,
  CH_LINEWIDTH,
  CH_FONTSIZE,
  CH_STROKESTYLE,
  CH_FILLSTYLE,
}

export default class Renderer2DBuffer implements Renderer2D {
  private data: any[] = [];

  get strokeStyle(): string {
    throw new Error("Method not implemented.");
  }
  get fontSize(): number {
    throw new Error("Method not implemented.");
  }
  get lineWidth(): number {
    throw new Error("Method not implemented.");
  }
  get fillStyle(): string {
    throw new Error("Method not implemented.");
  }
  set strokeStyle(strokeStyle: string) {
    this.data.push(DrawOp.CH_STROKESTYLE, strokeStyle);
  }
  set fillStyle(fillStyle: string) {
    this.data.push(DrawOp.CH_FILLSTYLE, fillStyle);
  }
  set lineWidth(lineWidth: number) {
    this.data.push(DrawOp.CH_LINEWIDTH, lineWidth);
  }
  set fontSize(fontSize: number) {
    this.data.push(DrawOp.CH_FONTSIZE, fontSize);
  }
  measureText(text: string): {
    top: number;
    bot: number;
    left: number;
    right: number;
  } {
    throw new Error("Method not implemented.");
  }
  textNode(text: string, x: number, y: number, align: TextAlign = 0) {
    this.data.push(DrawOp.TEXTNODE, text, x, y, align);
    return this;
  }
  beginPath() {
    this.data.push(DrawOp.BEGIN);
    return this;
  }
  moveTo(x: number, y: number) {
    this.data.push(DrawOp.MOVE, x, y);
    return this;
  }
  lineTo(x: number, y: number) {
    this.data.push(DrawOp.LINE, x, y);
    return this;
  }
  closePath() {
    this.data.push(DrawOp.CLOSE);
  }
  rect(x: number, y: number, w: number, h: number) {
    this.moveTo(x, y);
    this.lineTo(x + w, y);
    this.lineTo(x + w, y + h);
    this.lineTo(x, y + h);
    this.lineTo(x, y);
    return this;
  }
  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    ccw?: boolean
  ) {
    this.data.push(DrawOp.ARC, x, y, radius, startAngle, endAngle, ccw);
    return this;
  }
  stroke() {
    this.data.push(DrawOp.STROKE);
    return this;
  }
  fill() {
    this.data.push(DrawOp.FILL);
    return this;
  }
  fillAndStroke() {
    /* TODO */
    this.fill();
    this.stroke();
    return this;
  }
  applyWith(
    r: Renderer2D,
    opts?: { scale?: number; origin?: [number, number] }
  ) {
    let s = opts?.scale || 1,
      [x0, y0] = opts?.origin || [0, 0];

    const data = this.data;
    let d;
    let i;
    for (i = 0; i < this.data.length; i++) {
      d = data[i] as DrawOp;

      switch (d) {
        case DrawOp.BEGIN:
          r.beginPath();
          break;
        case DrawOp.CH_FONTSIZE:
          r.fontSize = data[++i];
          break;
        case DrawOp.CH_LINEWIDTH:
          r.lineWidth = data[++i];
          break;
        case DrawOp.CH_STROKESTYLE:
          r.strokeStyle = data[++i];
          break;
        case DrawOp.CH_FILLSTYLE:
          r.fillStyle = data[++i];
          break;
        case DrawOp.FILL:
          r.fill();
          break;
        case DrawOp.LINE:
          r.lineTo(s * data[++i] + x0, s * data[++i] + y0);
          break;
        case DrawOp.ARC:
          r.arc(
            s * data[++i] + x0,
            s * data[++i] + y0,
            s * data[++i],
            data[++i],
            data[++i],
            data[++i]
          );
          break;
        case DrawOp.MOVE:
          r.moveTo(s * data[++i] + x0, s * data[++i] + y0);
          break;
        case DrawOp.STROKE:
          r.stroke();
          break;
        case DrawOp.TEXTNODE:
          r.textNode(
            data[++i],
            s * data[++i] + x0,
            s * data[++i] + y0,
            data[++i]
          );
          break;
        case DrawOp.CLOSE:
          r.closePath();
          break;
        default:
          assertUnreachable(d);
      }
    }
  }
}

function assertUnreachable(d: never) {
  throw "Asserted Unrechable";
}
