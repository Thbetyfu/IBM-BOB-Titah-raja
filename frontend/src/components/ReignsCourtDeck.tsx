import React, { useState, useEffect } from "react";
import {
  Crown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Wheat,
  Coins,
  Shield,
  Heart,
  EyeOff,
  Award
} from "lucide-react";
import { useGameStore } from "../store/useGameStore";
import { REIGNS_DILEMMAS } from "../data/reignsDilemmas";
import { audioEngine } from "../services/audioEngine";

export const ReignsCourtDeck: React.FC = () => {
  const {
    currentDilemmaIndex,
    isDilemmaCardVisible,
    setDilemmaCardVisible,
    resolveCurrentDilemma,
    dilemmaNotification,
    audioMuted
  } = useGameStore();

  const [hoveredChoice, setHoveredChoice] = useState<"A" | "B" | null>(null);
  const [animatingCard, setAnimatingCard] = useState<boolean>(false);

  const dilemma = REIGNS_DILEMMAS[currentDilemmaIndex % REIGNS_DILEMMAS.length];

  // Hotkey support: ArrowLeft / 'A' for Option A, ArrowRight / 'D' for Option B
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDilemmaCardVisible || animatingCard) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        handleChoose("A");
      } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        handleChoose("B");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDilemmaCardVisible, animatingCard, currentDilemmaIndex]);

  if (!dilemma) return null;

  const handleChoose = (choice: "A" | "B") => {
    if (animatingCard) return;
    setAnimatingCard(true);

    if (!audioMuted) {
      if (choice === "A") {
        audioEngine.playBonangChime(2);
      } else {
        audioEngine.playGongAgeng(1);
      }
    }

    setTimeout(() => {
      resolveCurrentDilemma(choice);
      setHoveredChoice(null);
      setAnimatingCard(false);
    }, 240);
  };

  const renderImpactBadges = (choice: "A" | "B") => {
    const opt = choice === "A" ? dilemma.optionA : dilemma.optionB;
    const eff = opt.effects;

    return (
      <div className="flex items-center flex-wrap gap-1.5 mt-2 justify-center">
        {eff.pangan !== undefined && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
              eff.pangan > 0
                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                : "bg-rose-950/80 text-rose-300 border-rose-500/40"
            }`}
          >
            <Wheat className="w-3 h-3" />
            {eff.pangan > 0 ? `+${eff.pangan}` : eff.pangan} Pangan
          </span>
        )}
        {eff.emas !== undefined && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
              eff.emas > 0
                ? "bg-amber-950/80 text-amber-300 border-amber-500/40"
                : "bg-rose-950/80 text-rose-300 border-rose-500/40"
            }`}
          >
            <Coins className="w-3 h-3" />
            {eff.emas > 0 ? `+${eff.emas}` : eff.emas} Emas
          </span>
        )}
        {eff.pasukan !== undefined && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
              eff.pasukan > 0
                ? "bg-blue-950/80 text-blue-300 border-blue-500/40"
                : "bg-rose-950/80 text-rose-300 border-rose-500/40"
            }`}
          >
            <Shield className="w-3 h-3" />
            {eff.pasukan > 0 ? `+${eff.pasukan}` : eff.pasukan} Pasukan
          </span>
        )}
        {eff.kepuasan !== undefined && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
              eff.kepuasan > 0
                ? "bg-pink-950/80 text-pink-300 border-pink-500/40"
                : "bg-rose-950/80 text-rose-300 border-rose-500/40"
            }`}
          >
            <Heart className="w-3 h-3" />
            {eff.kepuasan > 0 ? `+${eff.kepuasan}` : eff.kepuasan}% Rakyat
          </span>
        )}
        {eff.harmoni !== undefined && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
              eff.harmoni > 0
                ? "bg-teal-950/80 text-teal-300 border-teal-500/40"
                : "bg-rose-950/80 text-rose-300 border-rose-500/40"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            {eff.harmoni > 0 ? `+${eff.harmoni}` : eff.harmoni}% Alam
          </span>
        )}
        {eff.ancamanBandit !== undefined && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
              eff.ancamanBandit < 0
                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                : "bg-purple-950/80 text-purple-300 border-purple-500/40"
            }`}
          >
            <Shield className="w-3 h-3" />
            {eff.ancamanBandit > 0 ? `+${eff.ancamanBandit}` : eff.ancamanBandit}% Bandit
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Toast Notification for Dilemma Results */}
      {dilemmaNotification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-bounce">
          <div className="px-4 py-1.5 rounded-full bg-amber-950/90 border border-amber-400 text-amber-200 text-xs font-bold shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-300" />
            <span>{dilemmaNotification}</span>
          </div>
        </div>
      )}

      {/* Floating Minimize / Expand Pill Toggle */}
      <div className="fixed top-16 right-4 z-30">
        <button
          onClick={() => setDilemmaCardVisible(!isDilemmaCardVisible)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-amber-300 hover:text-amber-200 border border-amber-500/40 shadow-lg text-xs font-semibold backdrop-blur-md transition-all active:scale-95"
          title={isDilemmaCardVisible ? "Sembunyikan Balai Sidang" : "Buka Balai Sidang Titah"}
        >
          {isDilemmaCardVisible ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Sembunyikan Sidang</span>
            </>
          ) : (
            <>
              <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="font-bold">Buka Sidang Titah (Petisi Baru)</span>
            </>
          )}
        </button>
      </div>

      {/* The Reigns Royal Court Dilemma Card */}
      {isDilemmaCardVisible && (
        <div
          className={`fixed top-16 md:top-20 left-1/2 -translate-x-1/2 z-30 w-[92vw] max-w-md transition-all duration-300 ${
            animatingCard ? "opacity-0 scale-95 translate-y-3" : "opacity-100 scale-100 translate-y-0"
          }`}
        >
          <div className="relative rounded-3xl bg-gradient-to-b from-stone-900/95 via-stone-950/95 to-black/95 border-2 border-amber-500/50 shadow-[0_16px_48px_rgba(0,0,0,0.85)] p-4 sm:p-5 text-stone-100 backdrop-blur-xl">
            {/* Top Ornamental Header */}
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center border font-serif font-black text-lg shadow-inner ${dilemma.character.badgeBg}`}
                  style={{ color: dilemma.character.colorHex }}
                >
                  {dilemma.character.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-sm sm:text-base text-amber-200 leading-tight">
                      {dilemma.character.name}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300/80 border border-amber-500/20 font-medium">
                      {dilemma.character.tag}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400">{dilemma.character.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400/80 bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-500/20">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Petisi #{currentDilemmaIndex + 1}</span>
              </div>
            </div>

            {/* Narrative Situation */}
            <div className="my-4 p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800/80 shadow-inner">
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-sans font-normal italic">
                "{dilemma.situation}"
              </p>
            </div>

            {/* Interactive Decision Choices (Kiri / Kanan) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* Pilihan A (Kiri) */}
              <button
                onClick={() => handleChoose("A")}
                onMouseEnter={() => setHoveredChoice("A")}
                onMouseLeave={() => setHoveredChoice(null)}
                className="group relative flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-stone-900 to-stone-950 hover:from-amber-950/80 hover:to-amber-900/60 border border-stone-700 hover:border-amber-400/80 transition-all duration-200 active:scale-95 shadow-md text-center"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 group-hover:text-amber-200">
                  <ChevronLeft className="w-3.5 h-3.5 text-amber-400 group-hover:-translate-x-1 transition-transform" />
                  <span>{dilemma.optionA.label}</span>
                </div>
                <p className="text-[10px] text-stone-400 group-hover:text-stone-200 mt-1 line-clamp-2">
                  {dilemma.optionA.subtext}
                </p>
                <div className="mt-1 hidden sm:block">
                  <span className="text-[9px] font-mono text-stone-500 group-hover:text-amber-300/70">
                    [Tekan A / ←]
                  </span>
                </div>
              </button>

              {/* Pilihan B (Kanan) */}
              <button
                onClick={() => handleChoose("B")}
                onMouseEnter={() => setHoveredChoice("B")}
                onMouseLeave={() => setHoveredChoice(null)}
                className="group relative flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-stone-900 to-stone-950 hover:from-stone-850 hover:to-stone-800 border border-stone-700 hover:border-stone-400/80 transition-all duration-200 active:scale-95 shadow-md text-center"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-stone-200 group-hover:text-white">
                  <span>{dilemma.optionB.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[10px] text-stone-400 group-hover:text-stone-200 mt-1 line-clamp-2">
                  {dilemma.optionB.subtext}
                </p>
                <div className="mt-1 hidden sm:block">
                  <span className="text-[9px] font-mono text-stone-500 group-hover:text-stone-300/70">
                    [Tekan D / →]
                  </span>
                </div>
              </button>
            </div>

            {/* Impact Badges Preview on Hover */}
            {hoveredChoice && (
              <div className="mt-3 pt-2.5 border-t border-stone-800/80 animate-fadeIn">
                <div className="text-[10px] text-stone-400 text-center font-medium">
                  Prakiraan Dampak Keputusan:
                </div>
                {renderImpactBadges(hoveredChoice)}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
