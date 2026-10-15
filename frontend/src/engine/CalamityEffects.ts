/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Calamity Weather Particle System & Boss Naga Banjir 2.5D Sprite (SDD Bab 5.2)
 *
 * Implements:
 * 1. Dynamic weather particles:
 *    - CERAH: gentle ambient golden pollen/floating embers
 *    - PACEKLIK: drought haze, amber sand drifting
 *    - BANJIR_BANDANG: torrential slanted rain, water ripples, lightning flashes
 * 2. Boss Naga Banjir Sang Hyang Tuntang:
 *    - Hand-Painted Epic 2.5D Mythic Dragon surging from foaming turquoise river
 *    - Serpentine undulating tail coils cutting through the Sendang River
 *    - Royal Boss HP Bar, glowing water ripples, and lightning aura
 */

import { Container, Graphics, Sprite, Assets, Text, TextStyle } from "pixi.js";
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
  private bossHpBarGfx!: Graphics;
  private bossSprite!: Sprite;

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

    // Initialize 2.5D Hand-painted Boss Naga Sprite
    const nagaTex = Assets.get("/assets/units/boss_naga_banjir.png");
    this.bossSprite = nagaTex ? new Sprite(nagaTex) : Sprite.from("/assets/units/boss_naga_banjir.png");
    this.bossSprite.anchor.set(0.5, 0.78);
    this.bossSprite.scale.set(0.38);
    this.bossSprite.visible = false;
    this.container.addChild(this.bossSprite);

    this.container.addChild(this.bossLabelContainer);
    this.container.addChild(this.lightningGfx);

    // Initialize Boss HP HUD element with royal border & health bar
    this.bossHpBarGfx = new Graphics();
    this.bossLabelContainer.addChild(this.bossHpBarGfx);

    const style = new TextStyle({
      fontFamily: "Inter, 'Cinzel', serif",
      fontSize: 11,
      fontWeight: "bold",
      fill: 0xffe6a7,
      dropShadow: {
        alpha: 0.85,
        angle: Math.PI / 6,
        blur: 3,
        color: 0x000000,
        distance: 1
      }
    });

    this.bossHpText = new Text({ text: "Sang Hyang Naga Tuntang (500/500 HP)", style });
    this.bossHpText.anchor.set(0.5, 1);
    this.bossHpText.position.set(0, -8);
    this.bossLabelContainer.addChild(this.bossHpText);
    this.bossLabelContainer.visible = false;

    // Spawn particle drops for dynamic weather
    for (let i = 0; i < 140; i++) {
      this.rainDrops.push({
        x: Math.random() * 1600 - 800,
        y: Math.random() * 1200 - 400,
        speed: 320 + Math.random() * 280,
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
    if (this.bossSprite) {
      this.bossSprite.visible = active && this.bossHp > 0;
    }
  }

  public update(deltaSec: number): void {
    this.elapsedTime += deltaSec;
    this.updateWeatherParticles(deltaSec);

    if (this.bossActive && this.bossHp > 0) {
      this.renderNagaBanjir();
    } else {
      this.nagaGfx.clear();
      this.bossSprite.visible = false;
      this.bossLabelContainer.visible = false;
    }
  }

  private updateWeatherParticles(deltaSec: number): void {
    this.weatherGfx.clear();
    this.lightningGfx.clear();

    if (this.weather === "CERAH") {
      // Gentle floating golden pollen particles
      for (const drop of this.rainDrops) {
        drop.y += 18 * deltaSec;
        drop.x += Math.sin(this.elapsedTime + drop.y) * 14 * deltaSec;
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
        drop.x += (drop.speed * 0.45) * deltaSec;
        drop.y += 8 * deltaSec;
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
   * 2.5D Sprite & Serpentine Multi-Segmented Naga Banjir Sang Hyang Tuntang
   */
  private renderNagaBanjir(): void {
    this.nagaGfx.clear();
    this.bossHpBarGfx.clear();

    const t = this.elapsedTime * 2.2;

    // Follow the river diagonal trajectory across grid coordinates
    const headGridX = 10;
    const headGridY = 13.5;

    const baseHeadPos = IsometricMap.gridToScreen(headGridX, headGridY);
    // Sinusoidal floating bobbing along river surface
    const headFloatY = Math.sin(t) * 6;
    const headX = baseHeadPos.x;
    const headY = baseHeadPos.y + headFloatY;

    // Position the 2.5D Boss Naga Sprite at the head
    this.bossSprite.visible = true;
    this.bossSprite.position.set(headX, headY);

    // Expand water ripple rings around Naga base
    const rippleRadius = 36 + Math.sin(t * 1.5) * 10;
    this.nagaGfx.ellipse(headX, headY + 12, rippleRadius * 1.6, rippleRadius * 0.8);
    this.nagaGfx.stroke({ color: 0x4ecdc4, width: 2, alpha: 0.6 });
    this.nagaGfx.ellipse(headX, headY + 12, rippleRadius * 0.9, rippleRadius * 0.45);
    this.nagaGfx.fill({ color: 0x1b4332, alpha: 0.3 });

    // Update Boss HP label & Bar above the Naga Head
    this.bossLabelContainer.visible = true;
    this.bossLabelContainer.position.set(headX, headY - 110);
    this.bossHpText.text = `Sang Hyang Naga Tuntang (${this.bossHp}/${this.bossMaxHp} HP)`;

    // Draw Boss HP Bar with gold border
    const barW = 140;
    const barH = 7;
    const fillFrac = Math.max(0, Math.min(1, this.bossHp / this.bossMaxHp));
    this.bossHpBarGfx.roundRect(-barW / 2, 0, barW, barH, 4);
    this.bossHpBarGfx.fill({ color: 0x1a0f0f, alpha: 0.88 });
    this.bossHpBarGfx.stroke({ color: 0xd4af37, width: 1.2, alpha: 0.85 });

    if (fillFrac > 0) {
      this.bossHpBarGfx.roundRect(-barW / 2 + 1, 1, (barW - 2) * fillFrac, barH - 2, 3);
      this.bossHpBarGfx.fill({ color: fillFrac > 0.4 ? 0xdc2626 : 0xef4444 });
    }
  }
}
