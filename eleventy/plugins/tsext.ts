import pathlib from "path";
import * as ESBuild from "esbuild";

/**
 * @param {import("@11ty/eleventy/src/UserConfig")} eleventyConfig
 * @param {object} param1
 * @param {string[]=} param1.ignores
 * @param {ESBuild.BuildOptions=} param1.build
 */
export default function (
  eleventyConfig: any,
  { plugins = [] }: { plugins: ESBuild.Plugin[] }
) {
  console.log("hjasgjhasgjhasjdhgjdhas");
  eleventyConfig.addExtension("ts", {
    read: false,
    getData: true,
    init() {
      for (var key of Object.keys(require.cache)) delete require.cache[key];
    },
    getInstanceFromInputPath: async function (path: string) {
      if (!path.endsWith(".11ty.ts")) return {};
      let mod = require(pathlib.resolve(path));
      return mod;
    },
    compile: async function (contents: undefined, path: string) {
      if (path.endsWith(".11ty.ts")) {
        let mod = require(pathlib.resolve(path));
        return async function (this: any, data: any) {
          console.log(eleventyConfig.javascriptFunctions);
          if ("render" in mod) {
            return await mod.render.call(
              eleventyConfig.javascriptFunctions,
              data
            );
          }
          return mod.default;
        };
      } else {
        const res = await ESBuild.build({
          plugins: plugins,
          entryPoints: [path],
          bundle: true,
          sourcemap: "inline",
          minify: false,
          write: false,
          define: {
            DEBUG: "true",
          },
        });
        return function () {
          return res.outputFiles[0].text;
        };
      }
    },
    compileOptions: {
      permalink(contents: string, path: string) {
        return (data: any) => {
          let p = data.page.filePathStem;
          return p.endsWith(".11ty")
            ? p.substring(0, p.length - 5) + "/index.html"
            : p + ".js";
        };
      },
    },
  });
}
