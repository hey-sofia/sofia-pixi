import { Text } from "pixi.js";

/** Simple centre-aligned text object intended for use with `UIButton` */
export const uiLabel = (text: string) => {
  const textObj = new Text({
    text: text,
    style: {
      fill: 0xffffff,
      fontSize: 20,
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      align: "center",
    },
  });

  textObj.layout = {
    alignSelf: "center",
    marginLeft: "auto",
    marginRight: "auto",
  };

  return textObj;
};
