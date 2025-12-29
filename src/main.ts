import { Application, Point } from "pixi.js"
import { collisionDetected, collisionResponse } from "./physics/collision"
import { distance } from "./helpers/maths"
import { PhysicsSprite } from "./types/sprites"

const MOVEMENT_SPEED = 0.4
const IMPULSE_POWER = 4.6

const SPRITE_SIZE = 100
const SPRITE_COLLISION_RADIUS = 46

;(async () => {
  // initialise PixiJS
  const app = new Application()
  await app.init({ backgroundAlpha: 0, resizeTo: window })
  document.getElementById("pixi-container")!.appendChild(app.canvas)
  app.stage.eventMode = "static"
  app.stage.hitArea = app.screen

  // Mouse xy will dictate hero's xy, so initialise in sort-of middle
  const initMouseX = app.screen.width / 2 + SPRITE_SIZE
  const initMouseY = SPRITE_SIZE
  const mousePoint = new Point(initMouseX, initMouseY)

  // event handlers
  app.stage.on("pointermove", (e) => {
    mousePoint.x = e.global.x
    mousePoint.y = e.global.y
  })

  // Add hero sprite
  const hero = new PhysicsSprite({
    asset: "sofia-logo.svg",
    shape: "circle",
    radius: 50,
    mass: 1,
    point: mousePoint,
  })
  app.stage.addChild(hero)

  // Add 'enemy' sprite
  const enemyStartingPoint = new Point(
    app.screen.width - SPRITE_SIZE,
    (app.screen.height - SPRITE_SIZE * 3) / 2
  )
  const enemy = new PhysicsSprite({
    asset: "lil-fella.svg",
    shape: "circle",
    radius: 50,
    mass: 3,
    point: enemyStartingPoint,
  })
  app.stage.addChild(enemy)

  // initial state
  let hasCollided = false
  let concurrentCollisions = 0

  // random initial path for enemy
  const enemyStartingAngle = Math.floor(Math.random() * 360)

  app.ticker.add((ticker) => {
    let tickCollisions = 0
    enemy.velocity.x = enemy.velocity.x * 0.99
    enemy.velocity.y = enemy.velocity.y * 0.99

    hero.velocity.x = hero.velocity.x * 0.99
    hero.velocity.x = hero.velocity.x * 0.99

    // Bounce lilFella off the edges!
    if (enemy.x < SPRITE_COLLISION_RADIUS || enemy.x > app.screen.width - SPRITE_COLLISION_RADIUS) {
      hasCollided = true
      tickCollisions += 1
      enemy.velocity.x = enemy.velocity.x === 0 ? -1 : -enemy.velocity.x
    }
    if (
      enemy.y < SPRITE_COLLISION_RADIUS ||
      enemy.y > app.screen.height - SPRITE_COLLISION_RADIUS
    ) {
      hasCollided = true
      tickCollisions += 1
      enemy.velocity.y = enemy.velocity.y === 0 ? -1.2 : -enemy.velocity.y
    }

    // Pop lilFella back in middle
    if (
      enemy.x <= -SPRITE_COLLISION_RADIUS ||
      enemy.x >= app.screen.width + SPRITE_COLLISION_RADIUS ||
      enemy.y <= -SPRITE_COLLISION_RADIUS ||
      enemy.y >= app.screen.height + SPRITE_COLLISION_RADIUS
    ) {
      enemy.position.set((app.screen.width - 100) / 2, (app.screen.height - 100) / 2)
    }

    // tie hero position to mouse position, adjustable via MOVEMENT_SPEED
    if (
      app.screen.width > mousePoint.x ||
      mousePoint.x > 0 ||
      app.screen.height > mousePoint.y ||
      mousePoint.y > 0
    ) {
      const toMouseDirection = new Point(mousePoint.x - hero.x, mousePoint.y - hero.y)

      const angleToMouse = Math.atan2(toMouseDirection.y, toMouseDirection.x)

      const distMouseToLogo = distance(mousePoint, hero.position)
      const logoSpeed = distMouseToLogo * MOVEMENT_SPEED

      // console.log(angleToMouse)
      hero.velocity.x = Math.cos(angleToMouse) * logoSpeed
      hero.velocity.y = Math.sin(angleToMouse) * logoSpeed
    }

    // track collision, apply small impact to hero and big impact to enemy
    if (collisionDetected(enemy, hero)) {
      hasCollided = true
      tickCollisions += 1
      const collisionPush = collisionResponse(enemy, hero, IMPULSE_POWER)

      hero.velocity.x = collisionPush.x * enemy.mass * 0.1
      hero.velocity.y = collisionPush.y * enemy.mass * 0.1

      enemy.velocity.x = -(collisionPush.x * hero.mass)
      enemy.velocity.y = -(collisionPush.y * hero.mass)
    }

    // tally concurrent collisions
    if (tickCollisions > 0) {
      concurrentCollisions += tickCollisions
    } else {
      concurrentCollisions = 0
    }

    // Until lil fella collides with something it should float around
    if (!hasCollided) {
      enemy.velocity.x = Math.cos(enemyStartingAngle) * 2.7
      enemy.velocity.y = Math.sin(enemyStartingAngle) * 2.7
    }

    // If stuck, up the velocity
    // TODO: Check if this is needed
    const isStuck = concurrentCollisions > 30
    const velocityMultipler = isStuck ? 15 : 1

    // apply velocity to active sprite positions
    enemy.x += enemy.velocity.x * ticker.deltaTime * velocityMultipler
    enemy.y += enemy.velocity.y * ticker.deltaTime * velocityMultipler

    hero.x += hero.velocity.x * ticker.deltaTime
    hero.y += hero.velocity.y * ticker.deltaTime
  })
})()
