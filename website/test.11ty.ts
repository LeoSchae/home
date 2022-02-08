import { ComplexScTr } from "../library/src/canvas/axis";
import { Renderer2DSVG } from "@lib/canvas/context";
import { congruenceSubgroups } from "@lib/modules/math";
import { hyperbolicLine } from "@lib/modules/math/draw";

function svgPreview() {
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

export function render(this: any, data: any) {
  return (
    `<script src="${this.urlCheck(
      "/scripts/SubgroupsWC.js",
      data.collections.all
    )}"></script>` + `<subgroups-wc></subgroups-wc>`
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
    icon: svgPreview(),
    nav: { key: "test" },
  };
}
