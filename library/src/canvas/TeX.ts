const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  BB_CHARS = [
    ..."𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡",
  ],
  FRAK_CHARS = [..."𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟"];

console.log(CHARS.length, FRAK_CHARS.length);

export default {
  Alpha: "Α",
  alpha: "α",
  Beta: "Β",
  beta: "β",
  Gamma: "Γ",
  gamma: "γ",
  Delta: "Δ",
  delta: "δ",
  Epsilon: "Ε",
  epsilon: "ε",
  Zeta: "Ζ",
  zeta: "ζ",
  Eta: "Η",
  eta: "η",
  Theta: "Θ",
  theta: "θ",
  Iota: "Ι",
  iota: "ι",
  Kappa: "Κ",
  kappa: "κ",
  Lambda: "Λ",
  lambda: "λ",
  Mu: "Μ",
  mu: "μ",
  Nu: "Ν",
  nu: "ν",
  Xi: "Ξ",
  xi: "ξ",
  Omicron: "Ο",
  omicron: "ο",
  Pi: "Π",
  pi: "π",
  Rho: "Ρ",
  rho: "ρ",
  Sigma: "Σ",
  sigma: "σ",
  Tau: "Τ",
  tau: "τ",
  Upsilon: "Υ",
  upsilon: "υ",
  Phi: "Φ",
  phi: "φ",
  Chi: "Χ",
  chi: "χ",
  Psi: "Ψ",
  psi: "ψ",
  Omega: "Ω",
  omega: "ω",
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
