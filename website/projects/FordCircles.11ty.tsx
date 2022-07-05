/** @jsx jsx */
/** @jsxFrag jsx.Fragment */
import { Renderer, SVGBackend } from "@lib/renderer";
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
      <ford-circles>{nojs}</ford-circles>
    </>
  );
}

export function data() {
  return {
    title: "Ford Circles",
    description: "View Ford circles.",
    icon: previewIcon(),
    layout_type: "fullscreen",
    tags: ["projects"],
    nav: { key: "Web Apps::Ford Circles" },
  };
}

function previewIcon() {
  let svg;
  let r = Renderer.from((svg = new SVGBackend(200, 200)));

  r.style({ stroke: [255, 0, 0], fill: [255, 0, 0, 0.3] });

  let shift = 150;

  r.path()
    .arc(0, shift - 100, 100, 0.25, -0.25)
    .arc(200, shift - 100, 100, 0.5, -0.25)
    .close()
    .stroke();

  r.path()
    .arc(100, shift - 25, 25, 0, 0.99)
    .close()
    .draw();

  r.path()
    .arc(200 / 3, shift - 100 / 9, 100 / 9, 0, 0.99)
    .close()
    .draw();

  r.path()
    .arc(400 / 3, shift - 100 / 9, 100 / 9, 0, 0.99)
    .close()
    .draw();

  return svg._svg.toString();
}
