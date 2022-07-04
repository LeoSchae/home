import { Colorizer } from "logform";
import { Align, Backend } from ".";

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

class CanvasPathBackend implements Backend.Path {
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

class CanvasTextBackend implements Backend.Text {
  private fontSize: number = 9;

  constructor(private ctx: CanvasRenderingContext2D) {}

  draw(x: number, y: number, text: string, align: Align = Align.C) {
    let baseline: CanvasTextBaseline = "middle",
      justify: CanvasTextAlign = "center";

    // Switch for exaustive type checking
    let vAlign = Align.vertical(align),
      hAlign = Align.horizontal(align);
    switch (vAlign) {
      case Align.T:
        baseline = "top";
        break;
      case Align.B:
        baseline = "bottom";
        break;
      case Align.C:
        break;
      default:
        let never: never = vAlign;
    }
    switch (hAlign) {
      case Align.L:
        justify = "left";
        break;
      case Align.R:
        justify = "right";
        break;
      case Align.C:
        break;
      default:
        let never: never = hAlign;
    }

    this.ctx.textBaseline = baseline;
    this.ctx.textAlign = justify;
    this.ctx.fillText(text, x, y);
    return this;
  }
}

export class CanvasBackend implements Backend<"path" | "text"> {
  constructor(private ctx: CanvasRenderingContext2D) {}

  clear(color: [number, number, number, number?]) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    if (color) {
      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.fillStyle = colorToCss(color);
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.ctx.restore();
    }
    return this;
  }
  save() {
    this.ctx.save();
    return this;
  }
  restore() {
    this.ctx.restore();
    return this;
  }
  style(options: Backend.Style<"path" | "text">) {
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
          this.ctx.font = v + "px 'LinuxLibertine', 'Times New Roman', Serif";
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
  path(): Backend.Path {
    return new CanvasPathBackend(this.ctx);
  }
  text(): Backend.Text {
    return new CanvasTextBackend(this.ctx);
  }
}
