/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Macroeconomy Calculator & Bankruptcy Enforcement
 * Reference: doc/SDD.md Section 4.8 & doc/SRS.md FR-11, FR-08, UC-09
 *
 * Implements macroeconomic dynamic balance:
 * 1. Panen: N_kerja * 2.5 * eta_bencana
 * 2. Konsumsi: N_total * 1.0
 * 3. Pencurian: min(pangan, round(N_curi * 1.5))
 * 4. Kapasitas Lumbung: 500 * max(1, lumbungLv)
 * 5. Omzet Pasar: N_dagang * 4.0
 * 6. Pajak Emas: round(omzetPasar * (pajak/100) + N_kerja * 1.0 * (pajak/100))
 * 7. Gaji Militer: pasukan * 1.0
 * 8. Evaluasi Kebangkrutan: jika kas tidak cukup membayar total beban (gaji + titah + jarahan),
 *    kas di-reset ke 0 dan terjadi desersi seketika 20% pasukan (pasukan * 0.80).
 */

import { TriDefeatEvaluator } from "./dynastyEngine.js";

export interface MacroEconomyInput {
  pangan: number;
  emas: number;
  pasukan: number;
  pajak: number;             // Tarif pajak dalam persen [0..50]
  lumbungLv: number;         // Level lumbung (default 1)
  nKerja: number;            // Jumlah agen yang bekerja
  nDagang: number;           // Jumlah agen yang berdagang
  nCuri: number;             // Jumlah agen yang mencuri
  nTotal: number;            // Total populasi warga
  etaBencana: number;        // Efisiensi ekologi: 0.70 saat bencana/paceklik, 1.00 normal
  biayaTitah: number;        // Biaya kas yang dikeluarkan untuk titah di musim ini
  jarahanPangan?: number;    // Pangan yang terjarah oleh serangan luar/bandit
  jarahanEmas?: number;      // Emas yang terjarah oleh serangan luar/bandit
}

export interface MacroEconomyOutput {
  panen: number;
  konsumsi: number;
  curi: number;
  newPangan: number;
  omzetPasar: number;
  pajakEmas: number;
  gajiMiliter: number;
  newEmas: number;
  newPasukan: number;
  isBankrupt: boolean;
}

export interface TriDefeatEvaluationInput {
  nRebel: number;
  nTotal: number;
  pangan: number;
  ancamanBandit: number;
  currentRebelStreak: number;
  currentStarvationStreak: number;
}

export interface TriDefeatEvaluationOutput {
  rebelStreak: number;
  starvationStreak: number;
  isFallen: boolean;
  causeOfFall: "COUP_DETAT" | "STARVATION" | "BANDIT_DESTRUCTION" | null;
}

export class MacroEconomyCalculator {
  /**
   * Menghitung dinamika neraca makroekonomi per musim secara deterministik
   * Melindungi kalkulasi dengan sanitasi defensif terhadap input negatif dan pembagian nol.
   */
  public static calculate(input: MacroEconomyInput): MacroEconomyOutput {
    const safeNKerja = Math.max(0, input.nKerja);
    const safeNDagang = Math.max(0, input.nDagang);
    const safeNCuri = Math.max(0, input.nCuri);
    const safeNTotal = Math.max(0, input.nTotal);
    const safeEtaBencana = Math.max(0, input.etaBencana);
    const safePangan = Math.max(0, input.pangan);
    const safeEmas = Math.max(0, input.emas);
    const safePasukan = Math.max(0, input.pasukan);
    const safePajak = Math.max(0, Math.min(50, input.pajak));
    const safeBiayaTitah = Math.max(0, input.biayaTitah);
    const jarahanPangan = Math.max(0, input.jarahanPangan ?? 0);
    const jarahanEmas = Math.max(0, input.jarahanEmas ?? 0);

    // 1. Produksi Panen Makro: round(N_kerja * 2.5 * eta_bencana)
    const panen = Math.round(safeNKerja * 2.5 * safeEtaBencana);

    // 2. Konsumsi Warga & Pencurian Lumbung: N_total * 1.0 & round(N_curi * 1.5)
    const konsumsi = Math.round(safeNTotal * 1.0);
    const curi = Math.min(safePangan, Math.round(safeNCuri * 1.5));
    const maxLumbung = 500 * Math.max(1, input.lumbungLv);

    // 3. Neraca Cadangan Pangan Terklem
    const netPangan = safePangan + panen - konsumsi - curi - jarahanPangan;
    const newPangan = Math.max(0, Math.min(maxLumbung, netPangan));

    // 4. Sirkulasi Pasar & Retribusi Pajak Kas
    const omzetPasar = safeNDagang * 4.0;
    const pajakEmas = Math.round(
      omzetPasar * (safePajak / 100.0) + safeNKerja * 1.0 * (safePajak / 100.0)
    );

    // 5. Beban Penggajian Militer & Evaluasi Kebangkrutan
    const gajiMiliter = Math.round(safePasukan * 1.0);
    const totalBebanEmas = gajiMiliter + safeBiayaTitah + jarahanEmas;

    let newEmas = safeEmas + pajakEmas;
    let newPasukan = safePasukan;
    let isBankrupt = false;

    if (newEmas >= totalBebanEmas) {
      newEmas -= totalBebanEmas;
    } else {
      // Penalti Kebangkrutan Kas: Kas diset 0, 20% prajurit desersi
      isBankrupt = true;
      newEmas = 0;
      newPasukan = Math.round(safePasukan * 0.80);
    }

    return {
      panen,
      konsumsi,
      curi,
      newPangan,
      omzetPasar,
      pajakEmas,
      gajiMiliter,
      newEmas,
      newPasukan,
      isBankrupt
    };
  }

