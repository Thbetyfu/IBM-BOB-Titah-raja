/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Calamity Weather Particle System & Boss Naga Banjir Renderer (SDD Bab 5.2)
 *
 * Implements:
 * 1. Dynamic weather particles:
 *    - CERAH: gentle ambient pollen/floating embers
 *    - PACEKLIK: drought haze, brown dust particles
 *    - BANJIR_BANDANG: torrential slanted rain, water ripples, lightning flashes
 * 2. Boss Naga Banjir Sang Hyang Tuntang:
 *    - Multi-segmented serpentine dragon along the Sendang river
 *    - Undulating sinusoidal motion with dorsal spines, glowing eyes, and HP bar
 */

import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { IsometricMap } from "./IsometricMap";
import { WeatherState } from "../store/useGameStore";

interface RainDrop {
  x: number;
  y: number;
  speed: number;
  length: number;
  alpha: number;
}

export class CalamityEffects {
  public container!: Container;
  private weatherGfx!: Graphics;
  private nagaGfx!: Graphics;
  private lightningGfx!: Graphics;
  private bossLabelContainer!: Container;
  private bossHpText!: Text;

  private weather: WeatherState = "CERAH";
  private rainDrops: RainDrop[] = [];
  private bossActive: boolean = false;
  private bossHp: number = 500;
  private bossMaxHp: number = 500;
  private elapsedTime: number = 0;
  private lightningTimer: number = 0;

  public init(parent: Container): void {
    this.container = new Container();
    parent.addChild(this.container);

    this.weatherGfx = new Graphics();
    this.nagaGfx = new Graphics();
    this.lightningGfx = new Graphics();
    this.bossLabelContainer = new Container();

    this.container.addChild(this.weatherGfx);
    this.container.addChild(this.nagaGfx);
    this.container.addChild(this.bossLabelContainer);
    this.container.addChild(this.lightningGfx);

    // Initialize Boss HP HUD element
    const style = new TextStyle({
      fontFamily: "Inter, sans-serif",
      fontSize: 11,
      fontWeight: "bold",
      fill: 0xff4d4d,
      stroke: { color: 0x000000, width: 3 },
      dropShadow: {
        alpha: 0.8,
        angle: Math.PI / 6,
        blur: 2,
        color: 0x000000,
        distance: 1
      }
    });

    this.bossHpText = new Text({ text: "Naga Banjir (500/500 HP)", style });
    this.bossHpText.anchor.set(0.5, 1);
    this.bossLabelContainer.addChild(this.bossHpText);
    this.bossLabelContainer.visible = false;

    // Spawn 100 particle drops
    for (let i = 0; i < 120; i++) {
      this.rainDrops.push({
        x: Math.random() * 1600 - 800,
        y: Math.random() * 1200 - 400,
        speed: 300 + Math.random() * 300,
        length: 8 + Math.random() * 12,
        alpha: 0.3 + Math.random() * 0.5
      });
    }
  }

  public setWeather(weather: WeatherState): void {
    this.weather = weather;
  }

  public setBoss(active: boolean, hp: number = 500, maxHp: number = 500): void {
    this.bossActive = active;
    this.bossHp = Math.max(0, hp);
    this.bossMaxHp = maxHp;
    if (this.bossLabelContainer) {
      this.bossLabelContainer.visible = active && this.bossHp > 0;
    }
  }

  public update(deltaSec: number): void {
    this.elapsedTime += deltaSec;
    this.updateWeatherParticles(deltaSec);

    if (this.bossActive && this.bossHp > 0) {
      this.renderNagaBanjir();
    } else {
      this.nagaGfx.clear();
      this.bossLabelContainer.visible = false;
    }
  }

  private updateWeatherParticles(deltaSec: number): void {
    this.weatherGfx.clear();
    this.lightningGfx.clear();

    if (this.weather === "CERAH") {
      // Gentle floating golden pollen particles
      for (const drop of this.rainDrops) {
        drop.y += 20 * deltaSec;
        drop.x += Math.sin(this.elapsedTime + drop.y) * 15 * deltaSec;
        if (drop.y > 600) drop.y = -300;
        if (drop.x > 800) drop.x = -800;

        this.weatherGfx.circle(drop.x, drop.y, 1.2);
        this.weatherGfx.fill({ color: 0xffd166, alpha: 0.25 });
      }
      return;
    }

    if (this.weather === "PACEKLIK") {
      // Drought dry haze and amber sand drifting horizontally
      for (const drop of this.rainDrops) {
        drop.x += (drop.speed * 0.4) * deltaSec;
        drop.y += 10 * deltaSec;
        if (drop.x > 800) drop.x = -800;
        if (drop.y > 600) drop.y = -300;

        this.weatherGfx.circle(drop.x, drop.y, 1.5);
        this.weatherGfx.fill({ color: 0xcc8b3c, alpha: 0.35 });
      }

      // Sepia tinted haze overlay
      this.weatherGfx.rect(-800, -400, 1600, 1200);
      this.weatherGfx.fill({ color: 0x8c5b23, alpha: 0.08 });
      return;
    }

    if (this.weather === "BANJIR_BANDANG") {
      // Torrential slanted rain
      for (const drop of this.rainDrops) {
        drop.x -= (drop.speed * 0.35) * deltaSec;
        drop.y += (drop.speed * 1.2) * deltaSec;

        if (drop.y > 700) {
          drop.y = -400;
          drop.x = Math.random() * 1600 - 800;
        }

        this.weatherGfx.moveTo(drop.x, drop.y);
        this.weatherGfx.lineTo(drop.x - 3, drop.y + drop.length);
        this.weatherGfx.stroke({ color: 0x70c1b3, width: 1.5, alpha: drop.alpha });
      }

      // Bluish dark storm overlay
      this.weatherGfx.rect(-800, -400, 1600, 1200);
      this.weatherGfx.fill({ color: 0x051923, alpha: 0.18 });

      // Occasional lightning flash
      this.lightningTimer += deltaSec;
      if (this.lightningTimer > 4.5 && Math.random() < 0.2) {
        this.lightningGfx.rect(-800, -400, 1600, 1200);
        this.lightningGfx.fill({ color: 0xffffff, alpha: 0.35 });
        this.lightningTimer = 0;
      }
    }
  }

