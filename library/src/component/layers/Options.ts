import type { LayeredConfig, Layer } from "./";
import * as dom from "@lib/DomElement";
import styles from "./Options.css";
import { Domain } from "domain";

export default function (): Layer<
  undefined,
  { addOption(option: { label: Node; input: Node }): unknown }
> {
  return (config: LayeredConfig) => {
    let optionsFrame = dom.Element(
      "div",
      { __html: "<h1>Options</h1>" },
      {
        class: styles.class.container,
        style: "display: none;",
      }
    );

    let optionsButton = dom.Element(
      "button",
      {
        __html: `<svg xmlns="http://www.w3.org/2000/svg" class="${styles.class.icon}" viewBox="0 0 24 24" style="fill:currentColor;"><path d="M19.9,13.3C20,12.8,20,12.4,20,12s0-0.8-0.1-1.3L21.8,9l-2.3-4l-2.4,0.8c-0.7-0.5-1.4-1-2.2-1.3L14.3,2H9.7L9.2,4.5	C8.3,4.8,7.6,5.3,6.9,5.8L4.5,5L2.2,9l1.9,1.7C4,11.2,4,11.6,4,12c0,0.4,0,0.8,0.1,1.3L2.2,15l2.3,4l2.4-0.8l0,0	c0.7,0.5,1.4,1,2.2,1.3L9.7,22h4.7l0.5-2.5c0.8-0.3,1.6-0.7,2.2-1.3l0,0l2.4,0.8l2.3-4L19.9,13.3L19.9,13.3z M12,16	c-2.2,0-4-1.8-4-4c0-2.2,1.8-4,4-4c2.2,0,4,1.8,4,4C16,14.2,14.2,16,12,16z"></path></svg>`,
      },
      {
        "aria-label": "Options Toggle",
        class: styles.class.button,
        title: "Show all options",
      },
      {
        onclick: () => {
          optionsFrame.style.display =
            optionsFrame.style.display == "none" ? "block" : "none";
        },
      }
    );

    let list = dom.Element("ul");
    optionsFrame.append(list);

    config.attachToShaddow(dom.Element("style", { __html: styles.css }));
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

export function manualSizing(config: LayeredConfig) {
  let autoButton = dom.Element("input", [], {
    type: "button",
    value: "Automatic",
  });
  let manual = dom.Element("span");
  let inputs = dom.Element("span");

  return { label: document.createTextNode("Change Size") };
}
