/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Living Strategy Board & Tactical Diorama Map (SDD Bab 5.1)
 * Inspired by Civilization VI, Manor Lords, and Bad North.
 *
 * Implements:
 * 1. Deep 3D Floating Diorama Cliff Pedestal (Layered basalt/sandstone strata cutaway)
 * 2. Cascading twin waterfalls with animated mist foam spilling off the cliff edge
 * 3. Sawah Terasering Berundak (Ubud Subak) with shimmering sky reflections & young rice bunches
 * 4. River Sendang with wooden dock pier, mooring bollards, & bobbing wooden sampan
 * 5. Paved Cobblestone road network connecting the district compounds
 * 6. Miniature tropical coconut palm clusters on the perimeter ridges
 * 7. Soft tactical tile hover selector with golden rune accent
 */

import { Container, Graphics, FederatedPointerEvent } from "pixi.js";

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
  private dockAndBoatGfx!: Graphics;
  private cloudsGfx!: Graphics;
  private palmTreesGfx!: Graphics;
  private hoverGfx!: Graphics;

  private riverTiles = new Set<string>();
  private riverTileCoords: { x: number; y: number; sx: number; sy: number }[] = [];
  private elapsedTime: number = 0;
  private hoveredTile: { x: number; y: number } | null = null;

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
    this.dockAndBoatGfx = new Graphics();
    this.palmTreesGfx = new Graphics();
    this.hoverGfx = new Graphics();
    this.cloudsGfx = new Graphics();

    // Layer stack
    this.groundLayer.addChild(this.cliffGfx);
    this.riverLayer.addChild(this.animatedWaterGfx);
    this.riverLayer.addChild(this.dockAndBoatGfx);
    this.roadLayer.addChild(this.palmTreesGfx);
    this.roadLayer.addChild(this.hoverGfx);
    this.roadLayer.addChild(this.cloudsGfx);

    // River Sendang course (y = x + 3 and x + 4)
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
    this.renderPalmTreeGroves();
    this.setupHoverListener();
  }

  private setupHoverListener(): void {
    this.groundLayer.eventMode = "static";
    this.groundLayer.on("pointermove", (e: FederatedPointerEvent) => {
      const local = this.groundLayer.toLocal(e.global);
      const grid = IsometricMap.screenToGrid(local.x, local.y);
      if (grid.x >= 0 && grid.x < IsometricMap.GRID_SIZE && grid.y >= 0 && grid.y < IsometricMap.GRID_SIZE) {
        this.hoveredTile = grid;
      } else {
        this.hoveredTile = null;
      }
    });

    this.groundLayer.on("pointerleave", () => {
      this.hoveredTile = null;
    });
  }

  public update(deltaSec: number): void {
    this.elapsedTime += deltaSec;
    this.renderAnimatedRiver();
    this.renderAnimatedDockAndBoat();
    this.renderFloatingClouds();
    this.renderTacticalHover();
  }

  /**
   * 3D Floating Diorama Cliff Pedestal (Bad North style rock strata & waterfalls)
   */
  private renderDioramaCliff(): void {
    const g = this.cliffGfx;
    g.clear();
    const halfW = IsometricMap.TILE_WIDTH / 2;
    const halfH = IsometricMap.TILE_HEIGHT / 2;
    const cliffDepth = 75;

    // South-East edge (x from 0 to 17, at y = 17)
    for (let x = 0; x < IsometricMap.GRID_SIZE; x++) {
      const pos = IsometricMap.gridToScreen(x, 17);
      const isRiver = this.riverTiles.has(`${x},17`);

      // Left cliff wall face
      g.poly([
        pos.x - halfW, pos.y,
        pos.x, pos.y + halfH,
        pos.x, pos.y + halfH + cliffDepth,
        pos.x - halfW, pos.y + cliffDepth
      ]);
      g.fill({ color: isRiver ? 0x0f2a2e : 0x221a14 });
      g.stroke({ color: 0x140f0c, width: 1, alpha: 0.6 });

      // Horizontal geological strata band
      g.moveTo(pos.x - halfW, pos.y + cliffDepth * 0.45);
      g.lineTo(pos.x, pos.y + halfH + cliffDepth * 0.45);
      g.stroke({ color: 0x3d2e24, width: 2, alpha: 0.7 });

      // Right cliff wall face
      g.poly([
        pos.x, pos.y + halfH,
        pos.x + halfW, pos.y,
        pos.x + halfW, pos.y + cliffDepth,
        pos.x, pos.y + halfH + cliffDepth
      ]);
      g.fill({ color: isRiver ? 0x0a1f22 : 0x2c221a });
      g.stroke({ color: 0x140f0c, width: 1, alpha: 0.6 });

      // Roaring Waterfall where river spills off the edge
      if (isRiver) {
        g.rect(pos.x - 10, pos.y + halfH, 20, cliffDepth + 18);
        g.fill({ color: 0x56cfe1, alpha: 0.85 });
        // White water churning mist
        g.ellipse(pos.x, pos.y + halfH + cliffDepth + 18, 26, 12);
        g.fill({ color: 0xe0fbfc, alpha: 0.8 });
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
      g.fill({ color: isRiver ? 0x0f2a2e : 0x261d16 });
      g.stroke({ color: 0x140f0c, width: 1, alpha: 0.6 });

      if (isRiver) {
        g.rect(pos.x - 8, pos.y + halfH, 16, cliffDepth + 18);
        g.fill({ color: 0x56cfe1, alpha: 0.85 });
        g.ellipse(pos.x, pos.y + halfH + cliffDepth + 18, 24, 11);
        g.fill({ color: 0xe0fbfc, alpha: 0.8 });
      }
    }
  }

  /**
   * Living Strategy Board Tiles (Terraces, Subak Paddies, & Cobblestone Network)
   */
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
          // Deep crystalline riverbed with emerald depth
          g.poly([
            0, -halfH,
            halfW, 0,
            0, halfH,
            -halfW, 0
          ]);
          g.fill({ color: 0x134e5e });
          g.stroke({ color: 0x256d85, width: 1, alpha: 0.7 });

          // Subsurface riverbed stones
          g.ellipse(0, 0, halfW * 0.65, halfH * 0.65);
          g.fill({ color: 0x0d3b46, alpha: 0.6 });

          g.position.set(sx, sy);
          this.riverLayer.addChild(g);
        } else {
          // Living Strategy Board Zoning
          const isKeratonDistrict = (x >= 7 && x <= 9 && y >= 4 && y <= 6);
          const isGranaryDistrict = (x >= 10 && x <= 12 && y >= 3 && y <= 5);
          const isWatchtowerDistrict = (x >= 4 && x <= 6 && y >= 6 && y <= 8);

          // Paved Cobblestone Road Network connecting the 3 districts
          const isRoad =
            (x === 8 && y >= 4 && y <= 7) ||
            (y === 5 && x >= 5 && x <= 11) ||
            (x === 6 && y === 6);

          const isWildBorder = x < 2 || y < 2 || x > 15 || y > 15;

          let baseColor = 0x2b5329; // Lush green agricultural soil
          let borderColor = 0x3a6b35;

          if (isKeratonDistrict) {
            baseColor = 0x3d3830; // Polished grey andesite plaza
            borderColor = 0x5a5246;
          } else if (isGranaryDistrict) {
            baseColor = 0x6b5e3f; // Sandy dry agricultural yard
            borderColor = 0x8a7b55;
          } else if (isWatchtowerDistrict) {
            baseColor = 0x483c32; // Compact dirt bastion ground
            borderColor = 0x5e5043;
          } else if (isRoad) {
            baseColor = 0x52483a; // Weathered cobblestone road
            borderColor = 0x6e6250;
          } else if (isWildBorder) {
            baseColor = 0x152a18; // Dense wild forest border
            borderColor = 0x1f3d23;
          }

          // Subtle organic terrace elevation tint
          if (!isKeratonDistrict && !isGranaryDistrict && !isWatchtowerDistrict && !isRoad && !isWildBorder) {
            const terraceLevel = Math.floor((x + y) / 3);
            if (terraceLevel % 2 === 0) {
              baseColor = 0x336130;
            }
          }

          // Diamond base tile
          g.poly([
            0, -halfH,
            halfW, 0,
            0, halfH,
            -halfW, 0
          ]);
          g.fill({ color: baseColor });
          g.stroke({ color: borderColor, width: 1, alpha: 0.6 });

          // Sawah Terasering: Sky-reflecting water pools and young rice shoots
          if (!isKeratonDistrict && !isGranaryDistrict && !isWatchtowerDistrict && !isRoad && !isWildBorder) {
            // Earthen Subak Mud Ridge (Galengan)
            g.moveTo(-halfW + 4, 0);
            g.lineTo(0, halfH - 2);
            g.lineTo(halfW - 4, 0);
            g.stroke({ color: 0x4a3b2c, width: 1.5, alpha: 0.6 });

            // Sky-reflecting water pool
            g.poly([
              -12, -2,
              0, -8,
              12, -2,
              0, 4
            ]);
            g.fill({ color: 0x52b788, alpha: 0.35 });

            // Clustered rice shoots
            const seed = (x * 19 + y * 29) % 3;
            if (seed === 0) {
              // Dual green shoots
              g.moveTo(-5, 2);
              g.lineTo(-7, -4);
              g.stroke({ color: 0x95d5b2, width: 1.5 });

              g.moveTo(4, 1);
              g.lineTo(6, -5);
              g.stroke({ color: 0xb7e4c7, width: 1.5 });
            } else if (seed === 1) {
              // Golden-green mature grain bunch
              g.moveTo(0, 2);
              g.lineTo(-1, -5);
              g.stroke({ color: 0xd8f3dc, width: 1.8 });
            }
          }

          // Cobblestone Pavers on Road tiles
          if (isRoad) {
            g.ellipse(-5, -2, 3.5, 2.0);
            g.fill({ color: 0x736554, alpha: 0.8 });
            g.ellipse(4, 3, 4.0, 2.2);
            g.fill({ color: 0x615444, alpha: 0.8 });
            g.ellipse(0, 1, 2.8, 1.8);
            g.fill({ color: 0x827361, alpha: 0.7 });
          }

          g.position.set(sx, sy);
          this.groundLayer.addChild(g);
        }
      }
    }
  }

  /**
   * Sendang River Wooden Dock and Bobbing Sampan (ala Manor Lords)
   */
  private renderAnimatedDockAndBoat(): void {
    const g = this.dockAndBoatGfx;
    g.clear();

    // Dock position by the river bank (at grid 7, 10)
    const dockPos = IsometricMap.gridToScreen(7, 10);
    const dx = dockPos.x + 12;
    const dy = dockPos.y - 4;

    // 1. Wooden Pier Deck Planks
    g.poly([
      dx - 18, dy - 6,
      dx + 12, dy - 18,
      dx + 22, dy - 13,
      dx - 8, dy - 1
    ]);
    g.fill({ color: 0x5c4033 });
    g.stroke({ color: 0x3d2817, width: 1.2 });

    // Individual deck plank lines
    for (let i = 0; i < 4; i++) {
      const px = dx - 12 + i * 7;
      const py = dy - 4 - i * 3.5;
      g.moveTo(px - 4, py + 2);
      g.lineTo(px + 4, py - 2);
      g.stroke({ color: 0x3d2817, width: 0.8, alpha: 0.7 });
    }

    // Wooden Pilings into water
    g.rect(dx - 16, dy - 1, 3, 10);
    g.fill({ color: 0x2b1e16 });
    g.rect(dx + 16, dy - 12, 3, 10);
    g.fill({ color: 0x2b1e16 });

    // 2. Bobbing Wooden Sampan Boat
    const bob = Math.sin(this.elapsedTime * 2.2) * 2.5;
    const boatX = dx + 32;
    const boatY = dy - 2 + bob;

    // Boat shadow on water
    g.ellipse(boatX, boatY + 8, 14, 5);
    g.fill({ color: 0x082024, alpha: 0.4 });

    // Hollow dugout sampan hull
    g.poly([
      boatX - 16, boatY,
      boatX, boatY - 5,
      boatX + 16, boatY,
      boatX, boatY + 6
    ]);
    g.fill({ color: 0x785338 });
    g.stroke({ color: 0x4a3320, width: 1.2 });

    // Inner hull cavity
    g.poly([
      boatX - 11, boatY,
      boatX, boatY - 3,
      boatX + 11, boatY,
      boatX, boatY + 4
    ]);
    g.fill({ color: 0x3e2718 });

    // Mooring rope from dock to sampan
    g.moveTo(dx + 18, dy - 13);
    g.quadraticCurveTo(dx + 24, dy - 5, boatX - 14, boatY);
    g.stroke({ color: 0xca8a04, width: 1, alpha: 0.85 });
  }

  /**
   * Animated river waves and flowing water shimmer
   */
  private renderAnimatedRiver(): void {
    const g = this.animatedWaterGfx;
    g.clear();

    const t = this.elapsedTime * 2.2;

    for (const tile of this.riverTileCoords) {
      const wavePhase = t + (tile.x + tile.y) * 0.9;
      const rippleOffset = Math.sin(wavePhase) * 7;
      const rippleAlpha = 0.40 + Math.cos(wavePhase) * 0.25;

      // Turquoise wave highlight
      g.moveTo(tile.sx - 16 + rippleOffset, tile.sy - 2);
      g.lineTo(tile.sx + 16 + rippleOffset, tile.sy + 2);
      g.stroke({ color: 0x48cae4, width: 1.8, alpha: rippleAlpha });

      // Specular glint
      if ((tile.x * 7 + tile.y * 11) % 4 === 0) {
        const glintX = tile.sx + Math.cos(t * 1.8 + tile.x) * 9;
        const glintY = tile.sy + Math.sin(t * 1.8 + tile.y) * 4.5;
        g.circle(glintX, glintY, 1.4);
        g.fill({ color: 0xffffff, alpha: 0.8 });
      }
    }
  }

  /**
   * Miniature Tropical Coconut Palm Groves on perimeter ridges
   */
  private renderPalmTreeGroves(): void {
    const g = this.palmTreesGfx;
    g.clear();

    const palmCoords = [
      { gx: 2.5, gy: 3.5 },
      { gx: 3.2, gy: 2.8 },
      { gx: 14.5, gy: 3.2 },
      { gx: 13.8, gy: 2.5 },
      { gx: 2.8, gy: 14.2 },
      { gx: 3.5, gy: 14.8 }
    ];

    for (const p of palmCoords) {
      const pos = IsometricMap.gridToScreen(p.gx, p.gy);
      const px = pos.x;
      const py = pos.y;

      // Palm base shadow
      g.ellipse(px, py + 1, 7, 3.5);
      g.fill({ color: 0x000000, alpha: 0.35 });

      // Slender curved trunk (3 segments)
      g.moveTo(px, py);
      g.quadraticCurveTo(px - 5, py - 14, px - 2, py - 26);
      g.stroke({ color: 0x6f4e37, width: 3 });

      // Coconut fruit bunch
      g.circle(px - 2, py - 25, 2.2);
      g.fill({ color: 0x8d6e63 });

      // 5 Radiating palm fronds
      const crownX = px - 2;
      const crownY = py - 26;
      const angles = [-2.4, -1.8, -1.1, -0.4, 0.2];

      for (const a of angles) {
        const len = 14;
        const tipX = crownX + Math.cos(a) * len;
        const tipY = crownY + Math.sin(a) * len;
        g.moveTo(crownX, crownY);
        g.quadraticCurveTo(crownX + Math.cos(a) * (len * 0.6), crownY - 4, tipX, tipY);
        g.stroke({ color: 0x2d6a4f, width: 2.2 });
      }
    }
  }

  /**
   * Soft Tactical Tile Hover Outline
   */
  private renderTacticalHover(): void {
    const g = this.hoverGfx;
    g.clear();

    if (!this.hoveredTile) return;

    const { x, y } = this.hoveredTile;
    const { x: sx, y: sy } = IsometricMap.gridToScreen(x, y);
    const halfW = IsometricMap.TILE_WIDTH / 2;
    const halfH = IsometricMap.TILE_HEIGHT / 2;

    // Soft glowing gold tactical selector
    g.poly([
      sx, sy - halfH,
      sx + halfW, sy,
      sx, sy + halfH,
      sx - halfW, sy
    ]);
    g.stroke({ color: 0xffd166, width: 2, alpha: 0.85 });
    g.fill({ color: 0xffd166, alpha: 0.12 });
  }

  /**
   * Floating atmospheric clouds drifting around diorama perimeter & hearth smoke
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

    // Cozy Hearth Smoke Puffs from Balai Wanua Kitchen
    const smokeBase = IsometricMap.gridToScreen(8.1, 4.8);
    for (let p = 0; p < 4; p++) {
      const puffT = (this.elapsedTime * 0.8 + p * 0.7) % 2.8;
      const puffProgress = puffT / 2.8;
      const px = smokeBase.x - 22 + Math.sin(puffT * 2 + p) * 6 + puffProgress * 10;
      const py = smokeBase.y - 70 - puffProgress * 45;
      const puffRadius = 4.5 + puffProgress * 8;
      const puffAlpha = Math.max(0, 0.40 * (1 - puffProgress));

      g.circle(px, py, puffRadius);
      g.fill({ color: 0xf8f9fa, alpha: puffAlpha });
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
      g.rect(corner.x - 4, corner.y - 12, 8, 14);
      g.fill({ color: 0x2e2920, alpha: 0.9 });
      g.stroke({ color: 0xd4af37, width: 1, alpha: 0.8 });

      g.circle(corner.x, corner.y - 15, 4.5);
      g.fill({ color: 0xffd700, alpha: 0.95 });
      g.circle(corner.x, corner.y - 15, 7);
      g.fill({ color: 0xffe066, alpha: 0.25 });
    }

    this.roadLayer.addChild(g);
  }
}
