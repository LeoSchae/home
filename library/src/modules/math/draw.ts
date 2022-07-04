import { Complex, oo } from ".";
import * as render from "@lib/renderer";
import { FullBackend, FullPathBackend } from "@lib/renderer/new";

export function hyperbolicLine(
  ctx: FullPathBackend,
  { origin, scale }: { origin: [number, number]; scale: number },
  from: Complex | oo,
  to: Complex | oo
) {
  if (from == oo && to == oo) return;

  if (to == oo) {
    let x = (from as Complex).real * scale + origin[0],
      y = -(from as Complex).imag * scale + origin[1];
    ctx.line(x, y);
    ctx.line(x, 0);
    return;
  }
  if (from == oo) {
    let x = (to as Complex).real * scale + origin[0],
      y = -(to as Complex).imag * scale + origin[1];
    ctx.move(x, 0);
    ctx.line(x, y);
    return;
  }

  let c1 = from as Complex;
  let c2 = to as Complex;

  ctx.line(c1.real * scale + origin[0], -c1.imag * scale + origin[1]);

  if (Math.abs(c1.real - c2.real) < 0.0000000001) {
    // Draw straight line between points
    ctx.line(c2.real * scale + origin[0], -c2.imag * scale + origin[1]);
    return;
  }

  let C = (0.5 * (c1.abs2() - c2.abs2())) / (c1.real - c2.real);
  let CP = [C * scale + origin[0], origin[1]];

  c1 = c1.sub(C);
  c2 = c2.sub(C);
  let a1 = c1.arg();
  let a2 = c2.arg();

  ctx.arc(
    CP[0],
    CP[1],
    c1.abs() * scale,
    (0.5 * a1) / Math.PI,
    (0.5 * (a2 - a1)) / Math.PI
  );
}
