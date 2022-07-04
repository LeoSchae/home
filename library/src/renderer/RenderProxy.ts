import type { Renderer } from ".";

enum PathActions {
  move,
  line,
  cubic,
  quadratic,
  ellipse,
  arc,
  close,
  draw,
  clip,
}

enum BackendActions {
  clear,
  clear_color,
  save,
  restore,
  style,
  apply,
  path,
}

class ProxyPathBackend implements Renderer.Path {
  readonly id: number;
  private buffer: number[] = [];

  constructor(private backend: RenderProxy, id: number) {
    this.id = id;
  }

  move(x: number, y: number): this {
    this.buffer.push(PathActions.move, x, y);
    return this;
  }
  line(x: number, y: number): this {
    this.buffer.push(PathActions.line, x, y);
    return this;
  }
  cubic(
    c1x: number,
    c1y: number,
    c2x: number,
    c2y: number,
    x: number,
    y: number
  ): this {
    this.buffer.push(PathActions.cubic, c1x, c1y, c2x, c2y, x, y);
    return this;
  }
  quadratic(cx: number, cy: number, x: number, y: number): this {
    this.buffer.push(PathActions.quadratic, cx, cy, x, y);
    return this;
  }
  ellipse(
    cx: number,
    cy: number,
    radiusX: number,
    radiusY: number,
    axisRotation: number,
    angleOffset: number,
    angle: number
  ): this {
    this.buffer.push(
      PathActions.ellipse,
      cx,
      cy,
      radiusX,
      radiusY,
      axisRotation,
      angleOffset,
      angle
    );
    return this;
  }
  arc(
    cx: number,
    cy: number,
    radius: number,
    angleOffset: number,
    angle: number
  ): this {
    this.buffer.push(PathActions.ellipse, cx, cy, radius, angleOffset, angle);
    return this;
  }
  close(): this {
    this.buffer.push(PathActions.close);
    return this;
  }
  draw(stroke: boolean, fill: boolean): this {
    this.buffer.push(PathActions.draw, +stroke, +fill);
    this.backend._apply(this);
    return this;
  }
  fill() {
    return this.draw(false, true);
  }
  stroke() {
    return this.draw(true, false);
  }
  clip(): this {
    this.backend._apply(this);
    return this;
  }
  replayAction(from: number, backend: Renderer.Path): number {
    let buffer = this.buffer;
    let action;
    let current;

    loop: for (current = from; current < buffer.length; current++) {
      action = buffer[current] as PathActions;
      switch (action) {
        case PathActions.move:
          backend.move(buffer[++current], buffer[++current]);
          break;
        case PathActions.line:
          backend.line(buffer[++current], buffer[++current]);
          break;
        case PathActions.quadratic:
          backend.quadratic(
            buffer[++current],
            buffer[++current],
            buffer[++current],
            buffer[++current]
          );
          break;
        case PathActions.cubic:
          backend.cubic(
            buffer[++current],
            buffer[++current],
            buffer[++current],
            buffer[++current],
            buffer[++current],
            buffer[++current]
          );
          break;
        case PathActions.ellipse:
          backend.ellipse(
            buffer[++current],
            buffer[++current],
            buffer[++current],
            buffer[++current],
            buffer[++current],
            buffer[++current],
            buffer[++current]
          );
          break;
        case PathActions.arc:
          backend.arc(
            buffer[++current],
            buffer[++current],
            buffer[++current],
            buffer[++current],
            buffer[++current]
          );
          break;
        case PathActions.close:
          backend.close();
          break;
        case PathActions.draw:
          backend.draw(buffer[++current] === 1, buffer[++current] === 1);
          break loop;
        case PathActions.clip:
          backend.clip();
          break loop;
        default:
          let never: never = action;
      }
    }

    return ++current;
  }
}

export class RenderProxy implements Renderer<"path"> {
  private buffer: number[] = [];
  private pathBuffer: ProxyPathBackend[] = [];
  private optionBuffer: Renderer.Style<"path">[] = [];

  _apply(pathBuffer: ProxyPathBackend) {
    this.buffer.push(BackendActions.apply, pathBuffer.id);
  }
  clear(color: [number, number, number, number?]) {
    if (color) {
      let c3 = color[3];
      this.buffer.push(
        BackendActions.clear_color,
        color[0],
        color[1],
        color[2],
        c3 === undefined ? 0 : c3
      );
    } else this.buffer.push(BackendActions.clear);
    return this;
  }
  save(): this {
    this.buffer.push(BackendActions.save);
    return this;
  }
  restore(): this {
    this.buffer.push(BackendActions.restore);
    return this;
  }
  style(options: Renderer.Style<"path">): this {
    this.buffer.push(BackendActions.style);
    this.optionBuffer.push(options);
    return this;
  }
  path(): Renderer.Path {
    let buff;
    this.buffer.push(BackendActions.path);
    this.pathBuffer.push(
      (buff = new ProxyPathBackend(this, this.pathBuffer.length))
    );
    return buff;
  }
  replay(backend: Renderer<"path">) {
    let buffer = this.buffer;

    let action;

    let current;
    let currentOption = 0;
    let paths: [number, Renderer.Path][] = [];

    for (current = 0; current < buffer.length; current++) {
      action = buffer[current] as BackendActions;
      switch (action) {
        case BackendActions.clear:
          backend.clear();
          break;
        case BackendActions.clear_color:
          backend.clear([
            buffer[++current],
            buffer[++current],
            buffer[++current],
            buffer[++current],
          ]);
          break;
        case BackendActions.save:
          backend.save();
          break;
        case BackendActions.restore:
          backend.restore();
          break;
        case BackendActions.style:
          backend.style(this.optionBuffer[currentOption++]);
          break;
        case BackendActions.path:
          paths.push([0, backend.path()]);
          break;
        case BackendActions.apply:
          let index = buffer[++current];
          let path = paths[index];
          path[0] = this.pathBuffer[index].replayAction(path[0], path[1]);
          break;
        default:
          let never: never = action;
      }
    }
  }
}
