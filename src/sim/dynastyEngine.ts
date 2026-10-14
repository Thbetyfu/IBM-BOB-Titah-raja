/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Dynastic Reincarnation, Tri-Defeat Evaluation, Legacy & Annexation Subsystem
 * Reference: doc/SDD.md Section 4.7 & doc/SRS.md FR-20, FR-21, FR-23, FR-24
 *
 * Provides authoritative domain services for kingdom collapse detection,
 * generational legacy score calculation, autonomous border annexation,
 * and mood-based voice synthesis for the three realm faction spokespersons.
 */

export interface DefeatEvaluationInput {
  rebelRatio: number;        // Rasio pemberontak N_rebel / N
  pangan: number;            // Cadangan lumbung
  ancamanBandit: number;     // Indeks ancaman bandit [0, 100]
  prevRebelStreak: number;
  prevStarvationStreak: number;
}

export interface DefeatEvaluationOutput {
  isFallen: boolean;
  causeOfFall: "COUP_DETAT" | "STARVATION" | "BANDIT_DESTRUCTION" | null;
  newRebelStreak: number;
  newStarvationStreak: number;
}

/**
 * TriDefeatEvaluator enforces three non-negotiable existential collapse conditions (FR-20):
 * 1. Kudeta Rakyat: Rebel ratio > 40% across 2 consecutive seasons.
 * 2. Kelaparan Akut: Food stores exhausted (pangan <= 0) across 2 consecutive seasons.
 * 3. Serbuan Bandit: Bandit threat reaches absolute catastrophic threshold (ancamanBandit >= 100).
 * Precedence follows SDD Section 4.7: Internal popular revolt supersedes external bandit plunder.
 */
export class TriDefeatEvaluator {
  public static evaluate(input: DefeatEvaluationInput): DefeatEvaluationOutput {
    // Clamping streaks and ratios defensively to prevent negative counters
    const safePrevRebel = Math.max(0, input.prevRebelStreak);
    const safePrevStarv = Math.max(0, input.prevStarvationStreak);

    // 1. Streak updates
    const newRebelStreak = input.rebelRatio > 0.40 ? safePrevRebel + 1 : 0;
    const newStarvationStreak = input.pangan <= 0 ? safePrevStarv + 1 : 0;

    // 2. Hierarchical evaluation matching SDD Section 4.7
    if (newRebelStreak >= 2) {
      return { isFallen: true, causeOfFall: "COUP_DETAT", newRebelStreak, newStarvationStreak };
    }

    if (newStarvationStreak >= 2) {
      return { isFallen: true, causeOfFall: "STARVATION", newRebelStreak, newStarvationStreak };
    }

    if (input.ancamanBandit >= 100.0) {
      return { isFallen: true, causeOfFall: "BANDIT_DESTRUCTION", newRebelStreak, newStarvationStreak };
    }

    return { isFallen: false, causeOfFall: null, newRebelStreak, newStarvationStreak };
  }
}

/**
 * DynasticLegacyService quantifies the dynasty's historical prestige across generations (FR-21).
 * Formula: Legacy Score = (seasons_survived * 100) + (peak_satisfaction * 10) + (final_treasury_emas * 2)
 * Ancestral Karma Points = floor(Legacy Score / 500)
 */
export class DynasticLegacyService {
  public static calculateScore(
    seasonsSurvived: number,
    peakSatisfaction: number,
    finalTreasuryEmas: number
  ): { legacyScore: number; karmaPoints: number } {
    const safeSeasons = Math.max(0, seasonsSurvived);
    const safePeak = Math.max(0, Math.min(100, peakSatisfaction));
    const safeEmas = Math.max(0, finalTreasuryEmas);

    const legacyScore =
      (safeSeasons * 100) +
      Math.round(safePeak * 10) +
      (safeEmas * 2);
    const karmaPoints = Math.floor(legacyScore / 500);

    return { legacyScore, karmaPoints };
  }
}

export interface KingdomAnnexationCandidate {
  id: string;
  name: string;
  kepuasan: number;
  pangan: number;
  emas: number;
  isFallen: boolean;
}

/**
 * TerritoryAnnexationService awards collapsed kingdom territories and residual stores
 * to the most prosperous neighboring sovereign (FR-24).
 * Sort order: Highest public satisfaction (moral authority), broken by granary food reserves.
 */
