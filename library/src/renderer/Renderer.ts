import type { Backend } from "./Backend";

type Require<T> = { [key in keyof T]-?: T[key] };

export namespace Renderer {
  export type Style<T extends Backend.Type> = ("path" extends T
    ? {
        fill?: [number, number, number, number?] | string;
        stroke?: [number, number, number, number?] | string;
        lineWidth?: number;
      }
    : {}) &
    ("primitive" extends T
      ? {
          fill?: [number, number, number, number?] | string;
          stroke?: [number, number, number, number?] | string;
          lineWidth?: number;
        }
      : {}) &
    ("text" extends T
      ? {
          fill?: [number, number, number, number?] | string;
          fontSize?: number;
        }
      : {});

  export type Path = {
    [key in keyof Require<Backend.Path>]: (
      ...args: Parameters<Require<Backend.Path>[key]>
    ) => Path;
  } & {
    fill(): Path;
    stroke(): Path;
  };

  export type Text = Backend.Text;

  export type Primitive = Require<Backend.Primitive>;
}

export type Renderer<T extends Backend.Type> = {
  clear(color?: [number, number, number, number?] | string): Renderer<T>;
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

import { styleToBackendStyle, rendererFromBackend } from "./RendererConvert";

export namespace Renderer {
  export const from = rendererFromBackend;
  export const toBackendStyle = styleToBackendStyle;
}
