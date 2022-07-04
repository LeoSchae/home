import type { Backend } from "./Backend";

type Require<T> = { [key in keyof T]-?: T[key] };

export namespace Renderer {
  export type Color = [number, number, number, number?] | string;

  export type Style<T extends Backend.Type> = ("path" extends T
    ? {
        fill?: Color;
        stroke?: Color;
        lineWidth?: number;
      }
    : {}) &
    ("primitive" extends T
      ? {
          fill?: Color;
          stroke?: Color;
          lineWidth?: number;
        }
      : {}) &
    ("text" extends T
      ? {
          fill?: Color;
          fontSize?: number;
        }
      : {});

  export type Path = {
    [key in keyof Require<Backend.Path>]: (
      ...args: Parameters<Require<Backend.Path>[key]>
    ) => Path;
  } & {
    draw(stroke?: boolean, fill?: boolean): Path;
    fill(): Path;
    stroke(): Path;
  };

  export type Text = Backend.Text;

  export type Primitive = {
    [k in keyof Require<Backend.Primitive>]: (
      ...args: Parameters<Require<Backend.Primitive>[k]>
    ) => {
      draw(stroke?: boolean, fill?: boolean): void;
      stroke(): void;
      fill(): void;
    };
  };
}

export type Renderer<T extends Backend.Type> = {
  clear(color?: Renderer.Color): Renderer<T>;
  /** Saves the current style options and clip path to a stack. */
  save(): Renderer<T>;
  /** Restores the latest style options and clip path from a stack */
  restore(): Renderer<T>;
  /** Edit a set of style options */
  style(options: Renderer.Style<T>): Renderer<T>;
} & ("path" extends T
  ? {
      /** Create a new path assigned to this backend */
      path(): Renderer.Path;
    }
  : {}) &
  ("text" extends T
    ? {
        text(): Renderer.Text;
      }
    : {}) &
  ("primitive" extends T
    ? {
        primitive(): Renderer.Primitive;
      }
    : {});

import {
  styleToBackendStyle,
  rendererFromBackend,
  parseColor,
} from "./RendererConvert";

export namespace Renderer {
  export const from = rendererFromBackend;
  export const toBackendStyle = styleToBackendStyle;

  export const Color = parseColor;
}
