import { HyperbolicContext } from "@lib/modules/painter";

type Tool<O> = {
  [key: string]: (this: O, ...args: any) => unknown;
};

type Tools<O> = {
  [key: string]: Tool<O>;
};

class TooledObject<O, T extends Tools<O>> {
  constructor(public object: O, public tools: T) {}

  use<K extends keyof T>(tool: K): T[K] {
    return this.tools[tool];
  }
}

let hyperbolicTools = {
  draw(s: string, x: number) {},
} as const;
type hyperbolicTools = typeof testTools;

let testTools = {
  test(s: number, x: string) {},
} as const;
type testTools = typeof testTools;

let t = { hyperbolic: hyperbolicTools, tes: testTools } as const;
