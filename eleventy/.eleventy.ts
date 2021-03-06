import type * as types from "./types";
import katex from "katex";
import * as ESBuild from "./plugins/esbuild";
import * as PostCSS from "./plugins/postcss";
import Essentials from "./plugins/essentials";
import * as html_min from "html-minifier";
import Navigation from "./plugins/navigation";
import Inline from "./plugins/inline";

module.exports = function (eleventyConfig: types.Config): types.ConfigReturn {
  const environment =
    process.env.NODE_ENV === "development" ? "development" : "production";
  const isDevelopment = environment === "development";
  const isProduction = !isDevelopment;
  eleventyConfig.addGlobalData("isProduction", isProduction);
  eleventyConfig.addGlobalData("isDevelopment", isDevelopment);

  const options = {
    build_dir: "./_build",
    output: {
      minify: isProduction,
      sourcemap: isDevelopment,
    },
  };

  // Use browsersync (2.0)
  (eleventyConfig as any).setServerOptions({
    module: "@11ty/eleventy-server-browsersync",

    // Default Browsersync options shown:
    port: 8080,
    open: false,
    notify: false,
    ui: false,
    ghostMode: false,
  });

  eleventyConfig.setWatchJavaScriptDependencies(false);

  // Default layout
  eleventyConfig.addLayoutAlias("default", "sideNavigation.njk");
  eleventyConfig.addGlobalData("layout", "default");

  eleventyConfig.addWatchTarget("./library/");
  eleventyConfig.addWatchTarget("./inline/");

  // Passthrough katex
  // eleventyConfig.addPassthroughCopy("website/fonts/");
  // eleventyConfig.addPassthroughCopy("website/fonts/");
  eleventyConfig.addTransform("test", function (content) {
    console.log(this.inputPath);
    return content;
  });

  // Template formats
  eleventyConfig.setTemplateFormats([
    "njk",
    "md",
    "pcss",
    "ts",
    "tsx",
    "woff",
    "woff2",
  ]);

  eleventyConfig.addPlugin(Essentials, {
    links: {
      prefix: "/home/",
    },
  });

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
    ignores: [],
    plugins: [
      require("postcss-minify"),
      require("postcss-nested"),
      require("postcss-simple-vars"),
      require("postcss-mixins"),
      require("postcss-import"),
    ],
  });

  eleventyConfig.addShortcode("math", (TeX: string) =>
    katex.renderToString(TeX)
  );

  if (options.output.minify)
    eleventyConfig.addTransform("html-minifier", function (content: string) {
      if (this.outputPath.endsWith(".html"))
        return html_min.minify(content, {
          removeComments: true,
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: true,
        });
      return content;
    });

  return {
    pathPrefix: "/home/",
    dir: {
      input: "./website/",
      output: options.build_dir,
    },
  };
};
