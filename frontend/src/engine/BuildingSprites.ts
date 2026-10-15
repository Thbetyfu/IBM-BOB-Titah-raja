/**
 * Titah Rakyat: Sovereign of the Living Realm
 * 2.5D Isometric Building Sprites & Royal Badges (SDD Bab 5.2)
 *
 * Ingests Hand-Painted 2.5D Royal Nusantara Assets:
 * 1. Balai Wanua (Joglo Keraton Agung, Levels 1-3)
 * 2. Lumbung Desa (Elevated Teak Granary, Levels 1-3)
 * 3. Pos Ronda (Bastion Watchtower & Kentongan, Levels 1-3)
 */

import { Container, Graphics, Sprite, Assets, Text, TextStyle } from "pixi.js";
import { IsometricMap } from "./IsometricMap";

export class BuildingSprites {
  public container!: Container;
  private balaiNode!: Container;
  private lumbungNode!: Container;
  private posRondaNode!: Container;

  private currentBalaiLv: number = 2;
  private currentLumbungLv: number = 2;
  private currentPosRondaLv: number = 1;

  public init(parent: Container): void {
    this.container = parent;

    this.balaiNode = new Container();
    this.lumbungNode = new Container();
    this.posRondaNode = new Container();

    this.container.addChild(this.balaiNode);
    this.container.addChild(this.lumbungNode);
    this.container.addChild(this.posRondaNode);

    // Position buildings on strategic isometric kingdom coordinates
    const balaiPos = IsometricMap.gridToScreen(8, 5);
    this.balaiNode.position.set(balaiPos.x, balaiPos.y);
    this.renderBalaiWanua(this.balaiNode, 2);

    const lumbungPos = IsometricMap.gridToScreen(11, 4);
    this.lumbungNode.position.set(lumbungPos.x, lumbungPos.y);
    this.renderLumbungDesa(this.lumbungNode, 2);

    const posRondaPos = IsometricMap.gridToScreen(5, 7);
    this.posRondaNode.position.set(posRondaPos.x, posRondaPos.y);
    this.renderPosRonda(this.posRondaNode, 1);
  }

  public updateLevels(balaiLv: number, lumbungLv: number, posRondaLv: number): void {
    if (!this.balaiNode || !this.lumbungNode || !this.posRondaNode) return;

    if (balaiLv !== this.currentBalaiLv) {
      this.currentBalaiLv = balaiLv;
      this.balaiNode.removeChildren();
      this.renderBalaiWanua(this.balaiNode, balaiLv);
    }

    if (lumbungLv !== this.currentLumbungLv) {
      this.currentLumbungLv = lumbungLv;
      this.lumbungNode.removeChildren();
      this.renderLumbungDesa(this.lumbungNode, lumbungLv);
    }

    if (posRondaLv !== this.currentPosRondaLv) {
      this.currentPosRondaLv = posRondaLv;
      this.posRondaNode.removeChildren();
      this.renderPosRonda(this.posRondaNode, posRondaLv);
    }
  }

  /**
   * Balai Wanua: Royal Joglo Keraton Agung 2.5D Isometric Sprite
   */
  private renderBalaiWanua(node: Container, level: number): void {
    const safeLv = Math.min(3, Math.max(1, level));

    // 1. Soft Ambient Ground Shadow
    const shadow = new Graphics();
    shadow.ellipse(0, 4, 52, 26);
    shadow.fill({ color: 0x000000, alpha: 0.42 });
    node.addChild(shadow);

    // 2. High-Fidelity 2.5D Handcrafted Sprite
    const spritePath = `/assets/buildings/balai_wanua_lv${safeLv}.png`;
    const texture = Assets.get(spritePath);
    const sprite = texture ? new Sprite(texture) : Sprite.from(spritePath);
    sprite.anchor.set(0.5, 0.76);
    sprite.scale.set(0.34);
    node.addChild(sprite);

    // 3. Royal Level Inscribed Plaque
    this.addBadge(node, "Balai Wanua", safeLv, 0, -96);
  }

  /**
   * Lumbung Desa: Elevated Nusantara Granary 2.5D Isometric Sprite
   */
  private renderLumbungDesa(node: Container, level: number): void {
    const safeLv = Math.min(3, Math.max(1, level));

    // 1. Soft Ambient Ground Shadow
    const shadow = new Graphics();
    shadow.ellipse(0, 4, 40, 20);
    shadow.fill({ color: 0x000000, alpha: 0.38 });
    node.addChild(shadow);

    // 2. High-Fidelity 2.5D Handcrafted Sprite
    const spritePath = `/assets/buildings/lumbung_desa_lv${safeLv}.png`;
    const texture = Assets.get(spritePath);
    const sprite = texture ? new Sprite(texture) : Sprite.from(spritePath);
    sprite.anchor.set(0.5, 0.82);
    sprite.scale.set(0.30);
    node.addChild(sprite);

    // 3. Royal Level Inscribed Plaque
    this.addBadge(node, "Lumbung Desa", safeLv, 0, -88);
  }

  /**
   * Pos Ronda: Frontier Watchtower & Kentongan 2.5D Isometric Sprite
   */
  private renderPosRonda(node: Container, level: number): void {
    const safeLv = Math.min(3, Math.max(1, level));

    // 1. Soft Ambient Ground Shadow
    const shadow = new Graphics();
    shadow.ellipse(0, 4, 34, 18);
    shadow.fill({ color: 0x000000, alpha: 0.36 });
    node.addChild(shadow);

    // 2. High-Fidelity 2.5D Handcrafted Sprite
    const spritePath = `/assets/buildings/pos_ronda_lv${safeLv}.png`;
    const texture = Assets.get(spritePath);
    const sprite = texture ? new Sprite(texture) : Sprite.from(spritePath);
    sprite.anchor.set(0.5, 0.86);
    sprite.scale.set(0.30);
    node.addChild(sprite);

    // 3. Royal Level Inscribed Plaque
    this.addBadge(node, "Pos Ronda", safeLv, 0, -98);
  }

  /**
   * Royal Inscribed Plaque Badge
   */
  private addBadge(node: Container, title: string, level: number, x: number, y: number): void {
    const badgeContainer = new Container();
    badgeContainer.position.set(x, y);

    const bg = new Graphics();
    // Bronze & gold royal border plaque
    bg.roundRect(-46, -11, 92, 22, 6);
    bg.fill({ color: 0x141a14, alpha: 0.92 });
    bg.stroke({ color: 0xd4af37, width: 1.5, alpha: 0.9 });

    // Inner gold corner accent
    bg.circle(-40, 0, 1.5);
    bg.circle(40, 0, 1.5);
    bg.fill({ color: 0xffd700, alpha: 0.9 });

    const style = new TextStyle({
      fontFamily: "Inter, 'Cinzel', serif",
      fontSize: 10,
      fontWeight: "bold",
      fill: "#ffd700",
      align: "center",
      dropShadow: {
        alpha: 0.8,
        angle: Math.PI / 4,
        blur: 2,
        color: "#000000",
        distance: 1
      }
    });

    const text = new Text({
      text: `${title} (Lv.${level})`,
      style
    });
    text.anchor.set(0.5);

    badgeContainer.addChild(bg);
    badgeContainer.addChild(text);
    node.addChild(badgeContainer);
  }
}
