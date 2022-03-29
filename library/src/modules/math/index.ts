import { AsyncOptions, DefaultAsyncOptions, wrap } from "../Async";

export enum MathType {
  Infinity = "infinity",
  Complex = "complex",
  Moebius = "moebius",
}

interface TeXable {
  toTeX(): String;
}

/**
 * Infinity
 */
export const oo = {
  mathtype: MathType.Infinity,
} as const;
export type oo = typeof oo;

export class Range {
  constructor(
    public start: number,
    public end: number,
    public step: number = 1
  ) {}

  *[Symbol.iterator]() {
    let { start: v, step, end } = this;
    while (v < end) {
      yield v;
      v += step;
    }
  }
}

/**
 * Function to convert different arguments to instances of the Complex class.
 * @param real
 * @param imag
 */
export function cplx(real: number, imag?: number): Complex;
/**
 * Function to convert different arguments to instances of the Complex class.
 * @param complex Array of form [real, imag]
 */
export function cplx(complex: [number, number]): Complex;
/**
 * Function to convert different arguments to instances of the Complex class.
 * @param complex
 */
export function cplx(complex: Complex): Complex;
export function cplx(
  a: number | [number, number] | Complex,
  b?: number
): Complex {
  return typeof a === "number"
    ? new Complex(a, b)
    : Array.isArray(a)
    ? new Complex(a[0], a[1])
    : a;
}

export class Complex implements TeXable {
  mathtype = MathType.Complex;
  real: number;
  imag: number;

  constructor(real: number, imag: number = 0) {
    this.real = real;
    this.imag = imag;
  }

  /**
   * Get the absolute value squared. This is faster than `abs()`
   * @returns $|z|^2$
   */
  abs2(): number {
    return this.real * this.real + this.imag * this.imag;
  }

  /**
   * Get the absolute value.
   * @returns $|z|$
   */
  abs(): number {
    return Math.sqrt(this.abs2());
  }

  /**
   * Add a value to this.
   * @param other
   */
  add(other: number | Complex): Complex {
    if (typeof other === "number")
      return new Complex(this.real + other, this.imag);
    else return new Complex(this.real + other.real, this.imag + other.imag);
  }

  /**
   * Subtract a value from this.
   * @param other
   */
  sub(other: number | Complex): Complex {
    if (typeof other === "number")
      return new Complex(this.real - other, this.imag);
    else return new Complex(this.real - other.real, this.imag - other.imag);
  }

  /**
   * Multiply a value with this.
   * @param other
   */
  mul(other: number | Complex): Complex {
    if (typeof other === "number")
      return new Complex(other * this.real, other * this.imag);
    else
      return new Complex(
        this.real * other.real - this.imag * other.imag,
        this.imag * other.real + this.real * other.imag
      );
  }

  /**
   * Devide this by another value
   * @param other
   */
  div(other: number | Complex): Complex {
    if (typeof other === "number")
      return new Complex(this.real / other, this.imag / other);
    else {
      return this.mul(other.inv());
    }
  }

  /**
   * Invert this value
   * @returns $z^{-1}$
   */
  inv(): Complex {
    var a2 = this.abs2();
    return new Complex(this.real / a2, -this.imag / a2);
  }

  /**
   * Get the argument if this.
   * @returns $\theta \in [0, 2\pi)$ where $z = |z| e^{i \theta}$.
   */
  arg() {
    var re = this.real;
    var im = this.imag;
    if (re == 0) {
      if (im > 0) return 0.5 * Math.PI;
      else if (im < 0) return 1.5 * Math.PI;
      else return 0;
    }
    if (re >= 0) {
      const phi = Math.atan((1.0 * im) / re);
      if (phi < 0) return 2 * Math.PI + phi;
      return phi;
    }
    return Math.atan((1.0 * im) / re) + Math.PI;
  }

  /**
   * Convert this to TeX
   */
  toTeX() {
    if (this.imag == 0) return `${this.real}`;
    else if (this.real == 0) return `${this.imag}i`;
    else return `${this.real} + ${this.imag}i`;
  }
}

export class Moebius implements TeXable {
  mathtype: MathType.Moebius = MathType.Moebius;
  m: [number, number, number, number];

  /**
   * Create a moebious value with matrix [[m_{0,0}, m_{0,1}], [m_{1,0}, m_{1,1}]].
   * The transform is given by $z \to \frac{m_{0,0} z + m_{0,1}}{m_{1,0} z + m_{1,1}}$.
   * !!! The determinant should be 1. This is not checked and could lead to errors. !!!
   * @param m00
   * @param m01
   * @param m10
   * @param m11
   */
  constructor(m00: number, m01: number, m10: number, m11: number) {
    this.m = [m00, m01, m10, m11];
  }

