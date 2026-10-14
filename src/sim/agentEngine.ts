/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Multi-Agent Behavior ECS Simulation Engine
 * Reference: doc/SDD.md Section 4.2 & doc/SRS.md FR-08, FR-09, FR-10
 *
 * Implements linear contiguous typed arrays for zero GC allocation per tick
 * and SIMD-friendly 6x6 utility weight dot-product evaluations.
 */

export const AgentAction = {
  BEKERJA: 0,
  BERDAGANG: 1,
  MENGELUH: 2,
  MENCURI: 3,
  MENGUNGSI: 4,
  MEMBERONTAK: 5
} as const;

export type AgentActionType = (typeof AgentAction)[keyof typeof AgentAction];

export const AgentRole = {
  PETANI: 0,
  PEDAGANG: 1,
  PENGRAJIN: 2,
  PRAJURIT: 3
} as const;

export type AgentRoleType = (typeof AgentRole)[keyof typeof AgentRole];

export interface ECSAgentPoolConfig {
  maxAgents: number; // Kapasitas maksimum agen per realm (misal: 10.000)
}

/**
 * AgentMemoryPool mengalokasikan seluruh state agen dalam struktur kontigu
 * berbasis Float32Array dan Int32Array/Int8Array demi mencegah GC pressure.
 */
export class AgentMemoryPool {
  public readonly count: number;

  // Komponen Psikologis Dinamis [0.0, 1.0]
  public readonly lapar: Float32Array;
  public readonly aman: Float32Array;
  public readonly adil: Float32Array;
  public readonly trust: Float32Array;

  // Komponen Genetik Statis [0.0, 1.0]
  public readonly serakah: Float32Array;
  public readonly berani: Float32Array;
  public readonly etosKerja: Float32Array;

  // Komponen Aksi & Relasi
  public readonly kingdomIdIndex: Int32Array;
  public readonly currentAction: Int8Array; // 0..5 (AgentAction)
  public readonly role: Int8Array;          // 0..3 (AgentRole)

  constructor(maxAgents: number) {
    this.count = maxAgents;
    this.lapar = new Float32Array(maxAgents);
    this.aman = new Float32Array(maxAgents);
    this.adil = new Float32Array(maxAgents);
    this.trust = new Float32Array(maxAgents);

    this.serakah = new Float32Array(maxAgents);
    this.berani = new Float32Array(maxAgents);
    this.etosKerja = new Float32Array(maxAgents);

    this.kingdomIdIndex = new Int32Array(maxAgents);
    this.currentAction = new Int8Array(maxAgents);
    this.role = new Int8Array(maxAgents);
  }

  /**
   * Mengisi data agen ke index tertentu dengan validasi batas
   */
  public setAgent(
    index: number,
    data: {
      lapar?: number;
      aman?: number;
      adil?: number;
      trust?: number;
      serakah?: number;
      berani?: number;
      etosKerja?: number;
      kingdomIdIndex?: number;
      currentAction?: number;
      role?: number;
    }
  ): void {
    if (index < 0 || index >= this.count) {
      throw new RangeError(`Index agent ${index} berada di luar batas pool (${this.count})`);
    }

    if (data.lapar !== undefined) this.lapar[index] = data.lapar;
    if (data.aman !== undefined) this.aman[index] = data.aman;
    if (data.adil !== undefined) this.adil[index] = data.adil;
    if (data.trust !== undefined) this.trust[index] = data.trust;
    if (data.serakah !== undefined) this.serakah[index] = data.serakah;
    if (data.berani !== undefined) this.berani[index] = data.berani;
    if (data.etosKerja !== undefined) this.etosKerja[index] = data.etosKerja;
    if (data.kingdomIdIndex !== undefined) this.kingdomIdIndex[index] = data.kingdomIdIndex;
    if (data.currentAction !== undefined) this.currentAction[index] = data.currentAction;
    if (data.role !== undefined) this.role[index] = data.role;
  }
}

