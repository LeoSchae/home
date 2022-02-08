export class AsyncManager<K> {
  private map = new Map<K, AsyncOptions[]>();

  constructor() {}

  getNew(context: K): AsyncOptions {
    let m = this.map;
    let v: AsyncOptions[];

    if (m.has(context)) {
      v = m.get(context) as AsyncOptions[];
    } else {
      v = [];
      m.set(context, v);
    }
    let o = new AsyncOptions();
    v.push(o);
    return o;
  }

  abortAll(context: K) {
    if (!this.map.has(context)) return;
    let v = this.map.get(context) as AsyncOptions[];
    for (let o of v) o.aborted = true;
    this.map.delete(context);
  }
}

export class AsyncOptions {
  private I: number;
  private i: number = 0;
  private t: number = performance.now();
  private t0: number | undefined;
  private d: number;
  aborted: boolean;

  constructor() {
    this.I = -1;
    this.d = 16;
    this.aborted = false;
  }

  begin() {
    this.t0 = this.t = performance.now();
  }

  done() {
    this.aborted = true;
    let T = performance.now() - (this.t0 || performance.now());
    if (false && T > 2000)
      console.log("Long Task Took: " + Math.round(T) + "ms");
  }

  get shouldYield(): boolean {
    let i = this.i++;
    if (i < this.I) return false;
    if ((this.I = -1)) return performance.now() - this.t >= this.d;
    return true;
  }

  async yield(): Promise<void>;
  async yield(): Promise<void | number> {
    if (this.aborted) {
      if (false) console.log("Task was aborted!");
      throw "aborted";
    }

    if (this.t) {
      let delta = performance.now() - this.t;

      // Geom running average for iterations
      this.I = Math.max(1, this.i * Math.min(this.d / (delta + 1), 4));
    }
    await wait(0);
    if (this.aborted) {
      if (false) console.log("Task was aborted!");
      throw "aborted";
    }

    this.i = 0;
    this.t = performance.now();
    return;
  }
}

export namespace wrap {
  type Wrapped<
    F extends (this: any, ...args: any[]) => Generator<any, any, any>
  > = F extends (this: infer T, ...args: any[]) => Generator<any, infer R, any> // Infer both this and return
    ? (this: T, ...args: [...Parameters<F>, AsyncOptions?]) => Promise<R>
    : F extends (this: any, ...args: any[]) => Generator<any, infer R, any> // Infer only return
    ? (...args: [...Parameters<F>, AsyncOptions?]) => Promise<R>
    : F extends (this: infer T, ...args: any[]) => Generator<any, any, any> // Infer only this
    ? (this: T, ...args: [...Parameters<F>, AsyncOptions?]) => Promise<unknown>
    : (...args: [...Parameters<F>, AsyncOptions?]) => Promise<unknown>;

  export function unblockYields<
    F extends (...args: any[]) => Generator<any, any, any>
  >(f: F): Wrapped<F> {
    let res = function (this: any) {
      let len = arguments.length;
      let last = arguments[len - 1];
      let ao;
      if (last instanceof AsyncOptions) {
        len = len - 1;
        ao = last;
      } else ao = DefaultAsyncOptions();

      return callWrapped(
        this,
        f,
        Array.prototype.slice.call(arguments, 0, len) as any,
        ao
      );
    };
    return res as any;
  }

  export async function callWrapped<
    T,
    R,
    F extends (this: T, ...args: any[]) => Generator<any, R, any>
  >(th: T, f: F, args: Parameters<F>, ao?: AsyncOptions): Promise<R> {
    if (!ao) ao = DefaultAsyncOptions();
    ao.begin();

    // The types should be sage
    let gen = f.apply(th, args);
    let n = gen.next();
    while (!n.done) {
      if (ao.shouldYield) await ao.yield();
      n = gen.next();
    }

    if (ao.aborted) await ao.yield();

    ao.done();
    return n.value;
  }
}

export function DefaultAsyncOptions() {
  return new AsyncOptions();
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
