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

  for (let [k, v] of Object.entries(attrs))
    el.setAttribute(k, typeof v === "string" ? v : v + "");
  for (let [k, v] of Object.entries(events)) (el as any)[k] = v;

  if (Array.isArray(children))
    for (var c of children) {
      if (typeof c === "string") c = document.createTextNode(c);
      el.append(c);
    }
  else el.innerHTML = children.__html;
  return el;
}

function deepChildren(el: HTMLElement | DocumentFragment, children: any[]) {
  for (var c of children) {
    if (Array.isArray(c)) deepChildren(el, c);
    else el.append(c instanceof Node ? c : "" + c);
  }
}

export function jsx(
  name: string,
  attrs: jsx.JSX.IntrinsicElements[""],
  ...children: any[]
): HTMLElement;
export function jsx(
  name: string,
  attrs: jsx.JSX.IntrinsicElements[""],
  ...children: any[]
): HTMLElement | DocumentFragment {
  if (name === jsx.Fragment) {
    let el = document.createDocumentFragment();
    deepChildren(el, children);
    return el;
  }
  let el = document.createElement(name);
  attrs = attrs || {};

  if ("__html" in attrs) {
    el.innerHTML = "" + attrs.__html;
    delete attrs.__html;
  }

  for (var [k, v] of Object.entries(attrs)) {
    if (typeof v === "function") {
      (el as any)[k] = v;
    } else {
      el.setAttribute(k, "" + v);
    }
  }

  deepChildren(el, children);
  return el;
}
jsx.Fragment = "";

export declare namespace jsx.JSX {
  type Element = HTMLElement;
  type IntrinsicElements = {
    [key: string]: {
      [key: string]: string | number | ((...args: any) => any) | undefined;
    } & {
      [key in keyof GlobalEventHandlers]?:
        | GlobalEventHandlers[key]
        | string
        | number;
    } & { __html?: string };
  };
}
