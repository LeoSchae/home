import type { Renderer2D } from "./";
import * as xml from "../UnsafeXML";

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
  svg: xml.Element;

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
    this.svg = new xml.Element("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      "xmlns:xlink": "http://www.w3.org/1999/xlink",
      version: "1.1",
      viewBox: `0 0 ${width} ${height}`,
    });
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

  fillText(text: string, x: number, y: number): void {
    this.svg.append(
      new xml.Element(
        "text",
        { x: x, y: y, "font-size": this.style.fontSize },
        text
      )
    );
  }

  beginPath(): void {
    this._path = undefined;
  }
  moveTo(x: number, y: number): void {
    this._path = (this._path || "") + `M${x} ${y}`;
  }
  lineTo(x: number, y: number): void {
    this._path = (this._path || `M ${x} ${y}`) + `L${x} ${y}`;
  }
  closePath() {
    this._path = (this._path || "") + "Z";
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
    startAngle -= Math.PI / 2;
    endAngle -= Math.PI / 2;
    let sx = x + radius * Math.sin(-startAngle),
      sy = y + radius * Math.cos(-startAngle);
    let ex = x + radius * Math.sin(-endAngle),
      ey = y + radius * Math.cos(-endAngle);

    let delta = (endAngle - startAngle) / Math.PI / 2;
    delta = delta - Math.floor(delta);

    let short = delta <= 0.5 != ccw;

    this._path =
      (this._path || "M ${sx} ${sy}") +
      `L ${sx} ${sy}A ${radius} ${radius} 0 ${short ? 0 : 1} ${
        ccw ? 0 : 1
      } ${ex} ${ey}`;
  }
  stroke(): void {
    if (this._path)
      this.svg.append(
        new xml.Element("path", {
          d: this._path,
          fill: "none",
          ...this.style.stroke,
        })
      );
  }
  fill(): void {
    if (this._path)
      this.svg.append(
        new xml.Element("path", {
          d: this._path,
          ...this.style.fill,
        })
      );
  }
  fillAndStroke() {
    if (this._path)
      this.svg.append(
        new xml.Element("path", {
          d: this._path,
          ...this.style.fill,
          ...this.style.stroke,
        })
      );
  }
}