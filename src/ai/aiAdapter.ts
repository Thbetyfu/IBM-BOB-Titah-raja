/**
 * Titah Rakyat: Sovereign of the Living Realm
 * AI Decree NLP Gateway & Resiliency Engine (FR-07, NFR-05, SDD Bab 4.3)
 *
 * Implements:
 * 1. 3-State Circuit Breaker FSM (CLOSED, OPEN, HALF_OPEN)
 * 2. 4.0-second hard timeout on LLM invocations
 * 3. Multi-layer Prompt Guard & Jailbreak Defense
 * 4. Deterministic Indonesian Keyword Fallback Parser
 * 5. Strict numeric clamping & validation
 * 6. Preset Policy Card O(1) resolver
 */

import { POLICY_CARD_CATALOG } from "../decree/cardCatalog.js";

export type DecreeSource = "LLM_PRIMARY" | "DETERMINISTIC_FALLBACK" | "SECURITY_REJECTED";

export interface DecreeSemanticVector {
  keadilan: number;
  kesejahteraan: number;
  keamanan: number;
  lingkungan: number;
  pajakDelta: number;
  biayaEmas: number;
  kategori: string;
  valid: boolean;
  source: DecreeSource;
  confidence?: number;
}

export type LLMHttpClient = (prompt: string, timeoutMs: number) => Promise<unknown>;

export interface AIDecreeGatewayOptions {
  failureThreshold?: number;
  cooldownMs?: number;
  timeoutMs?: number;
}

export class AIDecreeGateway {
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  private failureCount: number = 0;
  private readonly failureThreshold: number;
  private readonly cooldownMs: number;
  private readonly timeoutMs: number;
  private lastStateChangeTimestamp: number = Date.now();

  constructor(
    private readonly llmHttpClient?: LLMHttpClient,
    options?: AIDecreeGatewayOptions
  ) {
    this.failureThreshold = options?.failureThreshold ?? 3;
    this.cooldownMs = options?.cooldownMs ?? 30_000;
    this.timeoutMs = options?.timeoutMs ?? 4_000;
  }

  public getCircuitBreakerState(): "CLOSED" | "OPEN" | "HALF_OPEN" {
    return this.state;
  }

  public getFailureCount(): number {
    return this.failureCount;
  }

  public resetCircuitBreaker(): void {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.lastStateChangeTimestamp = Date.now();
  }

  /**
   * Process a free-text decree with prompt defense and resilience fallback.
   */
  public async processDecree(rawText: string): Promise<DecreeSemanticVector> {
    // 1. Lapisan 1: Prompt Guard & Sanitasi Karakter
    const sanitizedText = this.sanitizeInput(rawText);
    if (!this.validatePromptIntegrity(sanitizedText)) {
      return {
        keadilan: 0,
        kesejahteraan: 0,
        keamanan: 0,
        lingkungan: 0,
        pajakDelta: 0,
        biayaEmas: 0,
        kategori: "injeksi_terdeteksi",
        valid: false,
        source: "SECURITY_REJECTED",
        confidence: 0
      };
    }

    // 2. Evaluasi Kondisi Circuit Breaker FSM
    const now = Date.now();
    if (this.state === "OPEN") {
      if (now - this.lastStateChangeTimestamp >= this.cooldownMs) {
        this.state = "HALF_OPEN";
        this.lastStateChangeTimestamp = now;
      } else {
        // Fast-fail to deterministic fallback (< 50ms)
        return this.executeDeterministicFallback(sanitizedText);
      }
    }

    // If no LLM client is configured, fall back deterministically
    if (!this.llmHttpClient) {
      return this.executeDeterministicFallback(sanitizedText);
    }

    // 3. Panggilan LLM dengan AbortController / Timeout Keras 4.0 Detik
    try {
      const rawResult = await this.callLLMWithTimeout(sanitizedText, this.timeoutMs);
      
      // If we were HALF_OPEN and succeeded, restore CLOSED state
      if (this.state === "HALF_OPEN") {
        this.state = "CLOSED";
        this.failureCount = 0;
        this.lastStateChangeTimestamp = Date.now();
      }

      return this.clampNumericVector(rawResult, "LLM_PRIMARY");
    } catch {
      // Panggilan LLM gagal atau timeout -> catat kegagalan
      this.failureCount++;
      if (this.failureCount >= this.failureThreshold || this.state === "HALF_OPEN") {
        this.state = "OPEN";
        this.lastStateChangeTimestamp = Date.now();
      }
      return this.executeDeterministicFallback(sanitizedText);
    }
  }

