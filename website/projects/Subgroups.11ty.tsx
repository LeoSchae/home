/** @jsx jsx */
/** @jsxFrag jsx.Fragment */
import { jsx } from "@lib/UnsafeXML";
import { ComplexScTr } from "../../library/src/canvas/axis";
import SVG from "@lib/renderer/SVG";
import { congruenceSubgroups } from "@lib/modules/math";
import { hyperbolicLine } from "@lib/modules/math/draw";

let nojs = (
  <div style="display:grid;justify-items:center;align-items:center;width:100%;height:100%;">
    <h2>Javascript required!</h2>
  </div>
);

export async function render(this: any, data: any) {
  return (
    <>
      <script>
        {await this.bundledScript("@lib/component/SubgroupsWC", data)}
      </script>
      <subgroups-wc></subgroups-wc>
    </>
  );
}

export function data(this: any) {
  return {
    title: "Congruence Subgroups",
    description:
      "A small app that draws the fundamental domains of different congruence subgroups.",
    layout_type: "fullscreen",
    tags: ["projects"],
    nav: { key: "Web Apps::Subgroups" },
    eleventyComputed: {
      icon: perviewIcon,
    },
  };
}

function perviewIcon(this: any, data: any) {
  this.ctx = data;
  this.page = data.page;
  this.ctx = data;
  this.page = data.page;
  let group = congruenceSubgroups.Gamma_1;
  let level = 7;

  // Only log in non proxy pass
  this.verbose(`Generating icon with ${group.toTeX()}(${level})`);

  let grp = group.cosetRepresentatives(level);
  let dom = congruenceSubgroups.Domain1.corners;

  let ctx = new SVG(200, 200);
  let projection = new ComplexScTr([100, 200], 100);

  ctx.fillStyle = "#AA000055";
  ctx.strokeStyle = "#AA0000";
  ctx.lineWidth = 1.0;

  let i = 0;
  for (let m of grp) {
    ctx.begin();
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
