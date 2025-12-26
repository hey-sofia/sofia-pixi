import { Sprite } from "pixi.js";

export type BouncySprite = Sprite & {
  vx: number;
  vy: number;
  mass: number;
};
