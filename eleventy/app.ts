// @ts-ignore
import Eleventy, { EleventyRenderPlugin } from "@11ty/eleventy/src/Eleventy";
import * as ESBuild from "./plugins/esbuild";
import PCSSPlugin, { ESBuildPostCSS } from "./plugins/postcss";
import Navigation from "./plugins/navigation";
import Inline from "./plugins/inline";

(global as any).DEBUG = true;

(async function () {
  let eleventy = new Eleventy("./website/", "./_build", {
    config: function (eleventyConfig: any) {
      (global as any).eleveventy = eleventyConfig;

      eleventyConfig.addPassthroughCopy("website/fonts/");
      //eleventyConfig.setQuietMode(true);
      eleventyConfig.setWatchJavaScriptDependencies(false);
      eleventyConfig.setTemplateFormats(["njk", "md", "pcss", "ts"]);

      eleventyConfig.addPlugin(Inline, { inherit: ["pcss", "ts"] });
      eleventyConfig.addPlugin(Navigation);

      eleventyConfig.addWatchTarget("./library/", "./inline/");
      eleventyConfig.addPlugin(ESBuild.EleventyPlugin, {
        build: { plugins: [ESBuildPostCSS([require("postcss-minify")])] },
        plugins: [ESBuild.ESBuildConstImport],
      });
      eleventyConfig.addPlugin(PCSSPlugin, {
        plugins: [
          require("postcss-minify"),
          require("postcss-nested"),
          require("postcss-simple-vars"),
          require("postcss-mixins"),
          require("postcss-import"),
        ],
      });
      eleventyConfig.addPlugin(EleventyRenderPlugin);

      /**
       * Shortcode to check if a url is present within a collection on pages
       */
      eleventyConfig.addShortcode(
        "urlCheck",
        function (site: string, possibleTarget: any[]) {
          for (let page of possibleTarget) {
            if (page.url == site) return site;
          }
          throw Error("Linked site '" + site + "' not found!");
        }
      );

      eleventyConfig.addFilter("warn", function (this: any, data: any) {
        console.log(`[warning] ${data} (${this.ctx.page.inputPath})`);
      });

      eleventyConfig.on("eleventy.before", () => {
        //console.log(eleventyConfig.extensionMap);
      });
    },
  });

  await eleventy.init();
  await eleventy.watch();
  eleventy.serve(8080);
})();
