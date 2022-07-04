export { Align } from "./Align";
export { Backend } from "./Backend";
export { Renderer } from "./Renderer";

const twoPi = 2 * Math.PI;

export function ellipsePoint(
  cx: number,
  cy: number,
  radiusX: number,
  radiusY: number,
  axisRotation: number,
  angle: number
): [number, number] {
  angle *= twoPi;
  axisRotation *= twoPi;
  let x = radiusX * Math.cos(angle),
    y = radiusY * Math.sin(angle);
  let cos = Math.cos(axisRotation),
    sin = Math.sin(axisRotation);
  return [cx + cos * x - sin * y, cy - sin * x - cos * y];
}

// Backends
export { CanvasBackend } from "./BackendCanvas";
export { SVGBackend } from "./BackendSVG";
export { TikZBackend } from "./BackendTikZ";

// Renderers
export { RenderProxy } from "./RenderProxy";

// Actions on Backends
