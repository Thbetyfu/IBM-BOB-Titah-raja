/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Pixi.js v8 Canvas Application & Viewport Camera Loop (SDD Bab 5.1 & 5.2)
 */

import { Application, Container } from "pixi.js";
import { IsometricMap } from "./IsometricMap";
import { BuildingSprites } from "./BuildingSprites";
import { AgentSprites } from "./AgentSprites";
import { CalamityEffects } from "./CalamityEffects";

export class PixiApp {
  public app: Application;
  public stageContainer: Container;
  public groundLayer: Container;
  public riverLayer: Container;
  public roadLayer: Container;
  public entityLayer: Container;
  public calamityLayer: Container;

  public isometricMap: IsometricMap;
  public buildings: BuildingSprites;
  public agents: AgentSprites;
  public calamity: CalamityEffects;

  // Camera viewport panning and zoom
  public isInitialized: boolean = false;
  private isDestroyed: boolean = false;
  private isDragging: boolean = false;
  private dragStart = { x: 0, y: 0 };
  private cameraPos = { x: 0, y: 0 };
  private zoomLevel: number = 1.0;
  private minZoom: number = 0.5;
  private maxZoom: number = 2.0;

  constructor() {
    this.app = new Application();
    this.stageContainer = new Container();
    this.groundLayer = new Container();
    this.riverLayer = new Container();
    this.roadLayer = new Container();
    this.entityLayer = new Container();
    this.calamityLayer = new Container();

    this.isometricMap = new IsometricMap();
    this.buildings = new BuildingSprites();
    this.agents = new AgentSprites();
    this.calamity = new CalamityEffects();
  }

  public async init(parent: HTMLElement): Promise<void> {
    if (this.isDestroyed) return;

    await this.app.init({
      resizeTo: parent || window,
      background: "#080c08",
      antialias: true,
      resolution: typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
      autoDensity: true
    });

    if (this.isDestroyed) {
      try {
        this.app.destroy(true, { children: true });
      } catch {
        // ignore
      }
      return;
    }

    if (parent && this.app.canvas) {
      parent.appendChild(this.app.canvas);
    }

    // Build Layer Hierarchy per SDD Bab 5.2
    this.app.stage.addChild(this.stageContainer);
    this.stageContainer.addChild(this.groundLayer);
    this.stageContainer.addChild(this.riverLayer);
    this.stageContainer.addChild(this.roadLayer);
    this.stageContainer.addChild(this.entityLayer);
    this.stageContainer.addChild(this.calamityLayer);

    // Center camera on the kingdom center
    this.cameraPos.x = this.app.screen.width / 2;
    this.cameraPos.y = this.app.screen.height / 3;
    this.updateTransform();

    // Initialize sub-systems
    this.isometricMap.init(this.groundLayer, this.riverLayer, this.roadLayer);
    this.buildings.init(this.entityLayer);
    this.agents.init(this.entityLayer);
    this.calamity.init(this.calamityLayer);

    // Setup Camera Interactions (Pan / Zoom)
    this.setupCameraListeners();

    // Start Ticker Loop
    this.app.ticker.add((ticker: { deltaTime: number }) => {
      if (this.isDestroyed) return;
      const deltaSec = ticker.deltaTime / 60;
      this.agents.update(deltaSec);
      this.calamity.update(deltaSec);

      // Dynamic Y-sorting for isometric depth
      this.entityLayer.children.sort((a: Container, b: Container) => a.y - b.y);
    });

    this.isInitialized = true;
  }

  private setupCameraListeners(): void {
    const canvas = this.app.canvas;
    if (!canvas) return;

    canvas.addEventListener("pointerdown", (e: PointerEvent) => {
      this.isDragging = true;
      this.dragStart = { x: e.clientX - this.cameraPos.x, y: e.clientY - this.cameraPos.y };
      canvas.style.cursor = "grabbing";
    });

    window.addEventListener("pointermove", (e: PointerEvent) => {
      if (!this.isDragging) return;
      this.cameraPos.x = e.clientX - this.dragStart.x;
      this.cameraPos.y = e.clientY - this.dragStart.y;
      this.updateTransform();
    });

    window.addEventListener("pointerup", () => {
      this.isDragging = false;
      canvas.style.cursor = "grab";
    });

    canvas.addEventListener(
      "wheel",
      (e: WheelEvent) => {
        e.preventDefault();
        const zoomDelta = e.deltaY < 0 ? 1.1 : 0.9;
        const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel * zoomDelta));

        // Zoom relative to pointer
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        this.cameraPos.x = mouseX - (mouseX - this.cameraPos.x) * (newZoom / this.zoomLevel);
        this.cameraPos.y = mouseY - (mouseY - this.cameraPos.y) * (newZoom / this.zoomLevel);
        this.zoomLevel = newZoom;

        this.updateTransform();
      },
      { passive: false }
    );

    canvas.style.cursor = "grab";
  }

  public syncWithGameState(
    balaiLv: number,
    lumbungLv: number,
    posRondaLv: number,
    weather: any,
    bossActive: boolean,
    bossHp: number,
    bossMaxHp: number
  ): void {
    if (!this.isInitialized || this.isDestroyed) return;
    this.buildings.updateLevels(balaiLv, lumbungLv, posRondaLv);
    this.calamity.setWeather(weather);
    this.calamity.setBoss(bossActive, bossHp, bossMaxHp);
  }

  public resetCamera(): void {
    this.zoomLevel = 1.0;
    this.cameraPos.x = this.app.screen.width / 2;
    this.cameraPos.y = this.app.screen.height / 3;
    this.updateTransform();
  }

  private updateTransform(): void {
    this.stageContainer.position.set(this.cameraPos.x, this.cameraPos.y);
    this.stageContainer.scale.set(this.zoomLevel);
  }

  public destroy(): void {
    this.isDestroyed = true;
    this.isInitialized = false;
    try {
      if (this.app.canvas && this.app.canvas.parentElement) {
        this.app.canvas.parentElement.removeChild(this.app.canvas);
      }
      this.app.destroy(true, { children: true, texture: true });
    } catch {
      // Ignore cleanup error gracefully
    }
  }
}
