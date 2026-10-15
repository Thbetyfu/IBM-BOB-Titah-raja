/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Reigns-Style Royal Dilemma & Citizen Crisis Deck
 *
 * Implements rich Indonesian kingdom narrative encounters with immediate
 * resource, faction, and environmental consequences.
 */

export interface DilemmaChoice {
  label: string;
  subtext: string;
  effects: {
    pangan?: number;
    emas?: number;
    pasukan?: number;
    kepuasan?: number;
    harmoni?: number;
    ancamanBandit?: number;
  };
  reactionQuote: string;
  toastNotice: string;
}

export interface CharacterAvatar {
  name: string;
  title: string;
  faction: "agraria" | "adat" | "keamanan" | "istana" | "kelana";
  colorHex: string;
  badgeBg: string;
  tag: string;
}

export interface ReignDilemma {
  id: string;
  character: CharacterAvatar;
  situation: string;
  optionA: DilemmaChoice;
  optionB: DilemmaChoice;
  minSeason?: number;
  condition?: "low_pangan" | "high_bandit" | "low_harmoni" | "low_emas" | "default";
}

export const CHARACTERS: Record<string, CharacterAvatar> = {
  ki_wiro: {
    name: "Ki Wiro",
    title: "Wakil Petani & Kaum Agraria",
    faction: "agraria",
    colorHex: "#34d399",
    badgeBg: "bg-emerald-950/80 border-emerald-500/50",
    tag: "Petani"
  },
  nyai_sendang: {
    name: "Nyai Sendang",
    title: "Sesepuh Adat & Mata Air Tirta",
    faction: "adat",
    colorHex: "#2dd4bf",
    badgeBg: "bg-teal-950/80 border-teal-500/50",
    tag: "Sesepuh"
  },
  si_garang: {
    name: "Si Garang",
    title: "Panglima Gerombolan Rimba",
    faction: "keamanan",
    colorHex: "#c084fc",
    badgeBg: "bg-purple-950/80 border-purple-500/50",
    tag: "Pendekar"
  },
  raden_aryo: {
    name: "Raden Tumenggung Aryo",
    title: "Patih Perbendaharaan Keraton",
    faction: "istana",
    colorHex: "#fbbf24",
    badgeBg: "bg-amber-950/80 border-amber-500/50",
    tag: "Patih"
  },
  lurah_somad: {
    name: "Ki Lurah Somad",
    title: "Kepala Desa Wanua Sendang",
    faction: "agraria",
    colorHex: "#60a5fa",
    badgeBg: "bg-blue-950/80 border-blue-500/50",
    tag: "Kepala Desa"
  },
  sudagar_duto: {
    name: "Sudagar Duto",
    title: "Saudagar Sutra & Rempah Kelana",
    faction: "kelana",
    colorHex: "#f472b6",
    badgeBg: "bg-pink-950/80 border-pink-500/50",
    tag: "Saudagar"
  }
};

