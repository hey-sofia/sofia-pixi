import { Assets, Circle, Point, Rectangle, Sprite } from "pixi.js"

export type SpriteShape = "circle" | "rectangle"

export type PhysicsSpriteOptions = {
  asset: string
  shapeType: SpriteShape
  radius: number
  mass: number
  point?: Point
}

/**
 * Sprite with physical properties like velocity, mass, radius, and shape
 */
export class PhysicsSprite extends Sprite {
  shapeType: SpriteShape = "circle"
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
    this.shapeType = o.shapeType
    this.radius = o.radius
    const diameter = o.radius * 2
    this.width = this.height = diameter
    this.mass = o.mass
  }

  getShape() {
    switch (this.shapeType) {
      case "circle":
        return new Circle(this.x, this.y, this.radius)
      case "rectangle":
        return new Rectangle(this.x, this.y, this.width, this.height)
    }
  }
}
