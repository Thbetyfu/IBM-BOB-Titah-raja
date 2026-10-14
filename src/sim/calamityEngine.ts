/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Calamity & Boss Naga Banjir Engine (FR-14, FR-15, SDD Bab 4.6)
 *
 * Implements:
 * 1. Dynamic ecological harmony decay and decree environmental response.
 * 2. Dynamic disaster probability: P = 0.05 + 0.35 * (1.0 - Harmoni / 100)^2.
 * 3. Tiered Calamity Levels:
 *    - Level 0: Serene (no damage)
 *    - Level 1: Harvest Drought (Paceklik Panen -30%)
 *    - Level 2: Flash Flood (Banjir Bandang: -30% harvest, -20% granary food, -1 pos ronda level)
 * 4. Season 20 Boss Naga Banjir FSM:
 *    - Wrath Scenario (Harmony < 50): Boss 500 HP spawn, joint alliance damage, 25% retaliation strike.
 *    - Peaceful Era Scenario (Harmony >= 50): Golden Era coronation, +100 food blessing.
 */

export interface CalamityEvaluationResult {
  newHarmony: number;
  calamityTriggered: boolean;
  calamityLevel: 0 | 1 | 2; // 0: Aman, 1: Paceklik, 2: Banjir Bandang
  panenMultiplier: number;
  panganLostRatio: number;
  posRondaLevelLoss: number;
  description: string;
}

export class CalamityAndBossEngine {
  /**
   * Evaluates seasonal ecology and determines if weather calamity occurs.
   * P = 0.05 + 0.35 * (1.0 - newHarmony / 100)^2
   */
  public static evaluateEcology(
    currentHarmony: number,
    efekLingkunganTitah: number = 0,
    prng: () => number = Math.random
  ): CalamityEvaluationResult {
    // 1. Dinamika Harmoni Alam: Decay alami -1.0 per musim + dampak titah (+10.0 per poin efek)
    const safeHarmony = Number.isFinite(currentHarmony) ? currentHarmony : 50.0;
    const safeEfek = Number.isFinite(efekLingkunganTitah) ? efekLingkunganTitah : 0.0;
    const rawHarmony = safeHarmony + (10.0 * safeEfek) - 1.0;
    const newHarmony = Math.max(0.0, Math.min(100.0, Number(rawHarmony.toFixed(2))));

    // 2. Probabilitas Bencana Ekologis Dinamis Kuadratik
    const harmonyFactor = 1.0 - (newHarmony / 100.0);
    const pBencana = 0.05 + 0.35 * (harmonyFactor * harmonyFactor);
    const r = prng();

    if (r < pBencana) {
      if (newHarmony >= 40.0) {
        // Level 1: Paceklik Panen
        return {
          newHarmony,
          calamityTriggered: true,
          calamityLevel: 1,
          panenMultiplier: 0.70,
          panganLostRatio: 0.0,
          posRondaLevelLoss: 0,
          description: "Paceklik Panen melanda wanua: hasil panen berkurang 30%."
        };
      } else {
        // Level 2: Banjir Bandang
        return {
          newHarmony,
          calamityTriggered: true,
          calamityLevel: 2,
          panenMultiplier: 0.70,
          panganLostRatio: 0.20,
          posRondaLevelLoss: 1,
          description: "Banjir Bandang menerjang: lumbung rusak -20% cadangan pangan dan Pos Ronda runtuh 1 level."
        };
      }
    }

    return {
      newHarmony,
      calamityTriggered: false,
      calamityLevel: 0,
      panenMultiplier: 1.00,
      panganLostRatio: 0.0,
      posRondaLevelLoss: 0,
      description: "Alam sendang tenteram dan harmoni terjaga."
    };
  }
}

export interface BossSeason20Evaluation {
  action: "SPAWN_BOSS" | "PEACEFUL_ERA_CONCLUDED";
  bossHp: number;
  bossName: string;
  bonusPangan: number;
}

export interface BossAttackResult {
  damageDealt: number;
  bossHpRemaining: number;
  defeated: boolean;
  retaliationCasualties: number;
}

export class BossEncounterStateMachine {
  public static readonly BOSS_NAME = "Naga Banjir Sang Hyang Tuntang";
  public static readonly INITIAL_BOSS_HP = 500;

  private bossHp: number;
  private readonly maxHp: number;
  private isSpawned: boolean = false;
  private isDefeated: boolean = false;

  constructor(initialHp: number = BossEncounterStateMachine.INITIAL_BOSS_HP) {
    this.bossHp = initialHp;
    this.maxHp = initialHp;
  }

  public getBossHp(): number {
    return this.bossHp;
  }

  public getMaxHp(): number {
    return this.maxHp;
  }

  public isBossSpawned(): boolean {
    return this.isSpawned;
  }

  public isBossDefeated(): boolean {
    return this.isDefeated;
  }

  /**
   * Evaluates realm condition at the beginning of Season 20.
   */
  public evaluateSeason20(averageHarmony: number): BossSeason20Evaluation {
    const safeHarmony = Number.isFinite(averageHarmony) ? averageHarmony : 0.0;
    if (safeHarmony < 50.0) {
      this.isSpawned = true;
      this.isDefeated = false;
      this.bossHp = this.maxHp;
      return {
        action: "SPAWN_BOSS",
        bossHp: this.bossHp,
        bossName: BossEncounterStateMachine.BOSS_NAME,
        bonusPangan: 0
      };
    } else {
      this.isSpawned = false;
      this.isDefeated = false;
      this.bossHp = 0;
      return {
        action: "PEACEFUL_ERA_CONCLUDED",
        bossHp: 0,
        bossName: BossEncounterStateMachine.BOSS_NAME,
        bonusPangan: 100
      };
    }
  }

  /**
   * Processes a coordinated alliance strike against the spawned Boss.
   */
  public processAllianceAttack(
    alliedTroopsTotal: number,
    prng: () => number = Math.random
  ): BossAttackResult {
    const safeTroops = Math.max(0, Math.floor(Number(alliedTroopsTotal) || 0));
    if (!this.isSpawned || this.isDefeated || this.bossHp <= 0 || safeTroops <= 0) {
      return {
        damageDealt: 0,
        bossHpRemaining: this.bossHp,
        defeated: this.isDefeated || this.bossHp <= 0,
        retaliationCasualties: 0
      };
    }

    // Variasi acak seragam damage [-0.05, +0.05] sesuai PRD Bab 5.6 (xi_boss ~ U(-0.05, +0.05))
    const xi = (prng() - 0.5) * 0.10;
    const damage = Math.max(1, Math.round(safeTroops * 1.5 * (1.0 + xi)));
    this.bossHp = Math.max(0, this.bossHp - damage);

    if (this.bossHp === 0) {
      this.isDefeated = true;
    }

    // Balasan semburan air naga: 25% pasukan sekutu gugur
    const retaliationCasualties = Math.min(
      safeTroops,
      Math.round(safeTroops * 0.25)
    );

    return {
      damageDealt: damage,
      bossHpRemaining: this.bossHp,
      defeated: this.isDefeated,
      retaliationCasualties
    };
  }
}
