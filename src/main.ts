import { Application, isMobile, Point, Rectangle, Renderer } from "pixi.js"
import { collisionDetected, collisionResponse } from "./physics/collision"
import { distance } from "./utils/maths"
import { PhysicsSprite } from "./types/sprites/PhysicsSprite"
import { UIButton } from "./types/ui/components/buttons"
import { UIColors } from "./types/ui/colors"
import { addGameObjects as loadGameObjects } from "./game/objects"
import { initAssets } from "./utils/assets"

const MOVEMENT_SPEED = 0.4

const IMPULSE_POWER_DESKTOP = 4.6
const IMPULSE_POWER_MOBILE = 4.4

const SPRITE_WIDTH_DESKTOP = 100
const SPRITE_WIDTH_MOBILE = 90

const SPRITE_RADIUS_DESKTOP = 50
const SPRITE_RADIUS_MOBILE = 45

const X_PADDING = 20
const Y_PADDING = 20

// initial state
let hasCollided = false

;(async () => {
  // initialise PixiJS
  const app = new Application()
  await app.init({ backgroundAlpha: 0, resizeTo: window })
  document.getElementById("pixi-container")!.appendChild(app.canvas)
  app.stage.eventMode = "static"
  app.stage.cursor = "auto"
  app.stage.hitArea = app.screen

  // keep stage invisible until assets have finished loading
  app.stage.visible = false

  // load assets
  await initAssets()

  // WIP
  const buttonActionText = isMobile.phone ? "Tap on" : "Hover over"
  const button = new UIButton(
    {
      labelText: `${buttonActionText} me 🥴`,
      layout: {
        backgroundColor: UIColors.LILAC_FILL,
        borderRadius: 20,
        width: 220,
        height: 50,
        alignContent: "center",
      },
    },
    app.ticker
  )
  button.position.set(X_PADDING, Y_PADDING)

  app.stage.addChild(button)

  // Sprite adjustments for Mobile
  const spriteSize = isMobile.phone ? SPRITE_WIDTH_MOBILE : SPRITE_WIDTH_DESKTOP
  const spriteRadius = isMobile.phone ? SPRITE_RADIUS_MOBILE : SPRITE_RADIUS_DESKTOP
  const impulsePower = isMobile.phone ? IMPULSE_POWER_MOBILE : IMPULSE_POWER_DESKTOP

  // Add game objects (character sprites, mouse point etc.)
  const { hero, enemy, mousePoint } = await loadGameObjects(app, spriteSize, spriteRadius)

  // assets loaded, show stage
  app.stage.visible = true

  // event handlers
  addEventHandlers(app, mousePoint)

  // random initial path for enemy
  const enemyStartingAngle = Math.floor(Math.random() * 360)

  app.ticker.add((ticker) => {
    enemy.velocity.x = enemy.velocity.x * 0.99
    enemy.velocity.y = enemy.velocity.y * 0.99

    hero.velocity.x = hero.velocity.x * 0.99
    hero.velocity.x = hero.velocity.x * 0.99

    // tie hero position to mouse position, adjustable via MOVEMENT_SPEED
    const mouseOnScreen =
      app.screen.width > mousePoint.x ||
      mousePoint.x > 0 ||
      app.screen.height > mousePoint.y ||
      mousePoint.y > 0
    if (hero.attachedToMouse && mouseOnScreen) {
      const toMouseDirection = new Point(mousePoint.x - hero.x, mousePoint.y - hero.y)

      const angleToMouse = Math.atan2(toMouseDirection.y, toMouseDirection.x)

      const distMouseToLogo = distance(mousePoint, hero.position)
      const logoSpeed = distMouseToLogo * MOVEMENT_SPEED

      hero.velocity.x = Math.cos(angleToMouse) * logoSpeed
      hero.velocity.y = Math.sin(angleToMouse) * logoSpeed
    }

    // track collision, apply small impact to hero and big impact to enemy
    if (collisionDetected(hero, enemy)) {
      hasCollided = true
      const collisionPush = collisionResponse(enemy, hero, impulsePower)

      hero.velocity.x = collisionPush.x * enemy.mass * 0.1
      hero.velocity.y = collisionPush.y * enemy.mass * 0.1

      enemy.velocity.x = -(collisionPush.x * hero.mass)
      enemy.velocity.y = -(collisionPush.y * hero.mass)
    }

    // Bounce lilFella off the edges!
    handleWallCollision(app.screen, enemy, hero)

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

function addEventHandlers(app: Application<Renderer>, mousePoint: Point) {
  // Disable default context menu
  app.canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault()
  })

  // follow mouse
  app.stage.on("mousemove", (e) => {
    mousePoint.x = e.global.x
    mousePoint.y = e.global.y
  })
  if (isMobile.phone) {
    // if mobile follow touch
    app.stage.on("touchmove", (e) => {
      mousePoint.x = e.global.x
      mousePoint.y = e.global.y
    })
  }
}

function handleWallCollision(screen: Rectangle, enemy: PhysicsSprite, hero: PhysicsSprite) {
  if (enemy.collidedWithWallX(screen)) {
    hasCollided = true
    enemy.velocity.x = -enemy.velocity.x
  }
  if (enemy.collidedWithWallY(screen)) {
    hasCollided = true
    enemy.velocity.y = -enemy.velocity.y
  }

  // if hero is not attached ensure they have collision with walls too
  if (!hero.attachedToMouse && hero.collidedWithWallX(screen)) {
    hero.velocity.x = -hero.velocity.x
  }
  if (!hero.attachedToMouse && hero.collidedWithWallY(screen)) {
    hero.velocity.y = -hero.velocity.y
  }
}
