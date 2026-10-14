# 👑 TITAH RAKYAT: Sovereign of the Living Realm
> **Game Strategi Kerajaan MMO Berbasis Multi-Agent AI & Verifikasi Geolokasi Fisik Onsite**  
> *Developed for IBM Code the Future Competition in Partnership with IBM Bob*

[![Architecture: C4 Model](https://img.shields.io/badge/Architecture-C4_Model-blue.svg)](#)
[![Standard: IEEE 830 / ISO 29148](https://img.shields.io/badge/SRS-IEEE_830-success.svg)](#)
[![Standard: IEEE 1016](https://img.shields.io/badge/SDD-IEEE_1016-orange.svg)](#)
[![AI Partner: IBM Bob](https://img.shields.io/badge/AI_Partner-IBM_Bob-blueviolet.svg)](#)

---

## 🌟 Sekilas Produk (Product Overview)

**Titah Rakyat** adalah game strategi kerajaan *Massively Multiplayer Online* (MMO) generasi baru berlatar belakang kepulauan Nusantara fiktif (**Wanua Sendang**). 

Tidak seperti game strategi tradisional di mana rakyat hanyalah angka statistik pasif, di **Titah Rakyat**:
* **Rakyat, Alam, dan Bandit adalah Agen AI Otonom (*Autonomous Utility-Based AI Agents*):** Mereka memiliki hierarki kebutuhan (lapar, aman, adil, trust), kepribadian independen, memori sosial (*social memory*), serta hak mutlak untuk mematuhi atau menggulingkan (*kudeta*) rajanya sendiri.
* **Diplomasi Fisik Dunia Nyata (True Co-Located Proximity):** Pemain yang bermain sendiri (*soliter*) hanya dapat bertahan. Untuk menyerang kerajaan lain atau menumbangkan Boss bersama, pemain **wajib bertemu langsung secara fisik di dunia nyata ($\le 200\text{ meter}$)** dan melakukan *handshake* aliansi onsite tanpa melanggar privasi lokasi (kepatuhan UU PDP No. 27/2022).
* **Tata Kelola Bahasa Alami (Natural Language Governance):** Raja memimpin dengan kata-kata. Pemain dapat mengeluarkan titah kebijakan teks bebas dalam bahasa Indonesia yang diekstrak secara objektif oleh AI Adapter ke dalam 6 vektor numerik berdampak nyata.

---

## 📚 Dokumentasi Rekayasa Perangkat Lunak (Master Engineering Documents)

Sistem ini dirancang secara formal mengacu pada standar rekayasa perangkat lunak internasional:

1. **[Master Product Requirements Document (PRD v2.0)](doc/PRD.md):**  
   Visi produk, 6 pilar inovasi, aturan gameplay berdekatan (*co-located experience*), model matematika loop ekonomi makro, resolusi pertempuran PvP, ekspedisi NPC, FSM Boss Naga Banjir, dan skema database relasional.
2. **[Software Requirements Specification (SRS v2.1)](doc/SRS.md) — *IEEE Std 830-1998 / ISO/IEC/IEEE 29148:2018*:**  
   Spesifikasi 18 Use Case lengkap (UC-01 s.d UC-18), 24 Kebutuhan Fungsional berstandar BDD (FR-01 s.d FR-24), 10 Kebutuhan Non-Fungsional kuantitatif (NFR-01 s.d NFR-10), dan Matriks Keterlacakan Kebutuhan (*Traceability Matrix*).
3. **[Software Design Description (SDD v2.1)](doc/SDD.md) — *IEEE Std 1016-2009*:**  
   Cetak biru teknis C4 Model (Context, Container, Component, Dynamic Flow 45s), desain arsitektur ECS Multi-Agent Zero-GC, gateway NLP Circuit Breaker, verifikator Haversine anti-spoofing, kanvas 2.5D Pixi.js v8, sintesis Web Audio gamelan, skema PostgreSQL 16 dengan *Declarative Range Partitioning*, dan topologi Docker Compose.

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
* `[bob:test]` : Konstruksi suite pengujian otomatis (`sim.test.ts`, `geo.test.ts`, `ai.test.ts`, `expedition.test.ts`).

---

## 👥 Pengembang & Lisensi

* **Author:** @Thbetyfu (@ThoriqAbdurrohmanTaqy)
* **Lead System Architect:** Antigravity AI
* **AI Pair Programming Partner:** IBM Bob
* **Lisensi:** MIT License (2026)
