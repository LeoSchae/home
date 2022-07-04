import * as layers from "./layers";
import * as render from "@lib/renderer";
import * as math from "@lib/modules/math";
import ScaledRender from "@lib/renderer/AutoScale";
import { manualSizing } from "./layers/Options";
import { Backend, Complete, FullBackend, Renderer } from "@lib/renderer/new";
import { MeasuredRenderer } from "@lib/renderer/newScaled";
import { stringify } from "querystring";
import { SVGBackend } from "@lib/renderer/newSVG";
import { TikZBackend } from "@lib/renderer/newTikZ";
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

function renderHyperbolamethod3d(
  r: FullBackend,
  opts: {
    N: number;
    W: number;
    J: number;
    color?: {
      shadeTop?: string;
      shadeFront?: string;
      shadeSide?: string;
    };
  }
) {
  let { N, J, W } = opts;
  let {
    shadeTop = "#0000FF33",
    shadeFront = "#ffcc0033",
    shadeSide = "#444444",
  } = opts.color || {};

  let lNJ = Math.log(N / W) / J;
  let cuts = [...new math.Range(0, J + 1)].map((i) => W * Math.exp(i * lNJ));

  let zFac = 1 / 4;
  let proj = (x: number, y: number, z: number) =>
    [x - z * zFac, N - (y - 0.8 * z * zFac)] as [number, number];

  function drawBoxSpike(cuts: number[], [i, j, k]: [number, number, number]) {
    // z face
    let alphaHex = "ff";

    r.style({ fill: shadeFront + alphaHex });
    r.path()
      .move(...proj(cuts[i], cuts[j], cuts[k]))
      .line(...proj(cuts[i - 1], cuts[j], cuts[k]))
      .line(...proj(cuts[i - 1], cuts[j - 1], cuts[k]))
      .line(...proj(cuts[i], cuts[j - 1], cuts[k]))
      .close()
      .fill()
      .stroke();
    r.style({ fill: shadeTop + alphaHex });
    r.path()
      .move(...proj(cuts[i], cuts[j], cuts[k]))
      .line(...proj(cuts[i - 1], cuts[j], cuts[k]))
      .line(...proj(cuts[i - 1], cuts[j], cuts[k - 1]))
      .line(...proj(cuts[i], cuts[j], cuts[k - 1]))
      .close()
      .fill()
      .stroke();
    r.style({ fill: shadeSide + alphaHex });
    r.path()
      .move(...proj(cuts[i], cuts[j], cuts[k]))
      .line(...proj(cuts[i], cuts[j], cuts[k - 1]))
      .line(...proj(cuts[i], cuts[j - 1], cuts[k - 1]))
      .line(...proj(cuts[i], cuts[j - 1], cuts[k]))
      .close()
      .fill()
      .stroke();
  }

  r.style({ lineWidth: 1.5, stroke: "#000000" });
  let p = r.path();
  p.move(...proj(W, W, W)).line(...proj(N + (N - W) * 0.1, W, W));
  p.move(...proj(W, W, W)).line(...proj(W, N + (N - W) * 0.1, W));
  p.move(...proj(W, W, W)).line(...proj(W, W, N + (N - W) * 0.1));
  p.stroke();

  /*r.begin().move(...proj(cuts[0], W, W));
  for (let i = 1; i < cuts.length; i++)
    r.line(...proj(cuts[i], cuts[cuts.length - i], W));
  r.stroke();*/

  r.style({ lineWidth: 0.75 });
  for (let ix = 1; ix < cuts.length; ix++)
    for (let iy = 1; iy < cuts.length - ix + 1; iy++)
      drawBoxSpike(cuts, [ix, iy, cuts.length + 1 - ix - iy]);
}

