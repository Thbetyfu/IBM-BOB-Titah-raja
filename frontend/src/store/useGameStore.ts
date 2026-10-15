import { create } from "zustand";
import { REIGNS_DILEMMAS } from "../data/reignsDilemmas";

export type WeatherState = "CERAH" | "PACEKLIK" | "BANJIR_BANDANG";

export interface FactionMood {
  kiWiro: { mood: "PUAS" | "CEMAS" | "MARAH"; text: string };
  nyaiSendang: { mood: "HARMONIS" | "TERANCAM" | "MURKA"; text: string };
  siGarang: { mood: "WASPADA" | "MENGINTAI" | "AGRESIF"; text: string };
}

export interface KingdomData {
  id: string;
  namaWanua: string;
  pangan: number;
  emas: number;
  pasukan: number;
  pajak: number;
  kepuasan: number;
  harmoni: number;
  ancamanBandit: number;
  lumbungLv: number;
  posRondaLv: number;
  balaiWanuaLv: number;
  kapasitasLumbung: number;
  rebelStreak: number;
  starvationStreak: number;
  isFallen: boolean;
  causeOfFall: "COUP_DETAT" | "STARVATION" | "BANDIT_DESTRUCTION" | null;
}

export interface BossData {
  isSpawned: boolean;
  isDefeated: boolean;
  name: string;
  hp: number;
  maxHp: number;
}

export interface LegacyData {
  legacyScore: number;
  karmaPoints: number;
  seasonsSurvived: number;
  peakSatisfaction: number;
  finalTreasuryEmas: number;
}

export interface DecreeLogEntry {
  id: string;
  title: string;
  sourceType: "PRESET_CARD" | "FREE_TEXT";
  timestamp: number;
  costEmas: number;
  impacts: {
    keadilan: number;
    kesejahteraan: number;
    keamanan: number;
    lingkungan: number;
    pajakDelta: number;
  };
}

export interface GameStore {
  // World Tick & Loop
  worldSeason: number;
  activePhase: string;
  secondsRemaining: number;
  phaseElapsedMs: number;
  bobCoins: number;

  // Realm Entities
  kingdom: KingdomData;
  weather: WeatherState;
  boss: BossData;
  factions: FactionMood;
  legacy: LegacyData | null;
  decreeLogs: DecreeLogEntry[];

  // Onsite Physical Alliance
  allianceVerified: boolean;
  verifiedDistanceMeters: number | null;
  partnerKingdomId: string | null;

  // UI Modal Controls
  isDecreeModalOpen: boolean;
  isAllianceRadarOpen: boolean;
  isExpeditionModalOpen: boolean;
  isCoupOverlayVisible: boolean;
  isDilemmaCardVisible: boolean;
  currentDilemmaIndex: number;
  dilemmaNotification: string | null;
  audioMuted: boolean;

  // Actions
  setDecreeModalOpen: (open: boolean) => void;
  setAllianceRadarOpen: (open: boolean) => void;
  setExpeditionModalOpen: (open: boolean) => void;
  setCoupOverlayVisible: (visible: boolean) => void;
  setDilemmaCardVisible: (visible: boolean) => void;
  toggleAudioMuted: () => void;
  deductBobCoins: (amount: number) => void;
  updateKingdom: (partial: Partial<KingdomData>) => void;
  updateFromSnapshot: (payload: Record<string, unknown>) => void;
  triggerDecreeAccepted: (entry: DecreeLogEntry) => void;
  triggerBossDamage: (damage: number) => void;
  triggerCoup: (cause: "COUP_DETAT" | "STARVATION" | "BANDIT_DESTRUCTION") => void;
  resolveCurrentDilemma: (choice: "A" | "B") => void;
  upgradeBuilding: (type: "balai" | "lumbung" | "pos_ronda") => { success: boolean; message: string };
  hostVillageFeast: () => { success: boolean; message: string };
  expandSubakFields: () => { success: boolean; message: string };
  restartGame: () => void;
}

