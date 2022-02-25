import katex from "katex";

export default function (this: any, data: any) {
  this.urlCheck(KatexStylesheet, data.collections.all);
}

export const KatexStylesheet = "/katex_0.15.2.css";
export const Gamma = katex.renderToString(`\\Gamma_{\\phantom{0}}`);
export const Gamma0 = katex.renderToString(`\\Gamma_0`);
export const Gamma1 = katex.renderToString(`\\Gamma_1`);