  /**
   * Multiply two Moebious matricies together.
   * Result is the transform z -> this( other(z) ).
   * @param other
   * @returns
   */
  mul(other: Moebius): Moebius {
    const m1 = this.m;
    const m2 = other.m;
    return new Moebius(
      m1[0] * m2[0] + m1[1] * m2[2],
      m1[0] * m2[1] + m1[1] * m2[3],
      m1[2] * m2[0] + m1[3] * m2[2],
      m1[2] * m2[1] + m1[3] * m2[3]
    );
  }

  /**
   * Invert this transform
   * @returns
   */
  inv(): Moebius {
    const m = this.m;
    return new Moebius(m[3], -m[1], -m[2], m[0]);
  }

  /**
   * Transform a complex value using the moebious transform.
   * @param value
   * @returns
   */
  transform(a: number, b?: number): Complex | oo;
  transform(a: Complex | oo): Complex | oo;
  transform(a: number | Complex | oo, b?: number): Complex | oo {
    if (typeof a === "number") a = cplx(a, b);
    else if (a.mathtype === MathType.Infinity) {
      if (this.m[2] == 0) return oo;
      return new Complex(this.m[0] / this.m[2]);
    }
    const m = this.m;
    const q = a.mul(m[2]).add(m[3]);
    if (q.real == 0 && q.imag == 0) return oo;
    return a.mul(m[0]).add(m[1]).div(q);
  }

  /**
   * Convert to a TeX matrix.
   * @returns
   */
  toTeX() {
    return `\\begin{pmatrix}${this.m[0]}&${this.m[1]}\\${this.m[2]}&${this.m[3]}\\end{pmatrix}`;
  }
}

export namespace congruenceSubgroups {
  export class CongruenceSubgroup implements TeXable {
    indicator: (level: number, value: Moebius) => boolean;
    tex: string;

    constructor(
      indicator: (level: number, value: Moebius) => boolean,
      tex: string
    ) {
      this.indicator = indicator;
      this.tex = tex;
    }

    /**
     * Find the coset representative for a value in a set of representatives.
     * @param level The level of this the group.
     * @param reprs The set of representatives
     * @param value The value
     * @returns The index in the set or -1
     */
    findCosetIndex(level: number, reprs: Moebius[], value: Moebius): number {
      const xinv = value.inv();
      const ind = this.indicator;
      for (var i = 0; i < reprs.length; i++)
        if (ind(level, reprs[i].mul(xinv))) return i;
      return -1;
    }

    /**
     * Find the coset representative for a value in a set of representatives.
     * @param level The level of this the group.
     * @param reprs The set of representatives
     * @param value The value
     * @returns The coset representative
     */
    findCoset(
      level: number,
      list: Moebius[],
      value: Moebius
    ): Moebius | undefined {
      const xinv = value.inv();
      const ind = this.indicator;
      return list.find((value: Moebius) => {
        return ind(level, value.mul(xinv));
      });
    }

    /**
     * ! Internal function !
     * Find coset representatives.
     * The function yields multiple times. The yields are either ignored or used to
     * create a non-blocking async function.
     * @param level Level of the congruence subgroup.
     * @returns A list of coset representatives.
     */
    *_cosetRepresentatives(level: number): Generator<void, Moebius[], void> {
      if (!Number.isInteger(level) || level <= 0) throw "Invalid Level";

      const generators = [
        new Moebius(0, -1, 1, 0),
        new Moebius(1, 1, 0, 1),
        new Moebius(1, -1, 0, 1),
      ];
      const group = this;
      const reprs = [new Moebius(1, 0, 0, 1)];

      var checks: Moebius[] = [];
      var seeds: Moebius[] = [];
      var added = [new Moebius(1, 0, 0, 1)];

      while (added.length > 0) {
        checks = seeds;
        seeds = added;
        added = [];

        for (let s of seeds) {
          for (let g of generators) {
            // May yield controll to main thread in async execution
            yield;

            let n = s.mul(g);
            if (
              group.findCosetIndex(level, checks, n) == -1 &&
              group.findCosetIndex(level, added, n) == -1 &&
              group.findCosetIndex(level, seeds, n) == -1
            ) {
              reprs.push(n);
              added.push(n);
            }
          }
        }
      }
      return reprs;
    }

    /**
     * Get a list of cosetRepresentatives.
     * @param level The level of the group.
     * @returns The list of cosetRepresentatives.
     */
    cosetRepresentatives(level: number): Moebius[] {
      let generator = this._cosetRepresentatives(level);
      let it;
      do it = generator.next();
      while (!it.done);
      return it.value;
    }

