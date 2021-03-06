const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  BB_CHARS = [
    ..."๐ธ๐นโ๐ป๐ผ๐ฝ๐พโ๐๐๐๐๐โ๐โโโ๐๐๐๐๐๐๐โค๐๐๐๐๐๐๐๐๐๐๐๐๐๐๐ ๐ก๐ข๐ฃ๐ค๐ฅ๐ฆ๐ง๐จ๐ฉ๐ช๐ซ๐๐๐๐๐๐๐๐๐ ๐ก",
  ],
  FRAK_CHARS = [..."๐ฌ๐ญ๐ฎ๐ฏ๐ฐ๐ฑ๐ฒ๐ณ๐ด๐ต๐ถ๐ท๐ธ๐น๐บ๐ป๐ผ๐ฝ๐พ๐ฟ๐๐๐๐๐๐๐๐๐๐๐๐๐๐๐๐๐๐๐๐๐๐๐๐๐๐๐๐๐๐๐๐"];

export default {
  Alpha: "ฮ",
  alpha: "ฮฑ",
  Beta: "ฮ",
  beta: "ฮฒ",
  Gamma: "ฮ",
  gamma: "ฮณ",
  Delta: "ฮ",
  delta: "ฮด",
  Epsilon: "ฮ",
  epsilon: "ฮต",
  Zeta: "ฮ",
  zeta: "ฮถ",
  Eta: "ฮ",
  eta: "ฮท",
  Theta: "ฮ",
  theta: "ฮธ",
  Iota: "ฮ",
  iota: "ฮน",
  Kappa: "ฮ",
  kappa: "ฮบ",
  Lambda: "ฮ",
  lambda: "ฮป",
  Mu: "ฮ",
  mu: "ฮผ",
  Nu: "ฮ",
  nu: "ฮฝ",
  Xi: "ฮ",
  xi: "ฮพ",
  Omicron: "ฮ",
  omicron: "ฮฟ",
  Pi: "ฮ ",
  pi: "ฯ",
  Rho: "ฮก",
  rho: "ฯ",
  Sigma: "ฮฃ",
  sigma: "ฯ",
  Tau: "ฮค",
  tau: "ฯ",
  Upsilon: "ฮฅ",
  upsilon: "ฯ",
  Phi: "ฮฆ",
  phi: "ฯ",
  Chi: "ฮง",
  chi: "ฯ",
  Psi: "ฮจ",
  psi: "ฯ",
  Omega: "ฮฉ",
  omega: "ฯ",
  mathBB: function (character: string) {
    if (character.length == 1) {
      let i = CHARS.indexOf(character);
      return BB_CHARS[i];
    } else {
      let res = "";
      for (let i = 0; i < character.length; i++) {
        res = res + BB_CHARS[CHARS.indexOf(character.charAt(i))];
      }
      return res;
    }
  },
  mathFrak: function (character: string) {
    if (character.length == 1) {
      let i = CHARS.indexOf(character);
      return FRAK_CHARS[i];
    } else {
      let res = "";
      for (let i = 0; i < character.length; i++) {
        res = res + FRAK_CHARS[CHARS.indexOf(character.charAt(i))];
      }
      return res;
    }
  },
};
