import {
  ComplexScTr,
  drawCarthesian2DAxis,
  annotateCarthesian2DAxis,
} from "../canvas/axis";
import * as render from "../renderer";
import { DragZoomHover } from "../modules/Interact";
import * as math from "../modules/math";
import * as layers from "./layers";
import * as asyncLib from "@lib/modules/Async";
import { manualSizing } from "./layers/Options";
import { renderToString } from "katex";
import {
  Complete,
  ellipsePoint,
  FullBackend,
  Renderer,
} from "@lib/renderer/new";
import { SVGBackend } from "@lib/renderer/newSVG";
import { TikZBackend } from "@lib/renderer/newTikZ";
import { ProxyBackend } from "@lib/renderer/newProxy";
import { MeasuredRenderer } from "@lib/renderer/newScaled";
import { Matrix22 } from "@lib/modules/math/matrix";
import { InterceptedBackend, Transform } from "@lib/renderer/newIntercept";
import { config } from "process";
import { ExportButton } from "./layers/tmpExport";
import { CanvasBackend } from "@lib/renderer/newCanvas";

function download(
  content: string,
  name: string,
  dataType: string = "text/plain"
) {
  let data = `data:${dataType};base64,${window.btoa(content)}`;
  let link = document.createElement("a");
  link.setAttribute("download", name);
  link.href = data;
  link.click();
}

function height(...args: [number, number][]) {
  let fac = 1;
  let max = 0;
  for (var n of args) {
    let newFac = Math.abs(n[1] / math.gcd(fac, n[1]));
    fac *= newFac;
    max *= newFac;
    max = Math.max(max, Math.abs((n[0] * fac) / n[1]));
  }
  return max;
}

/**
 * [[a,c],[c,b]]
 * @param a
 * @param b
 * @param c
 * @returns
 */
function diagonalizeSymmetric(
  a: number,
  b: number,
  c: number
): [number, number, number] {
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
  if (c === 0) theta = a >= b ? 0 : 0.25;
  else if (a === b) theta = c > 0 ? 0.125 : 0.375;
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

  return [eig1, eig2, theta];
}

function ellipseTrafo(
  r: FullBackend<"path">,
  trafo: Matrix22,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  axisRotation: number,
  start: number,
  amount: number
): [number, number, number, number, number] {
  let m = new Matrix22(rx * rx, 0, 0, ry * ry);
  m = trafo.mul(m.mul(trafo.T));
  let radii = diagonalizeSymmetric(m.m[0], m.m[3], m.m[1]);

  let theta = -radii[2];
  let xrad = Math.sqrt(radii[0]),
    yrad = Math.sqrt(radii[1]);

  // find start and end angle

  let p0 = trafo.of(ellipsePoint(0, 0, rx, ry, axisRotation, start));

  p0 = Matrix22.rotation(theta).of(p0);

  p0 = [(50 * p0[0]) / xrad, (50 * p0[1]) / yrad];

  let arg = (0.5 * new math.Complex(...p0).arg()) / Math.PI;

  return [xrad, yrad, theta, -arg, amount];
}

let renderPoints = asyncLib.wrap.async(function* (
  r: FullBackend<"primitive">,
  options: {
    height: number;
    projection: ComplexScTr;
  }
) {
  let pr = options.projection;

  let fractions = FareyFractions(options.height);

  for (var x of fractions) {
    if (x[0] == x[1]) continue;
    for (var y of fractions) {
      if (y[0] == y[1]) continue;
      if (height(x, y, [1, 1]) > options.height) continue;
      yield;

      for (let [s0, s1] of [
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
      ]) {
        let p = pr.project([(s0 * x[0]) / x[1], (s1 * y[0]) / y[1]]);

        r.primitive()
          .square(...p, 1.2)
          .fill();
      }
    }
  }
  //let tpos = pr.project([0, 0]);
  //r.drawText("[0 : 0 : 1]", tpos[0] - 7, tpos[1] + 5, render.TextAlign.T);
  //tpos = pr.project([1, 1]);
  //r.drawText("[1 : 1 : 1]", tpos[0] + 7, tpos[1] - 5, render.TextAlign.B);
});

