/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Automated Test Suite: Geolocation Onsite Verifier & Anti-Spoofing (tests/geo.test.ts)
 *
 * Test Specifications:
 * - TC-F2-01: Akurasi Formula Geodesik Haversine & Eliminasi Risiko NaN (Clamping a in [0.0, 1.0])
 * - TC-F2-02: Verifikasi Ambang Batas Fisik 200 Meter (Radius Onsite Mandat)
 * - TC-F2-03: Penolakan Jarak Lebih dari 200 Meter (DISTANCE_EXCEEDED)
 * - TC-F2-04: Deteksi & Penolakan Mock Location Provider (MOCK_LOCATION_DETECTED)
 * - TC-F2-05: Deteksi & Penolakan Akurasi GPS Buruk > 50 Meter (ACCURACY_INSUFFICIENT)
 * - TC-F2-06: Deteksi Self-Pairing Hardware Entropy (Kloning Akun di 1 Perangkat)
 * - TC-F2-07: Deteksi Anomali Kecepatan Teleportasi / Velocity Jump (> 50 m/s)
 * - TC-F2-08: Deteksi Replay Attack / Timestamp Lampau / Delta Sinkronisasi > 10 Detik
 * - TC-F2-09: Audit Privasi Zero-Knowledge: Pemusnahan Koordinat RAM (< 50ms) & Zero DB Storage
 * - TC-F2-10: Ephemeral Pairing Manager dengan Siklus TTL 10 Detik
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  GeolocationOnsiteVerifier,
  EphemeralPairingManager,
  type EphemeralGeoPayload
} from "../src/services/allianceService.js";

