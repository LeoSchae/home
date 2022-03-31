/** @jsx jsx */
/** @jsxFrag jsx.Fragment */
import { jsx } from "@lib/DomElement";
import type { LayeredConfig, Layer } from ".";
import styles from "./Options.css";

const OPTION_TYPES = {
  number: function (options: {
    label: string;
    onChange?: (n: number) => any;
    default?: number;
  }): {
    label: Node;
    input: Node;
  } {
    const changed = options.onChange;
    return {
      label: <label>{options.label}</label>,
      input: (
        <input
          type="number"
          oninput={(ev: Event) => {
            changed?.(parseInt((ev as any).target.value));
          }}
          {...(options.default ? { value: options.default } : {})}
        ></input>
      ),
    };
  },
  color: function (options: {
    label: string;
    onChange?: (n: string) => any;
    default?: string;
  }) {
    let changed = options.onChange;
    return {
      label: <label>{options.label}</label>,
      input: (
        <input
          type="color"
          oninput={(ev: Event) => {
            changed?.((ev as any).target.value);
          }}
          {...(options.default ? { value: options.default } : {})}
        ></input>
      ),
    };
  },
  radio: function (options: {
    label: string;
    values: { name: string; label: string | Node }[];
    onChange?: (name: string) => any;
    default?: string;
  }) {
    let changed = options.onChange;
    return {
      label: <label>{options.label}</label>,

      input: (
        <>
          {...options.values.map((opt) => (
            <>
              <label>
                {opt.label}
                <input
                  type="radio"
                  name={options.label}
                  value={opt.name}
                  oninput={(ev: Event) => {
                    changed?.((ev as any).target.value);
                  }}
                />
              </label>
              <span style="display:inline-block;width:1em;" />
            </>
          ))}
        </>
      ),
    };
  },
  multiButton: function (options: {
    label: string;
    values: { name: string; label: string | Node }[];
    onClick?: (name: string) => any;
    default?: string;
  }) {
    let clicked = options.onClick;
    return {
      label: <label>{options.label}</label>,

      input: (
        <>
          {...options.values.map((opt) => (
            <button
              value={opt.name}
              onclick={(ev: Event) => {
                clicked?.((ev as any).target.value);
              }}
            >
              {opt.label}
            </button>
          ))}
        </>
      ),
    };
  },
  custom: function (options: { label: Node | string; input: Node }) {
    return {
      label:
        typeof options.label === "string" ? (
          <span>{options.label}</span>
        ) : (
          options.label
        ),
      input: options.input,
    };
  },
};

type Options = {
  /** @deprecated */
  addOption(option: { label: Node; input: Node }): unknown;
  add<K extends keyof typeof OPTION_TYPES>(
    option: { type: K } & Parameters<typeof OPTION_TYPES[K]>[0]
  ): unknown;
};

