import { Point } from "pixi.js"

/** Calculate the distance between two points */
function distance(pointA: Point, pointB: Point) {
  const x = pointA.x - pointB.x
  const y = pointA.y - pointB.y
  return Math.hypot(x, y)
}

export { distance }
