/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Military Battle & PvP Combat Resolution Service (FR-12, FR-19, SDD Bab 4.5)
 *
 * Implements:
 * 1. Attack strength F_atk vs defense strength F_def with uniform random xi in [-0.10, +0.10].
 * 2. Pos Ronda mitigation (+20% per level) and allied support (+50% troops).
 * 3. Strict Solitary Attack Forbidden and Friendly Fire Prohibited rules.
 * 4. Casualties calculation and survivor quota looting (max 5 food / 3 gold per surviving attacker).
 */

export interface CombatOrderInput {
  attackerKingdomId: string;
  defenderKingdomId: string;
  attackerTroops: number;
  defenderTroops: number;
  posRondaLv: number;
  alliedHelpTroops: number;
  isAttackerOnsiteVerified: boolean;
  areSameAlliance: boolean;
  panganDef: number;
  emasDef: number;
  prng?: () => number;
}

export interface CombatResolutionResult {
  status: "SUCCESS" | "REPELLED";
  fAtk: number;
  fDef: number;
  gugurAtk: number;
  gugurDef: number;
  survivorsAtk: number;
  survivorsDef: number;
  jarahanPangan: number;
  jarahanEmas: number;
  rejectionReason?: "SOLITARY_ATTACK_FORBIDDEN" | "FRIENDLY_FIRE_PROHIBITED";
}

export class CombatWarService {
  public static resolve(input: CombatOrderInput): CombatResolutionResult {
    const attackerTroops = Math.max(0, Math.floor(Number(input.attackerTroops) || 0));
    const defenderTroops = Math.max(0, Math.floor(Number(input.defenderTroops) || 0));
    const posRondaLv = Math.max(0, Math.floor(Number(input.posRondaLv) || 0));
    const alliedHelpTroops = Math.max(0, Math.floor(Number(input.alliedHelpTroops) || 0));
    const panganDef = Math.max(0, Math.floor(Number(input.panganDef) || 0));
    const emasDef = Math.max(0, Math.floor(Number(input.emasDef) || 0));

    // 1. Validasi Hak Istimewa Aliansi Onsite (FR-19: Solitary players cannot launch attacks)
    if (!input.isAttackerOnsiteVerified) {
      return {
        status: "REPELLED",
        fAtk: 0,
        fDef: 0,
        gugurAtk: 0,
        gugurDef: 0,
        survivorsAtk: attackerTroops,
        survivorsDef: defenderTroops,
        jarahanPangan: 0,
        jarahanEmas: 0,
        rejectionReason: "SOLITARY_ATTACK_FORBIDDEN"
      };
    }

    // 2. Proteksi Friendly Fire Aliansi (FR-19: Cannot attack ally)
    if (input.areSameAlliance) {
      return {
        status: "REPELLED",
        fAtk: 0,
        fDef: 0,
        gugurAtk: 0,
        gugurDef: 0,
        survivorsAtk: attackerTroops,
        survivorsDef: defenderTroops,
        jarahanPangan: 0,
        jarahanEmas: 0,
        rejectionReason: "FRIENDLY_FIRE_PROHIBITED"
      };
    }

    // 3. Batas Minimal Pasukan Serang
    if (attackerTroops < 10) {
      throw new Error("MINIMUM_10_TROOPS_REQUIRED");
    }

    const prng = input.prng ?? Math.random;
    // Variasi acak seragam [-0.10, +0.10]
    const xiAtk = (prng() - 0.5) * 0.20;
    const xiDef = (prng() - 0.5) * 0.20;

    const fAtk = attackerTroops * (1.0 + xiAtk);
    const fDef =
      (defenderTroops * (1.0 + 0.20 * posRondaLv) +
        0.50 * alliedHelpTroops) *
      (1.0 + xiDef);

    if (fAtk > fDef) {
      // Penyerang Menang (SUCCESS)
      const ratio = Math.min(1.0, fDef / fAtk);
      const gugurAtk = Math.min(
        input.attackerTroops,
        Math.round(input.attackerTroops * 0.20 * ratio)
      );
      const gugurDef = Math.min(
        input.defenderTroops,
        Math.round(input.defenderTroops * 0.40)
      );
      const survivorsAtk = Math.max(0, input.attackerTroops - gugurAtk);
      const survivorsDef = Math.max(0, input.defenderTroops - gugurDef);

      const maxPanganLoot = Math.round(0.30 * panganDef);
      const maxEmasLoot = Math.round(0.25 * emasDef);

      const jarahanPangan = Math.min(maxPanganLoot, survivorsAtk * 5);
      const jarahanEmas = Math.min(maxEmasLoot, survivorsAtk * 3);

      return {
        status: "SUCCESS",
        fAtk: Number(fAtk.toFixed(2)),
        fDef: Number(fDef.toFixed(2)),
        gugurAtk,
        gugurDef,
        survivorsAtk,
        survivorsDef,
        jarahanPangan,
        jarahanEmas
      };
    } else {
      // Penyerang Terpukul Mundur (REPELLED)
      const gugurAtk = Math.min(
        input.attackerTroops,
        Math.round(input.attackerTroops * 0.50)
      );
      const gugurDef = Math.min(
        input.defenderTroops,
        Math.round(input.defenderTroops * 0.15)
      );
      const survivorsAtk = Math.max(0, input.attackerTroops - gugurAtk);
      const survivorsDef = Math.max(0, input.defenderTroops - gugurDef);

      return {
        status: "REPELLED",
        fAtk: Number(fAtk.toFixed(2)),
        fDef: Number(fDef.toFixed(2)),
        gugurAtk,
        gugurDef,
        survivorsAtk,
        survivorsDef,
        jarahanPangan: 0,
        jarahanEmas: 0
      };
    }
  }
}
