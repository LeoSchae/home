import * as dom from "@lib/DomElement";
import styles from "./index.css";

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

export { default as Canvas } from "./Canvas";
export { default as Options } from "./Options";

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

    const style = dom.Element("style", {}, [styles.css]);
    const container = dom.Element("div", {
      class: styles.class.container,
    });
    const resizeObs = new ResizeObserver(() => {
      this.layerHandler.resized?.(config);
      for (var layer of layers.values())
        layer.layer?.resized?.(config, layer.nodes);
    });
    resizeObs.observe(container);
    shadow.append(style, container);

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
        style.append(css);
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
