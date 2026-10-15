export type ActionType = 'bekerja' | 'berdagang' | 'mengeluh' | 'mencuri' | 'mengungsi' | 'memberontak';

export type FactionMood = 'Puas' | 'Cemas' | 'Marah' | 'Harmonis' | 'Terancam' | 'Murka' | 'Waspada' | 'Mengintai' | 'Agresif';

export interface RealmClock {
  currentSeason: number;
  maxSeasons: number;
  seasonDurationSec: number;
  secondInSeason: number;
  secondsRemainingInSeason: number;
  currentPhase: number;
  phaseName: string;
}

export interface KingdomState {
  id: string;
  name: string;
  pangan: number;
  emas: number;
  pasukan: number;
  pajak: number;
  balaiWanuaLv: number;
  lumbungLv: number;
  posRondaLv: number;
  kapasitasLumbung: number;
  kepuasan: number;
  harmoni: number;
  ancamanBandit: number;
  rebelStreak: number;
  starvationStreak: number;
  isFallen: boolean;
  annexedBy?: string;
  causeOfFall?: string;
}

export interface AgentSummary {
  totalCount: number;
  actionCounts: Record<ActionType, number>;
  averageSatisfaction: number;
}

export interface FactionDialogues {
  kiWiro: { mood: string; message: string };
  nyaiSendang: { mood: string; message: string };
  siGarang: { mood: string; message: string };
}

export interface CalamityState {
  activeLevel: number;
  calamityName: string;
  bossName: string;
  bossHp: number;
  bossMaxHp: number;
  bossSpawned: boolean;
  bossDefeated: boolean;
  isPeaceVictory: boolean;
}

export interface AllianceMemberInfo {
  kingdomId: string;
  kingdomName: string;
  onsiteVerified: boolean;
  distanceM: number;
  pasukan: number;
}

export interface PolicyCardInfo {
  id: string;
  name: string;
  category: string;
  biayaEmas: number;
  description: string;
  efekKeadilan: number;
  efekKesejahteraan: number;
  efekKeamanan: number;
  efekLingkungan: number;
  pajakDelta: number;
}
