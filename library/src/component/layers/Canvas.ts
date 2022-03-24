import type { LayeredConfig, LayerObject } from "./";
import * as dom from "@lib/DomElement";

export default function (options: {
  update: (config: LayeredConfig, ctx: CanvasRenderingContext2D) => unknown;
}): LayerObject<HTMLCanvasElement> {
  return {
    update(config: LayeredConfig, canvas: HTMLCanvasElement) {
      let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      const dpr = window.devicePixelRatio;
      if (
        Math.floor(config.width * dpr) !== canvas.width ||
        Math.floor(config.height * dpr) !== canvas.height
      ) {
        canvas.width = Math.floor(config.width * dpr);
        canvas.height = Math.floor(config.height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      options.update(config, ctx);
    },
    resized(config: LayeredConfig) {
      config.update(this);
    },
    connected(config: LayeredConfig) {
      let canvas = dom.Element("canvas", { class: "canvas-layer" });
      return { nodes: canvas };
    },
  };
}
