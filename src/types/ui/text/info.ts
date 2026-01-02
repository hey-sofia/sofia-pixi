import { Assets, BitmapText } from "pixi.js";
import { Fonts } from "../fonts";

export const infoText = async (text: string, visible: boolean = false) => {
  const fontFace = await Assets.load<FontFace>(Fonts.EXCALIFONT);
  const t = new BitmapText({
    text,
    style: {
      fill: 0xffffff,
      fontSize: 20,
      fontFamily: fontFace.family,
      align: "center",
    },
  });

  t.visible = visible;

  return t;
};
