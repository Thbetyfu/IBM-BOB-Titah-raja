import React from "react";
import { Skull, RotateCcw, Award } from "lucide-react";
import { useGameStore } from "../store/useGameStore";
import { audioEngine } from "../services/audioEngine";

export const CoupOverlay: React.FC = () => {
  const {
    isCoupOverlayVisible,
    kingdom,
    legacy,
    worldSeason,
    restartGame
  } = useGameStore();

  if (!isCoupOverlayVisible && !kingdom.isFallen) return null;

  const handleRestart = () => {
    audioEngine.playGongAgeng(0, 4.0);
    audioEngine.playBonangChime(0);
    restartGame();
  };

  const getCauseTitle = () => {
    switch (kingdom.causeOfFall) {
      case "COUP_DETAT":
        return "Kudeta Rakyat & Pemberontakan Massal";
      case "STARVATION":
        return "Bencana Paceklik & Kelaparan";
      case "BANDIT_DESTRUCTION":
        return "Invasi Gerombolan Si Garang";
      default:
        return "Runtuhnya Takhta Wanua";
    }
  };

  const getCauseDescription = () => {
    switch (kingdom.causeOfFall) {
      case "COUP_DETAT":
        return "Amarah kawula alit yang tertindas telah memuncak. Obor pemberontakan melalap balai ageng dan takhta paduka digulingkan oleh amuk massa.";
      case "STARVATION":
        return "Lumbung telah kosong melompong selama tiga musim berturut-turut. Rakyat meregang nyawa dan wanua tenggelam dalam kesunyian kuburan massal.";
      case "BANDIT_DESTRUCTION":
        return "Pertahanan perbatasan bobol. Gerombolan bandit Si Garang merangsek masuk membakar lumbung dan menjarah seluruh isi perbendaharaan keraton.";
      default:
        return "Masa kejayaan wanua telah usai. Prasasti batu menjadi satu-satunya saksi bisu pernah berdirinya dinasti ini.";
    }
  };

  const legacyScore =
    legacy?.legacyScore ??
    worldSeason * 100 + Math.round(kingdom.kepuasan * 10) + kingdom.emas * 2;
  const karmaPoints = legacy?.karmaPoints ?? Math.floor(legacyScore / 500);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fadeIn select-none">
      <div className="relative w-full max-w-lg flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl bg-stone-950/95 border border-red-600/40 shadow-[0_20px_70px_rgba(220,38,38,0.35)] text-stone-100 space-y-5">
        {/* Doom Skull Icon */}
        <div className="w-16 h-16 rounded-full bg-red-950/80 border-2 border-red-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.6)]">
          <Skull className="w-8 h-8 text-red-500 animate-pulse" />
        </div>

        {/* Cause of Fall */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono tracking-widest uppercase text-red-400">
            DINASTI TELAH TUMBANG
          </span>
          <h2 className="font-serif text-2xl font-black text-red-200">
            {getCauseTitle()}
          </h2>
          <p className="text-xs text-stone-400 max-w-md leading-relaxed">
            {getCauseDescription()}
          </p>
        </div>

        {/* Legacy Breakdown Box */}
        <div className="w-full p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-3 text-xs">
          <div className="flex items-center justify-center gap-1.5 text-amber-300 font-bold border-b border-stone-800 pb-2">
            <Award className="w-4 h-4" />
            <span>Skor Warisan Leluhur & Poin Karma Dinasti</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-stone-300 font-mono text-left">
            <div className="p-2 rounded-xl bg-stone-950/50">
              <span className="text-[10px] text-stone-500 block">Musim Bertahan:</span>
              <span className="font-bold text-stone-100">{worldSeason} Musim</span>
            </div>

            <div className="p-2 rounded-xl bg-stone-950/50">
              <span className="text-[10px] text-stone-500 block">Kepuasan Terakhir:</span>
              <span className="font-bold text-rose-300">{kingdom.kepuasan}%</span>
            </div>

            <div className="p-2 rounded-xl bg-stone-950/50">
              <span className="text-[10px] text-stone-500 block">Sisa Kas Emas:</span>
              <span className="font-bold text-amber-300">{kingdom.emas} Emas</span>
            </div>

            <div className="p-2 rounded-xl bg-stone-950/50">
              <span className="text-[10px] text-stone-500 block">Poin Karma Warisan:</span>
              <span className="font-bold text-emerald-300">+{karmaPoints} Karma</span>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
            <span className="text-stone-400">Total Skor Warisan:</span>
            <span className="font-serif font-black text-amber-400 text-lg">
              {legacyScore.toLocaleString()} Poin
            </span>
          </div>
        </div>

        {/* Rebirth Button */}
        <button
          onClick={handleRestart}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-700 active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-950 transition-all border border-amber-400/40"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Bangkitkan Dinasti Baru (Reinkarnasi Wanua)</span>
        </button>
      </div>
    </div>
  );
};
