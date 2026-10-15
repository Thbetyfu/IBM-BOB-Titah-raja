/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Frontend Policy Cards Catalog (18 Thematic Nusantara Cards)
 */

export interface PolicyCard {
  id: string;
  name: string;
  kategori: "ekonomi" | "keamanan" | "alam" | "sosial" | "pertahanan" | "lainnya";
  biayaEmas: number;
  description: string;
  keadilan: number;
  kesejahteraan: number;
  keamanan: number;
  lingkungan: number;
  pajakDelta: number;
}

export const POLICY_CARDS: PolicyCard[] = [
  {
    id: "CARD_01",
    name: "Bansos Padi Merata",
    kategori: "ekonomi",
    biayaEmas: 25,
    description: "Bagikan cadangan gabah lumbung kepada seluruh kawula miskin secara adil.",
    keadilan: 0.50,
    kesejahteraan: 0.60,
    keamanan: 0.00,
    lingkungan: 0.00,
    pajakDelta: 0
  },
  {
    id: "CARD_02",
    name: "Mobilisasi Wajib Militer",
    kategori: "keamanan",
    biayaEmas: 30,
    description: "Rekrut pemuda desa menjadi prajurit tombak pengawal perbatasan.",
    keadilan: -0.30,
    kesejahteraan: -0.20,
    keamanan: 0.70,
    lingkungan: 0.00,
    pajakDelta: 0
  },
  {
    id: "CARD_03",
    name: "Reformasi Pajak Pasar",
    kategori: "ekonomi",
    biayaEmas: 15,
    description: "Kurangi retribusi pedagang pasar desa untuk menggairahkan perputaran barter.",
    keadilan: 0.40,
    kesejahteraan: 0.50,
    keamanan: 0.00,
    lingkungan: 0.00,
    pajakDelta: -5
  },
  {
    id: "CARD_04",
    name: "Kenaikan Upeti Darurat",
    kategori: "ekonomi",
    biayaEmas: 0,
    description: "Tarik upeti darurat untuk kas pertahanan, memicu keresahan kawula alit.",
    keadilan: -0.50,
    kesejahteraan: -0.40,
    keamanan: 0.10,
    lingkungan: 0.00,
    pajakDelta: 10
  },
  {
    id: "CARD_05",
    name: "Buka Rimba Larangan",
    kategori: "alam",
    biayaEmas: 10,
    description: "Babat hutan keramat untuk sawah baru. Hasil panen naik namun roh alam murka.",
    keadilan: 0.00,
    kesejahteraan: 0.40,
    keamanan: 0.10,
    lingkungan: -0.80,
    pajakDelta: 0
  },
  {
    id: "CARD_06",
    name: "Konservasi Hutan Suci",
    kategori: "alam",
    biayaEmas: 20,
    description: "Tetapkan larangan tebang pohon sepuh dan sucikan mata air Sendang Tirta.",
    keadilan: 0.20,
    kesejahteraan: 0.00,
    keamanan: 0.00,
    lingkungan: 0.80,
    pajakDelta: 0
  },
  {
    id: "CARD_07",
    name: "Bangun Irigasi Subak",
    kategori: "ekonomi",
    biayaEmas: 35,
    description: "Pahat parit batu bambu pembagi air sendang menuju petak terasering.",
    keadilan: 0.30,
    kesejahteraan: 0.70,
    keamanan: 0.00,
    lingkungan: 0.20,
    pajakDelta: 0
  },
  {
    id: "CARD_08",
    name: "Sayembara Berantas Bandit",
    kategori: "keamanan",
    biayaEmas: 40,
    description: "Tebar hadiah emas bagi pendekar yang meringkus gerombolan Si Garang.",
    keadilan: 0.20,
    kesejahteraan: 0.10,
    keamanan: 0.80,
    lingkungan: 0.00,
    pajakDelta: 0
  },
  {
    id: "CARD_09",
    name: "Pesta Syukuran Panen Raya",
    kategori: "sosial",
    biayaEmas: 25,
    description: "Gelar kenduri tumpeng ageng di pelataran Balai Wanua untuk membakar semangat rakyat.",
    keadilan: 0.60,
    kesejahteraan: 0.50,
    keamanan: 0.00,
    lingkungan: 0.10,
    pajakDelta: 0
  },
  {
    id: "CARD_10",
    name: "Santunan Fakir Miskin",
    kategori: "sosial",
    biayaEmas: 20,
    description: "Kucurkan kas emas bagi janda, yatim, dan orang tua renta di pelosok wanua.",
    keadilan: 0.70,
    kesejahteraan: 0.40,
    keamanan: 0.00,
    lingkungan: 0.00,
    pajakDelta: 0
  },
  {
    id: "CARD_11",
    name: "Perluas Pos Ronda Perbatasan",
    kategori: "pertahanan",
    biayaEmas: 25,
    description: "Tingkatkan gardu intai dan kentongan kayu jati di lintasan rawan serbuan musuh.",
    keadilan: 0.00,
    kesejahteraan: 0.00,
    keamanan: 0.60,
    lingkungan: 0.00,
    pajakDelta: 0
  },
  {
    id: "CARD_12",
    name: "Pajak Progresif Saudagar",
    kategori: "ekonomi",
    biayaEmas: 10,
    description: "Kenakan pungutan lebih tinggi pada saudagar kapal layar kaya demi subsidi cangkul.",
    keadilan: 0.40,
    kesejahteraan: 0.20,
    keamanan: 0.00,
    lingkungan: 0.00,
    pajakDelta: 5
  },
  {
    id: "CARD_13",
    name: "Pasar Bebas Nusantara",
    kategori: "ekonomi",
    biayaEmas: 15,
    description: "Bebaskan pedagang asing berdagang tanpa sekat retribusi, menggenjot omzet.",
    keadilan: 0.20,
    kesejahteraan: 0.50,
    keamanan: -0.10,
    lingkungan: 0.00,
    pajakDelta: -3
  },
  {
    id: "CARD_14",
    name: "Gotong Royong Lumbung Desa",
    kategori: "sosial",
    biayaEmas: 10,
    description: "Ajak warga bergotong-royong memperkokoh tiang kayu dan atap ijuk lumbung leuit.",
    keadilan: 0.40,
    kesejahteraan: 0.30,
    keamanan: 0.10,
    lingkungan: 0.00,
    pajakDelta: 0
  },
  {
    id: "CARD_15",
    name: "Sumpah Doa Tirta Sendang",
    kategori: "alam",
    biayaEmas: 15,
    description: "Tabur kembang tujuh rupa dan panjatkan mantra pembersihan mata air suci.",
    keadilan: 0.30,
    kesejahteraan: 0.10,
    keamanan: 0.00,
    lingkungan: 0.50,
    pajakDelta: 0
  },
  {
    id: "CARD_16",
    name: "Distribusi Pupuk Alami",
    kategori: "alam",
    biayaEmas: 20,
    description: "Salurkan kompos jerami dan kotoran ternak untuk menyuburkan tanah sawah gersang.",
    keadilan: 0.10,
    kesejahteraan: 0.40,
    keamanan: 0.00,
    lingkungan: 0.40,
    pajakDelta: 0
  },
  {
    id: "CARD_17",
    name: "Jam Malam & Ronda Bergilir",
    kategori: "keamanan",
    biayaEmas: 15,
    description: "Berlakukan larangan keluar malam bagi kawula untuk memutus intaian mata-mata bandit.",
    keadilan: -0.10,
    kesejahteraan: -0.10,
    keamanan: 0.50,
    lingkungan: 0.00,
    pajakDelta: 0
  },
  {
    id: "CARD_18",
    name: "Maklumat Damai Antar Wanua",
    kategori: "sosial",
    biayaEmas: 20,
    description: "Kirim utusan tembang perdamaian ke wanua tetangga untuk meredakan ketegangan militer.",
    keadilan: 0.50,
    kesejahteraan: 0.20,
    keamanan: 0.40,
    lingkungan: 0.00,
    pajakDelta: 0
  }
];
