/** @jsx jsx */
import { jsx, XML } from "../UnsafeXML";
import { Align, Backend, ellipsePoint } from ".";
import { svg } from "lit";

class SVGPathBackend implements Backend.Path {
  private d: string = "";
  private round: (x: number) => number = (x) => x;

  constructor(private svg: SVGBackend) {}

  move(x: number, y: number): this {
    let rounded = this.round;
    this.d += `M${rounded(x)} ${rounded(y)}`;
    return this;
  }
  line(x: number, y: number): this {
    let rounded = this.round;
    this.d += `L${rounded(x)} ${rounded(y)}`;
    return this;
  }
  cubic(
    c1x: number,
    c1y: number,
    c2x: number,
    c2y: number,
    x: number,
    y: number
  ): this {
    let rounded = this.round;
    this.d += `C${rounded(c1x)} ${rounded(c1y)} ${rounded(c2x)} ${rounded(
      c2y
    )} ${rounded(x)} ${rounded(y)}`;
    return this;
  }
  ellipse(
    cx: number,
    cy: number,
    radiusX: number,
    radiusY: number,
    axisRotation: number,
    angleOffset: number,
    angle: number
  ): this {
    let absAngle = Math.abs(angle);
    let fullTruns = Math.floor(absAngle);

    angle = Math.sign(angle) * (absAngle - fullTruns);
    if (angle >= 0.499 && angle <= 0.511) {
      let angle_2 = 0.5 * angle;
      this.ellipse(
        cx,
        cy,
        radiusX,
        radiusY,
        axisRotation,
        angleOffset,
        angle_2
      );
      this.ellipse(
        cx,
        cy,
        radiusX,
        radiusY,
        axisRotation,
        angleOffset + angle_2,
        angle_2
      );
      return this;
    }

    let [x0, y0] = ellipsePoint(
      cx,
      cy,
      radiusX,
      radiusY,
      axisRotation,
      angleOffset
    );
    let [x1, y1] = ellipsePoint(
      cx,
      cy,
      radiusX,
      radiusY,
      axisRotation,
      angleOffset + angle
    );
    let ccw = angle >= 0;

    this.line(x0, y0);

    let rounded = this.round;

    let dataTurns = "";

    if (fullTruns !== 0) {
      // Split full turns into multiple 1/4 + 3/4 turns
      let pre = `A${radiusX} ${radiusY} ${-axisRotation * 360}`;

      let [xm, ym] = ellipsePoint(
        cx,
        cy,
        radiusX,
        radiusY,
        axisRotation,
        angleOffset + (ccw ? 0.25 : -0.25)
      );
      /* First is shor, second long */
      let full = `${pre} ${0} ${ccw ? 0 : 1} ${rounded(xm)} ${rounded(
        ym
      )}${pre} ${1} ${ccw ? 0 : 1} ${rounded(x0)} ${rounded(y0)}`;
      dataTurns = full.repeat(fullTruns);
    }
    this.d += dataTurns;
    if (angle === 0) return this;
    this.d += `A${radiusX} ${radiusY} ${-axisRotation * 360} ${
      Math.abs(angle) > 0.5 ? 1 : 0
    } ${ccw ? 0 : 1} ${rounded(x1)} ${rounded(y1)}`;
    return this;
  }
  close(): this {
    this.d += "Z";
    return this;
  }
  draw(stroke: boolean, fill: boolean): this {
    this.svg._draw_path(this.d, stroke, fill);
    return this;
  }
  clip(): this {
    throw new Error("Method not implemented.");
    return this;
  }
}

export class SVGTextBackend implements Backend.Text {
  private round: (x: number) => number = (x) => x;

  constructor(private svg: SVGBackend) {}

  draw(x: number, y: number, text: string, align: Align = Align.C) {
    let bl: "text-after-edge" | "hanging" | "middle" = "middle",
      al: "start" | "end" | "middle" = "middle";
    switch (Align.vertical(align)) {
      case Align.T:
        bl = "hanging";
        break;
      case Align.B:
        bl = "text-after-edge";
        break;
    }
    switch (Align.horizontal(align)) {
      case Align.L:
        al = "start";
        break;
      case Align.R:
        al = "end";
        break;
    }
    let rounded = this.round;

    this.svg._do_draw(
      <text
        x={rounded(x)}
        y={rounded(y)}
        dominant-baseline={bl}
        text-anchor={al}
      >
        {text}
      </text>,
      false,
      true
    );
    return this;
  }
}

