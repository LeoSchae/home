import * as xml from "../UnsafeXML";

/* map camel-case attributes to hyphenated ones */
function createNSElement(
  ns: string,
  tag: string,
  attrs: { [key: string]: string }
) {
  let el = document.createElementNS(ns, tag);
  for (var k of Object.keys(attrs))
    el.setAttribute(
      k.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase(),
      attrs[k]
    );
  return el;
}

export interface Renderer2D {
  get lineWidth(): number;
  set lineWidth(lineWidth: number);

  get fontSize(): number;
  set fontSize(fontSize: number);

  get fillStyle(): string;
  set fillStyle(fillStyle: string);

  get strokeStyle(): string;
  set strokeStyle(strokeStyle: string);

  fillText(text: string, x: number, y: number): void;

  beginPath(): void;

  moveTo(x: number, y: number): void;

  lineTo(x: number, y: number): void;

  closePath(): void;

  rect(x: number, y: number, w: number, h: number): void;

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    ccw?: boolean
  ): void;

  stroke(): void;

  fill(): void;

  fillAndStroke(): void;
}

export interface PredictiveRenderer2D extends Renderer2D {
  width: number;
  height: number;

  measureText(text: string): {
    top: number;
    bot: number;
    left: number;
    right: number;
  };
}

export class Renderer2DCanvas implements PredictiveRenderer2D {
  private _ctx: CanvasRenderingContext2D;

  private _lineWidth = 1;
  private _fontSize = 13;
  private _fillColor = "#000000";
  private _strokeColor = "#000000";

  private fontAscent: number = -1;
  private fontDescent: number = -1;

  width: number;
  height: number;

  constructor(ctx: CanvasRenderingContext2D) {
    this._ctx = ctx;
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;
  }

  get lineWidth() {
    return this._lineWidth;
  }
  set lineWidth(lineWidth: number) {
    this._ctx.lineWidth = lineWidth;
    this._lineWidth = lineWidth;
  }

  get fontSize() {
    return this._fontSize;
  }
  set fontSize(fontSize: number) {
    this._ctx.textBaseline = "alphabetic";
    this._ctx.font = fontSize + "px Serif";
    this._fontSize = fontSize;
    const tm = this._ctx.measureText("1ATOgjp");
    this.fontAscent =
      tm.fontBoundingBoxAscent ||
      tm.actualBoundingBoxAscent +
        0.15 * tm.actualBoundingBoxAscent +
        0.15 * tm.actualBoundingBoxDescent;
    this.fontDescent = tm.fontBoundingBoxDescent || tm.actualBoundingBoxDescent;
  }

  get fillStyle(): string {
    return this._fillColor;
  }
  set fillStyle(fillStyle: string) {
    this._ctx.fillStyle = fillStyle;
    this._fillColor = fillStyle;
  }

  get strokeStyle(): string {
    return this._strokeColor;
  }
  set strokeStyle(strokeStyle: string) {
    this._ctx.strokeStyle = strokeStyle;
    this._strokeColor = strokeStyle;
  }

  measureText(text: string) {
    const tm = this._ctx.measureText(text);
    return {
      top: this.fontAscent,
      bot: this.fontDescent,
      left: tm.actualBoundingBoxLeft,
      right: tm.actualBoundingBoxRight,
    };
  }

  fillText(text: string, x: number, y: number) {
    this._ctx.fillText(text, x, y);
  }

  beginPath() {
    this._ctx.beginPath();
  }

  moveTo(x: number, y: number) {
    this._ctx.moveTo(x, y);
  }

  lineTo(x: number, y: number) {
    this._ctx.lineTo(x, y);
  }

  closePath() {
    this._ctx.closePath();
  }

  rect(x: number, y: number, w: number, h: number) {
    this._ctx.rect(x, y, w, h);
  }

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    ccw?: boolean
  ): void {
    this._ctx.arc(x, y, radius, startAngle, endAngle, ccw);
  }

  stroke() {
    this._ctx.stroke();
  }

  fill() {
    this._ctx.fill();
  }

  fillAndStroke() {
    this.fill();
    this.stroke();
  }
}

export class Renderer2DSVG implements Renderer2D {
  svg: xml.Element;

  private _path: string | undefined;

  private strokeAttr: {
    stroke: string;
    "stroke-width": number;
    "stroke-opacity"?: number;
  } = {
    stroke: "#000000",
    "stroke-width": 1,
  };
  private fillAttr: { fill: string; "fill-opacity"?: number } = {
    fill: "#000000",
  };

  private _fontSize = 13;

