import { ComplexScTr } from "../canvas/axis";
import { DragZoomHover } from "../modules/Interact";
import * as math from "../modules/math";
import * as layers from "./layers";
import { Async, Sync } from "@lib/modules/Async";
import { manualSizing } from "./layers/Options";
import { Renderer, CanvasBackend } from "@lib/renderer/";
import { ExportButton } from "./layers/tmpExport";
import { render } from "katex";

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

let renderPoints = Async.wrap(function* (
  r: Renderer<"primitive">,
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

      let drawTask = new Async.Group("drawTask");
      config.addLayer(
        "draw",
        layers.Canvas({
          update(config, ctx) {
            let re = Renderer.from(new CanvasBackend(ctx));

            ctx.clearRect(0, 0, config.width, config.height);

            drawTask.abort();

            renderPoints
              .with(drawTask)(re, parameters)
              .catch((e) => {
                if (!e.isAbort) console.log(e);
              });
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
