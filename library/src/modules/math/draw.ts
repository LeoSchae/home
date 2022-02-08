import { Complex, oo } from ".";
import { PredictiveRenderer2D, Renderer2D } from "../../canvas/context";

export function hyperbolicLine(
  ctx: CanvasRenderingContext2D | Renderer2D,
  { origin, scale }: { origin: [number, number]; scale: number },
  from: Complex | oo,
  to: Complex | oo
) {
  if (from == oo && to == oo) return;

  if (to == oo) {
    let x = (from as Complex).real * scale + origin[0],
      y = -(from as Complex).imag * scale + origin[1];
    ctx.lineTo(x, y);
    ctx.lineTo(x, 0);
    return;
  }
  if (from == oo) {
    let x = (to as Complex).real * scale + origin[0],
      y = -(to as Complex).imag * scale + origin[1];
    ctx.moveTo(x, 0);
    ctx.lineTo(x, y);
    return;
  }

  let c1 = from as Complex;
  let c2 = to as Complex;

  ctx.lineTo(c1.real * scale + origin[0], -c1.imag * scale + origin[1]);

  if (Math.abs(c1.real - c2.real) < 0.0000000001) {
    // Draw straight line between points
    ctx.lineTo(c2.real * scale + origin[0], -c2.imag * scale + origin[1]);
    return;
  }

  let C = (0.5 * (c1.abs2() - c2.abs2())) / (c1.real - c2.real);
  let CP = [C * scale + origin[0], origin[1]];

  c1 = c1.sub(C);
  c2 = c2.sub(C);
  let a1 = c1.arg();
  let a2 = c2.arg();

  ctx.arc(CP[0], CP[1], c1.abs() * scale, -a1, -a2, a1 < a2);
}