  /**
   * Evaluasi Mekanik Tri-Defeat (Kudeta Rakyat, Kelaparan Akut, Serbuan Bandit)
   * Mendelegasikan ke TriDefeatEvaluator (SDD 4.7) demi kepatuhan hierarki mutlak.
   */
  public static evaluateTriDefeat(input: TriDefeatEvaluationInput): TriDefeatEvaluationOutput {
    const safeTotal = Math.max(1, input.nTotal);
    const rebelRatio = Math.max(0, input.nRebel) / safeTotal;

    const result = TriDefeatEvaluator.evaluate({
      rebelRatio,
      pangan: input.pangan,
      ancamanBandit: input.ancamanBandit,
      prevRebelStreak: input.currentRebelStreak,
      prevStarvationStreak: input.currentStarvationStreak
    });

    return {
      rebelStreak: result.newRebelStreak,
      starvationStreak: result.newStarvationStreak,
      isFallen: result.isFallen,
      causeOfFall: result.causeOfFall
    };
  }
}

/**
 * Faksi Bandit Si Garang Epsilon-Greedy Q-Learning (SDD Bab 4.8 B & FR-13)
 */
export class BanditQTableManager {
  private readonly epsilon: number; // 0.20
  private readonly alpha: number;   // 0.30 laju belajar

  constructor(epsilon: number = 0.20, alpha: number = 0.30) {
    this.epsilon = epsilon;
    this.alpha = alpha;
  }

  public selectTarget(
    kingdomIds: string[],
    qTable: Map<string, number>,
    prng: () => number = Math.random
  ): { targetId: string; mode: "EXPLORATION" | "EXPLOITATION" } | null {
    if (kingdomIds.length === 0) return null;

    const r = prng();
    if (r < this.epsilon) {
      // 20% Eksplorasi: Memilih kerajaan acak
      const rawIdx = Math.floor(prng() * kingdomIds.length);
      const randomIndex = Math.min(kingdomIds.length - 1, Math.max(0, rawIdx));
      return { targetId: kingdomIds[randomIndex], mode: "EXPLORATION" };
    } else {
      // 80% Eksploitasi: Memilih target dengan estimasi jarahan tertinggi (argmax Q)
      let bestTarget = kingdomIds[0];
      let maxQ = -Infinity;

      for (const kId of kingdomIds) {
        const qVal = qTable.get(kId) ?? 0.0;
        if (qVal > maxQ) {
          maxQ = qVal;
          bestTarget = kId;
        }
      }
      return { targetId: bestTarget, mode: "EXPLOITATION" };
    }
  }

  public updateQValue(
    targetId: string,
    actualLoot: number,
    qTable: Map<string, number>
  ): number {
    const currentQ = qTable.get(targetId) ?? 0.0;
    // Persamaan Bellman Q-Learning Update: Q_new = Q_old + alpha * (R - Q_old)
    const newQ = currentQ + this.alpha * (actualLoot - currentQ);
    const roundedQ = Number(newQ.toFixed(2));
    qTable.set(targetId, roundedQ);
    return roundedQ;
  }
}
