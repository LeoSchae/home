export class XML {
  children: (XML | string)[];
  attributes: { [key: string]: string | number };

  constructor(
    public name: string,
    attributes?: { [key: string]: string | number },
    ...children: (XML | string)[]
  ) {
    this.children = children;
    this.attributes = attributes || {};
  }

  applyAttributes(...args: { [key: string]: string | number }[]) {
    for (let attributes of args) Object.assign(this.attributes, attributes);
  }

  removeAttributes(...names: string[]) {
    for (let k of names) delete this.attributes[k];
  }

  private attrString() {
    return Object.entries(this.attributes)
      .map(([k, v]) => `${k}="${v}"`)
      .join(" ");
  }

  private chString(): string {
    return this.children.map((v) => v.toString()).join("");
  }

  append(...childred: (XML | string)[]) {
    this.children.push(...childred);
  }

  toString(): string {
    let name = this.name;
    if (name === "") return this.chString();
    return `<${name} ${this.attrString()}>${this.chString()}</${name}>`;
  }
}

export function jsx(
  name: string | ((props: any, ...children: any) => XML),
  props: { [key: string]: string | number },
  ...children: any[]
): XML {
  if (typeof name === "function") return name(props, ...children);
  return new XML(name, props, ...children);
}
jsx.Fragment = "";

export declare namespace jsx.JSX {
  type Element = XML;
  type IntrinsicElements = {
    [key: string]: {
      [key: string]: string | number;
    };
  };
}
