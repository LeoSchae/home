export interface Renderer2D {
  get lineWidth(): number;
  set lineWidth(lineWidth: number);

  get fontSize(): number;
  set fontSize(fontSize: number);

  get fillStyle(): string;
  set fillStyle(fillStyle: string);

  get strokeStyle(): string;
  set strokeStyle(strokeStyle: string);

  fillText(text: string, x: number, y: number): void;

  beginPath(): void;

  moveTo(x: number, y: number): void;

  lineTo(x: number, y: number): void;

  closePath(): void;

  rect(x: number, y: number, w: number, h: number): void;

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    ccw?: boolean
  ): void;

  stroke(): void;

  fill(): void;

  fillAndStroke(): void;
}

export interface MeasureText {
  measureText(text: string): {
    top: number;
    bot: number;
    left: number;
    right: number;
  };
}

export { default as Canvas } from "./Canvas";
export { default as SVG } from "./SVG";
export { default as TikZ } from "./TikZ";
