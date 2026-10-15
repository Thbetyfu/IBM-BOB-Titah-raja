import { create } from "zustand";

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
  audioMuted: boolean;

  // Actions
  setDecreeModalOpen: (open: boolean) => void;
  setAllianceRadarOpen: (open: boolean) => void;
  setExpeditionModalOpen: (open: boolean) => void;
  setCoupOverlayVisible: (visible: boolean) => void;
  toggleAudioMuted: () => void;
  deductBobCoins: (amount: number) => void;
  updateKingdom: (partial: Partial<KingdomData>) => void;
  updateFromSnapshot: (payload: Record<string, unknown>) => void;
  triggerDecreeAccepted: (entry: DecreeLogEntry) => void;
  triggerBossDamage: (damage: number) => void;
  triggerCoup: (cause: "COUP_DETAT" | "STARVATION" | "BANDIT_DESTRUCTION") => void;
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
  audioMuted: false,

  setDecreeModalOpen: (open: boolean) => set({ isDecreeModalOpen: open }),
  setAllianceRadarOpen: (open: boolean) => set({ isAllianceRadarOpen: open }),
  setExpeditionModalOpen: (open: boolean) => set({ isExpeditionModalOpen: open }),
  setCoupOverlayVisible: (visible: boolean) => set({ isCoupOverlayVisible: visible }),
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
