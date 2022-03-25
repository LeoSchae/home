import TikZ from "@lib/renderer/TikZ";
import { ComplexScTr, drawCarthesian2DAxis } from "../canvas/axis";
import * as layers from "./layers";
import * as render from "@lib/renderer";
import * as dom from "@lib/DomElement";

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
            draw(new render.Canvas(ctx));
          },
        })
      );

      let options = config.addLayer("options", layers.Options());
      // Options
      let exportSVG = dom.Element("input", {
        type: "button",
        value: "SVG",
        title: "Export as SVG image",
      });
      exportSVG.onclick = () => {
        let r = new render.SVG(config.width, config.height);
        draw(r);
        download(r.toXML(), "Subgroups.svg", "image/svg+xml");
      };

      let exportTikZ = dom.Element("input", {
        type: "button",
        value: "TikZ",
        title: "Export as TikZ image for use in LaTeX",
      });
      exportTikZ.onclick = () => {
        let r = new render.TikZ(config.width, config.height);
        let d = draw(r);
        download(r.toTeX(), "Subgroups.tikz", "text/plain");
      };

      options.addOption({
        label: document.createTextNode("Export"),
        input: dom.Element("span", {}, [exportSVG, exportTikZ]),
      });
    },
  })
);
