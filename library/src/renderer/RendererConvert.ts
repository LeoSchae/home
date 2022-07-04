import type { Backend } from "./Backend";
import type { Renderer } from "./Renderer";
import { Align } from "./Align";
import { ellipsePoint } from ".";

export function parseColor(
  color?: [number, number, number, number?] | string
): [number, number, number, number?] | undefined;
export function parseColor(
  color: [number, number, number, number?] | string
): [number, number, number, number?];
export function parseColor(
  color?: [number, number, number, number?] | string
): [number, number, number, number?] | undefined {
  if (!color) return undefined;
  if (!(typeof color === "string")) return color;
  let c = parseInt("0x" + color.substring(1));

  let a: number | undefined;

  if (color.length === 9) {
    a = (c & 0xff) / 255.0;
    c >>= 8;
  }

  let b = 0xff & c,
    g = 0xff & (c >> 8),
    r = 0xff & (c >> 16);

  if (a === undefined) return [r, g, b];
  else return [r, g, b, a];
}

/**
 * Simplifies Renderer.Style<T> options into format
 * Backend.Style<T> that is accepted by Backends.
 * @param styleOptions The style to simplify
 * @returns The simplitfied style
 */
export function styleToBackendStyle<T extends Backend.Type>(
  styleOptions: Renderer.Style<T>
): Backend.Style<T> {
  let style: Backend.Style<any> = {};

  // Use loop for static type checking
  for (let [key, val] of Object.entries(styleOptions) as [
    keyof Renderer.Style<any>,
    any
  ][]) {
    if (val === undefined) continue;
    switch (key) {
      case "fill":
        style.fill = parseColor(val);
        break;
      case "stroke":
        style.stroke = parseColor(val);
        break;
      case "lineWidth":
        style.lineWidth = val;
        break;
      case "fontSize":
        style.fontSize = val;
        break;
      default:
        let never: never = key;
        console.log("Unknown style option '" + never + "'");
    }
  }
  return style;
}

export function rendererFromBackend<B extends Backend<"path">>(
  backend: B
): B extends Backend<infer T>
  ? Renderer<T | "primitive">
  : Renderer<"path" | "primitive"> {
  // Carefull: calls to _backend are not typechecked

  let r = {
    _backend: backend as Backend<"path">,
    clear(color?: [number, number, number, number?] | string) {
      this._backend.clear(parseColor(color));
      return this;
    },
    save() {
      this._backend.save();
      return this;
    },
    restore() {
      this._backend.restore();
      return this;
    },
    style(options: Renderer.Style<any>) {
      this._backend.style(styleToBackendStyle(options));
      return this;
    },
    // path is asserted in argument.
    path() {
      return new Path(this._backend.path());
    },
    primitive() {
      return new Primitive(this, this._backend.primitive?.());
    },
  };

  // text backend
  if ("text" in backend)
    (r as any as Renderer<"text">).text = function (this: typeof r) {
      return (this._backend as any as Backend<"text">).text();
    };

  return r as any;
}

/**
 * A wrapper for the a PathBackend that ensures the essential constraints.
 */
class Path implements Renderer.Path {
  protected isSet: boolean = false;
  protected sx: number = NaN;
  protected sy: number = NaN;
  protected cx: number = NaN;
  protected cy: number = NaN;

  private _c(x: number, y: number) {
    this.cx = x;
    this.cy = y;
  }

  constructor(private backend: Backend.Path) {}

