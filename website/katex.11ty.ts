/**
 * Move the relevant katex files from node to _build.
 * (katex.min.css + fonts folder)
 */

import * as fs from "fs";

export function render(this: any, data: any) {
  let file = "./node_modules/katex/dist/" + data.pagination.items[0];
  return new Promise((res, rej) => {
    fs.readFile(file, (err, data) => {
      if (err) rej(err);
      else res(data);
    });
  });
}

export const data = {
  layout: "",
  pagination: {
    data: "files",
    size: 1,
    before: function (mainFile: [string]) {
      let files = fs.readdirSync("./node_modules/katex/dist/fonts/");
      return mainFile.concat(files.map((f) => "fonts/" + f));
    },
  },
  permalink: (data: any) => "katex/" + data.pagination.items[0],
  files: ["katex.min.css"],
};
