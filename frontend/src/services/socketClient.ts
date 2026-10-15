/**
 * Titah Rakyat: Sovereign of the Living Realm
 * WebSocket Client & Realtime Realm State Synchronizer (RFC 6455, SDD Bab 5.3 & 7.1)
 */

import { useGameStore, type WeatherState } from "../store/useGameStore";
import { audioEngine } from "./audioEngine";

export interface SendDecreePayload {
  sourceType: "PRESET_CARD" | "FREE_TEXT";
  cardId?: string;
  text?: string;
  costEmas: number;
  title: string;
}

export interface AllianceHandshakePayload {
  targetKingdomId?: string;
  pairingCode: string;
  latitude: number;
  longitude: number;
  accuracyRadiusM: number;
  isMock: boolean;
}

export interface LaunchExpeditionPayload {
  doctrine: "PILLAGE" | "CONQUER_FORCED" | "CONQUER_EMBRACED";
  pasukanDikirim: number;
}

class GameSocketClient {
  private socket: WebSocket | null = null;
  private reconnectTimeout: number | null = null;
  private isIntentionalClose: boolean = false;
  private mockTickTimer: number | null = null;
  private isConnected: boolean = false;

  public connect(url?: string): void {
    if (typeof window === "undefined") return;
    this.isIntentionalClose = false;

    // Use current host or default backend port 3001
    const wsUrl =
      url ||
      (window.location.protocol === "https:" ? "wss://" : "ws://") +
      (window.location.hostname || "localhost") +
      ":3001?token=mock_jwt_token_wanua_2026&worldId=default_realm&kingdomId=wanua_sendang_utama";

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.stopMockSimulation();
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          this.handleServerEvent(parsed);
        } catch {
          // Ignore malformed frames defensively
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        if (!this.isIntentionalClose) {
          // Reconnect attempt and start fallback autonomous world simulation
          this.scheduleReconnect();
          this.startMockSimulation();
        }
      };

