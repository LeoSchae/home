/** @jsx jsx */
import { jsx, XML } from "../UnsafeXML";
import { Renderer2D, TextAlign } from ".";

const R2D = 180.0 / Math.PI;
const PI2 = 2 * Math.PI;
const _PI2 = 0.5 / Math.PI;

type SVGStyle = {
  stroke: {
    stroke: string;
    "stroke-width": number;
    "stroke-opacity"?: number;
  };
  fill: {
    fill: string;
    "fill-opacity"?: number;
  };
  fontSize: number;
};

export default class SVG implements Renderer2D {
  svg: XML;

  private _path: string | undefined;
  private style: SVGStyle = {
    stroke: {
      stroke: "#000000",
      "stroke-width": 1,
    },
    fill: {
      fill: "#000000",
    },
    fontSize: 13,
  };

  round(x: number) {
    return Math.round(x * 10000) / 10000;
  }

  constructor(width: number, height: number) {
    this.svg = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        version="1.1"
        viewBox={`0 0 ${width} ${height}`}
      ></svg>
    );
  }

  get fillStyle(): string {
    return this.style.fill.fill;
  }
  set fillStyle(fillStyle: string) {
    let { fill } = this.style;
    // Opacity only for 8 digit hex
    if (fillStyle.length == 9) {
      let op = parseInt("0x" + fillStyle.slice(7, 9)) / 255.0;
      fillStyle = fillStyle.slice(0, 7);

      if (op === 1.0) delete fill["fill-opacity"];
      else fill["fill-opacity"] = Math.round(1000 * op) / 1000;
    } else delete fill["fill-opacity"];
    fill.fill = fillStyle;
  }

  get strokeStyle(): string {
    return this.style.stroke.stroke;
  }
  set strokeStyle(strokeStyle: string) {
    let { stroke } = this.style;
    // parse opacity if style is 8 digit hex
    if (strokeStyle.length == 9) {
      let opacity = parseInt("0x" + strokeStyle.slice(7, 9)) / 255.0;
      strokeStyle = strokeStyle.slice(0, 7);

      if (opacity === 1.0) delete stroke["stroke-opacity"];
      else stroke["stroke-opacity"] = Math.round(1000 * opacity) / 1000;
    } else delete stroke["stroke-opacity"];
    stroke.stroke = strokeStyle;
  }

  get lineWidth() {
    return this.style.stroke["stroke-width"];
  }
  set lineWidth(lineWidth: number) {
    this.style.stroke["stroke-width"] = lineWidth;
  }

  get fontSize() {
    return this.style.fontSize;
  }
  set fontSize(fontSize: number) {
    this.style.fontSize = fontSize;
  }

  drawText(text: string, x: number, y: number, align: TextAlign = 0) {
    let bl: "text-after-edge" | "hanging" | "middle" = "middle",
      al: "start" | "end" | "middle" = "middle";
    switch (align & 0b1100) {
      case TextAlign.T:
        bl = "hanging";
        break;
      case TextAlign.B:
        bl = "text-after-edge";
        break;
    }
    switch (align & 0b0011) {
      case TextAlign.L:
        al = "start";
        break;
      case TextAlign.R:
        al = "end";
        break;
    }
    let rounded = this.round;

    this.svg.append(
      <text
        x={rounded(x)}
        y={rounded(y)}
        font-size={this.style.fontSize}
        font-family="Times New Roman"
        dominant-baseline={bl}
        text-anchor={al}
      >
        {text}
      </text>
    );
    return this;
  }

  begin() {
    this._path = undefined;
    return this;
  }
  move(x: number, y: number) {
    let rounded = this.round;
    this._path = (this._path || "") + `M${rounded(x)} ${rounded(y)}`;
    return this;
  }
  line(x: number, y: number) {
    if (!this._path) return this.move(x, y);
    let rounded = this.round;
    this._path += `L${rounded(x)} ${rounded(y)}`;
    return this;
  }
  quadratic(cpX: number, cpY: number, x: number, y: number): this {
    if (!this._path) return this.move(x, y);
    let rounded = this.round;
    this._path += `Q${rounded(cpX)} ${rounded(cpY)} ${rounded(x)} ${rounded(
      y
    )}`;
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
    if (!this._path) return this.move(x, y);
    let rounded = this.round;
    this._path += `C${rounded(cp1X)} ${rounded(cp1Y)} ${rounded(
      cp2X
    )} ${rounded(cp2Y)} ${rounded(x)} ${rounded(y)}`;
    return this;
  }
  close() {
    this._path = (this._path || "") + "Z";
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
    let delta = (endAngle - startAngle) * _PI2;
    delta = delta - Math.floor(delta);
    if (delta >= 0.499 && delta <= 0.511) {
      // Half arcs are ambigous in svg files.
      // Split the arc into two half circles.
      let midAngle = startAngle + (cw ? +0.5 * delta : -0.5 * delta);
      this.arc(x, y, radius, startAngle, midAngle, cw);
      this.arc(x, y, radius, midAngle, endAngle, cw);
      return this;
    }

    let sx = x + radius * Math.cos(startAngle),
      sy = y + radius * Math.sin(startAngle);
    let ex = x + radius * Math.cos(endAngle),
      ey = y + radius * Math.sin(endAngle);

    let short = delta <= 0.5 == cw;

    let rounded = this.round;
    this.line(sx, sy);

    this._path += `A ${rounded(radius)} ${rounded(radius)} 0 ${short ? 0 : 1} ${
      cw ? 1 : 0
    } ${rounded(ex)} ${rounded(ey)}`;
    return this;
  }
  stroke() {
    if (this._path)
      this.svg.append(
        <path d={this._path} fill="none" {...this.style.stroke} />
      );
    return this;
  }
  fill() {
    if (this._path)
      this.svg.append(<path d={this._path} {...this.style.fill} />);
    return this;
  }
  fillAndStroke() {
    if (this._path)
      this.svg.append(
        <path d={this._path} {...this.style.fill} {...this.style.stroke} />
      );
    return this;
  }
  toXML() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n${this.svg.toString()}`;
  }
  toFileString() {
    return this.toXML();
  }
}
