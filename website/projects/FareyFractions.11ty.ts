import { ComplexScTr } from "../../library/src/canvas/axis";
import { Renderer2DSVG } from "@lib/canvas/context";
import { congruenceSubgroups } from "@lib/modules/math";
import { hyperbolicLine } from "@lib/modules/math/draw";

let nojs = `<div style="display:grid;justify-items:center;align-items:center;width:100%;height:100%;"><h2>Javascript required!</h2></div>`;

export async function render(this: any, data: any) {
  return (
    `<script>${await this.bundleJSImport(
      "@lib/components/FareyFractions",
      data
    )}</script>` + `<farey-fractions>${nojs}</farey-fractions>`
  );
}

export function data() {
  return {
    title: "Farey Fractions",
    description: "Interactively view Farey fractions on a number line.",
    layout: "main.njk",
    layout_type: "fullscreen",
    tags: ["projects"],
    nav: { key: "Web Apps::Farey Fractions" },
  };
}
