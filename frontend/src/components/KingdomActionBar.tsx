import React, { useState } from "react";
import {
  Castle,
  Warehouse,
  ShieldAlert,
  UtensilsCrossed,
  Sprout,
  Scroll,
  Radio,
  Compass,
  Info
} from "lucide-react";
import { useGameStore } from "../store/useGameStore";
import { audioEngine } from "../services/audioEngine";

export const KingdomActionBar: React.FC = () => {
  const {
    kingdom,
    upgradeBuilding,
    hostVillageFeast,
    expandSubakFields,
    setDecreeModalOpen,
    setAllianceRadarOpen,
    setExpeditionModalOpen,
    audioMuted
  } = useGameStore();

  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => {
      setFeedbackNotice(null);
    }, 2800);
  };

  const handleUpgrade = (type: "balai" | "lumbung" | "pos_ronda") => {
    const res = upgradeBuilding(type);
    showToast(res.message);
    if (res.success && !audioMuted) {
      if (type === "balai") audioEngine.playGongAgeng(0);
      else if (type === "lumbung") audioEngine.playHarvestChime();
      else audioEngine.playKentongan();
    }
  };

  const handleFeast = () => {
    const res = hostVillageFeast();
    showToast(res.message);
    if (res.success && !audioMuted) {
      audioEngine.playGongAgeng(2);
    }
  };

  const handleExpandFields = () => {
    const res = expandSubakFields();
    showToast(res.message);
    if (res.success && !audioMuted) {
      audioEngine.playHarvestChime();
    }
  };

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 select-none">
      {/* Dynamic Action Feedback Toast */}
      {feedbackNotice && (
        <div className="animate-bounce px-4 py-1.5 rounded-full bg-stone-900/95 border border-amber-400 text-amber-200 text-xs font-bold shadow-xl flex items-center gap-2 backdrop-blur-md">
          <Info className="w-3.5 h-3.5 text-amber-300" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Main Tactical Action Dock */}
      <div className="flex items-center flex-wrap justify-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-stone-950/90 border border-amber-500/40 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        {/* Upgrade Balai Wanua */}
        <button
          onClick={() => handleUpgrade("balai")}
          disabled={kingdom.balaiWanuaLv >= 3}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-xs font-semibold ${
            kingdom.balaiWanuaLv >= 3
              ? "opacity-40 bg-stone-900 border-stone-800 text-stone-500 cursor-not-allowed"
              : "bg-amber-950/60 hover:bg-amber-900/80 active:scale-95 border-amber-500/40 text-amber-200 hover:text-amber-100 shadow-sm"
          }`}
          title="Tingkatkan Keraton Wanua (Biaya: 60 Emas, 30 Pangan)"
        >
          <Castle className="w-3.5 h-3.5 text-amber-400" />
          <div className="text-left">
            <div className="leading-none text-[11px]">Keraton Lv {kingdom.balaiWanuaLv}</div>
            <div className="text-[9px] text-amber-300/70 font-normal">
              {kingdom.balaiWanuaLv >= 3 ? "Maksimum" : "Up: 60🪙 30🌾"}
            </div>
          </div>
        </button>

        {/* Upgrade Lumbung Desa */}
        <button
          onClick={() => handleUpgrade("lumbung")}
          disabled={kingdom.lumbungLv >= 3}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-xs font-semibold ${
            kingdom.lumbungLv >= 3
              ? "opacity-40 bg-stone-900 border-stone-800 text-stone-500 cursor-not-allowed"
              : "bg-emerald-950/60 hover:bg-emerald-900/80 active:scale-95 border-emerald-500/40 text-emerald-200 hover:text-emerald-100 shadow-sm"
          }`}
          title="Tingkatkan Lumbung Desa (Biaya: 45 Emas, 20 Pangan)"
        >
          <Warehouse className="w-3.5 h-3.5 text-emerald-400" />
          <div className="text-left">
            <div className="leading-none text-[11px]">Lumbung Lv {kingdom.lumbungLv}</div>
            <div className="text-[9px] text-emerald-300/70 font-normal">
              {kingdom.lumbungLv >= 3 ? "Maksimum" : "Up: 45🪙 20🌾"}
            </div>
          </div>
        </button>

        {/* Upgrade Pos Ronda */}
        <button
          onClick={() => handleUpgrade("pos_ronda")}
          disabled={kingdom.posRondaLv >= 3}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-xs font-semibold ${
            kingdom.posRondaLv >= 3
              ? "opacity-40 bg-stone-900 border-stone-800 text-stone-500 cursor-not-allowed"
              : "bg-purple-950/60 hover:bg-purple-900/80 active:scale-95 border-purple-500/40 text-purple-200 hover:text-purple-100 shadow-sm"
          }`}
          title="Perkokoh Pos Ronda (Biaya: 40 Emas, 15 Pangan)"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
          <div className="text-left">
            <div className="leading-none text-[11px]">Pos Ronda Lv {kingdom.posRondaLv}</div>
            <div className="text-[9px] text-purple-300/70 font-normal">
              {kingdom.posRondaLv >= 3 ? "Maksimum" : "Up: 40🪙 15🌾"}
            </div>
          </div>
        </button>

        <div className="w-[1px] h-6 bg-stone-800 mx-0.5 hidden sm:block" />

        {/* Kenduri Sedekah Bumi */}
        <button
          onClick={handleFeast}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 active:scale-95 border border-rose-500/40 text-rose-200 hover:text-rose-100 transition-all text-xs font-semibold shadow-sm"
          title="Gelar Kenduri Sedekah Bumi (Biaya: 35 Pangan | +25% Kepuasan Rakyat)"
        >
          <UtensilsCrossed className="w-3.5 h-3.5 text-rose-400" />
          <div className="text-left">
            <div className="leading-none text-[11px]">Kenduri Bumi</div>
            <div className="text-[9px] text-rose-300/70 font-normal">35🌾 (+25% ❤️)</div>
          </div>
        </button>

        {/* Buka Sawah Terasering Baru */}
        <button
          onClick={handleExpandFields}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-teal-950/60 hover:bg-teal-900/80 active:scale-95 border border-teal-500/40 text-teal-200 hover:text-teal-100 transition-all text-xs font-semibold shadow-sm"
          title="Buka Sawah Subak Baru (Biaya: 30 Emas | +50 Pangan & +15% Harmoni)"
        >
          <Sprout className="w-3.5 h-3.5 text-teal-400" />
          <div className="text-left">
            <div className="leading-none text-[11px]">Buka Subak</div>
            <div className="text-[9px] text-teal-300/70 font-normal">30🪙 (+50🌾)</div>
          </div>
        </button>

        <div className="w-[1px] h-6 bg-stone-800 mx-0.5 hidden sm:block" />

        {/* Balairung Titah Adat */}
        <button
          onClick={() => setDecreeModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600/90 to-amber-700/90 hover:from-amber-500 hover:to-amber-600 active:scale-95 text-stone-950 font-bold text-xs shadow-md transition-all"
          title="Buka Balairung Titah Lengkap (Kartu Kebijakan & NLP)"
        >
          <Scroll className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Balairung Titah</span>
        </button>

        {/* Radar Aliansi */}
        <button
          onClick={() => setAllianceRadarOpen(true)}
          className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-95 border border-stone-700 text-stone-300 hover:text-cyan-300 transition-all"
          title="Buka Radar Aliansi Onsite GPS"
        >
          <Radio className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Ekspedisi Rimba */}
        <button
          onClick={() => setExpeditionModalOpen(true)}
          className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-95 border border-stone-700 text-stone-300 hover:text-amber-300 transition-all"
          title="Buka Pengerahan Ekspedisi Rimba"
        >
          <Compass className="w-4 h-4 text-amber-400" />
        </button>
      </div>
    </div>
  );
};
