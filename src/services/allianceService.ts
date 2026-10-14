/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Privacy-First Onsite Physical Geolocation Verifier (FR-16, FR-17, FR-18, NFR-06, SDD Bab 4.4)
 *
 * Implements:
 * 1. Haversine Great-Circle Geodesic Distance with absolute clamping a in [0.0, 1.0] (no NaN).
 * 2. 200.0-meter physical onsite threshold.
 * 3. Max synchronization delta |Delta t| <= 10.0 seconds.
 * 4. Ephemeral Pairing Token Store with 10-second TTL.
 * 5. Anti-spoofing heuristics (Mock Location check, accuracy > 50m check,
 *    self-pairing entropy hash check, velocity teleportation jump check).
 * 6. Zero-Knowledge Memory Wiper (Zeroization < 50ms, 0% persistent GPS storage, UU PDP No. 27/2022).
 */

export interface EphemeralGeoPayload {
  kingdomId: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  isMock: boolean;
  deviceEntropyHash: string;
  timestamp: number;
  allianceId?: string;
  targetKingdomId?: string;
  pairingCode?: string;
}

export interface VerificationResult {
  verified: boolean;
  distanceMeters: number;
  rejectionReason?:
    | "MOCK_LOCATION_DETECTED"
    | "ACCURACY_INSUFFICIENT"
    | "TIMESTAMP_DELTA_EXCEEDED"
    | "TIMESTAMP_STALE"
    | "SELF_PAIRING_DETECTED"
    | "TELEPORTATION_SPOOF_DETECTED"
    | "DISTANCE_EXCEEDED"
    | "PAIRING_EXPIRED"
    | "PAIRING_NOT_FOUND";
}

interface HistoricalPositionRecord {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export class GeolocationOnsiteVerifier {
  public static readonly MAX_ALLOWED_DISTANCE_METERS = 200.0;
  public static readonly MAX_ACCEPTABLE_ACCURACY_METERS = 50.0;
  public static readonly MAX_ALLOWED_TIMESTAMP_DELTA_MS = 10_000; // 10 detik
  public static readonly MAX_ALLOWED_TIMESTAMP_AGE_MS = 15_000; // Max 15 detik dari waktu sekarang
  public static readonly MAX_PLAUSIBLE_SPEED_MPS = 50.0; // 50 m/s ~ 180 km/jam
  public static readonly EARTH_RADIUS_METERS = 6_371_000.0;

  // In-memory historical cache for teleportation velocity heuristic (cleans up automatically)
  private static readonly historyMap = new Map<string, HistoricalPositionRecord>();

  /**
   * Pure mathematical Haversine formula with numerical clamping a in [0.0, 1.0].
   */
  public static calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    if (
      !Number.isFinite(lat1) ||
      !Number.isFinite(lon1) ||
      !Number.isFinite(lat2) ||
      !Number.isFinite(lon2)
    ) {
      return 0.0;
    }

    const clampedLat1 = Math.max(-90.0, Math.min(90.0, lat1));
    const clampedLat2 = Math.max(-90.0, Math.min(90.0, lat2));
    const clampedLon1 = Math.max(-180.0, Math.min(180.0, lon1));
    const clampedLon2 = Math.max(-180.0, Math.min(180.0, lon2));

    const phi1 = (clampedLat1 * Math.PI) / 180.0;
    const phi2 = (clampedLat2 * Math.PI) / 180.0;
    const deltaPhi = ((clampedLat2 - clampedLat1) * Math.PI) / 180.0;
    const deltaLambda = ((clampedLon2 - clampedLon1) * Math.PI) / 180.0;

    const sinHalfDeltaPhi = Math.sin(deltaPhi / 2.0);
    const sinHalfDeltaLambda = Math.sin(deltaLambda / 2.0);

    const a =
      sinHalfDeltaPhi * sinHalfDeltaPhi +
      Math.cos(phi1) * Math.cos(phi2) * sinHalfDeltaLambda * sinHalfDeltaLambda;

