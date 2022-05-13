import type * as types from "./types";
import * as fs from "fs";
import * as ESBuild from "./plugins/esbuild";
import * as PostCSS from "./plugins/postcss";
import Essentials from "./plugins/essentials";
import * as html_min from "html-minifier";
import Navigation from "./plugins/navigation";
import Inline from "./plugins/inline";

module.exports = function (eleventyConfig: types.EleventyConfig | any) {
  const environment =
    process.env.NODE_ENV === "development" ? "development" : "production";
  const isDevelopment = environment === "development";
  const isProduction = !isDevelopment;

  const options = {
    build_dir: "./_build",
    output: {
      minify: isProduction,
      sourcemap: isDevelopment,
    },
  };

  eleventyConfig.setServerOptions({
    module: "@11ty/eleventy-server-browsersync",

    // Default Browsersync options shown:
    port: 8080,
    open: false,
    notify: false,
    ui: false,
    ghostMode: false,
  });

  eleventyConfig.setWatchJavaScriptDependencies(false);
  eleventyConfig.addGlobalData("isProduction", isProduction);
  eleventyConfig.addGlobalData("isDevelopment", isDevelopment);
  eleventyConfig.addGlobalData("layout", "sideNavigation.njk");

  eleventyConfig.on(
    "eleventy.before",
    () =>
      new Promise((resolve, reject) => {
        fs.rm(options.build_dir, { recursive: true, force: true }, (err) => {
          if (err) reject(err);
          else resolve(undefined);
        });
      })
  );

  eleventyConfig.addWatchTarget("./library/", "./inline/");

  // Passthrough
  eleventyConfig.addPassthroughCopy("website/katex/");

  // Template formats
  eleventyConfig.setTemplateFormats(["njk", "md", "pcss", "ts", "tsx"]);

  eleventyConfig.addPlugin(Essentials, {});

  eleventyConfig.addPlugin(Inline, { inherit: ["pcss", "ts"] });

  eleventyConfig.addPlugin(Navigation, {});

  eleventyConfig.addPlugin(ESBuild.EleventyPlugin, {
    build: {
      minify: options.output.minify,
      sourcemap: options.output.sourcemap ? "inline" : false,
    },
    plugins: [
      ESBuild.ConstImports(),
      ESBuild.CSSImports(
        options.output.minify ? [require("postcss-minify")] : []
      ),
    ],
  });

  eleventyConfig.addPlugin(PostCSS.EleventyPlugin, {
    plugins: [
      require("postcss-minify"),
      require("postcss-nested"),
      require("postcss-simple-vars"),
      require("postcss-mixins"),
      require("postcss-import"),
    ],
  });

  if (options.output.minify)
    eleventyConfig.addTransform(
      "html-minifier",
      function (content: string, outPath: string) {
        console.log(outPath);
        if (outPath.endsWith(".html"))
          return html_min.minify(content, {
            removeComments: true,
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
          });
        return content;
      }
    );

  /**
   * Shortcode to check if a url is present within a collection on pages
   */
  eleventyConfig.addNunjucksShortcode(
    "urlCheck",
    function (this: any, site: string) {
      for (let page of this.ctx.collections.all) {
        if (page.url == site) return "/home" + site;
      }
      eleventyConfig.javascriptFunctions.warn.call(
        this,
        "Linked site '" + site + "' not found!"
      );
      return "/home" + site;
    }
  );
  /**
   * Shortcode to check if a url is present within a collection on pages
   */
  eleventyConfig.addJavaScriptFunction(
    "urlCheck",
    function (this: any, site: string) {
      for (let page of this.ctx.collections.all) {
        if (page.url == site) return "/home" + site;
      }
      (this as any).warn("Linked site '" + site + "' not found!");
      return "/home" + site;
    }
  );
  /**
   * Shortcode to check if a url is present within a collection on pages
   */
  eleventyConfig.addLiquidShortcode(
    "urlCheck",
    function (this: any, site: string, all: any[]) {
      for (let page of all) {
        if (page.url == site) return "/home" + site;
      }
      eleventyConfig.javascriptFunctions.warn.call(
        this,
        "Linked site '" + site + "' not found!"
      );
      return "/home" + site;
    }
  );

  return {
    pathPrefix: "/home/",
    dir: {
      input: "./website/",
      output: options.build_dir,
    },
  };
};
