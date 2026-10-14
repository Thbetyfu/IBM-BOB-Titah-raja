/**
 * Titah Rakyat: Sovereign of the Living Realm
 * World Tick Loop Orchestrator (Universal 45-Second Season FSM)
 * Reference: doc/SDD.md Section 4.1 & doc/SRS.md FR-04, UC-04
 *
 * Implements deterministic 5-phase discrete FSM:
 * - PHASE_1_DECREE: Second 00 - 05 (Balairung Titah & AI NLP)
 * - PHASE_2_AGENTS: Second 05 - 20 (Agent Needs Evaluation & Macroeconomy)
 * - PHASE_3_ECOLOGY: Second 20 - 30 (Ecology, Disasters & Bandit Raids)
 * - PHASE_4_COMBAT: Second 30 - 40 (PvP Warfare, Expeditions & Boss Battle)
 * - PHASE_5_EVALUATION: Second 40 - 45 (Tri-Defeat, Reincarnation & Snapshot Broadcast)
 *
 * Features drift-compensated timer using process.hrtime.bigint() and
 * synchronous deterministic step runner for zero-lag test suites.
 */

export enum TickPhase {
  PHASE_1_DECREE = "PHASE_1_DECREE",         // Detik 00 - 05
  PHASE_2_AGENTS = "PHASE_2_AGENTS",         // Detik 05 - 20
  PHASE_3_ECOLOGY = "PHASE_3_ECOLOGY",       // Detik 20 - 30
  PHASE_4_COMBAT = "PHASE_4_COMBAT",         // Detik 30 - 40
  PHASE_5_EVALUATION = "PHASE_5_EVALUATION"  // Detik 40 - 45
}

export interface RealmClockState {
  worldId: string;
  currentSeason: number;
  maxSeasons: number;
  currentPhase: TickPhase;
  secondsRemainingInSeason: number;
  secondInSeason: number;
  phaseElapsedMs: number;
  isPaused: boolean;
  isConcluded: boolean;
}

export type PhaseHandler = (season: number, phase: TickPhase) => Promise<void> | void;
export type EventBroadcaster = (payload: any) => void;

export interface OrchestratorOptions {
  maxSeasons?: number;
  seasonDurationSec?: number;
  initialSeason?: number;
}

/**
 * Returns the boundary second where each phase begins within a 45-second season.
 */
export function getPhaseStartSecond(phase: TickPhase): number {
  switch (phase) {
    case TickPhase.PHASE_1_DECREE:
      return 0;
    case TickPhase.PHASE_2_AGENTS:
      return 5;
    case TickPhase.PHASE_3_ECOLOGY:
      return 20;
    case TickPhase.PHASE_4_COMBAT:
      return 30;
    case TickPhase.PHASE_5_EVALUATION:
      return 40;
  }
}

export class DeterministicWorldOrchestrator {
  private readonly seasonDurationSec: number;
  private readonly maxSeasons: number;
  private currentSeason: number;
  private currentSecondInSeason: number = 0;
  private seasonStartHrTime: bigint = process.hrtime.bigint();
  private timerHandle: NodeJS.Timeout | null = null;
  private isPaused: boolean = false;
  private isConcluded: boolean = false;
  private lastExecutedPhasePerSeason: Map<string, boolean> = new Map();

  constructor(
    public readonly worldId: string,
    private readonly phaseHandlers: Map<TickPhase, PhaseHandler> = new Map(),
    private readonly broadcaster: EventBroadcaster = () => {},
    options: OrchestratorOptions = {}
  ) {
    this.maxSeasons = options.maxSeasons ?? 20;
    this.seasonDurationSec = options.seasonDurationSec ?? 45;
    this.currentSeason = options.initialSeason ?? 1;
  }

  /**
   * Mengembalikan fase yang aktif berdasarkan detik saat ini dalam siklus musim
   */
  public resolvePhase(second: number): TickPhase {
    const sec = ((second % this.seasonDurationSec) + this.seasonDurationSec) % this.seasonDurationSec;
    if (sec < 5) return TickPhase.PHASE_1_DECREE;
    if (sec < 20) return TickPhase.PHASE_2_AGENTS;
    if (sec < 30) return TickPhase.PHASE_3_ECOLOGY;
    if (sec < 40) return TickPhase.PHASE_4_COMBAT;
    return TickPhase.PHASE_5_EVALUATION;
  }

  /**
   * Memulai timer realtime dengan kompensasi microsecond drift
   */
  public start(): void {
    if (this.isConcluded) return;
    this.isPaused = false;
    this.seasonStartHrTime = process.hrtime.bigint();
    this.scheduleNextTick();
  }

  /**
   * Menghentikan loop orkestrator
   */
  public stop(): void {
    if (this.timerHandle) {
      clearTimeout(this.timerHandle);
      this.timerHandle = null;
    }
  }

  public pause(): void {
    this.isPaused = true;
    this.stop();
  }

  public resume(): void {
    if (this.isPaused && !this.isConcluded) {
      this.start();
    }
  }

