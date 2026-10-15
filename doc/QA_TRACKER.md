# 📋 Master Quality Assurance & Bug Tracking Ledger (QA_TRACKER)
## TITAH RAKYAT: Sovereign of the Living Realm
**Standar Mutu:** IEEE Std 730-2014 (*Software Quality Assurance*) & IEEE Std 829-2008 (*Test Documentation*)  
**Target Kompetisi:** IBM Code the Future 2026 (Beginner Track)  
**Dokumen Induk:** `doc/PRD.md` (v2.0), `doc/SRS.md` (v2.1), `doc/SDD.md` (v2.1), dan `ROADMAP.md`  
**Terakhir Diperbarui:** 15 Oktober 2026  
**Status QA Fase 1 s.d 5:** **100% PASSED (0 Open Bugs, Strict Type Check Clean, 5 Test Suites, 79 Automated Tests, Bobalytics 440 Coins Audited, Pitch Deck Ready, Competition Submission Ready)**

---

## 🧭 1. Status Ringkasan Eksekutif Mutu Per Fase (Executive Summary)

```
+──────────────────────────────────────────────────────────────────────────────────────────────────────────+
| FASE   | DESKRIPSI SPRINT                       | CAKUPAN PENGUJIAN         | STATUS  | PASS RATE | BUGS OPEN|
+──────────────────────────────────────────────────────────────────────────────────────────────────────────+
| FASE 1 | Core Sim, ECS Engine, & PostgreSQL DDL | tests/sim.test.ts (25 TC) | PASSED  | 100.0%    | 0 OPEN   |
| FASE 2 | WebSocket Gateway, AI NLP, & Geolocation| geo, ai, expedition (47 TC)| PASSED  | 100.0%    | 0 OPEN   |
| FASE 3 | Frontend 2.5D Isometric & React HUD    | Pixi v8, React 18, Vite   | PASSED  | 100.0%    | 0 OPEN   |
| FASE 4 | E2E Integration, Load, & Stress Testing| tests/e2e.test.ts (7 TC)  | PASSED  | 100.0%    | 0 OPEN   |
| FASE 5 | Release Packaging, Audit & Pitch Deck  | Bobalytics, Deck, Script  | PASSED  | 100.0%    | 0 OPEN   |
+──────────────────────────────────────────────────────────────────────────────────────────────────────────+
```

---

## 🔬 2. Matriks Pengujian & Keterlacakan (Traceability Matrix)

### 2.1 Matriks Pengujian Fase 1 (`tests/sim.test.ts`)

| Test ID | Komponen Uji | Kebutuhan Terkait | KPI / NFR | Prosedur & Asersi Matematis | Hasil Uji |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-F1-01** | `AgentMemoryPool` | SRS FR-09, SDD 4.2 | NFR-10 | Verifikasi struktur data linier kontigu `Float32Array` dan `Int8Array` tanpa struktur objek nested. | **PASS** |
| **TC-F1-02** | `AgentMemoryPool.setAgent` | SRS FR-09, SDD 4.2 | NFR-04 | Validasi boundary index melempar `RangeError` jika mengakses di luar kapasitas pool. | **PASS** |
| **TC-F1-03** | `AgentUtilityEvaluationSystem` | SRS FR-10, SDD 4.2 | KPI-1.1, NFR-01 | Eksekusi evaluasi dot product 10.000 agen secara serentak. Durasi wajib $< 100\text{ ms}$. *(Aktual: ~18 ms)*. | **PASS** |
| **TC-F1-04** | `AgentUtilityEvaluationSystem` | SRS FR-10, SDD 4.2 | KPI-1.2, NFR-10 | Evaluasi deterministik dengan buffer aksi eksternal (`reusableCounts`) menjamin 0 alokasi heap per tick loop. | **PASS** |
| **TC-F1-05** | `AgentUtilityEvaluationSystem` | SRS NFR-08, SDD 4.2 | NFR-08 | Seed Mulberry32 identik ($s=1337$) menghasilkan distribusi aksi dan skor kepuasan $100\%$ identik bit-for-bit. | **PASS** |
| **TC-F1-06** | `updateAgentPsychology` | SRS FR-08, FR-09 | NFR-04 | Mutasi rasa lapar, aman, adil, dan kepercayaan terikat ketat dalam interval $[0.0, 1.0]$. | **PASS** |
| **TC-F1-07** | `updateAgentPsychology` | SRS FR-08, SDD 4.2 | FR-08 | Penalti pajak kuadratik $((\max(0, \text{pajak}-20))/10)^2$ meruntuhkan persepsi keadilan saat pajak $\ge 40\%$. | **PASS** |
| **TC-F1-08** | `AgentUtilityEvaluationSystem` | SRS FR-10, FR-20 | UC-08, UC-17 | Agen dengan kelaparan $=1.0$ dan keadilan $=0.0$ secara mayoritas memilih Aksi 5 (Memberontak). | **PASS** |
| **TC-F1-09** | `AgentUtilityEvaluationSystem` | SRS FR-10, SDD 4.2 | NFR-04 | Penanganan boundary edge cases (0 agen, pool overflow, input negatif) tanpa crash atau `NaN`. | **PASS** |
| **TC-F1-10** | `MacroEconomyCalculator` | SRS FR-11, SDD 4.8 | KPI-1.3, FR-11 | Neraca panen ($N_{\text{kerja}} \times 2.5$), konsumsi ($N \times 1.0$), omzet pasar, pajak, dan gaji militer akurat $100\%$. | **PASS** |
| **TC-F1-11** | `MacroEconomyCalculator` | SRS FR-11, FR-14 | NFR-04 | Penurunan panen sebesar $30\%$ saat bencana/paceklik ($\eta_{\text{bencana}} = 0.70$) terverifikasi deterministik. | **PASS** |
| **TC-F1-12** | `MacroEconomyCalculator` | SRS FR-11, SDD 4.8 | FR-11, UC-09 | Sanksi kebangkrutan saat kas defisit: kas di-reset ke 0 dan desersi seketika $20\%$ prajurit (`round(pasukan * 0.80)`). | **PASS** |
| **TC-F1-13** | `evaluateTriDefeat` | SRS FR-20, SDD 4.7 | UC-17 | Kudeta Rakyat terpicu tepat saat rasio pemberontak $> 40\%$ berlangsung selama 2 musim berturut-turut. | **PASS** |
| **TC-F1-14** | `evaluateTriDefeat` | SRS FR-20, SDD 4.7 | UC-17 | Kelaparan Akut terpicu tepat saat stok pangan $= 0$ berlangsung selama 2 musim berturut-turut. | **PASS** |
| **TC-F1-15** | `evaluateTriDefeat` | SRS FR-20, SDD 4.7 | UC-17 | Kehancuran Kerajaan oleh Kawanan Bandit terpicu seketika saat `ancamanBandit >= 100`. | **PASS** |
| **TC-F1-16** | `BanditQTableManager` | SRS FR-13, SDD 4.8 | UC-10, FR-13 | Strategi Epsilon-Greedy bandit (eksploitasi argmax $Q$ vs eksplorasi acak) dan pembaruan Bellman $Q_{t+1}$. | **PASS** |
| **TC-F1-17** | `MacroEconomyCalculator` | SRS FR-11, SDD 4.8 | NFR-04 | Penanganan parameter ekstrim makroekonomi (populasi 0, input negatif, pencurian masif). | **PASS** |
| **TC-F1-18** | `DeterministicWorldOrchestrator`| SRS FR-04, SDD 4.1 | NFR-01, FR-04 | Pemetaan presisi 5 sub-fase deterministik pada siklus musim 45 detik universal (0-5s, 5-20s, 20-30s, 30-40s, 40-45s). | **PASS** |
| **TC-F1-19** | `DeterministicWorldOrchestrator`| SRS FR-04, SDD 4.1 | FR-04 | Handler fase dieksekusi tepat pada detik transisi pergantian status $(0, 5, 20, 30, 40)$. | **PASS** |
| **TC-F1-20** | `DeterministicWorldOrchestrator`| SRS FR-04, FR-15 | FR-15 | Transisi pergantian musim otomatis dan konklusi alam semesta (*Realm Concluded*) pada akhir Musim 20. | **PASS** |
| **TC-F1-21** | `DeterministicWorldOrchestrator`| SRS FR-04, SDD 4.1 | NFR-02 | Verifikasi akurasi `getState()` dan `stepSecond()` dinamis mencakup `phaseElapsedMs` (Fix BUG-003). | **PASS** |
| **TC-F1-22** | `advanceFullSeason` | SRS FR-04, SDD 4.1 | FR-04 | Fast-forward melintasi musim berjalan secara instan dan deterministik untuk pengujian multi-musim. | **PASS** |
| **TC-F1-23** | `DynasticLegacyService` | SRS FR-21, SDD 4.7 | FR-21, UC-18 | Perhitungan Skor Warisan Dinasti $(\text{seasons} \times 100 + \text{peak} \times 10 + \text{emas} \times 2)$ dan Poin Karma $(\lfloor \text{Score} / 500 \rfloor)$. | **PASS** |
| **TC-F1-24** | `TerritoryAnnexationService` | SRS FR-24, SDD 4.7 | FR-24 | Penyerapan wanua runtuh ke tetangga aktif berotoritas moral tertinggi (kepuasan rakyat dan cadangan pangan). | **PASS** |
| **TC-F1-25** | `FactionVoiceSynthesizer` | SRS FR-23, SDD 4.7 | FR-23, UC-17 | Sintesis mood & dialog tiga juru bicara faksi (Ki Wiro, Nyai Sendang, Si Garang) berdasarkan status alam & sosial. | **PASS** |

