/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Automated Test Suite: Combat, Expedition, Calamity, & WebSocket Gateway (tests/expedition.test.ts)
 *
 * Test Specifications:
 * - TC-F2-19: Penegakan Aturan Solitary Attack Forbidden (FR-19)
 * - TC-F2-20: Proteksi Friendly Fire Aliansi (FR-19)
 * - TC-F2-21: Validasi Kuota Minimal 10 Prajurit Tempur
 * - TC-F2-22: Resolusi Kemenangan Militer (SUCCESS) & Jarahan Terikat Kuota Ransum Penyintas
 * - TC-F2-23: Resolusi Mundur Terpukul (REPELLED) & Nol Jarahan
 * - TC-F2-24: Efek Mitigasi Pos Ronda (+20%/Lv) & Bantuan Pasukan Sekutu Onsite (+50%)
 * - TC-F2-25: Validasi Kuota Minimal 5 Prajurit Ekspedisi Perbatasan
 * - TC-F2-26: Ekspedisi Doktrin PILLAGE (Rampas Sumber Daya)
 * - TC-F2-27: Ekspedisi Doktrin CONQUER_FORCED (Taklukkan Paksa & Profil Tawanan)
 * - TC-F2-28: Ekspedisi Doktrin CONQUER_EMBRACED (Rangkul Asimilasi & Biaya 30 Emas)
 * - TC-F2-29: Calamity Engine: Evaluasi Probabilitas Dinamis & Bencana Bertingkat (Level 1 vs Level 2)
 * - TC-F2-30: Boss Naga Banjir FSM Musim 20: Skenario Murka (500 HP) vs Skenario Damai (+100 Pangan)
 * - TC-F2-31: Integrasi Gateway WebSocket RFC 6455 & Autentikasi Handshake JWT
 */

import { describe, it, expect } from "vitest";
import { CombatWarService } from "../src/services/battleService.js";
import {
  FrontierExpeditionEngine,
  ExpeditionDoctrine
} from "../src/services/expeditionService.js";
import {
  CalamityAndBossEngine,
  BossEncounterStateMachine
} from "../src/sim/calamityEngine.js";
import { JwtService } from "../src/auth/jwt.js";
import { GameSocketServer } from "../src/services/socketService.js";
import { createGameServer } from "../src/server.js";
import type { AddressInfo } from "node:net";
import type { IncomingMessage } from "node:http";

