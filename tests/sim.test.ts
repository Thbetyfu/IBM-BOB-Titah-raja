import { describe, it, expect } from "vitest";
import {
  AgentMemoryPool,
  AgentUtilityEvaluationSystem,
  AgentAction,
  AgentRole
} from "../src/sim/agentEngine.js";
import {
  MacroEconomyCalculator,
  BanditQTableManager
} from "../src/sim/economyCalculator.js";
import {
  DeterministicWorldOrchestrator,
  TickPhase,
  getPhaseStartSecond
} from "../src/sim/worldEngine.js";
import {
  TriDefeatEvaluator,
  DynasticLegacyService,
  TerritoryAnnexationService,
  FactionVoiceSynthesizer
} from "../src/sim/dynastyEngine.js";

describe("Fase 1: Multi-Agent ECS Behavior Engine", () => {
  it("harus mengalokasikan AgentMemoryPool dengan typed array kontigu tanpa error (TC-F1-01)", () => {
    const pool = new AgentMemoryPool(100);
    expect(pool.count).toBe(100);
    expect(pool.lapar).toBeInstanceOf(Float32Array);
    expect(pool.aman).toBeInstanceOf(Float32Array);
    expect(pool.adil).toBeInstanceOf(Float32Array);
    expect(pool.trust).toBeInstanceOf(Float32Array);
    expect(pool.serakah).toBeInstanceOf(Float32Array);
    expect(pool.berani).toBeInstanceOf(Float32Array);
    expect(pool.etosKerja).toBeInstanceOf(Float32Array);
    expect(pool.kingdomIdIndex).toBeInstanceOf(Int32Array);
    expect(pool.currentAction).toBeInstanceOf(Int8Array);
    expect(pool.role).toBeInstanceOf(Int8Array);
  });

  it("harus melempar RangeError jika setAgent dipanggil di luar kapasitas pool", () => {
    const pool = new AgentMemoryPool(10);
    expect(() => pool.setAgent(-1, { lapar: 0.5 })).toThrow(RangeError);
    expect(() => pool.setAgent(10, { lapar: 0.5 })).toThrow(RangeError);
  });

  it("harus mengevaluasi utilitas 10.000 agen di bawah 100 ms (TC-F1-02, KPI-1.1 & NFR-01)", () => {
    const maxAgents = 10_000;
    const pool = new AgentMemoryPool(maxAgents);

    for (let i = 0; i < maxAgents; i++) {
      pool.setAgent(i, {
        lapar: (i % 10) / 10.0,
        aman: 0.7,
        adil: 0.6,
        trust: 0.5,
        serakah: (i % 5) / 5.0,
        berani: (i % 7) / 7.0,
        role: i % 4
      });
    }

    const tStart = performance.now();
    const result = AgentUtilityEvaluationSystem.evaluateAllAgents(pool, maxAgents, 42);
    const durationMs = performance.now() - tStart;

    expect(durationMs).toBeLessThan(100); // KPI-1.1: < 100 ms
    const totalCount = result.counts.reduce((sum, c) => sum + c, 0);
    expect(totalCount).toBe(maxAgents);
    expect(result.avgSatisfaction).toBeGreaterThan(0);
    expect(result.avgSatisfaction).toBeLessThanOrEqual(100);
  });

  it("harus menggunakan reusableCounts buffer untuk zero heap allocation per tick (TC-F1-03, KPI-1.2)", () => {
    const pool = new AgentMemoryPool(200);
    for (let i = 0; i < 200; i++) {
      pool.setAgent(i, {
        lapar: 0.2,
        aman: 0.8,
        adil: 0.8,
        trust: 0.8,
        serakah: 0.1,
        berani: 0.2,
        role: AgentRole.PETANI
      });
    }

    const preallocatedBuffer = [999, 999, 999, 999, 999, 999];
    const res = AgentUtilityEvaluationSystem.evaluateAllAgents(pool, 200, 100, preallocatedBuffer);

    expect(res.counts).toBe(preallocatedBuffer); // Objek buffer yang sama
    const total = res.counts.reduce((a, b) => a + b, 0);
    expect(total).toBe(200);
    expect(preallocatedBuffer[0]).not.toBe(999);
  });

  it("harus menghasilkan output deterministik untuk seed yang sama (TC-F1-04, NFR-08)", () => {
    const pool1 = new AgentMemoryPool(500);
    const pool2 = new AgentMemoryPool(500);

    for (let i = 0; i < 500; i++) {
      const initData = {
        lapar: 0.4,
        aman: 0.5,
        adil: 0.5,
        trust: 0.5,
        serakah: 0.3,
        berani: 0.4,
        role: AgentRole.PETANI
      };
      pool1.setAgent(i, initData);
      pool2.setAgent(i, initData);
    }

    const res1 = AgentUtilityEvaluationSystem.evaluateAllAgents(pool1, 500, 1337);
    const res2 = AgentUtilityEvaluationSystem.evaluateAllAgents(pool2, 500, 1337);

    expect(res1.counts).toEqual(res2.counts);
    expect(res1.avgSatisfaction).toBeCloseTo(res2.avgSatisfaction, 5);

    for (let i = 0; i < 500; i++) {
      expect(pool1.currentAction[i]).toBe(pool2.currentAction[i]);
    }
  });

  it("harus memutasi psikologi agen secara deterministik dan terikat dalam [0.0, 1.0] (TC-F1-05)", () => {
    const pool = new AgentMemoryPool(10);
    for (let i = 0; i < 10; i++) {
      pool.setAgent(i, {
        lapar: 0.5,
        aman: 0.5,
        adil: 0.5,
        trust: 0.5
      });
    }

    // Kasus krisis: pangan rendah, militer lemah, ancaman bandit tinggi, pajak zalim (40%)
    AgentUtilityEvaluationSystem.updateAgentPsychology(pool, 10, {
      panganKerajaan: 0,
      totalAgents: 10,
      pasukanKerajaan: 0,
      ancamanBandit: 80,
      pajak: 40,
      efekKeadilanTitah: -0.5,
      janjiTitah: 0.1
    });

    for (let i = 0; i < 10; i++) {
      expect(pool.lapar[i]).toBeGreaterThanOrEqual(0.0);
      expect(pool.lapar[i]).toBeLessThanOrEqual(1.0);
      expect(pool.aman[i]).toBeGreaterThanOrEqual(0.0);
      expect(pool.aman[i]).toBeLessThanOrEqual(1.0);
      expect(pool.adil[i]).toBeGreaterThanOrEqual(0.0);
      expect(pool.adil[i]).toBeLessThanOrEqual(1.0);
      expect(pool.trust[i]).toBeGreaterThanOrEqual(0.0);
      expect(pool.trust[i]).toBeLessThanOrEqual(1.0);

      // Rasa lapar meningkat saat pangan habis (0.5 + 0.15 = 0.65)
      expect(pool.lapar[i]).toBeCloseTo(0.65, 2);
      expect(pool.aman[i]).toBeLessThan(0.5);
      expect(pool.adil[i]).toBeLessThan(0.5);
    }
  });

  it("penalti pajak kuadratik harus meruntuhkan rasa keadilan rakyat secara tajam (TC-F1-06)", () => {
    const pool = new AgentMemoryPool(1);
    pool.setAgent(0, { adil: 0.8 });

    // Pajak 50% -> penalti: ((50 - 20) / 10)^2 = 3^2 = 9. 0.05 * 9 = 0.45 reduksi
    AgentUtilityEvaluationSystem.updateAgentPsychology(pool, 1, {
      panganKerajaan: 200,
      totalAgents: 10,
      pasukanKerajaan: 10,
      ancamanBandit: 0,
      pajak: 50,
      efekKeadilanTitah: 0.0,
      janjiTitah: 0.5
    });

    // adil = max(0, 0.8 - 0.45) = 0.35
    expect(pool.adil[0]).toBeCloseTo(0.35, 2);
  });

  it("agen dengan kelaparan dan ketidakadilan ekstrem harus cenderung memberontak (TC-F1-07)", () => {
    const pool = new AgentMemoryPool(50);
    for (let i = 0; i < 50; i++) {
      pool.setAgent(i, {
        lapar: 1.0,
        aman: 0.0,
        adil: 0.0,
        trust: 0.0,
        serakah: 0.5,
        berani: 0.9
      });
    }

    const res = AgentUtilityEvaluationSystem.evaluateAllAgents(pool, 50, 999);
    expect(res.counts[AgentAction.MEMBERONTAK]).toBeGreaterThan(30);
  });

  it("harus menangani boundary edge cases pada evaluasi agen dengan aman tanpa crash", () => {
    const pool = new AgentMemoryPool(10);
    // Evaluasi 0 agen
    const zeroRes = AgentUtilityEvaluationSystem.evaluateAllAgents(pool, 0, 1);
    expect(zeroRes.avgSatisfaction).toBe(0);
    expect(zeroRes.counts).toEqual([0, 0, 0, 0, 0, 0]);

    // Evaluasi activeCount melebihi kapasitas pool
    const overRes = AgentUtilityEvaluationSystem.evaluateAllAgents(pool, 50, 1);
    expect(overRes.counts.reduce((a, b) => a + b, 0)).toBe(10);

    // Psikologi dengan input negatif dan total populasi 0
    expect(() => {
      AgentUtilityEvaluationSystem.updateAgentPsychology(pool, 10, {
        panganKerajaan: -100,
        totalAgents: 0,
        pasukanKerajaan: -50,
        ancamanBandit: -20,
        pajak: -10,
        efekKeadilanTitah: -5,
        janjiTitah: -2
      });
    }).not.toThrow();
  });
});

