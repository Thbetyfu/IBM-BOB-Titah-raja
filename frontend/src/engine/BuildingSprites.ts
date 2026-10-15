/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Procedural Isometric Building Sprites & Level Badges (SDD Bab 5.2)
 *
 * Implements:
 * 1. Balai Wanua (Joglo Keraton Palace, Soko Guru, Levels 1-3)
 * 2. Lumbung Desa (Traditional Granary on stilts, Levels 1-3)
 * 3. Pos Ronda (Frontier Watchtower & Kentongan, Levels 1-3)
 */

import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { IsometricMap } from "./IsometricMap";

export class BuildingSprites {
  public container!: Container;
  private balaiNode!: Container;
  private lumbungNode!: Container;
  private posRondaNode!: Container;

  public init(parent: Container): void {
    this.container = parent;

    this.balaiNode = new Container();
    this.lumbungNode = new Container();
    this.posRondaNode = new Container();

    this.container.addChild(this.balaiNode);
    this.container.addChild(this.lumbungNode);
    this.container.addChild(this.posRondaNode);

    // Place buildings on key isometric coordinates
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
    this.balaiNode.removeChildren();
    this.renderBalaiWanua(this.balaiNode, balaiLv);

    this.lumbungNode.removeChildren();
    this.renderLumbungDesa(this.lumbungNode, lumbungLv);

    this.posRondaNode.removeChildren();
    this.renderPosRonda(this.posRondaNode, posRondaLv);
  }

  /**
   * Balai Wanua: Joglo Keraton Architecture
   */
  private renderBalaiWanua(node: Container, level: number): void {
    const g = new Graphics();

    // 1. Stone Foundation Platform (Umpak & Pendopo)
    g.poly([
      0, 6,
      36, -12,
      0, -30,
      -36, -12
    ]);
    g.fill({ color: 0x4a4439 });
    g.stroke({ color: 0x2e2920, width: 2 });

    // 2. Pillars (Soko Guru)
    const pillars = [
      { x: -16, y: -10 },
      { x: 16, y: -10 },
      { x: -16, y: -22 },
      { x: 16, y: -22 }
    ];
    for (const p of pillars) {
      g.rect(p.x - 2, p.y - 20, 4, 20);
      g.fill({ color: 0x78350f }); // Teak wood
    }

    // 3. Lower Tier Joglo Roof
    g.poly([
      0, -22,
      44, -40,
      0, -58,
      -44, -40
    ]);
    g.fill({ color: 0x92400e });
    g.stroke({ color: 0x451a03, width: 1.5 });

    // 4. Upper Tier Steep Crown Roof
    const roofHeight = 45 + level * 8;
    g.poly([
      0, -42,
      28, -54,
      0, -roofHeight,
      -28, -54
    ]);
    g.fill({ color: level >= 3 ? 0xb45309 : 0x78350f });
    g.stroke({ color: 0xd4af37, width: level >= 2 ? 2 : 1 });

    // 5. Golden Finial / Mustaka Crown
    g.circle(0, -roofHeight - 4, level >= 2 ? 5 : 3);
    g.fill({ color: 0xffd700 });

    node.addChild(g);

    // Label Badge
    this.addBadge(node, "Balai Wanua", level, 0, -roofHeight - 22);
  }

  /**
   * Lumbung Desa: Traditional Elevated Wooden Granary
   */
  private renderLumbungDesa(node: Container, level: number): void {
    const g = new Graphics();

    // 1. High Wooden Stilts
    const stilts = [-14, 14, -8, 8];
    for (const sx of stilts) {
      g.rect(sx - 1.5, -18, 3, 20);
      g.fill({ color: 0x5c3d2e });
    }

    // 2. Granary Body (Wooden Planks)
    g.poly([
      0, -10,
      22, -20,
      0, -30,
      -22, -20
    ]);
    g.fill({ color: 0x854d0e });
    g.stroke({ color: 0x451a03, width: 1 });

    // 3. Curved Thatched Ijuk Roof
    const roofTop = -38 - level * 4;
    g.poly([
      0, -26,
      26, -36,
      0, roofTop,
      -26, -36
    ]);
    g.fill({ color: 0x44403c });
    g.stroke({ color: 0x292524, width: 1.5 });

    // Grain sacks on side
    g.ellipse(16, -6, 5, 3.5);
    g.fill({ color: 0xca8a04 });
    if (level >= 2) {
      g.ellipse(19, -9, 4, 3);
      g.fill({ color: 0xeab308 });
    }

    node.addChild(g);
    this.addBadge(node, "Lumbung Desa", level, 0, roofTop - 18);
  }

  /**
   * Pos Ronda: Frontier Watchtower & Wooden Slit Drum (Kentongan)
   */
  private renderPosRonda(node: Container, level: number): void {
    const g = new Graphics();

    // 1. Tower Legs
    const towerH = 26 + level * 6;
    g.moveTo(-10, 0);
    g.lineTo(-6, -towerH);
    g.stroke({ color: 0x713f12, width: 2.5 });

    g.moveTo(10, 0);
    g.lineTo(6, -towerH);
    g.stroke({ color: 0x713f12, width: 2.5 });

    // Cross braces
    g.moveTo(-9, -10);
    g.lineTo(7, -18);
    g.stroke({ color: 0x854d0e, width: 1.5 });

    // 2. Guard Lookout Platform
    g.rect(-12, -towerH - 6, 24, 7);
    g.fill({ color: 0x92400e });

    // 3. Kentongan Drum (Hollow wood)
    g.rect(-3, -towerH - 3, 6, 10);
    g.fill({ color: 0xb45309 });
    g.stroke({ color: 0x451a03, width: 1 });

    // 4. Conical / Pyramid Roof
    const roofPeak = -towerH - 18;
    g.poly([
      0, -towerH - 6,
      14, -towerH - 12,
      0, roofPeak,
      -14, -towerH - 12
    ]);
    g.fill({ color: 0x57534e });
    g.stroke({ color: 0x292524, width: 1 });

    // 5. Red Garrison Pennant Flag
    g.poly([
      0, roofPeak,
      12, roofPeak - 5,
      0, roofPeak - 10
    ]);
    g.fill({ color: 0xdc2626 });

    node.addChild(g);
    this.addBadge(node, "Pos Ronda", level, 0, roofPeak - 18);
  }

  private addBadge(node: Container, title: string, level: number, x: number, y: number): void {
    const badgeContainer = new Container();
    badgeContainer.position.set(x, y);

    const bg = new Graphics();
    bg.roundRect(-42, -9, 84, 18, 5);
    bg.fill({ color: 0x0f1711, alpha: 0.85 });
    bg.stroke({ color: 0xd4af37, width: 1, alpha: 0.8 });

    const style = new TextStyle({
      fontFamily: "Inter, sans-serif",
      fontSize: 10,
      fontWeight: "bold",
      fill: "#ffd700",
      align: "center"
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
