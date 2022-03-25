import type { Renderer2D } from ".";

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

  constructor(width: number, height: number) {
    this.TeX =
      `\\begin{tikzpicture}[x=1pt,y=-1pt]%\n` +
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

  fillText(text: string, x: number, y: number): void {
    throw new Error("Not implemented");
  }

  beginPath(): void {
    this.path = undefined;
  }
  moveTo(x: number, y: number): void {
    this.path = (this.path || "") + ` (${x},${y})`;
  }
  lineTo(x: number, y: number): void {
    let path = this.path;
    this.path = (path ? path + " -- " : " ") + `(${x}, ${y})`;
  }
  closePath() {
    this.path += " -- cycle";
  }
  rect(x: number, y: number, w: number, h: number): void {
    this.moveTo(x, y);
    this.lineTo(x + w, y);
    this.lineTo(x + w, y + h);
    this.lineTo(x, y + h);
    this.lineTo(x, y);
  }
  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    ccw?: boolean
  ): void {
    ccw = !ccw;
    let sx = x + radius * Math.cos(startAngle),
      sy = y + radius * Math.sin(startAngle);
    startAngle /= 2 * Math.PI;
    endAngle /= 2 * Math.PI;
    startAngle -= Math.floor(startAngle);
    endAngle -= Math.floor(endAngle);
    if (ccw && endAngle < startAngle) endAngle += 1;
    if (!ccw && startAngle < endAngle) endAngle -= 1;

    console.log(endAngle - startAngle);

    this.lineTo(sx, sy);
    this.path += ` arc(${startAngle * 360}:${endAngle * 360}:${radius})`;
  }
  stroke(): void {
    let draw = `\\path [${this._pathAttr(false, true)}]${this.path};%\n`;
    this.TeX += draw;
  }
  fill(): void {
    let draw = `\\path [${this._pathAttr(true, false)}]${this.path};%\n`;
    this.TeX += draw;
  }
  fillAndStroke() {
    let draw = `\\path [${this._pathAttr(true, true)}]${this.path};%\n`;
    this.TeX += draw;
  }

  toTeX() {
    return this.TeX + "\\end{tikzpicture}";
  }
}
