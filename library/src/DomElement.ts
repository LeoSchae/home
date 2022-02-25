export function Element<K extends keyof HTMLElementTagNameMap>(
  name: K,
  attrs: { [key: string]: string | number } = {},
  children: (string | Node)[] | { __html: string } = []
): HTMLElementTagNameMap[K] {
  let el = document.createElement(name);
  for (var [k, v] of Object.entries(attrs))
    el.setAttribute(k, typeof v === "number" ? "" + v : v);
  if (Array.isArray(children))
    for (var c of children) {
      if (typeof c === "string") c = document.createTextNode(c);
      el.append(c);
    }
  else el.innerHTML = children.__html;
  return el;
}