function renderHyperbolamethod(
  r: FullBackend<"primitive">,
  opts: {
    N: number;
    W: number;
    J: number;
    color?: {
      fill?: string;
      error?: string;
      gridLine?: string;
      hypLine?: string;
    };
  }
) {
  let { N, J, W } = opts;
  let {
    fill = "#0000FF33",
    error: errorFill = "#ffcc0033",
    gridLine: gridFill = "#444444",
    hypLine: hypFill = "#000000",
  } = opts.color || {};

  let lNJ = Math.log(N / W) / J;
  let cuts = [...new math.Range(0, J + 1)].map((i) => W * Math.exp(i * lNJ));

  // fill below
  r.style({ fill, stroke: gridFill, lineWidth: 1.5 });

  let path = r.path();
  path.move(cuts[0], N - cuts[0]).line(cuts[0], N - cuts[J]);
  for (var i = 1; i < cuts.length; i++)
    path.line(cuts[i - 1], N - cuts[J - i]).line(cuts[i], N - cuts[J - i]);
  path.line(cuts[J], N - cuts[0]).close();
  //r.stroke();
  path.fill();

  // fill error;
  path = r.path();
  r.style({ lineWidth: 1.5, fill: errorFill });
  path.move(cuts[0], N - cuts[J]);
  for (var i = 1; i < cuts.length; i++)
    path
      .line(cuts[i - 1], N - cuts[J - i + 1])
      .line(cuts[i], N - cuts[J - i + 1]);
  for (var i = J; i > 0; i--)
    path.line(cuts[i], N - cuts[J - i]).line(cuts[i - 1], N - cuts[J - i]);
  path.line(cuts[0], N - cuts[J]);
  path.fill();

  /* Lines (every line only single stroked and with corners) */
  let p: [number, number];
  r.style({ lineWidth: 1 });
  // longest boxes (|_| shaped)
  path = r.path();
  p = [cuts[1], N - cuts[J]];
  path
    .move(W, N - W)
    .line(W, p[1])
    .line(p[0], p[1])
    .line(p[0], N - W);
  p = [cuts[J], N - cuts[1]];
  path
    .move(W, N - W)
    .line(p[0], N - W)
    .line(p[0], p[1])
    .line(W, p[1]);
  // other boxes (|_ shaped)
  let maxLine = J + 1,
    minLine = 2;
  for (var i = minLine; i <= maxLine - minLine; i++) {
    p = [cuts[i], N - cuts[maxLine - i]];
    path
      .move(W, p[1])
      .line(p[0], p[1])
      .line(p[0], N - W);
  }
  path.stroke();

  // Hyperbola
  path = r.path();
  let steps = 100;

  r.style({ lineWidth: 2, stroke: hypFill });
  path.move(W, N - W);
  for (let i of [...new math.Range(0, steps + 1)]) {
    let v = Math.pow(N / W, i / steps);
    path.line(W * v, N - N / v);
  }
  path.close();
  path.stroke();
}

function draw(r: render.Renderer2D) {
  r.set({ fill: "#FF000055" });
  r.move(50, 50);
  r.arc(50, 50, 20, 0, Math.PI, false);

  r.move(150, 50);
  r.arc(150, 50, 20, 0, (3 * Math.PI) / 2, false);

  r.move(250, 50);
  r.arc(250, 50, 20, -Math.PI, (3 * Math.PI) / 2, false);

  r.move(350, 50);
  r.arc(350, 50, 20, -Math.PI, (3 * Math.PI) / 2, true);

  r.move(50, 150);
  r.arc(50, 150, 20, Math.PI, 3 * Math.PI, true);
  r.fillAndStroke();
}

window.customElements.define(
  "hyperbola-app",
  layers.LayeredComponent({
    connected(config) {
      let state = {
        N: 100,
        W: 10,
        J: 10,
        dim: "3D",
        color: {
          shadeTop: "#bbbbbb",
          shadeFront: "#555555",
          shadeSide: "#111111",
          hypLine: "#000000",
          gridLine: "#000000",
          fill: "#333333",
          error: "#999999",
        },
      };

      config.addLayer(
        "draw",
        layers.Canvas({
          update(config, ctx) {
            ctx.clearRect(0, 0, config.width, config.height);
            let scale = new MeasuredRenderer();
            let r = Complete<undefined>(scale);
            if (state.dim == "2D") renderHyperbolamethod(r, state);
            else renderHyperbolamethod3d(r, state);

            scale.replay(Complete(new CanvasBackend(ctx)), {
              fit: { width: config.width, height: config.height },
            });
          },
        })
      );

      let options = config.addLayer("options", layers.Options());

      options.add("number", {
        label: "Cuts",
        onChange: (x) => {
          state.J = x;
          config.update();
        },
        default: state.J,
      });

      options.add("radio", {
        label: "Dimension",
        values: [
          { name: "2D", label: "2D" },
          { name: "3D", label: "3D" },
        ],
        default: state.dim,
        onChange: (value) => {
          state.dim = value as any;
          config.update();
        },
      });

      options.add("color", {
        label: "3D-top",
        onChange: (c) => {
          state.color.shadeTop = c;
          config.update();
        },
        default: state.color.shadeTop,
      });
      options.add("color", {
        label: "3D-front",
        onChange: (c) => {
          state.color.shadeFront = c;
          config.update();
        },
        default: state.color.shadeFront,
      });
      options.add("color", {
        label: "3D-side",
        onChange: (c) => {
          state.color.shadeSide = c;
          config.update();
        },
        default: state.color.shadeSide,
      });
      options.add("color", {
        label: "2D-lower",
        onChange: (c) => {
          state.color.fill = c;
          config.update();
        },
        default: state.color.fill,
      });
      options.add("color", {
        label: "2D-upper",
        onChange: (c) => {
          state.color.error = c;
          config.update();
        },
        default: state.color.error,
      });

      options.add(manualSizing, config);
      options.add(
        ExportButton({
          setup() {
            return {
              fileName: "Hyperbola",
              width: config.width,
              height: config.height,
            };
          },
          render(r) {
            let scale = new MeasuredRenderer();
            let renderer = Complete<undefined>(scale);
            if (state.dim == "2D") renderHyperbolamethod(renderer, state);
            else renderHyperbolamethod3d(renderer, state);

            scale.replay(r, {
              fit: { width: config.width, height: config.height },
            });
          },
        })
      );
    },
  })
);
