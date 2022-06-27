import { overlay } from "./InspectorGui";

export default class InspectorHighlight {
  constructor(inspector) {
    this.gui = inspector.gui;
    this.graphics = new overlay.PIXI.Graphics();
    this.rendererSizeText = new overlay.PIXI.Text("", {
      fontSize: 20,
      fill: 0x007eff,
    });
    this.fixedSizeText = new overlay.PIXI.Text("", {
      fontSize: 20,
      fill: 0xff7f00,
    });

    inspector.gui.container.addChild(this.graphics);
    inspector.gui.container.addChild(this.fixedSizeText);
    inspector.gui.container.addChild(this.rendererSizeText);
    // if (this.graphics.transform && this.graphics.transform.worldTransform) {
    //   this.defaultTransform = this.graphics.transform.worldTransform.clone()
    // }
    inspector.registerHook("afterRender", this.update.bind(this));
  }

  update(_, renderer) {
    const box = this.graphics;
    const fixedSizeText = this.fixedSizeText;
    const rendererSizeText = this.rendererSizeText;

    const node = InspectorHighlight.node;
    if (node && node.parent) {
      box.visible = true;
      rendererSizeText.visible = true;
      box.clear();
      // if (node.texture && node.transform && node.transform.worldTransform) {
      //   box.lineStyle(1, 0xffaa40, 1)
      //   box.beginFill(0xff8500, 0.235)
      //   const width = node.texture.width
      //   const height = node.texture.height
      //   if (node.anchor) {
      //     box.drawRect(width * -1 * node.anchor.x, height * -1 * node.anchor.y, width, height)
      //   } else {
      //     box.drawRect(0, 0, width, height)
      //   }
      //   node.updateTransform()
      //   box.transform.setFromMatrix(node.transform.worldTransform)
      // } else {
      // if (this.defaultTransform) {
      //   box.transform.setFromMatrix(this.defaultTransform)
      // }
      // box.lineStyle(1, 0xffaa40, 1)
      // box.beginFill(0x007eff, 0.05)
      box.beginFill(0x007eff, 0.3);
      box.lineStyle(1, 0x007eff, 0.6);
      const bounds = node.getBounds();
      let x = node.x;
      let y = node.y;
      let parent = node.parent;

      while (parent !== null) {
        x += parent.x;
        y += parent.y;

        parent = parent.parent;
      }

      const canvasScale = InspectorHighlight.getHtmlElementScale(renderer.view);

      const scale = renderer.screen
        ? {
            x:
              (renderer.view.offsetWidth * canvasScale) / renderer.screen.width,
            y:
              (renderer.view.offsetHeight * canvasScale) /
              renderer.screen.height,
          }
        : {
            x: this.gui.resolution.x / renderer.resolution,
            y: this.gui.resolution.y / renderer.resolution,
          };
      box.drawRect(
        bounds.x * scale.x,
        bounds.y * scale.y,
        bounds.width * scale.x,
        bounds.height * scale.y
      );
      rendererSizeText.position.set(
        bounds.x * scale.x + 10,
        bounds.y > 30 ? bounds.y * scale.y - 30 : bounds.y * scale.y + 10
      );
      rendererSizeText.text = `x:${bounds.x} y:${bounds.y} w:${bounds.width} h:${bounds.height}`;

      const offDisplay =
        bounds.x + bounds.width < 0 ||
        bounds.y + bounds.height < 0 ||
        renderer.width / renderer.resolution < bounds.x * scale.x ||
        renderer.height / renderer.resolution < bounds.y * scale.y;

      box
        .lineStyle(2, offDisplay ? 0xff0000 : 0x007eff, 0.3)
        .moveTo(
          renderer.width / renderer.resolution / 2,
          renderer.height / renderer.resolution / 2
        )
        .lineTo(
          bounds.x * scale.x + (bounds.width * scale.x) / 2,
          bounds.y * scale.y + (bounds.height * scale.y) / 2
        );
      if (
        node.hasOwnProperty("fixedWidth") &&
        node.hasOwnProperty("fixedHeight")
      ) {
        box.beginFill(0xff7f00, 0.3);
        box.lineStyle(1, 0xff7f00, 0.6);
        box.drawRect(
          x * scale.x,
          y * scale.y,
          node.fixedWidth * scale.x,
          node.fixedHeight * scale.y
        );

        fixedSizeText.visible = true;
        fixedSizeText.position.set(
          x * scale.x + 10,
          y > 30 ? y * scale.y - 30 : y * scale.y + 10
        );
        fixedSizeText.text = `x:${x} y:${y} w:${node.fixedWidth} h:${node.fixedHeight}`;
      } else {
        fixedSizeText.visible = false;
      }
      box.endFill();
    } else {
      box.visible = false;
      fixedSizeText.visible = false;
      rendererSizeText.visible = false;
    }
  }

  static getHtmlElementScale(element) {
    if (!window.getComputedStyle || !element) return 1;

    const { transform } = window.getComputedStyle(element);

    const transformMatrix3d = transform.match(/^matrix3d\((.+)\)$/);

    if (transformMatrix3d)
      return parseFloat(transformMatrix3d[1].split(", ")[13]);

    const transformMatrix2d = transform.match(/^matrix\((.+)\)$/);

    if (transformMatrix2d)
      return parseFloat(transformMatrix2d[1].split(", ")[3]);

    return 1;
  }
}

InspectorHighlight.node = false;
