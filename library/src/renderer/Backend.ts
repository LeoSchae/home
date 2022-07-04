import type { Align } from "./Align";

/**
 * Closely related to ./Renderer.ts
 */
export namespace Backend {
  export type Type = "path" | "text" | "primitive" | never;

  export type Style<T extends Type> = ("path" extends T
    ? {
        fill?: [number, number, number, number?];
        stroke?: [number, number, number, number?];
        lineWidth?: number;
      }
    : {}) &
    ("primitive" extends T
      ? {
          fill?: [number, number, number, number?];
          stroke?: [number, number, number, number?];
          lineWidth?: number;
        }
      : {}) &
    ("text" extends T
      ? {
          fill?: [number, number, number, number?];
          fontSize?: number;
        }
      : {});

  /** Handles a single path instance */
  export interface Path {
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
      radiusX: number,
      radiusY: number,
      axisRotation: number,
      angleOffset: number,
      angle: number
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
      radius: number,
      angleOffset: number,
      angle: number
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

  export type Primitive = {
    circle?(
      x: number,
      y: number,
      diameter: number,
      align?: Align
    ): {
      draw(stroke?: boolean, fill?: boolean): void;
      fill(): void;
      stroke(): void;
    };
    square?(
      x: number,
      y: number,
      width: number,
      align?: Align
    ): {
      draw(stroke?: boolean, fill?: boolean): void;
      fill(): void;
      stroke(): void;
    };
  };

  export type Text = {
    draw(x: number, y: number, text: string, align?: Align): Text;
  };
}

/**
 * A minimal rendering backend. Used to create a fully supported renderer.
 */
export type Backend<T extends Backend.Type> = {
  clear(color?: [number, number, number, number?]): Backend<T>;
  /** Saves the current style options and clip path to a stack. */
  save(): Backend<T>;
  /** Restores the latest style options and clip path from a stack */
  restore(): Backend<T>;
  /** Edit a set of style options */
  style(options: Backend.Style<T>): Backend<T>;
} & ("path" extends T
  ? {
      /** Create a new path assigned to this backend */
      path(): Backend.Path;
    }
  : {}) &
  ("text" extends T
    ? {
        text(): Backend.Text;
      }
    : {}) &
  ("primitive" extends T
    ? {
        primitive(): Backend.Primitive;
      }
    : {});
