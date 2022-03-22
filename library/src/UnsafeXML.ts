export class Element {
  children: (Element | string)[];

  constructor(
    public name: string,
    public attributes: { [key: string]: string | number } = {},
    ...children: (Element | string)[]
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

  append(child: Element | string) {
    this.children.push(child);
  }

  toString(): string {
    return `<${this.name} ${this.attrString()}>${this.chString()}</${
      this.name
    }>`;
  }
}