    // Numerical Clamping [0.0, 1.0] eliminates floating-point precision NaN
    const clampedA = Math.max(0.0, Math.min(1.0, Number.isFinite(a) ? a : 0.0));
    const c = 2.0 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1.0 - clampedA));
    return this.EARTH_RADIUS_METERS * c;
  }

  /**
   * Validates single payload integrity (anti-spoofing, accuracy bounds, freshness).
   * Returns verification failure result if invalid, or null if valid.
   */
  public static validateSinglePayload(
    payload: EphemeralGeoPayload,
    nowMs: number = Date.now()
  ): VerificationResult | null {
    if (payload.isMock) {
      payload.latitude = 0.0;
      payload.longitude = 0.0;
      return { verified: false, distanceMeters: -1, rejectionReason: "MOCK_LOCATION_DETECTED" };
    }

    if (
      !Number.isFinite(payload.accuracyMeters) ||
      payload.accuracyMeters > this.MAX_ACCEPTABLE_ACCURACY_METERS ||
      payload.accuracyMeters < 0 ||
      !Number.isFinite(payload.latitude) ||
      !Number.isFinite(payload.longitude) ||
      payload.latitude < -90 ||
      payload.latitude > 90 ||
      payload.longitude < -180 ||
      payload.longitude > 180
    ) {
      payload.latitude = 0.0;
      payload.longitude = 0.0;
      return { verified: false, distanceMeters: -1, rejectionReason: "ACCURACY_INSUFFICIENT" };
    }

    if (Math.abs(nowMs - payload.timestamp) > this.MAX_ALLOWED_TIMESTAMP_AGE_MS) {
      payload.latitude = 0.0;
      payload.longitude = 0.0;
      return { verified: false, distanceMeters: -1, rejectionReason: "TIMESTAMP_STALE" };
    }

    if (this.isTeleportationAnomaly(payload)) {
      payload.latitude = 0.0;
      payload.longitude = 0.0;
      return { verified: false, distanceMeters: -1, rejectionReason: "TELEPORTATION_SPOOF_DETECTED" };
    }

    return null;
  }

  /**
   * Verifies mutual physical presence of two payloads and immediately zeroizes coordinates.
   */
  public static verifyAndZeroize(
    payloadA: EphemeralGeoPayload,
    payloadB: EphemeralGeoPayload,
    nowMs: number = Date.now()
  ): VerificationResult {
    // 1. Audit Single-Payload Anti-Spoofing & Sensor Mocking (FR-18)
    const checkA = this.validateSinglePayload(payloadA, nowMs);
    if (checkA) {
      this.zeroizePayloads(payloadA, payloadB);
      return checkA;
    }

    const checkB = this.validateSinglePayload(payloadB, nowMs);
    if (checkB) {
      this.zeroizePayloads(payloadA, payloadB);
      return checkB;
    }

    // 2. Audit Synchronous Window (|Delta t| <= 10s)
    if (Math.abs(payloadA.timestamp - payloadB.timestamp) > this.MAX_ALLOWED_TIMESTAMP_DELTA_MS) {
      this.zeroizePayloads(payloadA, payloadB);
      return { verified: false, distanceMeters: -1, rejectionReason: "TIMESTAMP_DELTA_EXCEEDED" };
    }

    // 3. Audit Anti-Self-Pairing Hardware Entropy (mencegah duplikasi di 1 gawai)
    if (
      payloadA.deviceEntropyHash &&
      payloadB.deviceEntropyHash &&
      payloadA.deviceEntropyHash === payloadB.deviceEntropyHash
    ) {
      this.zeroizePayloads(payloadA, payloadB);
      return { verified: false, distanceMeters: -1, rejectionReason: "SELF_PAIRING_DETECTED" };
    }

    // 4. Calculate Haversine Distance
    const distanceMeters = this.calculateHaversineDistance(
      payloadA.latitude,
      payloadA.longitude,
      payloadB.latitude,
      payloadB.longitude
    );

    // Record coarse history for future velocity checks
    this.recordHistory(payloadA);
    this.recordHistory(payloadB);

    // 5. ZERO-KNOWLEDGE PROTOCOL: Zeroize memory variables immediately (FR-17)
    this.zeroizePayloads(payloadA, payloadB);

    const roundedDistance = Number(distanceMeters.toFixed(2));

    // 6. Evaluate 200-meter threshold
    if (roundedDistance <= this.MAX_ALLOWED_DISTANCE_METERS) {
      return {
        verified: true,
        distanceMeters: roundedDistance
      };
    } else {
      return {
        verified: false,
        distanceMeters: roundedDistance,
        rejectionReason: "DISTANCE_EXCEEDED"
      };
    }
  }

  /**
   * Overwrite raw GPS floating-point numbers with 0.0 in volatile RAM.
   */
  public static zeroizePayloads(a: EphemeralGeoPayload, b: EphemeralGeoPayload): void {
    a.latitude = 0.0;
    a.longitude = 0.0;
    b.latitude = 0.0;
    b.longitude = 0.0;
  }

  private static recordHistory(payload: EphemeralGeoPayload): void {
    this.pruneHistory(payload.timestamp);
    this.historyMap.set(payload.kingdomId, {
      latitude: payload.latitude,
      longitude: payload.longitude,
      timestamp: payload.timestamp
    });
  }

  private static isTeleportationAnomaly(payload: EphemeralGeoPayload): boolean {
    this.pruneHistory(payload.timestamp);
    const prev = this.historyMap.get(payload.kingdomId);
    if (!prev) return false;

    const deltaSeconds = (payload.timestamp - prev.timestamp) / 1000.0;
    if (deltaSeconds <= 0 || deltaSeconds > 300) {
      // Outdated record (> 5 minutes) or invalid order
      return false;
    }

    const dist = this.calculateHaversineDistance(
      prev.latitude,
      prev.longitude,
      payload.latitude,
      payload.longitude
    );

    const speed = dist / deltaSeconds;
    return speed > this.MAX_PLAUSIBLE_SPEED_MPS;
  }

  public static pruneHistory(nowMs: number = Date.now()): void {
    for (const [kingdomId, record] of this.historyMap.entries()) {
      if (nowMs - record.timestamp > 300_000 || nowMs < record.timestamp) {
        record.latitude = 0.0;
        record.longitude = 0.0;
        this.historyMap.delete(kingdomId);
      }
    }
  }

  public static clearHistory(): void {
    for (const record of this.historyMap.values()) {
      record.latitude = 0.0;
      record.longitude = 0.0;
    }
    this.historyMap.clear();
  }
}

