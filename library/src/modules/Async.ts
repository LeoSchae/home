/**
 * Tools to turn Generator functions into sync or async functions.
 */

type Wrappable<T> = (this: T, ...args: any[]) => Generator<any, any, any>;

class AbortError extends Error {
  isAbort = true as const;
}

export namespace Async {
  type GroupOptions = {};
  export class Group implements OptionsFactory {
    private running: AsyncOptions[] = [];

    constructor(options?: GroupOptions);
    constructor(name: string, options?: GroupOptions);
    constructor(name?: string | GroupOptions, options?: GroupOptions) {
      if (typeof name !== "string") {
        options = name;
        name = "[unknown]";
      }
    }

    create(): Options {
      let ao = new AsyncOptions(20);
      this.running.push(ao);
      return ao;
    }

    abort() {
      for (let task of this.running) task.aborted = true;
      this.running = [];
    }

    async apply<F extends Wrappable<undefined>>(
      func: F,
      params: Parameters<F>
    ): Promise<F extends () => Generator<any, infer R, any> ? R : unknown>;
    async apply<T, F extends Wrappable<T>>(
      thisParam: T,
      func: F,
      params: Parameters<F>
    ): Promise<F extends () => Generator<any, infer R, any> ? R : unknown>;

    async apply<F extends Wrappable<any>>(
      thisParam: any,
      func: any,
      params?: any
    ): Promise<any> {
      let th: any;
      let f: F;
      let args: any[];
      if (Array.isArray(params)) {
        th = thisParam;
        f = func;
        args = params;
      } else {
        th = undefined;
        f = thisParam;
        args = func;
      }

      let asyncInstance = this.create();

      asyncInstance.begin?.();

      // The types should be safe
      let gen = f.apply(th, args);
      let n = gen.next();
      while (!n.done) {
        if (asyncInstance.shouldYield()) await asyncInstance.yield();
        n = gen.next();
      }

      asyncInstance.done?.();
      return n.value;
    }
  }

  const defaultGroup = new Group();

  export const apply = defaultGroup.apply.bind(defaultGroup);

  type Wrapped<F extends Wrappable<any>> = {
    with(
      group: Group
    ): (
      this: F extends (this: infer T, ...args: any[]) => any ? T : unknown,
      ...args: Parameters<F>
    ) => F extends (...args: any[]) => Generator<any, infer R, any>
      ? Promise<R>
      : Promise<unknown>;
  } & ((
    this: F extends (this: infer T, ...args: any[]) => any ? T : unknown,
    ...args: Parameters<F>
  ) => F extends (...args: any[]) => Generator<any, infer R, any>
    ? Promise<R>
    : Promise<unknown>);

  export function wrap<F extends Wrappable<any>>(f: F): Wrapped<F> {
    let result = function (this: any, ...args: Parameters<F>): any {
      return apply(this, f, args as any);
    };
    (result as any).with = (group: Group) =>
      function (this: any, ...args: Parameters<F>): any {
        return group.apply(this, f, args as any);
      };
    return result as any;
  }

  export function forward<C, K extends keyof C>(
    object: C,
    key: K
  ): C[K] extends Wrappable<C> ? Wrapped<C[K]> : unknown {
    let result = function (...args: any): any {
      return apply(object, object[key] as any, args as any);
    };
    (result as any).with = (group: Group) =>
      function (...args: any): any {
        return group.apply(object, object[key] as any, args as any);
      };
    return result as any;
  }
}

export namespace Sync {
  export function apply<F extends Wrappable<undefined>>(
    func: F,
    params: Parameters<F>
  ): F extends () => Generator<any, infer R, any> ? R : unknown;
  export function apply<T, F extends Wrappable<T>>(
    thisParam: T,
    func: F,
    params: Parameters<F>
  ): F extends () => Generator<any, infer R, any> ? R : unknown;
  export function apply<F extends Wrappable<any>>(
    thisParam: any,
    func: any,
    params?: any
  ): any {
    let th: any, f: F, args: any[];
    if (Array.isArray(params)) {
      th = thisParam;
      f = func;
      args = params;
    } else {
      th = undefined;
      f = thisParam;
      args = func;
    }
    // The types should be safe
    let gen = f.apply(th, args);
    let n = gen.next();
    while (!n.done) n = gen.next();
    return n.value;
  }

  type Wrapped<F extends Wrappable<any>> = (
    this: F extends (this: infer T, ...args: any[]) => any ? T : unknown,
    ...args: Parameters<F>
  ) => F extends (...args: any[]) => Generator<any, infer R, any> ? R : unknown;

  export function wrap<F extends Wrappable<any>>(f: F): Wrapped<F> {
    return function (this: any, ...args: Parameters<F>): any {
      return apply(this, f, args);
    };
  }

  export function forward<C, K extends keyof C>(
    object: C,
    key: K
  ): C[K] extends Wrappable<C> ? Wrapped<C[K]> : unknown {
    let result = function (this: any, ...args: any): any {
      return apply(object, object[key] as any, args as any);
    };
    return result as any;
  }
}

type OptionsFactory = { create: () => Options };

type Options = {
  begin?(): any;
  done?(): any;
  shouldYield(): boolean;
  yield(): Promise<void | number>;
};

class AsyncOptions implements Options {
  private I: number = -1;
  private i: number = 0;
  private t: number = performance.now();
  private t0: number | undefined;
  private d: number;
  aborted: boolean = false;

  constructor(timeBudget = 16) {
    this.d = timeBudget;
  }

  begin() {
    this.t0 = this.t = performance.now();
  }

  done() {
    if (this.aborted) {
      console.debug("A task was aborted!");
      throw "aborted";
    }
    this.aborted = true;
    let T = performance.now() - (this.t0 || performance.now());
    if (T > 1500) console.debug("Long Task Took: " + Math.round(T) + "ms");
  }

  shouldYield(): boolean {
    let i = this.i++;
    if (i < this.I) return false;
    if ((this.I = -1)) return performance.now() - this.t >= this.d;
    return true;
  }

  async yield(): Promise<void>;
  async yield(): Promise<void | number> {
    if (this.t) {
      let delta = performance.now() - this.t;

      // Geom. running average for iterations
      this.I = Math.max(1, this.i * Math.min(this.d / (delta + 1), 4));
    }
    await wait(0);
    if (this.aborted) {
      console.debug("A task was aborted!");
      // TODO
      throw new AbortError("Aborted");
    }

    this.i = 0;
    this.t = performance.now();
    return;
  }
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
