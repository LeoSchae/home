import { Align, Backend, ellipsePoint } from ".";

function colorToTeX(
  color: [number, number, number, number?]
): [string, number] {
  return [
    `{rgb,255:red,${color[0]}; green,${color[1]}; blue,${color[2]}}`,
    color[3] ?? 1,
  ];
}

class TikZPathBackend implements Backend.Path {
  private d: string = "";
  private round: (x: number) => number = (x) => x;

  constructor(private svg: TikZBackend) {}

  move(x: number, y: number): this {
    let rounded = this.round;
    this.d += `(${rounded(x)},${rounded(y)}) `;
    return this;
  }
  line(x: number, y: number): this {
    let rounded = this.round;
    this.d += `-- (${rounded(x)},${rounded(y)})`;
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
    this.d += `.. controls (${rounded(c1x)},${rounded(c1y)}) and (${rounded(
      c2x
    )},${rounded(c2y)}) .. (${rounded(x)},${rounded(y)})`;
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
    let fullTruns = Math.floor(angle);
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

    this.d += `(${rounded(x0)},${rounded(y0)}) {[rotate=${rounded(
      axisRotation * 360
    )}] arc[x radius=${rounded(radiusX)},y radius=${rounded(
      radiusY
    )},start angle=${rounded(360 * angleOffset)},delta angle=${rounded(
      360 * angle
    )}]}`;
    return this;
  }
  close(): this {
    this.d += "-- cycle";
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

class TikZTextBackend implements Backend.Text {
  private round = (x: number) => x;

  constructor(private tikz: TikZBackend) {}

  draw(
    x: number,
    y: number,
    text: string,
    align: Align = Align.C
  ): Backend.Text {
    let anchor: string | undefined;
    switch (Align.vertical(align)) {
      case Align.T:
        anchor = "north";
        break;
      case Align.B:
        anchor = "south";
        break;
    }
    switch (Align.horizontal(align)) {
      case Align.L:
        anchor = (anchor ? anchor + " " : "") + "west";
        break;
      case Align.R:
        anchor = (anchor ? anchor + " " : "") + "east";
        break;
    }
    anchor = anchor || "center";

    let rounded = this.round;

    this.tikz.TeX += `\\node at(${rounded(x)},${rounded(
      y
    )}) [anchor=${anchor}]{\\fontsize{${this.tikz._style.fontSize}pt}{${
      this.tikz._style.fontSize
    }pt}\\selectfont\\vphantom{Og}${text.replace("\\", "\\textbackslash{}")}};`;

    return this;
  }
}

type TikZStyleObject = {
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

export class TikZBackend implements Backend<"path" | "text"> {
  width: number;
  height: number;
  TeX: string;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.TeX = "";
    this.clear();
  }

  private _style_stack: TikZStyleObject[] = [];
  _style: TikZStyleObject = {
    stroke: {
      color: colorToTeX([0, 0, 0])[0],
      width: 1,
      opacity: 1,
    },
    fill: {
      color: colorToTeX([0, 0, 0])[0],
      opacity: 1,
    },
    fontSize: 9,
  };

  private _pathAttr(doStroke: boolean, doFill: boolean) {
    let { fill, stroke } = this._style;
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

  _draw(pathData: string, stroke: boolean, fill: boolean) {
    let draw = `\\path [${this._pathAttr(stroke, fill)}]${pathData};%\n`;
    this.TeX += draw;
  }

  clear() {
    this.TeX =
      `\\begin{tikzpicture}[x=1pt,y=-1pt,every node/.style={inner sep=0,outer sep=0}]%\n` +
      `\\fontfamily{ptm}\\selectfont%\n` +
      `\\useasboundingbox (0,0) rectangle (${this.width},${this.height});%\n` +
      `\\clip (0,0) rectangle (${this.width},${this.height});%\n`;
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
          color = colorToTeX(v);
          style.fill.color = color[0];
          style.fill.opacity = color[1];
          break;
        case "stroke":
          color = colorToTeX(v);
          style.stroke.color = color[0];
          style.stroke.opacity = color[1];
          break;
        case "lineWidth":
          style.stroke.width = v;
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
    return new TikZPathBackend(this);
  }

  text(): Backend.Text {
    return new TikZTextBackend(this);
  }

  toTikZ(): string {
    return this.TeX + "\\end{tikzpicture}";
  }
}
