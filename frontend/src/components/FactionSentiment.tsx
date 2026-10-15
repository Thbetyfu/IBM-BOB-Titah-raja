import React, { useState } from "react";
import { ChevronDown, ChevronUp, Users, Droplets, Swords, MessageSquare } from "lucide-react";
import { useGameStore } from "../store/useGameStore";

export const FactionSentiment: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { factions } = useGameStore();

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "PUAS":
      case "HARMONIS":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "CEMAS":
      case "TERANCAM":
      case "WASPADA":
      case "MENGINTAI":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "MARAH":
      case "MURKA":
      case "AGRESIF":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      default:
        return "bg-stone-500/20 text-stone-300 border-stone-500/40";
    }
  };

  return (
    <aside className="fixed bottom-3 left-3 z-20 w-80 max-w-[calc(100vw-24px)] select-none">
      <div className="rounded-2xl glass-panel-royal shadow-[0_12px_36px_rgba(0,0,0,0.7)] overflow-hidden transition-all duration-300">
        {/* Header Toggle */}
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-stone-900 via-stone-900/90 to-stone-950 border-b border-stone-800 cursor-pointer hover:bg-stone-850"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span className="font-serif font-bold text-amber-200 text-xs tracking-wide">
              Suara Tiga Faksi Wanua
            </span>
          </div>
          <button className="text-stone-400 hover:text-stone-200 p-0.5">
            {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Content Body */}
        {!isCollapsed && (
          <div className="p-3 space-y-2.5 max-h-[360px] overflow-y-auto">
            {/* Ki Wiro (Petani & Buruh) */}
            <div className="p-2.5 rounded-xl bg-stone-900/60 border border-emerald-900/30 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-950 flex items-center justify-center border border-emerald-500/30">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-emerald-300 leading-none">Ki Wiro</h4>
                    <span className="text-[9px] text-stone-400">Wakil Petani & Buruh</span>
                  </div>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold ${getMoodColor(factions.kiWiro.mood)}`}>
                  {factions.kiWiro.mood}
                </span>
              </div>
              <p className="text-[10px] text-stone-300 italic pl-1 border-l-2 border-emerald-600/40 leading-relaxed">
                "{factions.kiWiro.text}"
              </p>
            </div>

            {/* Nyai Sendang (Sesepuh Tirta) */}
            <div className="p-2.5 rounded-xl bg-stone-900/60 border border-teal-900/30 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-teal-950 flex items-center justify-center border border-teal-500/30">
                    <Droplets className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-teal-300 leading-none">Nyai Sendang</h4>
                    <span className="text-[9px] text-stone-400">Sesepuh Adat & Mata Air</span>
                  </div>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold ${getMoodColor(factions.nyaiSendang.mood)}`}>
                  {factions.nyaiSendang.mood}
                </span>
              </div>
              <p className="text-[10px] text-stone-300 italic pl-1 border-l-2 border-teal-600/40 leading-relaxed">
                "{factions.nyaiSendang.text}"
              </p>
            </div>

            {/* Si Garang (Gerombolan Rimba) */}
            <div className="p-2.5 rounded-xl bg-stone-900/60 border border-purple-900/30 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-purple-950 flex items-center justify-center border border-purple-500/30">
                    <Swords className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-purple-300 leading-none">Si Garang</h4>
                    <span className="text-[9px] text-stone-400">Gerombolan Bandit Rimba</span>
                  </div>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold ${getMoodColor(factions.siGarang.mood)}`}>
                  {factions.siGarang.mood}
                </span>
              </div>
              <p className="text-[10px] text-stone-300 italic pl-1 border-l-2 border-purple-600/40 leading-relaxed">
                "{factions.siGarang.text}"
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
