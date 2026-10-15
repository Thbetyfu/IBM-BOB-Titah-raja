/**
 * Titah Rakyat: Sovereign of the Living Realm
 * 2.5D Isometric Building Sprites, Tactile Game-Feel & Interactive Juice (SDD Bab 5.2)
 *
 * Ingests Cozy Chunky 3D Stylized Royal Nusantara Assets:
 * 1. Balai Wanua (Joglo Keraton Agung, Levels 1-3) -> Click triggers Royal Gong Ageng & Decree Cheer
 * 2. Lumbung Desa (Elevated Teak Granary, Levels 1-3) -> Click triggers Harvest Chime & Granary Storage Pop
 * 3. Pos Ronda (Bastion Watchtower & Kentongan, Levels 1-3) -> Click triggers Kentongan Alarm Rhythms
 */

import { Container, Graphics, Sprite, Assets, Text, TextStyle, FederatedPointerEvent } from "pixi.js";
import { IsometricMap } from "./IsometricMap";
import { audioEngine } from "../services/audioEngine";

interface FloatingToast {
  container: Container;
  vy: number;
  life: number;
  maxLife: number;
}

export class BuildingSprites {
  public container!: Container;
  private balaiNode!: Container;
  private lumbungNode!: Container;
  private posRondaNode!: Container;
  private toastLayer!: Container;

  private currentBalaiLv: number = 2;
  private currentLumbungLv: number = 2;
  private currentPosRondaLv: number = 1;

  private floatingToasts: FloatingToast[] = [];

  public init(parent: Container): void {
    this.container = parent;

    this.balaiNode = new Container();
    this.lumbungNode = new Container();
    this.posRondaNode = new Container();
    this.toastLayer = new Container();

    this.container.addChild(this.balaiNode);
    this.container.addChild(this.lumbungNode);
    this.container.addChild(this.posRondaNode);
    this.container.addChild(this.toastLayer);

    // Position buildings on strategic isometric kingdom coordinates
    const balaiPos = IsometricMap.gridToScreen(8, 5);
    this.balaiNode.position.set(balaiPos.x, balaiPos.y);
    this.setupInteractivity(this.balaiNode, "balai");
    this.renderBalaiWanua(this.balaiNode, 2);

    const lumbungPos = IsometricMap.gridToScreen(11, 4);
    this.lumbungNode.position.set(lumbungPos.x, lumbungPos.y);
    this.setupInteractivity(this.lumbungNode, "lumbung");
    this.renderLumbungDesa(this.lumbungNode, 2);

    const posRondaPos = IsometricMap.gridToScreen(5, 7);
    this.posRondaNode.position.set(posRondaPos.x, posRondaPos.y);
    this.setupInteractivity(this.posRondaNode, "pos_ronda");
    this.renderPosRonda(this.posRondaNode, 1);
  }

  /**
   * Sets up interactive pointer hover and bounce clicks with sound juice
   */
  private setupInteractivity(node: Container, type: "balai" | "lumbung" | "pos_ronda"): void {
    node.eventMode = "static";
    node.cursor = "pointer";

    node.on("pointerover", () => {
      node.alpha = 0.95;
    });

    node.on("pointerout", () => {
      node.alpha = 1.0;
    });

    node.on("pointerdown", (e: FederatedPointerEvent) => {
      e.stopPropagation();
      this.handleClick(type, node);
    });
  }

  /**
   * Triggers tactile squash & stretch bounce, procedural audio, and floating toast
   */
  private handleClick(type: "balai" | "lumbung" | "pos_ronda", node: Container): void {
    // 1. Squash & Stretch tactile game feel
    node.scale.set(1.16, 0.86);

    // 2. Sound & Floating Juice
    if (type === "balai") {
      audioEngine.playGongAgeng(0);
      this.spawnToast(node.x, node.y - 105, "Gong Titah Prabu!", "#ffd700", 0xd4af37);
    } else if (type === "lumbung") {
      audioEngine.playHarvestChime();
      this.spawnToast(node.x, node.y - 95, "+25 Padi Disimpan!", "#70c1b3", 0x4ecdc4);
    } else if (type === "pos_ronda") {
      audioEngine.playKentongan();
      this.spawnToast(node.x, node.y - 110, "KENTONGAN SIAGA!", "#f4a261", 0xe76f51);
    }
  }

