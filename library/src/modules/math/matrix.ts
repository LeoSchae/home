export class Matrix22 {
  m: [number, number, number, number];

  static rotation(turns: number) {
    let cos = Math.cos(2 * Math.PI * turns);
    let sin = Math.sin(2 * Math.PI * turns);
    return new Matrix22(cos, -sin, sin, cos);
  }

  constructor(a: number, b: number, c: number, d: number);
  constructor(m: [number, number, number, number]);
  constructor(
    a: number | [number, number, number, number],
    b?: number,
    c?: number,
    d?: number
  ) {
    if (Array.isArray(a)) this.m = [a[0], a[1], a[2], a[3]];
    else this.m = [a, b, c, d] as [number, number, number, number];
  }

  get det() {
    let m = this.m;
    return m[0] * m[3] - m[1] * m[2];
  }

  get I() {
    let d = this.det;
    if (d === 0) throw new Error("Determinant is 0");
    d = 1 / d;
    let m = this.m;
    return new Matrix22(d * m[3], -d * m[1], -d * m[2], d * m[0]);
  }

  get T() {
    let m = this.m;
    return new Matrix22(m[0], m[2], m[1], m[3]);
  }

  mul(r: Matrix22) {
    let m = this.m;
    let n = r.m;
    return new Matrix22(
      m[0] * n[0] + m[1] * n[2],
      m[0] * n[1] + m[1] * n[3],
      m[2] * n[0] + m[3] * n[2],
      m[2] * n[1] + m[3] * n[3]
    );
  }

  of(v: [number, number]): [number, number] {
    let m = this.m;
    return [m[0] * v[0] + m[1] * v[1], m[2] * v[0] + m[3] * v[1]];
  }
}
