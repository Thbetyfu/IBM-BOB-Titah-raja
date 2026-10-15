/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Autonomous Citizen Sprites, Roaming Village Chickens, & Interactive Comic Dialogues (SDD Bab 5.2)
 *
 * Implements:
 * 1. 6 autonomous citizen roles with authentic accessories (cangkul, pikulan, obor).
 * 2. Interactive citizen clicks: cute pop sound, surprised jump, and funny speech bubbles!
 * 3. Roaming village chickens (ayam jago kampung) pecking and scratching the grass.
 */

import { Container, Graphics, FederatedPointerEvent } from "pixi.js";
import { gridToIso, IsoPoint } from "./IsometricMap";
import { ActionType } from "../types/game";
import { audioEngine } from "../services/audioEngine";

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
  jumpY: number;
}

interface SpeechBubble {
  agentId: string;
  gridX: number;
  gridY: number;
  text: string;
  life: number;
  maxLife: number;
}

interface VillageChicken {
  gridX: number;
  gridY: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
  peckTimer: number;
  isWhite: boolean;
}

export class AgentSprites {
  public container: Container;
  private agents: AgentRenderData[] = [];
  private chickens: VillageChicken[] = [];
  private bubbles: SpeechBubble[] = [];
  private graphics: Graphics;
  private animTimer: number = 0;

  private quotesByAction: Record<ActionType, string[]> = {
    bekerja: [
      "Sawah subur tenan, Gusti!",
      "Siap panen gabah melimpah!",
      "Cangkul tajam, perut kenyang.",
      "Tandur pari di wanua sendang."
    ],
    berdagang: [
      "Beras murah, legit manis!",
      "Pasar rame, rezeki nomplok!",
      "Pikulan berat, dompet padat!",
      "Ayo dibeli hasil bumi wanua!"
    ],
    mengeluh: [
      "Pajak naik lagi, Gusti?",
      "Lumbung menipis, aduh pusing...",
      "Istri di rumah cemberut terus.",
      "Kapan harga gabah stabil ya?"
    ],
    mencuri: [
      "Sssttt... cuma pinjam sekarung!",
      "Jangan lapor pak lurah Ki Wiro...",
      "Gelap-gelap ambil beras sedap.",
      "Awas jangan sampai ketahuan pos ronda!"
    ],
    mengungsi: [
      "Naga kali bikin merinding...",
      "Pindah ke lereng bukit dulu ah.",
      "Buntelan kain siap dibawa kabur.",
      "Moga-moga banjir cepat surut."
    ],
    memberontak: [
      "Turunkan upeti atau kami demo!",
      "Obor bambu siap membara!",
      "Dengar titah rakyat jelata!",
      "Keadilan bagi kaum tani!"
    ]
  };

  constructor() {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);

