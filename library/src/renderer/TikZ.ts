import * as render from "./old";

type PicStyle = {
  stroke: {
    color: string;
    width: number;
    opacity: number;
  };
  fill: {
    color: string;
    opacity: number;
  };
  fontSize: number;
};

export default class TikZ implements render.Renderer2D {
  private TeX: string;
  width: number;
  height: number;
  path: string | undefined;
  pos: [number, number] | undefined;
  private style: PicStyle = {
    stroke: {
      color: "black",
      opacity: 1,
      width: 1,
    },
    fill: {
      opacity: 1,
      color: "black",
    },
    fontSize: 13,
  };

  round(x: number) {
    return Math.round(x * 10000) / 10000;
  }

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.TeX =
      `\\begin{tikzpicture}[x=1pt,y=-1pt,every node/.style={inner sep=0,outer sep=0}]%\n` +
      `\\fontfamily{ptm}\\selectfont%\n` +
      `\\useasboundingbox (0,0) rectangle (${width},${height});%\n` +
      `\\clip (0,0) rectangle (${width},${height});%\n`;
  }

  private _pathAttr(doFill: boolean, doStroke: boolean) {
    let { fill, stroke } = this.style;
    let attr;
    if (doFill)
      attr = `fill=${fill.color}${
        fill.opacity == 1 ? "" : ",fill opacity=" + fill.opacity
      }`;
    if (doStroke)
      attr =
        (attr ? attr + "," : "") +
        `draw=${stroke.color},line width=${stroke.width}${
          stroke.opacity == 1 ? "" : ",draw opacity=" + stroke.opacity
        }`;
    return attr;
  }

  get fillStyle(): string {
    throw new Error("not implemented");
  }
  set fillStyle(fillStyle: string) {
    let { fill } = this.style;
    let c = parseInt("0x" + fillStyle.substring(1));

    if (fillStyle.length === 9) {
      fill.opacity = (c & 0xff) / 255.0;
      c >>= 8;
    } else {
      fill.opacity = 1;
    }

    let b = 0xff & c,
      g = 0xff & (c >> 8),
      r = 0xff & (c >> 16);

    if (r == 0 && g == 0 && b == 0) fill.color = "black";
    else fill.color = `{rgb,255:red,${r}; green,${g}; blue,${b}}`;
  }

  get strokeStyle(): string {
    throw new Error("Not Implemented");
  }
  set strokeStyle(strokeStyle: string) {
    let { stroke } = this.style;
    let c = parseInt("0x" + strokeStyle.substring(1));

    if (strokeStyle.length === 9) {
      stroke.opacity = (c & 0xff) / 255.0;
      c >>= 8;
    } else {
      stroke.opacity = 1;
    }

    let b = 0xff & c,
      g = 0xff & (c >> 8),
      r = 0xff & (c >> 16);

    if (r == 0 && g == 0 && b == 0) stroke.color = "black";
    else stroke.color = `{rgb,255:red,${r}; green,${g}; blue,${b}}`;
  }

  get lineWidth() {
    throw new Error("Not Implemented");
  }
  set lineWidth(lineWidth: number) {
    this.style.stroke.width = lineWidth;
  }

  get fontSize() {
    return this.style.fontSize;
  }
  set fontSize(fontSize: number) {
    this.style.fontSize = fontSize;
  }

  set(options: render.SetOptions2D) {
    // Add as for assertion typechecks
    for (var [k, v] of Object.entries(options) as [
      keyof render.SetOptions2D,
      any
    ][]) {
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

  drawText(text: string, x: number, y: number, align: render.TextAlign = 0) {
    let anchor: string | undefined;
    switch (align & 0b1100) {
      case render.TextAlign.T:
        anchor = "north";
        break;
      case render.TextAlign.B:
        anchor = "south";
        break;
    }
    switch (align & 0b0011) {
      case render.TextAlign.L:
        anchor = (anchor ? anchor + " " : "") + "west";
        break;
      case render.TextAlign.R:
        anchor = (anchor ? anchor + " " : "") + "east";
        break;
    }
    anchor = anchor || "center";

    let rounded = this.round;

    this.TeX += `\\node at(${rounded(x)},${rounded(
      y
    )}) [anchor=${anchor}]{\\fontsize{${this.style.fontSize}pt}{${
      this.style.fontSize
    }pt}\\selectfont\\vphantom{Og}${text.replace("\\", "\\textbackslash{}")}};`;
    return this;
  }

  begin() {
    this.path = undefined;
    this.pos = undefined;
    return this;
  }
  move(x: number, y: number) {
    let rounded = this.round;
    this.path = (this.path || "") + ` (${rounded(x)},${rounded(y)})`;
    this.pos = [x, y];
    return this;
  }
  line(x: number, y: number) {
    if (!this.path) return this.move(x, y);
    let rounded = this.round;
    this.path += ` -- (${rounded(x)},${rounded(y)})`;
    this.pos = [x, y];
    return this;
  }
  quadratic(cpX: number, cpY: number, x: number, y: number): this {
    if (!this.path) return this.move(x, y);
    let [pX, pY] = this.pos as [number, number];
    // Tikz only supports cubic curves. Convert quadratic to cubic.
    return this.cubic(
      pX + (2 / 3) * (cpX - pX),
      pY + (2 / 3) * (cpY - pY),
      x + (2 / 3) * (cpX - x),
      y + (2 / 3) * (cpY - y),
      x,
      y
    );
  }
  cubic(
    cp1X: number,
    cp1Y: number,
    cp2X: number,
    cp2Y: number,
    x: number,
    y: number
  ): this {
    if (!this.path) return this.move(x, y);
    let rounded = this.round;
    this.path += ` .. controls (${rounded(cp1X)},${rounded(
      cp1Y
    )}) and (${rounded(cp2X)},${rounded(cp2Y)}) .. (${rounded(x)},${rounded(
      y
    )})`;
    this.pos = [x, y];
    return this;
  }
  close() {
    this.path += " -- cycle";
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
    startAngle = -startAngle;
    endAngle = -endAngle;
    let sx = x + radius * Math.cos(startAngle),
      sy = y + radius * Math.sin(startAngle);
    let ex = x + radius * Math.cos(endAngle),
      ey = y + radius * Math.sin(endAngle);
    startAngle /= 2 * Math.PI;
    endAngle /= 2 * Math.PI;
    startAngle -= Math.floor(startAngle);
    endAngle -= Math.floor(endAngle);

    // Clockwise and counterclockwise are inverted since units are too.
    if (cw && endAngle < startAngle) endAngle += 1;
    if (!cw && startAngle < endAngle) endAngle -= 1;

    this.line(sx, sy);
    let rounded = this.round;
    this.path += ` arc(${rounded(startAngle * 360)}:${rounded(
      endAngle * 360
    )}:${rounded(radius)})`;
    this.pos = [ex, ey];
    return this;
  }
  stroke() {
    let draw = `\\path [${this._pathAttr(false, true)}]${this.path};%\n`;
    this.TeX += draw;
    return this;
  }
  fill() {
    let draw = `\\path [${this._pathAttr(true, false)}]${this.path};%\n`;
    this.TeX += draw;
    return this;
  }
  fillAndStroke() {
    let draw = `\\path [${this._pathAttr(true, true)}]${this.path};%\n`;
    this.TeX += draw;
    return this;
  }

  toTeX() {
    return this.TeX + "\\end{tikzpicture}";
  }
  toFileString() {
    return this.toTeX();
  }
}
