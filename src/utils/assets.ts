import { Assets, Texture } from "pixi.js";
import { Textures } from "../types/sprites/textures";

export const initAssets = async () => {
  await Assets.init({
    basePath: "assets/",
    manifest: "/assets/manifest.json",
  });
};

export const loadTextures = async () => {
  const logo = await Assets.load<Texture>(Textures.LOGO);
  const lilFella = await Assets.load<Texture>(Textures.LIL_FELLA);
  return { logo, lilFella };
};
