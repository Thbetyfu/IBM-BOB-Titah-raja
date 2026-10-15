import React from "react";
import { Swords, ShieldAlert, Sparkles, Trophy } from "lucide-react";
import { useGameStore } from "../store/useGameStore";
import { audioEngine } from "../services/audioEngine";

export const BossHpOverlay: React.FC = () => {
  const {
    worldSeason,
    boss,
    kingdom,
    allianceVerified,
    triggerBossDamage
  } = useGameStore();

  const isBossActive = (worldSeason >= 20 || boss.isSpawned) && !boss.isDefeated;
  const isBossDefeated = boss.isDefeated;
  const isPeaceScenario = kingdom.harmoni >= 50;

  if (!isBossActive && !isBossDefeated && worldSeason < 20) return null;

  const handleAttackBoss = () => {
    if (boss.hp <= 0) return;

    audioEngine.playCalamityRumble();
    audioEngine.playKendang("dhang");

    // Attack calculation: Base damage from troops + 50% alliance bonus
    const baseDamage = Math.max(15, Math.round(kingdom.pasukan * 2.2));
    const allianceMultiplier = allianceVerified ? 1.5 : 1.0;
    const finalDamage = Math.round(baseDamage * allianceMultiplier);

    triggerBossDamage(finalDamage);
  };

  const hpPercent = Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100));

  return (
    <div className="fixed top-18 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4 select-none animate-fadeIn">
      <div className="p-3.5 sm:p-4 rounded-2xl glass-panel-danger shadow-[0_12px_40px_rgba(239,68,68,0.4)] text-stone-100 space-y-2.5">
        {/* Boss Title & Status Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
            <div>
              <h3 className="font-serif font-black text-sm sm:text-base text-red-300 tracking-wide uppercase">
                {boss.name}
              </h3>
              <span className="text-[10px] text-stone-400">
                Puncak Bencana Musim 20 • Penentu Nasib Akhir Dinasti
              </span>
            </div>
          </div>

          <span
            className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
              isBossDefeated
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : isPeaceScenario
                ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                : "bg-red-500/20 text-red-300 border-red-500/40"
            }`}
          >
            {isBossDefeated
              ? "NAGA DITAKLUKKAN"
              : isPeaceScenario
              ? "SKENARIO DAMAI (HARMONI ≥ 50)"
              : "SKENARIO MURKA (HARMONI < 50)"}
          </span>
        </div>

        {/* Boss HP Bar */}
        {!isBossDefeated && !isPeaceScenario && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono font-bold">
              <span className="text-red-400">Darah Naga:</span>
              <span className="text-stone-200">
                {boss.hp} / {boss.maxHp} HP ({Math.round(hpPercent)}%)
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-stone-900 border border-red-950 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-700 via-rose-500 to-amber-500 transition-all duration-300 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Scenario Description / Victory */}
        {isBossDefeated ? (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-emerald-400" />
            <p className="text-xs text-emerald-200 leading-relaxed">
              Sang Hyang Tuntang telah tunduk di hadapan kegigihan pasukan Wanua! Air bah surut dan berkah kesuburan melimpahi lumbung dengan +100 gabah.
            </p>
          </div>
        ) : isPeaceScenario ? (
          <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/40 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <p className="text-xs text-teal-200 leading-relaxed">
              Keluhuran adat dan kebersihan Sendang Tirta membuat Sang Hyang Tuntang menganugerahi berkah kemakmuran abadi tanpa pertumpahan darah!
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="text-[11px] text-stone-300">
              {allianceVerified ? (
                <span className="text-cyan-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  +50% Kerusakan Koalisi Aliansi Onsite Aktif!
                </span>
              ) : (
                <span className="text-stone-400">
                  Tip: Aktifkan Radar Aliansi onsite untuk +50% kekuatan tempur koalisi.
                </span>
              )}
            </div>

            <button
              onClick={handleAttackBoss}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-950 transition-all border border-red-400/50"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Gempur Naga</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
