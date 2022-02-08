import { DNDEventListener, registerPointerEvents } from "./events/pointer";
import styles from "./layeredCanvas.css";

export interface LayerHandler {
  draw(canvas: HTMLCanvasElement): any;
  [key: string]: unknown;
}

export type Option = {
  input: HTMLElement;
  label: HTMLElement;
};

export interface LayeredCanvasOptions {
  readonly canvasContainer: HTMLDivElement;
  addOption(option: Option): void;
  addLayer(name: string, handler: LayerHandler): void;
  map: {
    readonly pixelFactor: number;
    readonly width: number;
    readonly height: number;
    toCanvas(length: number): number;
    toCanvas(xOffset: number, yOffset: number): [number, number];
    toContainer(length: number): number;
    toContainer(xOffset: number, yOffset: number): [number, number];
  };
}

export abstract class LayeredCanvasApp extends HTMLElement {
  /** Container for the canvases */
  private container: HTMLDivElement | undefined;
  /** Container for the options */
  private optionsContainer: HTMLElement | undefined;

  /* Fields for properties of the canvas dimensions */
  private width: number = -1;
  private height: number = -1;
  private pixelFactor: number = 1;

  /* Functions used internally for cleanup on unmount */
  private _cleanup: (() => any)[] = [];

  constructor() {
    super();
  }

  /**
   * Check if the canvas is sized correctly.
   * Adjusts all layers on the next draw if required.
   */
  private _checkSize = function (this: LayeredCanvasApp) {
    const dpr = window.devicePixelRatio;
    const { clientWidth = 0, clientHeight = 0 } = this.container || {};
    if (
      this.pixelFactor == dpr &&
      ((dpr * clientWidth == this.width && dpr * clientHeight == this.height) ||
        this.layers === undefined)
    )
      return;
    this.resizeRequested = true;
    this.requestRepaintAll();
  }.bind(this);

  /** Internal function used to check if dimensions are still correct. */
  private _fixSize() {
    const dpr = window.devicePixelRatio;
    this.pixelFactor = dpr;
    const { clientWidth = 0, clientHeight = 0 } = this.container || {};
    const layers = this.layers;

    const nw = clientWidth * dpr,
      nh = clientHeight * dpr;

    if (false)
      console.debug("Adjusting canvas size to (" + nw + "x" + nh + ")");

    for (let i = 0; i < layers.length; i++) {
      let c = layers[i].canvas;
      c.width = nw;
      c.height = nh;
    }
    this.width = nw;
    this.height = nh;
  }

  private options: LayeredCanvasOptions | undefined;

  private layers: {
    name: string;
    canvas: HTMLCanvasElement;
    repaint: boolean;
    handler: LayerHandler;
  }[] = [];

  /** 0: no repaint, 1: partial repaint, 2: full repaint */
  private repaintRequested: 0 | 1 | 2 = 0;
  /** should canvas dimensions update prior to next render */
  private resizeRequested: boolean = true;
  private _repaint = function (this: LayeredCanvasApp) {
    this._checkSize();
    if (this.resizeRequested) this._fixSize();
    this.resizeRequested = false;
    const all = this.repaintRequested == 2;
    this.repaintRequested = 0;

    const layers = this.layers || [];
    for (let i = 0; i < layers.length; i++) {
      let l = layers[i];
      if (all || l.repaint) l.handler.draw(l.canvas);
      l.repaint = false;
    }
  }.bind(this);

  /**
   * Initialize the canvas on the container. The containers will always have the same
   * dimenstions as the contained canvas layers.
   * @param canvasContainer The container containing the canvas layers.
   */
  abstract initializeApp(options: LayeredCanvasOptions): void;

  /**
   * Uninitialize the app. Eventlisteners should be removed here.
   * @param canvasContainer The container containing the canvas layers.
   */
  abstract uninitializeApp(options: LayeredCanvasOptions): void;

  /**
   * Repaunt a single layer.
   * @param layer The layer to redraw
   */
  requestRepaintLayer(layer: number | string) {
    if (this.repaintRequested == 2) return;
    if (this.repaintRequested == 0) window.requestAnimationFrame(this._repaint);
    this.repaintRequested = 1;
    if (typeof layer === "number") this.layers[layer].repaint = true;
    else {
      for (var l of this.layers) if (l.name === layer) l.repaint = true;
    }
  }
  /**
   * Repaint all layers.
   */
  requestRepaintAll() {
    if (this.repaintRequested == 0) window.requestAnimationFrame(this._repaint);
    this.repaintRequested = 2;
  }