describe("Fase 2: Combat, Expedition, Calamity, & Gateway Suite", () => {
  describe("Pertempuran Militer & Resolusi PvP (CombatWarService)", () => {
    it("harus menolak serangan jika penyerang belum diverifikasi onsite (TC-F2-19)", () => {
      const res = CombatWarService.resolve({
        attackerKingdomId: "k-attacker",
        defenderKingdomId: "k-defender",
        attackerTroops: 30,
        defenderTroops: 15,
        posRondaLv: 1,
        alliedHelpTroops: 0,
        isAttackerOnsiteVerified: false, // Pemain soliter / belum verifikasi fisik
        areSameAlliance: false,
        panganDef: 200,
        emasDef: 150
      });

      expect(res.status).toBe("REPELLED");
      expect(res.rejectionReason).toBe("SOLITARY_ATTACK_FORBIDDEN");
      expect(res.gugurAtk).toBe(0);
      expect(res.jarahanPangan).toBe(0);
      expect(res.jarahanEmas).toBe(0);
      expect(res.survivorsAtk).toBe(30);
    });

    it("harus melarang penyerangan sesama sekutu aliansi / friendly fire (TC-F2-20)", () => {
      const res = CombatWarService.resolve({
        attackerKingdomId: "k-attacker",
        defenderKingdomId: "k-ally",
        attackerTroops: 25,
        defenderTroops: 20,
        posRondaLv: 1,
        alliedHelpTroops: 0,
        isAttackerOnsiteVerified: true,
        areSameAlliance: true, // Satu aliansi!
        panganDef: 200,
        emasDef: 100
      });

      expect(res.status).toBe("REPELLED");
      expect(res.rejectionReason).toBe("FRIENDLY_FIRE_PROHIBITED");
      expect(res.gugurAtk).toBe(0);
      expect(res.survivorsAtk).toBe(25);
    });

    it("harus melempar error jika pasukan serang kurang dari 10 prajurit (TC-F2-21)", () => {
      expect(() =>
        CombatWarService.resolve({
          attackerKingdomId: "k-attacker",
          defenderKingdomId: "k-defender",
          attackerTroops: 9, // Kurang dari 10
          defenderTroops: 10,
          posRondaLv: 0,
          alliedHelpTroops: 0,
          isAttackerOnsiteVerified: true,
          areSameAlliance: false,
          panganDef: 100,
          emasDef: 50
        })
      ).toThrow("MINIMUM_10_TROOPS_REQUIRED");
    });

    it("harus menyelesaikan kemenangan penyerang (SUCCESS) dan kuota jarahan ransum penyintas (TC-F2-22)", () => {
      // Deterministic PRNG selalu mengembalikan 0.5 (xi = 0)
      const fixedPrng = () => 0.5;

      const res = CombatWarService.resolve({
        attackerKingdomId: "k-attacker",
        defenderKingdomId: "k-defender",
        attackerTroops: 50,
        defenderTroops: 10,
        posRondaLv: 1,
        alliedHelpTroops: 0,
        isAttackerOnsiteVerified: true,
        areSameAlliance: false,
        panganDef: 300,
        emasDef: 200,
        prng: fixedPrng
      });

      expect(res.status).toBe("SUCCESS");
      expect(res.fAtk).toBe(50);
      expect(res.fDef).toBe(12); // 10 * (1 + 0.20)
      expect(res.gugurDef).toBe(4); // 40% dari 10 prajurit
      expect(res.survivorsAtk).toBeGreaterThan(40);

      // Jarahan pangan maks 30% dari 300 = 90; kuota survivor 48 * 5 = 240 => min(90, 240) = 90
      expect(res.jarahanPangan).toBe(90);
      // Jarahan emas maks 25% dari 200 = 50; kuota survivor 48 * 3 = 144 => min(50, 144) = 50
      expect(res.jarahanEmas).toBe(50);
    });

    it("harus menyelesaikan penyerang terpukul mundur (REPELLED) saat pertahanan lebih kuat (TC-F2-23)", () => {
      const fixedPrng = () => 0.5;

      const res = CombatWarService.resolve({
        attackerKingdomId: "k-attacker",
        defenderKingdomId: "k-defender",
        attackerTroops: 15,
        defenderTroops: 30,
        posRondaLv: 2, // Pos ronda lv 2 (+40%)
        alliedHelpTroops: 20, // Bantuan sekutu +10 prajurit efektif
        isAttackerOnsiteVerified: true,
        areSameAlliance: false,
        panganDef: 500,
        emasDef: 300,
        prng: fixedPrng
      });

      expect(res.status).toBe("REPELLED");
      expect(res.gugurAtk).toBe(8); // 50% dari 15 = round(7.5) = 8
      expect(res.gugurDef).toBe(5); // 15% dari 30 = round(4.5) = 5
      expect(res.jarahanPangan).toBe(0);
      expect(res.jarahanEmas).toBe(0);
      expect(res.survivorsAtk).toBe(7);
    });

    it("harus memperhitungkan pos ronda dan bantuan aliansi secara matematis (TC-F2-24)", () => {
      const fixedPrng = () => 0.5;
      // Pos Ronda Lv 3 (+60%), Sekutu 40 Prajurit (+20 prajurit efektif)
      const res = CombatWarService.resolve({
        attackerKingdomId: "k-attacker",
        defenderKingdomId: "k-defender",
        attackerTroops: 40,
        defenderTroops: 20,
        posRondaLv: 3,
        alliedHelpTroops: 40,
        isAttackerOnsiteVerified: true,
        areSameAlliance: false,
        panganDef: 100,
        emasDef: 100,
        prng: fixedPrng
      });

      // F_def = (20 * 1.6 + 0.5 * 40) = (32 + 20) = 52
      // F_atk = 40
      // F_atk (40) < F_def (52) -> REPELLED!
      expect(res.status).toBe("REPELLED");
      expect(res.fDef).toBe(52);
      expect(res.fAtk).toBe(40);
    });
  });

  describe("Ekspedisi Desa Rimba NPC (FrontierExpeditionEngine)", () => {
    it("harus memvalidasi batas minimal 5 prajurit ekspedisi (TC-F2-25)", () => {
      expect(() =>
        FrontierExpeditionEngine.resolve(ExpeditionDoctrine.PILLAGE, 4, 100)
      ).toThrow("MINIMUM_5_TROOPS_REQUIRED");
    });

    it("harus mengeksekusi doktrin PILLAGE dengan rampasan sumber daya dan penalti moral (TC-F2-26)", () => {
      const res = FrontierExpeditionEngine.resolve(
        ExpeditionDoctrine.PILLAGE,
        10,
        100,
        () => 0.5
      );

      expect(res.doctrine).toBe(ExpeditionDoctrine.PILLAGE);
      expect(res.panganDelta).toBe(60);
      expect(res.emasDelta).toBe(40);
      expect(res.pasukanGugur).toBeGreaterThanOrEqual(1);
      expect(res.pasukanGugur).toBeLessThanOrEqual(3);
      expect(res.newAgents.length).toBe(0);
      expect(res.harmoniDelta).toBe(-10.0);
      expect(res.satisfactionDelta).toBe(-5.0);
      expect(res.generalAdilPenalty).toBe(-0.25);
    });

    it("harus mengeksekusi doktrin CONQUER_FORCED dan menghasilkan 5 warga tawanan (TC-F2-27)", () => {
      const res = FrontierExpeditionEngine.resolve(
        ExpeditionDoctrine.CONQUER_FORCED,
        10,
        100,
        () => 0.5
      );

      expect(res.doctrine).toBe(ExpeditionDoctrine.CONQUER_FORCED);
      expect(res.panganDelta).toBe(40);
      expect(res.emasDelta).toBe(0);
      expect(res.newAgents.length).toBe(5);

      for (const agent of res.newAgents) {
        expect(agent.adil).toBe(0.1);
        expect(agent.trust).toBe(0.1);
        expect(agent.berani).toBe(0.7);
        expect(agent.role).toBe("petani");
      }
      expect(res.harmoniDelta).toBe(-5.0);
      expect(res.satisfactionDelta).toBe(-2.0);
    });

    it("harus mengeksekusi doktrin CONQUER_EMBRACED dengan biaya 30 emas dan warga sukarela (TC-F2-28)", () => {
      // Gagal jika emas kurang dari 30
      expect(() =>
        FrontierExpeditionEngine.resolve(ExpeditionDoctrine.CONQUER_EMBRACED, 10, 25)
      ).toThrow("INSUFFICIENT_GOLD_FOR_EMBRACE");

      // Sukses jika emas cukup
      const res = FrontierExpeditionEngine.resolve(
        ExpeditionDoctrine.CONQUER_EMBRACED,
        10,
        50
      );

      expect(res.doctrine).toBe(ExpeditionDoctrine.CONQUER_EMBRACED);
      expect(res.panganDelta).toBe(0);
      expect(res.emasDelta).toBe(-30);
      expect(res.pasukanGugur).toBe(0);
      expect(res.newAgents.length).toBe(5);

      for (const agent of res.newAgents) {
        expect(agent.adil).toBe(0.8);
        expect(agent.trust).toBe(0.75);
        expect(agent.berani).toBe(0.3);
      }
      expect(res.harmoniDelta).toBe(5.0);
      expect(res.satisfactionDelta).toBe(5.0);
    });
  });

  describe("Calamity & Boss Naga Banjir Engine (CalamityAndBossEngine)", () => {
    it("harus mengevaluasi dinamika harmoni alam dan memicu bencana bertingkat (TC-F2-29)", () => {
      // 1. Harmoni tinggi dan PRNG tinggi -> Aman (Level 0)
      const safe = CalamityAndBossEngine.evaluateEcology(80.0, 0.5, () => 0.99);
      expect(safe.calamityTriggered).toBe(false);
      expect(safe.calamityLevel).toBe(0);
      expect(safe.panenMultiplier).toBe(1.0);

      // 2. Harmoni sedang (>= 40) dan PRNG rendah -> Level 1 (Paceklik Panen -30%)
      const drought = CalamityAndBossEngine.evaluateEcology(50.0, -0.2, () => 0.01);
      expect(drought.calamityTriggered).toBe(true);
      expect(drought.calamityLevel).toBe(1);
      expect(drought.panenMultiplier).toBe(0.7);
      expect(drought.panganLostRatio).toBe(0.0);

      // 3. Harmoni kritis (< 40) dan PRNG rendah -> Level 2 (Banjir Bandang)
      const flood = CalamityAndBossEngine.evaluateEcology(20.0, -1.0, () => 0.01);
      expect(flood.calamityTriggered).toBe(true);
      expect(flood.calamityLevel).toBe(2);
      expect(flood.panenMultiplier).toBe(0.7);
      expect(flood.panganLostRatio).toBe(0.2); // Lumbung -20%
      expect(flood.posRondaLevelLoss).toBe(1); // Pos Ronda runtuh 1 level
    });

    it("harus mengoperasikan Boss Naga Banjir FSM pada Musim 20 (TC-F2-30)", () => {
      const bossFsm = new BossEncounterStateMachine();
      expect(bossFsm.getBossHp()).toBe(500);

      // Skenario Damai: Rata-rata harmoni >= 50
      const peace = bossFsm.evaluateSeason20(65.0);
      expect(peace.action).toBe("PEACEFUL_ERA_CONCLUDED");
      expect(peace.bonusPangan).toBe(100);
      expect(bossFsm.isBossSpawned()).toBe(false);

      // Skenario Murka: Rata-rata harmoni < 50
      const wrath = bossFsm.evaluateSeason20(42.0);
      expect(wrath.action).toBe("SPAWN_BOSS");
      expect(wrath.bossHp).toBe(500);
      expect(bossFsm.isBossSpawned()).toBe(true);

      // Serangan gabungan sekutu 100 prajurit
      const fixedPrng = () => 0.5;
      const attackRes = bossFsm.processAllianceAttack(100, fixedPrng);

      // Kerusakan = 100 * 1.5 = 150
      expect(attackRes.damageDealt).toBe(150);
      expect(attackRes.bossHpRemaining).toBe(350);
      expect(attackRes.retaliationCasualties).toBe(25); // 25% prajurit gugur
      expect(attackRes.defeated).toBe(false);

      // Serangan kedua dengan 250 prajurit (damage 375, mengalahkan sisa 350 HP)
      const fatalAttack = bossFsm.processAllianceAttack(250, fixedPrng);
      expect(fatalAttack.bossHpRemaining).toBe(0);
      expect(fatalAttack.defeated).toBe(true);
      expect(bossFsm.isBossDefeated()).toBe(true);
    });
  });

  describe("Realtime WebSocket Gateway & Autentikasi JWT (TC-F2-31)", () => {
    it("harus menerbitkan dan memverifikasi token JWT HMAC-SHA256 sesuai RFC 7519", () => {
      const secret = "test_super_secret_jwt_key_1337";
      const payload = {
        sub: "user-raden-wijaya-01",
        username: "RadenWijaya",
        kingdomId: "k-majapahit",
        worldId: "w-nusantara-01",
        age_confirmed: true
      };

      const token = JwtService.sign(payload, secret, 3600);
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3);

      const decoded = JwtService.verify(token, secret);
      expect(decoded.sub).toBe("user-raden-wijaya-01");
      expect(decoded.username).toBe("RadenWijaya");
      expect(decoded.kingdomId).toBe("k-majapahit");
      expect(decoded.worldId).toBe("w-nusantara-01");

      // Verifikasi token palsu / rahasia salah
      expect(() => JwtService.verify(token, "wrong_secret")).toThrow("JWT_INVALID_SIGNATURE");

      // Verifikasi token kedaluwarsa
      const expiredToken = JwtService.sign(payload, secret, -10);
      expect(() => JwtService.verify(expiredToken, secret)).toThrow("JWT_EXPIRED");
    });

    it("harus menginisialisasi GameSocketServer dan memproses pesan titah kartu secara deterministik", async () => {
      const socketServer = new GameSocketServer("test_secret");

      // Simulasi socket mock terotentikasi
      const messagesSent: string[] = [];
      const mockSocket: any = {
        readyState: 1, // WebSocket.OPEN
        isAlive: true,
        worldId: "w-test",
        kingdomId: "k-test",
        player: { sub: "p-test" },
        send: (msg: string) => messagesSent.push(msg)
      };

      // 1. Eksekusi Titah Kartu Kebijakan Terstruktur
      await socketServer.handleSocketMessage(
        mockSocket,
        JSON.stringify({
          action: "SUBMIT_DECREE",
          payload: {
            kingdomId: "k-test",
            season: 2,
            sourceType: "PRESET_CARD",
            cardId: "CARD_01"
          }
        })
      );

      expect(messagesSent.length).toBe(1);
      const parsed = JSON.parse(messagesSent[0]);
      expect(parsed.event).toBe("DECREE_ACCEPTED");
      expect(parsed.data.semanticVector.biayaEmas).toBe(25);
      expect(parsed.data.semanticVector.keadilan).toBe(0.5);

      // 2. Eksekusi Update Pajak
      await socketServer.handleSocketMessage(
        mockSocket,
        JSON.stringify({
          action: "UPDATE_TAX_RATE",
          payload: {
            kingdomId: "k-test",
            newTaxRate: 18
          }
        })
      );

      // Bersihkan socket server
      await socketServer.close();
    });

    it("harus mengelola autentikasi handshake WebSocket RFC 6455 dan menolak token tidak valid (TC-F2-32)", async () => {
      const secret = "test_handshake_secret";
      const socketServer = new GameSocketServer(secret);
      const validToken = JwtService.sign(
        { sub: "p-valid", worldId: "w-alpha", kingdomId: "k-alpha" },
        secret
      );

      let closedCode: number | undefined;
      const events: Record<string, ((...args: unknown[]) => void)[]> = {};
      const mockSocket: any = {
        readyState: 1,
        on: (ev: string, fn: (...args: unknown[]) => void) => {
          events[ev] = events[ev] || [];
          events[ev].push(fn);
        },
        send: () => {},
        close: (code: number) => {
          closedCode = code;
        }
      };

      // 1. Missing token -> 4001
      socketServer.handleConnection(mockSocket, {
        url: "/"
      } as unknown as IncomingMessage);
      expect(closedCode).toBe(4001);

      // 2. Invalid signature token -> 4003
      closedCode = undefined;
      socketServer.handleConnection(mockSocket, {
        url: "/?token=invalid.jwt.token"
      } as unknown as IncomingMessage);
      expect(closedCode).toBe(4003);

      // 3. Valid token -> socket authenticated
      closedCode = undefined;
      socketServer.handleConnection(mockSocket, {
        url: `/?token=${validToken}&worldId=w-alpha&kingdomId=k-alpha`
      } as unknown as IncomingMessage);
      expect(closedCode).toBeUndefined();
      expect(mockSocket.worldId).toBe("w-alpha");
      expect(mockSocket.kingdomId).toBe("k-alpha");
      expect(events["message"]).toBeDefined();

      // Trigger unregister on close
      if (events["close"]?.[0]) {
        events["close"][0]();
      }
      await socketServer.close();
    });

    it("harus memproses verifikasi aliansi onsite melalui WebSocket (TC-F2-33)", async () => {
      const socketServer = new GameSocketServer("secret");
      const messagesA: string[] = [];
      const messagesB: string[] = [];

      const mockSocketA: any = {
        readyState: 1,
        worldId: "w-1",
        kingdomId: "k-1",
        player: { sub: "p-1" },
        send: (msg: string) => messagesA.push(msg)
      };
      const mockSocketB: any = {
        readyState: 1,
        worldId: "w-1",
        kingdomId: "k-2",
        player: { sub: "p-2" },
        send: (msg: string) => messagesB.push(msg)
      };

      const now = Date.now();
      // Kerajaan A mengirim handshake pertama (pending)
      await socketServer.handleSocketMessage(
        mockSocketA,
        JSON.stringify({
          action: "VERIFY_ALLIANCE_HANDSHAKE",
          payload: {
            kingdomId: "k-1",
            ephemeralLat: -7.803249,
            ephemeralLon: 110.364404,
            accuracyRadiusM: 10,
            isMock: false,
            deviceEntropySignature: "device_111",
            timestamp: now,
            pairingCode: "PAIR99"
          }
        })
      );
      expect(messagesA.length).toBe(0);

      // Kerajaan B mengirim handshake dengan pairing code identik di lokasi berdekatan (<200m)
      await socketServer.handleSocketMessage(
        mockSocketB,
        JSON.stringify({
          action: "VERIFY_ALLIANCE_HANDSHAKE",
          payload: {
            kingdomId: "k-2",
            ephemeralLat: -7.803500,
            ephemeralLon: 110.364600,
            accuracyRadiusM: 10,
            isMock: false,
            deviceEntropySignature: "device_222",
            timestamp: now,
            pairingCode: "PAIR99"
          }
        })
      );

      expect(messagesB.length).toBe(1);
      const parsedB = JSON.parse(messagesB[0]);
      expect(parsedB.event).toBe("ALLIANCE_VERIFIED_SUCCESS");
      expect(parsedB.data.militaryStrikeAuthorized).toBe(true);

      await socketServer.close();
    });

    it("harus memproses serangan militer LAUNCH_ATTACK dan peluncuran ekspedisi LAUNCH_EXPEDITION (TC-F2-34)", async () => {
      const socketServer = new GameSocketServer("secret");
      const messages: string[] = [];
      const mockSocket: any = {
        readyState: 1,
        worldId: "w-1",
        kingdomId: "k-atk",
        player: { sub: "p-atk" },
        send: (msg: string) => messages.push(msg)
      };

      // LAUNCH_ATTACK
      await socketServer.handleSocketMessage(
        mockSocket,
        JSON.stringify({
          action: "LAUNCH_ATTACK",
          payload: {
            attackerKingdomId: "k-atk",
            defenderKingdomId: "k-def",
            attackerTroops: 30,
            defenderTroops: 10,
            posRondaLv: 0,
            alliedHelpTroops: 0,
            isAttackerOnsiteVerified: true,
            areSameAlliance: false
          }
        })
      );

      expect(messages.length).toBe(1);
      const battleRes = JSON.parse(messages[0]);
      expect(battleRes.event).toBe("BATTLE_RESULT");
      expect(battleRes.data.status).toBe("SUCCESS");

      // LAUNCH_EXPEDITION
      await socketServer.handleSocketMessage(
        mockSocket,
        JSON.stringify({
          action: "LAUNCH_EXPEDITION",
          payload: {
            doctrine: "CONQUER_FORCED",
            pasukanDikirim: 10,
            emas: 50
          }
        })
      );

      expect(messages.length).toBe(2);
      const expRes = JSON.parse(messages[1]);
      expect(expRes.event).toBe("REALM_STATE_UPDATE");
      expect(expRes.data.type).toBe("EXPEDITION_RESOLVED");
      expect(expRes.data.result.newAgents.length).toBe(5);

      await socketServer.close();
    });

    it("harus menyiarkan delta state musim dan menangani error format pesan tidak valid (TC-F2-35)", async () => {
      const socketServer = new GameSocketServer("secret");
      const messages: string[] = [];
      const mockSocket: any = {
        readyState: 1,
        worldId: "w-realm-1",
        kingdomId: "k-realm-1",
        player: { sub: "p-realm-1" },
        send: (msg: string) => messages.push(msg)
      };

      // 1. Error on invalid JSON
      await socketServer.handleSocketMessage(mockSocket, "not a valid json string");
      expect(messages.length).toBe(1);
      const errParsed = JSON.parse(messages[0]);
      expect(errParsed.event).toBe("ERROR");

      // 2. Error on unknown action
      await socketServer.handleSocketMessage(
        mockSocket,
        JSON.stringify({ action: "NON_EXISTENT_ACTION" })
      );
      expect(messages.length).toBe(2);
      const unknownParsed = JSON.parse(messages[1]);
      expect(unknownParsed.event).toBe("ERROR");

      // 3. Broadcast delta state
      const token = JwtService.sign({ sub: "p-1", worldId: "w-realm-1" }, "secret");
      const mockConnSocket: any = {
        readyState: 1,
        on: () => {},
        send: (msg: string) => messages.push(msg)
      };
      socketServer.handleConnection(
        mockConnSocket,
        {
          url: `/?token=${token}&worldId=w-realm-1`
        } as unknown as IncomingMessage
      );

      socketServer.broadcastDeltaState({
        worldId: "w-realm-1",
        season: 3,
        phase: "SUBMIT_DECREE",
        phaseElapsedMs: 1500
      });

      const lastMsg = JSON.parse(messages[messages.length - 1]);
      expect(lastMsg.event).toBe("REALM_STATE_UPDATE");
      expect(lastMsg.data.season).toBe(3);

      await socketServer.close();
    });

    it("harus menginisialisasi server game HTTP dan melayani health check endpoint 200 OK (TC-F2-36)", async () => {
      const { httpServer, socketService } = createGameServer();
      await new Promise<void>((resolve) => httpServer.listen(0, resolve));
      const addr = httpServer.address() as AddressInfo;

      const healthRes = await fetch(`http://127.0.0.1:${addr.port}/health`);
      const healthJson = (await healthRes.json()) as { status: string; service: string };
      expect(healthRes.status).toBe(200);
      expect(healthJson.status).toBe("HEALTHY");
      expect(healthJson.service).toBe("titah-rakyat-backend");

      const notFoundRes = await fetch(`http://127.0.0.1:${addr.port}/random-route`);
      expect(notFoundRes.status).toBe(404);

      await socketService.close();
      await new Promise<void>((resolve) => httpServer.close(() => resolve()));
    });
  });
});
