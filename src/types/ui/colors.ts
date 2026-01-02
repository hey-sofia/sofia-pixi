import { Color } from "pixi.js";
import { lerp } from "../../utils/maths";

/**
 * Returns new `Color` object in between two provided colors
 * @param from
 * @param to
 * @param t timer
 */
export const tweenColor = (from: Color, to: Color, t: number) => {
  return new Color({
    r: Math.round(lerp(from.red, to.red, t)),
    g: Math.round(lerp(from.green, to.green, t)),
    b: Math.round(lerp(from.blue, to.blue, t)),
  });
};

export const UIColors = {
  LILAC_FILL: 0x95a4e2,
  LILAC_STROKE: 0x546ac1,
};