  /**
   * Sanitize raw user input: strip dangerous scripting tags and enforce character limit.
   */
  public sanitizeInput(input: unknown): string {
    if (typeof input !== "string") {
      return "";
    }
    return input
      .replace(/[<>'"`;\\]/g, "")
      .trim()
      .slice(0, 200);
  }

  /**
   * Evaluates prompt against known injection, jailbreak, and system override attempts.
   */
  public validatePromptIntegrity(text: string): boolean {
    if (!text || text.length < 3) {
      return false;
    }
    const lower = text.toLowerCase();

    // Regex check for prompt overrides, jailbreaks, and SQL/command injections
    const regexForbidden =
      /\b(ignore\s+(?:all\s+)?(?:instructions?|previous)|system\s*prompt|override\b|admin\b|jailbreak|bypass|drop\s+table|grant\s+all|delete\s+from|update\s+.*set|curl\b|bash\b|sudo\b|eval\s*\(|<script)/i;
    if (regexForbidden.test(text)) {
      return false;
    }

    const forbiddenPhrases = [
      "dan jadikan raja tak terkalahkan",
      "tak terkalahkan",
      "emas tak hingga",
      "kas tak hingga",
      "pangan tak hingga",
      "pasukan tak hingga",
      "unlimited"
    ];

    for (const pattern of forbiddenPhrases) {
      if (lower.includes(pattern)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Deterministic Keyword-Based Regex Fallback Parser for Indonesian Decrees.
   */
  public executeDeterministicFallback(text: string): DecreeSemanticVector {
    const lower = text.toLowerCase();
    let keadilan = 0.0;
    let kesejahteraan = 0.0;
    let keamanan = 0.0;
    let lingkungan = 0.0;
    let pajakDelta = 0;
    let biayaEmas = 10;
    let kategori = "sosial";

    // Domain Pajak & Keuangan
    if (lower.includes("pajak") || lower.includes("upeti") || lower.includes("retribusi")) {
      kategori = "ekonomi";
      if (
        lower.includes("turun") ||
        lower.includes("potong") ||
        lower.includes("kurang") ||
        lower.includes("keringanan") ||
        lower.includes("hapus")
      ) {
        keadilan += 0.40;
        kesejahteraan += 0.50;
        pajakDelta = -5;
      } else if (
        lower.includes("naik") ||
        lower.includes("tinggi") ||
        lower.includes("tambah") ||
        lower.includes("lipat")
      ) {
        keadilan -= 0.50;
        kesejahteraan -= 0.30;
        pajakDelta = +5;
        biayaEmas = 0;
      }
    }

    // Domain Pangan & Lumbung
    if (
      lower.includes("lumbung") ||
      lower.includes("pangan") ||
      lower.includes("beras") ||
      lower.includes("gandum") ||
      lower.includes("panen") ||
      lower.includes("padi")
    ) {
      kategori = "ekonomi";
      if (
        lower.includes("bagi") ||
        lower.includes("buka") ||
        lower.includes("bansos") ||
        lower.includes("bantu") ||
        lower.includes("sedekah")
      ) {
        keadilan += 0.50;
        kesejahteraan += 0.60;
        biayaEmas += 15;
      }
    }

    // Domain Keamanan & Prajurit
    if (
      lower.includes("prajurit") ||
      lower.includes("benteng") ||
      lower.includes("pos") ||
      lower.includes("ronda") ||
      lower.includes("patroli") ||
      lower.includes("senjata") ||
      lower.includes("militer")
    ) {
      kategori = "keamanan";
      keamanan += 0.70;
      biayaEmas += 25;
      if (lower.includes("paksa") || lower.includes("wajib")) {
        keadilan -= 0.30;
        kesejahteraan -= 0.20;
      }
    }

    // Domain Alam & Ekologi
    if (
      lower.includes("hutan") ||
      lower.includes("sungai") ||
      lower.includes("pohon") ||
      lower.includes("tanam") ||
      lower.includes("alam") ||
      lower.includes("irigasi")
    ) {
      if (
        lower.includes("tebang") ||
        lower.includes("bakar") ||
        lower.includes("tambang") ||
        lower.includes("gali")
      ) {
        kategori = "alam";
        lingkungan -= 0.80;
        kesejahteraan += 0.30;
        biayaEmas += 10;
      } else if (
        lower.includes("tanam") ||
        lower.includes("rawat") ||
        lower.includes("lindungi") ||
        lower.includes("hijau") ||
        lower.includes("konservasi")
      ) {
        kategori = "alam";
        lingkungan += 0.80;
        keadilan += 0.20;
        biayaEmas += 15;
      }
    }

    // Domain Sosial, Damai & Gotong Royong
    if (
      lower.includes("gotong royong") ||
      lower.includes("damai") ||
      lower.includes("santunan") ||
      lower.includes("fakir") ||
      lower.includes("miskin") ||
      lower.includes("syukuran") ||
      lower.includes("sedekah") ||
      lower.includes("pesta")
    ) {
      if (kategori === "sosial") {
        kategori = "sosial";
        keadilan += 0.50;
        kesejahteraan += 0.40;
        biayaEmas = Math.max(biayaEmas, 20);
      }
    }

    return this.clampNumericVector(
      {
        keadilan,
        kesejahteraan,
        keamanan,
        lingkungan,
        pajakDelta,
        biayaEmas,
        kategori,
        valid: true
      },
      "DETERMINISTIC_FALLBACK"
    );
  }

  /**
   * Resolves a pre-defined policy card instantly in O(1).
   */
  public resolvePresetCard(cardId: string): DecreeSemanticVector {
    const card = POLICY_CARD_CATALOG[cardId];
    if (!card) {
      throw new Error(`UNKNOWN_POLICY_CARD: ${cardId}`);
    }
    return {
      keadilan: card.keadilan,
      kesejahteraan: card.kesejahteraan,
      keamanan: card.keamanan,
      lingkungan: card.lingkungan,
      pajakDelta: card.pajakDelta,
      biayaEmas: card.biayaEmas,
      kategori: card.kategori,
      valid: true,
      source: "DETERMINISTIC_FALLBACK",
      confidence: 1.0
    };
  }

  private async callLLMWithTimeout(text: string, timeoutMs: number): Promise<unknown> {
    if (!this.llmHttpClient) {
      throw new Error("NO_LLM_HTTP_CLIENT");
    }

    return new Promise((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          reject(new Error("LLM_TIMEOUT"));
        }
      }, timeoutMs);

      this.llmHttpClient!(text, timeoutMs)
        .then((res) => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            resolve(res);
          }
        })
        .catch((err) => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            reject(err);
          }
        });
    });
  }

  /**
   * Numerical Clamping strictly bounds all vector components to legal ranges.
   */
  public clampNumericVector(
    raw: unknown,
    source: DecreeSource
  ): DecreeSemanticVector {
    let parsedRaw = raw;
    if (typeof raw === "string") {
      try {
        parsedRaw = JSON.parse(raw.trim());
      } catch {
        parsedRaw = {};
      }
    }
    const r = (parsedRaw && typeof parsedRaw === "object" ? parsedRaw : {}) as Record<string, unknown>;

    // Handle nested 'efek' if LLM returned structured response
    const efek = (r.efek && typeof r.efek === "object" ? r.efek : r) as Record<string, unknown>;

    const keadilanRaw = efek.keadilan ?? r.keadilan ?? 0;
    const kesejahteraanRaw = efek.kesejahteraan ?? r.kesejahteraan ?? 0;
    const keamananRaw = efek.keamanan ?? r.keamanan ?? 0;
    const lingkunganRaw = efek.lingkungan ?? r.lingkungan ?? 0;
    const pajakDeltaRaw = efek.pajak_delta ?? efek.pajakDelta ?? r.pajakDelta ?? 0;
    const biayaEmasRaw = r.biaya_emas ?? r.biayaEmas ?? 0;
    const kategoriRaw = r.kategori ?? "sosial";
    const validRaw = r.valid ?? true;
    const confidenceRaw = r.confidence ?? (source === "LLM_PRIMARY" ? 0.95 : 1.0);

    const keadilan = Math.max(-1.0, Math.min(1.0, Number(keadilanRaw) || 0));
    const kesejahteraan = Math.max(-1.0, Math.min(1.0, Number(kesejahteraanRaw) || 0));
    const keamanan = Math.max(-1.0, Math.min(1.0, Number(keamananRaw) || 0));
    const lingkungan = Math.max(-1.0, Math.min(1.0, Number(lingkunganRaw) || 0));
    const pajakDelta = Math.max(-10, Math.min(10, Math.round(Number(pajakDeltaRaw) || 0)));
    const biayaEmas = Math.max(0, Math.min(100, Math.round(Number(biayaEmasRaw) || 0)));

    return {
      keadilan: Number(keadilan.toFixed(3)),
      kesejahteraan: Number(kesejahteraan.toFixed(3)),
      keamanan: Number(keamanan.toFixed(3)),
      lingkungan: Number(lingkungan.toFixed(3)),
      pajakDelta,
      biayaEmas,
      kategori: String(kategoriRaw),
      valid: Boolean(validRaw),
      source,
      confidence: Number(Number(confidenceRaw).toFixed(3))
    };
  }
}
