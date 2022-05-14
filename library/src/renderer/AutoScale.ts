import { startTimer } from "winston";
import { Renderer2D } from ".";
import Buffer from "./Buffer";

const twoPi = 2 * Math.PI;
const _twoPi = 0.5 / Math.PI;

const twoOverPi = 0.5 / Math.PI;

export default class Renderer2DAutoScale extends Buffer {
  minX: number = Number.POSITIVE_INFINITY;
  minY: number = Number.POSITIVE_INFINITY;
  maxX: number = Number.NEGATIVE_INFINITY;
  maxY: number = Number.NEGATIVE_INFINITY;

  addVisiblePoint(x: number, y: number) {
    this.minX = Math.min(x, this.minX);
    this.maxX = Math.max(x, this.maxX);
    this.minY = Math.min(y, this.minY);
    this.maxY = Math.max(y, this.maxY);
  }

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    cw?: boolean
  ): this {
    super.arc(x, y, radius, startAngle, endAngle, cw);

    this.addVisiblePoint(
      x + radius * Math.cos(startAngle),
      y - radius * Math.sin(startAngle)
    );
    this.addVisiblePoint(
      x + radius * Math.cos(endAngle),
      y - radius * Math.sin(endAngle)
    );

    let startQuarter = startAngle * _twoPi;
    startQuarter = (startQuarter - Math.floor(startQuarter)) * 4;
    let endQuarter = endAngle * _twoPi;
    endQuarter = (endQuarter - Math.floor(endQuarter)) * 4;

    if (cw) {
      let tmp = startQuarter;
      startQuarter = endQuarter;
      endQuarter = tmp;
    }

    if (endQuarter < startQuarter) endQuarter += 4;

    for (let i = Math.ceil(startQuarter); i < endQuarter; i++) {
      let even = i % 2 == 0;
      this.addVisiblePoint(
        x + (even ? (i == 0 || i == 4 ? radius : -radius) : 0),
        y + (!even ? (i == 1 || i == 5 ? -radius : radius) : 0)
      );
    }
    return this;
  }

  move(x: number, y: number): this {
    super.move(x, y);
    this.addVisiblePoint(x, y);
    return this;
  }

  line(x: number, y: number): this {
    super.line(x, y);
    this.addVisiblePoint(x, y);
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
