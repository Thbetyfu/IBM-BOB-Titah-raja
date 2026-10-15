/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Autonomous Citizen Sprites & Animated Nusantara Behaviors (SDD Bab 5.2)
 *
 * Visualizes 6 authentic autonomous citizen behaviors:
 * 1. bekerja: Farmer with caping bambu, cangkul (hoe), and bobbing walk cycle.
 * 2. berdagang: Merchant with shoulder pikulan (bamboo pole & swinging baskets).
 * 3. mengeluh: Discontent villager scratching head with animated thought bubble.
 * 4. mencuri: Bandit slinking with stolen grain sack (kantung gabah).
 * 5. mengungsi: Deserter/refugee carrying bundled travel goods (buntelan kain).
 * 6. memberontak: Rebel brandishing an animated burning bamboo torch (obor bambu).
 */

import { Container, Graphics } from "pixi.js";
import { gridToIso, IsoPoint } from "./IsometricMap";
import { ActionType } from "../types/game";

interface AgentRenderData {
  id: string;
  gridX: number;
  gridY: number;
  targetX: number;
  targetY: number;
  action: ActionType;
  color: number;
  progress: number;
  speed: number;
}

export class AgentSprites {
  public container: Container;
  private agents: AgentRenderData[] = [];
  private graphics: Graphics;
  private animTimer: number = 0;

  constructor() {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);

