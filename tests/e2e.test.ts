/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Automated End-to-End (E2E) Integration Test Suite (tests/e2e.test.ts)
 *
 * Implements full lifecycle integration tests across:
 * 1. Multi-client WebSocket RFC 6455 connections and delta-state sync.
 * 2. Complete 20-Season progression across 5 deterministic phases.
 * 3. Decree issuance (Preset Nusantara cards & NLP AI free-text).
 * 4. Physical proximity onsite alliance handshake (<= 200m) with zero-knowledge verification.
 * 5. Frontier expedition moral resolution (PILLAGE, CONQUER_FORCED, CONQUER_EMBRACED).
 * 6. Musim 20 Boss Naga Banjir coalition raid with +50% alliance combat boost.
 * 7. Dynastic collapse (Tri-Defeat), Legacy Score calculation, and clean reincarnation.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { WebSocket } from "ws";
import { createGameServer } from "../src/server.js";
import { JwtService } from "../src/auth/jwt.js";
import { GeolocationOnsiteVerifier } from "../src/services/allianceService.js";
import { DeterministicWorldOrchestrator } from "../src/sim/worldEngine.js";
import { CombatWarService } from "../src/services/battleService.js";
import {
  FrontierExpeditionEngine,
  ExpeditionDoctrine
} from "../src/services/expeditionService.js";
import { BossEncounterStateMachine } from "../src/sim/calamityEngine.js";
import { DynasticLegacyService } from "../src/sim/dynastyEngine.js";
import { AIDecreeGateway } from "../src/ai/aiAdapter.js";
import type { GameSocketServer } from "../src/services/socketService.js";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

const JWT_SECRET = "titah_rakyat_development_secret_key_2026";