/**
 * Matriks Bobot Utilitas Aksi W in R^{6x6}
 * Sesuai spesifikasi doc/SDD.md Bab 4.2 Bagian B & FR-10
 * Baris: [Bekerja, Berdagang, Mengeluh, Mencuri, Mengungsi, Memberontak]
 * Kolom: [lapar, 1-aman, 1-adil, serakah, berani, 1-trust]
 */
export const UTILITY_WEIGHT_MATRIX = new Float32Array([
  // Lapar, 1-Aman, 1-Adil, Serakah, Berani, 1-Trust
  -0.5,   0.4,    0.3,    -0.2,   -0.1,    0.6,   // Aksi 0: Bekerja
  -0.2,   0.5,    0.2,     0.7,    0.2,    0.3,   // Aksi 1: Berdagang
   0.3,   0.2,    0.8,     0.1,   -0.3,    0.5,   // Aksi 2: Mengeluh
   0.8,   0.6,    0.2,     0.9,    0.3,    0.4,   // Aksi 3: Mencuri
   0.4,   0.9,    0.5,    -0.3,   -0.8,    0.6,   // Aksi 4: Mengungsi
   0.5,   0.4,    0.9,     0.2,    0.9,    0.8    // Aksi 5: Memberontak
]);

export interface PsychologyUpdateParams {
  panganKerajaan: number;
  totalAgents: number;
  pasukanKerajaan: number;
  ancamanBandit: number;
  pajak: number;
  efekKeadilanTitah: number;
  janjiTitah: number;
}

export interface EvaluationResult {
  counts: number[];
  avgSatisfaction: number;
}

