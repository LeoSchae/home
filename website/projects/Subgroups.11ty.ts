import { ComplexScTr } from "../../library/src/canvas/axis";
import { Renderer2DSVG } from "@lib/canvas/context";
import { congruenceSubgroups } from "@lib/modules/math";
import { hyperbolicLine } from "@lib/modules/math/draw";

let nojs = `<div style="display:grid;justify-items:center;align-items:center;width:100%;height:100%;"><h2>Javascript required!</h2></div>`;

export async function render(this: any, data: any) {
  return (
    `<script>${await this.bundleJSImport(
      "@lib/components/SubgroupsWC"
    )}</script>` + `<subgroups-wc>${nojs}</subgroups-wc>`
  );
}

export function data() {
  return {
    title: "Congruence Subgroups",
    description:
      "A small app that draws the fundamental domains of different congruence subgroups.",
    layout: "main.njk",
    layout_type: "fullscreen",
    tags: ["projects"],
    nav: { key: "Web Apps::Subgroups" },
    icon: perviewIcon(),
  };
}

function perviewIcon() {
  let grp = congruenceSubgroups.Gamma_1.cosetRepresentatives(5);
  let dom = congruenceSubgroups.Domain1.corners;

  let ctx = new Renderer2DSVG(200, 200);
  let projection = new ComplexScTr([100, 200], 100);

  ctx.fillStyle = "#AA000055";
  ctx.strokeStyle = "#AA0000";
  ctx.lineWidth = 1.0;

  let i = 0;
  for (let m of grp) {
    ctx.beginPath();
    for (let i = 0; i < dom.length; i++) {
      hyperbolicLine(
        ctx,
        projection,
        m.transform(dom[i]),
        m.transform(dom[(i + 1) % dom.length])
      );
    }
    //ctx.closePath();
    ctx.fillAndStroke();
  }
  return ctx.svg.toString();
}
