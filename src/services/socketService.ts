/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Realtime WebSocket Gateway Server & Connection Manager (RFC 6455, SDD Bab 7.1 C, SRS Bab 6.4)
 *
 * Implements:
 * 1. RFC 6455 WebSocket Gateway with JWT Handshake Authentication.
 * 2. 8 Core Realtime Event Frames (Client <-> Server).
 * 3. Seasonal Realm Delta-State Broadcaster.
 * 4. Zero-leak connection lifecycle with Ping/Pong heartbeat.
 */

import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "node:http";
import { URL } from "node:url";
import { JwtService, type JwtPayload } from "../auth/jwt.js";
import { AIDecreeGateway, type DecreeSemanticVector } from "../ai/aiAdapter.js";
import {
  EphemeralPairingManager,
  type EphemeralGeoPayload
} from "./allianceService.js";
import { CombatWarService } from "./battleService.js";
import {
  FrontierExpeditionEngine,
  ExpeditionDoctrine
} from "./expeditionService.js";

export type WebSocketClientAction =
  | "SUBMIT_DECREE"
  | "UPDATE_TAX_RATE"
  | "VERIFY_ALLIANCE_HANDSHAKE"
  | "LAUNCH_ATTACK"
  | "LAUNCH_EXPEDITION";

export type WebSocketServerEvent =
  | "REALM_STATE_UPDATE"
  | "DECREE_ACCEPTED"
  | "ALLIANCE_VERIFIED_SUCCESS"
  | "ALLIANCE_VERIFIED_FAILED"
  | "BATTLE_RESULT"
  | "CALAMITY_TRIGGERED"
  | "BOSS_CALAMITY_SPAWN"
  | "KINGDOM_FALLEN"
  | "ERROR";

export interface WebSocketMessage<T = unknown> {
  action?: WebSocketClientAction;
  event?: WebSocketServerEvent;
  payload?: T;
  data?: T;
}

export interface AuthenticatedSocket extends WebSocket {
  isAlive: boolean;
  player: JwtPayload;
  worldId: string;
  kingdomId?: string;
}

export interface RealmStateDelta {
  worldId: string;
  season: number;
  phase: string;
  phaseElapsedMs: number;
  weather?: string;
  bossHp?: number;
  kingdoms?: Array<{
    id: string;
    pangan: number;
    emas: number;
    pasukan: number;
    pajak: number;
    kepuasan: number;
    harmoni: number;
    isFallen: boolean;
  }>;
}

export class GameSocketServer {
  private wss: WebSocketServer | null = null;
  private readonly jwtSecret: string;
  private readonly decreeGateway: AIDecreeGateway;
  private readonly pairingManager: EphemeralPairingManager;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  // Connection registry by world and kingdom
  private readonly realmConnections = new Map<string, Set<AuthenticatedSocket>>();
  private readonly kingdomConnections = new Map<string, AuthenticatedSocket>();

  constructor(
    jwtSecret: string = process.env.JWT_SECRET || "titah_rakyat_development_secret_key_2026",
    decreeGateway?: AIDecreeGateway
  ) {
    this.jwtSecret = jwtSecret;
    this.decreeGateway = decreeGateway ?? new AIDecreeGateway();
    this.pairingManager = new EphemeralPairingManager(10_000);
  }

  /**
   * Initializes the WebSocket Server attached to an existing or new WSS instance.
   */
  public attach(wss: WebSocketServer): void {
    this.wss = wss;

    this.wss.on("connection", (socket: WebSocket, req: IncomingMessage) => {
      this.handleConnection(socket, req);
    });

    // Start 30-second ping/pong heartbeat
    this.heartbeatInterval = setInterval(() => {
      if (!this.wss) return;
      for (const client of this.wss.clients) {
        const authSocket = client as AuthenticatedSocket;
        if (!authSocket.isAlive) {
          authSocket.terminate();
          continue;
        }
        authSocket.isAlive = false;
        authSocket.ping();
      }
    }, 30_000);
  }

  /**
   * Authenticate handshake and register connection.
   */
  public handleConnection(rawSocket: WebSocket, req: IncomingMessage): void {
    try {
      const parsedUrl = new URL(req.url || "/", "http://localhost");
      const token =
        parsedUrl.searchParams.get("token") ||
        (req.headers?.["authorization"]?.replace(/^Bearer\s+/i, "") ?? "");

      if (!token) {
        rawSocket.close(4001, "AUTHENTICATION_REQUIRED: Missing JWT token");
        return;
      }

      // Verify JWT token
      const payload = JwtService.verify(token, this.jwtSecret);

      // Extract realm/world ID from URL path or query
      const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
      const worldIdFromPath = pathParts[pathParts.indexOf("realm") + 1];
      const worldId =
        worldIdFromPath ||
        parsedUrl.searchParams.get("worldId") ||
        payload.worldId ||
        "default_realm";

      const authSocket = rawSocket as AuthenticatedSocket;
      authSocket.isAlive = true;
      authSocket.player = payload;
      authSocket.worldId = worldId;
      authSocket.kingdomId =
        parsedUrl.searchParams.get("kingdomId") || payload.kingdomId;

      authSocket.on("pong", () => {
        authSocket.isAlive = true;
      });

      this.registerSocket(authSocket);

      authSocket.on("message", (data: Buffer | string) => {
        this.handleSocketMessage(authSocket, data.toString());
      });

      authSocket.on("close", () => {
        this.unregisterSocket(authSocket);
      });

      authSocket.on("error", () => {
        this.unregisterSocket(authSocket);
      });
    } catch {
      rawSocket.close(4003, "AUTHENTICATION_FAILED: Invalid or expired token");
    }
  }

