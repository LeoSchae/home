import PostCSS from "postcss";
import { readFile } from "fs/promises";

export default function (
  eleventyConfig: any,
  { plugins = [] }: { ignores: string[]; plugins: Parameters<typeof PostCSS> }
) {
  const postcss = PostCSS(plugins);

  eleventyConfig.addExtension("pcss", {
    outputFileExtension: "css",
    read: true,
    compile: async function (fileContents: string, path: string) {
      const res = await postcss.process(fileContents, { from: path });

      return function (data: any) {
        return res.css;
      };
    },
  });
}

/**
 * @returns {import("esbuild").Plugin}
 */
export function ESBuildPostCSS(plugins: any[] = []) {
  const postcss = PostCSS(plugins);
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
}
