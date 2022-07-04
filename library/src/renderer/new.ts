import { addColors } from "winston/lib/winston/config";
import { MeasuredRenderer } from "./newScaled";

export enum Align {
  C = 0b0000,
  T = 0b1000,
  L = 0b0010,
  R = 0b0001,
  B = 0b0100,
  TL = 0b1010,
  TR = 0b1001,
  BL = 0b0110,
  BR = 0b0101,
}

// TODO write tests
export function verticalAlign(align: Align): Align.T | Align.C | Align.B {
  return align & 0b1100;
}

export function horizontalAlign(align: Align): Align.L | Align.C | Align.R {
  return align & 0b0011;
}

type angle = number;
type length = number;

type color = [number, number, number, number?];

type BackendType = "path" | "text" | "primitive" | never;

export type BackendStyleOptions<T extends BackendType> = ("path" extends T
  ? {
      fill?: color;
      stroke?: color;
      lineWidth?: number;
    }
  : {}) &
  ("primitive" extends T
    ? {
        fill?: color;
        stroke?: color;
        lineWidth?: number;
      }
    : {}) &
  ("text" extends T
    ? {
        fill?: color;
        fontSize?: number;
      }
    : {});

export type FullBackendStyleOptions<T extends BackendType> = {
  fill?: color | string;
  stroke?: color | string;
  lineWidth?: number;
} & ("text" extends T ? { fontSize?: number } : {});

