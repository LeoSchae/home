import PostCSS from "postcss";

export function EleventyPlugin(
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
