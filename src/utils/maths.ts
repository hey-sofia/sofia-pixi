import { Point } from "pixi.js";

/** Calculate the distance between two points */
function distance(pointA: Point, pointB: Point) {
  const x = pointA.x - pointB.x;
  const y = pointA.y - pointB.y;
  return Math.hypot(x, y);
}

/**
 * Returns a value in between the two given numbers `a` and `b`.
 * @param t Normalised timer value to aid animation
 * @param normalised Whether or not `a` and `b` values have been normalised (by 255)
 * @returns
 */
const lerp = (
  a: number,
  b: number,
  t: number = 1,
  normalised: boolean = true,
) => {
  const absoluteA = normalised ? a * 255 : a;
  const absoluteB = normalised ? b * 255 : b;
  return absoluteA + (absoluteB - absoluteA) * t;
};

export { distance, lerp };
