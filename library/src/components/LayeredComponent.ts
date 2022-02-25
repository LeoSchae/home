import { connect } from "http2";
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
  containerElement: HTMLDivElement;
  update(layer?: string | Layer<any>): unknown;
  addStyles(css: string): unknown;
  addLayer<T extends Node>(name: string, layer: T | Layer<T>): unknown;
  addOption(option: { label: Node; input: Node }): unknown;
  attachToShaddow(node: Node): unknown;
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
    connected(config: LayeredConfig): HTMLCanvasElement {
      let canvas = dom.Element("canvas", { class: "canvas-layer" });
      return canvas;
    },
  };
  return layer;
}

function Options() {
  let layer = dom.Element(
    "div",
    {
      style: `display:none;position:absolute;top:0;left:0;width:100%;height:100%;z-index:99;background-color: #fffb;padding:1em;`,
    },
    { __html: "<h1>Options</h1>" }
  );
  let list = dom.Element("ul");
  let button = dom.Element(
    "button",
    {
      "aria-label": "Options Toggle",
      class: "option-button",
      title: "Show all options",
    },
    {
      __html: `<svg xmlns="http://www.w3.org/2000/svg" class="option-icon" x="0px" y="0px"width="24" height="24"viewBox="0 0 24 24"style=" fill:currentColor;"><path d="M19.9,13.3C20,12.8,20,12.4,20,12s0-0.8-0.1-1.3L21.8,9l-2.3-4l-2.4,0.8c-0.7-0.5-1.4-1-2.2-1.3L14.3,2H9.7L9.2,4.5	C8.3,4.8,7.6,5.3,6.9,5.8L4.5,5L2.2,9l1.9,1.7C4,11.2,4,11.6,4,12c0,0.4,0,0.8,0.1,1.3L2.2,15l2.3,4l2.4-0.8l0,0	c0.7,0.5,1.4,1,2.2,1.3L9.7,22h4.7l0.5-2.5c0.8-0.3,1.6-0.7,2.2-1.3l0,0l2.4,0.8l2.3-4L19.9,13.3L19.9,13.3z M12,16	c-2.2,0-4-1.8-4-4c0-2.2,1.8-4,4-4c2.2,0,4,1.8,4,4C16,14.2,14.2,16,12,16z"></path></svg>`,
    }
  );
  button.onclick = () => {
    layer.style.display = layer.style.display == "none" ? "block" : "none";
  };
  layer.append(list);

  return {
    nodes: [layer, button],
    addOption(option: { label: Node; input: Node }) {
      const li = document.createElement("li");
      li.append(option.label, ": ", option.input);
      list.appendChild(li);
    },
  };
}

abstract class LayeredElement extends HTMLElement {
  /** Container for the canvases */
  private shadow: ShadowRoot = this.attachShadow({
    mode: "open",
  });
  private cleanup: (() => any)[] = [];
  abstract layerHandler: LayerHandler;

  connectedCallback() {
    const shadow = this.shadow;
    shadow.innerHTML = "";

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
    shadow.append(styles, container);

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
        layer.update = false;
      }
    };

    const options = Options();
    shadow.append(...options.nodes);

    const config: LayeredConfig = {
      get width() {
        return container.clientWidth;
      },
      get height() {
        return container.clientHeight;
      },
      containerElement: container,
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
          return;
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
      addOption(option: { label: Node; input: Node }) {
        options.addOption(option);
      },
      attachToShaddow(node: Node) {
        shadow.append(node);
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
    this.shadow.innerHTML = "";
  }
}

export function LayeredComponent(handler: LayerHandler) {
  return class extends LayeredElement {
    layerHandler = handler;
  };
}