export const REIGNS_DILEMMAS: ReignDilemma[] = [
  {
    id: "dilemma_01_wereng",
    character: CHARACTERS.ki_wiro,
    situation: "Gusti Prabu! Hama wereng cokelat menyerang petak sawah timur. Para petani memohon izin membuka cadangan lumbung desa untuk membeli obat belerang, atau sebagian panen akan busuk!",
    optionA: {
      label: "Buka Cadangan Lumbung",
      subtext: "Gunakan 40 pangan untuk membantu petani",
      effects: { pangan: -40, kepuasan: 18, harmoni: 10 },
      reactionQuote: "Matur sembah nuwun, Gusti! Rakyat tidak akan melupakan kemurahan hati baginda.",
      toastNotice: "LUMBUNG DIBUKA: RAKYAT BERSYUKUR!"
    },
    optionB: {
      label: "Biarkan Mandiri",
      subtext: "Lumbung harus hemat demi cadangan perang",
      effects: { pangan: -15, kepuasan: -20, harmoni: -12 },
      reactionQuote: "Duh Gusti... cangkul kami terasa berat jika lumbung keraton tertutup rapat.",
      toastNotice: "RAKYAT KECEWA: GABAH TERSERANG HAMA"
    }
  },
  {
    id: "dilemma_02_mata_air",
    character: CHARACTERS.nyai_sendang,
    situation: "Air di Sendang Tirta mulai beriak keruh dan bebauan aneh tercium dari hulu sungai. Nyai Sendang menuntut upacara labuhan sesaji bunga tujuh rupa agar penunggu sungai tidak murka mendatangkan banjir!",
    optionA: {
      label: "Gelar Labuhan Sesaji",
      subtext: "Keluarkan 25 keping emas untuk upacara adat",
      effects: { emas: -25, harmoni: 25, kepuasan: 10 },
      reactionQuote: "Pohon beringin sepuh merunduk damai. Berkah air suci akan membasahi sawah wanua.",
      toastNotice: "LABUHAN SELESAI: AIR SENDANG BERSIH"
    },
    optionB: {
      label: "Tolak Takhayul",
      subtext: "Gunakan emas untuk hal yang lebih praktis",
      effects: { harmoni: -25, kepuasan: -12, ancamanBandit: 10 },
      reactionQuote: "Awas Gusti... air yang terluka akan membalas dengan amarah bandang!",
      toastNotice: "SESAJI DITOLAK: HUJAN MENDUNG MEREBAK"
    }
  },
  {
    id: "dilemma_03_patroli_rimba",
    character: CHARACTERS.si_garang,
    situation: "Mata-mata kami melihat asap unggun perampok berkeliaran di seberang sungai Wanua. Izinkan kami merekrut 10 pemuda desa menjadi peronda tombak malam ini, atau perketat jam malam!",
    optionA: {
      label: "Rekrut Peronda Baru",
      subtext: "Bayar 30 emas untuk gaji tombak",
      effects: { emas: -30, pasukan: 10, ancamanBandit: -25, kepuasan: 8 },
      reactionQuote: "Bagus! Tombak kami tajam dan api obor ronda akan membakar nyali para bandit!",
      toastNotice: "PERONDA BERTAMBAH: BATASAN AMAN"
    },
    optionB: {
      label: "Pasang Palang Kayu Saja",
      subtext: "Hemat kas emas, kunci gerbang malam",
      effects: { ancamanBandit: 15, kepuasan: -10 },
      reactionQuote: "Pagar kayu lapuk tak akan menahan serbuan pedang, Gusti...",
      toastNotice: "BANDIT MENGINTAI DARI TEBING"
    }
  },
  {
    id: "dilemma_04_pajak_pasar",
    character: CHARACTERS.raden_aryo,
    situation: "Ampun Gusti Prabu, kas perbendaharaan keraton menipis akibat biaya pemeliharaan jalan batu. Hamba usulkan menaikkan retribusi pasar desa sebesar 5% musim ini.",
    optionA: {
      label: "Naikkan Pajak Pasar",
      subtext: "Tambah kas kas wanua +45 emas",
      effects: { emas: 45, kepuasan: -22 },
      reactionQuote: "Pundi emas terisi kembali, urusan keraton kini berada di atas fondasi kokoh.",
      toastNotice: "KAS EMAS NAIK: PEDAGANG MENGELUH"
    },
    optionB: {
      label: "Pertahankan Pajak Ringan",
      subtext: "Jaga kebahagiaan dan roda dagang rakyat",
      effects: { kepuasan: 15, emas: -10 },
      reactionQuote: "Baginda berhati mulia, namun kita harus waspada bila paceklik melanda.",
      toastNotice: "PASAR RAMAI: RAKYAT GEMBIRA"
    }
  },
  {
    id: "dilemma_05_saudagar_sutra",
    character: CHARACTERS.sudagar_duto,
    situation: "Salam sembah, Gusti Prabu! Kafilah dagang hamba membawa benih padi unggul Genjah Semeru dan kain lurik halus dari pesisir. Apakah wanua sudi memborongnya dengan harga persahabatan?",
    optionA: {
      label: "Beli Benih Unggul",
      subtext: "Bayar 35 emas untuk benih bernilai tinggi",
      effects: { emas: -35, pangan: 60, kepuasan: 12 },
      reactionQuote: "Pilihan bijak Gusti! Benih ini akan menghasilkan bulir beras wangi pulen berkilau emas.",
      toastNotice: "BENIH UNGGUL TIBA: PANEN MELIMPAH"
    },
    optionB: {
      label: "Tolak Kafilah",
      subtext: "Gunakan benih lokal yang sudah ada",
      effects: { emas: 0 },
      reactionQuote: "Sayang sekali... hamba akan membawa benih sakti ini ke kadipaten seberang.",
      toastNotice: "KAFILAH MELANJUTKAN PERJALANAN"
    }
  },
  {
    id: "dilemma_06_gotong_royong",
    character: CHARACTERS.lurah_somad,
    situation: "Tanggul irigasi subak di petak barat ambrol tergerus arus sungai kemarin petang. Warga siap kerja bakti gotong-royong, asalkan dapur umum Balai Wanua menyediakan nasi tumpeng hangat!",
    optionA: {
      label: "Buka Dapur Umum Nasi Tumpeng",
      subtext: "Sediakan 25 pangan untuk para pekerja",
      effects: { pangan: -25, harmoni: 20, kepuasan: 15 },
      reactionQuote: "Alhamdulillah! Semangat cangkul warga membara saat perut kenyang dan hati senang!",
      toastNotice: "TANGGUL KOKOH: GOTONG ROYONG SUKSES"
    },
    optionB: {
      label: "Perintahkan Kerja Wajib",
      subtext: "Rakyat harus memperbaiki tanggul tanpa imbalan",
      effects: { kepuasan: -18, harmoni: 8 },
      reactionQuote: "Warga bekerja dengan muka masam dan bisik-bisik ketidakpuasan beredar di pos ronda...",
      toastNotice: "TANGGUL SELESAI DENGAN GERUTU RAKYAT"
    }
  },
  {
    id: "dilemma_07_pesta_panen",
    character: CHARACTERS.ki_wiro,
    situation: "Musim panen raya telah tiba! Para pemuda desa memohon izin menggelar Pesta Sedekah Bumi dengan pertunjukan wayang kulit semalam suntuk di pelataran Balai Wanua.",
    optionA: {
      label: "Dukung Pesta Rakyat",
      subtext: "Biayai 20 emas dan sediakan 20 pangan",
      effects: { emas: -20, pangan: -20, kepuasan: 30, harmoni: 15 },
      reactionQuote: "Gamelan berbunyi merdu dan tawa anak-anak memenuhi alun-alun! Hidup Gusti Prabu!",
      toastNotice: "PESTA SEDEKAH BUMI MERIAH!"
    },
    optionB: {
      label: "Tunda Pesta",
      subtext: "Simpan semua pangan dan emas ke lumbung",
      effects: { pangan: 10, kepuasan: -15 },
      reactionQuote: "Alun-alun terasa sepi dan sunyi... rakyat menyimpan kekecewaan di dalam dada.",
      toastNotice: "PESTA DIBATALKAN: WANUA HENING"
    }
  },
  {
    id: "dilemma_08_pencuri_lumbung",
    character: CHARACTERS.si_garang,
    situation: "Tertangkap basah! Dua pencuri kelaparan menyelinap ke Lumbung Desa mencuri sekarung beras. Prajurit ronda menangkap mereka. Hukum cambuk di tiang keraton atau pekerjakan di sawah?",
    optionA: {
      label: "Ampuni & Jadikan Buruh Sawah",
      subtext: "Tunjukkan keadilan welas asih",
      effects: { pangan: 15, kepuasan: 15, ancamanBandit: -10 },
      reactionQuote: "Mereka menangis sujud dan bersumpah mencangkul sawah tanpa bayaran hingga lunas!",
      toastNotice: "WELAS ASIH PRABU: PENCURI BERTOBAT"
    },
    optionB: {
      label: "Hukum Keras di Alun-Alun",
      subtext: "Tegakkan hukum tanpa kompromi",
      effects: { ancamanBandit: -20, kepuasan: -8, pasukan: 5 },
      reactionQuote: "Tak ada lagi yang berani melirik lumbung! Hukum besi tegak di Wanua Sendang.",
      toastNotice: "HUKUM DITEGAKKAN: BANDIT GENTAR"
    }
  },
  {
    id: "dilemma_09_naga_menggeliat",
    character: CHARACTERS.nyai_sendang,
    situation: "Tanah di tepi sungai bergetar halus dan air Sendang mendidih keemasan! Sang Hyang Naga Tuntang sedang menggeliat dalam tidurnya. Sediakan persembahan ketan kuning atau siapkan panah pemburu naga?",
    optionA: {
      label: "Haturkan Persembahan Damai",
      subtext: "Keluarkan 30 pangan untuk sesaji suci",
      effects: { pangan: -30, harmoni: 35, kepuasan: 10 },
      reactionQuote: "Gelombang air mereda kembali tenang... Sang Naga berbalik tidur dengan membawa berkah.",
      toastNotice: "SANG NAGA TENANG: AIR MENGALIR JERNIH"
    },
    optionB: {
      label: "Siagakan Tombak & Busur",
      subtext: "Wanua tidak tunduk pada monster liar",
      effects: { pasukan: 15, harmoni: -30, ancamanBandit: -10 },
      reactionQuote: "Kalian menantang murka sang penguasa air! Badai ombak akan menguji pertahananmu!",
      toastNotice: "PASUKAN SIAGA: NAGA MENGGERAM"
    }
  },
  {
    id: "dilemma_10_utusan_kadipaten",
    character: CHARACTERS.raden_aryo,
    situation: "Utusan dari Kadipaten seberang datang membawa surat persekutuan. Mereka meminta bantuan pasokan 30 pangan sekarang, dan menjanjikan kiriman 15 prajurit pelindung di musim depan.",
    optionA: {
      label: "Kirim Bantuan Pangan",
      subtext: "Bantu tetangga demi ikrar aliansi",
      effects: { pangan: -30, pasukan: 12, kepuasan: 10 },
      reactionQuote: "Aliansi terjalin erat! Kadipaten seberang kini menjadi perisai hidup wanua kita.",
      toastNotice: "IKRAR SEPAKAT: ALIANSI KIAN KOKOH"
    },
    optionB: {
      label: "Tolak Halus Permintaan",
      subtext: "Wanua Sendang harus mencukupi diri sendiri",
      effects: { kepuasan: -5 },
      reactionQuote: "Utusan pulang dengan tangan hampa. Hubungan diplomasi menjadi dingin.",
      toastNotice: "DIPLOMASI DITOLAK: WANUA NETRAL"
    }
  }
];
