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
      else fill["fill-opacity"] = op;
    }
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
      else stroke["stroke-opacity"] = opacity;
    }
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

  textNode(text: string, x: number, y: number, align: TextAlign = 0) {
    let bl: "text-after-edge" | "text-before-edge" | "middle" = "middle",
      al: "left" | "right" | "center" = "center";
    switch (align & 0b1100) {
      case TextAlign.T:
        bl = "text-before-edge";
        break;
      case TextAlign.B:
        bl = "text-after-edge";
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
    this.svg.append(
      <text
        x={x}
        y={y}
        font-size={this.style.fontSize}
        dominant-baseline={bl}
        text-align={al}
      >
        {text}
      </text>
    );
    return this;
  }

  beginPath() {
    this._path = undefined;
    return this;
  }
  moveTo(x: number, y: number) {
    this._path = (this._path || "") + `M${x} ${y}`;
    return this;
  }
  lineTo(x: number, y: number) {
    this._path = (this._path || `M ${x} ${y}`) + `L${x} ${y}`;
    return this;
  }
  closePath() {
    this._path = (this._path || "") + "Z";
    return this;
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

    this._path = (this._path || `M ${sx} ${sy}`) + `L ${sx} ${sy}`;

    let short = delta <= 0.5 == cw;

    this._path += `A ${radius} ${radius} 0 ${short ? 0 : 1} ${
      cw ? 1 : 0
    } ${ex} ${ey}`;
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
}
