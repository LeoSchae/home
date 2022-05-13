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
export type EleventyFilter<CTX> = (this: CTX, args: any[]) => any;

export type EleventyConfig = {
  addPlugin<OPT extends any[]>(
    plugin: (config: EleventyConfig, ...options: OPT) => unknown,
    OPT
  );

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
  );
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
  );

  // Filters and Shortcodes

  addJavaScriptFunction(name: string, filter: Filter<JsCTX>);

  addLiquidFilter(name: string, filter: Filter<LiquidCTX>);
  addNunjucksFilter(name: string, filter: Filter<NunjucksCTX>);
  addHandlebarsHelper(name: string, filter: Filter<HandlebarsCTX>);
  addFilter(name: string, filter: Filter<AnyCTX>);

  addLiquidShortcode(name: string, shortcode: Filter<LiquidCTX>);
  addNunjucksShortcode(name: string, shortcode: Filter<NunjucksCTX>);
  addHandlebarsShortcode(name: string, shortcode: Filter<HandlebarsCTX>);
  addShortcode(name: string, shortcode: Filter<AnyCTX>);

  javascriptFunctions: { [key: string]: Filter<JsCTX> | unknown };
  nunjucksFilters: { [key: string]: Filter<NunjucksCTX> | unknown };
  liquidFilters: { [key: string]: Filter<LiquidCTX> | unknown };
  handlebarsHelpers: { [key: string]: Filter<HandlebarsCTX> | unknown };

  // Data

  addGlobalData(name: string, value: any);

  // Watch / Serve / Pass

  setWatchJavaScriptDependencies(value: boolean);
  addWatchTarget(target: string);

  addPassthroughCopy(target: string);
  setTemplateFormats(formats: string | string[]);

  addTransform(
    name: string,
    transform: (
      this: { inputPath: string; outputPath: string },
      content: string
    ) => string | Promise<string>
  );
};