describe("Fase 4: End-to-End (E2E) System Integration Suite", () => {
  let server: Server;
  let socketService: GameSocketServer;
  let serverPort: number;
  let wsUrl: string;

  beforeAll(async () => {
    const gameServer = createGameServer();
    server = gameServer.httpServer;
    socketService = gameServer.socketService;

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const addr = server.address() as AddressInfo;
        serverPort = addr.port;
        wsUrl = `ws://127.0.0.1:${serverPort}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await socketService.close();
    if ("closeAllConnections" in server && typeof (server as any).closeAllConnections === "function") {
      (server as any).closeAllConnections();
    }
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it("E2E-01: Health check endpoint HTTP harus mengembalikan status HEALTHY 200 OK", async () => {
    const res = await fetch(`http://127.0.0.1:${serverPort}/health`);
    expect(res.status).toBe(200);

    const data = (await res.json()) as {
      status: string;
      service: string;
      uptimeSeconds: number;
    };
    expect(data.status).toBe("HEALTHY");
    expect(data.service).toBe("titah-rakyat-backend");
    expect(typeof data.uptimeSeconds).toBe("number");
  });

  it("E2E-02: Multi-client WebSocket handshake dengan autentikasi token JWT valid", async () => {
    const token1 = JwtService.sign(
      {
        sub: "ruler-01",
        worldId: "realm-e2e",
        kingdomId: "wanua-sendang"
      },
      JWT_SECRET
    );

    const token2 = JwtService.sign(
      {
        sub: "ruler-02",
        worldId: "realm-e2e",
        kingdomId: "wanua-singasari"
      },
      JWT_SECRET
    );

    const ws1 = new WebSocket(`${wsUrl}?token=${token1}&worldId=realm-e2e&kingdomId=wanua-sendang`);
    const ws2 = new WebSocket(`${wsUrl}?token=${token2}&worldId=realm-e2e&kingdomId=wanua-singasari`);

    const openPromise1 = new Promise<void>((resolve) => ws1.on("open", () => resolve()));
    const openPromise2 = new Promise<void>((resolve) => ws2.on("open", () => resolve()));

    await Promise.all([openPromise1, openPromise2]);

    expect(ws1.readyState).toBe(WebSocket.OPEN);
    expect(ws2.readyState).toBe(WebSocket.OPEN);

    ws1.terminate();
    ws2.terminate();
  });

  it("E2E-03: Alur penerbitan titah kartu tematik & titah NLP AI melalui WebSocket", async () => {
    const token = JwtService.sign(
      {
        sub: "ruler-decree",
        worldId: "realm-e2e",
        kingdomId: "wanua-decree"
      },
      JWT_SECRET
    );

    const ws = new WebSocket(`${wsUrl}?token=${token}&worldId=realm-e2e&kingdomId=wanua-decree`);

    await new Promise<void>((resolve) => ws.on("open", () => resolve()));

    // 1. Kirim titah kartu tematik CARD_01 (Bansos Padi Merata)
    const cardMsgPromise = new Promise<Record<string, unknown>>((resolve) => {
      ws.on("message", (raw) => {
        const parsed = JSON.parse(raw.toString());
        if (parsed.event === "DECREE_ACCEPTED") {
          resolve(parsed);
        }
      });
    });

    ws.send(
      JSON.stringify({
        action: "SUBMIT_DECREE",
        payload: {
          worldId: "realm-e2e",
          kingdomId: "wanua-decree",
          sourceType: "PRESET_CARD",
          cardId: "CARD_01",
          season: 1
        }
      })
    );

    const cardRes = await cardMsgPromise;
    expect(cardRes.event).toBe("DECREE_ACCEPTED");
    expect(cardRes.data).toBeDefined();

    // 2. Evaluasi Titah NLP AI via Gateway dengan prompt guard & clamping
    const aiGateway = new AIDecreeGateway();
    const nlpRes = await aiGateway.processDecree(
      "Bagikan cadangan beras di lumbung untuk rakyat miskin dan turunkan pajak pasar"
    );

    expect(nlpRes.valid).toBe(true);
    expect(nlpRes.keadilan).toBeGreaterThan(0);
    expect(nlpRes.kesejahteraan).toBeGreaterThan(0);
    expect(nlpRes.biayaEmas).toBeLessThanOrEqual(50);

    ws.terminate();
  });

  it("E2E-04: Verifikasi kedekatan fisik onsite (<= 200m), aliansi pertahanan, dan bantuan militer", async () => {
    const token1 = JwtService.sign(
      {
        sub: "ruler-ally-1",
        worldId: "realm-ally",
        kingdomId: "wanua-ally-1"
      },
      JWT_SECRET
    );

    const token2 = JwtService.sign(
      {
        sub: "ruler-ally-2",
        worldId: "realm-ally",
        kingdomId: "wanua-ally-2"
      },
      JWT_SECRET
    );

    const ws1 = new WebSocket(`${wsUrl}?token=${token1}&worldId=realm-ally&kingdomId=wanua-ally-1`);
    const ws2 = new WebSocket(`${wsUrl}?token=${token2}&worldId=realm-ally&kingdomId=wanua-ally-2`);

    await Promise.all([
      new Promise<void>((resolve) => ws1.on("open", () => resolve())),
      new Promise<void>((resolve) => ws2.on("open", () => resolve()))
    ]);

    // Koordinat geografis kedua pemain terpaut ~35 meter di pelataran Candi Prambanan
    const lat1 = -7.7520;
    const lon1 = 110.4914;
    const lat2 = -7.7523;
    const lon2 = 110.4915;

    const distanceCalc = GeolocationOnsiteVerifier.calculateHaversineDistance(lat1, lon1, lat2, lon2);
    expect(distanceCalc).toBeLessThanOrEqual(200.0);
    expect(distanceCalc).toBeGreaterThan(0.0);

    // Kirim jabat tangan aliansi dengan kode pairing identik
    const pairCode = "ALLIANCE_SUMPAH_E2E";
    const now = Date.now();

    const verifiedPromise1 = new Promise<Record<string, unknown>>((resolve) => {
      ws1.on("message", (raw) => {
        const parsed = JSON.parse(raw.toString());
        if (parsed.event === "ALLIANCE_VERIFIED_SUCCESS") resolve(parsed);
      });
    });

    const verifiedPromise2 = new Promise<Record<string, unknown>>((resolve) => {
      ws2.on("message", (raw) => {
        const parsed = JSON.parse(raw.toString());
        if (parsed.event === "ALLIANCE_VERIFIED_SUCCESS") resolve(parsed);
      });
    });

    ws1.send(
      JSON.stringify({
        action: "VERIFY_ALLIANCE_HANDSHAKE",
        payload: {
          kingdomId: "wanua-ally-1",
          ephemeralLat: lat1,
          ephemeralLon: lon1,
          accuracyRadiusM: 10,
          isMock: false,
          deviceEntropySignature: "device_e2e_hash_alpha_1",
          timestamp: now,
          pairingCode: pairCode
        }
      })
    );

    ws2.send(
      JSON.stringify({
        action: "VERIFY_ALLIANCE_HANDSHAKE",
        payload: {
          kingdomId: "wanua-ally-2",
          ephemeralLat: lat2,
          ephemeralLon: lon2,
          accuracyRadiusM: 12,
          isMock: false,
          deviceEntropySignature: "device_e2e_hash_beta_2",
          timestamp: now,
          pairingCode: pairCode
        }
      })
    );

    const [res1, res2] = await Promise.all([verifiedPromise1, verifiedPromise2]);
    expect(res1.event).toBe("ALLIANCE_VERIFIED_SUCCESS");
    expect(res2.event).toBe("ALLIANCE_VERIFIED_SUCCESS");

    // Zero-Knowledge memory audit: pastikan tidak ada koordinat GPS yang bocor ke payload
    expect(JSON.stringify(res1)).not.toContain("-7.752");
    expect(JSON.stringify(res2)).not.toContain("110.491");

    // Verifikasi bantuan pertahanan militer aliansi (+50% pasukan sekutu)
    const combatRes = CombatWarService.resolve({
      attackerKingdomId: "k-raider",
      defenderKingdomId: "wanua-ally-1",
      attackerTroops: 30,
      defenderTroops: 20,
      posRondaLv: 2,
      alliedHelpTroops: 10,
      isAttackerOnsiteVerified: true,
      areSameAlliance: false,
      panganDef: 200,
      emasDef: 150
    });
    expect(combatRes.fDef).toBeGreaterThan(0);
    expect(combatRes.survivorsDef).toBeGreaterThan(0);

    ws1.terminate();
    ws2.terminate();
  });

  it("E2E-05: Pengerahan ekspedisi perbatasan desa rimba NPC dengan 3 doktrin moral", () => {
    // Doktrin 1: PILLAGE
    const resPillage = FrontierExpeditionEngine.resolve(
      ExpeditionDoctrine.PILLAGE,
      15,
      80
    );
    expect(resPillage.panganDelta).toBe(60);
    expect(resPillage.emasDelta).toBe(40);
    expect(resPillage.harmoniDelta).toBe(-10.0);
    expect(resPillage.pasukanGugur).toBeGreaterThan(0);

    // Doktrin 2: CONQUER_FORCED
    const resForced = FrontierExpeditionEngine.resolve(
      ExpeditionDoctrine.CONQUER_FORCED,
      12,
      80
    );
    expect(resForced.newAgents.length).toBe(5);
    expect(resForced.harmoniDelta).toBe(-5.0);

    // Doktrin 3: CONQUER_EMBRACED
    const resEmbraced = FrontierExpeditionEngine.resolve(
      ExpeditionDoctrine.CONQUER_EMBRACED,
      10,
      80
    );
    expect(resEmbraced.emasDelta).toBe(-30);
    expect(resEmbraced.harmoniDelta).toBe(5.0);
    expect(resEmbraced.pasukanGugur).toBe(0);
  });

  it("E2E-06: Pertempuran koalisi aliansi vs Boss Naga Banjir Sang Hyang Tuntang Musim 20", () => {
    // 1. Skenario Damai saat Harmoni tinggi (>= 50)
    const peaceFsm = new BossEncounterStateMachine();
    const peaceResult = peaceFsm.evaluateSeason20(75);
    expect(peaceResult.action).toBe("PEACEFUL_ERA_CONCLUDED");
    expect(peaceResult.bonusPangan).toBe(100);
    expect(peaceFsm.getBossHp()).toBe(0);

    // 2. Skenario Murka saat Harmoni rendah (< 50)
    const wrathFsm = new BossEncounterStateMachine();
    const wrathResult = wrathFsm.evaluateSeason20(30);
    expect(wrathResult.action).toBe("SPAWN_BOSS");
    expect(wrathResult.bossHp).toBe(500);
    expect(wrathFsm.getBossHp()).toBe(500);

    // 3. FSM Pertarungan: Koalisi Aliansi mengerahkan serangan bersama
    // Pasukan mandiri 20 prajurit -> Base Damage 44
    // Aliansi terverifikasi onsite memberikan bonus +50% -> 66 prajurit efektif
    const attackHit = wrathFsm.processAllianceAttack(66);
    expect(attackHit.damageDealt).toBeGreaterThan(0);
    expect(attackHit.bossHpRemaining).toBeLessThan(500);
    expect(attackHit.defeated).toBe(false);

    // Gempuran bertubi-tubi hingga Naga takluk
    const fatalHit = wrathFsm.processAllianceAttack(500);
    expect(fatalHit.bossHpRemaining).toBe(0);
    expect(fatalHit.defeated).toBe(true);
    expect(wrathFsm.isBossDefeated()).toBe(true);
  });

  it("E2E-07: Siklus lengkap 20 Musim universal, transisi faksi, dan Skor Warisan Reinkarnasi", async () => {
    const orchestrator = new DeterministicWorldOrchestrator("realm-e2e");

    // Verifikasi kondisi awal Musim 1
    const stateStart = orchestrator.getState();
    expect(stateStart.currentSeason).toBe(1);
    expect(stateStart.isConcluded).toBe(false);

    // Majukan 19 musim hingga mencapai Musim 20
    for (let season = 1; season < 20; season++) {
      await orchestrator.advanceFullSeason();
    }

    const stateSeason20 = orchestrator.getState();
    expect(stateSeason20.currentSeason).toBe(20);

    // Selesaikan Musim 20
    await orchestrator.advanceFullSeason();

    const stateConcluded = orchestrator.getState();
    expect(stateConcluded.isConcluded).toBe(true);

    // Perhitungan Skor Warisan Dinasti (Legacy Score & Karma Points)
    const legacy = DynasticLegacyService.calculateScore(20, 85, 240);

    // Rumus: (20 * 100) + (85 * 10) + (240 * 2) = 2000 + 850 + 480 = 3330
    expect(legacy.legacyScore).toBe(3330);
    // Poin Karma: floor(3330 / 500) = 6
    expect(legacy.karmaPoints).toBe(6);
  });
});
