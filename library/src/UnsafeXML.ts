export class XML {
  children: (XML | string)[];

  constructor(
    public name: string,
    public attributes: { [key: string]: string | number } = {},
    ...children: (XML | string)[]
  ) {
    this.children = children;
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
    return `<${this.name} ${this.attrString()}>${this.chString()}</${
      this.name
    }>`;
  }
}

export function jsx(
  name: string,
  attributes: { [key: string]: string | number },
  ...children: any[]
): XML {
  return new XML(name, attributes, ...children);
}

export declare namespace jsx.JSX {
  type Element = XML;
  type IntrinsicElements = {
    [key: string]: {
      [key: string]: string | number;
    };
  };
}
