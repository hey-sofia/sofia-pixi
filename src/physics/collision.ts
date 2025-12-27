import { Point } from "pixi.js";
import { BouncySprite } from "../types/sprites";

const IMPULSE_POWER = 4.6;

const collisionDetected = (spriteA: BouncySprite, spriteB: BouncySprite) => {
  const boundsA = spriteA.getBounds(); // lilFella
  const boundsB = spriteB.getBounds(); // sofiaLogo

  return (
    boundsA.x < boundsB.x + boundsB.width && // lilFella.x < (sofiaLogo.x + sofiaLogo.width)
    boundsA.x + boundsA.width > boundsB.x && //
    boundsA.y < boundsB.y + boundsB.height &&
    boundsA.y + boundsA.height > boundsB.y
  );
};

const collisionResponse = (spriteA: BouncySprite, spriteB: BouncySprite, impulsePower?: number) => {
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
  const power = impulsePower !== undefined ? impulsePower : IMPULSE_POWER;
  const impulse = (power * speed) / (spriteA.mass + spriteB.mass);

  return new Point(impulse * collision.x, impulse * collision.y);
};

export { collisionDetected, collisionResponse };