    this.spawnAgents(34);
    this.spawnChickens(6);
    this.setupInteractivity();
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
      const gy = Math.floor(Math.random() * 6) + 1;

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
        speed: 0.004 + Math.random() * 0.006,
        jumpY: 0
      });
    }
  }

  public spawnChickens(count: number = 5): void {
    this.chickens = [];
    for (let i = 0; i < count; i++) {
      const gx = 4 + Math.random() * 8;
      const gy = 3 + Math.random() * 4;
      this.chickens.push({
        gridX: gx,
        gridY: gy,
        targetX: gx + (Math.random() * 1.5 - 0.75),
        targetY: gy + (Math.random() * 1.5 - 0.75),
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.004,
        peckTimer: Math.random() * 3,
        isWhite: i % 2 === 0
      });
    }
  }

  /**
   * Click interaction: clicking near an agent makes them jump and speak!
   */
  private setupInteractivity(): void {
    this.container.eventMode = "static";
    this.container.cursor = "pointer";

    this.container.on("pointerdown", (e: FederatedPointerEvent) => {
      const localPt = this.container.toLocal(e.global);

      // Find nearest agent within 32 pixels
      let nearestAgent: AgentRenderData | null = null;
      let minDistSq = 32 * 32;

      for (const agent of this.agents) {
        const curGx = agent.gridX + (agent.targetX - agent.gridX) * agent.progress;
        const curGy = agent.gridY + (agent.targetY - agent.gridY) * agent.progress;
        const pos = gridToIso(curGx, curGy);

        const dx = pos.x - localPt.x;
        const dy = (pos.y + agent.jumpY) - localPt.y;
        const dSq = dx * dx + dy * dy;

        if (dSq < minDistSq) {
          minDistSq = dSq;
          nearestAgent = agent;
        }
      }

      if (nearestAgent) {
        e.stopPropagation();
        this.triggerAgentClick(nearestAgent);
      }
    });
  }

  private triggerAgentClick(agent: AgentRenderData): void {
    audioEngine.playCutePop();
    agent.jumpY = -24; // Surprised leap

    // Pick a funny quote
    const quoteList = this.quotesByAction[agent.action];
    const quote = quoteList[Math.floor(Math.random() * quoteList.length)];

    // Remove existing bubble for this agent
    this.bubbles = this.bubbles.filter((b) => b.agentId !== agent.id);

    const curGx = agent.gridX + (agent.targetX - agent.gridX) * agent.progress;
    const curGy = agent.gridY + (agent.targetY - agent.gridY) * agent.progress;

    this.bubbles.push({
      agentId: agent.id,
      gridX: curGx,
      gridY: curGy,
      text: quote,
      life: 0,
      maxLife: 2.2
    });
  }

  public update(deltaSec: number): void {
    this.animTimer += deltaSec;
    const deltaMs = deltaSec * 1000;
    this.graphics.clear();

    // 1. Update & Draw Village Chickens
    this.updateChickens(deltaSec, deltaMs);

    // 2. Update & Draw Citizens
    for (const agent of this.agents) {
      // Spring jumpY back to 0
      agent.jumpY += (0 - agent.jumpY) * Math.min(1, deltaSec * 12);

      agent.progress += agent.speed * (deltaMs / 16);
      if (agent.progress >= 1) {
        agent.progress = 0;
        agent.gridX = agent.targetX;
        agent.gridY = agent.targetY;
        agent.targetX = Math.max(1, Math.min(14, agent.gridX + (Math.random() * 2.2 - 1.1)));
        agent.targetY = Math.max(1, Math.min(6, agent.gridY + (Math.random() * 2.2 - 1.1)));
      }

      const curGx = agent.gridX + (agent.targetX - agent.gridX) * agent.progress;
      const curGy = agent.gridY + (agent.targetY - agent.gridY) * agent.progress;
      const pos = gridToIso(curGx, curGy);
      pos.y += agent.jumpY;

      this.drawAgentFigure(pos, agent);
    }

    // 3. Update & Draw Comic Speech Bubbles
    this.drawSpeechBubbles(deltaSec);
  }

  private updateChickens(deltaSec: number, deltaMs: number): void {
    const g = this.graphics;

    for (const ch of this.chickens) {
      ch.peckTimer -= deltaSec;
      const isPecking = ch.peckTimer <= 0 && ch.peckTimer > -0.8;
      if (ch.peckTimer <= -1.2) {
        ch.peckTimer = 2.0 + Math.random() * 3.0;
      }

      if (!isPecking) {
        ch.progress += ch.speed * (deltaMs / 16);
        if (ch.progress >= 1) {
          ch.progress = 0;
          ch.gridX = ch.targetX;
          ch.gridY = ch.targetY;
          ch.targetX = Math.max(2, Math.min(13, ch.gridX + (Math.random() * 1.6 - 0.8)));
          ch.targetY = Math.max(2, Math.min(6, ch.gridY + (Math.random() * 1.6 - 0.8)));
        }
      }

      const curX = ch.gridX + (ch.targetX - ch.gridX) * ch.progress;
      const curY = ch.gridY + (ch.targetY - ch.gridY) * ch.progress;
      const pos = gridToIso(curX, curY);

      const bob = isPecking ? Math.sin(this.animTimer * 16) * 1.5 : Math.sin(ch.progress * Math.PI * 10) * 0.8;
      const cx = pos.x;
      const cy = pos.y - bob;

      // Shadow
      g.ellipse(cx, pos.y + 1, 2.5, 1.2);
      g.fill({ color: 0x000000, alpha: 0.25 });

      // Body (white or caramel brown)
      const bodyColor = ch.isWhite ? 0xffffff : 0xd4a373;
      g.ellipse(cx, cy - 2, 2.4, 2.0);
      g.fill({ color: bodyColor });

      // Red Comb & Yellow Beak
      g.circle(cx + 1.2, cy - 3.8, 0.9);
      g.fill({ color: 0xe63946 }); // Red comb
      g.circle(cx + 2.2, cy - 2.2, 0.7);
      g.fill({ color: 0xffb703 }); // Yellow beak
    }
  }

  private drawSpeechBubbles(deltaSec: number): void {
    const g = this.graphics;

    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.life += deltaSec;
      const alpha = Math.max(0, 1 - Math.pow(b.life / b.maxLife, 1.5));

      const pos = gridToIso(b.gridX, b.gridY);
      const bx = pos.x;
      const by = pos.y - 28 - (b.life * 6); // Gently rises

      const textWidth = Math.min(160, b.text.length * 6.2 + 16);
      const bubbleH = 22;

      // Bubble Background
      g.roundRect(bx - textWidth / 2, by - bubbleH, textWidth, bubbleH, 6);
      g.fill({ color: 0xffffff, alpha: alpha * 0.96 });
      g.stroke({ color: 0x1a2e26, width: 1.5, alpha: alpha });

      // Little pointer tail
      g.poly([
        bx - 3, by,
        bx + 3, by,
        bx, by + 4
      ]);
      g.fill({ color: 0xffffff, alpha: alpha * 0.96 });
      g.stroke({ color: 0x1a2e26, width: 1.2, alpha: alpha });

      if (b.life >= b.maxLife) {
        this.bubbles.splice(i, 1);
      }
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
      g.moveTo(x + 2.5, y - 8);
      g.lineTo(x + 7, y - 14);
      g.stroke({ color: 0x8d6e63, width: 1.2 });
      g.rect(x + 6, y - 15.5, 3, 2);
      g.fill({ color: 0x9e9e9e });
    } else if (agent.action === "berdagang") {
      const basketSwing = Math.sin(agent.progress * Math.PI * 8) * 1.5;
      g.moveTo(x - 8, y - 10 + basketSwing);
      g.lineTo(x + 8, y - 10 - basketSwing);
      g.stroke({ color: 0xca8a04, width: 1.2 });
      g.poly([
        x - 9, y - 6 + basketSwing,
        x - 6, y - 6 + basketSwing,
        x - 7, y - 3 + basketSwing,
        x - 8, y - 3 + basketSwing
      ]);
      g.fill({ color: 0xa16207 });
      g.poly([
        x + 6, y - 6 - basketSwing,
        x + 9, y - 6 - basketSwing,
        x + 8, y - 3 - basketSwing,
        x + 7, y - 3 - basketSwing
      ]);
      g.fill({ color: 0xa16207 });
    } else if (agent.action === "mengeluh") {
      const pulse = Math.sin(this.animTimer * 5) * 1;
      g.circle(x + 4.5, y - 17 + pulse, 2.2);
      g.fill({ color: 0xfb8c00 });
      g.circle(x + 2.8, y - 14, 1);
      g.fill({ color: 0xfb8c00 });
    } else if (agent.action === "mencuri") {
      g.ellipse(x - 3.5, y - 9, 3.2, 4);
      g.fill({ color: 0xd4a373 });
      g.stroke({ color: 0x795548, width: 0.8 });
      g.circle(x, y - 21, 1.2);
      g.fill({ color: 0xba68c8 });
    } else if (agent.action === "mengungsi") {
      g.circle(x - 3.5, y - 13, 2.4);
      g.fill({ color: 0x90a4ae });
    } else if (agent.action === "memberontak") {
      const flicker = Math.sin(this.animTimer * 12) * 1.5;
      g.moveTo(x + 3, y - 7);
      g.lineTo(x + 6, y - 16);
      g.stroke({ color: 0x5d4037, width: 1.5 });
      g.poly([
        x + 4, y - 16,
        x + 6 + flicker, y - 22,
        x + 8, y - 16
      ]);
      g.fill({ color: 0xff3d00 });
      g.circle(x + 6, y - 17, 1.5);
      g.fill({ color: 0xffea00 });
    }
  }
}
