import {
  annotateCarthesian2DAxis,
  ComplexScTr,
  drawCarthesian2DAxis,
} from "../canvas/axis";
import * as render from "../renderer/old";
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
import { Renderer, CanvasBackend, Align, Backend } from "@lib/renderer/";
import { ExportButton } from "./layers/tmpExport";
import { HTMLBackend } from "@lib/renderer/BackendHTML";
import { initialize } from "esbuild";

function* drawFundametalDomains(
  r: Renderer<"path">,
  options: {
    cosets: math.Moebius[];
    domain: (math.Complex | math.oo)[];
    projection: { origin: [number, number]; scale: number };
    style?: {
      stroke?: Renderer.Color;
      fill?: Renderer.Color;
      lineWidth?: number;
    };
  }
) {
  let {
    style: {
      stroke = [50, 50, 50] as Renderer.Color,
      fill = [50, 50, 50, 0.5] as Renderer.Color,
      lineWidth = 1,
    } = {},
    domain,
    projection,
  } = options;

  r.style({
    lineWidth,
    fill,
    stroke,
  });

  for (let coset of options.cosets) {
    yield;
    let p = r.path();

    for (let i = 0; i < domain.length; i++) {
      hyperbolicLine(
        p,
        projection,
        coset.transform(domain[i]),
        coset.transform(domain[(i + 1) % domain.length])
      );
    }
    //ctx.close();
    p.draw();
  }
}

function drawAxisOverlay(
  r: Renderer<"path" | "text">,
  options: {
    position: { width: number; height: number };
    projection: { origin: [number, number]; scale: number };
    annotate?: [number, number][];
    style?: {
      fontSize?: number;
    };
  }
) {
  let { position, projection, style: { fontSize = 10 } = {} } = options;

  let annotations: { sprite: any; at: number }[] = [];

  let measure = sprites.fakeMeasure();
  r.style({ fontSize });
  measure.fontSize = fontSize;
  for (let [p, q] of options.annotate || []) {
    let d = math.gcd(p, q);
    (p /= d), (q /= d);
    if (q < 0) (p = -p), (q = -q);

    annotations.push({
      sprite: sprites.FracSprite(
        sprites.TextSprite(measure, "" + p),
        sprites.TextSprite(measure, "" + q)
      ),
      at: p / q,
    });
  }

  r.style({ fill: [0, 0, 0], stroke: [0, 0, 0], lineWidth: 1.5 });

  drawCarthesian2DAxis(r, { position, projection, fontSize });
  annotateCarthesian2DAxis(r, "x", projection, annotations);
}

window.customElements.define(
  "subgroups-wc",
  layers.LayeredComponent({
    connected(config) {
      let state = {
        group_type: math.congruenceSubgroups.Gamma_1,
        level: 7,
        domain: math.congruenceSubgroups.Domain1,
      };

      let visual = {
        level: state.level,
        group_type: state.group_type,
        group: [] as math.Moebius[],
        domain: state.domain.corners,
        projection: new ComplexScTr([200, 300], 200),
        mouse: null as [number, number] | null,
        style: {
          color: [20, 20, 20] as [number, number, number],
          fillAlpha: 0.5,
        },
      };

      let popup = config.addLayer("popup", popupLayer());

      let asyncManager = new asyncLib.AsyncManager<
        "findGroup" | "drawBackground"
      >();

      function start() {
        changeGroup(state.group_type, state.level);
      }

      // background canvas
      config.addLayer(
        "background",
        layers.Canvas({
          update: (config, ctx) => {
            asyncManager.abortAll("drawBackground");

            let r = Renderer.from(new CanvasBackend(ctx));
            r.clear();

            asyncLib
              .callAsync(
                null,
                drawFundametalDomains,
                [
                  Renderer.from(new CanvasBackend(ctx)),
                  {
                    cosets: visual.group,
                    domain: visual.domain,
                    projection: visual.projection,
                    style: {
                      stroke: visual.style.color,
                      fill: [...visual.style.color, visual.style.fillAlpha],
                    },
                  },
                ],
                asyncManager.getNew("drawBackground")
              )
              .catch(() => {});
          },
        })
      );

      // foreground canvas
      let foreground = config.addLayer(
        "foreground",
        layers.Canvas({
          update: (config, ctx) => {
            let r = Renderer.from(new CanvasBackend(ctx));
            r.clear();

            let annotations: [number, number][] = [
              [-1, 2],
              [1, 2],
            ];

            let { mouse, projection, domain } = visual;

            if (mouse === null) popup.show(false);

            if (mouse != null) {
              let m = math.congruenceSubgroups.Domain1.findCosetOf(
                projection.invert(mouse)
              );

              if (m === undefined) popup.show(false);
              else {
                popup.show();
                popup.move(mouse[0], mouse[1]);
                if (m.m[2] < 0)
                  m = new math.Moebius(-m.m[0], -m.m[1], -m.m[2], -m.m[3]);
                katex.render(m.toTeX(), popup.container);

                asyncLib.callSync(null, drawFundametalDomains, [
                  r,
                  {
                    domain: visual.domain,
                    cosets: [m],
                    projection: visual.projection,
                    style: {
                      stroke: [0, 0, 0],
                      fill: "#cccceeaa",
                    },
                  },
                ]);
              }
            }

            drawAxisOverlay(r, {
              position: config,
              projection: visual.projection,
              annotate: annotations,
            });
          },
        })
      );

      // Add KaTeX styles
      config.attachToShaddow(
        dom.Element("link", [], {
          rel: "stylesheet",
          type: "text/css",
          href: consts.KatexStylesheet,
        })
      );

      // Current group in bottom left
      let info = dom.Element("div", [], {
        style: "position: absolute;bottom:0;left:0;z-index: 2;padding: 10px;",
      });
      config.attachToShaddow(info);

      async function changeGroup(
        newGroup: math.congruenceSubgroups.CongruenceSubgroup,
        newLevel: number
      ) {
        // compute representatives async
        asyncManager.abortAll("findGroup");

        try {
          let group = await newGroup.cosetRepresentativesAsync(
            newLevel,
            asyncManager.getNew("findGroup")
          );

          visual.group_type = newGroup;
          visual.level = newLevel;
          visual.group = group;

          // Update the info block
          katex.render(newGroup.tex + `(${newLevel})`, info);

          config.update();
        } catch (e) {
          if (e !== "aborted") console.error(e);
        }
      }

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
          foreground.update(); // only fg update
        }
      ).registerListeners(config.containerElement);

      const appOptions = {
        fill: "#555555",
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
          visual.style.color = Renderer.Color(s) as any;
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
          render: async (r) => {
            let { projection } = visual;
            await asyncLib.callAsync(null, drawFundametalDomains, [
              r,
              {
                projection,
                domain: visual.domain,
                cosets: visual.group,
                style: {
                  stroke: visual.style.color,
                  fill: [...visual.style.color, visual.style.fillAlpha],
                },
              },
            ]);
            drawAxisOverlay(r, {
              position: config,
              projection,
              annotate: [
                [-1, 2],
                [1, 2],
              ],
            });
          },
        })
      );

      start();
    },
  })
);