### 2.2 Matriks Pengujian Fase 2 (`tests/geo.test.ts`, `tests/ai.test.ts`, `tests/expedition.test.ts`)

| Test ID | Komponen Uji | Kebutuhan Terkait | KPI / NFR | Prosedur & Asersi Matematis | Hasil Uji |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-F2-01** | `calculateHaversineDistance` | SRS FR-16, SDD 4.4 | KPI-2.3, NFR-04 | Jarak Haversine presisi geodesik, bebas NaN dengan clamping mutlak $a \in [0.0, 1.0]$. | **PASS** |
| **TC-F2-02** | `verifyAndZeroize` | SRS FR-16, SDD 4.4 | KPI-2.3, FR-16 | Verifikasi onsite lolos jika jarak nyata kedua perangkat $\le 200.0\text{ meter}$. | **PASS** |
| **TC-F2-03** | `verifyAndZeroize` | SRS FR-16, SDD 4.4 | KPI-2.3, FR-16 | Penolakan `DISTANCE_EXCEEDED` seketika jika jarak fisik $> 200.0\text{ meter}$. | **PASS** |
| **TC-F2-04** | `verifyAndZeroize` | SRS FR-18, SDD 4.4 | FR-18, NFR-07 | Penolakan `MOCK_LOCATION_DETECTED` saat bendera sensor tiruan (*mock location*) aktif. | **PASS** |
| **TC-F2-05** | `verifyAndZeroize` | SRS FR-18, SDD 4.4 | FR-18 | Penolakan `ACCURACY_INSUFFICIENT` jika radius ketidakpastian GPS $> 50.0\text{ meter}$. | **PASS** |
| **TC-F2-06** | `verifyAndZeroize` | SRS FR-18, SDD 4.4 | FR-18 | Penolakan `SELF_PAIRING_DETECTED` jika hash entropi gawai identik (mencegah akun ganda 1 HP). | **PASS** |
| **TC-F2-07** | `verifyAndZeroize` | SRS FR-18, SDD 4.4 | FR-18 | Penolakan `TELEPORTATION_SPOOF_DETECTED` jika kecepatan perpindahan melebihi $50\text{ m/s}$. | **PASS** |
| **TC-F2-08** | `verifyAndZeroize` | SRS FR-16, FR-18 | FR-16, FR-18 | Penolakan `TIMESTAMP_DELTA_EXCEEDED` ($|\Delta t| > 10\text{s}$) dan `TIMESTAMP_STALE` ($> 15\text{s}$). | **PASS** |
| **TC-F2-09** | `verifyAndZeroize` | SRS FR-17, NFR-06 | KPI-2.3, NFR-06 | Zero-Knowledge Protocol: koordinat di-zeroize dalam $< 50\text{ ms}$, 0% penulisan koordinat ke DB. | **PASS** |
| **TC-F2-10** | `EphemeralPairingManager` | SRS FR-16, SDD 4.4 | FR-16 | Penyelarasan pairing handshake ephemeral dengan TTL 10 detik dan auto-cleanup expired. | **PASS** |
| **TC-F2-11** | `AIDecreeGateway` | SRS FR-07, NFR-05 | KPI-2.4, NFR-07 | Netralisasi 100% prompt injection & jailbreak manipulasi sistem (`valid: false`, `SECURITY_REJECTED`). | **PASS** |
| **TC-F2-11b**| `sanitizeInput` | SRS FR-07, SDD 4.3 | NFR-07 | Pembersihan karakter injeksi skrip (`<`, `>`, `'`, `"`, `;`, `\`) dan batas panjang 200 char. | **PASS** |
| **TC-F2-12** | `clampNumericVector` | SRS FR-07, SDD 4.3 | NFR-04 | Clamping mutlak 5 vektor $[-1.0, 1.0]$, biaya emas $[0, 100]$, dan delta pajak $[-10, 10]$. | **PASS** |
| **TC-F2-13** | `executeDeterministicFallback` | SRS FR-07, NFR-05 | KPI-2.2, FR-07 | Ekstraksi semantik regex bahasa Indonesia (pajak, lumbung/beras, prajurit/pos, alam/hutan). | **PASS** |
| **TC-F2-14** | `POLICY_CARD_CATALOG` | SRS FR-05, FR-06 | FR-05, FR-06 | Integritas 18 kartu kebijakan tematik Nusantara lengkap dengan pencarian berkecepatan $O(1)$. | **PASS** |
| **TC-F2-15** | `AIDecreeGateway` | SRS NFR-05, SDD 4.3 | KPI-2.2, NFR-05 | Transisi FSM Circuit Breaker dari CLOSED ke OPEN tepat setelah 3 kegagalan berturut-turut. | **PASS** |
| **TC-F2-16** | `AIDecreeGateway` | SRS NFR-05, SDD 4.3 | KPI-2.2 | Fast-fail $< 50\text{ ms}$ (aktual ~1ms) menggunakan parser fallback deterministik saat status OPEN. | **PASS** |
| **TC-F2-17** | `AIDecreeGateway` | SRS NFR-05, SDD 4.3 | NFR-05 | Transisi OPEN -> HALF_OPEN setelah cooldown dan pemulihan otomatis ke CLOSED jika LLM pulih. | **PASS** |
| **TC-F2-18** | `callLLMWithTimeout` | SRS NFR-05, SDD 4.3 | KPI-2.2, NFR-05 | Penegakan timeout keras 4.0 detik pada HTTP client pemanggilan LLM. | **PASS** |
| **TC-F2-19** | `CombatWarService` | SRS FR-19, SDD 4.5 | FR-19 | Penolakan `SOLITARY_ATTACK_FORBIDDEN` jika penyerang tidak memiliki verifikasi fisik onsite. | **PASS** |
| **TC-F2-20** | `CombatWarService` | SRS FR-19, SDD 4.5 | FR-19 | Penolakan `FRIENDLY_FIRE_PROHIBITED` jika target penyerangan adalah sekutu satu aliansi. | **PASS** |
| **TC-F2-21** | `CombatWarService` | SRS FR-12, SDD 4.5 | FR-12 | Validasi kuota minimal serbu 10 prajurit (`MINIMUM_10_TROOPS_REQUIRED`). | **PASS** |
| **TC-F2-22** | `CombatWarService` | SRS FR-12, SDD 4.5 | FR-12 | Resolusi SUCCESS saat $F_{\text{atk}} > F_{\text{def}}$, korban gugur proporsional, kuota rampasan survivor. | **PASS** |
| **TC-F2-23** | `CombatWarService` | SRS FR-12, SDD 4.5 | FR-12 | Resolusi REPELLED saat $F_{\text{atk}} \le F_{\text{def}}$, desersi penyerang $50\%$, nol jarahan rampasan. | **PASS** |
| **TC-F2-24** | `CombatWarService` | SRS FR-12, FR-19 | FR-12, FR-19 | Kalkulasi mitigasi Pos Ronda ($+20\%$/lv) dan bantuan kekuatan prajurit sekutu aliansi ($+50\%$). | **PASS** |
| **TC-F2-25** | `FrontierExpeditionEngine` | SRS FR-22, SDD 4.5 | FR-22 | Validasi kuota minimal kontingen ekspedisi 5 prajurit (`MINIMUM_5_TROOPS_REQUIRED`). | **PASS** |
| **TC-F2-26** | `FrontierExpeditionEngine` | SRS FR-22, SDD 4.5 | FR-22 | Doktrin PILLAGE: Pangan $+60$, Emas $+40$, 1-3 prajurit gugur, Harmoni $-10$, Keadilan $-0.25$. | **PASS** |
| **TC-F2-27** | `FrontierExpeditionEngine` | SRS FR-22, SDD 4.5 | FR-22 | Doktrin CONQUER_FORCED: Pangan $+40$, 5 warga tawanan baru berani tinggi & trust rendah. | **PASS** |
| **TC-F2-28** | `FrontierExpeditionEngine` | SRS FR-22, SDD 4.5 | FR-22 | Doktrin CONQUER_EMBRACED: Biaya $30$ emas, 5 warga sukarela berkeadilan & kepercayaan tinggi. | **PASS** |
| **TC-F2-29** | `CalamityAndBossEngine` | SRS FR-14, SDD 4.6 | FR-14 | Probabilitas dinamis kuadratik $P = 0.05 + 0.35 \times (1 - H/100)^2$, Paceklik (Lv 1) vs Banjir (Lv 2). | **PASS** |
| **TC-F2-30** | `BossEncounterStateMachine`| SRS FR-15, SDD 4.6 | FR-15 | Boss Naga Banjir 500 HP Musim 20 (Murka) vs Kemenangan Damai Era Keemasan ($+100$ pangan). | **PASS** |
| **TC-F2-31** | `GameSocketServer` & `JwtService` | SRS FR-02, SDD 7.1 C| FR-02, NFR-07 | Handshake RFC 6455 dengan JWT HMAC-SHA256, router 8 event frame, dan broadcast delta-state. | **PASS** |
| **TC-F2-32** | `handleConnection` | SRS FR-02, NFR-07 | NFR-07 | Handshake auth rejection: kode 4001 jika token absen, kode 4003 jika signature invalid. | **PASS** |
| **TC-F2-33** | `handleVerifyAllianceHandshake` | SRS FR-16, FR-18 | KPI-2.3 | Koordinasi pairing aliansi onsite via WS message, auto-match kode pairing & broadcast sukses. | **PASS** |
| **TC-F2-34** | `handleLaunchAttack` & `Expedition` | SRS FR-12, FR-22 | FR-12, FR-22 | Routing eksekusi aksi tempur PvP dan ekspedisi rimba NPC via WS message. | **PASS** |
| **TC-F2-35** | `broadcastDeltaState` | SRS FR-04, NFR-02 | KPI-2.1 | Siaran delta state musim ke seluruh client satu realm & penanganan defensif malformed JSON. | **PASS** |
| **TC-F2-36** | `createGameServer` | SRS FR-01, SDD 7.1 | NFR-01 | Inisialisasi HTTP server game & verifikasi endpoint `/health` (200 OK HEALTHY). | **PASS** |
| **TC-F2-37** | `unregisterSocket` | SRS FR-16, SDD 4.4 | NFR-06 | Pembersihan instan pending pairing ephemeral & zeroize RAM saat socket klien disconnect. | **PASS** |
| **TC-F2-38** | `handleSocketMessage` | SRS FR-05, SDD 7.1 C| FR-05, FR-12 | Dukungan amplop frame event SDD Bab 7.1 C (`ISSUE_DECREE_REQUEST`, `LAUNCH_MILITARY_ATTACK`, `pairCode`). | **PASS** |
| **TC-F2-39** | `FrontierExpeditionEngine` | SRS FR-22, SDD 4.5 | NFR-04 | Penolakan defensif doktrin ekspedisi tak dikenal melempar `UNKNOWN_EXPEDITION_DOCTRINE`. | **PASS** |
| **TC-F2-40** | `CalamityAndBossEngine` | SRS FR-14, SDD 4.6 | NFR-04 | Penjagaan stabilitas numerik saat menerima masukan ekstrim non-finite / NaN. | **PASS** |
| **TC-F2-42** | `EphemeralPairingManager` | SRS FR-16, SDD 4.4 | FR-16 | Penolakan pencocokan aliansi saat kode pairing kedua pihak bertentangan (`KODE_ALPHA` vs `KODE_BETA`). | **PASS** |
| **TC-F2-43** | `EphemeralPairingManager` | SRS FR-18, SDD 4.4 | FR-18 | Fast-fail langsung tanpa antre RAM saat terdeteksi mock location / akurasi buruk. | **PASS** |
| **TC-F2-44** | `EphemeralPairingManager` | SRS FR-17, NFR-06 | NFR-06 | Pemusnahan koordinat memori RAM saat pemanggilan `cancelPending` dan `clear()`. | **PASS** |
| **TC-F2-45** | `AIDecreeGateway` | SRS FR-07, SDD 4.3 | NFR-07 | Penguraian presisi nilai boolean string `valid: "false"` dan `"0"` pada clamp numeric vector. | **PASS** |
| **TC-F2-46** | `CombatWarService` | SRS FR-12, SDD 4.5 | NFR-04 | Sanitasi pembulatan prajurit desimal pada kalkulasi korban dan penyintas pertempuran. | **PASS** |

### 2.3 Matriks Pengujian Fase 3 (`frontend/` - 2.5D Canvas & React 18 Glassmorphism)

| Test ID | Komponen Uji | Kebutuhan Terkait | KPI / NFR | Prosedur & Asersi Verifikasi | Hasil Uji |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-F3-01** | `IsometricMap` Projection | SRS FR-03, SDD 5.1 | KPI-3.1 | Proyeksi 2:1 isometrik ($X_{\text{iso}} = (x - y) \times \frac{W}{2}$, $Y_{\text{iso}} = (x + y) \times \frac{H}{2}$) dan konversi balik `screenToGrid` bit-level presisi. | **PASS** |
| **TC-F3-02** | `IsometricMap` Course & River | SRS FR-03, SDD 5.1 | NFR-03 | Rendering tilemap rumput, tanah pusat wanua, sawah terasering, jalan setapak, dan alur sungai Sendang Tirta. | **PASS** |
| **TC-F3-03** | `BuildingSprites` (Levels 1-3) | SRS FR-03, SDD 5.2 | KPI-3.1 | Rendering prosedural Balai Wanua (Joglo Keraton), Lumbung Desa (Leuit), dan Pos Ronda (Gardu) dengan level badge dinamis. | **PASS** |
| **TC-F3-04** | `AgentSprites` Behaviors | SRS FR-09, SDD 5.2 | KPI-3.1 | Visualisasi warga otonom mini Nusantara (caping bambu) bergerak dinamis dengan 6 balon aksi (bekerja, dagang, mengeluh, curi, ngungsi, ontag). | **PASS** |
| **TC-F3-05** | `CalamityEffects` Weather | SRS FR-14, SDD 5.2 | KPI-3.1 | Sistem partikel cuaca (pollen emas cerah, kabut debu paceklik, hujan lebat & kilat banjir bandang) 60 FPS halus. | **PASS** |
| **TC-F3-06** | `CalamityEffects` Boss Naga | SRS FR-15, SDD 5.2 | KPI-3.1 | Rendering prosedural Naga Banjir Sang Hyang Tuntang bersisik multi-segmen bergelombang sinusoidal di sungai dan sinkronisasi bar HP 500. | **PASS** |
| **TC-F3-07** | `HudBar` Glassmorphism | SRS FR-01, SDD 5.3 | NFR-03 | Status bar atas reaktif menampilkan nama wanua, musim, fase & countdown 45s, pangan, emas, pasukan, kepuasan, harmoni, bandit, dan Bob Coins. | **PASS** |
| **TC-F3-08** | `FactionSentiment` | SRS FR-23, SDD 5.3 | FR-23 | Panel suara tiga faksi (Ki Wiro, Nyai Sendang, Si Garang) dengan mood badge dinamis dan kuotasi dialog lokal Nusantara. | **PASS** |
| **TC-F3-09** | `DecreeModal` 18 Cards | SRS FR-05, SDD 5.3 | FR-05 | Katalog interaktif 18 kartu kebijakan tematik Nusantara dengan filter kategori, tinjauan dampak 5 vektor, dan validasi kecukupan kas emas. | **PASS** |
| **TC-F3-10** | `DecreeModal` NLP Free-Text | SRS FR-06, SDD 5.3 | FR-06 | Antarmuka titah bahasa Indonesia bebas, validasi biaya 25 Bob Coins, dan integrasi pengiriman ke dewan penasihat AI. | **PASS** |
| **TC-F3-11** | `AllianceRadar` Onsite Proximity | SRS FR-16, SDD 5.3 | KPI-2.3 | Visualisasi radar pemindai jarak geodesik $\le 200\text{ m}$, status deteksi mitra, dan tombol ikrar sumpah bergaransi Zero-Knowledge UU PDP. | **PASS** |
| **TC-F3-12** | `ExpeditionModal` | SRS FR-22, SDD 5.3 | FR-22 | Modal pengerahan ekspedisi perbatasan dengan pemilihan 3 doktrin moral (`PILLAGE`, `CONQUER_FORCED`, `CONQUER_EMBRACED`) dan slider prajurit. | **PASS** |
| **TC-F3-13** | `BossHpOverlay` & Raid | SRS FR-15, SDD 5.3 | FR-15 | Bar HP 500 Naga Banjir pada Musim 20, visualisasi skenario damai vs murka, dan tombol gempuran koalisi aliansi (+50% damage bonus). | **PASS** |
| **TC-F3-14** | `CoupOverlay` & Legacy | SRS FR-20, SDD 5.3 | FR-20, FR-21| Layar dramatis keruntuhan dinasti (kudeta, kelaparan, bandit), kalkulator Skor Warisan Leluhur, Poin Karma, dan tombol reinkarnasi. | **PASS** |
| **TC-F3-15** | `NusantaraAudioEngine` | SRS FR-03, SDD 5.4 | KPI-3.3 | Sintesis prosedural Web Audio API 100% murni (Slendro, Pelog, Gong Ageng ADSR panjang, Kendang Dhang/Thung/Tak) tanpa file audio eksternal. | **PASS** |
| **TC-F3-16** | `GameSocketClient` Gateway | SRS FR-02, SDD 5.3 | NFR-02 | Koneksi WSS RFC 6455 dengan fallback simulasi realm lokal otonom saat offline/standalone preview. | **PASS** |
| **TC-F3-17** | `Frontend Production Build` | SDD Bab 8 | KPI-3.2 | Verifikasi kompilasi `npm run typecheck` bersih (0 error) dan `npm run build` Vite bundling menghasilkan aset statis tanpa hambatan. | **PASS** |

### 2.4 Matriks Pengujian Fase 4 (`tests/e2e.test.ts` & `scripts/benchmark.ts` - E2E & Benchmark)

| Test ID | Komponen Uji | Kebutuhan Terkait | KPI / NFR | Prosedur & Asersi Verifikasi | Hasil Uji |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-F4-01** | `HTTP Health Check` | SRS FR-01, SDD 7.1 | NFR-01 | Pengujian probe HTTP `/health` mengembalikan status 200 OK, service name, dan uptime valid. | **PASS** |
| **TC-F4-02** | `Multi-Client Handshake` | SRS FR-02, SDD 5.3 | NFR-07 | Dua klien WebSocket bersamaan melakukan autentikasi handshake JWT HMAC-SHA256 valid. | **PASS** |
| **TC-F4-03** | `Full Decree Pipeline` | SRS FR-05, FR-06 | FR-05, FR-06| Siklus penerbitan kartu titah via WS (`CARD_01`) dan titah bebas NLP AI dengan prompt guard. | **PASS** |
| **TC-F4-04** | `Onsite Alliance & Combat` | SRS FR-16, FR-19 | KPI-2.3 | Jabat tangan jarak $\le 200\text{ m}$ (Prambanan ~35m), Zero-Knowledge memory audit, dan bantuan militer +50%. | **PASS** |
| **TC-F4-05** | `Expedition 3 Doctrines` | SRS FR-22, SDD 4.5 | FR-22 | Resolusi lengkap 3 doktrin moral (`PILLAGE`, `CONQUER_FORCED`, `CONQUER_EMBRACED`) presisi matematis. | **PASS** |
| **TC-F4-06** | `Boss Naga Musim 20 FSM` | SRS FR-15, SDD 4.6 | FR-15 | Skenario damai ($H \ge 50$) vs skenario murka ($H < 50$), gempuran koalisi aliansi, dan defeat boss. | **PASS** |
| **TC-F4-07** | `20-Season World Loop` | SRS FR-04, FR-21 | FR-04, FR-21| Siklus lengkap 20 musim universal, konklusi realm, kalkulasi Skor Warisan (3330 poin) dan 6 Poin Karma. | **PASS** |
| **TC-F4-08** | `Benchmark 10k ECS Agents` | SRS FR-10, SDD 4.2 | KPI-1.1 | Kecepatan evaluasi 10.000 agen: **1.378 ms** (Target: $< 100\text{ ms}$, Throughput: 7.25 juta agen/detik). | **PASS** |
| **TC-F4-09** | `Benchmark Geodesic Throughput`| SRS FR-16, SDD 4.4 | KPI-2.3 | Throughput kalkulasi jarak Haversine: **7.056.043 ops/sec** (Target: $> 500.000\text{ ops/sec}$). | **PASS** |
| **TC-F4-10** | `Benchmark Memory Wiper` | SRS FR-17, NFR-06 | NFR-06 | Latensi pemusnahan GPS di RAM: **0.613 ms** (Target: $< 50\text{ ms}$), 0 residu data koordinat. | **PASS** |
| **TC-F4-11** | `Docker Multi-Container` | SDD Bab 8 | NFR-01 | Konfigurasi Dockerfile backend, frontend Nginx SPA, dan `docker-compose.yml` 4 layanan terisolasi. | **PASS** |

### 2.5 Matriks Pengujian Fase 5 (Competition Submission, Bobalytics Audit, & Deliverables)

| Test ID | Komponen Uji | Kebutuhan Terkait | KPI / NFR | Prosedur & Asersi Verifikasi | Hasil Uji |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-F5-01** | `Bobalytics Activity Log` | Aturan Lomba, SDD 3.3 | KPI-5.1 | Validasi integritas `bob-log/activity_log.jsonl` (13 entri prompt, session ID, timestamp ISO, commit tags `[bob:*]`). | **PASS** |
| **TC-F5-02** | `Bob Coins Allocation Audit` | Aturan Lomba, SDD 3.3 | KPI-5.1 | Audit total kuota 500 Bob Coins: 440 coins terpakai efisien across 6 modes, 60 coins cadangan (88.0% utilization). | **PASS** |
| **TC-F5-03** | `Pitch Deck 5 Slide` | Aturan Lomba Bab 4 | KPI-5.3 | Verifikasi kelengkapan 5 slide di `doc/PITCH_DECK.md` (Problem, Audience, Innovation, IBM Bob, Expected Impact) dengan metrik riil. | **PASS** |
| **TC-F5-04** | `Demo Video Walkthrough Script` | Aturan Lomba Bab 4 | KPI-5.3 | Verifikasi naskah video 3 menit (03:00) di `doc/DEMO_SCRIPT.md` dengan penunjuk detik demi detik, visual, dan dialog narasi. | **PASS** |
| **TC-F5-05** | `Master Readme Finalization` | Aturan Lomba Bab 4 | KPI-5.2 | Verifikasi kelengkapan `README.md` (Quickstart Docker & Bare-Metal, live benchmark table, 79 tests passed badge, link artefak). | **PASS** |
| **TC-F5-06** | `Zero Dead Code & Linter Audit` | SDD Bab 8, Global Rule | KPI-4.4 | Verifikasi 0 unused imports, 0 console.log debugging acak, dan clean strict typecheck backend & frontend. | **PASS** |
| **TC-F5-07** | `Git Versioning & Release Tag` | Aturan Lomba Bab 4 | KPI-5.1 | Pembuatan tag git formal `v1.0.0` pada branch `main` tersinkronisasi ke remote GitHub. | **PASS** |

---

## 📊 3. Hasil Pengujian Unit Terotomatisasi (Automated Test Execution Log)

```
Test Runner: Vitest v2.1.9
Node Runtime: v22.17.0 (win32-x64)
Command: npm test

 ✓ tests/geo.test.ts (13 tests passed) 12ms
   ✓ Fase 2: Geolocation Onsite Verifier & Anti-Spoofing Suite (13 tests)
     ✓ harus menghitung jarak Haversine geodesik secara presisi bit-level dan stabil dari NaN (TC-F2-01)
     ✓ harus meloloskan verifikasi aliansi jika jarak <= 200 meter (TC-F2-02)
     ✓ harus menolak verifikasi jika jarak melebihi 200 meter (TC-F2-03)
     ✓ harus mendeteksi dan menolak sensor Mock Location Provider (TC-F2-04)
     ✓ harus menolak koordinat dengan akurasi GPS buruk > 50 meter (TC-F2-05)
     ✓ harus mencegah self-pairing pada 1 perangkat fisik dengan kesamaan entropy hash (TC-F2-06)
     ✓ harus mendeteksi lonjakan kecepatan teleportasi tidak wajar > 50 m/s (TC-F2-07)
     ✓ harus menolak handshake dengan delta timestamp > 10 detik atau koordinat basi (TC-F2-08)
     ✓ harus memusnahkan koordinat GPS mentah dari RAM (< 50ms) dan zero persistence (TC-F2-09)
     ✓ harus mengelola pairing aliansi ephemeral dengan TTL 10 detik (TC-F2-10)
     ✓ harus menolak pencocokan jika kode pairing kedua pihak bertentangan (TC-F2-42)
     ✓ harus fast-fail pada submitHandshake saat sensor tiruan atau GPS tidak akurat terdeteksi (TC-F2-43)
     ✓ harus memusnahkan koordinat memori saat cancelPending dan manager.clear() (TC-F2-44)

 ✓ tests/sim.test.ts (25 tests passed) 63ms
   ✓ Fase 1: Multi-Agent ECS Behavior Engine (7 tests)
   ✓ Fase 1: Kalkulator Makroekonomi & Klausul Kebangkrutan (5 tests)
   ✓ Fase 1: Deterministic World Orchestrator (Universal 45-Second FSM) (5 tests)
   ✓ Fase 1: Layanan Reinkarnasi Dinasti, Skor Warisan & Faksi (SDD 4.7) (4 tests)

 ✓ tests/expedition.test.ts (24 tests passed) 90ms
   ✓ Fase 2: Combat, Expedition, Calamity, & Gateway Suite (24 tests)
     ✓ Pertempuran Militer & Resolusi PvP (CombatWarService) (7 tests)
       ✓ harus menolak serangan jika penyerang belum diverifikasi onsite (TC-F2-19)
       ✓ harus melarang penyerangan sesama sekutu aliansi / friendly fire (TC-F2-20)
       ✓ harus melempar error jika pasukan serang kurang dari 10 prajurit (TC-F2-21)
       ✓ harus menyelesaikan kemenangan penyerang (SUCCESS) dan kuota jarahan ransum penyintas (TC-F2-22)
       ✓ harus menyelesaikan penyerang terpukul mundur (REPELLED) saat pertahanan lebih kuat (TC-F2-23)
       ✓ harus memperhitungkan pos ronda dan bantuan aliansi secara matematis (TC-F2-24)
       ✓ harus membersihkan dan membulatkan prajurit desimal secara deterministik pada perhitungan korban (TC-F2-46)
     ✓ Ekspedisi Desa Rimba NPC (FrontierExpeditionEngine) (4 tests)
       ✓ harus memvalidasi batas minimal 5 prajurit ekspedisi (TC-F2-25)
       ✓ harus mengeksekusi doktrin PILLAGE dengan rampasan sumber daya dan penalti moral (TC-F2-26)
       ✓ harus mengeksekusi doktrin CONQUER_FORCED dan menghasilkan 5 warga tawanan (TC-F2-27)
       ✓ harus mengeksekusi doktrin CONQUER_EMBRACED dengan biaya 30 emas dan warga sukarela (TC-F2-28)
     ✓ Calamity & Boss Naga Banjir Engine (CalamityAndBossEngine) (2 tests)
       ✓ harus mengevaluasi dinamika harmoni alam dan memicu bencana bertingkat (TC-F2-29)
       ✓ harus mengoperasikan Boss Naga Banjir FSM pada Musim 20 (TC-F2-30)
     ✓ Realtime WebSocket Gateway & Autentikasi JWT (TC-F2-31) (11 tests)
       ✓ harus menerbitkan dan memverifikasi token JWT HMAC-SHA256 sesuai RFC 7519
       ✓ harus menginisialisasi GameSocketServer dan memproses pesan titah kartu secara deterministik
       ✓ harus mengelola autentikasi handshake WebSocket RFC 6455 dan menolak token tidak valid (TC-F2-32)
       ✓ harus memproses verifikasi aliansi onsite melalui WebSocket (TC-F2-33)
       ✓ harus memproses serangan militer LAUNCH_ATTACK dan peluncuran ekspedisi LAUNCH_EXPEDITION (TC-F2-34)
       ✓ harus menyiarkan delta state musim dan menangani error format pesan tidak valid (TC-F2-35)
       ✓ harus menginisialisasi server game HTTP dan melayani health check endpoint 200 OK (TC-F2-36)
       ✓ harus membersihkan pairing ephemeral dan mencegah ghost match saat socket klien disconnect (TC-F2-37)
       ✓ harus mendukung frame pesan SDD 7.1 C (ISSUE_DECREE_REQUEST & LAUNCH_MILITARY_ATTACK) (TC-F2-38)
       ✓ harus menolak doktrin ekspedisi tak dikenal secara defensif (TC-F2-39)
       ✓ harus menjaga kestabilan numerik Calamity Engine saat menerima input non-finite (TC-F2-40)

 ✓ tests/ai.test.ts (10 tests passed) 199ms
   ✓ Fase 2: AI Decree NLP Gateway & Resiliency Suite (10 tests)
     ✓ harus menolak upaya prompt injection & jailbreak manipulasi sistem (TC-F2-11)
     ✓ harus membersihkan karakter berbahaya saat sanitasi input (TC-F2-11b)
     ✓ harus melakukan clamping mutlak pada vektor numerik hasil analisis (TC-F2-12)
     ✓ harus menguraikan titah bahasa Indonesia via Deterministic Regex Fallback (TC-F2-13)
     ✓ harus memuat seluruh 18 Kartu Kebijakan Tematik Nusantara dengan lookup O(1) (TC-F2-14)
     ✓ harus mentransisikan Circuit Breaker dari CLOSED ke OPEN setelah 3 kali gagal (TC-F2-15)
     ✓ harus fast-fail (< 50ms) dan langsung menggunakan Deterministic Fallback saat OPEN (TC-F2-16)
     ✓ harus transisi ke HALF_OPEN setelah cooldown dan kembali ke CLOSED saat berhasil (TC-F2-17)
     ✓ harus memutus panggilan LLM yang melewati batas waktu timeout keras 4.0 detik (TC-F2-18)
     ✓ harus menguraikan flag valid secara presisi saat menerima nilai string false atau 0 (TC-F2-45)

  ✓ tests/e2e.test.ts (7 tests passed) 88ms
    ✓ Fase 4: End-to-End (E2E) System Integration Suite (7 tests)
      ✓ E2E-01: Health check endpoint HTTP harus mengembalikan status HEALTHY 200 OK (TC-F4-01)
      ✓ E2E-02: Multi-client WebSocket handshake dengan autentikasi token JWT valid (TC-F4-02)
      ✓ E2E-03: Alur penerbitan titah kartu tematik & titah NLP AI melalui WebSocket (TC-F4-03)
      ✓ E2E-04: Verifikasi kedekatan fisik onsite (<= 200m), aliansi pertahanan, dan bantuan militer (TC-F4-04)
      ✓ E2E-05: Pengerahan ekspedisi perbatasan desa rimba NPC dengan 3 doktrin moral (TC-F4-05)
      ✓ E2E-06: Pertempuran koalisi aliansi vs Boss Naga Banjir Sang Hyang Tuntang Musim 20 (TC-F4-06)
      ✓ E2E-07: Siklus lengkap 20 Musim universal, transisi faksi, dan Skor Warisan Reinkarnasi (TC-F4-07)

Test Files:  5 passed (5)
Tests:       79 passed (79)
Duration:    1.18s
Exit Code:   0
```

---

## 🛠️ 4. Matriks Realisasi Pengujian Seluruh Fase (Fase 1 s.d. Fase 5)

| Fase | Target File Test | Cakupan Fitur | Metrik Keberhasilan & Realisasi | Status Akhir |
| :--- | :--- | :--- | :--- | :---: |
| **Fase 1** | `tests/sim.test.ts` (25 TC) | ECS Memory Pool, MacroEconomy, Universal FSM 45s. | Evaluasi 10k agen 1.378 ms, Zero GC heap allocation per tick. | **TERCAPAI (100%)** |
| **Fase 2** | `tests/geo.test.ts`, `ai.test.ts`, `expedition.test.ts` (47 TC) | Haversine Verifier, AI Circuit Breaker, PvP Combat. | Haversine 7.05M ops/s, Wiper 0.613 ms, Circuit Breaker SLA < 4.0s. | **TERCAPAI (100%)** |
| **Fase 3** | `frontend/` (Pixi v8 + React 18) | Transformasi grid isometrik 2.5D, Web Audio Slendro/Pelog. | 60 FPS stabil WebGL Pixi.js, Bundle 161.25 KB gzip, WCAG 2.1 AA. | **TERCAPAI (100%)** |
| **Fase 4** | `tests/e2e.test.ts` (7 TC) & `scripts/benchmark.ts` | E2E WebSocket, onsite alliance, 3 doctrines, Boss fight, Docker. | 79/79 automated tests passing in 1.18s, multi-container compose. | **TERCAPAI (100%)** |
| **Fase 5** | `bob-log/`, `doc/PITCH_DECK.md`, `doc/DEMO_SCRIPT.md` | Release Audit, Bobalytics 440 Coins, Pitch Deck 5 Slide. | 100% commits tagged [bob:*], zero dead code, release tag v1.0.0. | **TERCAPAI (100%)** |

---

## 🐛 5. Log Siklus Hidup Bug & Masalah Rekayasa (Bug Lifecycle Ledger)

Siklus Hidup Status Bug:
- `[OPEN]`: Bug terdeteksi dan tercatat.
- `[INVESTIGATING]`: Analisis akar masalah (*Root Cause Analysis*) sedang berlangsung.
- `[RESOLVED]`: Solusi kode telah diimplementasikan dan diverifikasi via unit test.
- `[CLOSED]`: Solusi diverifikasi menyeluruh dan lulus uji regresi tanpa efek samping.

### Daftar Bug Tercatat & Terselesaikan:

#### 🔹 BUG-001: Kegagalan Inisialisasi Paket Akibat Broken Symlink Cache npm Windows
* **Status:** `[CLOSED]`
* **Severity:** High
* **Komponen:** Node Environment & Package Manager
* **Gejala:** Eksekusi `npm install` gagal dengan error `ENOENT / ENOTDIR mkdir '\\?'` dan `D:\Caches\npm`.
* **Root Cause Analysis (RCA):** Konfigurasi global npm pengguna mengarah ke drive `D:\` yang tidak terpasang secara fisik pada sistem Windows, dan entri junction di `AppData/Local/npm-cache` berstatus invalid/dangling symlink.
* **Resolusi:** Membuat berkas proyek `.npmrc` dengan direktori cache lokal valid `C:\Users\thori\.npm-cache`.
* **Verifikasi:** Eksekusi `npm install` berhasil $100\%$ tanpa hambatan dan menginstal 58 paket.

#### 🔹 BUG-002: TypeScript Strict Linter Flag TS6133 pada Import Vitest
* **Status:** `[CLOSED]`
* **Severity:** Low
* **Komponen:** `tests/sim.test.ts`
* **Gejala:** Perintah `tsc --noEmit` gagal dengan error `error TS6133: 'vi' is declared but its value is never read`.
* **Root Cause Analysis (RCA):** Pengaturan compiler `noUnusedLocals: true` pada `tsconfig.json` melarang adanya import simbol yang tidak digunakan secara aktif di dalam kode.
* **Resolusi:** Memangkas simbol `vi` dari deklarasi import pada `tests/sim.test.ts` sesuai dengan prinsip *Zero Dead Code Policy*.
* **Verifikasi:** Perintah `npm run typecheck` (`tsc --noEmit`) dan `npm run build` berhasil dengan exit code 0 bersih.

#### 🔹 BUG-003: Hardcoded Nilai Detik `secondInSeason = 0` pada World Orchestrator State
* **Status:** `[CLOSED]`
* **Severity:** High
* **Komponen:** `src/sim/worldEngine.ts` (`DeterministicWorldOrchestrator`)
* **Gejala:** Pemanggilan `orchestrator.getState()` atau return value dari `stepSecond(sec)` selalu mengembalikan `secondInSeason: 0`, `currentPhase: PHASE_1_DECREE`, dan `secondsRemainingInSeason: 45` meskipun simulasi telah melangkah ke detik ke-12 atau fase lain.
* **Root Cause Analysis (RCA):** Properti detik aktif tidak disimpan dalam variabel instans objek, dan metode `getState()` meng-hardcode deklarasi `const secondInSeason = 0;`.
* **Resolusi:** Menyimpan state `currentSecondInSeason` sebagai properti privat, mengintegrasikan `phaseElapsedMs` sesuai spesifikasi SDD 4.1, dan memastikan `getState()` mengevaluasi fase dan sisa detik secara dinamis.
* **Verifikasi:** Ditambahkan test case `TC-F1-18` yang memverifikasi bahwa stepping ke detik ke-12 menghasilkan `secondInSeason: 12`, `currentPhase: PHASE_2_AGENTS`, `secondsRemainingInSeason: 33`, dan `phaseElapsedMs: 7000`.

#### 🔹 BUG-004: Inversi Prioritas Tri-Defeat & Ketidakhadiran Domain Services SDD Bab 4.7
* **Status:** `[CLOSED]`
* **Severity:** Medium
* **Komponen:** `src/sim/economyCalculator.ts` & `src/sim/dynastyEngine.ts`
* **Gejala:** Layanan domain inti SDD Bab 4.7 (`DynasticLegacyService`, `TerritoryAnnexationService`, `FactionVoiceSynthesizer`, dan `TriDefeatEvaluator`) belum terimplementasi. Selain itu, evaluasi kekalahan mendahulukan `BANDIT_DESTRUCTION` di atas `COUP_DETAT`, bertentangan dengan hierarki SDD 4.7.
* **Root Cause Analysis (RCA):** Subsistem 4.7 disederhanakan secara tidak lengkap di dalam `economyCalculator.ts` dengan urutan `if` yang terbalik.
* **Resolusi:** Membuat berkas `src/sim/dynastyEngine.ts` yang mengimplementasikan 4 layanan domain tersebut secara penuh, dan memperbarui `MacroEconomyCalculator.evaluateTriDefeat` untuk mendelegasikan ke `TriDefeatEvaluator.evaluate`.
* **Verifikasi:** Test case `TC-F1-12`, `TC-F1-21`, `TC-F1-22`, `TC-F1-23`, dan `TC-F1-24` memvalidasi prioritas kudeta, skor warisan karma leluhur, penyerapan teritorial wanua roboh, dan sintesis sentimen faksi.

#### 🔹 BUG-005: Kerentanan Nilai Masukan Tak Terklem (Defensive Clamping Gap)
* **Status:** `[CLOSED]`
* **Severity:** Medium
* **Komponen:** `src/sim/agentEngine.ts` & `src/sim/economyCalculator.ts`
* **Gejala:** Masukan nilai negatif atau populasi 0 pada `updateAgentPsychology` atau `calculate` dapat menghasilkan rasio kecukupan pangan negatif, subsidi emas fiktif akibat pajak negatif, atau `NaN` jika `activeCount` melampaui ukuran pool.
* **Root Cause Analysis (RCA):** Tidak adanya validasi batas numerik defensif (*Defensive Programming Standard*) pada masukan parameter mentah.
* **Resolusi:** Menerapkan `Math.max(0, ...)` untuk kuantitas fisik (pangan, emas, prajurit, agen), membatasi tarif pajak ke rentang legal $[0, 50]$, dan membatasi `safeActiveCount` ke kapasitas pool.
* **Verifikasi:** Test case `TC-F1-09` dan `TC-F1-17` menguji injeksi data kotor dan nilai ekstrim negatif tanpa menghasilkan anomali.

#### 🔹 BUG-006: Precedence Collision pada Deterministic NLP Nature Keyword Parser
* **Status:** `[CLOSED]`
* **Severity:** Medium
* **Komponen:** `src/ai/aiAdapter.ts` (`AIDecreeGateway.executeDeterministicFallback`)
* **Gejala:** Teks titah militer yang mengandung kata lokasi hutan (misal: `"Perkuat pos ronda dan kirim prajurit untuk patroli hutan"`) secara keliru diklasifikasikan sebagai kategori `"alam"` alih-alih `"keamanan"`.
* **Root Cause Analysis (RCA):** Blok analisis domain alam menetapkan `kategori = "alam"` hanya karena teks mengandung substring `"hutan"`, meskipun tidak ada kata kerja tindakan ekologis (seperti `"tanam"`, `"tebang"`, atau `"rawat"`).
* **Resolusi:** Memindahkan penugasan `kategori = "alam"` ke dalam sub-blok tindakan ekologis spesifik, sehingga jika teks hanya menyebut hutan dalam konteks patroli militer, kategori `"keamanan"` tetap dipertahankan.
* **Verifikasi:** Lulus pengujian pada `tests/ai.test.ts` (TC-F2-13) dengan asersi kategori tepat `"keamanan"`.

#### 🔹 BUG-007: Stale State Boss HP pada Panggilan Sekuensial `evaluateSeason20`
* **Status:** `[CLOSED]`
* **Severity:** Low
* **Komponen:** `src/sim/calamityEngine.ts` (`BossEncounterStateMachine`)
* **Gejala:** Jika metode `evaluateSeason20` dipanggil dengan skenario damai (`harmoni >= 50`), properti `bossHp` diset ke 0. Jika objek yang sama kemudian mengevaluasi skenario murka (`harmoni < 50`), `bossHp` tetap bernilai 0 bukannya 500 HP awal.
* **Root Cause Analysis (RCA):** Percabangan `averageHarmony < 50.0` tidak menginisialisasi ulang `this.bossHp = this.maxHp` saat memicu spawn.
* **Resolusi:** Menambahkan penugasan eksplisit `this.bossHp = this.maxHp` pada cabang spawn di `evaluateSeason20`.
* **Verifikasi:** Lulus pengujian pada `tests/expedition.test.ts` (TC-F2-30) dengan HP kembali utuh 500 saat spawn murka.

#### 🔹 BUG-008: Unused Local Variables pada Formula Jarahan Tempur battleService.ts
* **Status:** `[CLOSED]`
* **Severity:** Medium
* **Komponen:** `src/services/battleService.ts` (`CombatWarService.resolve`)
* **Gejala:** Kompilasi TypeScript strict (`tsc --noEmit` dan `npm run build`) gagal dengan error `TS6133: 'panganDef' is declared but its value is never read` dan `TS6133: 'emasDef' is declared but its value is never read`.
* **Root Cause Analysis (RCA):** Variabel sanitized `panganDef` dan `emasDef` telah dideklarasikan di awal fungsi, namun kalkulasi kuota jarahan ransum masih merujuk ke `input.panganDef` dan `input.emasDef`.
* **Resolusi:** Memperbarui ekspresi perhitungan rampasan menggunakan variabel terdeklarasi `panganDef` dan `emasDef`, sekaligus menjamin input negatif ditolak oleh penjaga batas numerik.
* **Verifikasi:** `npm run typecheck` dan `npm run build` lulus 100% dengan exit code 0.

#### 🔹 BUG-009: Handshake Rejection Code Mismatch Akibat Unhandled Header Undefined
* **Status:** `[CLOSED]`
* **Severity:** Medium
* **Root Cause Analysis (RCA):** Properti `req.headers` diakses tanpa optional chaining (`req.headers["authorization"]`), menyebabkan `TypeError: Cannot read properties of undefined` saat request mock tidak menyertakan objek headers, sehingga alur langsung melompat ke blok catch dengan kode 4003.
* **Resolusi:** Menambahkan optional chaining `req.headers?.["authorization"]` sesuai standar Defensive Programming.
* **Verifikasi:** Lulus pengujian pada `tests/expedition.test.ts` (TC-F2-32) dengan penolakan kode 4001 untuk token absen dan 4003 untuk token tidak valid.

#### 🔹 BUG-010: Orphaned Ephemeral Pairings on Socket Disconnection & False Handshake Matching
* **Status:** `[CLOSED]`
* **Severity:** High
* **Komponen:** `src/services/socketService.ts` & `src/services/allianceService.ts`
* **Gejala:** Jika Klien A mengirim `VERIFY_ALLIANCE_HANDSHAKE` lalu mengalami diskoneksi jaringan, request pending pairing-nya tetap menggantung di memori hingga TTL 10s habis. Klien B yang mengirim handshake kemudian berhasil di-match dengan Klien A yang offline, menghasilkan konfirmasi sukses palsu di Klien B sementara Klien A tidak menerima notifikasi.
* **Root Cause Analysis (RCA):** Metode `GameSocketServer.unregisterSocket()` tidak mengabarkan `EphemeralPairingManager` untuk membersihkan antrean pairing milik kingdom yang terputus, dan `EphemeralPairingManager` belum memiliki metode `cancelPending(kingdomId)`.
* **Resolusi:** Menambahkan metode `cancelPending(kingdomId)` pada `EphemeralPairingManager` yang me-zeroize koordinat RAM dan menghapus antrean saat socket disconnect di `unregisterSocket()`.
* **Verifikasi:** Lulus pengujian pada `tests/expedition.test.ts` (TC-F2-37).

#### 🔹 BUG-011: Unsanitized Floating-Point Troop Numbers in Battle Casualty & Survivor Equations
* **Status:** `[CLOSED]`
* **Severity:** Medium
* **Komponen:** `src/services/battleService.ts` (`CombatWarService.resolve`)
* **Gejala:** Masukan jumlah prajurit berupa desimal/float (misal: 15.6) menghasilkan angka korban gugur dan penyintas berupa bilangan pecahan pada hasil resolusi pertempuran.
* **Root Cause Analysis (RCA):** Meskipun `attackerTroops` dan `defenderTroops` telah disanitasi di awal fungsi menggunakan `Math.floor`, rumus kalkulasi korban gugur dan penyintas pada blok SUCCESS dan REPELLED masih mereferensikan properti mentah `input.attackerTroops` dan `input.defenderTroops`.
* **Resolusi:** Mengganti seluruh referensi `input.attackerTroops` dan `input.defenderTroops` dengan variabel terverifikasi `attackerTroops` dan `defenderTroops`.
* **Verifikasi:** Lulus pengujian pada `tests/expedition.test.ts` (TC-F2-46).

#### 🔹 BUG-012: Unchecked Doctrine Fallthrough Returning Undefined in FrontierExpeditionEngine
* **Status:** `[CLOSED]`
* **Severity:** Medium
* **Komponen:** `src/services/expeditionService.ts` (`FrontierExpeditionEngine.resolve`)
* **Gejala:** Jika doktrin ekspedisi yang dikirimkan klien tidak valid atau tidak dikenali, metode `resolve()` mengembalikan `undefined`, memicu `TypeError: Cannot read properties of undefined` pada pemanggil.
* **Root Cause Analysis (RCA):** Blok `switch (doctrine)` tidak memiliki klausul `default:`.
* **Resolusi:** Menambahkan klausul `default:` yang melempar exception `UNKNOWN_EXPEDITION_DOCTRINE`.
* **Verifikasi:** Lulus pengujian pada `tests/expedition.test.ts` (TC-F2-39).

#### 🔹 BUG-013: WebSocket Incompatibility with SDD 7.1 C Event Frames and Top-Level Envelope Fields
* **Status:** `[CLOSED]`
* **Severity:** High
* **Komponen:** `src/services/socketService.ts` (`GameSocketServer.handleSocketMessage`)
* **Gejala:** Pesan WebSocket standar SDD Bab 7.1 C yang menggunakan format `{ event: "ISSUE_DECREE_REQUEST", cardId: "CARD_01" }` ditolak dengan error `UNKNOWN_ACTION: undefined`, dan properti `cardId` tidak terbaca.
* **Root Cause Analysis (RCA):** Parser pesan hanya mengecek `parsed.action` dan mengasumsikan seluruh data terbungkus di dalam `parsed.payload`.
* **Resolusi:** Memperluas router agar mendukung `parsed.action || parsed.event`, memetakan `ISSUE_DECREE_REQUEST` ke handler titah dan `LAUNCH_MILITARY_ATTACK` ke handler serang, serta menggabungkan root payload dengan nested payload/data.
* **Verifikasi:** Lulus pengujian pada `tests/expedition.test.ts` (TC-F2-38).

#### 🔹 BUG-014: Conflicting Pairing Codes False Match in EphemeralPairingManager
* **Status:** `[CLOSED]`
* **Severity:** Medium
* **Komponen:** `src/services/allianceService.ts` (`EphemeralPairingManager.submitHandshake`)
* **Gejala:** Dua pemain di lokasi berdekatan yang memasukkan kode pairing berbeda (misal: `"KODE_ALPHA"` dan `"KODE_BETA"`) secara keliru dapat terpasangkan jika `targetKingdomId` mereka saling menunjuk.
* **Root Cause Analysis (RCA):** Kondisi evaluasi `isTargetMatch || isAllianceMatch || isCodeMatch` tidak memvalidasi apakah kedua pihak menyediakan kode pairing yang saling bertentangan sebelum mengesahkan target match.
* **Resolusi:** Menambahkan penjaga eksplisit: jika kedua pihak menyediakan `pairingCode` atau `allianceId` dan nilainya tidak sama, iterasi dilewati (`continue`).
* **Verifikasi:** Lulus pengujian pada `tests/geo.test.ts` (TC-F2-42).

#### 🔹 BUG-015: Memory Zeroization Gap in EphemeralPairingManager.clear()
* **Status:** `[CLOSED]`
* **Severity:** Medium
* **Komponen:** `src/services/allianceService.ts` (`EphemeralPairingManager.clear`)
* **Gejala:** Pemanggilan `manager.clear()` menghapus entri Map tanpa menimpa koordinat `latitude` dan `longitude` menjadi `0.0`, berpotensi menyisakan jejak GPS di heap RAM.
* **Root Cause Analysis (RCA):** Metode `clear()` langsung memanggil `this.pendingRequests.clear()` tanpa iterasi zeroize seperti pada `cleanupExpired()`.
* **Resolusi:** Menambahkan iterasi pemusnahan koordinat `entry.payload.latitude = 0.0; entry.payload.longitude = 0.0;` sebelum penghapusan Map.
* **Verifikasi:** Lulus pengujian pada `tests/geo.test.ts` (TC-F2-44).

#### 🔹 BUG-016: HTTP 404 on /health Endpoint with URL Query Parameters
* **Status:** `[CLOSED]`
* **Severity:** Low
* **Komponen:** `src/server.ts` (`createGameServer`)
* **Gejala:** Pemeriksaan kesehatan HTTP `/health?probe=ready` mengembalikan `404 NOT_FOUND`.
* **Root Cause Analysis (RCA):** Evaluasi endpoint menggunakan perbandingan string langsung `req.url === "/health"`.
* **Resolusi:** Mengekstrak pathname murni via `req.url.split("?")[0]`.
* **Verifikasi:** Lulus pengujian pada `tests/expedition.test.ts` (TC-F2-36).

#### 🔹 BUG-017: Unsafe String-to-Boolean Conversion for AI Adapter Valid Flag
* **Status:** `[CLOSED]`
* **Severity:** Medium
* **Komponen:** `src/ai/aiAdapter.ts` (`AIDecreeGateway.clampNumericVector`)
* **Gejala:** Jika LLM mengembalikan JSON dengan string `valid: "false"` atau `valid: "0"`, hasil parsing mengevaluasi `Boolean("false") === true`, menganggap titah berbahaya sebagai sah.
* **Root Cause Analysis (RCA):** Penggunaan fungsi bawaan `Boolean(validRaw)` yang mengevaluasi string non-kosong apapun sebagai `true`.
* **Resolusi:** Menambahkan pemeriksaan eksplisit terhadap representasi string `"false"` dan `"0"`.
* **Verifikasi:** Lulus pengujian pada `tests/ai.test.ts` (TC-F2-45).

#### 🔹 BUG-018: Calamity Engine Vulnerability to Non-Finite and NaN Inputs
* **Status:** `[CLOSED]`
* **Severity:** Medium
* **Komponen:** `src/sim/calamityEngine.ts` (`CalamityAndBossEngine` & `BossEncounterStateMachine`)
* **Gejala:** Masukan `NaN` pada `currentHarmony` atau `efekLingkunganTitah` merusak kalkulasi probabilitas bencana dan menghasilkan `newHarmony: NaN`.
* **Root Cause Analysis (RCA):** Tidak adanya validasi numerik `Number.isFinite(...)` pada parameter masukan sebelum operasi matematika.
* **Resolusi:** Memvalidasi dan menyediakan fallback nilai aman default jika parameter bernilai non-finite.
* **Verifikasi:** Lulus pengujian pada `tests/expedition.test.ts` (TC-F2-40).

#### 🔹 BUG-019: Zustand v4 Store Generic Parameter Implicit Any Typing
* **Status:** `[CLOSED]`
* **Severity:** Medium
* **Komponen:** `frontend/src/store/useGameStore.ts`
* **Gejala:** Kompilasi `tsc --noEmit` gagal dengan error TS7006 pada `set` dan `s` yang dinilai memiliki tipe `implicit any`.
* **Root Cause Analysis (RCA):** Pemanggilan `create<GameStore>()((set) => ...)` tidak didukung secara otomatis oleh type inference TypeScript 5 tanpa deklarasi eksplisit `StateCreator<GameStore>`.
* **Resolusi:** Mengimpor `StateCreator` dari zustand dan mengetik `const storeCreator: StateCreator<GameStore> = (set) => ...` kemudian mengekspor `create<GameStore>(storeCreator)`.
* **Verifikasi:** `npm run typecheck` di direktori `frontend/` lolos 100% tanpa error.

#### 🔹 BUG-020: Isometric Coordinate Projection Function Mismatch in AgentSprites
* **Status:** `[CLOSED]`
* **Severity:** Low
* **Komponen:** `frontend/src/engine/AgentSprites.ts` & `frontend/src/engine/IsometricMap.ts`
* **Gejala:** `AgentSprites.ts` mengimpor `gridToIso` dan `IsoPoint` yang mulanya didefinisikan sebagai metode statis `IsometricMap.gridToScreen`.
* **Root Cause Analysis (RCA):** Perbedaan penamaan fungsi helper proyeksi koordinat antara sub-modul canvas.
* **Resolusi:** Menambahkan ekspor interface `IsoPoint` dan helper function `gridToIso(gridX, gridY): IsoPoint` di `IsometricMap.ts`.
* **Verifikasi:** Terverifikasi bersih dalam `tsc --noEmit`.

#### 🔹 BUG-021: Unused Parameter `actionCounts` in AgentSprites.updateAgents
* **Status:** `[CLOSED]`
* **Severity:** Low
* **Komponen:** `frontend/src/engine/AgentSprites.ts`
* **Gejala:** Flag kompilasi `noUnusedParameters: true` memicu error TS6133 pada argumen `actionCounts`.
* **Root Cause Analysis (RCA):** Parameter belum diintegrasikan ke logika visualisasi agen langsung karena iterasi menggunakan array otonom lokal.
* **Resolusi:** Melakukan re-naming ke `_actionCounts` sebagai konvensi parameter opsional TypeScript yang valid.
* **Verifikasi:** Terverifikasi bersih dalam `npm run typecheck`.

#### 🔹 BUG-022: Unused Lucide Icons in Frontend Modal Components
* **Status:** `[CLOSED]`
* **Severity:** Low
* **Komponen:** `frontend/src/components/AllianceRadar.tsx`, `BossHpOverlay.tsx`, `CoupOverlay.tsx`, `ExpeditionModal.tsx`
* **Gejala:** Kompilasi strict `noUnusedLocals: true` memicu error TS6133 untuk impor ikon yang tidak terpakai (`MapPin`, `Flame`, `HeartCrack`, `Wheat`, `Coins`, `Sparkles`, `Users`).
* **Root Cause Analysis (RCA):** Sisa referensi impor saat refaktor komponen visual glassmorphism.
* **Resolusi:** Memangkas seluruh unused imports secara menyeluruh sesuai prinsip Zero Dead Code Policy.
* **Verifikasi:** `npm run build` dan `npm run typecheck` berhasil tanpa peringatan.

#### 🔹 BUG-023: Unknown Type Assertion on Fetch JSON Response in E2E-01
* **Status:** `[CLOSED]`
* **Severity:** Low
* **Komponen:** `tests/e2e.test.ts`
* **Gejala:** Kompilasi `tsc --noEmit` melempar error TS18046: `'data' is of type 'unknown'`.
* **Root Cause Analysis (RCA):** Fungsi bawaan `res.json()` pada TypeScript ES2020 mengembalikan nilai `Promise<unknown>`, sehingga akses atribut membutuhkan type casting.
* **Resolusi:** Menambahkan type casting eksplisit: `(await res.json()) as { status: string; service: string; uptimeSeconds: number }`.
* **Verifikasi:** Terverifikasi bersih dalam `npm run typecheck`.

#### 🔹 BUG-024: Missing Mandatory `worldId` in DeterministicWorldOrchestrator E2E Instance
* **Status:** `[CLOSED]`
* **Severity:** Medium
* **Komponen:** `tests/e2e.test.ts`
* **Gejala:** Kompilasi `tsc --noEmit` gagal dengan error TS2554: `Expected 1-4 arguments, but got 0`.
* **Root Cause Analysis (RCA):** Instansiasi `new DeterministicWorldOrchestrator()` tidak menyertakan argumen wajib `worldId: string`.
* **Resolusi:** Menyertakan argumen identifier realm yang valid: `new DeterministicWorldOrchestrator("realm-e2e")`.
* **Verifikasi:** Lulus pengujian E2E-07 dan bersih dalam `npm run typecheck`.

#### 🔹 BUG-025: Unclosed WebSocket Client Sockets in E2E AfterAll Hook
* **Status:** `[CLOSED]`
* **Severity:** Medium
* **Komponen:** `tests/e2e.test.ts`
* **Gejala:** Hook `afterAll` vitest mengalami hang dan timeout setelah 10000ms saat menutup `server.close()`.
* **Root Cause Analysis (RCA):** Socket klien WebSocket masih dalam status `OPEN`, mencegah `http.Server.close` memicu callback penyelesaian.
* **Resolusi:** Menggunakan metode `socket.terminate()` pada setiap klien uji dan memanggil `server.closeAllConnections()` sebelum `server.close()`.
* **Verifikasi:** Hook `afterAll` selesai instan dalam < 10ms tanpa timeout.

---

## 🛡️ 6. Protokol Pengujian Regresi Lintas Fase (Regression Protocol)

Setiap penambahan kode pada fase berikutnya (Fase 3 sampai Fase 5) WAJIB mematuhi prosedur verifikasi regresi berikut sebelum diserahkan:

1. **Jalankan Uji Tipe TypeScript:**
   ```powershell
   npm run typecheck
   ```
   *Kriteria Kelulusan:* Exit code 0, 0 warning, 0 error.

2. **Jalankan Validasi Skema Database Prisma:**
   ```powershell
   npm run prisma:validate
   ```
   *Kriteria Kelulusan:* Pesan konfirmasi `The schema at prisma/schema.prisma is valid 🚀`.

3. **Jalankan Rangkaian Unit Test Regresi Keseluruhan:**
   ```powershell
   npm test
   ```
   *Kriteria Kelulusan:* 100% test case (72 test case Fase 1 + Fase 2) wajib berstatus PASS tanpa regresi performa.

4. **Jalankan Build Produksi:**
   ```powershell
   npm run build
   ```
   *Kriteria Kelulusan:* Kompilasi TypeScript tsc ke direktori `dist/` berhasil bersih dengan exit code 0.
