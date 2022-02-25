import { ComplexScTr } from "../canvas/axis";
import { CanvasLayer, LayeredComponent } from "./LayeredComponent";

window.customElements.define(
  "hyperbola-app",
  LayeredComponent({
    connected(config) {
      config.addLayer(
        "draw",
        CanvasLayer({
          update(config, ctx) {
            let width = config.width;
            let height = config.height;

            let proj = new ComplexScTr([width / 2, height / 2], 100);

            ctx.rect(...proj.project([-1, 1]), 200, 200);
            ctx.stroke();
          },
        })
      );
    },
  })
);
