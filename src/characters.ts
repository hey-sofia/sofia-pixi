import { Application, Assets, Point, Renderer, Sprite } from "pixi.js";
import { BouncySprite } from "./types/sprites";

const addSprite = async (
  app: Application<Renderer>,
  asset: string,
  mass: number,
  point?: Point
): Promise<BouncySprite> => {
  const texture = await Assets.load(`/assets/${asset}`);
  const s = new Sprite(texture) as BouncySprite;

  if (point) {
    s.position.set(point.x, point.y);
  } else {
    s.position.set(0);
  }
  s.anchor.set(0.5);
  s.width = 100;
  s.height = 100;
  s.vx = 0;
  s.vy = 0;
  s.mass = mass;

  app.stage.addChild(s);
  return s;
};

export { addSprite };
