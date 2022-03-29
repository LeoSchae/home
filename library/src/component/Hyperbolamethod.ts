import TikZ from "@lib/renderer/TikZ";
import { ComplexScTr, drawCarthesian2DAxis } from "../canvas/axis";
import * as layers from "./layers";
import * as render from "@lib/renderer";
import * as dom from "@lib/DomElement";
import * as math from "@lib/modules/math";
import ScaledRender from "@lib/renderer/AutoScale";

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

function renderHyperbolamethod(
  r: render.Renderer2D,
  data: { N: number; W: number; J: number }
) {
  let { N, J, W } = data;
  let lNJ = Math.log(N / W) / J;
  let cuts = [...new math.Range(0, J + 1)].map((i) => W * Math.exp(i * lNJ));

  // Fill below
  r.fillStyle = "#0000FF33";
  r.strokeStyle = "#444444";
  r.lineWidth = 1.5;
  r.beginPath();
  r.moveTo(cuts[0], N - cuts[0]).lineTo(cuts[0], N - cuts[J]);
  for (var i = 1; i < cuts.length; i++)
    r.lineTo(cuts[i - 1], N - cuts[J - i]).lineTo(cuts[i], N - cuts[J - i]);
  r.lineTo(cuts[J], N - cuts[0]).closePath();
  r.stroke();
  r.fill();

  // Lines inside
  r.lineWidth = 1;
  r.beginPath();
  for (var i = 0; i < cuts.length; i++)
    r.moveTo(cuts[i], N - cuts[0])
      .lineTo(cuts[i], N - cuts[J - i])
      .moveTo(cuts[0], N - cuts[i])
      .lineTo(cuts[J - i], N - cuts[i]);
  r.stroke();

  // Boxes above;
  r.beginPath();
  r.fillStyle = "#FF000033";
  r.lineWidth = 1.5;
  r.moveTo(cuts[0], N - cuts[J]);
  for (var i = 1; i < cuts.length; i++)
    r.lineTo(cuts[i - 1], N - cuts[J - i + 1]).lineTo(
      cuts[i],
      N - cuts[J - i + 1]
    );
  for (var i = J; i > 0; i--)
    r.lineTo(cuts[i], N - cuts[J - i]).lineTo(cuts[i - 1], N - cuts[J - i]);
  r.lineTo(cuts[0], N - cuts[J]);
  r.fill();
  r.stroke();

  // Hyperbola
  r.beginPath();
  let steps = 100;
  r.lineWidth = 2;
  r.strokeStyle = "#000000";
  for (let i of [...new math.Range(0, steps + 1)]) {
    let v = Math.pow(N / W, i / steps);
    r.lineTo(W * v, N - N / v);
  }
  r.stroke();
}

function draw(r: render.Renderer2D) {
  r.fillStyle = "#FF000055";
  r.moveTo(50, 50);
  r.arc(50, 50, 20, 0, Math.PI, false);

  r.moveTo(150, 50);
  r.arc(150, 50, 20, 0, (3 * Math.PI) / 2, false);

  r.moveTo(250, 50);
  r.arc(250, 50, 20, -Math.PI, (3 * Math.PI) / 2, false);

  r.moveTo(350, 50);
  r.arc(350, 50, 20, -Math.PI, (3 * Math.PI) / 2, true);

  r.moveTo(50, 150);
  r.arc(50, 150, 20, Math.PI, 3 * Math.PI, true);
  r.fillAndStroke();
}

window.customElements.define(
  "hyperbola-app",
  layers.LayeredComponent({
    connected(config) {
      let tikz = new TikZ(config.width, config.height);
      draw(tikz);
      console.log(tikz.toTeX());
      config.addLayer(
        "draw",
        layers.Canvas({
          update(config, ctx) {
            ctx.clearRect(0, 0, config.width, config.height);
            let scale = new ScaledRender();
            renderHyperbolamethod(scale, {
              N: 500,
              W: 10,
              J: 8,
            });

            scale.applyScaled(
              new render.Canvas(ctx),
              config.width,
              config.height,
              { buffer: 10 }
            );
          },
        })
      );

      let options = config.addLayer("options", layers.Options());
      // Options
      let exportSVG = dom.Element("input", [], {
        type: "button",
        value: "SVG",
        title: "Export as SVG image",
      });
      exportSVG.onclick = () => {
        let r = new render.SVG(config.width, config.height);
        renderHyperbolamethod(r, {
          N: 500,
          W: 10,
          J: 20,
        });
        download(r.toXML(), "Subgroups.svg", "image/svg+xml");
      };

      let exportTikZ = dom.Element("input", [], {
        type: "button",
        value: "TikZ",
        title: "Export as TikZ image for use in LaTeX",
      });
      exportTikZ.onclick = () => {
        let r = new render.TikZ(config.width, config.height);
        let d = renderHyperbolamethod(r, {
          N: 500,
          W: 10,
          J: 20,
        });
        download(r.toTeX(), "Subgroups.tikz", "text/plain");
      };

      options.addOption({
        label: document.createTextNode("Export"),
        input: dom.Element("span", [exportSVG, exportTikZ]),
      });
    },
  })
);