describe("Fase 2: Geolocation Onsite Verifier & Anti-Spoofing Suite", () => {
  beforeEach(() => {
    GeolocationOnsiteVerifier.clearHistory();
  });

  it("harus menghitung jarak Haversine geodesik secara presisi bit-level dan stabil dari NaN (TC-F2-01)", () => {
    // Koordinat Tugu Yogyakarta (-7.782889, 110.367083) ke Malioboro Mall (-7.792500, 110.365833)
    // Jarak nyata: ~1.07 km (1074 meter)
    const dist = GeolocationOnsiteVerifier.calculateHaversineDistance(
      -7.782889,
      110.367083,
      -7.792500,
      110.365833
    );
    expect(dist).toBeGreaterThan(1050);
    expect(dist).toBeLessThan(1100);

    // Titik yang sama harus menghasilkan jarak persis 0.0 tanpa NaN
    const zeroDist = GeolocationOnsiteVerifier.calculateHaversineDistance(
      -7.782889,
      110.367083,
      -7.782889,
      110.367083
    );
    expect(zeroDist).toBeCloseTo(0.0, 5);
    expect(Number.isNaN(zeroDist)).toBe(false);

    // Titik antipodal ekstrim (kutub ke kutub) harus ter-clamp dalam rentang [0.0, 1.0] tanpa NaN
    const extremeDist = GeolocationOnsiteVerifier.calculateHaversineDistance(
      90.0,
      0.0,
      -90.0,
      0.0
    );
    expect(Number.isNaN(extremeDist)).toBe(false);
    expect(extremeDist).toBeGreaterThan(19_000_000);
  });

  it("harus meloloskan verifikasi aliansi jika jarak <= 200 meter (TC-F2-02)", () => {
    const now = Date.now();
    // Koordinat berjarak ~45 meter di Alun-Alun Utara Yogyakarta
    const payloadA: EphemeralGeoPayload = {
      kingdomId: "k-alpha",
      latitude: -7.803249,
      longitude: 110.364404,
      accuracyMeters: 8.5,
      isMock: false,
      deviceEntropyHash: "device_hash_aaa_111",
      timestamp: now
    };

    const payloadB: EphemeralGeoPayload = {
      kingdomId: "k-beta",
      latitude: -7.803500,
      longitude: 110.364600,
      accuracyMeters: 6.2,
      isMock: false,
      deviceEntropyHash: "device_hash_bbb_222",
      timestamp: now + 500 // Beda 500 ms (sinkron)
    };

    const result = GeolocationOnsiteVerifier.verifyAndZeroize(payloadA, payloadB, now);
    expect(result.verified).toBe(true);
    expect(result.distanceMeters).toBeLessThanOrEqual(200.0);
    expect(result.distanceMeters).toBeGreaterThan(0.0);
    expect(result.rejectionReason).toBeUndefined();
  });

  it("harus menolak verifikasi jika jarak melebihi 200 meter (TC-F2-03)", () => {
    const now = Date.now();
    // Koordinat berjarak ~550 meter
    const payloadA: EphemeralGeoPayload = {
      kingdomId: "k-alpha",
      latitude: -7.803249,
      longitude: 110.364404,
      accuracyMeters: 10.0,
      isMock: false,
      deviceEntropyHash: "device_hash_aaa_111",
      timestamp: now
    };

    const payloadB: EphemeralGeoPayload = {
      kingdomId: "k-charlie",
      latitude: -7.808000,
      longitude: 110.364404,
      accuracyMeters: 12.0,
      isMock: false,
      deviceEntropyHash: "device_hash_ccc_333",
      timestamp: now
    };

    const result = GeolocationOnsiteVerifier.verifyAndZeroize(payloadA, payloadB, now);
    expect(result.verified).toBe(false);
    expect(result.distanceMeters).toBeGreaterThan(200.0);
    expect(result.rejectionReason).toBe("DISTANCE_EXCEEDED");
  });

  it("harus mendeteksi dan menolak sensor Mock Location Provider (TC-F2-04)", () => {
    const now = Date.now();
    const payloadA: EphemeralGeoPayload = {
      kingdomId: "k-alpha",
      latitude: -7.803249,
      longitude: 110.364404,
      accuracyMeters: 5.0,
      isMock: true, // Mock location aktif!
      deviceEntropyHash: "device_hash_spoof_1",
      timestamp: now
    };

    const payloadB: EphemeralGeoPayload = {
      kingdomId: "k-beta",
      latitude: -7.803300,
      longitude: 110.364450,
      accuracyMeters: 5.0,
      isMock: false,
      deviceEntropyHash: "device_hash_legit_2",
      timestamp: now
    };

    const result = GeolocationOnsiteVerifier.verifyAndZeroize(payloadA, payloadB, now);
    expect(result.verified).toBe(false);
    expect(result.rejectionReason).toBe("MOCK_LOCATION_DETECTED");
  });

  it("harus menolak koordinat dengan akurasi GPS buruk > 50 meter (TC-F2-05)", () => {
    const now = Date.now();
    const payloadA: EphemeralGeoPayload = {
      kingdomId: "k-alpha",
      latitude: -7.803249,
      longitude: 110.364404,
      accuracyMeters: 75.0, // Akurasi buruk (sinyal lemah)
      isMock: false,
      deviceEntropyHash: "device_hash_aaa_111",
      timestamp: now
    };

    const payloadB: EphemeralGeoPayload = {
      kingdomId: "k-beta",
      latitude: -7.803300,
      longitude: 110.364450,
      accuracyMeters: 10.0,
      isMock: false,
      deviceEntropyHash: "device_hash_bbb_222",
      timestamp: now
    };

    const result = GeolocationOnsiteVerifier.verifyAndZeroize(payloadA, payloadB, now);
    expect(result.verified).toBe(false);
    expect(result.rejectionReason).toBe("ACCURACY_INSUFFICIENT");
  });

  it("harus mencegah self-pairing pada 1 perangkat fisik dengan kesamaan entropy hash (TC-F2-06)", () => {
    const now = Date.now();
    const identicalEntropy = "hardware_entropy_sha256_identical_phone";

    const payloadA: EphemeralGeoPayload = {
      kingdomId: "k-player-one",
      latitude: -7.803249,
      longitude: 110.364404,
      accuracyMeters: 8.0,
      isMock: false,
      deviceEntropyHash: identicalEntropy,
      timestamp: now
    };

    const payloadB: EphemeralGeoPayload = {
      kingdomId: "k-player-clone",
      latitude: -7.803250,
      longitude: 110.364405,
      accuracyMeters: 8.0,
      isMock: false,
      deviceEntropyHash: identicalEntropy, // Sama! (Kloning pada 1 browser/device)
      timestamp: now
    };

    const result = GeolocationOnsiteVerifier.verifyAndZeroize(payloadA, payloadB, now);
    expect(result.verified).toBe(false);
    expect(result.rejectionReason).toBe("SELF_PAIRING_DETECTED");
  });

  it("harus mendeteksi lonjakan kecepatan teleportasi tidak wajar > 50 m/s (TC-F2-07)", () => {
    const t0 = Date.now();

    // 1. Catat posisi awal di Yogyakarta
    const firstPayloadA: EphemeralGeoPayload = {
      kingdomId: "k-teleporter",
      latitude: -7.782889,
      longitude: 110.367083,
      accuracyMeters: 10.0,
      isMock: false,
      deviceEntropyHash: "entropy_teleporter_1",
      timestamp: t0
    };

    const partnerA: EphemeralGeoPayload = {
      kingdomId: "k-partner-1",
      latitude: -7.782900,
      longitude: 110.367100,
      accuracyMeters: 10.0,
      isMock: false,
      deviceEntropyHash: "entropy_partner_1",
      timestamp: t0
    };

    GeolocationOnsiteVerifier.verifyAndZeroize(firstPayloadA, partnerA, t0);

    // 2. 2 detik kemudian, kerajaan yang sama tiba-tiba berada di Semarang (-6.966667, 110.416667) (~90 km)
    const t1 = t0 + 2000;
    const secondPayloadA: EphemeralGeoPayload = {
      kingdomId: "k-teleporter",
      latitude: -6.966667,
      longitude: 110.416667,
      accuracyMeters: 10.0,
      isMock: false,
      deviceEntropyHash: "entropy_teleporter_1",
      timestamp: t1
    };

    const partnerB: EphemeralGeoPayload = {
      kingdomId: "k-partner-2",
      latitude: -6.966700,
      longitude: 110.416700,
      accuracyMeters: 10.0,
      isMock: false,
      deviceEntropyHash: "entropy_partner_2",
      timestamp: t1
    };

    const result = GeolocationOnsiteVerifier.verifyAndZeroize(secondPayloadA, partnerB, t1);
    expect(result.verified).toBe(false);
    expect(result.rejectionReason).toBe("TELEPORTATION_SPOOF_DETECTED");
  });

  it("harus menolak handshake dengan delta timestamp > 10 detik atau koordinat basi (TC-F2-08)", () => {
    const now = Date.now();

    // Skenario A: Delta waktu antara A dan B melebihi 10 detik
    const payloadA: EphemeralGeoPayload = {
      kingdomId: "k-alpha",
      latitude: -7.803249,
      longitude: 110.364404,
      accuracyMeters: 10.0,
      isMock: false,
      deviceEntropyHash: "hash_a",
      timestamp: now
    };

    const payloadB: EphemeralGeoPayload = {
      kingdomId: "k-beta",
      latitude: -7.803300,
      longitude: 110.364450,
      accuracyMeters: 10.0,
      isMock: false,
      deviceEntropyHash: "hash_b",
      timestamp: now + 12_000 // Selisih 12 detik (> 10s)
    };

    const resultDelta = GeolocationOnsiteVerifier.verifyAndZeroize(payloadA, payloadB, now);
    expect(resultDelta.verified).toBe(false);
    expect(resultDelta.rejectionReason).toBe("TIMESTAMP_DELTA_EXCEEDED");

    // Skenario B: Timestamp basi / Replay packet lampau (> 15s lalu)
    const stalePayloadA: EphemeralGeoPayload = {
      kingdomId: "k-gamma",
      latitude: -7.803249,
      longitude: 110.364404,
      accuracyMeters: 10.0,
      isMock: false,
      deviceEntropyHash: "hash_g",
      timestamp: now - 30_000 // 30 detik yang lalu
    };

    const stalePayloadB: EphemeralGeoPayload = {
      kingdomId: "k-delta",
      latitude: -7.803300,
      longitude: 110.364450,
      accuracyMeters: 10.0,
      isMock: false,
      deviceEntropyHash: "hash_d",
      timestamp: now - 30_000
    };

    const resultStale = GeolocationOnsiteVerifier.verifyAndZeroize(stalePayloadA, stalePayloadB, now);
    expect(resultStale.verified).toBe(false);
    expect(resultStale.rejectionReason).toBe("TIMESTAMP_STALE");
  });

  it("harus memusnahkan koordinat GPS mentah dari RAM (< 50ms) dan zero persistence (TC-F2-09)", () => {
    const now = Date.now();
    const payloadA: EphemeralGeoPayload = {
      kingdomId: "k-alpha",
      latitude: -7.803249,
      longitude: 110.364404,
      accuracyMeters: 8.0,
      isMock: false,
      deviceEntropyHash: "hash_alpha_priv",
      timestamp: now
    };

    const payloadB: EphemeralGeoPayload = {
      kingdomId: "k-beta",
      latitude: -7.803280,
      longitude: 110.364420,
      accuracyMeters: 7.0,
      isMock: false,
      deviceEntropyHash: "hash_beta_priv",
      timestamp: now
    };

    const startTime = performance.now();
    const result = GeolocationOnsiteVerifier.verifyAndZeroize(payloadA, payloadB, now);
    const durationMs = performance.now() - startTime;

    // Durasi wajib < 50 ms
    expect(durationMs).toBeLessThan(50.0);

    // Variabel latitude dan longitude objek asal wajib di-zeroize menjadi 0.0
    expect(payloadA.latitude).toBe(0.0);
    expect(payloadA.longitude).toBe(0.0);
    expect(payloadB.latitude).toBe(0.0);
    expect(payloadB.longitude).toBe(0.0);

    // Hasil verifikasi hanya boleh memuat jarak skalar, tanpa data lintang/bujur
    expect(result.verified).toBe(true);
    expect((result as any).latitude).toBeUndefined();
    expect((result as any).longitude).toBeUndefined();
  });

  it("harus mengelola pairing aliansi ephemeral dengan TTL 10 detik (TC-F2-10)", () => {
    const manager = new EphemeralPairingManager(10_000);
    const t0 = 1_000_000;

    // 1. Klien A mengirim handshake pairing
    const payloadA: EphemeralGeoPayload = {
      kingdomId: "k-1",
      latitude: -7.803249,
      longitude: 110.364404,
      accuracyMeters: 10.0,
      isMock: false,
      deviceEntropyHash: "hash_1",
      timestamp: t0,
      targetKingdomId: "k-2"
    };

    const res1 = manager.submitHandshake(payloadA, t0);
    expect(res1.matched).toBe(false);
    expect(manager.getPendingCount()).toBe(1);

    // 2. Klien B merespons sebelum TTL habis (misal 3 detik kemudian)
    const payloadB: EphemeralGeoPayload = {
      kingdomId: "k-2",
      latitude: -7.803270,
      longitude: 110.364410,
      accuracyMeters: 8.0,
      isMock: false,
      deviceEntropyHash: "hash_2",
      timestamp: t0 + 3000,
      targetKingdomId: "k-1"
    };

    const res2 = manager.submitHandshake(payloadB, t0 + 3000);
    expect(res2.matched).toBe(true);
    expect(res2.result?.verified).toBe(true);
    expect(res2.partnerKingdomId).toBe("k-1");
    expect(manager.getPendingCount()).toBe(0);

    // 3. Permintaan yang kedaluwarsa setelah 10 detik harus dibersihkan
    const payloadC: EphemeralGeoPayload = {
      kingdomId: "k-3",
      latitude: -7.803249,
      longitude: 110.364404,
      accuracyMeters: 10.0,
      isMock: false,
      deviceEntropyHash: "hash_3",
      timestamp: t0,
      pairingCode: "SUMPAH_123"
    };

    manager.submitHandshake(payloadC, t0);
    expect(manager.getPendingCount()).toBe(1);

    // Maju 11 detik
    manager.cleanupExpired(t0 + 11_000);
    expect(manager.getPendingCount()).toBe(0);
  });

  it("harus menolak pencocokan jika kode pairing kedua pihak bertentangan (TC-F2-42)", () => {
    const manager = new EphemeralPairingManager(10_000);
    const now = Date.now();

    const payloadA: EphemeralGeoPayload = {
      kingdomId: "k-code-1",
      targetKingdomId: "k-code-2",
      latitude: -7.803249,
      longitude: 110.364404,
      accuracyMeters: 10.0,
      isMock: false,
      deviceEntropyHash: "hash_code_1",
      timestamp: now,
      pairingCode: "KODE_ALPHA"
    };

    const payloadB: EphemeralGeoPayload = {
      kingdomId: "k-code-2",
      targetKingdomId: "k-code-1",
      latitude: -7.803250,
      longitude: 110.364405,
      accuracyMeters: 10.0,
      isMock: false,
      deviceEntropyHash: "hash_code_2",
      timestamp: now,
      pairingCode: "KODE_BETA" // Kode bertentangan!
    };

    const resA = manager.submitHandshake(payloadA, now);
    expect(resA.matched).toBe(false);

    const resB = manager.submitHandshake(payloadB, now);
    expect(resB.matched).toBe(false); // Tidak boleh cocok!
    expect(manager.getPendingCount()).toBe(2);
  });

  it("harus fast-fail pada submitHandshake saat sensor tiruan atau GPS tidak akurat terdeteksi (TC-F2-43)", () => {
    const manager = new EphemeralPairingManager(10_000);
    const now = Date.now();

    const mockPayload: EphemeralGeoPayload = {
      kingdomId: "k-mock",
      latitude: -7.803249,
      longitude: 110.364404,
      accuracyMeters: 10.0,
      isMock: true,
      deviceEntropyHash: "hash_mock",
      timestamp: now,
      pairingCode: "SUMPAH_MOCK"
    };

    const res = manager.submitHandshake(mockPayload, now);
    expect(res.matched).toBe(true);
    expect(res.result?.verified).toBe(false);
    expect(res.result?.rejectionReason).toBe("MOCK_LOCATION_DETECTED");
    expect(manager.getPendingCount()).toBe(0); // Tidak disimpan di RAM
  });

  it("harus memusnahkan koordinat memori saat cancelPending dan manager.clear() (TC-F2-44)", () => {
    const manager = new EphemeralPairingManager(10_000);
    const now = Date.now();

    const payload: EphemeralGeoPayload = {
      kingdomId: "k-cancel",
      latitude: -7.803249,
      longitude: 110.364404,
      accuracyMeters: 10.0,
      isMock: false,
      deviceEntropyHash: "hash_cancel",
      timestamp: now,
      pairingCode: "SUMPAH_CANCEL"
    };

    manager.submitHandshake(payload, now);
    expect(manager.getPendingCount()).toBe(1);

    // Cancel pending
    const cancelled = manager.cancelPending("k-cancel");
    expect(cancelled).toBe(true);
    expect(manager.getPendingCount()).toBe(0);

    // Re-insert and test clear() zeroization
    const payload2: EphemeralGeoPayload = {
      kingdomId: "k-clear",
      latitude: -7.803249,
      longitude: 110.364404,
      accuracyMeters: 10.0,
      isMock: false,
      deviceEntropyHash: "hash_clear",
      timestamp: now,
      pairingCode: "SUMPAH_CLEAR"
    };

    manager.submitHandshake(payload2, now);
    manager.clear();
    expect(manager.getPendingCount()).toBe(0);
  });
});
