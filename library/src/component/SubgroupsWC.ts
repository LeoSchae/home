import {
  annotateCarthesian2DAxis,
  ComplexScTr,
  drawCarthesian2DAxis,
} from "../canvas/axis";
import * as render from "../renderer";
import * as sprites from "../canvas/sprites";
import { AsyncManager, wrap } from "../modules/Async";
import { DragZoomHover } from "../modules/Interact";
import * as math from "../modules/math";
import { hyperbolicLine } from "../modules/math/draw";
import * as layers from "./layers";
import * as consts from "./SubgroupsWC.const";
import * as dom from "../DomElement";
import katex from "katex";
import { manualSizing } from "./layers/Options";

import popupLayer from "./layers/Popup";

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

      let asyncManager = new AsyncManager<"group" | "bgDraw">();

      let changeGroup = (
        newGroup: math.congruenceSubgroups.CongruenceSubgroup,
        newLevel: number
      ) => {
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

      options.add({
        type: "color",
        label: "Color",
        onChange(s) {
          appOptions.fill = s;
          config.update();
        },
        default: appOptions.fill,
      });

      options.add({
        type: "number",
        label: "Level",
        onChange(level) {
          changeGroup(visual.group_type, level);
        },
        default: visual.level,
      });

      options.add({
        type: "radio",
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

      options.add(manualSizing(config));

      options.add({
        type: "multiButton",
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
      });

      function* bgDraw(ctx: render.Renderer2D) {
        ctx.fillStyle = appOptions.fill + "55";
        ctx.strokeStyle = appOptions.fill;
        ctx.lineWidth = 1;

        let i = 0;
        for (let m of visual.group) {
          yield;
          ctx.beginPath();
          for (let i = 0; i < visual.domain.length; i++) {
            hyperbolicLine(
              ctx,
              visual.projection,
              m.transform(visual.domain[i]),
              m.transform(visual.domain[(i + 1) % visual.domain.length])
            );
          }
          //ctx.closePath();
          ctx.fillAndStroke();
        }
      }

      var cachedBG: null | {
        nw: math.Complex;
        se: math.Complex;
        use: boolean;
      } = null;
      var cachedCanvas = document.createElement("canvas");

      // background canvas
      config.addLayer(
        "bg",
        layers.Canvas({
          update: (config, ctx) => {
            ctx?.clearRect(0, 0, config.width, config.height);
            asyncManager.abortAll("bgDraw");
            if (cachedBG) cachedBG.use = true;

            wrap
              .callWrapped(
                null,
                bgDraw,
                [new render.Canvas(ctx)],
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

            if (mouse === null) popup.set();

            if (mouse != null) {
              const m = math.congruenceSubgroups.Domain1.findCosetOf(
                projection.invert(mouse)
              );

              if (m === undefined) popup.set();
              else {
                popup.set(katex.renderToString(m.toTeX()));
                popup.move(mouse[0], mouse[1]);

                r.fillStyle = "#CCCCEEAA";
                r.beginPath();
                for (let i = 0; i < domain.length; i++) {
                  hyperbolicLine(
                    r,
                    projection,
                    m.transform(domain[i]),
                    m.transform(domain[(i + 1) % domain.length])
                  );
                }
                r.closePath();
                r.fill();
                r.stroke();
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

            drawCarthesian2DAxis(r, projection, {
              scale: 1,
            });

            r.fontSize = annotationFS;
            annotateCarthesian2DAxis(r, "x", projection, annotations);
          },
        })
      );
    },
  })
);
