import { Assets, Point, Sprite } from "pixi.js"

export type SpriteShape = "circle" | "square"

export type PhysicsSpriteOptions = {
  asset: string
  /** Not currently in-use, may be helpful later */
  shape: "circle" | "square"
  radius: number
  mass: number
  point?: Point
}
/**
 * Sprite with physical properties like velocity, mass, radius, and shape
 */
export class PhysicsSprite extends Sprite {
  /** Not currently in-use, may be helpful later */
  shape: "circle" | "square" = "circle"
  radius: number
  mass: number = 1

  velocity: Point = new Point(0)

  constructor(o: PhysicsSpriteOptions) {
    super()

    // texture
    Assets.load(`/assets/${o.asset}`).then((t) => {
      this.texture = t
    })

    // starting position
    if (o.point) {
      const x = o.point.x
      const y = o.point.y
      this.position.set(x, y)
    } else {
      this.position.set(0)
    }

    this.anchor.set(0.5)

    // physical properties
    this.radius = o.radius
    const diameter = o.radius * 2
    this.width = this.height = diameter
    this.shape = o.shape
    this.mass = o.mass
  }
}
