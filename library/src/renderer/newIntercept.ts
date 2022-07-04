import { Complex } from "@lib/modules/math";
import { Matrix22 } from "@lib/modules/math/matrix";
import { start } from "repl";
import * as render from "./new";

type n = number;

/**
 * Matrix22.rotation(rotation) M Matrix22.rotation(rotation).T = Diag
 * @param symmetric
 * @returns
 */
export function diagonalizeSymetricByRotation(
  symmetric: Matrix22
): [diagonal: [number, number], rotation: number] {
  let [a, c, d, b] = symmetric.m;
  if (Math.abs(c - d) > 1e-5) throw new Error("Matrix not diagonal!");
  let eig1, eig2; // Eigenvalues of resulting matrix
  let tmp1; // sqrt((a-b)^2 + 4c^2)
  {
    tmp1 = a - b;
    tmp1 = tmp1 * tmp1 + 4 * c * c;
    tmp1 = Math.sqrt(tmp1);
    let tmp2 = a + b;
    eig1 = 0.5 * (tmp2 + tmp1);
    eig2 = 0.5 * (tmp2 - tmp1);
  }
  let theta;
  if (Math.abs(c) < 1e-5) theta = a >= b ? 0 : 0.25;
  else if (Math.abs(a - b) < 1e-5) theta = c > 0 ? 0.125 : 0.375;
  else {
    theta = (0.25 * Math.atan((2 * c) / (a - b))) / Math.PI;
    if (theta < 0) theta += 0.125;

    // theta is in range [0,0.125) now determine the quadrant
    let s1 = Math.sign(c),
      s2 = Math.sign(a - b);

    if (s1 === 1 && s2 === 1) {
    } else if (s1 === 1 && s2 === -1) theta += 0.125;
    else if (s1 === -1 && s2 === 1) theta += 0.375;
    else if (s1 === -1 && s2 === -1) theta += 0.25;
    else theta = 0;
  }

  return [[eig1, eig2], theta];
}

function transformEllipse(
  trafo: Matrix22,
  rx: n,
  ry: n,
  axisRotation: n,
  start: n,
  amount: n
): [n, n, n, n, n] {
  let ellipse = new Matrix22(rx * rx, 0, 0, ry * ry);
  let T = trafo.mul(Matrix22.rotation(axisRotation));
  ellipse = T.mul(ellipse.mul(T.T));

  let [[newrx, newry], theta] = diagonalizeSymetricByRotation(ellipse);
  theta = -theta;

  newrx = Math.sqrt(newrx);
  newry = Math.sqrt(newry);

  // Find correct starting angle
  let p0 = trafo.of(render.ellipsePoint(0, 0, rx, ry, axisRotation, start));
  p0 = Matrix22.rotation(theta).of(p0);

  let newStart =
    (0.5 * new Complex(p0[0] / newrx, p0[1] / newry).arg()) / Math.PI;

  return [newrx, newry, theta, -newStart, trafo.det < 0 ? -amount : amount];
}

export function Transform(linear: Matrix22, translate: [number, number]) {
  function transform(x: n, y: n): [n, n] {
    let p = linear.of([x, y]);
    return [p[0] + translate[0], p[1] + translate[1]];
  }

  return {
    move(this: render.FullPathBackend, x: number, y: number): boolean | void {
      this.move(...transform(x, y));
      return true;
    },
    line(this: render.FullPathBackend, x: number, y: number): boolean | void {
      this.line(...transform(x, y));
      return true;
    },
    cubic(
      this: render.FullPathBackend,
      c1x: number,
      c1y: number,
      c2x: number,
      c2y: number,
      x: number,
      y: number
    ): boolean | void {
      this.cubic(
        ...transform(c1x, c1y),
        ...transform(c2x, c2y),
        ...transform(x, y)
      );
      return true;
    },
    quadratic(
      this: render.FullPathBackend,
      cx: number,
      cy: number,
      x: number,
      y: number
    ): boolean | void {
      this.quadratic(...transform(cx, cy), ...transform(x, y));
      return true;
    },
    ellipse(
      this: render.FullPathBackend,
      cx: number,
      cy: number,
      radiusX: number,
      radiusY: number,
      axisRotation: number,
      angleOffset: number,
      angle: number
    ): boolean | void {
      this.ellipse(
        ...transform(cx, cy),
        ...transformEllipse(
          linear,
          radiusX,
          radiusY,
          axisRotation,
          angleOffset,
          angle
        )
      );
      return true;
    },
    arc(
      this: render.FullPathBackend,
      cx: number,
      cy: number,
      radius: number,
      angleOffset: number,
      angle: number
    ): boolean | void {
      this.ellipse(
        ...transform(cx, cy),
        ...transformEllipse(linear, radius, radius, 0, angleOffset, angle)
      );
      return true;
    },
    close(this: render.FullPathBackend): boolean | void {},
    draw(
      this: render.FullPathBackend,
      stroke: boolean,
      fill: boolean
    ): boolean | void {},
    clip(this: render.FullPathBackend): boolean | void {},
  };
}

