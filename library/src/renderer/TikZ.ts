import { Renderer2D, TextAlign } from ".";

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

export default class TikZ implements Renderer2D {
  private TeX: string;
  path: string | undefined;
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

  private round(x: number) {
    return Math.round(x * 1000) / 1000;
  }

  constructor(width: number, height: number) {
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

  textNode(text: string, x: number, y: number, align: TextAlign = 0) {
    let anchor: string | undefined;
    switch (align & 0b1100) {
      case TextAlign.T:
        anchor = "north";
        break;
      case TextAlign.B:
        anchor = "south";
        break;
    }
    switch (align & 0b0011) {
      case TextAlign.L:
        anchor = (anchor ? anchor + " " : "") + "west";
        break;
      case TextAlign.R:
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

  beginPath() {
    this.path = undefined;
    return this;
  }
  moveTo(x: number, y: number) {
    let rounded = this.round;
    this.path = (this.path || "") + ` (${rounded(x)},${rounded(y)})`;
    return this;
  }
  lineTo(x: number, y: number) {
    if (!this.path) return this.moveTo(x, y);
    let rounded = this.round;
    this.path += ` -- (${rounded(x)}, ${rounded(y)})`;
    return this;
  }
  closePath() {
    this.path += " -- cycle";
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
    cw?: boolean
  ) {
    let sx = x + radius * Math.cos(startAngle),
      sy = y + radius * Math.sin(startAngle);
    startAngle /= 2 * Math.PI;
    endAngle /= 2 * Math.PI;
    startAngle -= Math.floor(startAngle);
    endAngle -= Math.floor(endAngle);

    // Clockwise and counterclockwise are inverted since units are too.
    if (cw && endAngle < startAngle) endAngle += 1;
    if (!cw && startAngle < endAngle) endAngle -= 1;

    this.lineTo(sx, sy);
    let rounded = this.round;
    this.path += ` arc(${rounded(startAngle * 360)}:${rounded(
      endAngle * 360
    )}:${rounded(radius)})`;
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