window.customElements.define(
  "projective-points",
  layers.LayeredComponent({
    connected(config) {
      let asyncManager = new asyncLib.AsyncManager<"draw">();

      const pr = new ComplexScTr([config.width / 2, config.height / 2], 100);

      let parameters = {
        projection: pr,
        height: 30,
      };

      const dzh = new DragZoomHover(
        (dragDir) => {
          pr.addTranslation(dragDir);
          config.update();
        },
        (zoomFactor, center) => {
          let p0 = pr.project([0, 0]);
          let p1 = pr.project([1, 0]);
          let d = Math.abs(p0[0] - p1[0]);
          if (zoomFactor <= (0.1 * config.width) / d)
            zoomFactor = (0.1 * config.width) / d;
          pr.addZoom(zoomFactor, center);

          config.update();
        },
        () => {}
      );
      dzh.registerListeners(config.containerElement);

      let options = config.addLayer("Options", layers.Options());

      options.add("number", {
        label: "Height",
        onChange(q) {
          parameters.height = q > 1 ? q : 1;
          config.update();
        },
        default: parameters.height,
      });

      options.add(manualSizing, config);
      options.add(
        ExportButton({
          setup: () => ({
            fileName: "P2Points",
            width: config.width,
            height: config.height,
          }),
          render: (r) => renderPoints(r, parameters),
        })
      );

      config.addLayer(
        "draw",
        layers.Canvas({
          update(config, ctx) {
            let re = Complete(new CanvasBackend(ctx));

            ctx.clearRect(0, 0, config.width, config.height);

            asyncManager.abortAll("draw");

            renderPoints(re, parameters, asyncManager.getNew("draw", 20)).catch(
              (e) => {
                if (e !== "aborted") console.log(e);
              }
            );
          },
        })
      );
    },
  })
);

function bestQ(scale: number, fs: number) {
  let Q = 0;
  let P = 1;
  let P2 = 0;
  while (true) {
    if (scale / ((Q + P) * (Q + P - 1)) < 0.75 * (1 + Math.log10(Q + P)) * fs) {
      if (P2 == 0) return Q;
      Q = Q + P2;
      P = 1;
      P2 = 0;
    } else {
      P2 = P;
      P = P * 2;
    }
  }
}

function FareyFractions(Q: number) {
  return {
    [Symbol.iterator]: function* (
      start?: [number, number, number, number]
    ): Generator<[number, number], void, unknown> {
      let [a, b, c, d] = start ?? [0, 1, 1, Q];
      yield [a, b];
      yield [c, d];
      while (d !== 1) {
        let k = Math.floor((Q + b) / d);
        [a, b, c, d] = [c, d, k * c - a, k * d - b];
        yield [c, d];
      }
    },
    approximate(v: number): [number, number, number, number] {
      let v_int = Math.floor(v);
      v = v - v_int;
      let a = 0,
        b = 1,
        c = 1,
        d = 1;

      while (true) {
        let _tmp = c - v * d; // Temporary denominator for 0 check

        // Batch e1 steps in direction c/d
        let e1: number | undefined;
        if (_tmp != 0) e1 = Math.floor((v * b - a) / _tmp);
        if (e1 === undefined || b + e1 * d > Q) e1 = Math.floor((Q - b) / d);

        a = a + e1 * c;
        b = b + e1 * d;

        _tmp = b * v - a; // Temporary denominator for 0 check

        // Batch e2 steps in direction a/b
        let e2: number | undefined;
        if (_tmp != 0) e2 = Math.floor((c - v * d) / _tmp);
        if (e2 === undefined || b * e2 + d > Q) e2 = Math.floor((Q - d) / b);

        c = a * e2 + c;
        d = b * e2 + d;

        // If both steps do nothing we are done
        if (e1 == 0 && e2 == 0) break;
      }
      return [a, b, c, d];
    },
    startAt(value: number) {
      return this.continue(...this.approximate(value));
    },
    continue(a: number, b: number, c: number, d: number) {
      if (b * c - a * d !== 1 || b + d <= Q)
        throw `${a}/${b} and ${c}/${d} are not consecutive`;
      return this[Symbol.iterator]([a, b, c, d]);
    },
  };
}