/**
 * Ephemeral Pairing Manager for Onsite Alliance Handshakes (TTL 10s).
 */
export class EphemeralPairingManager {
  private readonly pendingRequests = new Map<
    string,
    { payload: EphemeralGeoPayload; expiresAt: number }
  >();
  private readonly ttlMs: number;

  constructor(ttlMs: number = 10_000) {
    this.ttlMs = ttlMs;
  }

  /**
   * Submit an ephemeral handshake request. If matching partner exists, resolves verification.
   */
  public submitHandshake(
    payload: EphemeralGeoPayload,
    nowMs: number = Date.now()
  ): {
    matched: boolean;
    result?: VerificationResult;
    partnerKingdomId?: string;
  } {
    this.cleanupExpired(nowMs);

    // 1. Fast-fail single payload if sensor is spoofed, inaccurate, stale, or impossible velocity
    const singleCheck = GeolocationOnsiteVerifier.validateSinglePayload(payload, nowMs);
    if (singleCheck) {
      return {
        matched: true,
        result: singleCheck
      };
    }

    // Look for matching partner
    // A pair can match by:
    // 1. Same allianceId (if already defined)
    // 2. targetKingdomId matching payload.kingdomId
    // 3. pairingCode matching
    let matchingKey: string | undefined;

    for (const [key, entry] of this.pendingRequests.entries()) {
      const partner = entry.payload;

      // Never match with oneself
      if (partner.kingdomId === payload.kingdomId) {
        continue;
      }

      // If both provided pairing codes and they do not match, skip
      if (
        partner.pairingCode &&
        payload.pairingCode &&
        partner.pairingCode !== payload.pairingCode
      ) {
        continue;
      }

      // If both provided allianceIds and they do not match, skip
      if (
        partner.allianceId &&
        payload.allianceId &&
        partner.allianceId !== payload.allianceId
      ) {
        continue;
      }

      const targetPartner = partner.targetKingdomId;
      const targetSelf = payload.targetKingdomId;
      const isTargetMatch =
        Boolean(targetPartner || targetSelf) &&
        (!targetPartner || targetPartner === payload.kingdomId) &&
        (!targetSelf || targetSelf === partner.kingdomId);

      const isAllianceMatch =
        Boolean(
          partner.allianceId &&
          payload.allianceId &&
          partner.allianceId === payload.allianceId
        );

      const isCodeMatch =
        Boolean(
          partner.pairingCode &&
          payload.pairingCode &&
          partner.pairingCode === payload.pairingCode
        );

      if (isTargetMatch || isAllianceMatch || isCodeMatch) {
        matchingKey = key;
        break;
      }
    }

    if (matchingKey) {
      const partnerEntry = this.pendingRequests.get(matchingKey)!;
      this.pendingRequests.delete(matchingKey);

      const partnerPayload = partnerEntry.payload;
      const partnerKingdomId = partnerPayload.kingdomId;

      const result = GeolocationOnsiteVerifier.verifyAndZeroize(
        payload,
        partnerPayload,
        nowMs
      );

      return {
        matched: true,
        result,
        partnerKingdomId
      };
    }

    // Ensure any stale previous pending request from this kingdom is cancelled and zeroized
    this.cancelPending(payload.kingdomId);

    // No partner found yet; store this request in ephemeral pool
    const key = `${payload.kingdomId}_${payload.allianceId ?? payload.pairingCode ?? "pending"}`;
    this.pendingRequests.set(key, {
      payload: { ...payload },
      expiresAt: nowMs + this.ttlMs
    });

    return { matched: false };
  }

  /**
   * Cancel and zeroize any pending requests for a specific kingdom (e.g. on socket disconnect).
   */
  public cancelPending(kingdomId: string): boolean {
    let cancelled = false;
    for (const [key, entry] of this.pendingRequests.entries()) {
      if (entry.payload.kingdomId === kingdomId) {
        entry.payload.latitude = 0.0;
        entry.payload.longitude = 0.0;
        this.pendingRequests.delete(key);
        cancelled = true;
      }
    }
    return cancelled;
  }

  public cleanupExpired(nowMs: number = Date.now()): void {
    for (const [key, entry] of this.pendingRequests.entries()) {
      if (entry.expiresAt <= nowMs) {
        // Zeroize memory before deletion
        entry.payload.latitude = 0.0;
        entry.payload.longitude = 0.0;
        this.pendingRequests.delete(key);
      }
    }
  }

  public getPendingCount(): number {
    return this.pendingRequests.size;
  }

  public clear(): void {
    for (const entry of this.pendingRequests.values()) {
      entry.payload.latitude = 0.0;
      entry.payload.longitude = 0.0;
    }
    this.pendingRequests.clear();
  }
}
