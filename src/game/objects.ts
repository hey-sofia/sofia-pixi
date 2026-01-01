import { Application, Renderer, Point, Rectangle, Text, isMobile } from "pixi.js"
import { PhysicsSprite } from "../types/sprites"
import { infoText } from "../types/ui/text/info"

const X_PADDING = 20
const Y_PADDING = 10

export function addGameObjects(
  app: Application<Renderer>,
  spriteSize: number,
  spriteRadius: number
) {
  // Mouse xy will dictate hero's xy, so initialise in sort-of middle
  const initMouseX = app.screen.width / 2 + spriteSize
  const initMouseY = spriteSize
  const mousePoint = new Point(initMouseX, initMouseY)

  const hero = new PhysicsSprite({
    asset: "sofia-logo.svg",
    shapeType: "circle",
    radius: spriteRadius,
    mass: 1,
    point: mousePoint,
    attachedToMouse: true,
  })

  app.stage.addChild(hero)

  if (!isMobile.phone) {
    const { initialMouseInfoText, mouseInfo2Text, mouseReleasedText } = addMouseInfoText(app)

    hero.on("rightclick", () => {
      const clicksLeftBeforeRelease = hero.getClicksLeftBeforeMouseFreed()

      if (clicksLeftBeforeRelease > 1) {
        mouseInfo2Text.visible = false
        mouseReleasedText.visible = false

        setMouseInfoPosition(initialMouseInfoText, app.screen)
        initialMouseInfoText.visible = true
      } else if (clicksLeftBeforeRelease === 1) {
        initialMouseInfoText.visible = false
        mouseReleasedText.visible = false

        setMouseInfoPosition(mouseInfo2Text, app.screen)
        mouseInfo2Text.visible = true
      } else {
        initialMouseInfoText.visible = false
        mouseInfo2Text.visible = false

        setMouseInfoPosition(mouseReleasedText, app.screen)
        mouseReleasedText.visible = true
      }
    })
  }

  // Add 'enemy' sprite
  const enemyStartingPoint = new Point(
    app.screen.width - spriteSize,
    (app.screen.height - spriteSize * 3) / 2
  )
  const enemy = new PhysicsSprite({
    asset: "lil-fella.svg",
    shapeType: "circle",
    radius: spriteRadius,
    mass: 3,
    point: enemyStartingPoint,
  })
  app.stage.addChild(enemy)

  return { hero, enemy, mousePoint }
}

function addMouseInfoText(app: Application<Renderer>) {
  // Starting mouse info - initally visible
  const startingMouseInfoText = infoText("To free mouse, right-click twice", true)
  setMouseInfoPosition(startingMouseInfoText, app.screen)

  // Subsequent mouse info text, not visible until respective conditions met
  const rightClickAgainText = infoText("Right-click again")
  const mouseFreedText = infoText("Mouse freed! Right-click on logo to re-attach")

  app.stage.addChild(startingMouseInfoText, rightClickAgainText, mouseFreedText)

  return {
    initialMouseInfoText: startingMouseInfoText,
    mouseInfo2Text: rightClickAgainText,
    mouseReleasedText: mouseFreedText,
  }
}

export function setMouseInfoPosition(t: Text, screen: Rectangle) {
  t.position.set(screen.width - t.width - X_PADDING, t.height + Y_PADDING)
}
