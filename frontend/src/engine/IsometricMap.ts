/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Isometric 2.5D Map & Territorial Grid Renderer (SDD Bab 5.1)
 *
 * Implements 2:1 Diamond Isometric Projection:
 * X_iso = (x - y) * (W / 2)
 * Y_iso = (x + y) * (H / 2)
 */

import { Container, Graphics } from "pixi.js";

export interface IsoPoint {
  x: number;
  y: number;
}

export function gridToIso(gridX: number, gridY: number): IsoPoint {
  return IsometricMap.gridToScreen(gridX, gridY);
}

export class IsometricMap {
  public static readonly TILE_WIDTH = 64;
  public static readonly TILE_HEIGHT = 32;
  public static readonly GRID_SIZE = 18;

  public groundLayer!: Container;
  public riverLayer!: Container;
  public roadLayer!: Container;

  private riverTiles = new Set<string>();

  public static gridToScreen(gridX: number, gridY: number): { x: number; y: number } {
    const halfW = IsometricMap.TILE_WIDTH / 2;
    const halfH = IsometricMap.TILE_HEIGHT / 2;
    return {
      x: (gridX - gridY) * halfW,
      y: (gridX + gridY) * halfH
    };
  }

  public static screenToGrid(screenX: number, screenY: number): { x: number; y: number } {
    const halfW = IsometricMap.TILE_WIDTH / 2;
    const halfH = IsometricMap.TILE_HEIGHT / 2;
    const normX = screenX / halfW;
    const normY = screenY / halfH;
    return {
      x: Math.floor((normX + normY) / 2),
      y: Math.floor((normY - normX) / 2)
    };
  }

  public init(ground: Container, river: Container, road: Container): void {
    this.groundLayer = ground;
    this.riverLayer = river;
    this.roadLayer = road;

    // Define River Wanua Sendang course diagonally (e.g. y = x - 5 to x - 7)
    for (let x = 0; x < IsometricMap.GRID_SIZE; x++) {
      this.riverTiles.add(`${x},${x + 3}`);
      this.riverTiles.add(`${x},${x + 4}`);
    }

    this.renderTiles();
    this.renderTerritoryBorder();
  }

  private renderTiles(): void {
    const halfW = IsometricMap.TILE_WIDTH / 2;
    const halfH = IsometricMap.TILE_HEIGHT / 2;

    for (let x = 0; x < IsometricMap.GRID_SIZE; x++) {
      for (let y = 0; y < IsometricMap.GRID_SIZE; y++) {
        const { x: sx, y: sy } = IsometricMap.gridToScreen(x, y);
        const tileKey = `${x},${y}`;
        const isRiver = this.riverTiles.has(tileKey);

        const g = new Graphics();

        if (isRiver) {
          // River tile with cyan/emerald depth
          g.poly([
            0, -halfH,
            halfW, 0,
            0, halfH,
            -halfW, 0
          ]);
          g.fill({ color: 0x1a535c, alpha: 0.9 });
          g.stroke({ color: 0x4ecdc4, width: 1, alpha: 0.4 });

          // Animated water ripple accent
          g.moveTo(-12, 0);
          g.lineTo(12, 0);
          g.stroke({ color: 0xa8dadc, width: 1.5, alpha: 0.7 });

          g.position.set(sx, sy);
          this.riverLayer.addChild(g);
        } else {
          // Determine tile theme: Village center courtyard vs Sawah terasering vs Deep rimba
          const isCenter = x >= 6 && x <= 12 && y >= 3 && y <= 9;
          const isRoad = x === 9 || y === 6;

          let baseColor = 0x243e26; // Lush paddy green
          let borderColor = 0x2d4f30;

          if (isCenter) {
            baseColor = 0x3d3522; // Village packed earth
            borderColor = 0x4d422a;
          } else if (isRoad) {
            baseColor = 0x544732; // Stone dirt pathway
            borderColor = 0x6e5c41;
          } else if (x < 2 || y < 2 || x > 15 || y > 15) {
            baseColor = 0x132314; // Wild rimba borders
            borderColor = 0x1d361e;
          }

          // Subtle checkered variation
          if ((x + y) % 2 === 0 && !isCenter && !isRoad) {
            baseColor = 0x2a462c;
          }

          g.poly([
            0, -halfH,
            halfW, 0,
            0, halfH,
            -halfW, 0
          ]);
          g.fill({ color: baseColor });
          g.stroke({ color: borderColor, width: 1, alpha: 0.6 });

          // Add paddy grass or pebble highlights
          if (!isCenter && !isRoad && (x * 7 + y * 13) % 5 === 0) {
            g.circle(-4, -2, 1.5);
            g.fill({ color: 0x52b788, alpha: 0.5 });
          }

          g.position.set(sx, sy);
          this.groundLayer.addChild(g);
        }
      }
    }
  }

  private renderTerritoryBorder(): void {
    const halfW = IsometricMap.TILE_WIDTH / 2;
    const halfH = IsometricMap.TILE_HEIGHT / 2;
    const g = new Graphics();

    // Runic golden territorial border fence around Wanua territory (grid [2..15])
    const corners = [
      IsometricMap.gridToScreen(2, 2),
      IsometricMap.gridToScreen(15, 2),
      IsometricMap.gridToScreen(15, 15),
      IsometricMap.gridToScreen(2, 15)
    ];

    g.poly([
      corners[0].x, corners[0].y - halfH,
      corners[1].x + halfW, corners[1].y,
      corners[2].x, corners[2].y + halfH,
      corners[3].x - halfW, corners[3].y
    ]);
    g.stroke({ color: 0xd4af37, width: 2, alpha: 0.45 });

    // Territorial Boundary Pillars (Patok Batas Wanua) at 4 corners
    for (const corner of corners) {
      g.rect(corner.x - 3, corner.y - 12, 6, 14);
      g.fill({ color: 0xd4af37, alpha: 0.8 });
      g.circle(corner.x, corner.y - 14, 4);
      g.fill({ color: 0xffd700, alpha: 0.9 });
    }

    this.roadLayer.addChild(g);
  }
}
