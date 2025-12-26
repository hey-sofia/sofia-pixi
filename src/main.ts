import { Application, Point } from "pixi.js";
import { addSprite } from "./characters";
import { BouncySprite } from "./types/sprites";

const MOVEMENT_SPEED = 0.5;
const IMPULSE_POWER = 5;

(async () => {
  const app = new Application();
  await app.init({ background: "#1099bb", resizeTo: window });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const mouseCoords = new Point(0, 0);

  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

  app.stage.on("mousemove", (e) => {
    mouseCoords.x = e.global.x;
    mouseCoords.y = e.global.y;
  });

  // Add characters
  const lilFellaStartingPosition = new Point(
    (app.screen.width - 100) / 2,
    (app.screen.height - 100) / 2
  );
  const lilFella = await addSprite(app, "lil-fella.svg", 3, lilFellaStartingPosition);
  const sofiaLogo = await addSprite(app, "sofia-logo.svg", 1);

  // Listen for animate update
  app.ticker.add((ticker) => {
    lilFella.vx = lilFella.vx * 0.99;
    lilFella.vy = lilFella.vy * 0.99;

    sofiaLogo.vx = sofiaLogo.vx * 0.99;
    sofiaLogo.vy = sofiaLogo.vy * 0.99;

    // Check if lilFella has moved off screen
    if (lilFella.x < 0 || lilFella.x > app.screen.width - 100) {
      lilFella.vx = -lilFella.vx;
    }
    if (lilFella.y < 0 || lilFella.y > app.screen.height - 100) {
      lilFella.vy = -lilFella.vy;
    }

    // Pop lilFella back in middle
    if (
      lilFella.x < -30 ||
      lilFella.x > app.screen.width + 30 ||
      lilFella.y < -30 ||
      lilFella.y > app.screen.height + 30
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

      sofiaLogo.vx = collisionPush.x * lilFella.mass;
      sofiaLogo.vy = collisionPush.y * lilFella.mass;

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
  const boundsA = spriteA.getBounds();
  const boundsB = spriteB.getBounds();

  return (
    boundsA.x < boundsB.x + boundsB.width &&
    boundsA.x + boundsA.width > boundsB.x &&
    boundsA.y < boundsB.y + boundsB.height &&
    boundsA.y + boundsA.height > boundsB.y
  );
}

function collisionResponse(spriteA: BouncySprite, spriteB: BouncySprite) {
  const dx = spriteB.x - spriteA.x;
  const dy = spriteB.y - spriteA.y;

  // Avoid division by zero
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;

  const vCollision = new Point(dx, dy);
  const vCollisionNorm = new Point(vCollision.x / dist, vCollision.y / dist);
  const vRelativeVelocity = new Point(spriteA.vx - spriteB.vx, spriteA.vy - spriteB.vy);

  const speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;

  const impulse = (IMPULSE_POWER * speed) / spriteA.mass;

  return new Point(impulse * vCollisionNorm.x, impulse * vCollisionNorm.y);
}

function distance(pointA: Point, pointB: Point) {
  const a = pointA.x - pointB.x;
  const b = pointA.y - pointB.y;
  return Math.hypot(a, b);
}