    /**
     * Get a list of cosetRepresentatives.
     * Function may yield control and resume next frame
     * if the computation takes too long.
     * @param level The level.
     * @param ao The AsyncOptions to use.
     * @returns A Promise for the list of coset representatives.
     */
    async cosetRepresentativesAsync(
      level: number,
      ao: AsyncOptions = DefaultAsyncOptions()
    ): Promise<Moebius[]> {
      return wrap.callWrapped(this, this._cosetRepresentatives, [level], ao);
    }

    /**
     * @returns TeX representation of this Group.
     */
    toTeX() {
      return this.tex;
    }
  }

  function _mod_eq(v1: number, v2: number, modulus: number) {
    return (v1 - v2) % modulus === 0;
  }

  function _gamma_0_indicator(level: number, value: Moebius) {
    return _mod_eq(value.m[2], 0, level);
  }

  function _gamma_1_indicator(level: number, value: Moebius) {
    return (
      _mod_eq(value.m[2], 0, level) &&
      (_mod_eq(value.m[0], 1, level) || _mod_eq(value.m[0], -1, level))
    );
  }

  function _gamma_indicator(level: number, value: Moebius) {
    return (
      _mod_eq(value.m[2], 0, level) &&
      _mod_eq(value.m[1], 0, level) &&
      (_mod_eq(value.m[0], 1, level) || _mod_eq(value.m[0], -1, level))
    );
  }

  /**
   * The congruence subgroup $\Gamma_0$ that satisfies following congruences.
   *
   * $M \equiv \begin{pmatrix} ? & ? \\ 0 & ? \end{pmatrix}$.
   */
  export const Gamma_0 = new CongruenceSubgroup(
    _gamma_0_indicator,
    "\\Gamma_0"
  );
  /**
   * The congruence subgroup $\Gamma_0$ that satisfies following congruences.
   *
   * $M \equiv \begin{pmatrix} 1 & ? \\ 0 & 1 \end{pmatrix}$.
   */
  export const Gamma_1 = new CongruenceSubgroup(
    _gamma_1_indicator,
    "\\Gamma_1"
  );
  /**
   * The congruence subgroup $\Gamma_0$ that satisfies following congruences.
   *
   * $M \equiv \begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}$.
   */
  export const Gamma = new CongruenceSubgroup(_gamma_indicator, "\\Gamma");
  Gamma.cosetRepresentatives = function (level: number): Moebius[] {
    let gamma_1_coset = Gamma_1.cosetRepresentatives(level);
    let coset: Moebius[] = [];

    for (let i = 0; i < level; i++) {
      let shift = new Moebius(1, i, 0, 1);
      coset.push(...gamma_1_coset.map((m) => shift.mul(m)));
    }

    return coset;
  };

  /**
   * The cosets for the group $\Gamma$ can be computed more effectively.
   * They are multiple different shifts of the cosets of $\Gamma_1$.
   */
  Gamma._cosetRepresentatives = function* (level) {
    let gamma_1_coset = yield* Gamma_1._cosetRepresentatives(level);
    let coset: Moebius[] = [];
    for (let i = 0; i < level; i++) {
      yield;
      let shift = new Moebius(1, i, 0, 1);
      coset.push(...gamma_1_coset.map((m) => shift.mul(m)));
    }
    return coset;
  };

  export type FundamentalDomain = {
    /**
     * The complex corner points of the domain.
     * Boundary is given by hyperbolic lines between them.
     */
    corners: (Complex | oo)[];
    /**
     * Find the coset that contains the given complex value.
     */
    findCosetOf: (value: Complex) => Moebius | undefined;
  };

  const e_pi_3 = new Complex(Math.cos(Math.PI / 3), Math.sin(Math.PI / 3));
  /**
   * Fundamental domain with the following definition.
   * $\{z \in \mathbb{C} : |z| \geq 1 && -0.5 <= \Re z <= 0.5 \}$
   */
  export const Domain1: FundamentalDomain = {
    corners: [
      oo,
      e_pi_3,
      new Complex(0.0, 1.0),
      new Complex(-e_pi_3.real, e_pi_3.imag),
    ],
    findCosetOf(value: Complex, maxIter: number = 100) {
      if (value.imag <= 0) return undefined;

      let result = new Moebius(1, 0, 0, 1);
      let current = value;

      for (var i = 0; i < maxIter; i++) {
        if (current == oo) return result.inv();

        var n = Math.floor(current.real + 0.5);
        result = new Moebius(1, -n, 0, 1).mul(result);
        current = result.transform(value) as Complex;

        if (current.abs2() >= 1) {
          return result.inv();
        }

        result = new Moebius(0, 1, -1, 0).mul(result);
        current = result.transform(value) as Complex;
      }
      console.log("Max iterations in 'findMoebiousToFund' reached");
      return undefined;
    },
  };
}
