/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Isometric 2.5D Diorama Map & Floating Mountain Realm (SDD Bab 5.1)
 *
 * Implements 2:1 Diamond Isometric Projection:
 * X_iso = (x - y) * (W / 2)
 * Y_iso = (x + y) * (H / 2)
 *
 * Features:
 * 1. 3D Floating Diorama Cliff Pedestal (Andesite bedrock strata & cascading waterfall)
 * 2. Sawah Terasering (Layered terraced paddies with water glints & golden-green stalks)
 * 3. Sendang River with flowing animated wave ripples & specular highlights
 * 4. Andesite Cobblestone pathways leading to Balai Wanua
 * 5. Floating atmospheric cloud mist drifting across the perimeter
 * 6. Runic Golden Boundary Pillars (Patok Batas Wanua) with glowing lanterns
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

  private cliffGfx!: Graphics;
  private animatedWaterGfx!: Graphics;
  private cloudsGfx!: Graphics;
  private riverTiles = new Set<string>();
  private riverTileCoords: { x: number; y: number; sx: number; sy: number }[] = [];
  private elapsedTime: number = 0;

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

    this.cliffGfx = new Graphics();
    this.animatedWaterGfx = new Graphics();
    this.cloudsGfx = new Graphics();

    // The cliff base sits under everything in groundLayer
    this.groundLayer.addChild(this.cliffGfx);
    this.riverLayer.addChild(this.animatedWaterGfx);
    this.roadLayer.addChild(this.cloudsGfx);

    // Define River Wanua Sendang course diagonally (y = x + 3 and x + 4)
    this.riverTiles.clear();
    this.riverTileCoords = [];

    for (let x = 0; x < IsometricMap.GRID_SIZE; x++) {
      const y1 = x + 3;
      const y2 = x + 4;
      if (y1 < IsometricMap.GRID_SIZE) {
        this.riverTiles.add(`${x},${y1}`);
        const pos1 = IsometricMap.gridToScreen(x, y1);
        this.riverTileCoords.push({ x, y: y1, sx: pos1.x, sy: pos1.y });
      }
      if (y2 < IsometricMap.GRID_SIZE) {
        this.riverTiles.add(`${x},${y2}`);
        const pos2 = IsometricMap.gridToScreen(x, y2);
        this.riverTileCoords.push({ x, y: y2, sx: pos2.x, sy: pos2.y });
      }
    }

    this.renderDioramaCliff();
    this.renderTiles();
    this.renderTerritoryBorder();
  }

  public update(deltaSec: number): void {
    this.elapsedTime += deltaSec;
    this.renderAnimatedRiver();
    this.renderFloatingClouds();
  }

  /**
   * 3D Floating Diorama Cliff Pedestal (Underlying Bedrock Cutaways)
   */
  private renderDioramaCliff(): void {
    const g = this.cliffGfx;
    g.clear();
    const halfW = IsometricMap.TILE_WIDTH / 2;
    const halfH = IsometricMap.TILE_HEIGHT / 2;
    const cliffDepth = 65;

    // South-East edge (x from 0 to 17, at y = 17)
    for (let x = 0; x < IsometricMap.GRID_SIZE; x++) {
      const pos = IsometricMap.gridToScreen(x, 17);
      const isRiver = this.riverTiles.has(`${x},17`);

      // Left-facing cliff wall
      g.poly([
        pos.x - halfW, pos.y,
        pos.x, pos.y + halfH,
        pos.x, pos.y + halfH + cliffDepth,
        pos.x - halfW, pos.y + cliffDepth
      ]);
      g.fill({ color: isRiver ? 0x123538 : 0x1c1712 });
      g.stroke({ color: 0x0f0c0a, width: 1, alpha: 0.6 });

      // Strata texture line
      g.moveTo(pos.x - halfW, pos.y + cliffDepth * 0.4);
      g.lineTo(pos.x, pos.y + halfH + cliffDepth * 0.4);
      g.stroke({ color: 0x2e251d, width: 1.5, alpha: 0.7 });

      // Right-facing cliff wall
      g.poly([
        pos.x, pos.y + halfH,
        pos.x + halfW, pos.y,
        pos.x + halfW, pos.y + cliffDepth,
        pos.x, pos.y + halfH + cliffDepth
      ]);
      g.fill({ color: isRiver ? 0x0d282b : 0x241e17 });
      g.stroke({ color: 0x0f0c0a, width: 1, alpha: 0.6 });

      // Waterfall where river flows off the cliff edge
      if (isRiver) {
        g.rect(pos.x - 8, pos.y + halfH, 16, cliffDepth + 15);
        g.fill({ color: 0x70c1b3, alpha: 0.75 });
        // Foaming mist at base
        g.ellipse(pos.x, pos.y + halfH + cliffDepth + 15, 22, 10);
        g.fill({ color: 0xe0fbfc, alpha: 0.65 });
      }
    }

    // South-West edge (y from 0 to 17, at x = 17)
    for (let y = 0; y < IsometricMap.GRID_SIZE; y++) {
      const pos = IsometricMap.gridToScreen(17, y);
      const isRiver = this.riverTiles.has(`17,${y}`);

      g.poly([
        pos.x, pos.y + halfH,
        pos.x + halfW, pos.y,
        pos.x + halfW, pos.y + cliffDepth,
        pos.x, pos.y + halfH + cliffDepth
      ]);
      g.fill({ color: isRiver ? 0x123538 : 0x241e17 });
      g.stroke({ color: 0x0f0c0a, width: 1, alpha: 0.6 });

      if (isRiver) {
        g.rect(pos.x - 6, pos.y + halfH, 12, cliffDepth + 15);
        g.fill({ color: 0x70c1b3, alpha: 0.75 });
        g.ellipse(pos.x, pos.y + halfH + cliffDepth + 15, 20, 9);
        g.fill({ color: 0xe0fbfc, alpha: 0.65 });
      }
    }
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
          // Deep base river water tile with emerald-cyan depth
          g.poly([
            0, -halfH,
            halfW, 0,
            0, halfH,
            -halfW, 0
          ]);
          g.fill({ color: 0x0f3d3e });
          g.stroke({ color: 0x22577a, width: 1, alpha: 0.6 });

          // Subsurface riverbed stone depth
          g.ellipse(0, 0, halfW * 0.7, halfH * 0.7);
          g.fill({ color: 0x0a2f35, alpha: 0.5 });

          g.position.set(sx, sy);
          this.riverLayer.addChild(g);
        } else {
          // Spatial zoning
          const isCenter = x >= 6 && x <= 12 && y >= 3 && y <= 9;
          const isRoad = x === 9 || y === 6;
          const isWildBorder = x < 2 || y < 2 || x > 15 || y > 15;

          let baseColor = 0x234226; // Rich paddy green
          let borderColor = 0x2e5432;

          if (isCenter) {
            baseColor = 0x3d3522; // Village packed earth
            borderColor = 0x52462e;
          } else if (isRoad) {
            baseColor = 0x4a4031; // Weathered andesite pathway
            borderColor = 0x615340;
          } else if (isWildBorder) {
            baseColor = 0x122415; // Wild rainforest rimba
            borderColor = 0x1b351f;
          }

          // Subtle organic variance
          if ((x + y) % 2 === 0 && !isCenter && !isRoad && !isWildBorder) {
            baseColor = 0x2a4e2e;
          }

          // Base tile diamond
          g.poly([
            0, -halfH,
            halfW, 0,
            0, halfH,
            -halfW, 0
          ]);
          g.fill({ color: baseColor });
          g.stroke({ color: borderColor, width: 1, alpha: 0.55 });

          // Sawah Terasering: Water reflection shimmer & young rice shoots
          if (!isCenter && !isRoad && !isWildBorder) {
            g.poly([
              -12, -2,
              0, -8,
              12, -2,
              0, 4
            ]);
            g.fill({ color: 0x2d6a4f, alpha: 0.35 });

            const seed = (x * 17 + y * 23) % 4;
            if (seed === 0) {
              g.moveTo(-6, 2);
              g.lineTo(-8, -4);
              g.stroke({ color: 0x74c69d, width: 1.2 });

              g.moveTo(4, 1);
              g.lineTo(6, -5);
              g.stroke({ color: 0x95d5b2, width: 1.2 });
            } else if (seed === 1) {
              g.circle(4, -3, 1.2);
              g.fill({ color: 0xd8f3dc, alpha: 0.6 });
            }
          }

          // Andesite Cobblestone detailing on roads
          if (isRoad) {
            g.ellipse(-4, -2, 3, 1.8);
            g.fill({ color: 0x6c584c, alpha: 0.6 });
            g.ellipse(5, 3, 3.5, 2);
            g.fill({ color: 0x584c3d, alpha: 0.6 });
          }

          g.position.set(sx, sy);
          this.groundLayer.addChild(g);
        }
      }
    }
  }

  /**
   * Animated river waves and specular water glints
   */
  private renderAnimatedRiver(): void {
    const g = this.animatedWaterGfx;
    g.clear();

    const t = this.elapsedTime * 2.0;

    for (const tile of this.riverTileCoords) {
      const wavePhase = t + (tile.x + tile.y) * 0.8;
      const rippleOffset = Math.sin(wavePhase) * 6;
      const rippleAlpha = 0.35 + Math.cos(wavePhase) * 0.25;

      // Specular highlight line
      g.moveTo(tile.sx - 14 + rippleOffset, tile.sy - 2);
      g.lineTo(tile.sx + 14 + rippleOffset, tile.sy + 2);
      g.stroke({ color: 0x70c1b3, width: 1.5, alpha: rippleAlpha });

      // Secondary smaller foam glint
      if ((tile.x * 5 + tile.y * 7) % 3 === 0) {
        const glintX = tile.sx + Math.cos(t * 1.5 + tile.x) * 8;
        const glintY = tile.sy + Math.sin(t * 1.5 + tile.y) * 4;
        g.circle(glintX, glintY, 1.2);
        g.fill({ color: 0xffffff, alpha: 0.65 });
      }
    }
  }

  /**
   * Floating atmospheric clouds drifting around diorama perimeter
   */
  private renderFloatingClouds(): void {
    const g = this.cloudsGfx;
    g.clear();
    const t = this.elapsedTime * 0.15;

    const clouds = [
      { baseX: -420, baseY: 80, speed: 1.0, scale: 45 },
      { baseX: 440, baseY: 160, speed: 0.8, scale: 55 },
      { baseX: -280, baseY: 420, speed: 1.2, scale: 60 },
      { baseX: 320, baseY: 480, speed: 0.9, scale: 50 },
      { baseX: 0, baseY: 620, speed: 1.1, scale: 70 }
    ];

    for (const c of clouds) {
      const cx = c.baseX + Math.sin(t * c.speed + c.baseY) * 60;
      const cy = c.baseY + Math.cos(t * c.speed * 0.7) * 15;

      g.ellipse(cx, cy, c.scale * 1.6, c.scale * 0.7);
      g.fill({ color: 0xd8f3dc, alpha: 0.08 });
      g.ellipse(cx - 15, cy - 5, c.scale * 1.1, c.scale * 0.6);
      g.fill({ color: 0xffffff, alpha: 0.06 });
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
    g.stroke({ color: 0xd4af37, width: 2, alpha: 0.5 });

    // Territorial Boundary Pillars (Patok Batas Wanua) at 4 corners
    for (const corner of corners) {
      // Stone plinth
      g.rect(corner.x - 4, corner.y - 12, 8, 14);
      g.fill({ color: 0x2e2920, alpha: 0.9 });
      g.stroke({ color: 0xd4af37, width: 1, alpha: 0.8 });

      // Glowing Golden Lamp finial
      g.circle(corner.x, corner.y - 15, 4.5);
      g.fill({ color: 0xffd700, alpha: 0.95 });
      g.circle(corner.x, corner.y - 15, 7);
      g.fill({ color: 0xffe066, alpha: 0.25 });
    }

    this.roadLayer.addChild(g);
  }
}
