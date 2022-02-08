import { PredictiveRenderer2D, Renderer2D } from "./context";

export type Sprite = {
  draw(ctx: Renderer2D, x: number, y: number): unknown;
};

export type BBSprite = Sprite & {
  top: number;
  bot: number;
  left: number;
  right: number;
};

export function strokeBounds(
  ctx: CanvasRenderingContext2D,
  sprite: BBSprite,
  x: number,
  y: number
) {
  ctx.strokeRect(
    x - sprite.left,
    y - sprite.top,
    sprite.left + sprite.right,
    sprite.top + sprite.bot
  );
}

/**
 * Create a sprite object for text.
 * @param ctx Rendering context used for measuring font.
 * @param text The text
 * @param options
 * @returns Sprite of thext
 */
export function TextSprite(
  ctx: PredictiveRenderer2D,
  text: string,
  options?: { center?: boolean }
): BBSprite {
  const { center = false } = options || {};
  let { top, bot, left, right } = ctx.measureText(text);
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
    draw: function (ctx: Renderer2D, x: number, y: number) {
      ctx.fillText(this.text, x - this.dx, y);
    },
  };
  return sprite;
}

/**
 * Create a sprite that draws a fraction. Fontsize and lineWidth from the context are used.
 * @param top Top sprite
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

    draw: function (ctx: Renderer2D, x: number, y: number) {
      let [topOffsetX, topOffsetY, botOffsetX, botOffsetY, halfLineLength] =
        this.data;

      top.draw(ctx, x + topOffsetX, y + topOffsetY);
      bot.draw(ctx, x + botOffsetX, y + botOffsetY);

      ctx.beginPath();
      ctx.moveTo(x - halfLineLength, y);
      ctx.lineTo(x + halfLineLength, y);
      ctx.stroke();
    },
  };
  return sprite;
}
