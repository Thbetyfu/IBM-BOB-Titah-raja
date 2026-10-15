import React, { useState } from "react";
import {
  X,
  Compass,
  Swords,
  Shield,
  HeartHandshake,
  Flame
} from "lucide-react";
import { useGameStore } from "../store/useGameStore";
import { socketClient } from "../services/socketClient";
import { audioEngine } from "../services/audioEngine";

type DoctrineType = "PILLAGE" | "CONQUER_FORCED" | "CONQUER_EMBRACED";

export const ExpeditionModal: React.FC = () => {
  const {
    isExpeditionModalOpen,
    setExpeditionModalOpen,
    kingdom
  } = useGameStore();

  const [selectedDoctrine, setSelectedDoctrine] = useState<DoctrineType>("CONQUER_EMBRACED");
  const [pasukanDikirim, setPasukanDikirim] = useState<number>(Math.min(10, kingdom.pasukan));

  if (!isExpeditionModalOpen) return null;

  const handleLaunch = () => {
    if (kingdom.pasukan < pasukanDikirim || pasukanDikirim <= 0) return;

    socketClient.launchExpedition({
      doctrine: selectedDoctrine,
      pasukanDikirim
    });

    setExpeditionModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-2xl flex flex-col rounded-3xl bg-stone-950/95 border border-orange-500/40 shadow-[0_20px_60px_rgba(249,115,22,0.25)] overflow-hidden text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-orange-500/20 bg-gradient-to-r from-orange-950/50 via-stone-900 to-orange-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-300">
              <Compass className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-black text-orange-300 tracking-wide">
                Ekspedisi Perbatasan Wanua
              </h2>
              <p className="text-xs text-stone-400">
                Kerahkan pasukan tombak untuk menjangkau desa rimba NPC tak bertuan
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioEngine.playBonangChime(4);
              setExpeditionModalOpen(false);
            }}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors border border-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Target Info */}
          <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-orange-400 font-mono tracking-wider uppercase">Sasaran Ekspedisi</span>
              <h3 className="font-serif font-bold text-stone-200 text-sm">Desa Rimba Karang Watu</h3>
              <p className="text-xs text-stone-400">Pemukiman suku peladang di lereng bukit rimba timur.</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-400 block">Ketersediaan Pasukan:</span>
              <span className="font-mono font-bold text-blue-300 text-base">{kingdom.pasukan} Prajurit</span>
            </div>
          </div>

          {/* 3 Moral Doctrines */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-stone-300">Pilih Doktrin Moral Ekspedisi:</span>

            {/* Doktrin 1: Jarah (Pillage) */}
            <div
              onClick={() => {
                audioEngine.playKendang("tak");
                setSelectedDoctrine("PILLAGE");
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedDoctrine === "PILLAGE"
                  ? "bg-red-950/30 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                  : "bg-stone-900/50 border-stone-800 hover:border-stone-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-400" />
                  <span className="font-bold text-red-300 text-xs sm:text-sm">Jarah Total (Pillage)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-red-900/40 text-red-200 border border-red-700/50 font-mono">
                  Agresif & Kejam
                </span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Rampas seluruh cadangan gabah dan harta karun desa rimba. Memberikan pangan dan emas instan yang melimpah, namun merusak harmoni alam dan memprovokasi kemarahan bandit rimba.
              </p>
              <div className="flex items-center gap-3 pt-2 mt-2 border-t border-stone-800 text-[11px] font-mono">
                <span className="text-emerald-400 font-bold">+60 Pangan</span>
                <span className="text-amber-400 font-bold">+40 Emas</span>
                <span className="text-rose-400 font-bold">-10 Harmoni</span>
                <span className="text-stone-400">Korban: ~2 prajurit</span>
              </div>
            </div>

            {/* Doktrin 2: Kerja Paksa (Conquer Forced) */}
            <div
              onClick={() => {
                audioEngine.playKendang("thung");
                setSelectedDoctrine("CONQUER_FORCED");
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedDoctrine === "CONQUER_FORCED"
                  ? "bg-amber-950/30 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                  : "bg-stone-900/50 border-stone-800 hover:border-stone-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-amber-300 text-xs sm:text-sm">Tundukkan & Kerja Paksa (Conquer Forced)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900/40 text-amber-200 border border-amber-700/50 font-mono">
                  Militeristik
                </span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Taklukkan suku rimba dan paksa mereka mencangkul tanah perbatasan demi memasok lumbung Wanua. Membutuhkan pengawasan ketat pos ronda agar buruh tidak melarikan diri.
              </p>
              <div className="flex items-center gap-3 pt-2 mt-2 border-t border-stone-800 text-[11px] font-mono">
                <span className="text-emerald-400 font-bold">+40 Pangan</span>
                <span className="text-stone-400 font-bold">+0 Emas</span>
                <span className="text-amber-400 font-bold">-5 Harmoni</span>
                <span className="text-stone-400">Korban: ~1 prajurit</span>
              </div>
            </div>

            {/* Doktrin 3: Rangkul & Asimilasi Adat (Conquer Embraced) */}
            <div
              onClick={() => {
                audioEngine.playBonangChime(2);
                setSelectedDoctrine("CONQUER_EMBRACED");
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedDoctrine === "CONQUER_EMBRACED"
                  ? "bg-teal-950/30 border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.2)]"
                  : "bg-stone-900/50 border-stone-800 hover:border-stone-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-teal-400" />
                  <span className="font-bold text-teal-300 text-xs sm:text-sm">Rangkul & Asimilasi Adat (Conquer Embraced)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-900/40 text-teal-200 border border-teal-700/50 font-mono">
                  Diplomasi Luhur
                </span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Bawa bibit padi unggul dan persembahan emas bagi sesepuh rimba. Wanua mendapatkan persaudaraan sejati, upeti sukarela berkala, dan berkah harmoni lingkungan yang melimpah tanpa meneteskan darah.
              </p>
              <div className="flex items-center gap-3 pt-2 mt-2 border-t border-stone-800 text-[11px] font-mono">
                <span className="text-emerald-400 font-bold">+20 Pangan</span>
                <span className="text-rose-400 font-bold">-30 Emas</span>
                <span className="text-teal-300 font-bold">+10 Harmoni</span>
                <span className="text-emerald-400">Korban: 0 prajurit</span>
              </div>
            </div>
          </div>

          {/* Troop Dispatch Slider */}
          <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                Jumlah Prajurit Dikirim:
              </span>
              <span className="font-mono font-bold text-amber-300 text-sm">
                {pasukanDikirim} Prajurit
              </span>
            </div>

            <input
              type="range"
              min={1}
              max={Math.max(1, kingdom.pasukan)}
              value={pasukanDikirim}
              onChange={(e) => setPasukanDikirim(Number(e.target.value))}
              className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          {/* Dispatch Button */}
          <button
            disabled={kingdom.pasukan < pasukanDikirim || pasukanDikirim <= 0}
            onClick={handleLaunch}
            className={`w-full py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              kingdom.pasukan >= pasukanDikirim && pasukanDikirim > 0
                ? "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white shadow-lg active:scale-98"
                : "bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-800"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Berangkatkan Ekspedisi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
