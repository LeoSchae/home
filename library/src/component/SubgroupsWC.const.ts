import katex from "katex";

let initialized = false;
/**
 * Only called when bundling js.
 * @param this Javascript functions from 11ty
 * @param data Data from cascade
 */
export default function (this: any, data: any) {
  if (initialized) return;
  initialized = true;
  KatexStylesheet = this.link(KatexStylesheet, data.collections.all);
}

export var KatexStylesheet = "/katex/katex.min.css";
export const Gamma = katex.renderToString(`\\Gamma_{\\phantom{0}}`);
export const Gamma0 = katex.renderToString(`\\Gamma_0`);
export const Gamma1 = katex.renderToString(`\\Gamma_1`);