  move(x: number, y: number): this {
    this.isSet = true;
    this.backend.move(x, y);
    this.sx = x;
    this.sy = y;
    this._c(x, y);
    return this;
  }
  line(x: number, y: number): this {
    if (!this.isSet) return this.move(x, y);
    this.backend.line(x, y);
    this._c(x, y);
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
    if (!this.isSet) this.move(x, y);
    this.backend.cubic(c1x, c1y, c2x, c2y, x, y);
    this._c(x, y);
    return this;
  }
  quadratic(cx: number, cy: number, x: number, y: number): this {
    if (!this.isSet) this.move(x, y);
    if (this.backend.quadratic) {
      this.backend.quadratic(cx, cy, x, y);
      this._c(x, y);
    } else {
      let x0 = this.cx as number,
        y0 = this.cy as number;
      this.backend.cubic(
        x0 + (2 / 3) * (cx - x0),
        y0 + (2 / 3) * (cy - y0),
        x + (2 / 3) * (cx - x),
        y + (2 / 3) * (cy - y),
        x,
        y
      );
      this._c(x, y);
    }
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
    // TODO
    this.line(
      ...ellipsePoint(cx, cy, radiusX, radiusY, axisRotation, angleOffset)
    );
    this.backend.ellipse(
      cx,
      cy,
      radiusX,
      radiusY,
      axisRotation,
      angleOffset,
      angle
    );
    this._c(
      ...ellipsePoint(
        cx,
        cy,
        radiusX,
        radiusY,
        axisRotation,
        angleOffset + angle
      )
    );
    return this;
  }
  arc(
    cx: number,
    cy: number,
    radius: number,
    angleOffset: number,
    angle: number
  ): this {
    if (!this.backend.arc)
      return this.ellipse(cx, cy, radius, radius, 0, angleOffset, angle);
    this.line(...ellipsePoint(cx, cy, radius, radius, 0, angleOffset));
    this.backend.arc(cx, cy, radius, angleOffset, angle);
    return this;
  }
  close(): this {
    if (!this.isSet) throw new Error("No path to close");
    this.backend.close();
    this._c(this.sx, this.sy);
    return this;
  }
  draw(stroke: boolean = true, fill: boolean = true): this {
    this.backend.draw(stroke, fill);
    return this;
  }
  fill(): this {
    return this.draw(false, true);
  }
  stroke(): this {
    return this.draw(true, false);
  }
  clip(): this {
    this.backend.clip();
    return this;
  }
}

function wrapPrimitive(p: { draw(s: boolean, f: boolean): void }) {
  return {
    draw: (s: boolean = true, f: boolean = true) => p.draw(s, f),
    stroke: () => p.draw(true, false),
    fill: () => p.draw(false, true),
  };
}

class Primitive {
  constructor(private r: Renderer<"path">, private b?: Backend.Primitive) {}

  circle(
    x: number,
    y: number,
    diameter: number,
    align: Align = 0
  ): {
    draw(stroke?: boolean, fill?: boolean): void;
    fill(): void;
    stroke(): void;
  } {
    if (this.b?.circle)
      return wrapPrimitive(this.b.circle(x, y, diameter, align));

    let radius = 0.5 * diameter;
    switch (Align.vertical(align)) {
      case Align.T:
        y -= radius;
        break;
      case Align.B:
        y += radius;
        break;
      case Align.C:
        break;
    }
    switch (Align.horizontal(align)) {
      case Align.L:
        x -= radius;
        break;
      case Align.R:
        x += radius;
        break;
      case Align.C:
        break;
    }

    return this.r.path().arc(x, y, radius, 0, 0.999).close();
  }

  square(x: number, y: number, width: number, align: Align = 0) {
    if (this.b?.square) return wrapPrimitive(this.b.square(x, y, width, align));
    let halfWidth = 0.5 * width;
    switch (Align.vertical(align)) {
      case Align.T:
        y -= halfWidth;
        break;
      case Align.B:
        y += halfWidth;
        break;
      case Align.C:
        break;
    }
    switch (Align.horizontal(align)) {
      case Align.L:
        x -= halfWidth;
        break;
      case Align.R:
        x += halfWidth;
        break;
      case Align.C:
        break;
    }
    return this.r
      .path()
      .move(x - halfWidth, y - halfWidth)
      .line(x + halfWidth, y - halfWidth)
      .line(x + halfWidth, y + halfWidth)
      .line(x - halfWidth, y + halfWidth)
      .close();
  }
}
