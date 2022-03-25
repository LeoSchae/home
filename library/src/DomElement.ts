export function Element<K extends keyof HTMLElementTagNameMap>(
  name: K,
  children: (string | Node)[] | { __html: string } = [],
  attrs: {
    [key: string]: string | number;
  } = {},
  events: {
    [key in keyof GlobalEventHandlers]?: GlobalEventHandlers[key];
  } = {}
): HTMLElementTagNameMap[K] {
  let el = document.createElement(name);

  for (let [k, v] of Object.entries(attrs)) {
    switch (typeof v) {
      case "number":
        v = ("" + v) as any;
      case "string":
        el.setAttribute(k, v as any);
        break;
      default:
        // Global event handlers
        (el as any)[k] = v;
    }
  }

  if (Array.isArray(children))
    for (var c of children) {
      if (typeof c === "string") c = document.createTextNode(c);
      el.append(c);
    }
  else el.innerHTML = children.__html;
  return el;
}
