//

import { readFile } from "fs/promises";
import { resolve } from "path";

type Content = string;
type CompileResult = () => Content | Promise<Content>;

type Extension = {
  extension: string;
  read: true;
  compile(
    contents: string,
    path: string
  ): undefined | CompileResult | Promise<CompileResult>;
};

export default function (
  eleventyConfig: any,
  options: { inherit?: string[]; extensions?: Extension[] }
) {
  const extensions = options.extensions || [];
  const inherit = options.inherit || [];

  function getExtension(path: string): Extension | undefined {
    for (var ext of extensions) {
      if (path.endsWith("." + ext.extension)) return ext;
    }
    for (var e of inherit) {
      if (!path.endsWith("." + e)) continue;

      for (ext of eleventyConfig.extensionMap as Set<Extension>)
        if (ext.extension === e) return ext;
    }
  }

  eleventyConfig.addNunjucksAsyncShortcode(
    "inline",
    async function (this: EleventyThis, path: string) {
      path = resolve("./inline/", path);

      let ext = getExtension(path);
      if (!ext) throw "ERROR";
      let contents = "";
      if (ext.read) contents = (await readFile(path)).toString();
      let render = await ext.compile(contents, path);
      if (!render) throw "ERROR";
      return await render();
    }
  );
}
