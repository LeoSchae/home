import { ComplexScTr } from "../canvas/axis";
import * as render from "../renderer/old";
import { FracSprite, TextSprite } from "../canvas/sprites";
import { DragZoomHover } from "../modules/Interact";
import { Complex } from "../modules/math";
import * as layers from "./layers";
import * as asyncLib from "@lib/modules/Async";
import { manualSizing } from "./layers/Options";
import { Renderer, CanvasBackend } from "@lib/renderer/";
import { ExportButton } from "./layers/tmpExport";
import { config } from "process";

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

const fordCirclesInUnitSphere = asyncLib.wrap.async(function* (
  r: Renderer<"path" | "primitive" | "text">,
  Q: number,
  options: { projection: { origin: [number, number]; scale: number } }
) {
  let measure = new render.Canvas(
    document
      .createElement("canvas")
      .getContext("2d") as CanvasRenderingContext2D
  );
  let { projection } = options;
  let { origin, scale } = projection;

  r.style({ fill: "#AAAAAA", stroke: [0, 0, 0] });
  r.primitive()
    .circle(...origin, 2 * scale)
    .draw(true, true);
  //domainCircle(r, [0, 0.5], 0.5, pr);
  //r.stroke();

  let fr = FareyFractions(Q);

  let fs = 12;
  r.style({ fontSize: fs });

  let textUpTo = Q; //bestQ(pr.scale, fs) + 5;
  let annotations: [number, number, number][][] = Array(textUpTo)
    .fill(null)
    .map(() => []);

  r.style({ fill: [255, 255, 255], stroke: [0, 0, 0] });
  for (let [a, b] of fr) {
    yield;

    let segments = 10;
    if (a == 0) continue;
    if (b === 1) segments = 40;
    let xPosition = a / b;
    let radius = 0.5 / b / b;
    let path = r.path();
    let midP = domainCircle(
      path,
      [xPosition, radius],
      radius,
      projection,
      segments
    );
    path.draw(true, true);
    if (b <= textUpTo) annotations[b - 1].push([a, midP[0], midP[1]]);
  }

  r.style({ fill: "#555555" });
  for (let q0 = 0; q0 < annotations.length; q0++) {
    let q = q0 + 1;

    r.style({ fontSize: q == 1 ? scale / 2 : scale / q / q });
    measure.fontSize = q == 1 ? scale / 2 : scale / q / q;
    let qSprite;
    for (let [p, m0, m1] of annotations[q0]) {
      if (q == 1) {
        TextSprite(measure, "" + p).draw(r, m0, m1);
        continue;
      }
      qSprite ??= TextSprite(measure, "" + q);
      FracSprite(TextSprite(measure, "" + p), qSprite).draw(r, m0, m1);
    }
  }
});

const fordCirclesInPlane = asyncLib.wrap.async(function* (
  r: Renderer<"path" | "primitive" | "text">,
  Q: number,
  options: {
    projection: { origin: [number, number]; scale: number };
  }
) {
  let width: number = undefined as any;
  let measure = new render.Canvas(
    document
      .createElement("canvas")
      .getContext("2d") as CanvasRenderingContext2D
  );

  r.clear("#AAAAAA");
  r.style({ fill: "#000000" });
  let { projection } = options;
  let { origin, scale } = projection;

  let fs = 12;
  r.style({ fontSize: fs });
  let textUpTo = Q; //bestQ(pr.scale, fs) + 5;
  let annotations: number[][] = Array(textUpTo)
    .fill(null)
    .map(() => []);

  r.style({ lineWidth: 1.25, fontSize: 10 });
  //drawCarthesian2DAxis(r as any, projection, { noY: true, labelX: "" });
  /*annotateCarthesian2DAxis(r as any, "x", projection, [
    { sprite: TextSprite(measure, "0"), at: 0 },
    { sprite: TextSprite(measure, "1"), at: 1 },
  ]);*/

  let fractions = FareyFractions(Q);

  function map(r: number, i: number) {
    return [r * scale + origin[0], -i * scale + origin[1]] as [number, number];
  }

  // Find all fracions on screen

  r.style({ fill: "#FFFFFF" });
  for (let [a, b] of fractions) {
    yield;

    let xPosition = a / b;
    let radius = 0.5 / b / b;

    r.primitive()
      .circle(...map(xPosition, radius), 2 * radius * scale)
      .draw(true, true);

    if (b < textUpTo) annotations[b - 1].push(a);
  }
  let d = 0;
  r.style({ fill: "#000000" });
  for (let q0 = 0; q0 < annotations.length; q0++) {
    let q = q0 + 1;

    r.style({ fontSize: (scale * 0.3) / q / q });
    measure.fontSize = (scale * 0.3) / q / q;
    let qSprite;
    for (let p of annotations[q0]) {
      yield;
      let x = map(p / q, 0)[0];
      if (x < -2 * fs || x > width + 2 * fs) continue;
      d++;
      qSprite ??= TextSprite(measure, "" + q);
      FracSprite(TextSprite(measure, "" + p), qSprite).draw(
        r,
        ...map(p / q, 0.5 / q / q)
      );
    }
  }
});

