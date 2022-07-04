import { Backend, Complete, FullBackend, Renderer } from "@lib/renderer/new";
import { SVGBackend } from "@lib/renderer/newSVG";
import { TikZBackend } from "@lib/renderer/newTikZ";
import { Option } from "./Options";

function download(
  content: string,
  name: string,
  dataType: string = "text/plain"
) {
  let data = `data:${dataType};base64,${window.btoa(content)}`;
  let link = document.createElement("a");
  link.setAttribute("download", name);
  link.href = data;
  link.click();
}

export function ExportButton(options: {
  setup:
    | { fileName?: string; width: number; height: number }
    | (() => { fileName?: string; width: number; height: number });
  render(r: FullBackend<"primitive" | "text">): void | Promise<void>;
}): Option<"multiButton"> {
  return [
    "multiButton",
    {
      label: "Export as",
      values: [
        { name: "TikZ", label: "TikZ" },
        { name: "SVG", label: "SVG" },
      ],
      async onClick(name) {
        let opt: { fileName?: string; width: number; height: number };
        if (typeof options.setup === "function") opt = options.setup();
        else opt = options.setup;

        let backend: Backend<"text">;
        let fileName: string = opt.fileName || "Export";
        let dataType: string;
        let contents: () => string;

        if (name === "SVG") {
          backend = new SVGBackend(opt.width, opt.height);
          fileName += ".svg";
          dataType = "image/svg+xml";
          contents = () => (backend as SVGBackend)._svg.toString();
        } else if (name === "TikZ") {
          backend = new TikZBackend(opt.width, opt.height);
          fileName += ".tikz";
          dataType = "text/plain";
          contents = () => (backend as TikZBackend).toTikZ();
        } else throw new Error();

        await options.render(Complete(backend));

        download(contents(), fileName, dataType);
      },
    },
  ];
}
