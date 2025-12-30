import { Application, isMobile, Point } from "pixi.js"
import { collisionDetected, collisionResponse } from "./physics/collision"
import { distance } from "./helpers/maths"
import { PhysicsSprite } from "./types/sprites"

const MOVEMENT_SPEED = 0.4

const IMPULSE_POWER_DESKTOP = 4.6
const IMPULSE_POWER_MOBILE = 4.4

const SPRITE_WIDTH_DESKTOP = 100
const SPRITE_WIDTH_MOBILE = 90

const SPRITE_RADIUS_DESKTOP = 50
const SPRITE_RADIUS_MOBILE = 45

;(async () => {
  // initialise PixiJS
  const app = new Application()
  await app.init({ backgroundAlpha: 0, resizeTo: window })
  document.getElementById("pixi-container")!.appendChild(app.canvas)
  app.stage.eventMode = "static"
  app.stage.hitArea = app.screen

  // Sprite adjustments for Mobile
  const spriteSize = isMobile.phone ? SPRITE_WIDTH_MOBILE : SPRITE_WIDTH_DESKTOP
  const spriteRadius = isMobile.phone ? SPRITE_RADIUS_MOBILE : SPRITE_RADIUS_DESKTOP
  const impulsePower = isMobile.phone ? IMPULSE_POWER_MOBILE : IMPULSE_POWER_DESKTOP

  // Mouse xy will dictate hero's xy, so initialise in sort-of middle
  const initMouseX = app.screen.width / 2 + spriteSize
  const initMouseY = spriteSize
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
    radius: spriteRadius,
    mass: 1,
    point: mousePoint,
  })
  app.stage.addChild(hero)

  // Add 'enemy' sprite
  const enemyStartingPoint = new Point(
    app.screen.width - spriteSize,
    (app.screen.height - spriteSize * 3) / 2
  )
  const enemy = new PhysicsSprite({
    asset: "lil-fella.svg",
    shape: "circle",
    radius: spriteRadius,
    mass: 3,
    point: enemyStartingPoint,
  })
  app.stage.addChild(enemy)

  // random initial path for enemy
  const enemyStartingAngle = Math.floor(Math.random() * 360)

  // initial state
  let hasCollided = false

  app.ticker.add((ticker) => {
    enemy.velocity.x = enemy.velocity.x * 0.99
    enemy.velocity.y = enemy.velocity.y * 0.99

    hero.velocity.x = hero.velocity.x * 0.99
    hero.velocity.x = hero.velocity.x * 0.99

    // Bounce lilFella off the edges!
    const xWallColision = enemy.x < spriteRadius || enemy.x > app.screen.width - spriteRadius
    const yCollision = enemy.y < spriteRadius || enemy.y > app.screen.height - spriteRadius
    if (xWallColision) {
      hasCollided = true
      enemy.velocity.x = enemy.velocity.x === 0 ? -1 : -enemy.velocity.x
    }
    if (yCollision) {
      hasCollided = true
      enemy.velocity.y = enemy.velocity.y === 0 ? -1 : -enemy.velocity.y
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

      hero.velocity.x = Math.cos(angleToMouse) * logoSpeed
      hero.velocity.y = Math.sin(angleToMouse) * logoSpeed
    }

    // track collision, apply small impact to hero and big impact to enemy
    if (collisionDetected(enemy, hero)) {
      hasCollided = true
      const collisionPush = collisionResponse(enemy, hero, impulsePower)

      hero.velocity.x = collisionPush.x * enemy.mass * 0.1
      hero.velocity.y = collisionPush.y * enemy.mass * 0.1

      enemy.velocity.x = -(collisionPush.x * hero.mass)
      enemy.velocity.y = -(collisionPush.y * hero.mass)
    }

    // Until lil fella collides with something it should float around
    if (!hasCollided) {
      enemy.velocity.x = Math.cos(enemyStartingAngle) * 2.7
      enemy.velocity.y = Math.sin(enemyStartingAngle) * 2.7
    }

    const enemyOutOfBounds =
      enemy.x < -spriteRadius ||
      enemy.x > app.screen.width + spriteRadius ||
      enemy.y < -spriteRadius ||
      enemy.y > app.screen.height + spriteRadius
    // Pop enemy back in middle if out of bounds
    if (enemyOutOfBounds) {
      enemy.position.set((app.screen.width - 100) / 2, (app.screen.height - 100) / 2)
    }

    // apply velocity to active sprite positions
    enemy.x += enemy.velocity.x * ticker.deltaTime
    enemy.y += enemy.velocity.y * ticker.deltaTime

    hero.x += hero.velocity.x * ticker.deltaTime
    hero.y += hero.velocity.y * ticker.deltaTime
  })
})()
