import { Point } from "pixi.js"
import { BouncySprite } from "../types/sprites"

const IMPULSE_POWER = 4.6

const collisionDetected = (spriteA: BouncySprite, spriteB: BouncySprite) => {
  const boundsA = spriteA.getBounds() // lilFella
  const boundsB = spriteB.getBounds() // sofiaLogo

  return (
    boundsA.x < boundsB.x + boundsB.width && // lilFella.x < (sofiaLogo.x + sofiaLogo.width)
    boundsA.x + boundsA.width > boundsB.x && //
    boundsA.y < boundsB.y + boundsB.height &&
    boundsA.y + boundsA.height > boundsB.y
  )
}

const collisionResponse = (spriteA: BouncySprite, spriteB: BouncySprite, impulsePower?: number) => {
  if (!spriteA || !spriteB) {
    return new Point(0)
  }
  const dx = spriteB.x - spriteA.x
  const dy = spriteB.y - spriteA.y
  const distanceRaw = Math.sqrt(dx * dx + dy * dy)

  const dPoint = new Point(dx, dy)
  const distanceNormalised = new Point(dPoint.x / distanceRaw, dPoint.y / distanceRaw)

  const relativeVelocity = new Point(spriteA.vx - spriteB.vx, spriteA.vy - spriteB.vy)

  // speed in animation-sense, rather than physics
  const speed =
    relativeVelocity.x * distanceNormalised.x + relativeVelocity.y * distanceNormalised.y
  const power = impulsePower !== undefined ? impulsePower : IMPULSE_POWER
  const impulse = (power * speed) / (spriteA.mass + spriteB.mass)

  return new Point(impulse * distanceNormalised.x, impulse * distanceNormalised.y)
}

export { collisionDetected, collisionResponse }