export class TerritoryAnnexationService {
  public static resolveAnnexation(
    fallenKingdomId: string,
    fallenPangan: number,
    fallenEmas: number,
    candidates: KingdomAnnexationCandidate[]
  ): {
    winnerKingdomId: string | null;
    absorbedPangan: number;
    absorbedEmas: number;
  } {
    const activeNeighbors = candidates.filter(
      (k) => k.id !== fallenKingdomId && !k.isFallen
    );

    if (activeNeighbors.length === 0) {
      return { winnerKingdomId: null, absorbedPangan: 0, absorbedEmas: 0 };
    }

    // Rank neighbors by satisfaction descending, then food descending
    activeNeighbors.sort((a, b) => b.kepuasan - a.kepuasan || b.pangan - a.pangan);
    const winner = activeNeighbors[0];

    return {
      winnerKingdomId: winner.id,
      absorbedPangan: Math.max(0, fallenPangan),
      absorbedEmas: Math.max(0, fallenEmas)
    };
  }
}

/**
 * FactionVoiceSynthesizer synthesizes dynamic ambient monologues for the realm's three factions (FR-23):
 * 1. Ki Wiro (Civilian Populace): Driven by welfare ratio.
 * 2. Nyai Sendang (Natural Harmony): Driven by ecological balance.
 * 3. Si Garang (Bandit Raiding Horde): Driven by border bandit threat.
 */
export class FactionVoiceSynthesizer {
  public static generateVoices(
    welfareRatio: number,
    harmonyScore: number,
    banditThreat: number
  ): {
    kiWiro: { mood: "PUAS" | "CEMAS" | "MARAH"; text: string };
    nyaiSendang: { mood: "HARMONIS" | "TERANCAM" | "MURKA"; text: string };
    siGarang: { mood: "WASPADA" | "MENGINTAI" | "AGRESIF"; text: string };
  } {
    // 1. Ki Wiro (Juru Bicara Rakyat)
    let kiWiroMood: "PUAS" | "CEMAS" | "MARAH" = "CEMAS";
    let kiWiroText = "Gusti, dapur warga mulai mengeluh. Beban upeti terasa menindih pundak kami.";
    if (welfareRatio > 0.65) {
      kiWiroMood = "PUAS";
      kiWiroText = "Gusti Prabu! Lumbung penuh dan rakyat bersukacita merayakan panen berlimpah.";
    } else if (welfareRatio < 0.35) {
      kiWiroMood = "MARAH";
      kiWiroText = "Cukup sudah kesewenang-wenangan ini! Jangan salahkan rakyat bila cangkul berubah menjadi pedang!";
    }

    // 2. Nyai Sendang (Juru Bicara Alam)
    let nyaiSendangMood: "HARMONIS" | "TERANCAM" | "MURKA" = "TERANCAM";
    let nyaiSendangText = "Hawa panas mulai merayap di perbukitan. Jagalah hutan sebelum kemarau membakar sawahmu.";
    if (harmonyScore >= 70.0) {
      nyaiSendangMood = "HARMONIS";
      nyaiSendangText = "Air sendang mengalir jernih, pepohonan rimba merestui takhta wanua panjenengan.";
    } else if (harmonyScore < 40.0) {
      nyaiSendangMood = "MURKA";
      nyaiSendangText = "Gemuruh dasar bumi bergetar! Sang Hyang Tuntang menuntut balas atas kerakusan manusia!";
    }

    // 3. Si Garang (Juru Bicara Bandit)
    let siGarangMood: "WASPADA" | "MENGINTAI" | "AGRESIF" = "MENGINTAI";
    let siGarangText = "Mata-mata lapor lumbung mereka mulai berisi. Siapkan kuda dan obor, malam ini kita pesta!";
    if (banditThreat < 30.0) {
      siGarangMood = "WASPADA";
      siGarangText = "Cih, pos ronda mereka rapat sekali! Tahan dulu pasukan, cari celah di waktu lengah!";
    } else if (banditThreat >= 70.0) {
      siGarangMood = "AGRESIF";
      siGarangText = "Bakar gerbang wanua! Ambil semua gabah dan koin emas, jangan sisakan apa pun!";
    }

    return {
      kiWiro: { mood: kiWiroMood, text: kiWiroText },
      nyaiSendang: { mood: nyaiSendangMood, text: nyaiSendangText },
      siGarang: { mood: siGarangMood, text: siGarangText }
    };
  }
}
