/**
 * Tools to turn Generator functions into sync or async functions.
 */

export class AsyncManager<K> {
  private map = new Map<K, AsyncOptions[]>();

  constructor() {}

  getNew(context: K, timeBudget?: number): OptionsFactory {
    return {
      create: () => {
        let m = this.map;
        let active: AsyncOptions[];

        if (m.has(context)) {
          active = m.get(context) as AsyncOptions[];
        } else {
          active = [];
          m.set(context, active);
        }
        let o = new AsyncOptions(timeBudget);
        active.push(o);
        return o;
      },
    };
  }

  abortAll(context: K) {
    if (!this.map.has(context)) return;
    let v = this.map.get(context) as AsyncOptions[];
    for (let o of v) o.aborted = true;
    this.map.delete(context);
  }
}

type OptionsFactory = { create: () => Options };

type Options = {
  begin?(): any;
  done?(): any;
  shouldYield(): boolean;
  yield(): Promise<void | number>;
};

export class AsyncOptions implements Options {
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
      throw "aborted";
    }

    this.i = 0;
    this.t = performance.now();
    return;
  }
}

export async function callAsync<
  T,
  R,
  F extends (this: T, ...args: any[]) => Generator<any, R, any>
>(th: T, f: F, args: Parameters<F>, asyncOptions?: OptionsFactory): Promise<R> {
  asyncOptions ??= DefaultAsyncOptions;
  let asyncInstance: Options = asyncOptions.create();

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

export function callSync<
  T,
  R,
  F extends (this: T, ...args: any[]) => Generator<any, R, any>
>(th: T, f: F, args: Parameters<F>): R {
  // The types should be safe
  let gen = f.apply(th, args);
  let n = gen.next();
  while (!n.done) n = gen.next();
  return n.value;
}

export const DefaultAsyncOptions: OptionsFactory = {
  create: () => {
    return {
      shouldYield() {
        return false;
      },
      async yield() {},
    };
  },
};

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type AsyncWrap<
  F extends (this: any, ...args: any[]) => Generator<any, any, any>
> = F extends (this: infer T, ...args: any[]) => Generator<any, infer R, any> // Infer both this and return
  ? (this: T, ...args: [...Parameters<F>, OptionsFactory?]) => Promise<R>
  : F extends (this: any, ...args: any[]) => Generator<any, infer R, any> // Infer only return
  ? (...args: [...Parameters<F>, OptionsFactory?]) => Promise<R>
  : F extends (this: infer T, ...args: any[]) => Generator<any, any, any> // Infer only this
  ? (this: T, ...args: [...Parameters<F>, OptionsFactory?]) => Promise<unknown>
  : (...args: [...Parameters<F>, OptionsFactory?]) => Promise<unknown>;
type SyncWrap<
  F extends (this: any, ...args: any[]) => Generator<any, any, any>
> = F extends (this: infer T, ...args: any[]) => Generator<any, infer R, any> // Infer both this and return
  ? (this: T, ...args: Parameters<F>) => R
  : F extends (this: any, ...args: any[]) => Generator<any, infer R, any> // Infer only return
  ? (...args: Parameters<F>) => R
  : F extends (this: infer T, ...args: any[]) => Generator<any, any, any> // Infer only this
  ? (this: T, ...args: Parameters<F>) => unknown
  : (...args: Parameters<F>) => unknown;

function extractOptions(args: any[]): [OptionsFactory | undefined, any[]] {
  let last = args[args.length - 1];
  let ao: OptionsFactory | undefined;

  // Simple (not perfect) check if last arguent is options
  if ("create" in last) {
    args = Array.prototype.slice.call(args, 0, args.length - 1);
    ao = last;
  }
  return [ao, args];
}

/**
 * Tooling to wrap a function.
 */
export namespace wrap {
  export function async<F extends (...args: any[]) => Generator<any, any, any>>(
    f: F
  ): AsyncWrap<F> {
    let res = function (this: any, ...args: any[]) {
      let [options, fnArgs] = extractOptions(args);
      return callAsync(this, f, fnArgs as any, options);
    };
    return res as any;
  }

  export function sync<F extends (...args: any[]) => Generator<any, any, any>>(
    f: F
  ): SyncWrap<F> {
    let res = function (this: any, ...args: any[]) {
      return callSync(this, f, args as any);
    };
    return res as any;
  }
}

/**
 * Tooling to forward a function to another function defined on the this object.
 */
export namespace forward {
  export function async<
    F extends (...args: any[]) => Generator<any, any, any> = never
  >(key: string): AsyncWrap<F> {
    let res = function (this: any, ...args: any[]) {
      let [options, fnArgs] = extractOptions(args);
      return callAsync(this, this[key], fnArgs as any, options);
    };
    return res as any;
  }

  export function sync<F extends (...args: any[]) => Generator<any, any, any>>(
    key: string
  ): SyncWrap<F> {
    let res = function (this: any, ...args: any[]) {
      return callSync(this, this[key], args as any);
    };
    return res as any;
  }
}
