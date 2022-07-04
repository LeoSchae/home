export enum Align {
  C = 0b0000,
  T = 0b1000,
  L = 0b0010,
  R = 0b0001,
  B = 0b0100,
  TL = 0b1010,
  TR = 0b1001,
  BL = 0b0110,
  BR = 0b0101,
}

export namespace Align {
  export function vertical(align: Align): Align.T | Align.C | Align.B {
    return align & 0b1100;
  }

  export function horizontal(align: Align): Align.L | Align.C | Align.R {
    return align & 0b0011;
  }
}
