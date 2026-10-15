/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Autonomous Citizen Sprite & Action Badges Renderer (SDD Bab 5.2)
 *
 * Visualizes 6 autonomous behaviors:
 * bekerja, berdagang, mengeluh, mencuri, mengungsi, memberontak.
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

  constructor() {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);

    this.spawnAgents(35);
  }

  public init(parent: Container): void {
    parent.addChild(this.container);
  }

  public spawnAgents(count: number = 30): void {
    this.agents = [];
    const actions: ActionType[] = ["bekerja", "berdagang", "mengeluh", "mencuri", "mengungsi", "memberontak"];

    for (let i = 0; i < count; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      const gx = Math.floor(Math.random() * 12) + 2;
      const gy = Math.floor(Math.random() * 6) + 1; // North side of the river

      let color = 0x4caf50; // Green for work
      if (action === "berdagang") color = 0xffb300; // Gold for trade
      if (action === "mengeluh") color = 0xff9800; // Orange for protest
      if (action === "mencuri") color = 0x9c27b0; // Purple for theft
      if (action === "mengungsi") color = 0x607d8b; // Grey for refugee
      if (action === "memberontak") color = 0xf44336; // Red for rebel

      this.agents.push({
        id: `agent-${i}`,
        gridX: gx,
        gridY: gy,
        targetX: gx + (Math.random() * 2 - 1),
        targetY: gy + (Math.random() * 2 - 1),
        action,
        color,
        progress: Math.random(),
        speed: 0.005 + Math.random() * 0.008
      });
    }
  }

  public update(deltaSec: number): void {
    const deltaMs = deltaSec * 1000;
    this.graphics.clear();

    for (const agent of this.agents) {
      agent.progress += agent.speed * (deltaMs / 16);
      if (agent.progress >= 1) {
        agent.progress = 0;
        agent.gridX = agent.targetX;
        agent.gridY = agent.targetY;
        agent.targetX = Math.max(1, Math.min(14, agent.gridX + (Math.random() * 2 - 1)));
        agent.targetY = Math.max(1, Math.min(6, agent.gridY + (Math.random() * 2 - 1)));
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
    const { x, y } = pos;

    // Ground shadow
    g.ellipse(x, y + 1, 4, 2);
    g.fill({ color: 0x000000, alpha: 0.3 });

    // Clothing / Torso
    g.rect(x - 2.5, y - 9, 5, 8);
    g.fill({ color: agent.color });

    // Head / Nusantara skin tone
    g.circle(x, y - 11, 2.5);
    g.fill({ color: 0xffcc80 });

    // Caping bambu (conical straw hat)
    g.poly([x - 4, y - 12, x, y - 16, x + 4, y - 12]);
    g.fill({ color: 0xd7ccc8 });

    // Action balloon indicators
    if (agent.action === "memberontak") {
      // Burning torch icon
      g.circle(x + 4, y - 18, 2);
      g.fill({ color: 0xff1744 });
    } else if (agent.action === "mencuri") {
      // Purple exclamation icon
      g.rect(x + 3, y - 18, 1.5, 3);
      g.circle(x + 3.75, y - 13.5, 0.8);
      g.fill({ color: 0xe040fb });
    } else if (agent.action === "mengeluh") {
      // Orange thought bubble
      g.circle(x + 3.5, y - 16, 2);
      g.fill({ color: 0xff9100 });
    }
  }
}
