import { Complex, oo } from "./math";

export class ComplexProjection {
  origin: [number, number] = [300, 300];
  scale: number = 100;

  project(value: Complex): [number, number] {
    return [
      value.real * this.scale + this.origin[0],
      -value.imag * this.scale + this.origin[1],
    ];
  }

  map(x: number, y: number): Complex {
    return new Complex(
      (x - this.origin[0]) / this.scale,
      -(y - this.origin[1]) / this.scale
    );
  }

  translate(x: number, y: number) {
    const [ox, oy] = this.origin;
    this.origin = [ox + x, oy + y];
  }

  zoom(mag: number, x: number, y: number) {
    const fac = Math.exp(mag);
    const [ox, oy] = this.origin;
    this.origin = [ox * fac + x * (1 - fac), oy * fac + y * (1 - fac)];
    this.scale *= fac;
  }
}

export abstract class Painter<T> {
  context: CanvasRenderingContext2D;
  private shapeStart: T | undefined;
  private position: T | undefined;

  constructor(context: CanvasRenderingContext2D) {
    this.context = context;
  }

  protected abstract _project(point: T): [number, number] | null;
  protected abstract _drawLine(from: T, to: T): void;

  beginShape(position?: T) {
    this.context.beginPath();
    this.position = undefined;
    this.shapeStart = undefined;
    if (position) this.moveTo(position);
  }

  closeShape() {
    if (this.shapeStart) this.lineTo(this.shapeStart);
    this.context.closePath();
  }

  moveTo(position: T) {
    if (this.shapeStart == null) this.shapeStart = position;
    const p = this._project(position);
    if (p != null) this.context.moveTo(p[0], p[1]);
    this.position = position;
  }

  lineTo(position: T) {
    if (this.position == null) this.moveTo(position);
    else {
      this._drawLine(this.position, position);
      this.position = position;
    }
  }

  polyLine(positions: Iterable<T>) {
    for (let p of positions) {
      this.lineTo(p);
    }
  }

  set strokeStyle(value: string) {
    this.context.strokeStyle = value;
  }

  set fillStyle(value: string) {
    this.context.fillStyle = value;
  }

  set lineWidth(value: number) {
    this.context.lineWidth = value;
  }

  stroke() {
    this.context.stroke();
  }

  fill() {
    this.context.fill();
  }
}

export class HyperbolicContext extends Painter<Complex | oo> {
  projection: ComplexProjection = new ComplexProjection();

  axis(fontsize: number, strokeweight: number) {
    this.context.save();
    this.fillStyle = "#000000";
    this.strokeStyle = "#000000";
    this.context.lineWidth = strokeweight;
    this.context.textBaseline = "top";
    this.context.font = fontsize + "px Sans-Serif";

    const aW = 3,
      aH = 6;
    const {
      origin: [x, y],
    } = this.projection;
    const { width, height } = this.context.canvas;

    // Axes
    this.context.beginPath();
    this.context.moveTo(x, aH);
    this.context.lineTo(x, height);
    this.context.moveTo(aH, y);
    this.context.lineTo(width - aH, y);
    this.stroke();

    // Arrows
    this.context.beginPath();
    this.context.moveTo(x - aW, aH);
    this.context.lineTo(x + aW, aH);
    this.context.lineTo(x, 0);
    this.context.lineTo(x - aW, aH);
    this.context.fill();

    this.context.beginPath();
    this.context.moveTo(width - aH, y - aW);
    this.context.lineTo(width - aH, y + aW);
    this.context.lineTo(width, y);
    this.context.lineTo(width - aH, y - aW);
    this.context.fill();

    const tm1 = this.context.measureText("Im");
    this.context.fillText("Im", x - tm1.width - 6, 2);
    const tm2 = this.context.measureText("Re");
    this.context.fillText("Re", width - tm2.width - 3, y + 6);

    this.context.restore();
  }

  annotateFrac(axis: "Re", size: number, ...labels: [number, number][]) {
    const ctx = this.context;
    ctx.save();

    let fac = size / 9.0;

    const font = size + "px Sans-Serif";
    ctx.textBaseline = "top";
    ctx.font = font;
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
    ctx.lineWidth = fac;

    if (axis == "Re") {
      for (let n of labels) {
        const p = n[0],
          q = n[1];
        const pos = this._project(new Complex((1.0 * p) / q));
        const tp = p.toString(),
          tq = q.toString();
        const tmp = ctx.measureText(tp),
          tmq = ctx.measureText(tq);
        const w = Math.max(tmp.width, tmq.width) / 2 + 1;

        ctx.fillText(tp, pos[0] - tmp.width / 2, pos[1] + fac * 3);
        ctx.fillText(tq, pos[0] - tmq.width / 2, pos[1] + size + fac * 5);
        ctx.beginPath();
        ctx.moveTo(pos[0] - w, pos[1] + size + fac * 3);
        ctx.lineTo(pos[0] + w, pos[1] + size + fac * 3);
        ctx.stroke();
      }
    } else {
    }

    ctx.restore();
  }

  _project(p: Complex): [number, number];
  _project(p: oo): null;
  _project(p: Complex | oo) {
    if (p == oo) return null;
    return this.projection.project(p as Complex);
  }

  _drawLine(last: Complex | oo, to: Complex | oo) {
    if (last == oo) {
      if (to == oo) return;

      const c = this.projection.project(to as Complex);
      this.context.moveTo(c[0], -5);
      this.context.lineTo(c[0], c[1]);
    } else {
      if (to == oo) {
        this.context.lineTo(this.projection.project(last as Complex)[0], -5);
        return;
      }

      let c1 = last as Complex;
      let c2 = to as Complex;

      if (Math.abs(c1.real - c2.real) < 0.0000000001) {
        // Draw straight line between points
        let p = this.projection.project(c2);
        this.context.lineTo(p[0], p[1]);
        return;
      }

      let C = (0.5 * (c1.abs2() - c2.abs2())) / (c1.real - c2.real);
      let CP = this.projection.project(new Complex(C));
      c1 = c1.sub(C);
      c2 = c2.sub(C);
      let a1 = c1.arg();
      let a2 = c2.arg();

      this.context.arc(
        CP[0],
        CP[1],
        c1.abs() * this.projection.scale,
        -a1,
        -a2,
        a1 < a2
      );
    }
  }
}