  constructor(width: number, height: number) {
    this.svg = new xml.Element("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      "xmlns:xlink": "http://www.w3.org/1999/xlink",
      version: "1.1",
      viewBox: `0 0 ${width} ${height}`,
    });
  }

  get fillStyle(): string {
    return this.fillAttr.fill;
  }
  set fillStyle(fillStyle: string) {
    if (fillStyle.length == 9) {
      let op = parseInt("0x" + fillStyle.slice(7, 9)) / 255.0;
      fillStyle = fillStyle.slice(0, 7);

      if (op === 1.0) delete this.fillAttr["fill-opacity"];
      else this.fillAttr["fill-opacity"] = op;
    }
    this.fillAttr.fill = fillStyle;
  }

  get strokeStyle(): string {
    return this.strokeAttr.stroke;
  }
  set strokeStyle(strokeStyle: string) {
    if (strokeStyle.length == 9) {
      let op = parseInt("0x" + strokeStyle.slice(7, 9)) / 255.0;
      strokeStyle = strokeStyle.slice(0, 7);

      if (op === 1.0) delete this.strokeAttr["stroke-opacity"];
      else this.strokeAttr["stroke-opacity"] = op;
    }
    this.strokeAttr.stroke = strokeStyle;
  }

  get lineWidth() {
    return this.strokeAttr["stroke-width"];
  }
  set lineWidth(lineWidth: number) {
    this.strokeAttr["stroke-width"] = lineWidth;
  }

  get fontSize() {
    return this._fontSize;
  }
  set fontSize(fontSize: number) {
    this._fontSize = fontSize;
  }

  fillText(text: string, x: number, y: number): void {
    this.svg.append(
      new xml.Element("text", { x: x, y: y, "font-size": this._fontSize }, [
        text,
      ])
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
          ...this.strokeAttr,
        })
      );
  }
  fill(): void {
    if (this._path)
      this.svg.append(
        new xml.Element("path", {
          d: this._path,
          ...this.fillAttr,
        })
      );
  }
  fillAndStroke() {
    if (this._path)
      this.svg.append(
        new xml.Element("path", {
          d: this._path,
          ...this.fillAttr,
          ...this.strokeAttr,
        })
      );
  }
}

/*const SVG_NS = "http://www.w3.org/2000/svg";

export class Renderer2DSVG implements PredictiveRenderer2D {
  svg: Element;
  currentPath: string | undefined;

  private _lineWidth: number = 1;
  private _fontSize: number = 13;
  private _strokeColor: string = "#000000";
  private _fillColor: string = "#000000";

  constructor(public width: number, public height: number) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    svg.setAttribute("version", "1.1");
    svg.setAttribute("viewBox", "0 0 " + width + " " + height);
    this.svg = svg;
  }

  _addStrokeAttr(attr: { [key: string]: string }) {
    let stroke = this._strokeColor;
    if (stroke.length == 9) {
      let op = parseInt("0x" + stroke.slice(7, 9)) / 255.0;
      attr.stroke = stroke.slice(0, 7);
      attr.strokeOpacity = "" + op;
    }
    attr.stroke = stroke;
    attr.strokeWidth = "" + this._lineWidth;
  }

  _addFillAttr(attr: { [key: string]: string }) {
    let fill = this._fillColor;
    if (fill.length == 9) {
      let op = Math.round(parseInt("0x" + fill.slice(7, 9)) / 2.55) / 100;
      attr.fill = fill.slice(0, 7);
      attr.fillOpacity = "" + op;
    } else attr.fill = fill;
  }

  get fillStyle(): string {
    return this._fillColor;
  }
  set fillStyle(fillStyle: string) {
    this._fillColor = fillStyle;
  }

  get strokeStyle(): string {
    return this._strokeColor;
  }
  set strokeStyle(strokeStyle: string) {
    this._strokeColor = strokeStyle;
  }

  get lineWidth() {
    return this._lineWidth;
  }
  set lineWidth(lineWidth: number) {
    this._lineWidth = lineWidth;
  }

  get fontSize() {
    return this._fontSize;
  }
  set fontSize(fontSize: number) {
    this._fontSize = fontSize;
  }
  private _fillText(text: string) {
    const el = document.createElementNS(SVG_NS, "text");
    el.setAttribute("font-family", "serif");
    el.setAttribute("font-size", this._fontSize + "px");
    el.textContent = text;
    return el;
  }
  measureText(text: string): {
    top: number;
    bot: number;
    left: number;
    right: number;
  } {
    const el = this._fillText(text);
    el.setAttribute("x", "0");
    el.setAttribute("y", "0");
    this.svg.appendChild(el);

    if (!el.isConnected) {
      const body = document.getElementsByTagName("body")[0];
      const div = document.createElement("div");
      div.appendChild(this.svg);
      body.appendChild(div);
      queueMicrotask(() => {
        console.log("Removing div!");
        body.removeChild(div);
      });
    }

    const { x = 1, y = 1, width = 1, height = 1 } = el.getBBox();
    el.remove();
    return { left: -x, top: -y, right: width + x, bot: height + y };
  }
  fillText(text: string, x: number, y: number): void {
    const el = this._fillText(text);
    if (Number.isNaN(x)) throw new Error();
    el.setAttribute("x", "" + x);
    el.setAttribute("y", "" + y);
    //el.setAttribute("fill", "#000000");
    this.svg.appendChild(el);
  }
  beginPath(): void {
    this.currentPath = undefined;
  }
  moveTo(x: number, y: number): void {
    this.currentPath = (this.currentPath || "") + `M${x} ${y}`;
  }
  lineTo(x: number, y: number): void {
    this.currentPath = (this.currentPath || `M ${x} ${y}`) + `L${x} ${y}`;
  }
  closePath() {
    this.currentPath = (this.currentPath || "") + "Z";
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

    this.currentPath =
      (this.currentPath || "M ${sx} ${sy}") +
      `L ${sx} ${sy}A ${radius} ${radius} 0 ${short ? 0 : 1} ${
        ccw ? 0 : 1
      } ${ex} ${ey}`;
  }
  stroke(): void {
    let attrs = {
      d: this.currentPath || "",
      fill: "none" ,
    };
    this._addStrokeAttr(attrs);
    this.svg.appendChild(createNSElement(SVG_NS, "path", attrs));
  }
  fill(): void {
    let attrs = {
      d: this.currentPath || "",
    };
    this._addFillAttr(attrs);
    this.svg.appendChild(createNSElement(SVG_NS, "path", attrs));
  }
  fillAndStroke() {
    let attrs = {
      d: this.currentPath || "",
    };
    this._addStrokeAttr(attrs);
    this._addFillAttr(attrs);
    this.svg.appendChild(createNSElement(SVG_NS, "path", attrs));
  }
}*/

