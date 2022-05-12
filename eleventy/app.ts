// @ts-ignore
import Eleventy from "@11ty/eleventy/src/Eleventy";
import * as fs from "fs";
import * as ESBuild from "./plugins/esbuild";
import * as PostCSS from "./plugins/postcss";
import * as Logging from "./plugins/logging";
import * as html_min from "html-minifier";
import Navigation from "./plugins/navigation";
import Inline from "./plugins/inline";

(async function () {
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

  const build_dir = "./_build";

  const esbuildOptions =
    environment === "production"
      ? {
          minify: true, //false ,
          sourcemap: "inline", //false,
        }
      : {
          minify: true,
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
      eleventyConfig.addGlobalData("layout", "sideNavigation.njk");

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
      eleventyConfig.addPassthroughCopy("website/katex/");

      // Template formats
      eleventyConfig.setTemplateFormats(["njk", "md", "pcss", "ts", "tsx"]);

      eleventyConfig.addPlugin(Logging.EleventyPlugin, {});

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
        function (this: EleventyThis, site: string) {
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
        function (this: EleventyThis, site: string) {
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
        function (this: any, site: string, all: EleventyPage[]) {
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
