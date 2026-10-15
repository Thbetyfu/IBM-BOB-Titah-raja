/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Nusantara Gamelan Procedural Web Audio Engine (SDD Bab 5.4)
 *
 * Implements:
 * 1. Pentatonic Slendro and Pelog procedural synthesizers using Web Audio API.
 * 2. Deep resonant Gong Ageng with long ADSR envelope decay.
 * 3. Kendang Jawa percussion engine (Dhang pitch-drop, Thung resonance, Tak snap).
 * 4. Ambient procedural soundscapes (Sendang river, torrential rain, calamity rumble).
 * 5. 100% Procedural synthesis: zero external audio assets, keeping bundle size well under 800 KB.
 */

export class NusantaraAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  // Frekuensi Nada Pentatonik Slendro (Hz): 1 (Panunggul), 2 (Gulu), 3 (Dada), 5 (Lima), 6 (Nem)
  private readonly SLENDRO_FREQS = [261.63, 294.33, 327.03, 392.44, 436.05];

  // Frekuensi Nada Pentatonik Pelog (Hz): 1 (Panunggul), 2 (Gulu), 3 (Dada), 4 (Pelog), 5 (Lima), 6 (Nem), 7 (Barang)
  private readonly PELOG_FREQS = [277.18, 293.66, 329.63, 369.99, 415.30, 440.00, 493.88];

  private initContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  /**
   * Resonant Gong Ageng tone with subtle octave harmonics
   */
  public playGongAgeng(freqIndex: number = 0, durationSec: number = 3.5): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const baseFreq = this.SLENDRO_FREQS[freqIndex % this.SLENDRO_FREQS.length] * 0.5; // Deep octave

    // Fundamental oscillator (warm sine)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(baseFreq, now);

    // Harmonic overtone oscillator (bronze shimmer)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(baseFreq * 2.01, now); // slight detune for bronze beating

    // Envelopes: Fast attack, long lingering resonance
    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.linearRampToValueAtTime(0.7, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    gain2.gain.setValueAtTime(0.0001, now);
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + durationSec * 0.7);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + durationSec);
    osc2.stop(now + durationSec);
  }

  /**
   * Saron / Bonang metallic chime for UI and policy selection
   */
  public playBonangChime(noteIndex: number = 0): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freq = this.PELOG_FREQS[noteIndex % this.PELOG_FREQS.length];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.2);
  }

  /**
   * Kendang Jawa rhythmic hits (Dhang, Thung, Tak)
   */
  public playKendang(tone: "dhang" | "thung" | "tak" = "dhang"): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (tone === "dhang") {
      // Low membrane pitch drop: 110Hz -> 55Hz
      osc.type = "sine";
      osc.frequency.setValueAtTime(110.0, now);
      osc.frequency.exponentialRampToValueAtTime(55.0, now + 0.16);
      gain.gain.setValueAtTime(0.85, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.40);
    } else if (tone === "thung") {
      // Mid resonant rim tone: 165Hz -> 120Hz
      osc.type = "sine";
      osc.frequency.setValueAtTime(165.0, now);
      osc.frequency.exponentialRampToValueAtTime(120.0, now + 0.12);
      gain.gain.setValueAtTime(0.65, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.30);
    } else {
      // High crisp slap "tak" snap
      osc.type = "triangle";
      osc.frequency.setValueAtTime(360.0, now);
      osc.frequency.exponentialRampToValueAtTime(180.0, now + 0.05);
      gain.gain.setValueAtTime(0.55, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.10);
    }
  }

  /**
   * Calamity rumble for boss roar or flash flood
   */
  public playCalamityRumble(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 2.0);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(160, now);
    filter.frequency.linearRampToValueAtTime(60, now + 2.0);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.6, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 2.0);
  }

  /**
   * Ambient soundscape synthesis (rain or sendang spring)
   */
  public playRainAmbience(durationSec: number = 3.0): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * durationSec);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.12;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(650, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + durationSec);
  }

  /**
   * Traditional carved wooden slit drum (Kentongan) rhythmic strikes
   */
  public playKentongan(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const strikes = [0.0, 0.12, 0.22, 0.30];
    const freqs = [640, 680, 710, 750];

    strikes.forEach((delay, idx) => {
      const strikeTime = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freqs[idx], strikeTime);
      osc.frequency.exponentialRampToValueAtTime(freqs[idx] * 0.72, strikeTime + 0.08);

      gain.gain.setValueAtTime(0.001, strikeTime);
      gain.gain.linearRampToValueAtTime(0.45, strikeTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(strikeTime);
      osc.stop(strikeTime + 0.10);
    });
  }

  /**
   * Bright, cheerful harvest chime (Panunggul -> Gulu -> Dada)
   */
  public playHarvestChime(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [327.03, 392.44, 523.25]; // Dada, Lima, Panunggul tinggi
    notes.forEach((freq, idx) => {
      const strikeTime = ctx.currentTime + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, strikeTime);

      gain.gain.setValueAtTime(0.001, strikeTime);
      gain.gain.linearRampToValueAtTime(0.35, strikeTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(strikeTime);
      osc.stop(strikeTime + 0.60);
    });
  }

  /**
   * Cute bubbly squash-and-stretch pop sound for character/building clicks
   */
  public playCutePop(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.07);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.30, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.10);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  }
}

export const audioEngine = new NusantaraAudioEngine();
