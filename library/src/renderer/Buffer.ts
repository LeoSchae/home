import type * as render from "./old";

enum DrawOp {
  BEGIN,
  MOVE,
  LINE,
  QUADRATIC,
  CUBIC,
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

export default class Renderer2DBuffer implements render.Renderer2D {
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
  set(options: render.SetOptions2D) {
    // Add types for unreachable checks
    var k: keyof render.SetOptions2D, v: any;

    for ([k, v] of Object.entries(options) as any) {
      switch (k) {
        case "fontSize":
          this.fontSize = v;
          break;
        case "lineWidth":
          this.lineWidth = v;
          break;
        case "fill":
          this.fillStyle = v;
          break;
        case "stroke":
          this.strokeStyle = v;
          break;
        default:
          let unreachable: never = k;
          console.warn(`Unknown option key '${k}'`);
      }
    }
    return this;
  }
  measureText(text: string): {
    top: number;
    bot: number;
    left: number;
    right: number;
  } {
    throw new Error("Method not implemented.");
  }
  drawText(text: string, x: number, y: number, align: render.TextAlign = 0) {
    this.data.push(DrawOp.TEXTNODE, text, x, y, align);
    return this;
  }
  begin() {
    this.data.push(DrawOp.BEGIN);
    return this;
  }
  move(x: number, y: number) {
    this.data.push(DrawOp.MOVE, x, y);
    return this;
  }
  line(x: number, y: number) {
    this.data.push(DrawOp.LINE, x, y);
    return this;
  }
  quadratic(cpX: number, cpY: number, x: number, y: number): this {
    this.data.push(DrawOp.QUADRATIC, cpX, cpY, x, y);
    return this;
  }
  cubic(
    cp1X: number,
    cp1Y: number,
    cp2X: number,
    cp2Y: number,
    x: number,
    y: number
  ): this {
    this.data.push(DrawOp.CUBIC, cp1X, cp1Y, cp2X, cp2Y, x, y);
    return this;
  }
  close() {
    this.data.push(DrawOp.CLOSE);
    return this;
  }
  rect(x: number, y: number, w: number, h: number) {
    this.move(x, y);
    this.line(x + w, y);
    this.line(x + w, y + h);
    this.line(x, y + h);
    this.line(x, y);
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
    this.data.push(DrawOp.ARC, x, y, radius, startAngle, endAngle, cw);
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
    r: render.Renderer2D,
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
          r.begin();
          break;
        case DrawOp.CH_FONTSIZE:
          r.set({ fontSize: data[++i] as number });
          break;
        case DrawOp.CH_LINEWIDTH:
          r.set({ lineWidth: data[++i] as number });
          break;
        case DrawOp.CH_STROKESTYLE:
          r.set({ stroke: data[++i] });
          break;
        case DrawOp.CH_FILLSTYLE:
          r.set({ fill: data[++i] });
          break;
        case DrawOp.FILL:
          r.fill();
          break;
        case DrawOp.LINE:
          r.line(s * data[++i] + x0, s * data[++i] + y0);
          break;
        case DrawOp.QUADRATIC:
          r.quadratic(
            s * data[++i] + x0,
            s * data[++i] + y0,
            s * data[++i] + x0,
            s * data[++i] + y0
          );
          break;
        case DrawOp.CUBIC:
          r.cubic(
            s * data[++i] + x0,
            s * data[++i] + y0,
            s * data[++i] + x0,
            s * data[++i] + y0,
            s * data[++i] + x0,
            s * data[++i] + y0
          );
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
          r.move(s * data[++i] + x0, s * data[++i] + y0);
          break;
        case DrawOp.STROKE:
          r.stroke();
          break;
        case DrawOp.TEXTNODE:
          r.drawText(
            data[++i],
            s * data[++i] + x0,
            s * data[++i] + y0,
            data[++i]
          );
          break;
        case DrawOp.CLOSE:
          r.close();
          break;
        default:
          let unreachable: never = d;
      }
    }
  }
}
