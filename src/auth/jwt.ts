/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Cryptographic JWT Authentication Service (RFC 7519 / HMAC-SHA256)
 *
 * Implements privacy-compliant stateless session token signing and verification
 * without heavy external dependencies.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

export interface JwtPayload {
  sub: string; // Player ID / UUID
  username?: string;
  kingdomId?: string;
  worldId?: string;
  age_confirmed?: boolean;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

export class JwtService {
  private static readonly DEFAULT_EXP_SECONDS = 86_400; // 24 jam sesuai SRS FR-02

  private static base64UrlEncode(input: string | Buffer): string {
    const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf-8");
    return buf.toString("base64url");
  }

  private static base64UrlDecode(str: string): string {
    return Buffer.from(str, "base64url").toString("utf-8");
  }

  public static sign(
    payload: JwtPayload,
    secret: string,
    expiresInSeconds: number = JwtService.DEFAULT_EXP_SECONDS
  ): string {
    const now = Math.floor(Date.now() / 1000);
    const fullPayload: JwtPayload = {
      ...payload,
      iat: payload.iat ?? now,
      exp: payload.exp ?? now + expiresInSeconds
    };

    const header = { alg: "HS256", typ: "JWT" };
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(fullPayload));

    const signature = createHmac("sha256", secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest();

    const encodedSignature = this.base64UrlEncode(signature);
    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
  }

  public static verify(token: string, secret: string): JwtPayload {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("JWT_MALFORMED: Token must contain exactly 3 segments");
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // 1. Verifikasi Signature HMAC-SHA256 dengan timingSafeEqual
    const expectedSig = createHmac("sha256", secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest();
    const providedSig = Buffer.from(signatureB64, "base64url");

    if (
      expectedSig.length !== providedSig.length ||
      !timingSafeEqual(expectedSig, providedSig)
    ) {
      throw new Error("JWT_INVALID_SIGNATURE: Signature mismatch");
    }

    // 2. Parse Payload
    let payload: JwtPayload;
    try {
      payload = JSON.parse(this.base64UrlDecode(payloadB64)) as JwtPayload;
    } catch {
      throw new Error("JWT_MALFORMED: Payload decoding failed");
    }

    // 3. Verifikasi Expiration Time
    if (payload.exp !== undefined) {
      const now = Math.floor(Date.now() / 1000);
      if (now > payload.exp) {
        throw new Error("JWT_EXPIRED: Token has expired");
      }
    }

    return payload;
  }
}
