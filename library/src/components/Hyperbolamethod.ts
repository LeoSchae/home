import { ComplexScTr } from "../canvas/axis";
import { PredictiveRenderer2D, Renderer2DCanvas } from "../canvas/context";
import {
  LayeredCanvasApp,
  LayeredCanvasOptions,
} from "../modules/layeredCanvas";

class Hyperbolamethod extends LayeredCanvasApp {
  initializeApp(options: LayeredCanvasOptions): void {
    options.addLayer("drawLayer", {
      draw: (canvas) => {
        let ctx: PredictiveRenderer2D = new Renderer2DCanvas(
          canvas.getContext("2d") as any
        );
        let width = ctx.width;
        let height = ctx.height;

        let proj = new ComplexScTr([width / 2, height / 2], 100);

        ctx.rect(...proj.project([-1, 1]), 200, 200);
        ctx.stroke();
      },
    });
  }

  uninitializeApp() {}
}

window.customElements.define("hyperbola-app", Hyperbolamethod);
