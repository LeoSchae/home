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

  private attrString() {
    return Object.entries(this.attributes)
      .map(([k, v]) => `${k}="${v}"`)
      .join(" ");
  }

  private chString(): string {
    return this.children.map((v) => v.toString()).join("");
  }

  append(child: XML | string) {
    this.children.push(child);
  }

  toString(): string {
    let name = this.name;
    if (name === "") return this.chString();
    return `<${name} ${this.attrString()}>${this.chString()}</${name}>`;
  }
}

export function jsx(
  name: string,
  attributes: { [key: string]: string | number },
  ...children: any[]
): XML {
  return new XML(name, attributes, ...children);
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