type SVGStyleObject = {
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

function colorToHex(
  color: [number, number, number, number?]
): [string, number] {
  let res =
    "#" +
    color[0].toString(16).padStart(2, "0") +
    color[1].toString(16).padStart(2, "0") +
    color[2].toString(16).padStart(2, "0");
  return [res, color[3] ?? 1];
}

function reAlign(
  x: number,
  y: number,
  width: number,
  height: number,
  current: Align,
  target: Align
) {
  width /= 2;
  height /= 2;
  switch (Align.horizontal(current)) {
    case Align.L:
      x -= width;
      break;
    case Align.R:
      x += width;
      break;
  }
  switch (Align.horizontal(target)) {
    case Align.L:
      x += width;
      break;
    case Align.R:
      x -= width;
      break;
  }
  switch (Align.vertical(current)) {
    case Align.T:
      y -= height;
      break;
    case Align.B:
      y += height;
      break;
  }
  switch (Align.vertical(target)) {
    case Align.T:
      y += height;
      break;
    case Align.B:
      y -= height;
      break;
  }
  return [x, y];
}

class SVGPrimitiveBackend implements Backend.Primitive {
  constructor(private svg: SVGBackend) {}

  circle(x: number, y: number, diameter: number, align: Align = Align.C) {
    let svg = this.svg;
    return {
      draw(s = true, f = true) {
        [x, y] = reAlign(x, y, diameter, diameter, Align.C, align);
        svg._do_draw(<circle cx={x} cy={y} r={diameter / 2} />, s, f);
      },
    };
  }
  square(x: number, y: number, width: number, align: Align = Align.C) {
    let svg = this.svg;
    return {
      draw(s = true, f = true) {
        [x, y] = reAlign(x, y, width, width, Align.TL, align);
        svg._do_draw(<rect x={x} y={y} width={width} height={width} />, s, f);
      },
    };
  }
}

export class SVGBackend implements Backend<"path" | "text" | "primitive"> {
  _svg: XML;
  private _sg: XML | undefined;

  constructor(width: number, height: number) {
    this._svg = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        version="1.1"
        viewBox={`0 0 ${width} ${height}`}
      />
    );
  }

  private _style_stack: SVGStyleObject[] = [];
  _style: SVGStyleObject = {
    stroke: {
      stroke: "#000000",
      "stroke-width": 1,
    },
    fill: {
      fill: "#000000",
    },
    fontSize: 9,
  };

  /**
   * Get the style group
   */
  _get_sg() {
    if (this._sg) return this._sg;
    this._sg = <g />;
    this._sg.applyAttributes(this._style.stroke, this._style.fill, {
      "font-size": this._style.fontSize,
      "font-family": "Times New Roman",
    });
    this._svg.append(this._sg);
    return this._sg;
  }

  _do_draw(element: XML, stroke: boolean, fill: boolean) {
    element.applyAttributes(
      stroke ? {} : { stroke: "none" },
      fill ? {} : { fill: "none" }
    );
    this._get_sg().append(element);
  }

  _attrsc(stroke: boolean, fill: boolean) {
    return {
      ...(stroke ? this._style.stroke : {}),
      ...(fill ? this._style.fill : { fill: "none" }),
    };
  }

  _draw_path(pathData: string, stroke: boolean, fill: boolean) {
    this._do_draw(<path d={pathData} />, stroke, fill);
  }

  clear(color?: [number, number, number, number?]) {
    this._svg.children = [];
    if (color) {
      let c = colorToHex(color);
      this._svg.append(
        <rect width="100%" height="100%" fill={c[0]} fill-opacity={c[1]} />
      );
    }
    return this;
  }

  save() {
    let _style = this._style;
    let style = {
      stroke: {
        ..._style.stroke,
      },
      fill: {
        ..._style.fill,
      },
      fontSize: _style.fontSize,
    };
    this._style_stack.push(style);
    return this;
  }
  restore() {
    let style = this._style_stack.pop();
    if (!style) throw new Error("Stack is empty!");
    this._style = style;

    // Reset style group
    this._sg = undefined;
    return this;
  }
  style(options: Backend.Style<"path" | "text">) {
    let color: [string, number];
    let style = this._style;
    for (let [k, v] of Object.entries(options) as [
      keyof typeof options,
      any
    ][]) {
      switch (k) {
        case "fill":
          color = colorToHex(v);
          style.fill.fill = color[0];
          if (color[1] === 1) delete style.fill["fill-opacity"];
          else style.fill["fill-opacity"] = color[1];
          break;
        case "stroke":
          color = colorToHex(v);
          style.stroke.stroke = color[0];
          if (color[1] === 1) delete style.stroke["stroke-opacity"];
          else style.stroke["stroke-opacity"] = color[1];
          break;
        case "lineWidth":
          style.stroke["stroke-width"] = v;
          break;
        case "fontSize":
          style.fontSize = v;
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
    this._sg = undefined;
    return this;
  }
  path(): Backend.Path {
    return new SVGPathBackend(this);
  }
  text(): Backend.Text {
    return new SVGTextBackend(this);
  }
  primitive(): Backend.Primitive {
    return new SVGPrimitiveBackend(this);
  }
}
