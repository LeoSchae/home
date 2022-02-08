export class Element {
  constructor(
    public name: string,
    public attributes: { [key: string]: string | number } = {},
    public children: (Element | string)[] = []
  ) {}

  attrString() {
    return Object.entries(this.attributes)
      .map(([k, v]) => `${k}="${v}"`)
      .join(" ");
  }
  chString(): string {
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