export default function (): Layer<undefined, Options> {
  return (config: LayeredConfig) => {
    let optionsFrame = (
      <div class={styles.class.container}>
        <h1>Options</h1>
      </div>
    );

    let optionsButton = (
      <button
        arial-label="Options Toggle"
        class={styles.class.button}
        title="Show all options"
        __html={`<svg xmlns="http://www.w3.org/2000/svg" class="${styles.class.icon}" viewBox="0 0 24 24" style="fill:currentColor;"><path d="M19.9,13.3C20,12.8,20,12.4,20,12s0-0.8-0.1-1.3L21.8,9l-2.3-4l-2.4,0.8c-0.7-0.5-1.4-1-2.2-1.3L14.3,2H9.7L9.2,4.5	C8.3,4.8,7.6,5.3,6.9,5.8L4.5,5L2.2,9l1.9,1.7C4,11.2,4,11.6,4,12c0,0.4,0,0.8,0.1,1.3L2.2,15l2.3,4l2.4-0.8l0,0	c0.7,0.5,1.4,1,2.2,1.3L9.7,22h4.7l0.5-2.5c0.8-0.3,1.6-0.7,2.2-1.3l0,0l2.4,0.8l2.3-4L19.9,13.3L19.9,13.3z M12,16	c-2.2,0-4-1.8-4-4c0-2.2,1.8-4,4-4c2.2,0,4,1.8,4,4C16,14.2,14.2,16,12,16z"></path></svg><svg class="${styles.class.icon_x}" version="1.1" viewBox="0 0 460.78 460.78" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="m285.08 230.4 171.14-171.13c6.076-6.077 6.076-15.911 0-21.986l-32.707-32.719c-2.913-2.911-6.866-4.55-10.992-4.55-4.127 0-8.08 1.639-10.993 4.55l-171.14 171.14-171.14-171.14c-2.913-2.911-6.866-4.55-10.993-4.55-4.126 0-8.08 1.639-10.992 4.55l-32.707 32.719c-6.077 6.075-6.077 15.909 0 21.986l171.14 171.13-171.12 171.11c-6.074 6.077-6.074 15.911 0 21.986l32.709 32.719c2.911 2.911 6.865 4.55 10.992 4.55s8.08-1.639 10.994-4.55l171.12-171.12 171.12 171.12c2.913 2.911 6.866 4.55 10.993 4.55 4.128 0 8.081-1.639 10.992-4.55l32.709-32.719c6.074-6.075 6.074-15.909 0-21.986l-171.12-171.11z"/></svg>`}
        onclick={() => {
          let hidden = optionsFrame.style.display == "block";
          optionsFrame.style.display = hidden ? "" : "block";
          if (hidden) optionsButton.classList.remove("active");
          else optionsButton.classList.add("active");
        }}
      ></button>
    );

    let list = <ul></ul>;
    optionsFrame.append(list);

    config.attachToShaddow(
      <style __html={styles.css} />,
      optionsFrame,
      optionsButton
    );
    return {
      addOption(option: { label: Node; input: Node }) {
        list.appendChild(
          <li>
            {option.label}: {option.input}
          </li>
        );
      },
      add<K extends keyof typeof OPTION_TYPES>(
        option: { type: K } & Parameters<typeof OPTION_TYPES[K]>[0]
      ) {
        let opt = OPTION_TYPES[option.type](option as any);
        this.addOption(opt);
      },
    };
  };
}

export function manualSizing(
  config: LayeredConfig
): Parameters<Options["add"]>[0] {
  let x: HTMLInputElement, y: HTMLInputElement;
  let inputs: HTMLElement, auto: HTMLElement, manual: HTMLElement;
  let observer = new ResizeObserver(() => {
    if (config.containerElement.style.width === "") {
      return;
    }
    let parent = config.hostElement;
    if (!parent) return;
    let { clientWidth: cw, clientHeight: ch } = config.containerElement;
    let { clientWidth: ww, clientHeight: wh } = parent;
    let scale = Math.min(ww / cw, wh / ch);
    config.containerElement.style.transformOrigin = "top left";
    config.containerElement.style.transform = `translate(${
      (ww - cw * scale) / 2
    }px, ${(wh - ch * scale) / 2}px) scale(${scale}, ${scale})`;
  });

  manual = (
    <span>
      {[
        (x = (<input type="number" />) as any),
        " x ",
        (y = (<input type="number" />) as any),
        <input
          type="button"
          value="Apply"
          onclick={() => {
            let w = parseInt(x.value);
            let h = parseInt(y.value);

            config.containerElement.style.width = w + "px";
            config.containerElement.style.height = h + "px";
            config.containerElement.style.outline = "1px dashed black";
          }}
        />,
        <input
          type="button"
          value="Default"
          onclick={() => {
            config.containerElement.style.width = "";
            config.containerElement.style.height = "";
            config.containerElement.style.outline = "";
            config.containerElement.style.transform = "";
            config.containerElement.style.transformOrigin = "";
            inputs.replaceChildren(auto);
            observer.unobserve(config.containerElement);
            observer.unobserve(config.hostElement);
          }}
        />,
      ]}
    </span>
  );

  auto = (
    <span>
      [Automatic]
      <input
        type="button"
        value="Change"
        onclick={() => {
          inputs.replaceChildren(manual);
          observer.observe(config.containerElement);
          observer.observe(config.hostElement);
        }}
      />
    </span>
  );

  inputs = <span>{auto}</span>;

  return {
    type: "custom",
    label: "Change Size",
    input: inputs,
  };
}
