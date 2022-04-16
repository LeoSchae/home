// @ts-ignore
import Eleventy from "@11ty/eleventy/src/Eleventy";
import * as ESBuild from "./plugins/esbuild";
import * as PostCSS from "./plugins/postcss";
import * as Logging from "./plugins/logging";
import Navigation from "./plugins/navigation";
import Inline from "./plugins/inline";

(global as any).DEBUG = true;

(async function () {
  let eleventy = new Eleventy("./website/", "./_build", {
    config: function (eleventyConfig: any) {
      (global as any).eleveventy = eleventyConfig;
      eleventyConfig.setWatchJavaScriptDependencies(false);

      eleventyConfig.addWatchTarget("./library/", "./inline/");

      // Passthrough
      eleventyConfig.addPassthroughCopy("website/fonts/");
      eleventyConfig.addPassthroughCopy("website/favicon.svg");

      // Template formats
      eleventyConfig.setTemplateFormats(["njk", "md", "pcss", "ts", "tsx"]);

      eleventyConfig.addPlugin(Logging.EleventyPlugin, {});

      eleventyConfig.addPlugin(Inline, { inherit: ["pcss", "ts"] });

      eleventyConfig.addPlugin(Navigation, {});

      eleventyConfig.addPlugin(ESBuild.EleventyPlugin, {
        build: {
          minify: false,
          sourcemap: "inline",
        },
        plugins: [
          ESBuild.ConstImports(),
          ESBuild.CSSImports([require("postcss-minify")]),
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

      /**
       * Shortcode to check if a url is present within a collection on pages
       */
      eleventyConfig.addNunjucksShortcode(
        "urlCheck",
        function (this: EleventyThis, site: string) {
          for (let page of this.ctx.collections.all) {
            if (page.url == site) return site;
          }
          throw Error("Linked site '" + site + "' not found!");
        }
      );
      /**
       * Shortcode to check if a url is present within a collection on pages
       */
      eleventyConfig.addJavaScriptFunction(
        "urlCheck",
        function (this: EleventyThis, site: string) {
          for (let page of this.ctx.collections.all) {
            if (page.url == site) return site;
          }
          throw Error("Linked site '" + site + "' not found!");
        }
      );
      /**
       * Shortcode to check if a url is present within a collection on pages
       */
      eleventyConfig.addLiquidShortcode(
        "urlCheck",
        function (site: string, all: EleventyPage[]) {
          for (let page of all) {
            if (page.url == site) return site;
          }
          throw Error("Linked site '" + site + "' not found!");
        }
      );
    },
  });

  await eleventy.init();
  await eleventy.watch();
  eleventy.serve(8080);
})();
