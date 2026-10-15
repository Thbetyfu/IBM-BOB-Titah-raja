# 👑 TITAH RAKYAT: Sovereign of the Living Realm
> **Game Strategi Kerajaan MMO Berbasis Multi-Agent AI & Verifikasi Geolokasi Fisik Onsite**  
> *Developed for IBM Code the Future Competition 2026 in Strategic Partnership with IBM Bob*

[![Architecture: C4 Model](https://img.shields.io/badge/Architecture-C4_Model-blue.svg)](#)
[![Standard: IEEE 830 / ISO 29148](https://img.shields.io/badge/SRS-IEEE_830-success.svg)](#)
[![Standard: IEEE 1016](https://img.shields.io/badge/SDD-IEEE_1016-orange.svg)](#)
[![AI Partner: IBM Bob](https://img.shields.io/badge/AI_Partner-IBM_Bob-blueviolet.svg)](#)
[![Tests: 79 Passing](https://img.shields.io/badge/Tests-79%20Passing%20(100%25)-brightgreen.svg)](#)
[![Privacy: Zero GPS Storage](https://img.shields.io/badge/Privacy-Zero_GPS_Storage-blue.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)

---

## 🌟 Sekilas Produk (Product Overview)

**Titah Rakyat** adalah game strategi kerajaan *Massively Multiplayer Online* (MMO) generasi baru berlatar belakang kepulauan Nusantara fiktif (**Wanua Sendang**). 

Tidak seperti game strategi tradisional di mana rakyat hanyalah angka statistik pasif, di **Titah Rakyat**:
* **Rakyat, Alam, dan Bandit adalah Agen AI Otonom (*Autonomous Utility-Based AI Agents*):** Mereka memiliki hierarki kebutuhan (lapar, aman, adil, trust), kepribadian independen, memori sosial (*social memory*), serta hak mutlak untuk mematuhi atau menggulingkan (*kudeta*) rajanya sendiri.
* **Diplomasi Fisik Dunia Nyata (True Co-Located Proximity):** Pemain yang bermain sendiri (*soliter*) hanya dapat bertahan. Untuk menyerang kerajaan lain atau menumbangkan Boss bersama, pemain **wajib bertemu langsung secara fisik di dunia nyata ($\le 200\text{ meter}$)** dan melakukan *handshake* aliansi onsite tanpa melanggar privasi lokasi (kepatuhan UU PDP No. 27/2022).
* **Tata Kelola Bahasa Alami (Natural Language Governance):** Raja memimpin dengan kata-kata. Pemain dapat mengeluarkan titah kebijakan teks bebas dalam bahasa Indonesia yang diekstrak secara objektif oleh AI Adapter ke dalam 6 vektor numerik berdampak nyata.

---

## 🚀 Panduan Cepat Menjalankan (Quick Start Guide)

Proyek ini telah dikemas secara *production-ready* dan dapat dijalankan dengan dua cara:

### Cara 1: Menggunakan Docker Compose (Multi-Container) — Direkomendasikan
Pastikan [Docker Desktop](https://www.docker.com/) telah terpasang dan berjalan di sistem Anda:

```bash
# 1. Salin template variabel lingkungan
cp .env.example .env

# 2. Bangun citra dan jalankan seluruh cluster (Postgres, Redis, Backend, Frontend)
docker compose up --build
```
Aplikasi siap diakses:
* **Frontend Web HUD:** `http://localhost:3000`
* **Backend API & Health Check:** `http://localhost:3001/health`
* **WebSocket Gateway:** `ws://localhost:3001/ws`

---

### Cara 2: Menjalankan Secara Lokal (Bare-Metal Node.js)
Pastikan Node.js 20+ telah terpasang di sistem Anda:

```bash
# 1. Pasang seluruh dependensi backend dan frontend
npm install
npm --prefix frontend install

# 2. Inisialisasi basis data Prisma
npx prisma generate

# 3. Jalankan automated test suite (79 Test Cases)
npm test

# 4. Jalankan profil benchmark performa ekstrem
npm run benchmark

# 5. Jalankan backend server (Port 3001)
npm run dev

# 6. Jalankan frontend Vite dev server (Port 3000)
npm run frontend:dev
```

---

## ⚡ Tolok Ukur Kinerja Ekstrem (Live Performance Benchmarks)

Diukur menggunakan profiler otomatis `scripts/benchmark.ts` pada prosesor standar:

| Metrik Kinerja | Target SLA Kompetisi | Hasil Aktual Titah Rakyat | Keterangan & Keunggulan |
| :--- | :---: | :---: | :--- |
| **Latensi Evaluasi 10.000 Agen ECS** | $< 100\text{ ms}$ | **1.378 ms** | 🏆 **72.5x Lebih Cepat** (7.25M agen/detik) |
| **Throughput Geodesik Haversine** | $> 500.000\text{ ops/s}$ | **7.056.043 ops/s** | 🏆 **14.1x Melampaui Target** |
| **Pemusnahan Memori GPS (Zeroize)** | $< 50\text{ ms}$ | **0.613 ms** | 🛡️ **100% Bebas Jejak GPS di RAM** |
| **Throughput Siklus Makroekonomi** | $> 100.000\text{ ops/s}$ | **5.793.911 ops/s** | ⚡ **Kalkulasi Deterministik Zero-Alloc** |
| **Jejak Memori RSS Node.js** | $< 512\text{ MB}$ | **76.68 MB** | 💾 **Hanya 15% dari Ambang Batas** |
| **Test Suite Pass Rate** | $100\%$ | **79 / 79 Tests Pass** | ✅ **Nol Cacat Regresi** |

---

## 📚 Berkas Pengumpulan & Dokumentasi Rekayasa Perangkat Lunak

Seluruh rekayasa sistem ini terdokumentasi secara lengkap dan formal:

1. **[Master Product Requirements Document (PRD v2.0)](doc/PRD.md):** Visi produk, 6 pilar inovasi, aturan gameplay berdekatan, model matematika ekonomi, pertempuran PvP, ekspedisi moral, FSM Boss, dan skema database.
2. **[Software Requirements Specification (SRS v2.1)](doc/SRS.md) — *IEEE Std 830-1998*:** 18 Use Cases (UC-01 s.d UC-18), 24 Kebutuhan Fungsional (FR-01 s.d FR-24), 10 Kebutuhan Non-Fungsional (NFR-01 s.d NFR-10), dan Matriks Keterlacakan Kebutuhan.
3. **[Software Design Description (SDD v2.1)](doc/SDD.md) — *IEEE Std 1016-2009*:** C4 Model, arsitektur ECS Multi-Agent, Circuit Breaker NLP, kanvas 2.5D Pixi.js v8, Web Audio Slendro/Pelog, dan skema PostgreSQL 16.
4. **[Pitch Deck 5 Slide (Kompetisi)](doc/PITCH_DECK.md):** Presentasi 5 slide padat untuk dewan juri (Problem, Audience, Innovation, IBM Bob, Expected Impact).
5. **[Skrip Walkthrough Video Demo (3 Menit)](doc/DEMO_SCRIPT.md):** Panduan detik demi detik video demonstrasi gameplay beresolusi tinggi.
6. **[Laporan Pelacakan Bobalytics & Koin](bob-log/coins_tracker.md):** Audit kepatuhan 40% kemitraan IBM Bob dan efisiensi alokasi 500 Bob Coins.
7. **[Master QA & Bug Tracker](doc/QA_TRACKER.md):** Matriks 5 fase pengujian jaminan mutu dan riwayat penutupan 25 bug teknis.
8. **[Master Engineering Roadmap](ROADMAP.md):** Alur sprint pelaksanaan Agile Scrum dari Sprint 0 hingga Sprint 5.

---

## 🏛️ Arsitektur Sistem Global (System Architecture)

```
+───────────────────────────────────────────────────────────────────────────────────+
│                              CLIENT TIER (HTML5 / 2.5D CANVAS / REACT)             │
│  - 2.5D Isometric Renderer (Pixi.js v8 + WebGL) - Procedural Gamelan Audio Engine │
│  - W3C Geolocation API + Anti-Tamper Client     - Reactive State Store (Zustand)  │
+─────────────────────────────────────────▲─────────────────────────────────────────+
                                          │ WSS (RFC 6455) / TLS 1.3
+─────────────────────────────────────────▼─────────────────────────────────────────+
│                                  EDGE GATEWAY & LB                                │
│  - Traefik v3 Reverse Proxy (TLS 1.3 Termination, Rate Limiting 20 req/s)         │
│  - JWT Authenticator & OWASP Input Sanitizer                                      │
+─────────────────────────────────────────▲─────────────────────────────────────────+
                                          │ Internal IPC / Event Stream
+─────────────────────────────────────────▼─────────────────────────────────────────+
│                       CORE SIMULATION CLUSTER (NODE.JS 20 LTS)                    │
│                                                                                   │
│  +─────────────────────────+   +────────────────────────+   +──────────────────+  │
│  |  World Orchestrator     |   |   Agent Behavior Sim   |   |   Combat & War   |  │
│  |  - 45s Tick Loop Engine |<->|   - Data-Oriented ECS  |<->|   Engine         |  │
│  |  - 5-Subphase State FSM |   |   - Dot Product 6x6    |   |   - PvP & Siege  |  │
│  +─────────────────────────+   +────────────────────────+   +──────────────────+  │
│               ▲                            ▲                          ▲           │
│  +────────────▼────────────+   +───────────▼────────────+             │           │
│  |   AI Decree NLP Gateway |   |   Geoposition Verifier |             │           │
│  |   - Circuit Breaker FSM |   |   - Haversine Clamped  |             │           │
│  |   - 18 Policy Cards     |   |   - Anti-Mock Sensor   |             │           │
│  +─────────────────────────+   +────────────────────────+             │           │
+─────────────────────────────────────────▲─────────────────────────────│───────────+
                                          │                             │
+─────────────────────────────────────────▼─────────────────────────────▼───────────+
│                               PERSISTENCE & CACHING TIER                          │
│  - Redis 7: Ephemeral Geo Handshake Token (TTL 10s), Delta State Buffer           │
│  - PostgreSQL 16: Relational State, Range Partitioned by Season, B-Tree Indexes   │
+───────────────────────────────────────────────────────────────────────────────────+
```

---

## 🎮 Siklus Musim 45 Detik (The 45-Second Tick Loop)

Setiap musim di Wanua Sendang berjalan tepat **45 detik waktu nyata** yang dibagi menjadi 5 sub-fase deterministik:

1. **Fase 00–05s:** Penerimaan Titah (18 Kartu Kebijakan atau Teks Bebas NLP).
2. **Fase 05–20s:** Simulasi Mandiri Agen Rakyat (Pemilihan aksi: bekerja, berdagang, mengeluh, mencuri, mengungsi, memberontak).
3. **Fase 20–30s:** Ekologi Alam (Harmoni, Paceklik, Banjir) & Manuver Pembelajaran Faksi Bandit Si Garang (*Epsilon-Greedy*).
4. **Fase 30–40s:** Resolusi Pertempuran PvP, Aliansi Onsite, Ekspedisi Perbatasan, dan Pasar.
5. **Fase 40–45s:** Evaluasi Tiga Syarat Keruntuhan Kerajaan (*Kudeta*, *Kelaparan 2 Musim*, *Kehancuran Bandit*) & Broadcast Snapshot WebSocket.

---

## 🤝 Kemitraan Rekayasa IBM Bob

Pengembangan proyek ini mengikuti standar konvensi komit git berpasangan dengan **IBM Bob**:
* `[bob:scaffold]` : Konfigurasi fondasi proyek, Docker Compose, dan skema Prisma ORM.
* `[bob:algorithm]` : ECS `AgentMemoryPool`, formula Haversine, dan Epsilon-Greedy bandit.
* `[bob:network]` : Implementasi server WebSocket RFC 6455 dan protokol enkripsi TLS 1.3.
* `[bob:security]` : Implementasi Circuit Breaker, prompt injection guard, dan Zeroize memory wiper.
* `[bob:test]` : Konstruksi suite pengujian otomatis (`sim.test.ts`, `geo.test.ts`, `ai.test.ts`, `expedition.test.ts`, `e2e.test.ts`).
* `[bob:doc]` : Penyusunan PRD, SRS, SDD, Master Roadmap, Pitch Deck 5 Slide, dan skrip video demo.

Riwayat interaksi terekam utuh pada [`bob-log/activity_log.jsonl`](bob-log/activity_log.jsonl).

---

## 👥 Pengembang & Lisensi

* **Author:** @Thbetyfu (@ThoriqAbdurrohmanTaqy)
* **Lead System Architect:** Antigravity AI
* **AI Pair Programming Partner:** IBM Bob
* **Lisensi:** MIT License (2026)
