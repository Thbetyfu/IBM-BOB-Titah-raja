import React from "react";
import {
  Wheat,
  Coins,
  Shield,
  Heart,
  Sparkles,
  Skull,
  Scroll,
  Radio,
  Compass,
  Volume2,
  VolumeX,
  Clock,
  CircleDollarSign
} from "lucide-react";
import { useGameStore } from "../store/useGameStore";
import { audioEngine } from "../services/audioEngine";

export const HudBar: React.FC = () => {
  const {
    worldSeason,
    activePhase,
    secondsRemaining,
    bobCoins,
    kingdom,
    audioMuted,
    toggleAudioMuted,
    setDecreeModalOpen,
    setAllianceRadarOpen,
    setExpeditionModalOpen,
    allianceVerified
  } = useGameStore();

  const handleToggleAudio = () => {
    toggleAudioMuted();
    audioEngine.setMuted(!audioMuted);
    if (audioMuted) {
      audioEngine.playBonangChime(2);
    }
  };

  const getPhaseDisplay = (phase: string) => {
    switch (phase) {
      case "PHASE_1_DECREE":
        return "Fase 1: Musyawarah Titah";
      case "PHASE_2_ACTION":
        return "Fase 2: Aksi Warga & Kerja";
      case "PHASE_3_ECONOMY":
        return "Fase 3: Panen & Kas Wanua";
      case "PHASE_4_EVENT":
        return "Fase 4: Peristiwa & Bencana";
      case "PHASE_5_DYNASTY":
        return "Fase 5: Resolusi Dinasti";
      default:
        return phase;
    }
  };

  return (
    <header className="fixed top-2 left-2 right-2 z-30 flex flex-col md:flex-row items-center justify-between gap-2 p-2.5 rounded-2xl glass-panel-royal text-white text-xs select-none">
      {/* Realm & Season Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/90 via-amber-900/60 to-amber-950/80 border border-amber-400/50 shadow-[0_0_12px_rgba(212,175,55,0.2)]">
          <span className="font-serif font-black tracking-wider text-amber-300 text-sm">
            {kingdom.namaWanua}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30 font-semibold">
            Musim {worldSeason} / 20
          </span>
        </div>

        {/* Phase & 45s Countdown */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30">
          <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-emerald-300 font-medium hidden sm:inline">
            {getPhaseDisplay(activePhase)}
          </span>
          <span className="font-mono font-bold text-emerald-200 bg-emerald-900/60 px-1.5 py-0.5 rounded text-[11px]">
            {secondsRemaining}s
          </span>
        </div>
      </div>

      {/* Core Kingdom Resources */}
      <div className="flex items-center flex-wrap gap-2.5 sm:gap-4 px-3 py-1 rounded-xl bg-stone-900/70 border border-stone-700/50">
        {/* Pangan */}
        <div className="flex items-center gap-1.5" title={`Pangan: ${kingdom.pangan} gabah`}>
          <Wheat className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-stone-100">{kingdom.pangan}</span>
          <span className="text-stone-400 text-[10px]">Pangan</span>
        </div>

        {/* Emas */}
        <div className="flex items-center gap-1.5" title={`Kas Kerajaan: ${kingdom.emas} keping emas`}>
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-amber-200">{kingdom.emas}</span>
          <span className="text-stone-400 text-[10px]">Emas</span>
        </div>

        {/* Pasukan */}
        <div className="flex items-center gap-1.5" title={`Prajurit Tombak: ${kingdom.pasukan} prajurit`}>
          <Shield className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-blue-200">{kingdom.pasukan}</span>
          <span className="text-stone-400 text-[10px]">Pasukan</span>
        </div>

        {/* Kepuasan Rakyat */}
        <div className="flex items-center gap-1.5" title={`Kepuasan Rakyat: ${kingdom.kepuasan}%`}>
          <Heart className="w-4 h-4 text-rose-400" />
          <div className="w-12 bg-stone-800 rounded-full h-2 overflow-hidden border border-rose-900/40 hidden md:block">
            <div
              className={`h-full transition-all duration-300 ${
                kingdom.kepuasan > 60
                  ? "bg-rose-500"
                  : kingdom.kepuasan > 30
                  ? "bg-amber-500"
                  : "bg-red-600"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, kingdom.kepuasan))}%` }}
            />
          </div>
          <span className="font-bold text-rose-200">{kingdom.kepuasan}%</span>
        </div>

        {/* Harmoni Alam */}
        <div className="flex items-center gap-1.5" title={`Harmoni Lingkungan Sendang: ${kingdom.harmoni}%`}>
          <Sparkles className="w-4 h-4 text-teal-400" />
          <div className="w-12 bg-stone-800 rounded-full h-2 overflow-hidden border border-teal-900/40 hidden md:block">
            <div
              className={`h-full transition-all duration-300 ${
                kingdom.harmoni > 60
                  ? "bg-teal-400"
                  : kingdom.harmoni > 35
                  ? "bg-cyan-600"
                  : "bg-indigo-700"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, kingdom.harmoni))}%` }}
            />
          </div>
          <span className="font-bold text-teal-200">{kingdom.harmoni}%</span>
        </div>

        {/* Ancaman Bandit */}
        <div className="flex items-center gap-1.5" title={`Ancaman Bandit Rimba: ${kingdom.ancamanBandit}%`}>
          <Skull className="w-4 h-4 text-purple-400" />
          <span className="font-bold text-purple-200">{kingdom.ancamanBandit}%</span>
        </div>

        {/* Bob Coins */}
        <div className="flex items-center gap-1.5 pl-1 border-l border-stone-700" title="Bob Coins (Mata Uang Titah AI)">
          <CircleDollarSign className="w-4 h-4 text-yellow-300" />
          <span className="font-bold text-yellow-200">{bobCoins}</span>
        </div>
      </div>

      {/* Action Triggers & Audio Controls */}
      <div className="flex items-center gap-2">
        {/* Balairung Titah Button */}
        <button
          onClick={() => {
            audioEngine.playBonangChime(1);
            setDecreeModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 active:scale-95 text-white font-semibold shadow-md transition-all border border-amber-400/40"
        >
          <Scroll className="w-3.5 h-3.5" />
          <span>Balairung Titah</span>
        </button>

        {/* Radar Aliansi Button */}
        <button
          onClick={() => {
            audioEngine.playBonangChime(3);
            setAllianceRadarOpen(true);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold active:scale-95 transition-all border ${
            allianceVerified
              ? "bg-cyan-700/80 hover:bg-cyan-600 text-cyan-100 border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              : "bg-stone-800/80 hover:bg-stone-700 text-stone-200 border-stone-600/50"
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${allianceVerified ? "text-cyan-300 animate-spin" : "text-stone-400"}`} />
          <span className="hidden sm:inline">Radar Aliansi</span>
          {allianceVerified && <span className="text-[10px] text-cyan-200 font-bold">• Onsite</span>}
        </button>

        {/* Ekspedisi Button */}
        <button
          onClick={() => {
            audioEngine.playKendang("thung");
            setExpeditionModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 active:scale-95 text-stone-200 font-semibold transition-all border border-stone-600/50"
        >
          <Compass className="w-3.5 h-3.5 text-orange-400" />
          <span className="hidden sm:inline">Ekspedisi</span>
        </button>

        {/* Audio Toggle */}
        <button
          onClick={handleToggleAudio}
          className="p-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 transition-colors border border-stone-700"
          title={audioMuted ? "Bunyikan Gamelan" : "Bisukan Audio"}
        >
          {audioMuted ? <VolumeX className="w-4 h-4 text-stone-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
        </button>
      </div>
    </header>
  );
};