const INITIAL_KINGDOM: KingdomData = {
  id: "wanua_sendang_utama",
  namaWanua: "Wanua Sendang Tirta",
  pangan: 250,
  emas: 180,
  pasukan: 25,
  pajak: 15,
  kepuasan: 78,
  harmoni: 82,
  ancamanBandit: 18,
  lumbungLv: 2,
  posRondaLv: 1,
  balaiWanuaLv: 2,
  kapasitasLumbung: 400,
  rebelStreak: 0,
  starvationStreak: 0,
  isFallen: false,
  causeOfFall: null
};

const INITIAL_FACTIONS: FactionMood = {
  kiWiro: {
    mood: "PUAS",
    text: "Gusti Prabu! Lumbung terisi berkah dan cangkul rakyat berayun serempak di sawah terasering."
  },
  nyaiSendang: {
    mood: "HARMONIS",
    text: "Air sendang mengalir bening tanpa noda. Pohon beringin sepuh melingkupi wanua dengan perlindungan gaib."
  },
  siGarang: {
    mood: "WASPADA",
    text: "Cih! Pasukan penjaga ronda masih awas di perbatasan. Tahan gerombolan, tunggu hingga musim paceklik!"
  }
};

type StoreSetter = (
  updater: Partial<GameStore> | ((state: GameStore) => Partial<GameStore>)
) => void;

