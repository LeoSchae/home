import * as dom from "../DomElement";
import layerStyles from "./LayeredComponent.css";

export type LayerHandler = {
  connected?: (config: LayeredConfig) => any;
  disconnected?: (config: LayeredConfig) => any;
  resized?: (config: LayeredConfig) => any;
};

export type LayeredConfig = {
  width: number;
  height: number;
  update(layer?: string | Layer<any>): unknown;
  addStyles(css: string): unknown;
  addLayer<T extends Node>(name: string, layer: T | Layer<T>): unknown;
};

export type Layer<N extends Node> = {
  connected: (component: LayeredConfig) => N;
  disconnected?: (component: LayeredConfig) => void;

  update?: (config: LayeredConfig, node: N) => unknown;
  resized?: (config: LayeredConfig, node: N) => any;
};

export function CanvasLayer(options: {
  update: (config: LayeredConfig, ctx: CanvasRenderingContext2D) => unknown;
}): Layer<HTMLCanvasElement> {
  let layer = {
    update(config: LayeredConfig, canvas: HTMLCanvasElement) {
      let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      const dpr = window.devicePixelRatio;
      if (
        Math.floor(config.width * dpr) != canvas.width ||
        Math.floor(config.height * dpr) != canvas.height
      ) {
        canvas.width = Math.floor(config.width * dpr);
        canvas.height = Math.floor(config.height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      options.update(config, ctx);
    },
    connected(config: LayeredConfig): HTMLCanvasElement {
      let canvas = dom.Element("canvas", { class: "canvas-layer" });
      return canvas;
    },
  };
  return layer;
}

abstract class LayeredElement extends HTMLElement {
  /** Container for the canvases */
  private shaddow: ShadowRoot = this.attachShadow({ mode: "open" });
  private cleanup: (() => any)[] = [];
  abstract layerHandler: LayerHandler;

  connectedCallback() {
    const shaddow = this.shaddow;
    shaddow.innerHTML = "";

    const styles = dom.Element("style", {}, [layerStyles]);
    const container = dom.Element("div", {
      class: "container",
    });
    const resizeObs = new ResizeObserver(() => {
      this.layerHandler.resized?.(config);
      for (var layer of layers.values())
        layer.layer?.resized?.(config, layer.node);
    });
    resizeObs.observe(container);
    shaddow.append(styles, container);

    const layers: Map<
      string,
      { node?: Node; layer?: Layer<any>; update: boolean }
    > = new Map();

    /** When changing from 0 an animation frame
     * for updateLayers needs to be scheduled
     * 0 no updates, 1 update some layers, 2 update all
     */
    let updateState: 0 | 1 | 2 = 0;
    const updateLayers = () => {
      let all = updateState === 2;
      updateState = 0;
      for (var layer of layers.values()) {
        if (all || layer.update)
          layer.layer?.update?.(config, layer.node as any);
      }
    };

    const config: LayeredConfig = {
      get width() {
        return container.clientWidth;
      },
      get height() {
        return container.clientHeight;
      },
      update: function (layer?: string | Layer<any>): unknown {
        if (updateState === 2) return;
        if (updateState === 0) requestAnimationFrame(updateLayers);
        if (layer === undefined) {
          updateState = 2;
          return;
        }
        if (typeof layer === "string") {
          updateState = 1;
          let l = layers.get(layer);
          if (l) l.update = true;
        }
        for (var l of layers.values()) {
          if (layer === l.layer) l.update = true;
        }
      },
      addStyles: function (css: string): void {
        styles.append(css);
      },
      addLayer: function <T extends Node>(
        name: string,
        layer: T | Layer<T>
      ): void {
        if (layer instanceof Node) {
          container.appendChild(layer);
          return;
        }
        let node = layer.connected(config);
        if (node) container.append(node);
        layers.set(name, { node, layer, update: false });
        config.update(name);
      },
    };

    this.layerHandler.connected?.(config);

    this.cleanup.push(() => {
      resizeObs.unobserve(container);
      for (var layer of layers.values()) {
        layer.layer?.disconnected?.(config);
      }
      this.layerHandler.disconnected?.(config);
    });
  }

  disconnectedCallback() {
    for (var clean of this.cleanup) clean();
    this.cleanup = [];
    this.shaddow.innerHTML = "";
  }
}

export function LayeredComponent(handler: LayerHandler) {
  return class extends LayeredElement {
    layerHandler = handler;
  };
}