function parseColor(color?: color | string): color | undefined {
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

function parseStyleOptions<T extends BackendType>(
  options: FullBackendStyleOptions<T>
): BackendStyleOptions<T>;
function parseStyleOptions(
  options: FullBackendStyleOptions<any>
): BackendStyleOptions<any> {
  let style: BackendStyleOptions<any> = {};

  // Use loop for static type checking
  for (let [key, val] of Object.entries(options) as [
    keyof FullBackendStyleOptions<any>,
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

/** Handles a single path instance */
export interface PathBackend {
  /**
   * Move the current pen position.
   * This starts a new subpath that can be closed by close().
   * @param x
   * @param y
   */
  move(x: number, y: number): this;
  /**
   * Draws a line from the current position to the target position.
   * @param x
   * @param y
   */
  line(x: number, y: number): this;
  /**
   * Draws a cubic curve from the current position to the target position.
   * Uses the provided control points.
   * @param c1x
   * @param c1y
   * @param c2x
   * @param c2y
   * @param x
   * @param y
   */
  cubic(
    c1x: number,
    c1y: number,
    c2x: number,
    c2y: number,
    x: number,
    y: number
  ): this;

  /**
   * Draws a quadratic curve from the current position to the target position.
   * Uses the specified control point.
   * @param cx
   * @param cy
   * @param x
   * @param y
   */
  quadratic?(cx: number, cy: number, x: number, y: number): this;
  /**
   * Draw an ellipse with center cx, cy. The x-Axis is rotated by axisRotation. The arc is drawn from angleOffset by an amount of angle.
   * The angles are given in normalized units. 1 represents a full rotation.
   *
   * The method should only be called after the current position is at the correct starting point
   */
  /**
   * Draws an ellipse arc.
   * This method may assume that the current cursor is located at the correct starting position.
   * @param cx Center x
   * @param cy Center y
   * @param radiusX
   * @param radiusY
   * @param axisRotation Rotation of the x axis in # of turns (0.5 is a half rotation)
   * @param angleOffset The start angle measured in # of turns
   * @param angle The amount to draw measured in signed # of turns. Positive is ccw.
   */
  ellipse(
    cx: number,
    cy: number,
    radiusX: length,
    radiusY: length,
    axisRotation: angle,
    angleOffset: angle,
    angle: angle
  ): this;
  /**
   *
   * @param cx
   * @param cy
   * @param radius
   * @param angleOffset
   * @param angle
   */
  arc?(
    cx: number,
    cy: number,
    radius: length,
    angleOffset: angle,
    angle: angle
  ): this;
  /**
   * Close the current subpath to the last position that was moved to.
   */
  close(): this;
  /** Apply the currently drawn path on the backend */
  draw(stroke: boolean, fill: boolean): this;
  /** Apply the currently drawn path as clip path on the backend */
  clip(): this;
}

type Require<T> = { [key in keyof T]-?: T[key] };

export type FullPathBackend = {
  [key in keyof Require<PathBackend>]: (
    ...args: Parameters<Require<PathBackend>[key]>
  ) => FullPathBackend;
} & {
  fill(): FullPathBackend;
  stroke(): FullPathBackend;
};

export type TextBackend = {
  draw(x: number, y: number, text: string, align?: Align): TextBackend;
};

/**
 * A minimal rendering backend. Used to create a fully supported renderer.
 */
export type Backend<T extends BackendType & ("text" | "path" | never)> = {
  /** Saves the current style options and clip path to a stack. */
  save(): Backend<T>;
  /** Restores the latest style options and clip path from a stack */
  restore(): Backend<T>;
  /** Edit a set of style options */
  style(options: BackendStyleOptions<T>): Backend<T>;
} & ("path" extends T
  ? {
      /** Create a new path assigned to this backend */
      path(): PathBackend;
    }
  : {}) &
  ("text" extends T
    ? {
        text(): TextBackend;
      }
    : {});

export type FullBackend<T extends BackendType> = {
  /** Saves the current style options and clip path to a stack. */
  save(): FullBackend<T>;
  /** Restores the latest style options and clip path from a stack */
  restore(): FullBackend<T>;
  /** Edit a set of style options */
  style(options: FullBackendStyleOptions<T>): FullBackend<T>;
} & ("path" extends T
  ? {
      /** Create a new path assigned to this backend */
      path(): FullPathBackend;
    }
  : {}) &
  ("text" extends T
    ? {
        text(): TextBackend;
      }
    : {}) &
  ("primitive" extends T
    ? {
        primitive(): Primitive;
      }
    : {});

const twoPi = 2 * Math.PI;
const oneThird = 1 / 3;

export function ellipsePoint(
  cx: number,
  cy: number,
  radiusX: number,
  radiusY: number,
  axisRotation: number,
  angle: number
): [number, number] {
  angle *= twoPi;
  axisRotation *= twoPi;
  let x = radiusX * Math.cos(angle),
    y = radiusY * Math.sin(angle);
  let cos = Math.cos(axisRotation),
    sin = Math.sin(axisRotation);
  return [cx + cos * x - sin * y, cy - sin * x - cos * y];
}

export function Complete<B extends Backend<"path">>(
  backend: B
): B extends Backend<infer T>
  ? FullBackend<T | "primitive">
  : FullBackend<"path" | "primitive"> {
  // Carefull: calls to _backend are not typechecked

  let r = {
    _backend: backend as Backend<"path">,
    save() {
      this._backend.save();
      return this;
    },
    restore() {
      this._backend.restore();
      return this;
    },
    style(options: FullBackendStyleOptions<any>) {
      this._backend.style(parseStyleOptions(options));
      return this;
    },
    // path is asserted in argument.
    path() {
      return new Path(this._backend.path());
    },
    primitive() {
      return new Primitive(this);
    },
  };

  // text backend
  if ("text" in backend)
    (r as any as FullBackend<"text">).text = function (this: typeof r) {
      return (this._backend as any as Backend<"text">).text();
    };

  return r as any;
}

export type Renderer<T extends BackendType> = FullBackend<T>;

class Renderer2 implements FullBackend<"primitive"> {
  constructor(private backend: Backend<any>) {}

  save(): this {
    this.backend.save();
    return this;
  }
  restore(): this {
    this.backend.restore();
    return this;
  }
  style(options: FullBackendStyleOptions<"primitive">): this {
    this.backend.style(parseStyleOptions(options));
    return this;
  }
  path(): Path {
    return new Path(this.backend.path());
  }
  primitive(): Primitive {
    return new Primitive(this);
  }
}

/**
 * A wrapper for the a PathBackend that ensures the essential constraints.
 */
export class Path implements FullPathBackend {
  protected isSet: boolean = false;
  protected sx: number = NaN;
  protected sy: number = NaN;
  protected cx: number = NaN;
  protected cy: number = NaN;

  private _c(x: number, y: number) {
    this.cx = x;
    this.cy = y;
  }

  constructor(private backend: PathBackend) {}

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

export class Primitive {
  constructor(private r: FullBackend<"path">) {}

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
    let radius = 0.5 * diameter;
    switch (verticalAlign(align)) {
      case Align.T:
        y -= radius;
        break;
      case Align.B:
        y += radius;
        break;
      case Align.C:
        break;
    }
    switch (horizontalAlign(align)) {
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
    let halfWidth = 0.5 * width;
    switch (verticalAlign(align)) {
      case Align.T:
        y -= halfWidth;
        break;
      case Align.B:
        y += halfWidth;
        break;
      case Align.C:
        break;
    }
    switch (horizontalAlign(align)) {
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
