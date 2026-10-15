/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Living Strategy Board District Compounds & Tactile Game Feel (SDD Bab 5.2)
 * Inspired by Civilization VI, Manor Lords, and Bad North.
 *
 * Implements:
 * 1. Kompleks Balai Wanua: Paved stone courtyard, Majapahit Candi Bentar split gates, royal umbul-umbul flags, & Joglo Keraton.
 * 2. Kompleks Lumbung Desa: Earthen drying yard, golden paddy drying mat, wooden handcart, & elevated thatched granary.
 * 3. Kompleks Pos Ronda: Fortified earth bastion, sharpened timber palisade, signal fire brazier, & watchtower with kentongan.
 * 4. Interactive squash-and-stretch clicks, procedural audio (Gong, Harvest, Kentongan), & floating tactical toasts.
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
  private animTimer: number = 0;
  private brazierFlameGfx!: Graphics;
  private flagsGfx!: Graphics;

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

    // Strategic district coordinates on the living strategy board
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

  private handleClick(type: "balai" | "lumbung" | "pos_ronda", node: Container): void {
    // Tactile squash-and-stretch
    node.scale.set(1.15, 0.88);

    if (type === "balai") {
      audioEngine.playGongAgeng(0);
      this.spawnToast(node.x, node.y - 120, "GONG TITAH PRABU!", "#ffd700", 0xd4af37);
    } else if (type === "lumbung") {
      audioEngine.playHarvestChime();
      this.spawnToast(node.x, node.y - 105, "+25 PADI DISIMPAN!", "#70c1b3", 0x4ecdc4);
    } else if (type === "pos_ronda") {
      audioEngine.playKentongan();
      this.spawnToast(node.x, node.y - 125, "KENTONGAN SIAGA!", "#f4a261", 0xe76f51);
    }
  }

  private spawnToast(x: number, y: number, text: string, fillColor: string, borderColor: number): void {
    const toast = new Container();
    toast.position.set(x, y);

    const bg = new Graphics();
    bg.roundRect(-70, -14, 140, 28, 8);
    bg.fill({ color: 0x0c1613, alpha: 0.94 });
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
      vy: -50,
      life: 0,
      maxLife: 1.4
    });
  }

  public update(deltaSec: number): void {
    this.animTimer += deltaSec;
    const springSpeed = Math.min(1, deltaSec * 14);

    // Spring scales back to 1.0
    for (const node of [this.balaiNode, this.lumbungNode, this.posRondaNode]) {
      if (node) {
        node.scale.x += (1.0 - node.scale.x) * springSpeed;
        node.scale.y += (1.0 - node.scale.y) * springSpeed;
      }
    }

    // Animate animated elements (Brazier flame, flags)
    if (this.brazierFlameGfx) {
      this.updateBrazierFlame();
    }
    if (this.flagsGfx) {
      this.updateRoyalFlags();
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

  private updateBrazierFlame(): void {
    const g = this.brazierFlameGfx;
    g.clear();
    const f = Math.sin(this.animTimer * 14) * 2;
    // Outer flame
    g.poly([
      -3, 0,
      f, -9,
      3, 0
    ]);
    g.fill({ color: 0xff4500, alpha: 0.9 });
    // Inner yellow core
    g.poly([
      -1.5, 0,
      f * 0.5, -6,
      1.5, 0
    ]);
    g.fill({ color: 0xffd700, alpha: 0.95 });
  }

  private updateRoyalFlags(): void {
    const g = this.flagsGfx;
    g.clear();
    const wave = Math.sin(this.animTimer * 6) * 3;

    // Left Candi Bentar Pennant
    g.poly([
      -46, -34,
      -36 + wave, -30,
      -46, -26
    ]);
    g.fill({ color: 0xe63946 });

    // Right Candi Bentar Pennant
    g.poly([
      46, -34,
      56 + wave, -30,
      46, -26
    ]);
    g.fill({ color: 0xe63946 });
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
   * 1. BALAI WANUA: Kompleks Keraton Agung (Civ VI Wonder/District Compound)
   * Includes: Polished stone courtyard, Majapahit Candi Bentar split gates, royal umbul-umbul, & Joglo.
   */
  private renderBalaiWanua(node: Container, level: number): void {
    const safeLv = Math.min(3, Math.max(1, level));

    // 1. Polished Andesite Stone Courtyard Plaza (Paving stone diorama base)
    const courtyard = new Graphics();
    courtyard.poly([
      0, -38,
      76, 0,
      0, 38,
      -76, 0
    ]);
    courtyard.fill({ color: 0x3a352e });
    courtyard.stroke({ color: 0x5a5246, width: 2, alpha: 0.8 });

    // Inner decorative court pavers
    courtyard.poly([
      0, -28,
      56, 0,
      0, 28,
      -56, 0
    ]);
    courtyard.stroke({ color: 0x736858, width: 1, alpha: 0.5 });

    // Raised Andesite Foundation Plinth for the Joglo
    courtyard.poly([
      0, -22,
      44, 0,
      0, 22,
      -44, 0
    ]);
    courtyard.fill({ color: 0x4a4339 });
    courtyard.stroke({ color: 0x8a7e6b, width: 1.5, alpha: 0.9 });

    // Low courtyard perimeter wall with corner stone stupas
    for (const [cx, cy] of [[-68, 0], [68, 0], [0, -32], [0, 32]]) {
      courtyard.rect(cx - 3, cy - 8, 6, 8);
      courtyard.fill({ color: 0x24201b });
      courtyard.circle(cx, cy - 9, 2.5);
      courtyard.fill({ color: 0xd4af37 });
    }
    node.addChild(courtyard);

    // 2. Majapahit Candi Bentar (Red-Brick Split Gateway at entrance)
    const candiBentar = new Graphics();
    const gateY = 24;

    // Left Pylon (Candi Bentar Kiri)
    candiBentar.poly([
      -22, gateY,
      -22, gateY - 26,
      -18, gateY - 26,
      -18, gateY - 32,
      -14, gateY - 32,
      -14, gateY - 38,
      -10, gateY - 38,
      -10, gateY
    ]);
    candiBentar.fill({ color: 0xa8422b }); // Terracotta red brick
    candiBentar.stroke({ color: 0x6e2616, width: 1 });
    // Gold crest on left pylon
    candiBentar.circle(-12, gateY - 40, 2);
    candiBentar.fill({ color: 0xffd700 });

    // Right Pylon (Candi Bentar Kanan)
    candiBentar.poly([
      10, gateY,
      10, gateY - 38,
      14, gateY - 38,
      14, gateY - 32,
      18, gateY - 32,
      18, gateY - 26,
      22, gateY - 26,
      22, gateY
    ]);
    candiBentar.fill({ color: 0xa8422b });
    candiBentar.stroke({ color: 0x6e2616, width: 1 });
    // Gold crest on right pylon
    candiBentar.circle(12, gateY - 40, 2);
    candiBentar.fill({ color: 0xffd700 });

    // Stone Steps between the split gate
    candiBentar.rect(-8, gateY - 2, 16, 4);
    candiBentar.fill({ color: 0x61584c });

    node.addChild(candiBentar);

    // 3. Royal Umbul-Umbul Flags & Animated Wave
    this.flagsGfx = new Graphics();
    // Bamboo flagpoles flanking the gate
    candiBentar.moveTo(-46, gateY - 4);
    candiBentar.lineTo(-46, -34);
    candiBentar.stroke({ color: 0xca8a04, width: 2 });
    candiBentar.moveTo(46, gateY - 4);
    candiBentar.lineTo(46, -34);
    candiBentar.stroke({ color: 0xca8a04, width: 2 });
    node.addChild(this.flagsGfx);

    // 4. Ceramic Water Urns (Genthong Air Tanah Liat)
    const urnsGfx = new Graphics();
    for (const ux of [-26, 26]) {
      urnsGfx.ellipse(ux, gateY + 4, 4, 6);
      urnsGfx.fill({ color: 0xb23b20 });
      urnsGfx.ellipse(ux, gateY + 1, 3, 2);
      urnsGfx.fill({ color: 0x5c4033 });
    }
    node.addChild(urnsGfx);

    // 5. 3D Joglo Keraton Centerpiece Asset
    const spritePath = `/assets/buildings/balai_wanua_lv${safeLv}.png`;
    const texture = Assets.get(spritePath);
    const sprite = texture ? new Sprite(texture) : Sprite.from(spritePath);
    sprite.anchor.set(0.5, 0.74);
    sprite.scale.set(0.35);
    sprite.position.set(0, -6);
    node.addChild(sprite);

    // 6. Royal District Badge
    this.addDistrictBadge(node, "Keraton Wanua", "Pusat Titah", safeLv, 0, -108);
  }

  /**
   * 2. LUMBUNG DESA: Kompleks Pertanian & Lumbung Padi (Manor Lords Harvest Compound)
   * Includes: Sandy drying patio, golden paddy drying mat, wooden pushcart, baskets, & elevated granary.
   */
  private renderLumbungDesa(node: Container, level: number): void {
    const safeLv = Math.min(3, Math.max(1, level));

    // 1. Agricultural Patio Base (Sandy threshing floor)
    const patio = new Graphics();
    patio.poly([
      0, -32,
      64, 0,
      0, 32,
      -64, 0
    ]);
    patio.fill({ color: 0x756543 });
    patio.stroke({ color: 0x948259, width: 2, alpha: 0.8 });

    // 2. Lantai Jemur Gabah (Woven bamboo mat with sun-drying golden grains)
    patio.poly([
      -36, 4,
      -10, -9,
      8, 0,
      -18, 13
    ]);
    patio.fill({ color: 0xd4a373 }); // Woven bamboo mat
    patio.stroke({ color: 0xa67c52, width: 1 });

    // Golden Paddy Grains spread out
    patio.poly([
      -32, 4,
      -12, -6,
      4, 0,
      -16, 10
    ]);
    patio.fill({ color: 0xffd166, alpha: 0.85 }); // Golden rice grain sheen

    // 3. Traditional Wooden Pushcart (Gerobak Kayu Roda Dua)
    const cartX = 30;
    const cartY = 12;
    // Wooden wheel
    patio.circle(cartX, cartY, 5);
    patio.fill({ color: 0x4a3525 });
    patio.circle(cartX, cartY, 2);
    patio.fill({ color: 0x8a6240 });
    // Cart bed & handles
    patio.rect(cartX - 8, cartY - 7, 14, 6);
    patio.fill({ color: 0x6e4727 });
    patio.stroke({ color: 0x3d2715, width: 1 });
    patio.moveTo(cartX + 6, cartY - 5);
    patio.lineTo(cartX + 12, cartY - 2);
    patio.stroke({ color: 0x8a6240, width: 1.5 }); // Handle

    // 4. Woven Bamboo Grain Baskets (Bakul/Tenggok)
    for (const [bx, by] of [[-40, 16], [-28, 18], [20, 20]]) {
      patio.circle(bx, by, 3.5);
      patio.fill({ color: 0xc49b66 });
      patio.circle(bx, by, 2.0);
      patio.fill({ color: 0xffd166 }); // Filled with rice
    }
    node.addChild(patio);

    // 5. 3D Elevated Granary Asset
    const spritePath = `/assets/buildings/lumbung_desa_lv${safeLv}.png`;
    const texture = Assets.get(spritePath);
    const sprite = texture ? new Sprite(texture) : Sprite.from(spritePath);
    sprite.anchor.set(0.5, 0.80);
    sprite.scale.set(0.31);
    sprite.position.set(0, -4);
    node.addChild(sprite);

    // 6. Agricultural District Badge
    this.addDistrictBadge(node, "Lumbung Desa", "Depot Pangan", safeLv, 0, -96);
  }

  /**
   * 3. POS RONDA: Kompleks Benteng Ronda & Barikade (Bad North Bastion Compound)
   * Includes: Compact earth bastion, sharpened timber palisade, signal fire brazier, & watchtower.
   */
  private renderPosRonda(node: Container, level: number): void {
    const safeLv = Math.min(3, Math.max(1, level));

    // 1. Fortified Earth Bastion Platform
    const bastion = new Graphics();
    bastion.poly([
      0, -30,
      58, 0,
      0, 30,
      -58, 0
    ]);
    bastion.fill({ color: 0x4f4236 });
    bastion.stroke({ color: 0x6e5d4d, width: 2, alpha: 0.8 });

    // 2. Sharpened Timber Palisade Stakes (Pagar Kayu Runcing)
    const palisadeX = 22;
    const palisadeY = -8;
    for (let i = 0; i < 5; i++) {
      const sx = palisadeX + i * 5;
      const sy = palisadeY + i * 2.5;
      bastion.moveTo(sx, sy);
      bastion.lineTo(sx, sy - 14);
      bastion.lineTo(sx + 2, sy - 16); // Sharp spike
      bastion.lineTo(sx + 4, sy - 14);
      bastion.lineTo(sx + 4, sy);
      bastion.fill({ color: 0x5a3e28 });
      bastion.stroke({ color: 0x3b2819, width: 0.8 });
    }

    // 3. Signal Fire Brazier Tripod (Tungku Obor Jaga Malam)
    const bzX = -26;
    const bzY = 10;
    // Tripod legs & iron bowl
    bastion.moveTo(bzX - 4, bzY + 6);
    bastion.lineTo(bzX, bzY);
    bastion.lineTo(bzX + 4, bzY + 6);
    bastion.stroke({ color: 0x1f2421, width: 1.5 });
    bastion.ellipse(bzX, bzY, 5, 2.5);
    bastion.fill({ color: 0x111614 });
    bastion.ellipse(bzX, bzY, 3.5, 1.5);
    bastion.fill({ color: 0xff6b35 }); // Glowing embers

    node.addChild(bastion);

    // Dynamic flickering flame container
    this.brazierFlameGfx = new Graphics();
    this.brazierFlameGfx.position.set(bzX, bzY);
    node.addChild(this.brazierFlameGfx);

    // 4. 3D Watchtower & Kentongan Asset
    const spritePath = `/assets/buildings/pos_ronda_lv${safeLv}.png`;
    const texture = Assets.get(spritePath);
    const sprite = texture ? new Sprite(texture) : Sprite.from(spritePath);
    sprite.anchor.set(0.5, 0.84);
    sprite.scale.set(0.31);
    sprite.position.set(0, -6);
    node.addChild(sprite);

    // 5. Frontier Bastion District Badge
    this.addDistrictBadge(node, "Pos Ronda", "Benteng Perbatasan", safeLv, 0, -108);
  }

  /**
   * Premium Civilization VI / Manor Lords Style District Badge
   */
  private addDistrictBadge(node: Container, title: string, subtitle: string, level: number, x: number, y: number): void {
    const badgeContainer = new Container();
    badgeContainer.position.set(x, y);

    const bg = new Graphics();
    // Bronze & gold royal plaque with stepped corner bevels
    bg.roundRect(-55, -14, 110, 28, 6);
    bg.fill({ color: 0x121a15, alpha: 0.94 });
    bg.stroke({ color: 0xd4af37, width: 1.8, alpha: 0.95 });

    // Inner gold corner dot accents
    bg.circle(-48, 0, 1.8);
    bg.circle(48, 0, 1.8);
    bg.fill({ color: 0xffd700, alpha: 0.95 });

    const titleStyle = new TextStyle({
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

    const subStyle = new TextStyle({
      fontFamily: "Inter, sans-serif",
      fontSize: 7.5,
      fontWeight: "600",
      fill: "#a8dadc",
      align: "center"
    });

    const titleText = new Text({
      text: `${title} (Lv.${level})`,
      style: titleStyle
    });
    titleText.anchor.set(0.5);
    titleText.position.set(0, -4);

    const subText = new Text({
      text: subtitle.toUpperCase(),
      style: subStyle
    });
    subText.anchor.set(0.5);
    subText.position.set(0, 6.5);

    badgeContainer.addChild(bg);
    badgeContainer.addChild(titleText);
    badgeContainer.addChild(subText);
    node.addChild(badgeContainer);
  }
}
