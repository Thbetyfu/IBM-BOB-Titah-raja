/**
 * Titah Rakyat: Sovereign of the Living Realm
 * 18 Policy Cards Catalog (Nusantara Thematic Decrees)
 *
 * Implements FR-05 & FR-06 with O(1) typed lookup and deterministic vector impact.
 */

export type PolicyCategory = "ekonomi" | "keamanan" | "alam" | "sosial" | "pertahanan" | "lainnya";

export interface PolicyCard {
  id: string;
  name: string;
  kategori: PolicyCategory;
  biayaEmas: number;
  keadilan: number;
  kesejahteraan: number;
  keamanan: number;
  lingkungan: number;
  pajakDelta: number;
}

export const POLICY_CARD_CATALOG: Record<string, PolicyCard> = {
  CARD_01: {
    id: "CARD_01",
    name: "Bansos Padi Merata",
    kategori: "ekonomi",
    biayaEmas: 25,
    keadilan: 0.50,
    kesejahteraan: 0.60,
    keamanan: 0.00,
    lingkungan: 0.00,
    pajakDelta: 0
  },
  CARD_02: {
    id: "CARD_02",
    name: "Mobilisasi Wajib Militer",
    kategori: "keamanan",
    biayaEmas: 30,
    keadilan: -0.30,
    kesejahteraan: -0.20,
    keamanan: 0.70,
    lingkungan: 0.00,
    pajakDelta: 0
  },
  CARD_03: {
    id: "CARD_03",
    name: "Reformasi Pajak Pasar",
    kategori: "ekonomi",
    biayaEmas: 15,
    keadilan: 0.40,
    kesejahteraan: 0.50,
    keamanan: 0.00,
    lingkungan: 0.00,
    pajakDelta: -5
  },
  CARD_04: {
    id: "CARD_04",
    name: "Kenaikan Upeti Darurat",
    kategori: "ekonomi",
    biayaEmas: 0,
    keadilan: -0.50,
    kesejahteraan: -0.40,
    keamanan: 0.10,
    lingkungan: 0.00,
    pajakDelta: 10
  },
  CARD_05: {
    id: "CARD_05",
    name: "Buka Rimba Larangan",
    kategori: "alam",
    biayaEmas: 10,
    keadilan: 0.00,
    kesejahteraan: 0.40,
    keamanan: 0.10,
    lingkungan: -0.80,
    pajakDelta: 0
  },
  CARD_06: {
    id: "CARD_06",
    name: "Konservasi Hutan Suci",
    kategori: "alam",
    biayaEmas: 20,
    keadilan: 0.20,
    kesejahteraan: 0.00,
    keamanan: 0.00,
    lingkungan: 0.80,
    pajakDelta: 0
  },
  CARD_07: {
    id: "CARD_07",
    name: "Bangun Irigasi Subak",
    kategori: "ekonomi",
    biayaEmas: 35,
    keadilan: 0.30,
    kesejahteraan: 0.70,
    keamanan: 0.00,
    lingkungan: 0.20,
    pajakDelta: 0
  },
  CARD_08: {
    id: "CARD_08",
    name: "Sayembara Berantas Bandit",
    kategori: "keamanan",
    biayaEmas: 40,
    keadilan: 0.20,
    kesejahteraan: 0.10,
    keamanan: 0.80,
    lingkungan: 0.00,
    pajakDelta: 0
  },
  CARD_09: {
    id: "CARD_09",
    name: "Pesta Syukuran Panen Raya",
    kategori: "sosial",
    biayaEmas: 25,
    keadilan: 0.60,
    kesejahteraan: 0.50,
    keamanan: 0.00,
    lingkungan: 0.10,
    pajakDelta: 0
  },
  CARD_10: {
    id: "CARD_10",
    name: "Santunan Fakir Miskin",
    kategori: "sosial",
    biayaEmas: 20,
    keadilan: 0.70,
    kesejahteraan: 0.40,
    keamanan: 0.00,
    lingkungan: 0.00,
    pajakDelta: 0
  },
  CARD_11: {
    id: "CARD_11",
    name: "Perluas Pos Ronda Perbatasan",
    kategori: "pertahanan",
    biayaEmas: 25,
    keadilan: 0.00,
    kesejahteraan: 0.00,
    keamanan: 0.60,
    lingkungan: 0.00,
    pajakDelta: 0
  },
  CARD_12: {
    id: "CARD_12",
    name: "Pajak Progresif Saudagar",
    kategori: "ekonomi",
    biayaEmas: 10,
    keadilan: 0.40,
    kesejahteraan: 0.20,
    keamanan: 0.00,
    lingkungan: 0.00,
    pajakDelta: 5
  },
  CARD_13: {
    id: "CARD_13",
    name: "Pasar Bebas Nusantara",
    kategori: "ekonomi",
    biayaEmas: 15,
    keadilan: 0.20,
    kesejahteraan: 0.50,
    keamanan: -0.10,
    lingkungan: 0.00,
    pajakDelta: -3
  },
  CARD_14: {
    id: "CARD_14",
    name: "Gotong Royong Lumbung Desa",
    kategori: "sosial",
    biayaEmas: 10,
    keadilan: 0.40,
    kesejahteraan: 0.30,
    keamanan: 0.10,
    lingkungan: 0.00,
    pajakDelta: 0
  },
  CARD_15: {
    id: "CARD_15",
    name: "Sumpah Doa Tirta Sendang",
    kategori: "alam",
    biayaEmas: 15,
    keadilan: 0.30,
    kesejahteraan: 0.10,
    keamanan: 0.00,
    lingkungan: 0.50,
    pajakDelta: 0
  },
  CARD_16: {
    id: "CARD_16",
    name: "Distribusi Pupuk Alami",
    kategori: "alam",
    biayaEmas: 20,
    keadilan: 0.10,
    kesejahteraan: 0.40,
    keamanan: 0.00,
    lingkungan: 0.40,
    pajakDelta: 0
  },
  CARD_17: {
    id: "CARD_17",
    name: "Jam Malam & Ronda Bergilir",
    kategori: "keamanan",
    biayaEmas: 15,
    keadilan: -0.10,
    kesejahteraan: -0.10,
    keamanan: 0.50,
    lingkungan: 0.00,
    pajakDelta: 0
  },
  CARD_18: {
    id: "CARD_18",
    name: "Maklumat Damai Antar Wanua",
    kategori: "sosial",
    biayaEmas: 20,
    keadilan: 0.50,
    kesejahteraan: 0.20,
    keamanan: 0.40,
    lingkungan: 0.00,
    pajakDelta: 0
  }
};

/**
 * Returns a list of all 18 policy cards.
 */
export function getAllPolicyCards(): PolicyCard[] {
  return Object.values(POLICY_CARD_CATALOG);
}

/**
 * Resolves a policy card by its identifier.
 */
export function getPolicyCardById(cardId: string): PolicyCard | undefined {
  return POLICY_CARD_CATALOG[cardId];
}