describe("Fase 1: Kalkulator Makroekonomi & Klausul Kebangkrutan", () => {
  it("harus menghitung neraca panen, konsumsi, dan kapasitas lumbung secara akurat (TC-F1-08, FR-11)", () => {
    const output = MacroEconomyCalculator.calculate({
      pangan: 100,
      emas: 100,
      pasukan: 10,
      pajak: 15,
      lumbungLv: 1, // max: 500
      nKerja: 40,
      nDagang: 20,
      nCuri: 0,
      nTotal: 100,
      etaBencana: 1.0,
      biayaTitah: 0
    });

    expect(output.panen).toBe(100);
    expect(output.konsumsi).toBe(100);
    expect(output.newPangan).toBe(100);
    expect(output.omzetPasar).toBe(80);
    expect(output.pajakEmas).toBe(18);
    expect(output.gajiMiliter).toBe(10);
    expect(output.newEmas).toBe(108);
    expect(output.newPasukan).toBe(10);
    expect(output.isBankrupt).toBe(false);
  });

  it("harus memperhitungkan penurunan panen 30% saat paceklik/bencana (TC-F1-09, FR-14)", () => {
    const normal = MacroEconomyCalculator.calculate({
      pangan: 200,
      emas: 100,
      pasukan: 10,
      pajak: 10,
      lumbungLv: 1,
      nKerja: 50,
      nDagang: 10,
      nCuri: 0,
      nTotal: 50,
      etaBencana: 1.0,
      biayaTitah: 0
    });

    const calamity = MacroEconomyCalculator.calculate({
      pangan: 200,
      emas: 100,
      pasukan: 10,
      pajak: 10,
      lumbungLv: 1,
      nKerja: 50,
      nDagang: 10,
      nCuri: 0,
      nTotal: 50,
      etaBencana: 0.70,
      biayaTitah: 0
    });

    expect(normal.panen).toBe(125);
    expect(calamity.panen).toBe(88);
    expect(calamity.panen).toBeLessThan(normal.panen);
  });

  it("harus mengeksekusi kebangkrutan kas dan desersi 20% prajurit saat emas tidak cukup (TC-F1-10, FR-11)", () => {
    const bankruptOutput = MacroEconomyCalculator.calculate({
      pangan: 50,
      emas: 5,
      pasukan: 50,
      pajak: 10,
      lumbungLv: 1,
      nKerja: 10,
      nDagang: 5,
      nCuri: 0,
      nTotal: 50,
      etaBencana: 1.0,
      biayaTitah: 10
    });

    expect(bankruptOutput.isBankrupt).toBe(true);
    expect(bankruptOutput.newEmas).toBe(0);
    expect(bankruptOutput.newPasukan).toBe(40);
  });

  it("harus mengevaluasi Tri-Defeat secara akurat dengan prioritas Kudeta > Kelaparan > Bandit (TC-F1-11, 12, 13, FR-20)", () => {
    // 1. Uji Kudeta: rebel ratio > 40% selama 2 musim
    const coup1 = MacroEconomyCalculator.evaluateTriDefeat({
      nRebel: 45,
      nTotal: 100,
      pangan: 50,
      ancamanBandit: 20,
      currentRebelStreak: 0,
      currentStarvationStreak: 0
    });
    expect(coup1.rebelStreak).toBe(1);
    expect(coup1.isFallen).toBe(false);

    const coup2 = MacroEconomyCalculator.evaluateTriDefeat({
      nRebel: 50,
      nTotal: 100,
      pangan: 50,
      ancamanBandit: 100, // Sekaligus ancaman bandit ekstrem
      currentRebelStreak: coup1.rebelStreak,
      currentStarvationStreak: 0
    });
    expect(coup2.rebelStreak).toBe(2);
    expect(coup2.isFallen).toBe(true);
    // Prioritas SDD 4.7: Kudeta rakyat mendahului kehancuran bandit
    expect(coup2.causeOfFall).toBe("COUP_DETAT");

    // 2. Uji Kelaparan Akut (pangan = 0 selama 2 musim beruntun)
    const starv1 = MacroEconomyCalculator.evaluateTriDefeat({
      nRebel: 10,
      nTotal: 100,
      pangan: 0,
      ancamanBandit: 10,
      currentRebelStreak: 0,
      currentStarvationStreak: 0
    });
    expect(starv1.starvationStreak).toBe(1);
    expect(starv1.isFallen).toBe(false);

    const starv2 = MacroEconomyCalculator.evaluateTriDefeat({
      nRebel: 10,
      nTotal: 100,
      pangan: 0,
      ancamanBandit: 10,
      currentRebelStreak: 0,
      currentStarvationStreak: starv1.starvationStreak
    });
    expect(starv2.starvationStreak).toBe(2);
    expect(starv2.isFallen).toBe(true);
    expect(starv2.causeOfFall).toBe("STARVATION");

    // 3. Uji Kehancuran oleh Kawanan Bandit (ancaman >= 100)
    const banditRaid = MacroEconomyCalculator.evaluateTriDefeat({
      nRebel: 5,
      nTotal: 100,
      pangan: 200,
      ancamanBandit: 100,
      currentRebelStreak: 0,
      currentStarvationStreak: 0
    });
    expect(banditRaid.isFallen).toBe(true);
    expect(banditRaid.causeOfFall).toBe("BANDIT_DESTRUCTION");
  });

  it("harus mengoperasikan BanditQTableManager dengan update Bellman & Epsilon-Greedy (TC-F1-14, FR-13)", () => {
    const qManager = new BanditQTableManager(0.2, 0.3);
    const qTable = new Map<string, number>();

    qTable.set("kingdom-A", 10.0);
    qTable.set("kingdom-B", 50.0);

    // Argmax exploitation (r >= 0.20)
    const deterministicPrng = () => 0.5;
    const target = qManager.selectTarget(["kingdom-A", "kingdom-B"], qTable, deterministicPrng);
    expect(target?.targetId).toBe("kingdom-B");
    expect(target?.mode).toBe("EXPLOITATION");

    // Bellman update: newQ = 50 + 0.3 * (100 - 50) = 65
    const updated = qManager.updateQValue("kingdom-B", 100, qTable);
    expect(updated).toBe(65.0);
    expect(qTable.get("kingdom-B")).toBe(65.0);
  });

  it("harus menangani kasus ekstrim makroekonomi (populasi 0, input negatif, pencurian ekstrem)", () => {
    const extreme = MacroEconomyCalculator.calculate({
      pangan: -50,
      emas: -10,
      pasukan: -5,
      pajak: -20,
      lumbungLv: 0,
      nKerja: -10,
      nDagang: -5,
      nCuri: 1000,
      nTotal: 0,
      etaBencana: -1.0,
      biayaTitah: -100
    });

    expect(extreme.panen).toBe(0);
    expect(extreme.konsumsi).toBe(0);
    expect(extreme.curi).toBe(0);
    expect(extreme.newPangan).toBe(0);
    expect(extreme.newEmas).toBe(0);
    expect(extreme.newPasukan).toBe(0);
    expect(extreme.isBankrupt).toBe(false);
  });
});

