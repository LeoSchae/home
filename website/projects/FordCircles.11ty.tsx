/** @jsx jsx */
/** @jsxFrag jsx.Fragment */
import { SVG } from "@lib/renderer";
import { jsx } from "@lib/UnsafeXML";

let nojs = (
  <div style="display:grid;justify-items:center;align-items:center;width:100%;height:100%;">
    <h2>Javascript required!</h2>
  </div>
);

export async function render(this: any, data: any) {
  return (
    <>
      <script>
        {await this.bundledScript("@lib/component/FordCircles", data)}
      </script>
      <farey-fractions>{nojs}</farey-fractions>
    </>
  );
}

export function data() {
  return {
    title: "Ford Circles",
    description: "View Ford circles.",
    icon: previewIcon(),
    layout: "main.njk",
    layout_type: "fullscreen",
    tags: ["projects"],
    nav: { key: "Web Apps::Ford Circles" },
  };
}

function previewIcon() {
  let r = new SVG(200, 200);
  r.strokeStyle = "#FF0000";
  r.fillStyle = "#FF000022";

  let shift = 150;

  r.beginPath();
  r.arc(0, shift - 100, 100, Math.PI / 2, 0, false);
  r.arc(200, shift - 100, 100, Math.PI, Math.PI / 2, false);
  r.closePath();
  r.stroke();

  r.beginPath();
  r.arc(100, shift - 25, 25, 0, 2 * Math.PI - 0.01, true);
  r.closePath();
  r.fillAndStroke();

  r.beginPath();
  r.arc(200 / 3, shift - 100 / 9, 100 / 9, 0, 2 * Math.PI - 0.01, true);
  r.closePath();
  r.fillAndStroke();

  r.beginPath();
  r.arc(400 / 3, shift - 100 / 9, 100 / 9, 0, 2 * Math.PI - 0.01, true);
  r.closePath();
  r.fillAndStroke();

  return r.toXML();
}
