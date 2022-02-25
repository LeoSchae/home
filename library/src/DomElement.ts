export function Element<K extends keyof HTMLElementTagNameMap>(
  name: K,
  attrs: { [key: string]: string | number } = {},
  children: (string | Node)[] = []
): HTMLElementTagNameMap[K] {
  let el = document.createElement(name);
  for (var [k, v] of Object.entries(attrs))
    el.setAttribute(k, typeof v === "number" ? "" + v : v);
  for (var c of children) {
    if (typeof c === "string") c = document.createTextNode(c);
    el.appendChild(c);
  }
  return el;
}
