import {
  annotateCarthesian2DAxis,
  ComplexScTr,
  drawCarthesian2DAxis,
} from "@lib/canvas/axis";
import {
  Renderer2D,
  Renderer2DBuffer,
  Renderer2DCanvas,
  Renderer2DSVG,
} from "@lib/canvas/context";
import { FracSprite, TextSprite } from "@lib/canvas/sprites";
import { AsyncManager, AsyncOptions, wrap } from "@lib/modules/Async";
import { DragZoomHover } from "@lib/modules/Interact";
import {
  ButtonOption,
  ColorOption,
  LayeredCanvasApp,
  LayeredCanvasOptions,
  NumberOption,
  RadioOption,
} from "@lib/modules/layeredCanvas";
import { Complex, congruenceSubgroups, Moebius } from "@lib/modules/math";
import { hyperbolicLine } from "@lib/modules/math/draw";

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
  document.body.append(el);
}

class TestApp extends LayeredCanvasApp {
  initializeApp(options: LayeredCanvasOptions) {
    let state = {
      group_type: congruenceSubgroups.Gamma_0,
      level: 2,
      domain: congruenceSubgroups.Domain1,
    };

    let visual = {
      level: state.level,
      group_type: state.group_type,
      group: state.group_type.cosetRepresentatives(state.level),
      domain: state.domain.corners,
      projection: new ComplexScTr([200, 300], 200),
      mouse: null as [number, number] | null,
    };

    let asyncManager = new AsyncManager<"group" | "bgDraw">();

    let changeGroup = (
      newGroup: congruenceSubgroups.CongruenceSubgroup,
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

        this.requestRepaintAll();
      }).catch((e) => {
        if (e !== "aborted") console.log(e);
      });
    };

    /**
     * Events for the canvas
     */
    new DragZoomHover(
      ([dx, dy]) => {
        [dx, dy] = options.map.toCanvas(dx, dy);
        visual.projection.addTranslation([dx, dy]);
        this.requestRepaintAll();
      },
      (factor, [cx, cy]) => {
        visual.projection.addZoom(factor, options.map.toCanvas(cx, cy));
        this.requestRepaintAll();
      },
      (pos: [number, number] | null) => {
        visual.mouse =
          pos == null ? null : options.map.toCanvas(pos[0], pos[1]);
        this.requestRepaintLayer("fg"); // only fg update
      }
    ).registerListeners(options.canvasContainer);

    const appOptions = {
      fill: "#a40000",
    };

    options.addOption(
      new ColorOption(
        "Color: ",
        (s) => {
          appOptions.fill = s;
          this.requestRepaintAll();
        },
        appOptions.fill
      )
    );

    options.addOption(
      new NumberOption(
        "Level: ",
        (s) => {
          let i = parseInt(s);
          if (isNaN(i) || i < 0) return;
          changeGroup(visual.group_type, i);
        },
        "" + visual.level
      )
    );

    options.addOption(
      new RadioOption(
        "Group: ",
        [
          congruenceSubgroups.Gamma_0.tex,
          congruenceSubgroups.Gamma_1.tex,
          congruenceSubgroups.Gamma.tex,
        ],
        (v) => {
          let { Gamma_0, Gamma_1, Gamma } = congruenceSubgroups;
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

    options.addOption(
      new ButtonOption("Export: ", "SVG", () => {
        const r2dsvg = new Renderer2DSVG(options.map.width, options.map.height);

        let d = bgDraw(r2dsvg);
        while (!d.next().done) continue;
        downloadSvg(r2dsvg.svg.toString());
      })
    );

    function* bgDraw(ctx: Renderer2D) {
      ctx.fillStyle = appOptions.fill + "55";
      ctx.strokeStyle = appOptions.fill;
      ctx.lineWidth = options.map.pixelFactor * 1.0;

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
      nw: Complex;
      se: Complex;
      use: boolean;
    } = null;
    var cachedCanvas = document.createElement("canvas");

    // background canvas
    options.addLayer("bg", {
      draw: (canvas) => {
        let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        asyncManager.abortAll("bgDraw");
        if (cachedBG) cachedBG.use = true;

        wrap
          .callWrapped(
            null,
            bgDraw,
            [new Renderer2DCanvas(ctx)],
            asyncManager.getNew("bgDraw")
          )
          .then(() => {
            cachedBG = {
              nw: visual.projection.invert([0, 0]),
              se: visual.projection.invert([
                options.map.width,
                options.map.height,
              ]),
              use: false,
            };
            cachedCanvas.width = options.map.width;
            cachedCanvas.height = options.map.height;
            let c = cachedCanvas.getContext("2d") as CanvasRenderingContext2D;
            c.fillStyle = "#FFFFFF";
            c.fillRect(0, 0, options.map.width, options.map.height);
            c.drawImage(canvas, 0, 0);
            this.requestRepaintLayer("fg");
          })
          .catch(() => {});
      },
    });

    // foreground canvas
    options.addLayer("fg", {
      draw: (canvas) => {
        let _ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        let r = new Renderer2DCanvas(_ctx);
        _ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (cachedBG && cachedBG.use) {
          _ctx.globalAlpha = 0.5;
          /* draw from cache */
          let nw = visual.projection.project(cachedBG.nw);
          let se = visual.projection.project(cachedBG.se);
          let w = se[0] - nw[0],
            h = se[1] - nw[1];
          _ctx.drawImage(cachedCanvas, nw[0], nw[1], w, h);
          _ctx.globalAlpha = 1;
        }

        let annotationFS = 9 * options.map.pixelFactor;
        r.fontSize = annotationFS;
        let annotations = [
          {
            sprite: FracSprite(TextSprite(r, "-1"), TextSprite(r, "2")),
            at: -0.5,
          },
          {
            sprite: FracSprite(TextSprite(r, "1"), TextSprite(r, "2")),
            at: 0.5,
          },
        ];

        let { mouse, projection, domain } = visual;

        if (mouse != null) {
          const m = congruenceSubgroups.Domain1.findCosetOf(
            projection.invert(mouse)
          );
          if (m !== undefined) {
            _ctx.fillStyle = "#CCCCEEAA";
            _ctx.beginPath();
            for (let i = 0; i < domain.length; i++) {
              hyperbolicLine(
                _ctx,
                projection,
                m.transform(domain[i]),
                m.transform(domain[(i + 1) % domain.length])
              );
            }
            _ctx.closePath();
            _ctx.fill();
            _ctx.stroke();
            _ctx.fillStyle = "#000000";

            let p = m.m[0],
              q = m.m[2];
            if (q < 0) {
              q = -q;
              p = -p;
            }
            if (p !== 0)
              annotations.push({
                sprite: FracSprite(
                  TextSprite(r, "" + p),
                  TextSprite(r, "" + q)
                ),
                at: p / q,
              });
          }
        }

        drawCarthesian2DAxis(r, projection, { scale: options.map.pixelFactor });

        r.fontSize = annotationFS;
        annotateCarthesian2DAxis(r, "x", projection, annotations);
      },
    });
  }
  uninitializeApp(options: LayeredCanvasOptions): void {}
}

window.customElements.define("subgroups-wc", TestApp);
