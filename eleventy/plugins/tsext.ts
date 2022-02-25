import pathlib from "path";
import * as ESBuild from "esbuild";
import { readFile } from "fs";
import { errorMonitor } from "events";

/**
 * Plugin that parses file extensions to bundles or 11ty websites.
 *     .11ty.ts -> .html  (similar to .11ty.js)
 *     .ts -> .js
 * @param eleventyConfig
 * @param options
 * @param options.plugins The ESBuild plugins to use.
 */
export default function (
  eleventyConfig: any,
  { plugins = [] }: { plugins: ESBuild.Plugin[] }
) {
  async function bundleJSImport(this: any, path: string, data: any) {
    if (data === undefined) data = this.ctx;
    const res = await ESBuild.build({
      plugins: [ESBuildConstImport(eleventyConfig, data), ...plugins],
      entryPoints: [path],
      bundle: true,
      sourcemap: "inline",
      minify: false,
      write: false,
      define: {
        DEBUG: "true",
      },
    });
    return res.outputFiles[0].text;
  }

  eleventyConfig.addJavaScriptFunction("bundleJSImport", bundleJSImport);
  eleventyConfig.addNunjucksAsyncShortcode("bundleJSImport", bundleJSImport);

  eleventyConfig.addExtension("ts", {
    read: false,
    getData: true,
    init() {
      // clear cache before build
      for (var key of Object.keys(require.cache)) delete require.cache[key];
    },
    /**
     * Returns the exports if the file is not a ".11ty.js" file
     */
    getInstanceFromInputPath: async function (path: string) {
      if (!path.endsWith(".11ty.ts")) return {};
      let mod = require(pathlib.resolve(path));
      return mod;
    },
    compile: async function (contents: undefined, path: string) {
      if (path.endsWith(".11ty.ts")) {
        // Parse the file to .html similar to .11ty.js
        let mod = require(pathlib.resolve(path));
        return async function (this: any, data: any) {
          if ("render" in mod) {
            return await mod.render.call(
              eleventyConfig.javascriptFunctions,
              data
            );
          }
          return mod.default;
        };
      } else {
        // Bundle using esbuild
        return async function (data: any) {
          const res = await ESBuild.build({
            plugins: [ESBuildConstImport(eleventyConfig, data), ...plugins],
            entryPoints: [path],
            bundle: true,
            sourcemap: "inline",
            minify: false,
            write: false,
            define: {
              DEBUG: "true",
            },
          });
          return res.outputFiles[0].text;
        };
      }
    },
    compileOptions: {
      /**
       * Process the extension to produce correct result.
       */
      permalink(contents: string, path: string) {
        return async (data: any) => {
          if (data.permalink) {
            let p = data.permalink;
            if (typeof p === "function")
              p = await p.call(eleventyConfig.javascriptFunctions, data);
            return p;
          }
          let p = data.page.filePathStem;
          return p.endsWith(".11ty")
            ? p.substring(0, p.length - 5) + "/index.html"
            : p + ".js";
        };
      },
    },
  });
}

/**
 * Plugin that import files with extension ".const.ts" as constant
 * files. The .ts file is executed and all exports are imported
 * as JSON values.
 * This allows preprocessing before a bundle is created.
 */
function ESBuildConstImport(eleventyConfig: any, templateData: any) {
  return {
    name: "TypescriptConstImport",
    setup: function (build: any) {
      build.onLoad({ filter: /.const.ts/ }, async function (data: any) {
        let module = require(data.path);

        if (typeof module.default === "function")
          await module.default.call(
            eleventyConfig.javascriptFunctions,
            templateData
          );
        let consts = JSON.stringify(module);
        return { contents: consts, loader: "json" };
      });
    },
  };
}
