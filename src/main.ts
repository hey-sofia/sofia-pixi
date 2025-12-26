import { Application, Point } from "pixi.js";
import { addBouncySprite } from "./characters";
import { BouncySprite } from "./types/sprites";

const MOVEMENT_SPEED = 0.4;
const IMPULSE_POWER = 4.6;
const SPRITE_SIZE = 100;
const SPRITE_EDGE = 46;

(async () => {
  const app = new Application();
  await app.init({ background: "#7181c1ff", resizeTo: window });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

  const mouseCoords = new Point(0, 0);
  app.stage.on("mousemove", (e) => {
    mouseCoords.x = e.global.x;
    mouseCoords.y = e.global.y;
  });

  app.stage.on("touchmove", (e) => {
    mouseCoords.x = e.global.x;
    mouseCoords.y = e.global.y;
  });

  // Add characters
  const initLilFellaPosition = new Point(
    (app.screen.width - SPRITE_SIZE) / 2,
    (app.screen.height - SPRITE_SIZE) / 2
  );
  const lilFella = await addBouncySprite(app, "lil-fella.svg", 3, initLilFellaPosition);
  const sofiaLogo = await addBouncySprite(app, "sofia-logo.svg", 1, mouseCoords);

  // Listen for animate update
  app.ticker.add((ticker) => {
    lilFella.vx = lilFella.vx * 0.99;
    lilFella.vy = lilFella.vy * 0.99;

    sofiaLogo.vx = sofiaLogo.vx * 0.99;
    sofiaLogo.vy = sofiaLogo.vy * 0.99;

    // Bounce lilFella off the edges!
    if (lilFella.x < SPRITE_EDGE || lilFella.x > app.screen.width - SPRITE_EDGE) {
      lilFella.vx = -lilFella.vx;
    }
    if (lilFella.y < SPRITE_EDGE || lilFella.y > app.screen.height - SPRITE_EDGE) {
      lilFella.vy = -lilFella.vy;
    }

    // Pop lilFella back in middle
    if (
      lilFella.x < -SPRITE_EDGE ||
      lilFella.x > app.screen.width + SPRITE_EDGE ||
      lilFella.y < -SPRITE_EDGE ||
      lilFella.y > app.screen.height + SPRITE_EDGE
    ) {
      lilFella.position.set((app.screen.width - 100) / 2, (app.screen.height - 100) / 2);
    }

    // if mouse off screen, don't update
    if (
      app.screen.width > mouseCoords.x ||
      mouseCoords.x > 0 ||
      app.screen.height > mouseCoords.y ||
      mouseCoords.y > 0
    ) {
      const toMouseDirection = new Point(mouseCoords.x - sofiaLogo.x, mouseCoords.y - sofiaLogo.y);

      const angleToMouse = Math.atan2(toMouseDirection.y, toMouseDirection.x);

      const distMouseToLogo = distance(mouseCoords, sofiaLogo.position);
      const logoSpeed = distMouseToLogo * MOVEMENT_SPEED;

      sofiaLogo.vx = Math.cos(angleToMouse) * logoSpeed;
      sofiaLogo.vy = Math.sin(angleToMouse) * logoSpeed;
    }

    if (collisionDetected(lilFella, sofiaLogo)) {
      const collisionPush = collisionResponse(lilFella, sofiaLogo);

      sofiaLogo.vx = collisionPush.x * lilFella.mass * 0.1;
      sofiaLogo.vy = collisionPush.y * lilFella.mass * 0.1;

      lilFella.vx = -(collisionPush.x * sofiaLogo.mass);
      lilFella.vy = -(collisionPush.y * sofiaLogo.mass);
    }

    lilFella.x += lilFella.vx * ticker.deltaTime;
    lilFella.y += lilFella.vy * ticker.deltaTime;

    sofiaLogo.x += sofiaLogo.vx * ticker.deltaTime;
    sofiaLogo.y += sofiaLogo.vy * ticker.deltaTime;
  });
})();

function collisionDetected(spriteA: BouncySprite, spriteB: BouncySprite) {
  const boundsA = spriteA.getBounds(); // lilFella
  const boundsB = spriteB.getBounds(); // sofiaLogo

  return (
    boundsA.x < boundsB.x + boundsB.width && // lilFella.x < (sofiaLogo.x + sofiaLogo.width)
    boundsA.x + boundsA.width > boundsB.x && //
    boundsA.y < boundsB.y + boundsB.height &&
    boundsA.y + boundsA.height > boundsB.y
  );
}

function collisionResponse(spriteA: BouncySprite, spriteB: BouncySprite) {
  if (!spriteA || !spriteB) {
    return new Point(0);
  }
  const horizontal = spriteB.x - spriteA.x;
  const vertical = spriteB.y - spriteA.y;
  const distance = Math.sqrt(horizontal * horizontal + vertical * vertical);

  const collisionRaw = new Point(horizontal, vertical);
  const collision = new Point(collisionRaw.x / distance, collisionRaw.y / distance);

  const vRelativeVelocity = new Point(spriteA.vx - spriteB.vx, spriteA.vy - spriteB.vy);

  const speed = vRelativeVelocity.x * collision.x + vRelativeVelocity.y * collision.y;
  const impulse = (IMPULSE_POWER * speed) / (spriteA.mass + spriteB.mass);

  return new Point(impulse * collision.x, impulse * collision.y);
}

function distance(pointA: Point, pointB: Point) {
  const a = pointA.x - pointB.x;
  const b = pointA.y - pointB.y;
  return Math.hypot(a, b);
}