  connectedCallback() {
    if (false) console.debug("Connecting LayeredCanvas");

    const root = this;
    const firstZ = 0;

    // Append inline styles to shadow
    const shadow = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.innerHTML = styles;
    shadow.appendChild(style);

    // Div containing the canvases
    const container = document.createElement("div");
    this.container = container;
    container.className = "canvas-container";
    shadow.appendChild(container);

    // Div containing the options
    const optionsContainer = document.createElement("div");
    this.optionsContainer = optionsContainer;
    optionsContainer.className = "options-container";
    optionsContainer.style.display = "none";
    const toggleOptions = () => {
      if (optionsContainer.style.display == "none")
        optionsContainer.style.display = "";
      else optionsContainer.style.display = "none";
    };
    const optionsList = document.createElement("li");
    optionsContainer.innerHTML = "<h2>Options</h2>";
    optionsContainer.appendChild(optionsList);
    shadow.appendChild(optionsContainer);

    // Options button
    const optionButton = document.createElement("button");
    optionButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="option-icon" x="0px" y="0px"width="24" height="24"viewBox="0 0 24 24"style=" fill:currentColor;"><path d="M19.9,13.3C20,12.8,20,12.4,20,12s0-0.8-0.1-1.3L21.8,9l-2.3-4l-2.4,0.8c-0.7-0.5-1.4-1-2.2-1.3L14.3,2H9.7L9.2,4.5	C8.3,4.8,7.6,5.3,6.9,5.8L4.5,5L2.2,9l1.9,1.7C4,11.2,4,11.6,4,12c0,0.4,0,0.8,0.1,1.3L2.2,15l2.3,4l2.4-0.8l0,0	c0.7,0.5,1.4,1,2.2,1.3L9.7,22h4.7l0.5-2.5c0.8-0.3,1.6-0.7,2.2-1.3l0,0l2.4,0.8l2.3-4L19.9,13.3L19.9,13.3z M12,16	c-2.2,0-4-1.8-4-4c0-2.2,1.8-4,4-4c2.2,0,4,1.8,4,4C16,14.2,14.2,16,12,16z"></path></svg>`;
    optionButton.className = "option-button";
    optionButton.ariaLabel = "Options Toggle";
    shadow.appendChild(optionButton);
    optionButton.onclick = toggleOptions;

    const layers: typeof this.layers = [];
    this.layers = layers;

    this.options = {
      canvasContainer: container,
      addOption(opt: Option) {
        const li = document.createElement("li");
        li.append(opt.label, opt.input);
        optionsList.appendChild(li);
      },
      addLayer(name: string, handler: LayerHandler) {
        const canvas = document.createElement("canvas");
        canvas.className = "canvas-layer";
        container.appendChild(canvas);
        layers.push({
          name: name,
          canvas: canvas,
          repaint: false,
          handler: handler,
        });
      },
      map: {
        get pixelFactor() {
          return root.pixelFactor;
        },
        get width() {
          return root.width;
        },
        get height() {
          return root.height;
        },
        toCanvas(x: number, y?: number): any {
          let pf = root.pixelFactor;
          if (y === undefined) return x * pf;
          return [x * pf, y * pf];
        },
        toContainer(x: number, y?: number): any {
          let pf = root.pixelFactor;
          if (y === undefined) return x / pf;
          return [x / pf, y / pf];
        },
      },
    };
    this.initializeApp(this.options);

    /** Register resize oberver and interval for devicePixelRatio changes */
    const observer = new ResizeObserver((test) => {
      this._checkSize();
    });
    observer.observe(container);
    setInterval(this._checkSize, 2000);
    this.requestRepaintAll();

    this._cleanup.push(() => {
      observer.disconnect();
      shadow.innerHTML = "";
    });
  }

  disconnectedCallback() {
    console.debug("Disconnecting LayeredCanvas");

    this.uninitializeApp(this.options as LayeredCanvasOptions);
    for (let c of this._cleanup) c();
    this._cleanup = [];
    this.options = undefined;
  }
}

export class ColorOption {
  input: HTMLInputElement;
  label: HTMLLabelElement;
  constructor(label: string, onChange: (value: string) => any, def?: string) {
    let lab = document.createElement("label");
    lab.textContent = label;
    let inp = document.createElement("input");
    inp.setAttribute("type", "color");
    if (def) inp.defaultValue = def;
    inp.addEventListener("change", () => onChange(inp.value));
    this.label = lab;
    this.input = inp;
  }
}

export class NumberOption {
  input: HTMLInputElement;
  label: HTMLLabelElement;
  constructor(label: string, onChange: (value: string) => any, def?: string) {
    let lab = document.createElement("label");
    lab.textContent = label;
    let inp = document.createElement("input");
    inp.setAttribute("type", "number");
    if (def) inp.defaultValue = def;
    inp.addEventListener("change", () => onChange(inp.value));
    this.label = lab;
    this.input = inp;
  }
}

export class RadioOption {
  input: HTMLSpanElement;
  label: HTMLSpanElement;
  constructor(
    label: string,
    choices: string[],
    onChange: (value: string) => any,
    def?: string
  ) {
    let lab = document.createElement("span");
    lab.textContent = label;

    let inp = document.createElement("span");

    for (let c of choices) {
      let s = document.createElement("span");
      s.style.display = "inline-block";
      s.style.width = "20px";
      inp.appendChild(s);
      let l = document.createElement("label");
      l.textContent = c;
      let o = document.createElement("input");

      o.setAttribute("type", "radio");
      o.setAttribute("value", c);
      o.setAttribute("name", label);
      if (def == c) o.checked = true;
      o.addEventListener("change", () => onChange(o.value));
      l.appendChild(o);
      inp.appendChild(l);
    }
    this.label = lab;
    this.input = inp;
  }
}

export class ButtonOption {
  input: HTMLSpanElement;
  label: HTMLSpanElement;
  constructor(label: string, buttonText: string, onClick: () => any) {
    let lab = document.createElement("label");
    lab.textContent = label;
    let inp = document.createElement("input");
    inp.setAttribute("type", "button");
    inp.value = buttonText;
    inp.addEventListener("click", () => onClick());
    this.label = lab;
    this.input = inp;
  }
}
