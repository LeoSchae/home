import { Renderer2D } from ".";
import Buffer from "./Buffer";

export default class Renderer2DAutoScale extends Buffer {
  minX: number | undefined;
  minY: number | undefined;
  maxX: number | undefined;
  maxY: number | undefined;

  addVisibleBox(left: number, top: number, right: number, bottom: number) {
    let { minX, minY, maxX, maxY } = this;
    this.minX =
      minX === undefined ? Math.min(left, right) : Math.min(left, right, minX);
    this.maxX =
      maxX === undefined ? Math.max(left, right) : Math.max(left, right, maxX);
    this.minY =
      minY === undefined ? Math.min(top, bottom) : Math.min(top, bottom, minY);
    this.maxY =
      maxY === undefined ? Math.max(top, bottom) : Math.max(top, bottom, maxY);
  }

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    ccw?: boolean
  ): this {
    super.arc(x, y, radius, startAngle, endAngle, ccw);
    console.warn("NOT IMPLEMENTED FOR SCALING!");
    return this;
  }

  moveTo(x: number, y: number): this {
    super.moveTo(x, y);
    this.addVisibleBox(x, y, x, y);
    return this;
  }

  lineTo(x: number, y: number): this {
    super.lineTo(x, y);
    this.addVisibleBox(x, y, x, y);
    return this;
  }

  applyScaled(
    r: Renderer2D,
    width: number,
    height: number,
    opts?: { buffer?: number }
  ): void {
    let buffer = opts?.buffer || 0;
    let { minX = 0, maxX = 0, minY = 0, maxY = 0 } = this;
    let s = Math.min(
      (width - 2 * buffer) / (maxX - minX),
      (height - 2 * buffer) / (maxY - minY)
    );
    let origin: [number, number] = [
      0.5 * (width - s * (minX + maxX)),
      0.5 * (height - s * (minY + maxY)),
    ];
    super.applyWith(r, { scale: s, origin: origin });
  }
}