describe("Fase 1: Deterministic World Orchestrator (Universal 45-Second FSM)", () => {
  it("harus memetakan sub-fase deterministik 45 detik sesuai spesifikasi SDD 4.1 (TC-F1-15)", () => {
    const orchestrator = new DeterministicWorldOrchestrator("realm-alpha-1");

    expect(orchestrator.resolvePhase(0)).toBe(TickPhase.PHASE_1_DECREE);
    expect(orchestrator.resolvePhase(4)).toBe(TickPhase.PHASE_1_DECREE);
    expect(orchestrator.resolvePhase(5)).toBe(TickPhase.PHASE_2_AGENTS);
    expect(orchestrator.resolvePhase(19)).toBe(TickPhase.PHASE_2_AGENTS);
    expect(orchestrator.resolvePhase(20)).toBe(TickPhase.PHASE_3_ECOLOGY);
    expect(orchestrator.resolvePhase(29)).toBe(TickPhase.PHASE_3_ECOLOGY);
    expect(orchestrator.resolvePhase(30)).toBe(TickPhase.PHASE_4_COMBAT);
    expect(orchestrator.resolvePhase(39)).toBe(TickPhase.PHASE_4_COMBAT);
    expect(orchestrator.resolvePhase(40)).toBe(TickPhase.PHASE_5_EVALUATION);
    expect(orchestrator.resolvePhase(44)).toBe(TickPhase.PHASE_5_EVALUATION);
  });

  it("harus mengeksekusi handler tepat pada detik awal transisi fase (TC-F1-16)", async () => {
    const executedPhases: TickPhase[] = [];
    const handlers = new Map<TickPhase, (season: number, phase: TickPhase) => void>();

    for (const phase of Object.values(TickPhase)) {
      handlers.set(phase, (_season, p) => {
        executedPhases.push(p);
      });
    }

    const orchestrator = new DeterministicWorldOrchestrator("realm-beta", handlers);

    await orchestrator.stepSecond(0);  // Phase 1
    await orchestrator.stepSecond(5);  // Phase 2
    await orchestrator.stepSecond(20); // Phase 3
    await orchestrator.stepSecond(30); // Phase 4
    await orchestrator.stepSecond(40); // Phase 5

    expect(executedPhases).toEqual([
      TickPhase.PHASE_1_DECREE,
      TickPhase.PHASE_2_AGENTS,
      TickPhase.PHASE_3_ECOLOGY,
      TickPhase.PHASE_4_COMBAT,
      TickPhase.PHASE_5_EVALUATION
    ]);
  });

  it("harus memajukan musim dan menyimpulkan dunia saat mencapai maxSeasons (20) (TC-F1-17)", async () => {
    const broadcastEvents: any[] = [];
    const orchestrator = new DeterministicWorldOrchestrator(
      "realm-gamma",
      new Map(),
      (payload) => broadcastEvents.push(payload),
      { maxSeasons: 3, seasonDurationSec: 45, initialSeason: 1 }
    );

    expect(orchestrator.getCurrentSeason()).toBe(1);

    await orchestrator.stepSecond(45);
    expect(orchestrator.getCurrentSeason()).toBe(2);

    await orchestrator.stepSecond(45);
    expect(orchestrator.getCurrentSeason()).toBe(3);

    await orchestrator.stepSecond(45);
    expect(orchestrator.isEnded()).toBe(true);

    const concludedEvent = broadcastEvents.find((e) => e.event === "REALM_CONCLUDED");
    expect(concludedEvent).toBeDefined();
    expect(concludedEvent.worldId).toBe("realm-gamma");
  });

  it("harus memancarkan event SEASON_TICK_COUNTDOWN dan memperbarui getState() secara akurat (TC-F1-18 & BUG-003 Fix)", async () => {
    const broadcastEvents: any[] = [];
    const orchestrator = new DeterministicWorldOrchestrator(
      "realm-delta",
      new Map(),
      (payload) => broadcastEvents.push(payload)
    );

    // Langkah ke detik ke-12 (PHASE_2_AGENTS: detik 5 - 20)
    const state = await orchestrator.stepSecond(12);

    expect(state.secondInSeason).toBe(12);
    expect(state.currentPhase).toBe(TickPhase.PHASE_2_AGENTS);
    expect(state.secondsRemainingInSeason).toBe(33); // 45 - 12
    expect(state.phaseElapsedMs).toBe(7000); // (12 - 5) * 1000

    // Periksa bahwa getState() mengembalikan data identik, bukan hardcoded detik 0
    const fetchedState = orchestrator.getState();
    expect(fetchedState.secondInSeason).toBe(12);
    expect(fetchedState.currentPhase).toBe(TickPhase.PHASE_2_AGENTS);
    expect(fetchedState.secondsRemainingInSeason).toBe(33);
    expect(fetchedState.phaseElapsedMs).toBe(7000);

    const countdown = broadcastEvents.find((e) => e.event === "SEASON_TICK_COUNTDOWN");
    expect(countdown).toBeDefined();
    expect(countdown.worldId).toBe("realm-delta");
    expect(countdown.currentSeason).toBe(1);
    expect(countdown.activePhase).toBe(TickPhase.PHASE_2_AGENTS);
    expect(countdown.secondInSeason).toBe(12);
    expect(countdown.secondsRemainingInSeason).toBe(33);
    expect(countdown.phaseElapsedMs).toBe(7000);
  });

  it("harus mengeksekusi advanceFullSeason() melintasi musim dengan benar", async () => {
    const orchestrator = new DeterministicWorldOrchestrator(
      "realm-advance",
      new Map(),
      () => {},
      { maxSeasons: 5, seasonDurationSec: 45, initialSeason: 1 }
    );

    expect(orchestrator.getCurrentSeason()).toBe(1);
    await orchestrator.advanceFullSeason();
    expect(orchestrator.getCurrentSeason()).toBe(2);
    await orchestrator.advanceFullSeason();
    expect(orchestrator.getCurrentSeason()).toBe(3);
  });

  it("harus menghitung getPhaseStartSecond untuk seluruh 5 fase", () => {
    expect(getPhaseStartSecond(TickPhase.PHASE_1_DECREE)).toBe(0);
    expect(getPhaseStartSecond(TickPhase.PHASE_2_AGENTS)).toBe(5);
    expect(getPhaseStartSecond(TickPhase.PHASE_3_ECOLOGY)).toBe(20);
    expect(getPhaseStartSecond(TickPhase.PHASE_4_COMBAT)).toBe(30);
    expect(getPhaseStartSecond(TickPhase.PHASE_5_EVALUATION)).toBe(40);
  });
});

