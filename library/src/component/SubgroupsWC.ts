import {
  annotateCarthesian2DAxis,
  ComplexScTr,
  drawCarthesian2DAxis,
} from "../canvas/axis";
import * as render from "../renderer";
import * as sprites from "../canvas/sprites";
import * as asyncLib from "../modules/Async";
import { DragZoomHover } from "../modules/Interact";
import * as math from "../modules/math";
import { hyperbolicLine } from "../modules/math/draw";
import * as layers from "./layers";
import * as consts from "./SubgroupsWC.const";
import * as dom from "../DomElement";
import katex from "katex";
import { manualSizing } from "./layers/Options";

import popupLayer from "./layers/Popup";
import { Complete, FullBackend } from "@lib/renderer/new";
import { CanvasBackend } from "@lib/renderer/newCanvas";
import { ExportButton } from "./layers/tmpExport";

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

function setSize(
  dim: { width: number; height: number } | "auto",
  config: layers.LayeredConfig
) {
  if (dim == "auto") {
  } else {
    config.containerElement.style.width = dim.width + "px";
    config.containerElement.style.height = dim.height + "px";
  }
}

window.customElements.define(
  "subgroups-wc",
  layers.LayeredComponent({
    connected(config) {
      config.attachToShaddow(
        dom.Element("link", [], {
          rel: "stylesheet",
          type: "text/css",
          href: consts.KatexStylesheet,
        })
      );

      // TEST
      // config.addLayer("options", new OptionsLayer({}));

      let state = {
        group_type: math.congruenceSubgroups.Gamma_1,
        level: 17,
        domain: math.congruenceSubgroups.Domain1,
      };

      let visual = {
        level: state.level,
        group_type: state.group_type,
        group: state.group_type.cosetRepresentatives(state.level),
        domain: state.domain.corners,
        projection: new ComplexScTr([200, 300], 200),
        mouse: null as [number, number] | null,
      };
      let info = dom.Element(
        "div",
        {
          __html: katex.renderToString(
            visual.group_type.tex + `(${visual.level})`
          ),
        },
        {
          style: "position: absolute;bottom:0;left:0;z-index: 2;padding: 10px;",
        }
      );
      config.attachToShaddow(info);

      let asyncManager = new asyncLib.AsyncManager<"group" | "bgDraw">();

      let changeGroup = (
        newGroup: math.congruenceSubgroups.CongruenceSubgroup,
        newLevel: number
      ) => {
        asyncManager.abortAll("group");
        let p = newGroup.cosetRepresentativesAsync(
          newLevel,
          asyncManager.getNew("group")
        );

        p.then((g) => {
          visual.group_type = newGroup;
          visual.level = newLevel;
          visual.group = g;

          katex.render(newGroup.tex + `(${newLevel})`, info);

          config.update();
        }).catch((e) => {
          console.log(e);
          if (e !== "aborted") console.log(e);
        });
      };

      let popup = config.addLayer("popup", popupLayer());

      /**
       * Events for the canvas
       */
      new DragZoomHover(
        (dragDir) => {
          visual.projection.addTranslation(dragDir);
          config.update();
        },
        (zoomFactor, center) => {
          visual.projection.addZoom(zoomFactor, center);
          config.update();
        },
        (pos: [number, number] | null) => {
          if (pos) popup.move(pos[0], pos[1]);
          visual.mouse = pos;
          config.update("fg"); // only fg update
        }
      ).registerListeners(config.containerElement);

      const appOptions = {
        fill: "#a40000",
      };

      let options = config.addLayer("options", layers.Options());
      console.log(options);

      options.add("section", "Group Options");

      options.add("radio", {
        label: "Group",
        default: "Gamma_1",
        values: [
          {
            name: "Gamma_0",
            label: dom.Element("span", { __html: consts.Gamma0 }),
          },
          {
            name: "Gamma_1",
            label: dom.Element("span", { __html: consts.Gamma1 }),
          },
          {
            name: "Gamma",
            label: dom.Element("span", { __html: consts.Gamma }),
          },
        ],
        onChange(groupName) {
          if (!(groupName in math.congruenceSubgroups))
            throw new Error("Unknown congruence subgroup: " + groupName);
          changeGroup(
            (math.congruenceSubgroups as any)[groupName],
            visual.level
          );
        },
      });

      options.add("number", {
        label: "Level",
        onChange(level) {
          changeGroup(visual.group_type, level);
        },
        default: visual.level,
      });

      options.add("section", "Other...");

      options.add("color", {
        label: "Color",
        onChange(s) {
          appOptions.fill = s;
          config.update();
        },
        default: appOptions.fill,
      });

      options.add(manualSizing, config);

      options.add(
        ExportButton({
          setup() {
            return { width: config.width, height: config.height };
          },
          render: (r) => asyncLib.callAsync(null, bgDraw, [r]),
        })
      );

      /*options.add("multiButton", {
        label: "Export as",
        values: [
          { name: "SVG", label: "SVG" },
          { name: "TikZ", label: "TikZ" },
        ],
        onClick(name) {
          let r: render.SVG | render.TikZ;
          let fileName: string = "Subgroups";
          let dataType: string;
          if (name == "SVG") {
            r = new render.SVG(config.width, config.height);
            fileName += ".svg";
            dataType = "image/svg+xml";
          } else if (name == "TikZ") {
            r = new render.TikZ(config.width, config.height);
            fileName += ".tikz";
            dataType = "text/plain";
          } else throw new Error("Unknown format");

          let d = bgDraw(r);
          while (!d.next().done) continue;
          download(r.toFileString(), fileName, dataType);
        },
      });*/

      function* bgDraw(ctx: FullBackend) {
        ctx.style({
          lineWidth: 1,
          fill: appOptions.fill + "55",
          stroke: appOptions.fill,
        });

        let i = 0;
        for (let m of visual.group) {
          yield;
          let p = ctx.path();
          for (let i = 0; i < visual.domain.length; i++) {
            hyperbolicLine(
              p,
              visual.projection,
              m.transform(visual.domain[i]),
              m.transform(visual.domain[(i + 1) % visual.domain.length])
            );
          }
          //ctx.close();
          p.draw(true, true);
        }
      }

      // background canvas
      config.addLayer(
        "bg",
        layers.Canvas({
          update: (config, ctx) => {
            ctx?.clearRect(0, 0, config.width, config.height);
            asyncManager.abortAll("bgDraw");

            asyncLib
              .callAsync(
                null,
                bgDraw,
                [Complete(new CanvasBackend(ctx))],
                asyncManager.getNew("bgDraw")
              )
              .catch(() => {});
          },
        })
      );

      // foreground canvas
      config.addLayer(
        "fg",
        layers.Canvas({
          update: (config, ctx) => {
            let r = new render.Canvas(ctx, config.width, config.height);
            ctx.clearRect(0, 0, config.width, config.height);

            let annotationFS = 9;
            r.fontSize = annotationFS;
            let annotations = [
              {
                sprite: sprites.FracSprite(
                  sprites.TextSprite(r, "-1"),
                  sprites.TextSprite(r, "2")
                ),
                at: -0.5,
              },
              {
                sprite: sprites.FracSprite(
                  sprites.TextSprite(r, "1"),
                  sprites.TextSprite(r, "2")
                ),
                at: 0.5,
              },
            ];

            let { mouse, projection, domain } = visual;

            if (mouse === null) popup.show(false);

            if (mouse != null) {
              const m = math.congruenceSubgroups.Domain1.findCosetOf(
                projection.invert(mouse)
              );

              if (m === undefined) popup.show(false);
              else {
                popup.show();
                popup.move(mouse[0], mouse[1]);
                katex.render(m.toTeX(), popup.container);

                r.fillStyle = "#CCCCEEAA";
                let pa = Complete(new CanvasBackend(ctx)).path();
                for (let i = 0; i < domain.length; i++) {
                  hyperbolicLine(
                    pa,
                    projection,
                    m.transform(domain[i]),
                    m.transform(domain[(i + 1) % domain.length])
                  );
                }
                pa.close();
                pa.draw(true, true);
                r.fillStyle = "#000000";

                let [a, b, c, d] = m.m;
                /*console.log(
                  (2 * (c * c + d * d) * (a * c + b * d) +
                    c * d * (b * c + a * d)) /
                    (c * c * c * c + d * d * d * d + c * c * d * d) /
                    2
                );*/

                let p = m.m[0],
                  q = m.m[2];
                if (q < 0) {
                  q = -q;
                  p = -p;
                }
                if (p !== 0)
                  annotations.push({
                    sprite: sprites.FracSprite(
                      sprites.TextSprite(r, "" + p),
                      sprites.TextSprite(r, "" + q)
                    ),
                    at: p / q,
                  });
              }
            }

            drawCarthesian2DAxis(r, projection);

            r.fontSize = annotationFS;
            annotateCarthesian2DAxis(r, "x", projection, annotations);
          },
        })
      );
    },
  })
);
