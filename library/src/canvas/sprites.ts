import { FullBackend, Renderer } from "@lib/renderer/new";
import type * as render from "../renderer";

export type Sprite = {
  draw(
    ctx: render.Renderer2D | FullBackend<"text">,
    x: number,
    y: number
  ): unknown;
};

export type BBSprite = Sprite & {
  top: number;
  bot: number;
  left: number;
  right: number;
};

export function strokeBounds(
  ctx: render.Renderer2D,
  sprite: BBSprite,
  x: number,
  y: number
) {
  let l = x - sprite.left,
    t = y - sprite.top,
    r = x + sprite.right,
    b = y + sprite.bot;
  ctx.begin().line(l, t).line(r, t).line(r, b).line(l, b);
  ctx.close();
  ctx.stroke();
}

/**
 * Create a sprite object for text.
 * @param ctx Rendering context used for measuring font.
 * @param text The text
 * @param options
 * @returns Sprite of thext
 */
export function TextSprite(
  measure: render.MeasureText,
  text: string,
  options?: { center?: boolean }
): BBSprite {
  const { center = false } = options || {};
  let { top, bot, left, right } = measure.measureText(text);
  let dx = 0;
  if (center) {
    dx = (right - left) / 2;
    left += dx;
    right -= dx;
  }

  const sprite = {
    text: text,
    dx,
    top,
    bot,
    left,
    right,
    draw: function (
      ctx: render.Renderer2D | FullBackend<"text">,
      x: number,
      y: number
    ) {
      if ("drawText" in ctx) {
        ctx.drawText(this.text, x - this.dx, y, 0 as render.TextAlign);
      } else {
        ctx.text().draw(x - this.dx, y, this.text);
      }
    },
  };
  return sprite;
}

/**
 * Create a sprite that draws a fraction. Fontsize and lineWidth from the context are used.
 * @param top p sprite
 * @param bot Bottom sprite
 * @returns The sprite that draws fraction
 */
export function FracSprite(top: BBSprite, bot: BBSprite): BBSprite {
  // 0.2 average height as gap
  const fractionGap = 0.05 * (top.top + top.bot + bot.top + bot.bot);

  // Shift to center top / bot text along x
  const topOffsetX = 0.5 * (top.left - top.right);
  const botOffsetX = 0.5 * (bot.left - bot.right);
  // Shift
  const topOffsetY = -top.bot - fractionGap;
  const botOffsetY = bot.top + fractionGap;

  // Amount of line required on each side
  const halfLineLength = Math.max(
    0.5 * (top.left + top.right),
    0.5 * (bot.left + bot.right)
  );

  const sprite = {
    data: [
      topOffsetX,
      topOffsetY,
      botOffsetX,
      botOffsetY,
      halfLineLength,
    ] as const,
    top: -topOffsetY + top.top,
    bot: botOffsetY + bot.bot,
    left: halfLineLength,
    right: halfLineLength,

    draw: function (
      ctx: render.Renderer2D | FullBackend<"text">,
      x: number,
      y: number
    ) {
      let [topOffsetX, topOffsetY, botOffsetX, botOffsetY, halfLineLength] =
        this.data;

      top.draw(ctx, x + topOffsetX, y + topOffsetY);
      bot.draw(ctx, x + botOffsetX, y + botOffsetY);

      if ("begin" in ctx) {
        ctx.begin();
        ctx.move(x - halfLineLength, y);
        ctx.line(x + halfLineLength, y);
        ctx.stroke();
      } else {
        ctx
          .path()
          .move(x - halfLineLength, y)
          .line(x + halfLineLength, y)
          .stroke();
      }
    },
  };
  return sprite;
}
