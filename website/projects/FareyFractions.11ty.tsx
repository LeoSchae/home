/** @jsx jsx */
/** @jsxFrag jsx.Fragment */
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
        {await this.bundledScript("@lib/component/FareyFractions", data)}
      </script>
      <farey-fractions>{nojs}</farey-fractions>
    </>
  );
}

export function data() {
  return {
    title: "Farey Fractions",
    description: "Interactively view Farey fractions on a number line.",
    icon: previewIcon(),
    layout_type: "fullscreen",
    tags: ["projects"],
    nav: { key: "Web Apps::Farey Fractions" },
  };
}

function previewIcon() {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><text transform="rotate(21.552, 121.819, 46.2682) matrix(2.08991, 0, 0, 2.08991, -19.7418, -46.1922)" xml:space="preserve" text-anchor="start" font-family="Serif" font-size="24" id="svg_1" y="52.5471" x="48.42288" stroke-width="0" stroke="#000" fill="#bf0000">1/2</text><text transform="rotate(-30.0235, 55.1606, 110.245) matrix(1.84494, 0, 0, 1.84494, -115.422, -84.2444)" xml:space="preserve" text-anchor="start" font-family="Serif" font-size="24" id="svg_3" y="113.70183" x="73.14794" stroke-width="0" stroke="#000" fill="#7f0000">1/4</text><text transform="rotate(11.2197, 136.17, 158.349) matrix(1.98773, 0, 0, 1.98773, -27.9547, -160.308)" xml:space="preserve" text-anchor="start" font-family="Serif" font-size="24" id="svg_2" y="168.66478" x="63.2554" stroke-width="0" stroke="#000" fill="#7f0000">1/3</text></svg>`;
}
