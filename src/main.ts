import { Application, Point } from "pixi.js"
import { addBouncySprite } from "./helpers/sprite-helpers"
import { collisionDetected, collisionResponse } from "./physics/collision"

const MOVEMENT_SPEED = 0.4
const IMPULSE_POWER = 4.6

const SPRITE_SIZE = 100
const SPRITE_COLLISION_RADIUS = 46

;(async () => {
  const app = new Application()
  await app.init({ backgroundAlpha: 0, resizeTo: window })
  document.getElementById("pixi-container")!.appendChild(app.canvas)

  app.stage.eventMode = "static"
  app.stage.hitArea = app.screen

  const mouseCoords = new Point(0, 0)
  app.stage.on("mousemove", (e) => {
    mouseCoords.x = e.global.x
    mouseCoords.y = e.global.y
  })

  app.stage.on("touchmove", (e) => {
    mouseCoords.x = e.global.x
    mouseCoords.y = e.global.y
  })

  // Add hero sprite
  const hero = await addBouncySprite(app, "sofia-logo.svg", 1, mouseCoords)

  // Add initial sprites
  const startingPosFella = new Point(
    app.screen.width - SPRITE_SIZE,
    (app.screen.height - SPRITE_SIZE * 3) / 2
  )
  const initialFella = await addBouncySprite(app, "lil-fella.svg", 3, startingPosFella)

  let hasCollided = false
  let concurrentCollisions = 0
  const initialAngle = Math.floor(Math.random() * (350 - 10 + 1)) + 10

  // Listen for animate update
  app.ticker.add((ticker) => {
    let tickCollisions = 0
    initialFella.vx = initialFella.vx * 0.99
    initialFella.vy = initialFella.vy * 0.99

    hero.vx = hero.vx * 0.99
    hero.vy = hero.vy * 0.99

    // Bounce lilFella off the edges!
    if (
      initialFella.x < SPRITE_COLLISION_RADIUS ||
      initialFella.x > app.screen.width - SPRITE_COLLISION_RADIUS
    ) {
      hasCollided = true
      tickCollisions += 1
      initialFella.vx = initialFella.vx === 0 ? -1 : -initialFella.vx
    }
    if (
      initialFella.y < SPRITE_COLLISION_RADIUS ||
      initialFella.y > app.screen.height - SPRITE_COLLISION_RADIUS
    ) {
      hasCollided = true
      tickCollisions += 1
      initialFella.vy = initialFella.vy === 0 ? -1.2 : -initialFella.vy
    }

    // Pop lilFella back in middle
    if (
      initialFella.x <= -SPRITE_COLLISION_RADIUS ||
      initialFella.x >= app.screen.width + SPRITE_COLLISION_RADIUS ||
      initialFella.y <= -SPRITE_COLLISION_RADIUS ||
      initialFella.y >= app.screen.height + SPRITE_COLLISION_RADIUS
    ) {
      initialFella.position.set((app.screen.width - 100) / 2, (app.screen.height - 100) / 2)
    }

    // if mouse off screen, don't update
    if (
      app.screen.width > mouseCoords.x ||
      mouseCoords.x > 0 ||
      app.screen.height > mouseCoords.y ||
      mouseCoords.y > 0
    ) {
      const toMouseDirection = new Point(mouseCoords.x - hero.x, mouseCoords.y - hero.y)

      const angleToMouse = Math.atan2(toMouseDirection.y, toMouseDirection.x)

      const distMouseToLogo = distance(mouseCoords, hero.position)
      const logoSpeed = distMouseToLogo * MOVEMENT_SPEED

      hero.vx = Math.cos(angleToMouse) * logoSpeed
      hero.vy = Math.sin(angleToMouse) * logoSpeed
    }

    if (collisionDetected(initialFella, hero)) {
      hasCollided = true
      tickCollisions += 1
      const collisionPush = collisionResponse(initialFella, hero, IMPULSE_POWER)

      hero.vx = collisionPush.x * initialFella.mass * 0.1
      hero.vy = collisionPush.y * initialFella.mass * 0.1

      initialFella.vx = -(collisionPush.x * hero.mass)
      initialFella.vy = -(collisionPush.y * hero.mass)
    }

    if (tickCollisions > 0) {
      concurrentCollisions += tickCollisions
    } else {
      concurrentCollisions = 0
    }

    // Until lil fella collides with something it should float around
    if (!hasCollided) {
      initialFella.vx = Math.cos(initialAngle) * 2.7
      initialFella.vy = Math.sin(initialAngle) * 2.7
    }

    // If stuck, up the velocity
    const isStuck = concurrentCollisions > 30
    const velocityMultipler = isStuck ? 15 : 1

    initialFella.x += initialFella.vx * ticker.deltaTime * velocityMultipler
    initialFella.y += initialFella.vy * ticker.deltaTime * velocityMultipler

    hero.x += hero.vx * ticker.deltaTime
    hero.y += hero.vy * ticker.deltaTime
  })
})()

function distance(pointA: Point, pointB: Point) {
  const a = pointA.x - pointB.x
  const b = pointA.y - pointB.y
  return Math.hypot(a, b)
}