  /**
   * Procedural Multi-Segmented Naga Banjir Sang Hyang Tuntang
   */
  private renderNagaBanjir(): void {
    this.nagaGfx.clear();

    const segments = 16;
    const t = this.elapsedTime * 2.5;

    // Follow the river diagonal trajectory across grid coordinates
    const headGridX = 10;
    const headGridY = 13.5;

    let prevPos = IsometricMap.gridToScreen(headGridX, headGridY);

    // Update Boss HP label position above the Naga Head
    this.bossLabelContainer.position.set(prevPos.x, prevPos.y - 36);
    this.bossHpText.text = `Naga Banjir (${this.bossHp}/${this.bossMaxHp} HP)`;

    // Draw Naga Body Segments from tail to head
    for (let i = segments; i >= 0; i--) {
      const frac = i / segments;
      const gx = headGridX - i * 0.55;
      const gy = headGridY - i * 0.55;

      const basePos = IsometricMap.gridToScreen(gx, gy);
      // Sinusoidal undulation perpendicular to the river flow
      const wave = Math.sin(t - i * 0.45) * 10;
      const wavePos = {
        x: basePos.x + wave * 0.89,
        y: basePos.y - wave * 0.44
      };

      const segmentRadius = i === 0 ? 11 : 9 - frac * 5;

      // Water ripple around each segment
      this.nagaGfx.ellipse(wavePos.x, wavePos.y + 2, segmentRadius * 1.6, segmentRadius * 0.8);
      this.nagaGfx.fill({ color: 0x4ecdc4, alpha: 0.25 });

      // Dragon Scale Body
      this.nagaGfx.circle(wavePos.x, wavePos.y, segmentRadius);
      this.nagaGfx.fill({ color: i % 2 === 0 ? 0x1b4332 : 0x2d6a4f });
      this.nagaGfx.stroke({ color: 0xd8f3dc, width: 1.2, alpha: 0.6 });

      // Dorsal Golden Spines / Fin
      if (i > 0 && i < segments - 2) {
        const spineHeight = 6 - frac * 3;
        this.nagaGfx.poly([
          wavePos.x - 2, wavePos.y - segmentRadius,
          wavePos.x, wavePos.y - segmentRadius - spineHeight,
          wavePos.x + 2, wavePos.y - segmentRadius
        ]);
        this.nagaGfx.fill({ color: 0xffd166 });
      }

      // Naga Head Details (when i === 0)
      if (i === 0) {
        // Glowing ruby eyes
        this.nagaGfx.circle(wavePos.x - 4, wavePos.y - 3, 2);
        this.nagaGfx.circle(wavePos.x + 4, wavePos.y - 3, 2);
        this.nagaGfx.fill({ color: 0xff0054 });

        // Horns / Mahkota Sang Hyang Tuntang
        this.nagaGfx.poly([
          wavePos.x - 7, wavePos.y - 8,
          wavePos.x - 12, wavePos.y - 18,
          wavePos.x - 4, wavePos.y - 9
        ]);
        this.nagaGfx.fill({ color: 0xffd700 });

        this.nagaGfx.poly([
          wavePos.x + 7, wavePos.y - 8,
          wavePos.x + 12, wavePos.y - 18,
          wavePos.x + 4, wavePos.y - 9
        ]);
        this.nagaGfx.fill({ color: 0xffd700 });

        // Golden whisker arcs
        this.nagaGfx.moveTo(wavePos.x - 6, wavePos.y + 2);
        this.nagaGfx.lineTo(wavePos.x - 16, wavePos.y + 6 + Math.sin(t) * 3);
        this.nagaGfx.stroke({ color: 0xffe6a7, width: 1.5, alpha: 0.8 });

        this.nagaGfx.moveTo(wavePos.x + 6, wavePos.y + 2);
        this.nagaGfx.lineTo(wavePos.x + 16, wavePos.y + 6 + Math.cos(t) * 3);
        this.nagaGfx.stroke({ color: 0xffe6a7, width: 1.5, alpha: 0.8 });
      }

      prevPos = wavePos;
    }
  }
}