  /**
   * Jadwalkan tick berikutnya dengan kompensasi drift presisi process.hrtime.bigint()
   */
  private scheduleNextTick(): void {
    if (this.isPaused || this.isConcluded) return;

    const nowNs = process.hrtime.bigint();
    const elapsedNs = nowNs - this.seasonStartHrTime;
    let elapsedSec = Number(elapsedNs / 1_000_000_000n);

    if (elapsedSec >= this.seasonDurationSec) {
      // Transisi ke musim berikutnya
      this.currentSeason += 1;
      this.seasonStartHrTime += BigInt(this.seasonDurationSec) * 1_000_000_000n;
      this.lastExecutedPhasePerSeason.clear();

      this.broadcaster({
        event: "SEASON_COMPLETED",
        worldId: this.worldId,
        previousSeason: this.currentSeason - 1,
        newSeason: this.currentSeason
      });

      if (this.currentSeason > this.maxSeasons) {
        this.concludeRealm();
        return;
      }

      // Hitung ulang elapsedSec pada musim yang baru dimulai
      const postRolloverNs = process.hrtime.bigint() - this.seasonStartHrTime;
      elapsedSec = Math.max(0, Number(postRolloverNs / 1_000_000_000n));
    }

    const currentSecond = Math.min(this.seasonDurationSec - 1, elapsedSec % this.seasonDurationSec);
    this.currentSecondInSeason = currentSecond;
    const activePhase = this.resolvePhase(currentSecond);

    const state = this.getState();

    // Pancarkan denyut hitung mundur ke seluruh klien (1 Hz)
    this.broadcaster({
      event: "SEASON_TICK_COUNTDOWN",
      worldId: this.worldId,
      currentSeason: this.currentSeason,
      activePhase,
      secondInSeason: currentSecond,
      secondsRemainingInSeason: this.seasonDurationSec - currentSecond,
      phaseElapsedMs: state.phaseElapsedMs
    });

    // Jalankan logika fase pada detik batas pergantian fase
    void this.executePhaseLogic(activePhase, currentSecond);

    // Hitung drift kompensasi untuk interval 1 detik berikutnya
    const nextExpectedTimeNs = this.seasonStartHrTime + BigInt((currentSecond + 1) * 1_000_000_000);
    const currentNowNs = process.hrtime.bigint();
    const delayMs = Math.max(0, Number((nextExpectedTimeNs - currentNowNs) / 1_000_000n));

    this.timerHandle = setTimeout(() => {
      this.scheduleNextTick();
    }, delayMs);
  }

  /**
   * Eksekusi logika fase pada awal transisi setiap fase.
   * Setiap fase dieksekusi tepat sekali per musim saat pertama kali dimasuki.
   */
  public async executePhaseLogic(phase: TickPhase, second: number): Promise<void> {
    const phaseKey = `${this.currentSeason}_${phase}`;
    if (!this.lastExecutedPhasePerSeason.get(phaseKey)) {
      this.lastExecutedPhasePerSeason.set(phaseKey, true);

      this.broadcaster({
        event: "PHASE_TRANSITION",
        worldId: this.worldId,
        currentSeason: this.currentSeason,
        phase,
        second
      });

      const handler = this.phaseHandlers.get(phase);
      if (handler) {
        await handler(this.currentSeason, phase);
      }
    }
  }

  /**
   * Evaluasi deterministik synchronous untuk test suite tanpa menunggu 45 detik asli
   * @param second Detik dalam musim [0..44] atau detik pergantian musim [45]
   */
  public async stepSecond(second: number): Promise<RealmClockState> {
    if (this.isConcluded) return this.getState();

    const normalizedSecond = ((second % this.seasonDurationSec) + this.seasonDurationSec) % this.seasonDurationSec;
    if (second >= this.seasonDurationSec && normalizedSecond === 0) {
      this.currentSeason += 1;
      this.lastExecutedPhasePerSeason.clear();
      this.broadcaster({
        event: "SEASON_COMPLETED",
        worldId: this.worldId,
        previousSeason: this.currentSeason - 1,
        newSeason: this.currentSeason
      });
      if (this.currentSeason > this.maxSeasons) {
        this.concludeRealm();
        return this.getState();
      }
    }

    this.currentSecondInSeason = normalizedSecond;
    const activePhase = this.resolvePhase(normalizedSecond);
    await this.executePhaseLogic(activePhase, normalizedSecond);

    const state = this.getState();
    this.broadcaster({
      event: "SEASON_TICK_COUNTDOWN",
      worldId: this.worldId,
      currentSeason: this.currentSeason,
      activePhase,
      secondInSeason: normalizedSecond,
      secondsRemainingInSeason: this.seasonDurationSec - normalizedSecond,
      phaseElapsedMs: state.phaseElapsedMs
    });

    return state;
  }

  /**
   * Melangkah satu musim penuh secara instan untuk verifikasi simulasi
   */
  public async advanceFullSeason(): Promise<RealmClockState> {
    const transitionSeconds = [0, 5, 20, 30, 40];
    for (const sec of transitionSeconds) {
      await this.stepSecond(sec);
    }
    // Selesaikan detik terakhir musim berjalan
    await this.stepSecond(this.seasonDurationSec - 1);
    // Rollover ke detik ke-0 musim berikutnya
    return this.stepSecond(this.seasonDurationSec);
  }

  public concludeRealm(): void {
    this.isConcluded = true;
    this.stop();
    this.broadcaster({
      event: "REALM_CONCLUDED",
      worldId: this.worldId,
      finalSeason: this.currentSeason
    });
  }

  public getState(): RealmClockState {
    const currentPhase = this.resolvePhase(this.currentSecondInSeason);
    const phaseStartSec = getPhaseStartSecond(currentPhase);
    const phaseElapsedMs = Math.max(0, (this.currentSecondInSeason - phaseStartSec) * 1000);

    return {
      worldId: this.worldId,
      currentSeason: this.currentSeason,
      maxSeasons: this.maxSeasons,
      currentPhase,
      secondsRemainingInSeason: Math.max(0, this.seasonDurationSec - this.currentSecondInSeason),
      secondInSeason: this.currentSecondInSeason,
      phaseElapsedMs,
      isPaused: this.isPaused,
      isConcluded: this.isConcluded
    };
  }

  public getCurrentSeason(): number {
    return this.currentSeason;
  }

  public isEnded(): boolean {
    return this.isConcluded;
  }
}
