// @ts-ignore
import Eleventy from "@11ty/eleventy/src/Eleventy";
import * as fs from "fs";
import * as ESBuild from "./plugins/esbuild";
import * as PostCSS from "./plugins/postcss";
import * as Logging from "./plugins/logging";
import Navigation from "./plugins/navigation";
import Inline from "./plugins/inline";
import { build } from "esbuild";

(global as any).DEBUG = true;

(async function () {
  const environment =
    process.env.NODE_ENV === "development" ? "development" : "production";
  const build_dir = "./_build";

  const esbuildOptions =
    environment === "production"
      ? {
          minify: true,
          sourcemap: false,
        }
      : {
          minify: false,
          sourcemap: "inline",
        };

  let eleventy = new Eleventy("./website/", build_dir, {
    config: function (eleventyConfig: any) {
      (global as any).eleveventy = eleventyConfig;
      eleventyConfig.setWatchJavaScriptDependencies(false);
      eleventyConfig.addGlobalData(
        "isProduction",
        environment === "production"
      );

      eleventyConfig.on(
        "eleventy.before",
        () =>
          new Promise((resolve, reject) => {
            fs.rm(build_dir, { recursive: true, force: true }, (err) => {
              if (err) reject(err);
              else resolve(undefined);
            });
          })
      );

      eleventyConfig.addWatchTarget("./library/", "./inline/");

      // Passthrough
      eleventyConfig.addPassthroughCopy("website/fonts/");

      // Template formats
      eleventyConfig.setTemplateFormats(["njk", "md", "pcss", "ts", "tsx"]);

      eleventyConfig.addPlugin(Logging.EleventyPlugin, {});

      eleventyConfig.addPlugin(Inline, { inherit: ["pcss", "ts"] });

      eleventyConfig.addPlugin(Navigation, {});

      eleventyConfig.addPlugin(ESBuild.EleventyPlugin, {
        build: esbuildOptions,
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
            if (page.url == site) return "/home" + site;
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
            if (page.url == site) return "/home" + site;
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
            if (page.url == site) return "/home" + site;
          }
          throw Error("Linked site '" + site + "' not found!");
        }
      );
    },
  });
  eleventy.setPathPrefix("/home/");

  switch (environment) {
    case "development":
      await eleventy.init();
      await eleventy.watch();
      eleventy.serve(8080);
      break;
    case "production":
      await eleventy.write();
      break;
    default:
      let assertUnreachable: never = environment;
      break;
  }
})();
