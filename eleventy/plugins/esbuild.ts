import pathlib from "path";
import PostCSS from "postcss";
import { readFile } from "fs/promises";
import * as ESBuild from "esbuild";

const defaultBuildOptions: ESBuild.BuildOptions = {
  sourcemap: false,
  minify: true,
  define: {
    "global.DEBUG": "false",
  },
};

/**
 * Generates bindings for javascript functions and eleventy data.
 * @param javascriptFunctions The js functions provided by `this`.
 * @param ctx The eleventy data provided via `this.ctx`.
 * @returns The required this element.
 */
function thisBindings(javascriptFunctions: any, ctx: any): EleventyThis {
  let bindings: any = {};
  for (var [k, v] of Object.entries(javascriptFunctions))
    bindings[k] = (v as any).bind(bindings);
  bindings.ctx = ctx;
  return bindings;
}

function instanceTypeOf(path: string): "11ty" | "ts" {
  return path.endsWith(".11ty.ts") ? "11ty" : "ts";
}

async function bundleImport(options: ESBuild.BuildOptions) {
  const res = await ESBuild.build({
    ...defaultBuildOptions,
    ...options,
    bundle: true,
    write: false,
  });
  return res.outputFiles[0].text;
}

/**
 *
 * @param eleventyConfig
 * @param options
 * @param options.build The build options provided to a file.
 */
export function EleventyPlugin(
  eleventyConfig: any,
  options: {
    build: ESBuild.BuildOptions;
    plugins?: ((config: any, data: any) => ESBuild.Plugin)[];
  }
) {
  /**
   * Function that bundles a script. Should be invoked from .njk or .11ty.ts files.
   * @param this The this context from eleventy build.
   */
  async function eleventyBundledImport(this: EleventyThis, script: string) {
    if (!this.ctx)
      throw new Error("This value is missing eleventy data in 'ctx' field");
    if (this.verbose) (this as any).verbose(`Bundling ${script}`);
    let fullOptions: ESBuild.BuildOptions = {
      ...options.build,
      entryPoints: [script],
    };
    fullOptions.plugins = [
      ...(options.plugins || []).map((pl: any) => pl(eleventyConfig, this.ctx)),
      ...(fullOptions.plugins || []),
    ];
    return await bundleImport(fullOptions);
  }

  eleventyConfig.addNunjucksAsyncShortcode(
    "bundledScript",
    eleventyBundledImport
  );
  eleventyConfig.addJavaScriptFunction("bundledScript", eleventyBundledImport);

  let instanceCache: any = {};
  eleventyConfig.addExtension("ts", {
    read: false,
    getData: true,
    init() {
      instanceCache = {};
      // clear cache before build
      for (var key of Object.keys(require.cache)) delete require.cache[key];
    },
    getInstanceFromInputPath: async function (path: string) {
      switch (instanceTypeOf(path)) {
        case "11ty":
          // Return the module instance for .11ty.ts content.
          if (instanceCache[path]) return instanceCache[path];
          let inst = (instanceCache[path] = require(pathlib.resolve(path)));
          return inst;
        case "ts":
          return {};
      }
    },
    compile: async function (contents: undefined, path: string) {
      switch (instanceTypeOf(path)) {
        case "11ty":
          // Compile file as .11ty.ts content
          let module = require(pathlib.resolve(path));
          return async function (this: any, data: any) {
            if ("render" in module) {
              return await module.render.call(
                thisBindings(eleventyConfig.javascriptFunctions, data),
                data
              );
            }
            return module.default;
          };
        case "ts":
          // Compile file as .ts content
          return async function (this: any, data: any) {
            eleventyBundledImport.call(
              thisBindings(eleventyConfig.javascriptFunctions, data),
              path
            );
          };
      }
    },
    compileOptions: {
      permalink(contents: string, path: string) {
        return async (data: any): Promise<string> => {
          //console.log(data);
          let permalink = data.permalink;
          if (typeof permalink === "function")
            permalink = await permalink.call(
              thisBindings(eleventyConfig.javascriptFunctions, data),
              data
            );
          // Use permalink if it is provided
          if (permalink) return permalink;

          permalink = data.page.filePathStem;

          switch (instanceTypeOf(path)) {
            case "11ty":
              return (
                permalink.substring(0, permalink.length - 5) + "/index.html"
              );
            case "ts":
              return permalink + ".js";
          }
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
export function ConstImports() {
  return function (eleventyConfig: any, templateData: any): ESBuild.Plugin {
    return {
      name: "ConstTSImports",
      setup: function (build) {
        build.onLoad({ filter: /.const.ts/ }, async function (data) {
          let module = require(data.path);

          if (typeof module.default === "function")
            await module.default.call(
              thisBindings(eleventyConfig.javascriptFunctions, templateData),
              templateData
            );
          let consts = JSON.stringify(module);
          return { contents: consts, loader: "json" };
        });
      },
    };
  };
}

export function CSSImports(plugins: any[] = []): () => ESBuild.Plugin {
  const postcss = PostCSS(plugins);
  return function () {
    return {
      name: "ImportCSS",
      setup: function (build: any) {
        build.onLoad({ filter: /.css/ }, async function (data: any) {
          let content = await readFile(data.path, {
            encoding: "utf-8",
          });
          let res = await postcss.process(content, {
            from: data.path,
          });
          return { contents: res.css, loader: "text" };
        });
      },
    };
  };
}
