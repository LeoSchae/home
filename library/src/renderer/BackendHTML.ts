/** @jsx jsx */
import { Align, Backend, ellipsePoint } from ".";

function colorToHex(color: [number, number, number, number?]): string {
  let res =
    "#" +
    color[0].toString(16).padStart(2, "0") +
    color[1].toString(16).padStart(2, "0") +
    color[2].toString(16).padStart(2, "0");
  if (color[3] !== undefined) res += color[3].toString(16).padStart(2, "0");
  return res;
}

export class HTMLBackend implements Backend<"text"> {
  constructor(private element: HTMLElement) {}

  _style_stack: {
    fill: string;
    fontSize: number;
  }[] = [];
  _style = {
    fill: "#000000",
    fontSize: 9,
  };
  clear(color?: [number, number, number, number?]) {
    this.element.replaceChildren();
    this.element.style.backgroundColor = color
      ? colorToHex(color)
      : "transparent";
    return this;
  }
  save() {
    let _style = this._style;
    let style = {
      fill: this._style.fill,
      fontSize: _style.fontSize,
    };
    this._style_stack.push(style);
    return this;
  }
  restore() {
    let style = this._style_stack.pop();
    if (!style) throw new Error("Stack is empty!");
    this._style = style;
    return this;
  }
  style(options: Backend.Style<"text">) {
    let color: string;
    let style = this._style;
    for (let [k, v] of Object.entries(options) as [
      keyof typeof options,
      any
    ][]) {
      switch (k) {
        case "fill":
          style.fill = colorToHex(v);
          break;
        case "fontSize":
          style.fontSize = v;
          break;
        default:
          let unreachable: never = k;
          console.warn(
            "Style option '" +
              unreachable +
              "' not implemented (Canvas backend)"
          );
      }
    }
    return this;
  }

  text(): Backend.Text {
    let html = this.element;
    return {
      draw(x, y, text, align: Align = Align.C) {
        let e = document.createElement("div");
        e.textContent = text;
        e.style.position = "absolute";
        e.style.top = x + "px";
        e.style.left = y + "px";

        let trafo = "";

        switch (Align.vertical(align)) {
          case Align.B:
            trafo += "translateY(-100%) ";
            break;
          case Align.C:
            trafo += "translateY(-50%) ";
            break;
        }
        switch (Align.horizontal(align)) {
          case Align.R:
            trafo += "translateX(-100%)";
            break;
          case Align.C:
            trafo += "translateX(-50%)";
            break;
        }
        if (trafo !== "") e.style.transform = trafo;

        html.appendChild(e);
        return this;
      },
    };
  }
}
