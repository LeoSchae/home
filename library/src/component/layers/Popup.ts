import type { LayeredConfig, LayerObject } from "./";
import * as dom from "@lib/DomElement";
import styles from "./Popup.css";

export default function (): LayerObject<
  HTMLElement,
  { set(html?: string): unknown; move(x: number, y: number): unknown }
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
        move(x, y) {
          popup.style.transform = `translate(${x}px,${y}px)`;
        },
        set(html) {
          if (!html) {
            popup.style.opacity = "0";
          } else {
            popup.style.opacity = "1";
            popup.innerHTML = html;
          }
        },
      };
    },
  };
}
