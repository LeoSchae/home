import * as dom from "@lib/DomElement";
import layerStyles from "./index.css";

export type LayerHandler = {
  /**
   * Setup for the LayeredElement
   */
  connected?: (config: LayeredConfig) => any;
  disconnected?: (config: LayeredConfig) => any;
  resized?: (config: LayeredConfig) => any;
};

/**
 * Config Object for a LayeredElement.
 */
export type LayeredConfig = {
  /** The current width in CSSPixels */
  readonly width: number;
  /** The current height in CSSPixels */
  readonly height: number;
  /** The element that contains all layers */
  readonly containerElement: HTMLDivElement;
  /** Redraw a single layer. Improved performance when using string. */
  update(layer?: string | LayerObject<any>): unknown;
  /** Add CSS to the stylesheet in the shaddow dom */
  addStyles(css: string): unknown;
  /** Add a layer to the element. */
  addLayer(name: string, layer: Node): unknown;
  addLayer<O>(name: string, layer: Layer<any, O>): LayerHandle<O>;
  /** Add an option to the options overlay */
  addOption(option: { label: Node; input: Node }): unknown;
  /** Attach a node directly to the shaddow dom */
  attachToShaddow(node: Node): unknown;
};

/**
 * O: The fields that will be attached to the LayerHandle
 * N: Type of nodes to attach
 */
export type LayerObject<
  N extends Node | Node[] | undefined = undefined,
  O = {}
> = {
  connected: (
    config: LayeredConfig
  ) => O & (N extends undefined ? {} : { nodes: N });
  disconnected?: (config: LayeredConfig) => unknown;

  update?: (config: LayeredConfig, nodes: N) => unknown;
  resized?: (config: LayeredConfig, nodes: N) => unknown;
};
export type Layer<N extends Node | Node[] | undefined = undefined, O = {}> =
  | ((config: LayeredConfig) => O & (N extends undefined ? {} : { nodes: N }))
  | LayerObject<N, O>;

/** The handle returned by addLayer */
export type LayerHandle<O> = {
  [Name in Exclude<keyof O, "nodes" | "update">]: O[Name];
} & { update(): unknown };

export function Options2(): Layer<
  undefined,
  { addOption(option: { label: Node; input: Node }): unknown }
> {
  return (config: LayeredConfig) => {
    let optionsFrame = dom.Element(
      "div",
      {
        style: `display:none;position:absolute;top:0;left:0;width:100%;height:100%;z-index:99;background-color: #fffb;padding:1em;`,
      },
      { __html: "<h1>Options</h1>" }
    );
    let optionsButton = dom.Element(
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
    let list = dom.Element("ul");

    optionsButton.onclick = () => {
      optionsFrame.style.display =
        optionsFrame.style.display == "none" ? "block" : "none";
    };
    optionsFrame.append(list);

    config.attachToShaddow(optionsFrame);
    config.attachToShaddow(optionsButton);
    return {
      addOption(option: { label: Node; input: Node }) {
        const li = document.createElement("li");
        li.append(option.label, ": ", option.input);
        list.appendChild(li);
      },
    };
  };
}

export class OptionsLayer
  implements
    LayerObject<
      undefined,
      { addOption(option: { label: Node; input: Node }): unknown }
    >
{
  options: { zIndex: number };
  constructor(options: { zIndex?: number }) {
    this.options = Object.assign({}, { zIndex: 5 }, options);
  }
  connected(config: LayeredConfig) {
    let optionsFrame = dom.Element(
      "div",
      {
        style: `display:none;position:absolute;top:0;left:0;width:100%;height:100%;z-index:99;background-color: #fffb;padding:1em;`,
      },
      { __html: "<h1>Options</h1>" }
    );
    let optionsButton = dom.Element(
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
    let list = dom.Element("ul");

    optionsButton.onclick = () => {
      optionsFrame.style.display =
        optionsFrame.style.display == "none" ? "block" : "none";
    };
    optionsFrame.append(list);

    config.attachToShaddow(optionsFrame);
    config.attachToShaddow(optionsButton);
    return {
      addOption(option: { label: Node; input: Node }) {
        const li = document.createElement("li");
        li.append(option.label, ": ", option.input);
        list.appendChild(li);
      },
    };
  }
}

export function CanvasLayer(options: {
  update: (config: LayeredConfig, ctx: CanvasRenderingContext2D) => unknown;
}): LayerObject<HTMLCanvasElement> {
  let layer: LayerObject<HTMLCanvasElement> = {
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
        layer.layer?.resized?.(config, layer.nodes);
    });
    resizeObs.observe(container);
    shadow.append(styles, container);

    const layers: Map<
      string,
      { nodes?: Node | Node[]; layer?: LayerObject<any, any>; update: boolean }
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
          layer.layer?.update?.(config, layer.nodes as any);
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
      addLayer: function <O>(name: string, layer: Node | Layer<any, O>): any {
        // Manually check that return type is correct
        if (layer instanceof Node) {
          container.appendChild(layer);
          return;
        }

        let layerObject: undefined | LayerObject<any, any>,
          instance: O & { nodes?: Node | Node[] };
        if (typeof layer === "function") {
          instance = layer(config);
          layerObject = undefined;
        } else {
          instance = layer.connected(config);
          layerObject = layer;
        }

        let nodes = instance.nodes;
        if (nodes) {
          if (Array.isArray(nodes)) container.append(...nodes);
          else container.append(nodes);
        }

        layers.set(name, { nodes, layer: layerObject, update: false });
        config.update(name);

        let handle: LayerHandle<O> = {
          ...instance,
          nodes: undefined,
          update: () => {
            this.update(name);
          },
        };

        return handle;
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
