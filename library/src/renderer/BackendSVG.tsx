/** @jsx jsx */
import { jsx, XML } from "../UnsafeXML";
import { Align, Backend, ellipsePoint } from ".";

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
    console.log(angle);

    let absAngle = Math.abs(angle);
    let fullTruns = Math.floor(absAngle);
    //TODO FULL CIRCLES
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

    let rounded = this.round;

    this.d += `L${rounded(x0)} ${rounded(y0)}A${radiusX} ${radiusY} ${
      -axisRotation * 360
    } ${Math.abs(angle) > 0.5 ? 1 : 0} ${ccw ? 0 : 1} ${rounded(x1)} ${rounded(
      y1
    )}`;
    return this;
  }
  close(): this {
    this.d += "Z";
    return this;
  }
  draw(stroke: boolean, fill: boolean): this {
    this.svg._draw(this.d, stroke, fill);
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

    this.svg._svg.append(
      <text
        x={rounded(x)}
        y={rounded(y)}
        font-size={this.svg._style.fontSize}
        font-family="Times New Roman"
        dominant-baseline={bl}
        text-anchor={al}
      >
        {text}
      </text>
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

export class SVGBackend implements Backend<"path" | "text"> {
  _svg: XML;

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

  _draw(pathData: string, stroke: boolean, fill: boolean) {
    this._svg.append(
      <path
        d={pathData}
        {...(stroke ? this._style.stroke : {})}
        {...(fill ? this._style.fill : { fill: "none" })}
      />
    );
  }

  clear() {
    this._svg.children = [];
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
    return this;
  }
  path(): Backend.Path {
    return new SVGPathBackend(this);
  }
  text(): Backend.Text {
    return new SVGTextBackend(this);
  }
}
