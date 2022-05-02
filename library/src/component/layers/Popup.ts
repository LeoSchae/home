import type { LayeredConfig, Layer } from "./";
import * as dom from "@lib/DomElement";
import styles from "./Popup.css";

export default function (): Layer<
  HTMLElement,
  {
    set(html: string): unknown;
    show(b?: boolean): unknown;
    move(x: number, y: number): unknown;
    container: HTMLDivElement;
  }
> {
  return {
    connected(config: LayeredConfig) {
      let st = dom.Element("style", { __html: styles.css });
      let popup = dom.Element("div", [], {
        class: styles.class.popup,
        style: "z-index:10;",
      });
      return {
        nodes: dom.Element("div", [st, popup]),
        handle: {
          container: popup,
          move(x, y) {
            this.container.style.transform = `translate(${x}px,${y}px)`;
          },
          show(b: boolean = true) {
            this.container.style.opacity = b ? "1" : "0";
          },
          set(html: string) {
            this.container.innerHTML = html;
          },
        },
      };
    },
  };
}