  /**
   * Spawns a floating comic badge that floats up and gently fades out
   */
  private spawnToast(x: number, y: number, text: string, fillColor: string, borderColor: number): void {
    const toast = new Container();
    toast.position.set(x, y);

    const bg = new Graphics();
    bg.roundRect(-65, -13, 130, 26, 8);
    bg.fill({ color: 0x0a1410, alpha: 0.92 });
    bg.stroke({ color: borderColor, width: 2, alpha: 0.95 });

    const style = new TextStyle({
      fontFamily: "Inter, 'Cinzel', sans-serif",
      fontSize: 11,
      fontWeight: "bold",
      fill: fillColor,
      align: "center",
      dropShadow: {
        alpha: 0.8,
        angle: Math.PI / 4,
        blur: 3,
        color: "#000000",
        distance: 1
      }
    });

    const label = new Text({ text, style });
    label.anchor.set(0.5);

    toast.addChild(bg);
    toast.addChild(label);
    this.toastLayer.addChild(toast);

    this.floatingToasts.push({
      container: toast,
      vy: -48,
      life: 0,
      maxLife: 1.3
    });
  }

  /**
   * Update loop for spring physics and floating text toasts
   */
  public update(deltaSec: number): void {
    const springSpeed = Math.min(1, deltaSec * 14);

    // Spring scales back to 1.0
    for (const node of [this.balaiNode, this.lumbungNode, this.posRondaNode]) {
      if (node) {
        node.scale.x += (1.0 - node.scale.x) * springSpeed;
        node.scale.y += (1.0 - node.scale.y) * springSpeed;
      }
    }

    // Animate floating toasts
    for (let i = this.floatingToasts.length - 1; i >= 0; i--) {
      const t = this.floatingToasts[i];
      t.life += deltaSec;
      t.container.y += t.vy * deltaSec;
      t.container.alpha = Math.max(0, 1 - Math.pow(t.life / t.maxLife, 1.8));

      if (t.life >= t.maxLife) {
        this.toastLayer.removeChild(t.container);
        t.container.destroy({ children: true });
        this.floatingToasts.splice(i, 1);
      }
    }
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
   * Balai Wanua: Cozy Chunky 3D Joglo Keraton Agung
   */
  private renderBalaiWanua(node: Container, level: number): void {
    const safeLv = Math.min(3, Math.max(1, level));

    // 1. Soft Ambient Ground Shadow
    const shadow = new Graphics();
    shadow.ellipse(0, 4, 52, 26);
    shadow.fill({ color: 0x000000, alpha: 0.38 });
    node.addChild(shadow);

    // 2. High-Fidelity 3D Cozy Chunky Asset
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
   * Lumbung Desa: Cozy Chunky 3D Elevated Nusantara Granary
   */
  private renderLumbungDesa(node: Container, level: number): void {
    const safeLv = Math.min(3, Math.max(1, level));

    // 1. Soft Ambient Ground Shadow
    const shadow = new Graphics();
    shadow.ellipse(0, 4, 40, 20);
    shadow.fill({ color: 0x000000, alpha: 0.36 });
    node.addChild(shadow);

    // 2. High-Fidelity 3D Cozy Chunky Asset
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
   * Pos Ronda: Cozy Chunky 3D Watchtower & Kentongan
   */
  private renderPosRonda(node: Container, level: number): void {
    const safeLv = Math.min(3, Math.max(1, level));

    // 1. Soft Ambient Ground Shadow
    const shadow = new Graphics();
    shadow.ellipse(0, 4, 34, 18);
    shadow.fill({ color: 0x000000, alpha: 0.34 });
    node.addChild(shadow);

    // 2. High-Fidelity 3D Cozy Chunky Asset
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
    bg.roundRect(-46, -11, 92, 22, 6);
    bg.fill({ color: 0x141a14, alpha: 0.92 });
    bg.stroke({ color: 0xd4af37, width: 1.5, alpha: 0.9 });

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
