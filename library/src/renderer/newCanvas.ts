import {
  Align,
  Backend,
  BackendStyleOptions,
  horizontalAlign,
  PathBackend,
  TextBackend,
  verticalAlign,
} from "./new";

const twoPi = 2 * Math.PI;

function colorToCss(color: [number, number, number, number?]): string {
  let res =
    "#" +
    color[0].toString(16).padStart(2, "0") +
    color[1].toString(16).padStart(2, "0") +
    color[2].toString(16).padStart(2, "0");
  if (color[3])
    res += Math.round(color[3] * 255)
      .toString(16)
      .padStart(2, "0");
  return res;
}

class CanvasPathBackend implements PathBackend {
  constructor(private ctx: CanvasRenderingContext2D) {}
  private _path: Path2D = new Path2D();
  move(x: number, y: number) {
    this._path.moveTo(x, y);
    return this;
  }
  line(x: number, y: number) {
    this._path.lineTo(x, y);
    return this;
  }
  cubic(
    c1x: number,
    c1y: number,
    c2x: number,
    c2y: number,
    x: number,
    y: number
  ) {
    this._path.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
    return this;
  }
  /*quadratic(c1x: number, c1y: number, x: number, y: number) {
    this._path.quadraticCurveTo(c1x, c1y, x, y);
    return this;
  }*/
  ellipse(
    cx: number,
    cy: number,
    radiusX: number,
    radiusY: number,
    axisRotation: number,
    angleOffset: number,
    angle: number
  ) {
    angle *= twoPi;
    angleOffset *= twoPi;
    axisRotation *= twoPi;
    this._path.ellipse(
      cx,
      cy,
      radiusX,
      radiusY,
      -axisRotation,
      -angleOffset,
      -angleOffset - angle,
      angle >= 0
    );
    return this;
  }
  close() {
    this._path.closePath();
    return this;
  }
  draw(stroke: boolean, fill: boolean) {
    if (fill) this.ctx.fill(this._path);
    if (stroke) this.ctx.stroke(this._path);
    return this;
  }
  clip() {
    this.ctx.clip(this._path);
    return this;
  }
}

class CanvasTextBackend implements TextBackend {
  private fontSize: number = 9;

  constructor(private ctx: CanvasRenderingContext2D) {}

  draw(
    x: number,
    y: number,
    text: string,
    align: Align = Align.C
  ): TextBackend {
    let bl: CanvasTextBaseline = "middle",
      al: CanvasTextAlign = "center";
    switch (verticalAlign(align)) {
      case Align.T:
        bl = "top";
        break;
      case Align.B:
        bl = "bottom";
        break;
    }
    switch (horizontalAlign(align)) {
      case Align.L:
        al = "left";
        break;
      case Align.R:
        al = "right";
        break;
    }
    this.ctx.textBaseline = bl;
    this.ctx.textAlign = al;
    this.ctx.fillText(text, x, y);
    return this;
  }
}

export class CanvasBackend implements Backend<"path" | "text"> {
  constructor(private ctx: CanvasRenderingContext2D) {}

  save() {
    this.ctx.save();
    return this;
  }
  restore() {
    this.ctx.restore();
    return this;
  }
  style(options: BackendStyleOptions<"path" | "text">) {
    let rgb: [number, number, number, number?];
    for (let [k, v] of Object.entries(options) as [
      keyof typeof options,
      any
    ][]) {
      switch (k) {
        case "fill":
          rgb = v;
          this.ctx.fillStyle = colorToCss(rgb);
          break;
        case "stroke":
          rgb = v;
          this.ctx.strokeStyle = colorToCss(rgb);
          break;
        case "lineWidth":
          this.ctx.lineWidth = v;
          break;
        case "fontSize":
          this.ctx.font = v + "px Times New Roman";
          console.log(v);
          break;
        default:
          let unreachable: never = k;
          console.warn(
            "Style option '" +
              unreachable +
              "' not implemented (Canvas backend)"
          );
      }
    }
    return this;
  }
  path(): PathBackend {
    return new CanvasPathBackend(this.ctx);
  }
  text(): TextBackend {
    return new CanvasTextBackend(this.ctx);
  }
}
