/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Frontier Expedition Engine & NPC Settlement Integration (FR-22, SDD Bab 4.5 C)
 *
 * Implements:
 * Resolves 3 moral doctrines of borderland expeditions:
 * 1. PILLAGE (Rampas Sumber Daya): Pangan +60, Emas +40, Harmoni -10, Kepuasan -5, Adil -0.25
 * 2. CONQUER_FORCED (Taklukkan Paksa): Pangan +40, 5 tawanan baru berani tinggi & kepercayaan rendah
 * 3. CONQUER_EMBRACED (Rangkul Asimilasi): Biaya 30 emas, 5 warga sukarela berkeadilan & kepercayaan tinggi
 */

export enum ExpeditionDoctrine {
  PILLAGE = "PILLAGE",
  CONQUER_FORCED = "CONQUER_FORCED",
  CONQUER_EMBRACED = "CONQUER_EMBRACED"
}

export interface NewAgentProfile {
  adil: number;
  trust: number;
  berani: number;
  role: string;
}

export interface ExpeditionResolutionResult {
  doctrine: ExpeditionDoctrine;
  panganDelta: number;
  emasDelta: number;
  pasukanGugur: number;
  newAgents: NewAgentProfile[];
  harmoniDelta: number;
  satisfactionDelta: number;
  generalAdilPenalty: number;
}

export class FrontierExpeditionEngine {
  public static resolve(
    doctrine: ExpeditionDoctrine,
    pasukanDikirim: number,
    emasSaatIni: number,
    prng: () => number = Math.random
  ): ExpeditionResolutionResult {
    if (pasukanDikirim < 5) {
      throw new Error("MINIMUM_5_TROOPS_REQUIRED");
    }

    switch (doctrine) {
      case ExpeditionDoctrine.PILLAGE: {
        const pasukanGugur = Math.min(pasukanDikirim, 1 + Math.floor(prng() * 3));
        return {
          doctrine,
          panganDelta: 60,
          emasDelta: 40,
          pasukanGugur,
          newAgents: [],
          harmoniDelta: -10.0,
          satisfactionDelta: -5.0,
          generalAdilPenalty: -0.25
        };
      }

      case ExpeditionDoctrine.CONQUER_FORCED: {
        const pasukanGugur = Math.min(pasukanDikirim, 1 + Math.floor(prng() * 2));
        const newAgents: NewAgentProfile[] = Array.from({ length: 5 }, () => ({
          adil: 0.1,
          trust: 0.1,
          berani: 0.7,
          role: "petani"
        }));

        return {
          doctrine,
          panganDelta: 40,
          emasDelta: 0,
          pasukanGugur,
          newAgents,
          harmoniDelta: -5.0,
          satisfactionDelta: -2.0,
          generalAdilPenalty: -0.05
        };
      }

      case ExpeditionDoctrine.CONQUER_EMBRACED: {
        if (emasSaatIni < 30) {
          throw new Error("INSUFFICIENT_GOLD_FOR_EMBRACE");
        }

        const newAgents: NewAgentProfile[] = Array.from({ length: 5 }, () => ({
          adil: 0.8,
          trust: 0.75,
          berani: 0.3,
          role: "petani"
        }));

        return {
          doctrine,
          panganDelta: 0,
          emasDelta: -30,
          pasukanGugur: 0,
          newAgents,
          harmoniDelta: 5.0,
          satisfactionDelta: 5.0,
          generalAdilPenalty: 0.0
        };
      }
    }
  }
}
