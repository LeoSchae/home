import {
  annotateCarthesian2DAxis,
  ComplexScTr,
  drawCarthesian2DAxis,
} from "../canvas/axis";
import * as render from "../renderer";
import * as sprites from "../canvas/sprites";
import { AsyncManager, wrap } from "../modules/Async";
import { DragZoomHover } from "../modules/Interact";
import {
  ButtonOption,
  ColorOption,
  NumberOption,
  RadioOption,
} from "../modules/layeredCanvas";
import * as math from "../modules/math";
import { hyperbolicLine } from "../modules/math/draw";
import * as layers from "./layers";
import * as consts from "./SubgroupsWC.const";
import * as dom from "../DomElement";
import katex from "katex";

function downloadSvg(el: string) {
  let data =
    `data:image/svg+xml;base64,` +
    window.btoa(
      `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n` + el
    );
  let link = document.createElement("a");
  link.setAttribute("download", "Subgroups.svg");
  link.href = data;
  link.click();
}

window.customElements.define(
  "subgroups-wc",
  layers.LayeredComponent({
    connected(config) {
      config.attachToShaddow(
        dom.Element("link", {
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
          style: "position: absolute;bottom:0;left:0;z-index: 2;padding: 10px;",
        },
        {
          __html: katex.renderToString(
            visual.group_type.tex + `(${visual.level})`
          ),
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
          visual.mouse = pos;
          config.update("fg"); // only fg update
        }
      ).registerListeners(config.containerElement);

      const appOptions = {
        fill: "#a40000",
      };

      config.addOption(
        new ColorOption(
          "Color",
          (s) => {
            appOptions.fill = s;
            config.update();
          },
          appOptions.fill
        )
      );

      config.addOption(
        new NumberOption(
          "Level",
          (s) => {
            let i = parseInt(s);
            if (isNaN(i) || i < 0) return;
            changeGroup(visual.group_type, i);
          },
          "" + visual.level
        )
      );

      config.addOption(
        new RadioOption(
          "Group",
          [
            [math.congruenceSubgroups.Gamma_0.tex, consts.Gamma0],
            [math.congruenceSubgroups.Gamma_1.tex, consts.Gamma1],
            [math.congruenceSubgroups.Gamma.tex, consts.Gamma],
          ],
          (v) => {
            let { Gamma_0, Gamma_1, Gamma } = math.congruenceSubgroups;
            switch (v) {
              case Gamma.tex:
                changeGroup(Gamma, visual.level);
                break;
              case Gamma_0.tex:
                changeGroup(Gamma_0, visual.level);
                break;
              case Gamma_1.tex:
                changeGroup(Gamma_1, visual.level);
                break;
              default:
                console.log("UNKNOWN GROUP TYPE" + v);
                break;
            }
          },
          visual.group_type.tex
        )
      );

      config.addOption(
        new ButtonOption("Export", "SVG", () => {
          const r2dsvg = new render.SVG(config.width, config.height);

          let d = bgDraw(r2dsvg);
          while (!d.next().done) continue;
          downloadSvg(r2dsvg.svg.toString());
        })
      );

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
        layers.CanvasLayer({
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
              /*.then(() => {
                cachedBG = {
                  nw: visual.projection.invert([0, 0]),
                  se: visual.projection.invert([config.width, config.height]),
                  use: false,
                };
                cachedCanvas.width = ctx.canvas.width;
                cachedCanvas.height = ctx.canvas.height;
                let c = cachedCanvas.getContext(
                  "2d"
                ) as CanvasRenderingContext2D;
                c.fillStyle = "#FFFFFF";
                c.fillRect(0, 0, config.width, config.height);
                c.drawImage(ctx.canvas, 0, 0);
                config.update("fg");
              })*/
              .catch(() => {});
          },
        })
      );

      // foreground canvas
      config.addLayer(
        "fg",
        layers.CanvasLayer({
          update: (config, ctx) => {
            let r = new render.Canvas(ctx, config.width, config.height);
            ctx.clearRect(0, 0, config.width, config.height);

            /*if (cachedBG && cachedBG.use && false) {
              ctx.globalAlpha = 0.5;

              let nw = visual.projection.project(cachedBG.nw);
              let se = visual.projection.project(cachedBG.se);
              let w = se[0] - nw[0],
                h = se[1] - nw[1];
              ctx.drawImage(cachedCanvas, nw[0], nw[1], w, h);
              ctx.globalAlpha = 1;
            }*/

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

            if (mouse != null) {
              const m = math.congruenceSubgroups.Domain1.findCosetOf(
                projection.invert(mouse)
              );
              if (m !== undefined) {
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