function domainCircle(
  r: render.Renderer2D | Renderer.Path,
  center: [number, number],
  radius: number,
  projection: { origin: [number, number]; scale: number },
  segments = 20
) {
  let { origin = [0, 0], scale = 1 } = projection || {};
  function map(r: number, i: number) {
    let abs = Math.exp(-2 * Math.PI * i);
    return [
      Math.cos(2 * Math.PI * r) * abs * scale + origin[0],
      -Math.sin(2 * Math.PI * r) * abs * scale + origin[1],
    ] as [number, number];
  }

  let stepSize = (2 * Math.PI) / segments;

  let len = 0;
  let middleP = [0, 0];

  if ("begin" in r) r.begin();
  let oldP = map(center[0] + radius, center[1]);
  r.move(...oldP);
  for (let s = 1; s < segments + 1; s++) {
    let newP = map(
      center[0] + Math.cos(stepSize * s) * radius,
      center[1] + Math.sin(stepSize * s) * radius
    );
    let midP = map(
      center[0] + Math.cos(stepSize * (s - 0.5)) * radius,
      center[1] + Math.sin(stepSize * (s - 0.5)) * radius
    );
    let l = Math.sqrt(
      (newP[0] - oldP[0]) * (newP[0] - oldP[0]) +
        (newP[1] - oldP[1]) * (newP[1] - oldP[1])
    );
    len += l;
    middleP[0] += l * midP[0];
    middleP[1] += l * midP[1];
    r.quadratic(
      2 * midP[0] - 0.5 * (oldP[0] + newP[0]),
      2 * midP[1] - 0.5 * (oldP[1] + newP[1]),
      ...newP
    );
    oldP = newP;
  }
  r.close();
  return [middleP[0] / len, middleP[1] / len];
}

window.customElements.define(
  "ford-circles",
  layers.LayeredComponent({
    connected(config) {
      let asyncManager = new asyncLib.AsyncManager<"draw">();

      const pr = new ComplexScTr([config.width / 2, config.height / 2], 100);

      const dzh = new DragZoomHover(
        (dragDir) => {
          pr.addTranslation(dragDir);
          config.update();
        },
        (zoomFactor, center) => {
          let p0 = pr.project(new Complex(0));
          let p1 = pr.project(new Complex(1));
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
      let Q = 30;
      let mode: "Halfplane" | "Circle" = "Halfplane";
      options.add("number", {
        label: "Circles up to denominator",
        onChange(q) {
          Q = q > 1 ? q : 1;
          config.update();
        },
        default: Q,
      });
      options.add("radio", {
        label: "Show in:",
        values: [
          { name: "Halfplane", label: "Upper halfplane" },
          { name: "Cirlce", label: "Unit circle" },
        ],
        default: mode,
        onChange(name) {
          mode = name as any;
          config.update();
        },
      });

      options.add(manualSizing, config);
      options.add(
        ExportButton({
          setup() {
            return {
              fileName: "FordCircles",
              width: config.width,
              height: config.height,
            };
          },
          render(r) {
            if (mode == "Halfplane")
              return fordCirclesInPlane(r, Q, { projection: pr });
            else return fordCirclesInUnitSphere(r, Q, { projection: pr });
          },
        })
      );

      config.addLayer(
        "draw",
        layers.Canvas({
          update(config, ctx) {
            let r = Renderer.from(new CanvasBackend(ctx));

            ctx.clearRect(0, 0, config.width, config.height);

            asyncManager.abortAll("draw");

            if (mode === "Halfplane")
              fordCirclesInPlane(
                r,
                Q,
                { projection: pr },
                asyncManager.getNew("draw", 100)
              ).catch((e) => {
                if (e !== "aborted") console.log(e);
              });
            else
              fordCirclesInUnitSphere(
                r,
                Q,
                { projection: pr },
                asyncManager.getNew("draw", 100)
              ).catch((e) => {
                if (e !== "aborted") console.log(e);
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
