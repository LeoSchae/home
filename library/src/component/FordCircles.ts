import {
  ComplexScTr,
  drawCarthesian2DAxis,
  annotateCarthesian2DAxis,
} from "../canvas/axis";
import * as render from "../renderer";
import { BBSprite, FracSprite, TextSprite } from "../canvas/sprites";
import { DragZoomHover } from "../modules/Interact";
import { Complex } from "../modules/math";
import * as layers from "./layers";

window.customElements.define(
  "farey-fractions",
  layers.LayeredComponent({
    connected(config) {
      const app = this;

      const pr = new ComplexScTr([100, 100], 100);

      function fixTrZoom() {
        let p0 = pr.project(new Complex(0));
        let p1 = pr.project(new Complex(1));
        let d = Math.abs(p0[0] - p1[0]);

        let mod = false;

        let { width, height } = config;

        if (p0[1] < height / 6) {
          pr.addTranslation([0, -p0[1] + height / 6]);
          mod = true;
        } else if (p0[1] > (5 * height) / 6) {
          pr.addTranslation([0, -p0[1] + (5 * height) / 6]);
          mod = true;
        }
        if (p1[0] < 0.5 * width) {
          pr.addTranslation([-p1[0] + 0.5 * width, 0]);
          mod = true;
        }
        if (p0[0] > width * 0.5) {
          pr.addTranslation([-p0[0] + 0.5 * width, 0]);
          mod = true;
        }

        if (d < 0.25 * width) {
          pr.addZoom((0.25 * width) / d, [width / 2, height / 2]);
          mod = true;
        }

        if (mod) config.update();
      }

      const dzh = new DragZoomHover(
        (dragDir) => {
          pr.addTranslation(dragDir);
          config.update();
        },
        (zoomFactor, center) => {
          let p0 = pr.project(new Complex(0));
          let p1 = pr.project(new Complex(1));
          let d = Math.abs(p0[0] - p1[0]);
          if (zoomFactor <= (0.25 * config.width) / d)
            zoomFactor = (0.25 * config.width) / d;
          pr.addZoom(zoomFactor, center);

          config.update();
        },
        () => {}
      );
      dzh.registerListeners(config.containerElement);

      let options = config.addLayer("Options", layers.Options());
      let Q = 30;
      options.add("number", {
        label: "Circles up to denominator",
        onChange(q) {
          Q = q;
          config.update();
        },
        default: Q,
      });

      config.addLayer(
        "draw",
        layers.Canvas({
          update(config, ctx) {
            fixTrZoom();
            let r = new render.Canvas(ctx);

            ctx.clearRect(0, 0, config.width, config.height);

            ctx.lineWidth = 1.25;
            drawCarthesian2DAxis(r, pr, {
              scale: 1,
            });

            let fs = 10;
            r.fontSize = fs;
            let textUpTo = bestQ(pr.scale, fs);

            let fractions = FareyFractions(Q);

            // Find all fracions on screen
            let spr = [];

            r.fillStyle = "#FF333322";
            for (let [a, b] of fractions) {
              let xPosition = a / b;
              let radius = 0.5 / b / b;

              r.beginPath();
              r.arc(
                ...pr.project([xPosition, radius]),
                radius * pr.scale,
                0,
                2 * Math.PI - 0.01,
                true
              );
              r.closePath();
              r.stroke();
              r.fill();

              if (b <= textUpTo) {
                spr.push({
                  sprite:
                    b === 1
                      ? TextSprite(r, "" + a)
                      : FracSprite(
                          TextSprite(r, "" + a),
                          TextSprite(r, "" + b)
                        ),
                  at: a / b,
                });
              }
            }

            r.fillStyle = "#000000";
            // annotate Fractions
            annotateCarthesian2DAxis(r, "x", pr, spr);
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

function gcd(a: number, b: number) {
  a = Math.abs(a);
  b = Math.abs(b);
  if (b > a) {
    let temp = a;
    a = b;
    b = temp;
  }
  while (true) {
    if (b == 0) return a;
    a %= b;
    if (a == 0) return b;
    b %= a;
  }
}

/**
 * The value $v$ has to be between 0 and 1;
 *
 * Chooses $\frac{a^+}{b^+} = \frac{a + e_1 c}{b + e_1 d} <= v$ with $b + e_1 d <= Q$ in the first,
 * and $\frac{c^+}{d^+} = \frac{e_2 a^+ + c}{ e_2 b^+ + d} >= v$ with $e_2 b + d <= Q$.
 * The final fractions will be consecutive elements in the Farey sequence.
 */
function bestFracsFor(Q: number, v: number) {
  // Ensure v in [0,1)
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
}

function* FareyFractions2(
  Q: number,
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
}

function FareyFractions(Q: number, start?: [number, number, number, number]) {
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
    startAt(start: [number, number, number, number]) {
      return this[Symbol.iterator](start);
    },
  };
}

/**
 *
 * @param start Two consecutive elements in the sequence.
 * @param Q The maximum denominator
 * @param max The maximum fraction value.
 */
function fareyIter(
  ctx: render.MeasureText,
  start: [number, number, number, number],
  Q: number,
  max: number
) {
  let sprites: { sprite: BBSprite; at: number }[] = [];
  let [a, b, c, d] = start;
  while (c < max * d) {
    let k = Math.floor((Q + b) / d);
    [a, b, c, d] = [c, d, k * c - a, k * d - b];
    sprites.push({
      sprite: FracSprite(TextSprite(ctx, "" + a), TextSprite(ctx, "" + b)),
      at: a / b,
    });
  }
  return sprites;
}