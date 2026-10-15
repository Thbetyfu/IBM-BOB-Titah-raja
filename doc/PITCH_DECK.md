# 🏛️ PITCH DECK 5 SLIDE: TITAH RAKYAT
## Sovereign of the Living Realm
> **Kategori:** IBM Code the Future Competition 2026 (Beginner Track)  
> **Tema:** Mini-Game Inovatif Berbasis Multi-Agent AI & Physical Proximity  
> **Repositori Resmi:** [github.com/Thbetyfu/IBM-BOB-Titah-raja](https://github.com/Thbetyfu/IBM-BOB-Titah-raja)  

---

```
======================================================================================================
                                          SLIDE 1 / 5
======================================================================================================
```
## 🎯 SLIDE 1: IDENTIFIKASI MASALAH & ANGGAPAN STATUS QUO
### *"Game Strategi Konvensional Telah Mati Rasa: Aliansi Semu & NPC Tanpa Jiwa"*

### 1. Titik Krisis (The Core Problem)
* **NPC Statis & Terprediksi:** Di game strategi konvensional (*Rise of Kingdoms, Clash of Clans*), rakyat hanyalah angka statistik pasif. Pemain menghafal formula matematis statis; keputusan moral tidak memiliki konsekuensi organik.
* **Diplomasi Pasif & Isolasi Digital:** Fitur "aliansi" di game mobile modern telah terdegradasi menjadi tombol klik instan tanpa hubungan sosial nyata. Pemain terisolasi di balik layar gawai masing-masing.
* **Tirani Titah Statis:** Tombol kebijakan kaku (*preset buttons*) membatasi kebebasan ekspresi pemain dalam memimpin bangsanya.

### 2. Pertanyaan Riset Utama (Research Question)
> *"Bagaimana jika rakyat sebuah kerajaan adalah kumpulan agen otonom yang hidup, memiliki hierarki kebutuhan nyata, mampu menilai kata-kata rajanya lewat AI, dan dapat bersekutu hanya jika para pemain bertemu langsung di dunia nyata?"*

### 3. Visi Solusi: Titah Rakyat
Sebuah mini-game strategi kerajaan MMO yang menggabungkan:
1. **Living Populace Multi-Agent ECS:** Rakyat otonom yang bisa mogok kerja, mencuri, mengungsi, atau menggulingkan raja (*kudeta*).
2. **True Co-Located Physical Alliance ($\le 200\text{ m}$):** Diplomasi dunia nyata dengan kepatuhan privasi mutlak (UU PDP No. 27/2022).
3. **Natural Language Governance:** Raja memimpin dengan mengetik titah bebas bahasa Indonesia yang diekstrak AI menjadi vektor numerik objektif.

---

```
======================================================================================================
                                          SLIDE 2 / 5
======================================================================================================
```
## 👥 SLIDE 2: TARGET PENGGUNA & PERSONA
### *"Pemain Strategi Dewasa yang Menuntut Bobot Moral & Interaksi Sosial Nyata"*

### 1. Segmentasi Pengguna (Target Audience)
* **Segmen Utama (Core Gamer 18+):** Mahasiswa dan pekerja muda penggemar *Crusader Kings, Civilization, Rust, dan Suikoden*. Mereka mencari kedalaman taktis, intrik politik kerajaan, dan konsekuensi kepemimpinan yang tidak bisa ditebak.
* **Segmen Komunitas & Kampus:** Kelompok pertemanan fisik (circle kampus, kafe, asrama) yang ingin bermain bersama dalam satu ruangan dengan tensi kompetisi tatap muka.
* **Segmen Kasual Mobile:** Pemain yang menyukai sesi bermain cepat dan intens (1 siklus permainan = 20 musim $\times$ 45 detik $\approx$ 15 menit).

### 2. Persona Utama: "Bima, 21 Tahun (Mahasiswa & Guild Leader)"
* **Frustrasi:** Bosan dengan game perang mobile yang *pay-to-win* dan aliansi yang anggotanya tidak pernah saling kenal.
* **Kebutuhan:** Ingin game strategi di mana negosiasi terjadi secara fisik tatap muka, titah bahasa Indonesia dipahami game, dan rakyatnya bisa memprotes jika ia bertindak lalim.
* **Momen "Aha!":** Saat HP-nya mendeteksi teman satu mejanya di kantin kampus ($\le 200\text{ m}$), radar menyala hijau, mereka mengikrarkan sumpah aliansi, lalu bersama-sama mengerahkan pasukan untuk menggempur Boss Naga Banjir pada Musim 20.

---

```
======================================================================================================
                                          SLIDE 3 / 5
======================================================================================================
```
## 💡 SLIDE 3: KONSEP INOVASI & ARSITEKTUR GAMEPLAY
### *"Living Realm: Tiga Pilar Inovasi yang Mengubah Paradigma Game Strategi"*

```
+────────────────────────────────────────────────────────────────────────────────────────────────────+
|                                    TIGA PILAR INOVASI TITAH RAKYAT                                 |
+────────────────────────────────────────────────────────────────────────────────────────────────────+
| 1. LIVING POPULACE (ECS)         | 2. CO-LOCATED ALLIANCE            | 3. NATURAL LANGUAGE GOVERNANCE|
| - Data-oriented Float32Array     | - Radius Haversine <= 200 m       | - NLP Semantic Extractor (ID) |
| - Evaluasi dot product 6x6       | - Anti-Spoofing & Replay Guard    | - 18 Kartu Kebijakan Nusantara|
| - 6 Aksi: Tani, Pasar, Curang,   | - Zero-Knowledge Memory Wiper     | - Circuit Breaker SLA < 4.0s  |
|   Protes, Mengungsi, Kudeta      | - Nol byte GPS ke Database/Disk   | - Fallback Regex Deterministik|
+────────────────────────────────────────────────────────────────────────────────────────────────────+
```

### 1. Siklus Musim Deterministik 45 Detik (Universal Tick Loop)
* **00–05s:** Titah Raja (NLP / Kartu Kebijakan).
* **05–20s:** Evaluasi Otonom Agen Rakyat (Simulasi ECS berkecepatan 7.25 juta agen/detik).
* **20–30s:** Ekologi Alam (Harmoni vs Bencana) & Pembelajaran Faksi Bandit (*Epsilon-Greedy*).
* **30–40s:** Resolusi Pertempuran PvP, Aliansi Onsite (+50% Power Boost), Ekspedisi Perbatasan (3 Doktrin Moral: Jarah, Kerja Paksa, Rangkul).
* **40–45s:** Evaluasi Syarat Kejatuhan Dinasti (Kudeta Rakyat, Kelaparan 2 Musim, Serbuan Bandit) & Lahir Kembali (*Reincarnation*) dengan Skor Warisan Leluhur.

### 2. Pertarungan Epik Musim 20: Boss Naga Banjir (500 HP)
* **Harmoni Lingkungan $\ge 50$:** Naga memberkati tanah Sendang (+100 Pangan), kerajaan masuk ke Era Keemasan (*Golden Era*).
* **Harmoni Lingkungan $< 50$:** Naga Mengamuk (Boss HP 500). Pemain soliter dipastikan gugur; kemenangan hanya dapat diraih lewat koalisi aliansi fisik onsite yang mengumpulkan damage gabungan!

---

```
======================================================================================================
                                          SLIDE 4 / 5
======================================================================================================
```
## 🤖 SLIDE 4: PEMANFAATAN IBM BOB & KELAYAKAN TEKNIS
### *"Pair Programming Intensif, Zero Dead Code, & Kinerja Ekstrem Bersama IBM Bob"*

### 1. Kemitraan AI IBM Bob (Kepatuhan Rubrik 40%)
* **Alokasi 500 Bob Coins:** 440 Koin dialokasikan secara efisien di 5 mode (`architect`, `code`, `network`, `security`, `test`), menyisakan 60 koin cadangan (Efisiensi 88.0%).
* **100% Git Commit Tagging:** Seluruh komit tercatat dengan tag resmi `[bob:*]` (`[bob:scaffold]`, `[bob:algorithm]`, `[bob:network]`, `[bob:security]`, `[bob:test]`, `[bob:doc]`).
* **Bobalytics Activity Log:** Seluruh interaksi prompt tercatat di `bob-log/activity_log.jsonl` dan diaudit di `bob-log/coins_tracker.md`.

### 2. Hasil Tolok Ukur Kinerja Nyata (Live Benchmark Results)
Berdasarkan pengujian performa otomatis pada `scripts/benchmark.ts` & 79 Automated Tests (`vitest`):

| Parameter Uji Kinerja | Target SLA Lomba | Hasil Aktual Titah Rakyat | Status Verifikasi |
| :--- | :---: | :---: | :---: |
| **Latensi Evaluasi 10.000 Agen ECS** | $< 100\text{ ms}$ | **1.378 ms** (7.25 Juta Agen/detik) | 🏆 **72.5x Lebih Cepat** |
| **Throughput Geodesik Haversine** | $> 500.000\text{ ops/s}$ | **7.056.043 ops/detik** | 🏆 **14.1x Melampaui Target** |
| **Waktu Pemusnahan Memori GPS** | $< 50\text{ ms}$ | **0.613 ms** (Zero Residual GPS) | 🛡️ **100% Patuh UU PDP** |
| **Throughput Kalkulasi Makroekonomi** | $> 100.000\text{ ops/s}$ | **5.793.911 siklus/detik** | ⚡ **Ultra Responsive** |
| **Jejak Memori Proses (Node.js RSS)** | $< 512\text{ MB}$ | **76.68 MB** (Bebas Memory Leak) | 💾 **Hanya 15% dari Batas** |
| **Automated Test Pass Rate** | $100\%$ | **79 / 79 Tests Pass (100%)** | ✅ **Nol Cacat Regresi** |

---

```
======================================================================================================
                                          SLIDE 5 / 5
======================================================================================================
```
## 🌏 SLIDE 5: DAMPAK, SOSIO-KULTURAL, & RENCANA SKALABILITAS
### *"Dari Prototipe Kompetisi Menuju Standar Baru Game Sosial Beradab"*

### 1. Dampak Nyata bagi Industri & Masyarakat
* **Revitalisasi Nilai Kepemimpinan Nusantara:** Nilai gotong royong, keadilan distributif lumbung pangan, dan pelestarian alam (*Harmoni Ekologi*) diintegrasikan ke dalam mekanisme komputasi nyata—bukan sekadar narasi hiasan.
* **Solusi Penanggulangan Isolasi Sosial (Anti-Isolation Gaming):** Mewajibkan kedekatan fisik $\le 200\text{ m}$ mengubah game online dari sarana alienasi menjadi katalis interaksi komunitas dunia nyata di lingkungan kampus, sekolah, dan perkantoran.
* **Privasi Tanpa Kompromi (Privacy by Design):** Menjadi preseden bahwa fitur berbasis geolokasi dapat dibangun tanpa memata-matai atau menyimpan titik koordinat pengguna (Zero-Knowledge RAM Wiper $< 0.613\text{ ms}$).

### 2. Roadmap Skalabilitas Komersial (Post-Competition Roadmap)
* **Q4 2026:** Validasi KYC 18+ terdesentralisasi, peluncuran Cluster Server Nasional (Kubernetes Multi-Region), dan pembukaan Turnamen Mahasiswa Nusantara.
* **Q1 2027:** Implementasi Agen Rakyat Berbasis *Deep Reinforcement Learning* (Rakyat yang belajar adaptif dari taktik ribuan raja) dan rilis Mobile Native (iOS & Android).
* **Q2 2027:** Kemitraan Kurikulum Edukasi Kepemimpinan dan Simulasi Tata Kelola Publik (*Civic Governance Simulator*).

---

### 👑 Kesimpulan untuk Dewan Juri
> *"Titah Rakyat membuktikan bahwa kecerdasan buatan, rekayasa perangkat lunak yang berdisiplin tinggi bersama IBM Bob, dan kearifan lokal Indonesia mampu melahirkan sebuah game strategi yang tidak hanya cerdas dan adiktif secara teknologi, namun juga menghidupkan kembali hubungan sosial manusia di dunia nyata."*
