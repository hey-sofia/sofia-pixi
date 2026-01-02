import { Color, Text, Ticker } from "pixi.js";
import "@pixi/layout";
import {
  LayoutContainer,
  LayoutContainerOptions,
} from "@pixi/layout/components";
import { tweenColor, UIColors } from "../colors";
import { uiLabel } from "../text/labels";

export type UIButtonOptions = LayoutContainerOptions & {
  labelText: string;
};

/** Basic UI button component */
export class UIButton extends LayoutContainer {
  private labelText: string;
  private uiLabel?: Text = undefined;

  private readonly idleFill = UIColors.LILAC_FILL;
  private readonly hoverFill = UIColors.LILAC_STROKE;
  private readonly animationSpeed = 0.15;

  private fromFill = new Color(this.idleFill);
  private toFill = new Color(this.idleFill);

  private elapsed = 0;
  private isAnimating = false;

  constructor(o: UIButtonOptions, ticker: Ticker) {
    super(o);
    this.eventMode = "static";
    this.cursor = "pointer";

    this.labelText = o.labelText;
    this.uiLabel = uiLabel(this.labelText);

    if (!this.uiLabel) return;

    this.addChild(this.uiLabel);

    this.setEventHandlers();
    ticker.add((t) => this.animate(t.deltaTime, t.FPS), this);
  }

  private setEventHandlers() {
    this.on("pointerover", this.onPointerOver);
    this.on("pointerout", this.onPointerOut);
  }

  private animate(delta: number, fps: number) {
    if (!this.isAnimating) return;

    this.elapsed += delta / fps;
    const t = Math.min(this.elapsed / this.animationSpeed, 1);

    const newFill = tweenColor(this.fromFill, this.toFill, t);

    this.updateBackground(newFill);

    if (t >= 1) this.isAnimating = false;
  }

  private startAnimation(targetHex: number) {
    this.fromFill = new Color(this.toFill);
    this.toFill = new Color(targetHex);

    this.elapsed = 0;
    this.isAnimating = true;
  }

  private updateBackground(color: Color): void {
    if (!this.layout) return;

    this.layout.setStyle({
      backgroundColor: color.toHexa(),
    });
  }
  private onPointerOver() {
    this.startAnimation(this.hoverFill);
  }

  private onPointerOut() {
    this.startAnimation(this.idleFill);
  }
}
