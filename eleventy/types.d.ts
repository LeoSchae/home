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

  on(event: string, handler: () => any);

  addLiquidFilter(name: string, filter: Filter<LiquidCTX>);
  addNunjucksFilter(name: string, filter: Filter<NunjucksCTX>);
  addHandlebarsHelper(name: string, filter: Filter<HandlebarsCTX>);
  addJavaScriptFunction(name: string, filter: Filter<JsCTX>);
  addFilter(name: string, filter: Filter<AnyCTX>);

  addLiquidShortcode(name: string, shortcode: Filter<LiquidCTX>);
  addNunjucksShortcode(name: string, shortcode: Filter<NunjucksCTX>);
  addHandlebarsShortcode(name: string, shortcode: Filter<HandlebarsCTX>);
  addShortcode(name: string, shortcode: Filter<AnyCTX>);

  javascriptFunctions: { [key: string]: Filter<JsCTX> | unknown };
  nunjucksFilters: { [key: string]: Filter<NunjucksCTX> | unknown };
  liquidFilters: { [key: string]: Filter<LiquidCTX> | unknown };
  handlebarsHelpers: { [key: string]: Filter<HandlebarsCTX> | unknown };
};
