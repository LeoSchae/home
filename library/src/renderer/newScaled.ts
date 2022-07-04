import { Matrix22 } from "@lib/modules/math/matrix";
import * as render from "./new";
import { InterceptedBackend, Transform } from "./newIntercept";
import { ProxyBackend } from "./newProxy";

type PathIntercept = {
  [key in keyof render.FullPathBackend]?: (
    this: render.FullPathBackend,
    ...args: Parameters<render.FullPathBackend[key]>
  ) => boolean | void;
};

export class MeasuredRenderer extends InterceptedBackend<ProxyBackend> {
  minX: number = Number.POSITIVE_INFINITY;
  minY: number = Number.POSITIVE_INFINITY;
  maxX: number = Number.NEGATIVE_INFINITY;
  maxY: number = Number.NEGATIVE_INFINITY;

  constructor() {
    super(new ProxyBackend());

    const addVisiblePoint = (x: number, y: number) => {
      this.minX = Math.min(x, this.minX);
      this.maxX = Math.max(x, this.maxX);
      this.minY = Math.min(y, this.minY);
      this.maxY = Math.max(y, this.maxY);
    };

    this.addIntercept({
      path: {
        arc(
          x: number,
          y: number,
          radius: number,
          angleOffset: number,
          angle: number
        ) {
          addVisiblePoint(
            ...render.ellipsePoint(x, y, radius, radius, 0, angleOffset)
          );
          addVisiblePoint(
            ...render.ellipsePoint(x, y, radius, radius, 0, angleOffset + angle)
          );

          let startQuarter = angleOffset;
          startQuarter = (startQuarter - Math.floor(startQuarter)) * 4;
          let endQuarter = angleOffset + angle;
          endQuarter = (endQuarter - Math.floor(endQuarter)) * 4;

          if (angle < 0) {
            let tmp = startQuarter;
            startQuarter = endQuarter;
            endQuarter = tmp;
          }

          if (endQuarter < startQuarter) endQuarter += 4;

          for (let i = Math.ceil(startQuarter); i < endQuarter; i++) {
            let even = i % 2 == 0;
            addVisiblePoint(
              x + (even ? (i == 0 || i == 4 ? radius : -radius) : 0),
              y + (!even ? (i == 1 || i == 5 ? -radius : radius) : 0)
            );
          }
        },

        move(x: number, y: number) {
          addVisiblePoint(x, y);
        },
        line(x: number, y: number) {
          addVisiblePoint(x, y);
        },
      },
    });
  }

  replay(
    r: render.FullBackend,
    options?: { fit?: { width: number; height: number } }
  ) {
    if (options?.fit) {
      let width = this.maxX - this.minX;
      let height = this.maxY - this.minY;

      let scale = Math.min(
        options.fit.width / width,
        options.fit.height / height
      );

      r = new InterceptedBackend(r, [
        {
          path: Transform(new Matrix22(scale, 0, 0, scale), [
            0.5 * (options.fit.width - scale * width) - this.minX * scale,
            0.5 * (options.fit.height - scale * height) - this.minY * scale,
          ]),
        },
      ]);
    }
    this.backend.replay(r);
  }
}
