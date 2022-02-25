export type Option = {
  input: HTMLElement;
  label: HTMLElement;
};

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
    choices: (string | [string, string])[],
    onChange: (name: string) => any,
    def?: string
  ) {
    let lab = document.createElement("span");
    lab.textContent = label;

    let inp = document.createElement("span");

    for (var choice of choices) {
      let name, display;
      if (Array.isArray(choice)) {
        name = choice[0];
        display = choice[1];
      } else {
        name = choice;
        display = choice;
      }

      let s = document.createElement("span");
      s.style.display = "inline-block";
      s.style.width = "20px";
      inp.appendChild(s);
      let l = document.createElement("label");
      l.innerHTML = display;
      let o = document.createElement("input");

      o.setAttribute("type", "radio");
      o.setAttribute("value", name);
      o.setAttribute("name", label);
      if (def == name) o.checked = true;
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