  private registerSocket(socket: AuthenticatedSocket): void {
    if (!this.realmConnections.has(socket.worldId)) {
      this.realmConnections.set(socket.worldId, new Set());
    }
    this.realmConnections.get(socket.worldId)!.add(socket);

    if (socket.kingdomId) {
      this.kingdomConnections.set(socket.kingdomId, socket);
    }
  }

  private unregisterSocket(socket: AuthenticatedSocket): void {
    const realmSet = this.realmConnections.get(socket.worldId);
    if (realmSet) {
      realmSet.delete(socket);
      if (realmSet.size === 0) {
        this.realmConnections.delete(socket.worldId);
      }
    }

    if (socket.kingdomId && this.kingdomConnections.get(socket.kingdomId) === socket) {
      this.kingdomConnections.delete(socket.kingdomId);
    }
  }

  /**
   * Router for all client actions.
   */
  public async handleSocketMessage(
    socket: AuthenticatedSocket,
    rawMessage: string
  ): Promise<void> {
    try {
      const parsed = JSON.parse(rawMessage) as WebSocketMessage;
      const action = parsed.action;
      const payload = (parsed.payload || {}) as Record<string, unknown>;

      switch (action) {
        case "SUBMIT_DECREE":
          await this.handleSubmitDecree(socket, payload);
          break;

        case "UPDATE_TAX_RATE":
          this.handleUpdateTaxRate(socket, payload);
          break;

        case "VERIFY_ALLIANCE_HANDSHAKE":
          this.handleVerifyAllianceHandshake(socket, payload);
          break;

        case "LAUNCH_ATTACK":
          this.handleLaunchAttack(socket, payload);
          break;

        case "LAUNCH_EXPEDITION":
          this.handleLaunchExpedition(socket, payload);
          break;

        default:
          this.sendEvent(socket, "ERROR", {
            message: `UNKNOWN_ACTION: ${action}`
          });
          break;
      }
    } catch (err) {
      this.sendEvent(socket, "ERROR", {
        message: err instanceof Error ? err.message : "INVALID_MESSAGE_FORMAT"
      });
    }
  }

  private async handleSubmitDecree(
    socket: AuthenticatedSocket,
    payload: Record<string, unknown>
  ): Promise<void> {
    const sourceType = String(payload.sourceType || "FREE_TEXT");
    let result: DecreeSemanticVector;

    if (sourceType === "PRESET_CARD") {
      const cardId = String(payload.cardId || payload.text || "");
      result = this.decreeGateway.resolvePresetCard(cardId);
    } else {
      const text = String(payload.text || "");
      result = await this.decreeGateway.processDecree(text);
    }

    this.sendEvent(socket, "DECREE_ACCEPTED", {
      kingdomId: payload.kingdomId || socket.kingdomId,
      season: Number(payload.season) || 1,
      sourceType,
      semanticVector: result
    });
  }

  private handleUpdateTaxRate(
    socket: AuthenticatedSocket,
    payload: Record<string, unknown>
  ): void {
    const kingdomId = String(payload.kingdomId || socket.kingdomId || "");
    const newTaxRate = Math.max(0, Math.min(100, Number(payload.newTaxRate) || 15));

    this.broadcastToRealm(socket.worldId, "REALM_STATE_UPDATE", {
      type: "TAX_UPDATED",
      kingdomId,
      newTaxRate
    });
  }