    this.spawnAgents(35);
  }

  public init(parent: Container): void {
    parent.addChild(this.container);
  }

  public spawnAgents(count: number = 32): void {
    this.agents = [];
    const actions: ActionType[] = ["bekerja", "berdagang", "mengeluh", "mencuri", "mengungsi", "memberontak"];

    for (let i = 0; i < count; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      const gx = Math.floor(Math.random() * 12) + 2;
      const gy = Math.floor(Math.random() * 6) + 1; // Village residential & farm territory

      let color = 0x2e7d32; // Forest green for work
      if (action === "berdagang") color = 0xd97706; // Rich amber for merchant
      if (action === "mengeluh") color = 0xe65100; // Deep orange for protest
      if (action === "mencuri") color = 0x7b1fa2; // Shadow purple for thief
      if (action === "mengungsi") color = 0x455a64; // Slate for refugee
      if (action === "memberontak") color = 0xb71c1c; // Crimson red for rebel

      this.agents.push({
        id: `agent-${i}`,
        gridX: gx,
        gridY: gy,
        targetX: gx + (Math.random() * 2 - 1),
        targetY: gy + (Math.random() * 2 - 1),
        action,
        color,
        progress: Math.random(),
        speed: 0.004 + Math.random() * 0.006
      });
    }
  }

  public update(deltaSec: number): void {
    this.animTimer += deltaSec;
    const deltaMs = deltaSec * 1000;
    this.graphics.clear();

    for (const agent of this.agents) {
      agent.progress += agent.speed * (deltaMs / 16);
      if (agent.progress >= 1) {
        agent.progress = 0;
        agent.gridX = agent.targetX;
        agent.gridY = agent.targetY;
        agent.targetX = Math.max(1, Math.min(14, agent.gridX + (Math.random() * 2.2 - 1.1)));
        agent.targetY = Math.max(1, Math.min(6, agent.gridY + (Math.random() * 2.2 - 1.1)));
      }

      // Isometric position interpolation
      const curGx = agent.gridX + (agent.targetX - agent.gridX) * agent.progress;
      const curGy = agent.gridY + (agent.targetY - agent.gridY) * agent.progress;
      const pos = gridToIso(curGx, curGy);

      this.drawAgentFigure(pos, agent);
    }
  }

  public updateAgents(_actionCounts?: Record<ActionType, number>, deltaMs: number = 16): void {
    void _actionCounts;
    this.update(deltaMs / 1000);
  }

  private drawAgentFigure(pos: IsoPoint, agent: AgentRenderData): void {
    const g = this.graphics;
    const { x } = pos;

    // Bobbing walk cycle: stepped vertical rhythm
    const bob = Math.abs(Math.sin(agent.progress * Math.PI * 8)) * 2.2;
    const y = pos.y - bob;

    // 1. Dynamic Ground Shadow
    g.ellipse(x, pos.y + 1, 4.5, 2.2);
    g.fill({ color: 0x000000, alpha: 0.32 });

    // 2. Jarik / Sarong Lower Body (Dark indigo / lurik)
    g.poly([
      x - 2.5, y - 5,
      x + 2.5, y - 5,
      x + 3.2, y,
      x - 3.2, y
    ]);
    g.fill({ color: 0x1f2421 });

    // 3. Surjan / Baju Kurung Torso
    g.rect(x - 2.8, y - 11, 5.6, 6.5);
    g.fill({ color: agent.color });
    g.stroke({ color: 0x1a1a1a, width: 0.5, alpha: 0.4 });

    // 4. Skin Tone & Head
    g.circle(x, y - 13.5, 2.6);
    g.fill({ color: 0xe0a96d }); // Warm Nusantara skin tone

    // 5. Caping Bambu (Conical woven straw hat)
    g.poly([
      x - 5, y - 14.5,
      x, y - 19,
      x + 5, y - 14.5
    ]);
    g.fill({ color: 0xd4a373 });
    g.stroke({ color: 0x8d6e63, width: 0.8 });

    // Caping Crown Tip
    g.circle(x, y - 19, 0.8);
    g.fill({ color: 0x6f4e37 });

    // 6. Action-Specific Authentic Accessories
    if (agent.action === "bekerja") {
      // Cangkul (Farming hoe) held in hand
      g.moveTo(x + 2.5, y - 8);
      g.lineTo(x + 7, y - 14);
      g.stroke({ color: 0x8d6e63, width: 1.2 }); // Wooden handle

      // Iron hoe blade
      g.rect(x + 6, y - 15.5, 3, 2);
      g.fill({ color: 0x9e9e9e });
    } else if (agent.action === "berdagang") {
      // Pikulan (Bamboo carrying pole across shoulders with swinging baskets)
      const basketSwing = Math.sin(agent.progress * Math.PI * 8) * 1.5;

      // Pole
      g.moveTo(x - 8, y - 10 + basketSwing);
      g.lineTo(x + 8, y - 10 - basketSwing);
      g.stroke({ color: 0xca8a04, width: 1.2 });

      // Left Woven Basket
      g.poly([
        x - 9, y - 6 + basketSwing,
        x - 6, y - 6 + basketSwing,
        x - 7, y - 3 + basketSwing,
        x - 8, y - 3 + basketSwing
      ]);
      g.fill({ color: 0xa16207 });

      // Right Woven Basket
      g.poly([
        x + 6, y - 6 - basketSwing,
        x + 9, y - 6 - basketSwing,
        x + 8, y - 3 - basketSwing,
        x + 7, y - 3 - basketSwing
      ]);
      g.fill({ color: 0xa16207 });
    } else if (agent.action === "mengeluh") {
      // Animated questioning thought bubble
      const pulse = Math.sin(this.animTimer * 5) * 1;
      g.circle(x + 4.5, y - 17 + pulse, 2.2);
      g.fill({ color: 0xfb8c00 });
      g.circle(x + 2.8, y - 14, 1);
      g.fill({ color: 0xfb8c00 });
    } else if (agent.action === "mencuri") {
      // Stolen Grain Sack slung over shoulder
      g.ellipse(x - 3.5, y - 9, 3.2, 4);
      g.fill({ color: 0xd4a373 });
      g.stroke({ color: 0x795548, width: 0.8 });

      // Purple stealth alert mark
      g.circle(x, y - 21, 1.2);
      g.fill({ color: 0xba68c8 });
    } else if (agent.action === "mengungsi") {
      // Buntelan Kain (Cloth bundle carried on head/shoulder)
      g.circle(x - 3.5, y - 13, 2.4);
      g.fill({ color: 0x90a4ae });
    } else if (agent.action === "memberontak") {
      // Obor Bambu (Bamboo fire torch with flickering flame)
      const flicker = Math.sin(this.animTimer * 12) * 1.5;

      // Torch handle
      g.moveTo(x + 3, y - 7);
      g.lineTo(x + 6, y - 16);
      g.stroke({ color: 0x5d4037, width: 1.5 });

      // Fire Flame (Amber & Crimson)
      g.poly([
        x + 4, y - 16,
        x + 6 + flicker, y - 22,
        x + 8, y - 16
      ]);
      g.fill({ color: 0xff3d00 });

      // Inner hot yellow core
      g.circle(x + 6, y - 17, 1.5);
      g.fill({ color: 0xffea00 });
    }
  }
}