describe("Fase 1: Layanan Reinkarnasi Dinasti, Skor Warisan & Faksi (SDD 4.7)", () => {
  it("harus mengevaluasi TriDefeatEvaluator secara akurat sesuai SDD Bab 4.7 A", () => {
    const resNormal = TriDefeatEvaluator.evaluate({
      rebelRatio: 0.1,
      pangan: 100,
      ancamanBandit: 10,
      prevRebelStreak: 0,
      prevStarvationStreak: 0
    });
    expect(resNormal.isFallen).toBe(false);
    expect(resNormal.causeOfFall).toBeNull();
    expect(resNormal.newRebelStreak).toBe(0);
    expect(resNormal.newStarvationStreak).toBe(0);

    // Kudeta streak 2
    const resCoup = TriDefeatEvaluator.evaluate({
      rebelRatio: 0.45,
      pangan: 100,
      ancamanBandit: 10,
      prevRebelStreak: 1,
      prevStarvationStreak: 0
    });
    expect(resCoup.isFallen).toBe(true);
    expect(resCoup.causeOfFall).toBe("COUP_DETAT");
    expect(resCoup.newRebelStreak).toBe(2);
  });

  it("harus menghitung Skor Warisan & Ancestral Karma Points (DynasticLegacyService, FR-21)", () => {
    // 10 seasons survived, peak satisfaction 85.5%, 200 emas
    // Legacy Score = (10 * 100) + round(85.5 * 10) + (200 * 2) = 1000 + 855 + 400 = 2255
    // Karma Points = floor(2255 / 500) = 4
    const score = DynasticLegacyService.calculateScore(10, 85.5, 200);
    expect(score.legacyScore).toBe(2255);
    expect(score.karmaPoints).toBe(4);
  });

  it("harus menyelesaikan penyerapan teritorial ke tetangga dengan kepuasan tertinggi (TerritoryAnnexationService, FR-24)", () => {
    const candidates = [
      { id: "k-fallen", name: "Wanua Roboh", kepuasan: 10, pangan: 50, emas: 30, isFallen: true },
      { id: "k-alpha", name: "Wanua Subur", kepuasan: 80, pangan: 100, emas: 50, isFallen: false },
      { id: "k-beta", name: "Wanua Damai", kepuasan: 90, pangan: 200, emas: 100, isFallen: false }
    ];

    const result = TerritoryAnnexationService.resolveAnnexation("k-fallen", 50, 30, candidates);
    expect(result.winnerKingdomId).toBe("k-beta"); // Kepuasan 90 > 80
    expect(result.absorbedPangan).toBe(50);
    expect(result.absorbedEmas).toBe(30);

    // Kasus tanpa tetangga aktif
    const noNeighbors = TerritoryAnnexationService.resolveAnnexation("k-fallen", 50, 30, [candidates[0]]);
    expect(noNeighbors.winnerKingdomId).toBeNull();
    expect(noNeighbors.absorbedPangan).toBe(0);
  });

  it("harus menghasilkan dialog dan mood faksi yang sesuai kondisi alam & rakyat (FactionVoiceSynthesizer, FR-23)", () => {
    // Skenario: Rakyat makmur (welfare 0.8), Alam harmonis (harmony 85), Bandit waspada (ancaman 20)
    const voicesHappy = FactionVoiceSynthesizer.generateVoices(0.8, 85, 20);
    expect(voicesHappy.kiWiro.mood).toBe("PUAS");
    expect(voicesHappy.nyaiSendang.mood).toBe("HARMONIS");
    expect(voicesHappy.siGarang.mood).toBe("WASPADA");

    // Skenario krisis: Rakyat sengsara (welfare 0.2), Alam murka (harmony 30), Bandit agresif (ancaman 80)
    const voicesCrisis = FactionVoiceSynthesizer.generateVoices(0.2, 30, 80);
    expect(voicesCrisis.kiWiro.mood).toBe("MARAH");
    expect(voicesCrisis.nyaiSendang.mood).toBe("MURKA");
    expect(voicesCrisis.siGarang.mood).toBe("AGRESIF");
  });
});
