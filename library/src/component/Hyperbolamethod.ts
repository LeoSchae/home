import TikZ from "@lib/renderer/TikZ";
import { ComplexScTr, drawCarthesian2DAxis } from "../canvas/axis";
import * as layers from "./layers";
import * as render from "@lib/renderer";

function draw(r: render.Renderer2D) {
  r.fillStyle = "#FF000055";
  r.rect(10, 10, 80, 80);
  r.arc(10, 10, 80, 0, Math.PI / 2, false);
  //r.closePath();
  r.fillAndStroke();
}

window.customElements.define(
  "hyperbola-app",
  layers.LayeredComponent({
    connected(config) {
      let tikz = new TikZ(100, 200);
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
    },
  })
);