  private handleVerifyAllianceHandshake(
    socket: AuthenticatedSocket,
    payload: Record<string, unknown>
  ): void {
    const geoPayload: EphemeralGeoPayload = {
      kingdomId: String(payload.kingdomId || socket.kingdomId || ""),
      latitude: Number(payload.ephemeralLat ?? payload.latitude ?? 0),
      longitude: Number(payload.ephemeralLon ?? payload.longitude ?? 0),
      accuracyMeters: Number(payload.accuracyRadiusM ?? payload.accuracyMeters ?? 10),
      isMock: Boolean(payload.isMock ?? false),
      deviceEntropyHash: String(
        payload.deviceEntropySignature ?? payload.deviceEntropyHash ?? ""
      ),
      timestamp: Number(payload.timestamp ?? Date.now()),
      allianceId: payload.allianceId ? String(payload.allianceId) : undefined,
      targetKingdomId: payload.targetKingdomId
        ? String(payload.targetKingdomId)
        : undefined,
      pairingCode: payload.pairingCode ? String(payload.pairingCode) : undefined
    };

    const handshake = this.pairingManager.submitHandshake(geoPayload);

    if (handshake.matched && handshake.result) {
      if (handshake.result.verified) {
        const successData = {
          allianceId: geoPayload.allianceId,
          calculatedDistanceM: handshake.result.distanceMeters,
          status: "ONSITE_VERIFIED",
          militaryStrikeAuthorized: true,
          kingdomA: geoPayload.kingdomId,
          kingdomB: handshake.partnerKingdomId
        };

        this.sendEvent(socket, "ALLIANCE_VERIFIED_SUCCESS", successData);
        if (handshake.partnerKingdomId) {
          this.sendToKingdom(
            handshake.partnerKingdomId,
            "ALLIANCE_VERIFIED_SUCCESS",
            successData
          );
        }
      } else {
        const failedData = {
          status: "VERIFICATION_FAILED",
          rejectionReason: handshake.result.rejectionReason,
          calculatedDistanceM: handshake.result.distanceMeters
        };
        this.sendEvent(socket, "ALLIANCE_VERIFIED_FAILED", failedData);
        if (handshake.partnerKingdomId) {
          this.sendToKingdom(
            handshake.partnerKingdomId,
            "ALLIANCE_VERIFIED_FAILED",
            failedData
          );
        }
      }
    }
  }

  private handleLaunchAttack(
    socket: AuthenticatedSocket,
    payload: Record<string, unknown>
  ): void {
    const attackerKingdomId = String(
      payload.attackerKingdomId || socket.kingdomId || ""
    );
    const defenderKingdomId = String(payload.defenderKingdomId || "");
    const attackerTroops = Number(payload.attackerTroops || 0);
    const defenderTroops = Number(payload.defenderTroops || 20);
    const posRondaLv = Number(payload.posRondaLv || 1);
    const alliedHelpTroops = Number(payload.alliedHelpTroops || 0);
    const isAttackerOnsiteVerified = Boolean(
      payload.isAttackerOnsiteVerified ?? true
    );
    const areSameAlliance = Boolean(payload.areSameAlliance ?? false);
    const panganDef = Number(payload.panganDef || 100);
    const emasDef = Number(payload.emasDef || 100);

    const result = CombatWarService.resolve({
      attackerKingdomId,
      defenderKingdomId,
      attackerTroops,
      defenderTroops,
      posRondaLv,
      alliedHelpTroops,
      isAttackerOnsiteVerified,
      areSameAlliance,
      panganDef,
      emasDef
    });

    const battlePayload = {
      attackerKingdomId,
      defenderKingdomId,
      season: Number(payload.season) || 1,
      ...result
    };

    // Emit to attacker, defender, and realm
    this.sendEvent(socket, "BATTLE_RESULT", battlePayload);
    this.sendToKingdom(defenderKingdomId, "BATTLE_RESULT", battlePayload);
    this.broadcastToRealm(socket.worldId, "BATTLE_RESULT", battlePayload);
  }

  private handleLaunchExpedition(
    socket: AuthenticatedSocket,
    payload: Record<string, unknown>
  ): void {
    const doctrine = String(payload.doctrine) as ExpeditionDoctrine;
    const troopsSent = Number(payload.troopsSent || payload.pasukanDikirim || 10);
    const goldAvailable = Number(payload.goldAvailable || payload.emas || 100);

    const result = FrontierExpeditionEngine.resolve(
      doctrine,
      troopsSent,
      goldAvailable
    );

    this.sendEvent(socket, "REALM_STATE_UPDATE", {
      type: "EXPEDITION_RESOLVED",
      kingdomId: socket.kingdomId,
      result
    });
  }

  /**
   * Broadcast message to all connected clients in a specific realm/world.
   */
  public broadcastToRealm(
    worldId: string,
    event: WebSocketServerEvent,
    data: unknown
  ): void {
    const realmSet = this.realmConnections.get(worldId);
    if (!realmSet) return;

    const message = JSON.stringify({ event, data });
    for (const client of realmSet) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  /**
   * Send message to a specific kingdom client.
   */
  public sendToKingdom(
    kingdomId: string,
    event: WebSocketServerEvent,
    data: unknown
  ): void {
    const client = this.kingdomConnections.get(kingdomId);
    if (client && client.readyState === WebSocket.OPEN) {
      this.sendEvent(client, event, data);
    }
  }

  /**
   * Send event to an individual socket client.
   */
  public sendEvent(
    socket: AuthenticatedSocket,
    event: WebSocketServerEvent,
    data: unknown
  ): void {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ event, data }));
    }
  }

  /**
   * Broadcast seasonal delta-state to realm clients.
   */
  public broadcastDeltaState(delta: RealmStateDelta): void {
    this.broadcastToRealm(delta.worldId, "REALM_STATE_UPDATE", delta);
  }

  /**
   * Clean shutdown of WebSocket server and heartbeat intervals.
   */
  public close(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.realmConnections.clear();
    this.kingdomConnections.clear();
    this.pairingManager.clear();

    return new Promise((resolve) => {
      if (this.wss) {
        this.wss.close(() => {
          this.wss = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  public getConnectedClientsCount(): number {
    return this.wss ? this.wss.clients.size : 0;
  }
}
