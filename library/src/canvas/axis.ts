import { Complex } from "../modules/math";
import * as render from "../renderer";
import * as sprites from "./sprites";
import TeX from "./TeX";

export class ComplexScTr {
  constructor(public origin: [number, number], public scale: number) {}

  project(z: Complex | [number, number]): [number, number] {
    if (Array.isArray(z)) z = new Complex(z[0], z[1]);
    return [
      z.real * this.scale + this.origin[0],
      -z.imag * this.scale + this.origin[1],
    ];
  }

  invert(p: [number, number]): Complex {
    return new Complex(
      (p[0] - this.origin[0]) / this.scale,
      -(p[1] - this.origin[1]) / this.scale
    );
  }

  addTranslation(d: [number, number]) {
    this.origin = [this.origin[0] + d[0], this.origin[1] + d[1]];
  }

  addZoom(fac: number, c: [number, number]) {
    const [ox, oy] = this.origin;
    this.origin = [ox * fac + c[0] * (1 - fac), oy * fac + c[1] * (1 - fac)];
    this.scale *= fac;
  }
}

/**
 * Draw an arrow with infinite length.
 * @param ctx Render context
 * @param width Screen width
 * @param height Screen height
 * @param p Point on line
 * @param d Direction of arrow
 * @param options Optional stuff
 * @returns [sx, sy, ex, ey] The start and end points of the drawn arrow.
 */
function infArrow(
  ctx: render.Renderer2D,
  width: number,
  height: number,
  p: [number, number],
  d: [number, number],
  { arrowSize = 9 } = {}
): [number, number, number, number] {
  const dabs = Math.sqrt(d[0] * d[0] + d[1] * d[1]);
  d = [d[0] / dabs, d[1] / dabs];
  const t: number[] = [
    d[0] === 0 ? -Infinity : (0 - p[0]) / d[0],
    d[0] === 0 ? Infinity : (width - p[0]) / d[0],
    d[1] === 0 ? -Infinity : (0 - p[1]) / d[1],
    d[1] === 0 ? Infinity : (height - p[1]) / d[1],
  ].sort((a, b) => a - b);

  // start and end. may still be out of bounds
  const s = [p[0] + t[1] * d[0], p[1] + t[1] * d[1]];
  const e = [p[0] + (t[2] - 1) * d[0], p[1] + (t[2] - 1) * d[1]];

  ctx.beginPath();
  ctx.moveTo(s[0], s[1]);
  ctx.lineTo(e[0] - 2 * d[0], e[1] - 2 * d[1]);
  ctx.stroke();

  let a = arrowSize;
  ctx.beginPath();
  ctx.moveTo(e[0], e[1]);
  ctx.lineTo(
    e[0] - a * d[0] + 0.5 * a * d[1],
    e[1] - a * d[1] - 0.5 * a * d[0]
  );
  ctx.lineTo(
    e[0] - a * d[0] - 0.5 * a * d[1],
    e[1] - a * d[1] + 0.5 * a * d[0]
  );
  ctx.lineTo(e[0], e[1]);
  ctx.fill();

  return [s[0], s[1], e[0], e[1]];
}

/**
 * Draw the axes of the complex plane under a linear projection.
 * @param ctx The rendering context
 * @param width Width of the context
 * @param height Height of the context
 * @param projection The projection to use for the coordinates
 * @param projection.origin The origin position on screen
 * @param projection.scale The scale of the plane
 * @param options options for drawing
 */
export function drawCarthesian2DAxis(
  ctx: render.Renderer2D & {
    width: number;
    height: number;
  } & render.MeasureText,
  projection: { origin: [number, number]; scale: number },
  {
    arrowSize: as = 7,
    fontSize: fs = 13,
    labelX = TeX.mathBB("R"),
    labelY = "i" + TeX.mathBB("R"),
  } = {}
) {
  let { origin, scale } = projection;
  const { width, height } = ctx;

  ctx.fontSize = fs;

  const project = function (
    this: { ox: number; oy: number; ps: number },
    r: number,
    i: number = 0
  ): [number, number] {
    let { ps, ox, oy } = this;
    return [r * ps + ox, -i * ps + oy];
  }.bind({ ox: origin[0], oy: origin[1], ps: scale });

  const pos1 = project(1);
  const posi = project(0, 1);

  const dx = [pos1[0] - origin[0], pos1[1] - origin[1]] as [number, number];
  const dy = [posi[0] - origin[0], posi[1] - origin[1]] as [number, number];

  const [, , rx, ry] = infArrow(ctx, width, height, origin, dx, {
    arrowSize: as,
  });
  const [, , ix, iy] = infArrow(ctx, width, height, origin, dy, {
    arrowSize: as,
  });

  // TODO drawing is not good for rotations!
  if (labelX)
    ctx.textNode(
      labelX,
      rx - 0.2 * fs,
      ry + 0.2 * fs + as / 2,
      render.TextAlign.TR
    );

  if (labelY)
    ctx.textNode(
      labelY,
      ix - 0.2 * fs - as / 2,
      iy + 0.2 * fs,
      render.TextAlign.TR
    );
}

export function annotateCarthesian2DAxis(
  ctx: render.Renderer2D,
  axis: "x",
  { origin: p0, scale: ps }: { origin: [number, number]; scale: number },
  annotations: { sprite: sprites.BBSprite; at: number }[],
  { gap = 5 } = {}
) {
  var width: number = (ctx as any).width || 0;
  var height: number = (ctx as any).height || 0;

  if (axis == "x") {
    let x0 = p0[0];
    let y0 = p0[1];

    for (let i = 0; i < annotations.length; i++) {
      let { at, sprite } = annotations[i];
      let x = at * ps + x0;

      if (x + sprite.right >= 0 && x - sprite.left <= width) {
        let t = y0,
          l = x - 0.5,
          r = x + 0.5,
          b = y0 + 3;
        ctx
          .beginPath()
          .moveTo(l, t)
          .lineTo(r, t)
          .lineTo(r, b)
          .lineTo(l, b)
          .closePath();
        ctx.fill();
        sprite.draw(ctx, x, y0 + sprite.top + gap);
      }
    }
  }
}