      this.socket.onerror = () => {
        this.isConnected = false;
        // In local/offline preview, seamlessly spin up simulated realm loop
        this.startMockSimulation();
      };
    } catch {
      this.startMockSimulation();
    }
  }

  public disconnect(): void {
    this.isIntentionalClose = true;
    if (this.reconnectTimeout) {
      window.clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.stopMockSimulation();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public send(action: string, payload: Record<string, unknown>): boolean {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          action,
          payload: {
            kingdomId: useGameStore.getState().kingdom.id,
            worldId: "default_realm",
            ...payload
          }
        })
      );
      return true;
    }
    return false;
  }

  public submitDecree(payload: SendDecreePayload): void {
    const store = useGameStore.getState();
    const sent = this.send("SUBMIT_DECREE", {
      sourceType: payload.sourceType,
      cardId: payload.cardId,
      text: payload.text,
      season: store.worldSeason
    });

    // Client-side optimistic update & audio feedback
    audioEngine.playGongAgeng(0, 3.2);

    // Apply decree changes locally
    store.triggerDecreeAccepted({
      id: "decree_" + Date.now(),
      title: payload.title,
      sourceType: payload.sourceType,
      timestamp: Date.now(),
      costEmas: payload.costEmas,
      impacts: {
        keadilan: payload.sourceType === "PRESET_CARD" ? 0.3 : 0.4,
        kesejahteraan: 0.3,
        keamanan: 0.1,
        lingkungan: 0.2,
        pajakDelta: 0
      }
    });

    if (!sent) {
      // Mock server response
      store.deductBobCoins(2);
    }
  }

  public verifyAlliance(payload: AllianceHandshakePayload): void {
    this.send("VERIFY_ALLIANCE_HANDSHAKE", {
      ...payload,
      deviceEntropySignature: "entropy_device_" + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now()
    });

    // Audio chime feedback
    audioEngine.playBonangChime(2);
  }

  public launchExpedition(payload: LaunchExpeditionPayload): void {
    const store = useGameStore.getState();
    this.send("LAUNCH_EXPEDITION", {
      doctrine: payload.doctrine,
      pasukanDikirim: payload.pasukanDikirim
    });

    // Local resolution fallback if server is standalone
    audioEngine.playKendang("dhang");
    let panganDelta = 40;
    let emasDelta = 20;
    let harmoniDelta = 0;
    let korban = 1;

    if (payload.doctrine === "PILLAGE") {
      panganDelta = 60;
      emasDelta = 40;
      harmoniDelta = -10;
      korban = 2;
    } else if (payload.doctrine === "CONQUER_FORCED") {
      panganDelta = 40;
      emasDelta = 0;
      harmoniDelta = -5;
      korban = 1;
    } else if (payload.doctrine === "CONQUER_EMBRACED") {
      panganDelta = 20;
      emasDelta = -30;
      harmoniDelta = +10;
      korban = 0;
    }

    store.updateKingdom({
      pangan: Math.max(0, store.kingdom.pangan + panganDelta),
      emas: Math.max(0, store.kingdom.emas + emasDelta),
      pasukan: Math.max(0, store.kingdom.pasukan - korban),
      harmoni: Math.max(0, Math.min(100, store.kingdom.harmoni + harmoniDelta))
    });
  }

  private handleServerEvent(data: Record<string, unknown>): void {
    const event = String(data.event || data.action || "");
    const payload = (data.payload || data.data || data) as Record<string, unknown>;
    const store = useGameStore.getState();

    switch (event) {
      case "REALM_STATE_UPDATE":
        store.updateFromSnapshot(payload);
        break;

      case "DECREE_ACCEPTED":
        audioEngine.playGongAgeng(2, 2.5);
        if (payload.semanticVector) {
          const vector = payload.semanticVector as Record<string, number>;
          store.triggerDecreeAccepted({
            id: "decree_srv_" + Date.now(),
            title: String(payload.sourceType || "Titah Resmi Keraton"),
            sourceType: (payload.sourceType as "PRESET_CARD" | "FREE_TEXT") || "FREE_TEXT",
            timestamp: Date.now(),
            costEmas: vector.biayaEmas ?? 0,
            impacts: {
              keadilan: vector.keadilan ?? 0,
              kesejahteraan: vector.kesejahteraan ?? 0,
              keamanan: vector.keamanan ?? 0,
              lingkungan: vector.lingkungan ?? 0,
              pajakDelta: vector.pajakDelta ?? 0
            }
          });
        }
        break;

      case "ALLIANCE_VERIFIED_SUCCESS":
        audioEngine.playGongAgeng(4, 4.0);
        store.updateFromSnapshot({
          allianceVerified: true,
          verifiedDistanceMeters: payload.calculatedDistanceM,
          partnerKingdomId: payload.kingdomB
        });
        break;

      case "ALLIANCE_VERIFIED_FAILED":
        audioEngine.playKendang("tak");
        break;

      case "CALAMITY_TRIGGERED":
        audioEngine.playCalamityRumble();
        store.updateFromSnapshot({
          weather: (payload.calamityLevel === 2 ? "BANJIR_BANDANG" : "PACEKLIK") as WeatherState
        });
        break;

      case "BOSS_CALAMITY_SPAWN":
        audioEngine.playCalamityRumble();
        store.updateFromSnapshot({
          season: 20,
          bossHp: 500
        });
        break;

      case "KINGDOM_FALLEN":
        audioEngine.playKendang("tak");
        store.triggerCoup((payload.cause as "COUP_DETAT" | "STARVATION" | "BANDIT_DESTRUCTION") || "COUP_DETAT");
        break;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) return;
    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, 4000);
  }

  /**
   * Autonomous offline fallback simulator (Universal 45-second season tick)
   * Ensures UI & canvas animation are lively even when running without backend.
   */
  private startMockSimulation(): void {
    if (this.mockTickTimer) return;
    this.mockTickTimer = window.setInterval(() => {
      if (this.isConnected) return;
      const store = useGameStore.getState();
      if (store.kingdom.isFallen) return;

      const nextSec = store.secondsRemaining <= 1 ? 45 : store.secondsRemaining - 1;
      let nextSeason = store.worldSeason;
      let nextPhase = store.activePhase;

      if (nextSec >= 40) {
        nextPhase = "PHASE_1_DECREE";
      } else if (nextSec >= 25) {
        nextPhase = "PHASE_2_RESOLUTION";
      } else if (nextSec >= 15) {
        nextPhase = "PHASE_3_ECONOMY";
      } else if (nextSec >= 5) {
        nextPhase = "PHASE_4_EVENT";
      } else {
        nextPhase = "PHASE_5_SEASON_END";
      }

      // On full season wrap
      if (store.secondsRemaining === 1) {
        nextSeason = Math.min(20, store.worldSeason + 1);
        audioEngine.playGongAgeng(1, 3.0);

        // Economic macro tick
        const panen = Math.round(25 * 2.5);
        const konsumsi = 35;
        const newPangan = Math.max(0, store.kingdom.pangan + panen - konsumsi);
        const pajakEmas = Math.round(store.kingdom.pajak * 1.5);
        const newEmas = store.kingdom.emas + pajakEmas - 15;

        // Tri-defeat checks
        if (newPangan <= 0 && store.kingdom.starvationStreak >= 1) {
          store.triggerCoup("STARVATION");
          return;
        }

        store.updateKingdom({
          pangan: newPangan,
          emas: Math.max(0, newEmas),
          starvationStreak: newPangan <= 0 ? store.kingdom.starvationStreak + 1 : 0
        });
      }

      store.updateFromSnapshot({
        season: nextSeason,
        activePhase: nextPhase,
        secondsRemaining: nextSec
      });
    }, 1000);
  }

  private stopMockSimulation(): void {
    if (this.mockTickTimer) {
      window.clearInterval(this.mockTickTimer);
      this.mockTickTimer = null;
    }
  }
}

export const socketClient = new GameSocketClient();