export const useGameStore = create<GameStore>((set: StoreSetter) => ({
  worldSeason: 1,
  activePhase: "PHASE_1_DECREE",
  secondsRemaining: 45,
  phaseElapsedMs: 0,
  bobCoins: 500,

  kingdom: INITIAL_KINGDOM,
  weather: "CERAH",
  boss: {
    isSpawned: false,
    isDefeated: false,
    name: "Naga Banjir Sang Hyang Tuntang",
    hp: 500,
    maxHp: 500
  },
  factions: INITIAL_FACTIONS,
  legacy: null,
  decreeLogs: [],

  allianceVerified: false,
  verifiedDistanceMeters: null,
  partnerKingdomId: null,

  isDecreeModalOpen: false,
  isAllianceRadarOpen: false,
  isExpeditionModalOpen: false,
  isCoupOverlayVisible: false,
  isDilemmaCardVisible: true,
  currentDilemmaIndex: 0,
  dilemmaNotification: null,
  audioMuted: false,

  setDecreeModalOpen: (open: boolean) => set({ isDecreeModalOpen: open }),
  setAllianceRadarOpen: (open: boolean) => set({ isAllianceRadarOpen: open }),
  setExpeditionModalOpen: (open: boolean) => set({ isExpeditionModalOpen: open }),
  setCoupOverlayVisible: (visible: boolean) => set({ isCoupOverlayVisible: visible }),
  setDilemmaCardVisible: (visible: boolean) => set({ isDilemmaCardVisible: visible }),
  toggleAudioMuted: () => set((s: GameStore) => ({ audioMuted: !s.audioMuted })),

  deductBobCoins: (amount: number) =>
    set((s: GameStore) => ({ bobCoins: Math.max(0, s.bobCoins - amount) })),

  updateKingdom: (partial: Partial<KingdomData>) =>
    set((s: GameStore) => ({ kingdom: { ...s.kingdom, ...partial } })),

  updateFromSnapshot: (payload: Record<string, unknown>) =>
    set((s: GameStore) => {
      const season = Number(payload.season ?? payload.currentSeason ?? s.worldSeason);
      const phase = String(payload.phase ?? payload.activePhase ?? s.activePhase);
      const seconds = Number(payload.secondsRemaining ?? (45 - Math.floor((Number(payload.phaseElapsedMs ?? 0) / 1000) % 45)));
      const rawKingdom = (payload.kingdom ?? (Array.isArray(payload.kingdoms) ? payload.kingdoms[0] : null)) as Partial<KingdomData> | null;

      const newKingdom = rawKingdom ? { ...s.kingdom, ...rawKingdom } : s.kingdom;
      let weather: WeatherState = s.weather;
      if (payload.weather) {
        weather = payload.weather as WeatherState;
      } else if (newKingdom.harmoni < 40) {
        weather = "BANJIR_BANDANG";
      } else if (newKingdom.harmoni < 60) {
        weather = "PACEKLIK";
      } else {
        weather = "CERAH";
      }

      const bossHp = typeof payload.bossHp === "number" ? payload.bossHp : s.boss.hp;
      const isBossSeason = season >= 20;

      return {
        worldSeason: season,
        activePhase: phase,
        secondsRemaining: Math.max(0, seconds),
        kingdom: newKingdom,
        weather,
        boss: {
          ...s.boss,
          isSpawned: isBossSeason || s.boss.isSpawned,
          hp: bossHp,
          isDefeated: bossHp <= 0
        },
        allianceVerified: Boolean(payload.allianceVerified ?? s.allianceVerified),
        verifiedDistanceMeters: typeof payload.verifiedDistanceMeters === "number"
          ? payload.verifiedDistanceMeters
          : s.verifiedDistanceMeters
      };
    }),

  triggerDecreeAccepted: (entry: DecreeLogEntry) =>
    set((s: GameStore) => {
      const newEmas = Math.max(0, s.kingdom.emas - entry.costEmas);
      const newPajak = Math.max(0, Math.min(100, s.kingdom.pajak + entry.impacts.pajakDelta));
      const newKeadilan = Math.max(0, Math.min(100, s.kingdom.kepuasan + Math.round(entry.impacts.keadilan * 15)));
      const newHarmoni = Math.max(0, Math.min(100, s.kingdom.harmoni + Math.round(entry.impacts.lingkungan * 15)));

      // Update faction voices dynamically based on latest stats
      const newFactions: FactionMood = {
        kiWiro: {
          mood: newKeadilan > 65 ? "PUAS" : newKeadilan < 35 ? "MARAH" : "CEMAS",
          text: newKeadilan > 65
            ? "Titah paduka menyejukkan hati kawula alit! Beras di periuk aman."
            : newKeadilan < 35
            ? "Rakyat menjerit oleh upeti dan beban! Cangkul kami mulai berkarat menatap masa depan kelam."
            : "Rakyat bertahan sembari memohon kemurahan hati keraton."
        },
        nyaiSendang: {
          mood: newHarmoni >= 70 ? "HARMONIS" : newHarmoni < 40 ? "MURKA" : "TERANCAM",
          text: newHarmoni >= 70
            ? "Mata air Sendang beriak jernih. Dewi Sri melimpahi tanah Wanua dengan berkah padi bernas."
            : newHarmoni < 40
            ? "Langit menghitam dan gemuruh hulu sungai menandai amarah Sang Hyang Tuntang!"
            : "Pohon rimba meranggas, jagalah kebersihan sendang sebelum kemarau panjang."
        },
        siGarang: {
          mood: s.kingdom.pasukan > 30 ? "WASPADA" : s.kingdom.pangan > 200 ? "AGRESIF" : "MENGINTAI",
          text: s.kingdom.pasukan > 30
            ? "Buset! Pasukan tombak mereka berjaga ketat di pos perbatasan. Tahan gerombolan!"
            : s.kingdom.pangan > 200
            ? "Lumbung mereka penuh gabah! Siapkan obor dan gerobak rampokan!"
            : "Mata-mata mengintai di balik ilalang, menunggu lumbung sedikit lebih gemuk."
        }
      };

      return {
        kingdom: {
          ...s.kingdom,
          emas: newEmas,
          pajak: newPajak,
          kepuasan: newKeadilan,
          harmoni: newHarmoni
        },
        factions: newFactions,
        decreeLogs: [entry, ...s.decreeLogs].slice(0, 20)
      };
    }),

  triggerBossDamage: (damage: number) =>
    set((s: GameStore) => {
      const newHp = Math.max(0, s.boss.hp - damage);
      const defeated = newHp <= 0;
      return {
        boss: {
          ...s.boss,
          hp: newHp,
          isDefeated: defeated
        },
        kingdom: defeated
          ? { ...s.kingdom, pangan: s.kingdom.pangan + 100 }
          : s.kingdom
      };
    }),

  triggerCoup: (cause: "COUP_DETAT" | "STARVATION" | "BANDIT_DESTRUCTION") =>
    set((s: GameStore) => {
      const legacyScore = s.worldSeason * 100 + Math.round(s.kingdom.kepuasan * 10) + s.kingdom.emas * 2;
      const karmaPoints = Math.floor(legacyScore / 500);

      return {
        isCoupOverlayVisible: true,
        kingdom: {
          ...s.kingdom,
          isFallen: true,
          causeOfFall: cause
        },
        legacy: {
          legacyScore,
          karmaPoints,
          seasonsSurvived: s.worldSeason,
          peakSatisfaction: s.kingdom.kepuasan,
          finalTreasuryEmas: s.kingdom.emas
        }
      };
    }),

  resolveCurrentDilemma: (choice: "A" | "B") =>
    set((s: GameStore) => {
      const dilemma = REIGNS_DILEMMAS[s.currentDilemmaIndex % REIGNS_DILEMMAS.length];
      if (!dilemma) return s;

      const choiceObj = choice === "A" ? dilemma.optionA : dilemma.optionB;
      const eff = choiceObj.effects;

      const newPangan = Math.max(0, s.kingdom.pangan + (eff.pangan ?? 0));
      const newEmas = Math.max(0, s.kingdom.emas + (eff.emas ?? 0));
      const newPasukan = Math.max(0, s.kingdom.pasukan + (eff.pasukan ?? 0));
      const newKepuasan = Math.max(0, Math.min(100, s.kingdom.kepuasan + (eff.kepuasan ?? 0)));
      const newHarmoni = Math.max(0, Math.min(100, s.kingdom.harmoni + (eff.harmoni ?? 0)));
      const newAncaman = Math.max(0, Math.min(100, s.kingdom.ancamanBandit + (eff.ancamanBandit ?? 0)));

      // Dynamic faction reaction
      const updatedFactions = { ...s.factions };
      if (dilemma.character.name.includes("Ki Wiro")) {
        updatedFactions.kiWiro = {
          mood: newKepuasan > 60 ? "PUAS" : newKepuasan < 35 ? "MARAH" : "CEMAS",
          text: choiceObj.reactionQuote
        };
      } else if (dilemma.character.name.includes("Nyai Sendang")) {
        updatedFactions.nyaiSendang = {
          mood: newHarmoni >= 65 ? "HARMONIS" : newHarmoni < 40 ? "MURKA" : "TERANCAM",
          text: choiceObj.reactionQuote
        };
      } else if (dilemma.character.name.includes("Si Garang")) {
        updatedFactions.siGarang = {
          mood: newAncaman > 40 ? "AGRESIF" : newPasukan > 30 ? "WASPADA" : "MENGINTAI",
          text: choiceObj.reactionQuote
        };
      }

      // Check coup conditions
      if (newKepuasan <= 5) {
        setTimeout(() => s.triggerCoup("COUP_DETAT"), 300);
      } else if (newPangan <= 0 && s.kingdom.starvationStreak >= 2) {
        setTimeout(() => s.triggerCoup("STARVATION"), 300);
      } else if (newAncaman >= 95 && newPasukan <= 5) {
        setTimeout(() => s.triggerCoup("BANDIT_DESTRUCTION"), 300);
      }

      return {
        kingdom: {
          ...s.kingdom,
          pangan: newPangan,
          emas: newEmas,
          pasukan: newPasukan,
          kepuasan: newKepuasan,
          harmoni: newHarmoni,
          ancamanBandit: newAncaman
        },
        factions: updatedFactions,
        currentDilemmaIndex: (s.currentDilemmaIndex + 1) % REIGNS_DILEMMAS.length,
        dilemmaNotification: choiceObj.toastNotice
      };
    }),

  upgradeBuilding: (type: "balai" | "lumbung" | "pos_ronda") => {
    let result = { success: false, message: "" };
    set((s: GameStore) => {
      if (type === "balai") {
        if (s.kingdom.balaiWanuaLv >= 3) {
          result = { success: false, message: "Balai Wanua sudah tingkat maksimum (Lv 3)!" };
          return s;
        }
        if (s.kingdom.emas < 60 || s.kingdom.pangan < 30) {
          result = { success: false, message: "Sumber daya kurang! Butuh 60 Emas & 30 Pangan." };
          return s;
        }
        result = { success: true, message: `Balai Wanua ditingkatkan ke Lv ${s.kingdom.balaiWanuaLv + 1}!` };
        return {
          kingdom: {
            ...s.kingdom,
            balaiWanuaLv: s.kingdom.balaiWanuaLv + 1,
            emas: s.kingdom.emas - 60,
            pangan: s.kingdom.pangan - 30,
            kepuasan: Math.min(100, s.kingdom.kepuasan + 10)
          }
        };
      } else if (type === "lumbung") {
        if (s.kingdom.lumbungLv >= 3) {
          result = { success: false, message: "Lumbung Desa sudah tingkat maksimum (Lv 3)!" };
          return s;
        }
        if (s.kingdom.emas < 45 || s.kingdom.pangan < 20) {
          result = { success: false, message: "Sumber daya kurang! Butuh 45 Emas & 20 Pangan." };
          return s;
        }
        result = { success: true, message: `Lumbung Desa ditingkatkan ke Lv ${s.kingdom.lumbungLv + 1}!` };
        return {
          kingdom: {
            ...s.kingdom,
            lumbungLv: s.kingdom.lumbungLv + 1,
            emas: s.kingdom.emas - 45,
            pangan: s.kingdom.pangan - 20,
            kapasitasLumbung: s.kingdom.kapasitasLumbung + 150
          }
        };
      } else if (type === "pos_ronda") {
        if (s.kingdom.posRondaLv >= 3) {
          result = { success: false, message: "Pos Ronda sudah tingkat maksimum (Lv 3)!" };
          return s;
        }
        if (s.kingdom.emas < 40 || s.kingdom.pangan < 15) {
          result = { success: false, message: "Sumber daya kurang! Butuh 40 Emas & 15 Pangan." };
          return s;
        }
        result = { success: true, message: `Pos Ronda ditingkatkan ke Lv ${s.kingdom.posRondaLv + 1}!` };
        return {
          kingdom: {
            ...s.kingdom,
            posRondaLv: s.kingdom.posRondaLv + 1,
            emas: s.kingdom.emas - 40,
            pangan: s.kingdom.pangan - 15,
            pasukan: s.kingdom.pasukan + 10,
            ancamanBandit: Math.max(0, s.kingdom.ancamanBandit - 20)
          }
        };
      }
      return s;
    });
    return result;
  },

  hostVillageFeast: () => {
    let result = { success: false, message: "" };
    set((s: GameStore) => {
      if (s.kingdom.pangan < 35) {
        result = { success: false, message: "Pangan kurang! Butuh 35 gabah untuk kenduri." };
        return s;
      }
      result = { success: true, message: "Kenduri Sedekah Bumi digelar! Kepuasan rakyat naik pesat!" };
      return {
        kingdom: {
          ...s.kingdom,
          pangan: s.kingdom.pangan - 35,
          kepuasan: Math.min(100, s.kingdom.kepuasan + 25),
          harmoni: Math.min(100, s.kingdom.harmoni + 10)
        }
      };
    });
    return result;
  },

  expandSubakFields: () => {
    let result = { success: false, message: "" };
    set((s: GameStore) => {
      if (s.kingdom.emas < 30) {
        result = { success: false, message: "Emas kurang! Butuh 30 keping emas untuk buka sawah." };
        return s;
      }
      result = { success: true, message: "Sawah terasering baru dibuka! Hasil panen melimpah!" };
      return {
        kingdom: {
          ...s.kingdom,
          emas: s.kingdom.emas - 30,
          pangan: s.kingdom.pangan + 50,
          harmoni: Math.min(100, s.kingdom.harmoni + 15)
        }
      };
    });
    return result;
  },

  restartGame: () =>
    set({
      worldSeason: 1,
      activePhase: "PHASE_1_DECREE",
      secondsRemaining: 45,
      phaseElapsedMs: 0,
      kingdom: { ...INITIAL_KINGDOM },
      weather: "CERAH",
      boss: {
        isSpawned: false,
        isDefeated: false,
        name: "Naga Banjir Sang Hyang Tuntang",
        hp: 500,
        maxHp: 500
      },
      factions: { ...INITIAL_FACTIONS },
      legacy: null,
      isCoupOverlayVisible: false,
      allianceVerified: false,
      verifiedDistanceMeters: null,
      partnerKingdomId: null
    })
}));