enum DrawOp {
  BEGIN,
  MOVE,
  LINE,
  ARC,
  CLOSE,
  STROKE,
  FILL,
  TEXTFILL,
  CH_LINEWIDTH,
  CH_FONTSIZE,
  CH_STROKESTYLE,
  CH_FILLSTYLE,
}

export class Renderer2DBuffer implements Renderer2D {
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
  measureText(text: string): {
    top: number;
    bot: number;
    left: number;
    right: number;
  } {
    throw new Error("Method not implemented.");
  }
  fillText(text: string, x: number, y: number): void {
    this.data.push(DrawOp.TEXTFILL, text, x, y);
  }
  beginPath(): void {
    this.data.push(DrawOp.BEGIN);
  }
  moveTo(x: number, y: number): void {
    this.data.push(DrawOp.MOVE, x, y);
  }
  lineTo(x: number, y: number): void {
    this.data.push(DrawOp.LINE, x, y);
  }
  closePath() {
    this.data.push(DrawOp.CLOSE);
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
    this.data.push(DrawOp.ARC, x, y, radius, startAngle, endAngle, ccw);
  }
  stroke(): void {
    this.data.push(DrawOp.STROKE);
  }
  fill(): void {
    this.data.push(DrawOp.FILL);
  }
  fillAndStroke() {
    /* TODO */
    this.fill();
    this.stroke();
  }
  applyOn(r: Renderer2D): void {
    const data = this.data;
    let d;
    let i;
    for (i = 0; i < this.data.length; i++) {
      d = data[i] as DrawOp;

      switch (d) {
        case DrawOp.BEGIN:
          r.beginPath();
          break;
        case DrawOp.CH_FONTSIZE:
          r.fontSize = data[++i];
          break;
        case DrawOp.CH_LINEWIDTH:
          r.lineWidth = data[++i];
          break;
        case DrawOp.CH_STROKESTYLE:
          r.strokeStyle = data[++i];
          break;
        case DrawOp.CH_FILLSTYLE:
          r.fillStyle = data[++i];
          break;
        case DrawOp.FILL:
          r.fill();
          break;
        case DrawOp.LINE:
          r.lineTo(data[++i], data[++i]);
          break;
        case DrawOp.ARC:
          r.arc(
            data[++i],
            data[++i],
            data[++i],
            data[++i],
            data[++i],
            data[++i]
          );
          break;
        case DrawOp.MOVE:
          r.moveTo(data[++i], data[++i]);
          break;
        case DrawOp.STROKE:
          r.stroke();
          break;
        case DrawOp.TEXTFILL:
          r.fillText(data[++i], data[++i], data[++i]);
          break;
        case DrawOp.CLOSE:
          r.closePath();
          break;
        default:
          assertUnreachable(d);
      }
    }
  }
}

function assertUnreachable(d: never) {
  throw "Asserted Unrechable";
}
