import { Point } from "pixi.js"
import { PhysicsSprite } from "../types/sprites"
import { distance } from "../helpers/maths"

const IMPULSE_POWER = 4.6

/** Detects whether a collision has occurred between two physics sprites */
const collisionDetected = (a: PhysicsSprite, b: PhysicsSprite) => {
  if (!a || !b) return false

  const d = distance(a.position, b.position)
  return d < a.radius + b.radius
}

const collisionResponse = (a: PhysicsSprite, b: PhysicsSprite, impulsePower?: number) => {
  if (!a || !b) {
    return new Point(0)
  }
  const dx = b.x - a.x
  const dy = b.y - a.y
  const distanceRaw = Math.sqrt(dx * dx + dy * dy)
  if (distanceRaw === 0) return new Point(0, 0)

  const dPoint = new Point(dx, dy)
  const distanceNormalised = new Point(dPoint.x / distanceRaw, dPoint.y / distanceRaw)

  const relativeVelocity = new Point(a.velocity.x - b.velocity.x, a.velocity.y - b.velocity.y)

  // speed in animation-sense, rather than physics
  const speed =
    relativeVelocity.x * distanceNormalised.x + relativeVelocity.y * distanceNormalised.y
  const power = impulsePower ?? IMPULSE_POWER

  const applyImpulse = speed > 0
  const impulse = applyImpulse ? (power * speed) / (a.mass + b.mass) : 1

  return new Point(impulse * distanceNormalised.x, impulse * distanceNormalised.y)
}

export { collisionDetected, collisionResponse }
