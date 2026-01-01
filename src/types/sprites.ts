import { Assets, Circle, isMobile, Point, Rectangle, Sprite } from "pixi.js"

export type SpriteShape = "circle" | "rectangle"

export type PhysicsSpriteOptions = {
  asset: string
  shapeType: SpriteShape
  radius: number
  mass: number
  point?: Point
  attachedToMouse?: boolean
}

const CLICKS_UNTIL_MOUSE_RELEASE_THRESHOLD = 2

/**
 * Sprite with physical properties like velocity, mass, radius, and shape
 */
export class PhysicsSprite extends Sprite {
  shapeType: SpriteShape = "circle"
  radius: number
  mass: number = 1

  velocity: Point = new Point(0)

  attachedToMouse: boolean = false
  private clicksToFreeMouse = 0

  constructor(o: PhysicsSpriteOptions) {
    super()

    this.eventMode = "static"
    this.cursor = "none"

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

    this.attachedToMouse = o.attachedToMouse ?? false

    // TODO: Look into how this should be handled on mobile
    if (!isMobile.phone) {
      this.on("rightdown", this.handleRightClick)
    }
  }

  getShape() {
    switch (this.shapeType) {
      case "circle":
        return new Circle(this.x, this.y, this.radius)
      case "rectangle":
        return new Rectangle(this.x, this.y, this.width, this.height)
    }
  }

  collidedWithWallX(screen: Rectangle) {
    return this.x < this.radius || this.x > screen.width - this.radius
  }

  collidedWithWallY(screen: Rectangle) {
    return this.y < this.radius || this.y > screen.height - this.radius
  }

  getClicksLeftBeforeMouseFreed() {
    return this.attachedToMouse ? CLICKS_UNTIL_MOUSE_RELEASE_THRESHOLD - this.clicksToFreeMouse : 0
  }

  private handleRightClick() {
    if (this.attachedToMouse) {
      // up clicks counter
      this.clicksToFreeMouse += 1

      // if threshold met #FreeMouse!
      if (this.clicksToFreeMouse >= CLICKS_UNTIL_MOUSE_RELEASE_THRESHOLD) {
        this.attachedToMouse = false
        this.clicksToFreeMouse = 0
        return
      }
      // Otherwise ensure mouse is attached
    } else {
      this.attachedToMouse = true
    }
  }
}
