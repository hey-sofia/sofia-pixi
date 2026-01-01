import { Text } from "pixi.js"

export const infoText = (text: string, visible: boolean = false) => {
  const t = new Text({
    text,
    style: {
      fill: 0xffffff,
      fontSize: 20,
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      align: "center",
    },
  })

  t.visible = visible

  return t
}