type PathIntercept = {
  [key in keyof render.FullPathBackend]?: (
    this: render.FullPathBackend,
    ...args: Parameters<render.FullPathBackend[key]>
  ) => boolean | void;
};
class InterceptedPath implements render.FullPathBackend {
  private current: number | undefined;

  /**
   *
   * @param intercepts
   * @param handler
   * @param general Whether this Handle handles a specific call or the intercepts in general
   */
  constructor(
    private intercepts: PathIntercept[],
    private handler: render.FullPathBackend,
    general: boolean = true
  ) {
    if (!general) this.current = intercepts.length - 1;
  }

  private _do<K extends keyof render.FullPathBackend>(
    key: K,
    args: Parameters<render.FullPathBackend[K]>
  ) {
    if (this.current === undefined) {
      let h = new InterceptedPath(this.intercepts, this.handler, false);
      h._do(key, args);
    } else {
      let fn;
      while (this.current >= 0) {
        fn = this.intercepts[this.current--][key];
        if (typeof fn === "function") {
          if (fn.apply(this, args)) return;
        }
      }
      (this.handler[key] as any).apply(this.handler, args);
    }
  }

  move(x: number, y: number): this;
  move(...args: any) {
    this._do("move", args);
    return this;
  }
  line(x: number, y: number): this;
  line(...args: any) {
    this._do("line", args);
    return this;
  }
  cubic(
    c1x: number,
    c1y: number,
    c2x: number,
    c2y: number,
    x: number,
    y: number
  ): this;
  cubic(...args: any) {
    this._do("cubic", args);
    return this;
  }
  quadratic(cx: number, cy: number, x: number, y: number): this;
  quadratic(...args: any) {
    this._do("quadratic", args);
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
  ): this;
  ellipse(...args: any) {
    this._do("ellipse", args);
    return this;
  }
  arc(
    cx: number,
    cy: number,
    radius: number,
    angleOffset: number,
    angle: number
  ): this;
  arc(...args: any) {
    this._do("arc", args);
    return this;
  }
  close(): this;
  close(...args: any) {
    this._do("close", args);
    return this;
  }
  draw(stroke: boolean, fill: boolean): this;
  draw(...args: any) {
    this._do("draw", args);
    return this;
  }
  clip(): this;
  clip(...args: any) {
    this._do("clip", args);
    return this;
  }

  fill() {
    return this.draw(false, true);
  }

  stroke() {
    return this.draw(false, true);
  }
}

export class InterceptedBackend<B extends render.FullBackend>
  implements render.FullBackend
{
  intercepts: PathIntercept[] = [];
  constructor(public backend: B, intercepts?: { path?: PathIntercept }[]) {
    for (let i of intercepts || []) this.addIntercept(i);
  }

  protected addIntercept(intercept: { path?: PathIntercept }) {
    if (intercept.path) this.intercepts.push(intercept.path);
  }

  path(): render.FullPathBackend {
    return new InterceptedPath(this.intercepts, this.backend.path());
  }
  save() {
    this.backend.save();
    return this;
  }
  restore() {
    this.backend.restore();
    return this;
  }
  style(options: render.BackendStyleOptions) {
    this.backend.style(options);
    return this;
  }
}
