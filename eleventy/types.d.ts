export type Page = {
  url?: string;
};
export type TemplateCtx = {
  page?: Page;
  collections?: Page[];
};

/* Templating environments */
export type NunjucksCTX = {
  ctx: TemplateCtx;
};
export type LiquidCTX = {
  context: {
    environments: TemplateCtx;
  };
};
export type HandlebarsCTX = TemplateCtx;
export type JsCTX = TemplateCtx;
export type AnyCTX = LiquidCTX | NunjucksCTX | HandlebarsCTX | JsCTX;

/** Filter type */
export type Filter<CTX> = (this: CTX, ...args: any[]) => any;

export namespace Extension {
  export type Compile = (
    content: string,
    inputPath: string
  ) => Render | Promise<Render> | void | Promise<void>;
  export type Render = (data: unknown) => string | Promise<String>;
}
export type Extension = {
  outputFileExtension?: string;
  read?: boolean;
  init?: (this: Config) => void | Promise<void>;
  compile: Extension.Compile;

  //data
  getData?:
    | boolean
    | string[]
    | (() => { [key: string]: any } | Promise<{ [key: string]: any }>);
  getInstanceFromInputPath?(inputPath: string): {
    [key: string]: any;
  };
  compileOptions?: {
    permalink?(contents: string, inputPath: string): string | false;
  };
};

export type Config = {
  addPlugin<F extends (config: Config, ...args: any[]) => any>(
    plugin: F,
    ...args: F extends (config: Config, ...args: infer ARGS) => any
      ? ARGS
      : unknown[]
  ): unknown;

  on(
    event: "eleventy.before",
    handler: (options: {
      dir: {
        input: string;
        output: string;
        includes: string;
        data: string;
        layouts?: string;
      };
      runMode: "build" | "watch" | "serve";
      outputMode: "fs" | "json" | "ndjson";
    }) => any
  ): unknown;
  on(
    event: "eleventy.after",
    handler: (options: {
      dir: {
        input: string;
        output: string;
        includes: string;
        data: string;
        layouts?: string;
      };
      results: {
        inputPath: string;
        outputPath: string;
        url: string;
        content: string;
      }[];
      runMode: "build" | "watch" | "serve";
      outputMode: "fs" | "json" | "ndjson";
    }) => any
  ): unknown;

  // Filters and Shortcodes

  addJavaScriptFunction(name: string, filter: Filter<JsCTX>): unknown;

  addLiquidFilter(name: string, filter: Filter<LiquidCTX>): unknown;
  addNunjucksFilter(name: string, filter: Filter<NunjucksCTX>): unknown;
  addHandlebarsHelper(name: string, filter: Filter<HandlebarsCTX>): unknown;
  addFilter(name: string, filter: Filter<AnyCTX>): unknown;

  addLiquidShortcode(name: string, shortcode: Filter<LiquidCTX>): unknown;
  addNunjucksShortcode(name: string, shortcode: Filter<NunjucksCTX>): unknown;
  addHandlebarsShortcode(
    name: string,
    shortcode: Filter<HandlebarsCTX>
  ): unknown;
  addShortcode(name: string, shortcode: Filter<AnyCTX>): unknown;

  javascriptFunctions: { [key: string]: Filter<JsCTX> | undefined };
  nunjucksFilters: { [key: string]: Filter<NunjucksCTX> | undefined };
  liquidFilters: { [key: string]: Filter<LiquidCTX> | undefined };
  handlebarsHelpers: { [key: string]: Filter<HandlebarsCTX> | undefined };

  // Data

  addGlobalData(name: string, value: any): unknown;

  addLayoutAlias(from: string, to: string): unknown;

  // Watch / Serve / Pass

  setWatchJavaScriptDependencies(value: boolean): unknown;
  addWatchTarget(target: string): unknown;

  addPassthroughCopy(target: string): unknown;
  setTemplateFormats(formats: string | string[]): unknown;
  addTemplateFormats(formats: string | string[]): unknown;

  addTransform(
    name: string,
    transform: (
      this: { inputPath: string; outputPath: string },
      content: string
    ) => string | Promise<string>
  ): unknown;

  addExtension(ext: string, handler: Extension): unknown;
};
export type ConfigReturn = {
  templateFormats?: string[];
  dataTemplateEngine?: string;
  markdownTemplateEngine?: string;
  htmlTemplateEngine?: string;

  jsDataFileSuffix?: string;

  pathPrefix?: string;
  dir?: {
    input?: string;
    output?: string;
    includes?: string;
    layouts?: string;
    data?: string;
  };
};