export class AgentUtilityEvaluationSystem {
  /**
   * Evaluasi deterministik seluruh aksi agen menggunakan dot product matriks bobot
   * Memastikan zero dynamic allocation dalam loop komputasi per agen.
   *
   * @param pool Memory pool agen
   * @param activeCount Jumlah agen aktif yang dievaluasi
   * @param seed Seed PRNG Mulberry32 untuk determinisme
   * @param reusableCounts Buffer array opsional untuk menampung hitungan aksi tanpa alokasi baru
   */
  public static evaluateAllAgents(
    pool: AgentMemoryPool,
    activeCount: number,
    seed: number,
    reusableCounts?: number[]
  ): EvaluationResult {
    const W = UTILITY_WEIGHT_MATRIX;
    const actionCounts = reusableCounts ?? [0, 0, 0, 0, 0, 0];
    if (reusableCounts) {
      actionCounts[0] = 0;
      actionCounts[1] = 0;
      actionCounts[2] = 0;
      actionCounts[3] = 0;
      actionCounts[4] = 0;
      actionCounts[5] = 0;
    }

    const safeActiveCount = Math.max(0, Math.min(pool.count, activeCount));
    if (safeActiveCount === 0) {
      return { counts: actionCounts, avgSatisfaction: 0 };
    }

    let totalSatisfaction = 0.0;
    let s = seed | 0;

    for (let i = 0; i < safeActiveCount; i++) {
      const lapar = pool.lapar[i];
      const invAman = 1.0 - pool.aman[i];
      const invAdil = 1.0 - pool.adil[i];
      const serakah = pool.serakah[i];
      const berani = pool.berani[i];
      const invTrust = 1.0 - pool.trust[i];

      // Kesejahteraan Subjektif = 1.0 - (0.40 * lapar + 0.30 * invAman + 0.30 * invAdil)
      const welfare = 1.0 - (0.40 * lapar + 0.30 * invAman + 0.30 * invAdil);
      totalSatisfaction += welfare;

      let bestAction = 0;
      let maxUtility = -Infinity;

      for (let k = 0; k < 6; k++) {
        const offset = k * 6;
        // Dot Product Evaluator
        const u =
          W[offset + 0] * lapar +
          W[offset + 1] * invAman +
          W[offset + 2] * invAdil +
          W[offset + 3] * serakah +
          W[offset + 4] * berani +
          W[offset + 5] * invTrust;

        // Deterministic Pseudo-Random Generator (Mulberry32 PRNG noise)
        s = (s + 0x6D2B79F5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        const noise = ((t >>> 0) / 4294967296 - 0.5) * 0.04;

        const totalU = u + noise;
        if (totalU > maxUtility) {
          maxUtility = totalU;
          bestAction = k;
        }
      }

      pool.currentAction[i] = bestAction;
      actionCounts[bestAction]++;
    }

    return {
      counts: actionCounts,
      avgSatisfaction: (totalSatisfaction / safeActiveCount) * 100
    };
  }

  /**
   * Pembaruan Status Psikologis Kontigu (FR-08 & FR-09)
   * Mengeksekusi mutasi vektor kebutuhan psikologis agen secara deterministik
   * berdasarkan rasio pangan, garnisun militer, ancaman bandit, titah, dan tarif pajak.
   */
  public static updateAgentPsychology(
    pool: AgentMemoryPool,
    activeCount: number,
    params: PsychologyUpdateParams
  ): void {
    const safeActiveCount = Math.max(0, Math.min(pool.count, activeCount));
    if (safeActiveCount === 0) return;

    const safeTotalAgents = Math.max(1, params.totalAgents);
    const safePangan = Math.max(0, params.panganKerajaan);
    const safePasukan = Math.max(0, params.pasukanKerajaan);
    const safeAncaman = Math.max(0, Math.min(100.0, params.ancamanBandit));
    const safePajak = Math.max(0, Math.min(50, params.pajak));
    const safeKeadilan = Math.max(-1.0, Math.min(1.0, params.efekKeadilanTitah));
    const safeJanji = Math.max(0.0, Math.min(1.0, params.janjiTitah));

    // 1. Rasio Kecukupan Pangan: P_rasio = min(1.0, Pangan / (2.0 * N))
    const pRasio = Math.min(1.0, safePangan / (2.0 * safeTotalAgents));

    // 2. Rasio Kehadiran Militer: R_militer = min(1.0, Pasukan / (0.40 * N))
    const rMiliter = Math.min(1.0, safePasukan / (0.40 * safeTotalAgents));

    // 3. Penalti Pajak Kuadratik Eksponensial (FR-08): ((max(0, pajak - 20)) / 10)^2
    const penaltiPajak = Math.pow(Math.max(0, safePajak - 20) / 10.0, 2);

    for (let i = 0; i < safeActiveCount; i++) {
      // Pembaruan Rasa Lapar: lapar(t+1) = clamp[0,1](lapar + 0.15 - 0.30 * P_rasio)
      const newLapar = pool.lapar[i] + 0.15 - 0.30 * pRasio;
      pool.lapar[i] = newLapar < 0.0 ? 0.0 : newLapar > 1.0 ? 1.0 : newLapar;

      // Pembaruan Rasa Aman: aman(t+1) = clamp[0,1](aman + 0.12 * R_militer - 0.15 * (Ancaman / 100))
      const newAman = pool.aman[i] + 0.12 * rMiliter - 0.15 * (safeAncaman / 100.0);
      pool.aman[i] = newAman < 0.0 ? 0.0 : newAman > 1.0 ? 1.0 : newAman;

      // Pembaruan Persepsi Keadilan: adil(t+1) = clamp[0,1](adil + 0.25 * EfekKeadilan - 0.05 * PenaltiPajak)
      const newAdil = pool.adil[i] + 0.25 * safeKeadilan - 0.05 * penaltiPajak;
      pool.adil[i] = newAdil < 0.0 ? 0.0 : newAdil > 1.0 ? 1.0 : newAdil;

      // Pembaruan Kepercayaan Sosial: trust(t+1) = clamp[0,1](trust + 0.20 * (Janji - trust))
      const newTrust = pool.trust[i] + 0.20 * (safeJanji - pool.trust[i]);
      pool.trust[i] = newTrust < 0.0 ? 0.0 : newTrust > 1.0 ? 1.0 : newTrust;
    }
  }
}
