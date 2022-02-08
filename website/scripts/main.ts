import { initialize } from "@lib/modules/SubgroupsApp";

class MoebiousCanvas extends HTMLElement {
  shadow: ShadowRoot | undefined;
  shadow_style: HTMLStyleElement | undefined;

  connectedCallback() {
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow_style = document.createElement("style");
    const fgCanvas = document.createElement("canvas");
    const bgCanvas = document.createElement("canvas");
    fgCanvas.className = "fgCanvas";
    bgCanvas.className = "bgCanvas";

    this.shadow_style.textContent = `
            :host {
                position: relative;
                top: 0;
                left: 0;
                display: block;
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
            }

            .fgCanvas {
                position: absolute;
                width: 100%;
                height: 100%;
                z-index: 1;
                touch-action: none;
            }

            .bgCanvas {
                position: absolute;
                width: 100%;
                height: 100%;
                z-index: 0;
            }
        `;

    this.shadow.appendChild(this.shadow_style);
    this.shadow.appendChild(fgCanvas);
    this.shadow.appendChild(bgCanvas);

    initialize(this, fgCanvas, bgCanvas);
  }
}

window.customElements.define("moebious-canvas", MoebiousCanvas);
