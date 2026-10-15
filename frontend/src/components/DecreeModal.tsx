import React, { useState } from "react";
import {
  X,
  Scroll,
  Sparkles,
  Coins,
  History,
  Send,
  Scale,
  Shield,
  Heart,
  Droplets,
  Percent
} from "lucide-react";
import { useGameStore, DecreeLogEntry } from "../store/useGameStore";
import { POLICY_CARDS, PolicyCard } from "../data/policyCards";
import { socketClient } from "../services/socketClient";
import { audioEngine } from "../services/audioEngine";

export const DecreeModal: React.FC = () => {
  const {
    isDecreeModalOpen,
    setDecreeModalOpen,
    kingdom,
    bobCoins,
    decreeLogs
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<"CARDS" | "NLP" | "LOGS">("CARDS");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [nlpText, setNlpText] = useState<string>("");
  const [isSubmittingNlp, setIsSubmittingNlp] = useState<boolean>(false);

  if (!isDecreeModalOpen) return null;

  const categories = [
    { id: "all", label: "Semua Titah" },
    { id: "ekonomi", label: "Agraria & Kas" },
    { id: "keamanan", label: "Keamanan" },
    { id: "alam", label: "Kelestarian Alam" },
    { id: "sosial", label: "Sosial Adat" },
    { id: "pertahanan", label: "Benteng & Ronda" }
  ];

  const filteredCards =
    selectedCategory === "all"
      ? POLICY_CARDS
      : POLICY_CARDS.filter((c) => c.kategori === selectedCategory);

  const handleIssueCard = (card: PolicyCard) => {
    if (kingdom.emas < card.biayaEmas) return;

    socketClient.submitDecree({
      sourceType: "PRESET_CARD",
      cardId: card.id,
      costEmas: card.biayaEmas,
      title: card.name
    });
  };

  const handleQuickPrompt = (prompt: string) => {
    setNlpText(prompt);
  };

  const handleSubmitNlp = () => {
    if (!nlpText.trim() || bobCoins < 25) return;

    setIsSubmittingNlp(true);
    socketClient.submitDecree({
      sourceType: "FREE_TEXT",
      text: nlpText.trim(),
      costEmas: 10,
      title: "Titah Bebas: " + nlpText.trim().substring(0, 24) + "..."
    });

    setNlpText("");
    setIsSubmittingNlp(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-stone-950/95 border border-amber-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/60 via-stone-900 to-amber-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-black text-amber-300 tracking-wide">
                Balairung Titah Wanua
              </h2>
              <p className="text-xs text-stone-400">
                Keluarkan maklumat ageng untuk memandu takdir, ekonomi, dan peradaban rakyat
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioEngine.playBonangChime(4);
              setDecreeModalOpen(false);
            }}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors border border-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-stone-800 bg-stone-900/50 text-xs">
          <button
            onClick={() => {
              audioEngine.playBonangChime(1);
              setActiveTab("CARDS");
            }}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl font-bold transition-all border-b-2 ${
              activeTab === "CARDS"
                ? "border-amber-400 text-amber-300 bg-stone-900"
                : "border-transparent text-stone-400 hover:text-stone-200"
            }`}
          >
            <Scroll className="w-4 h-4" />
            <span>18 Kartu Kebijakan Tematik</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playBonangChime(2);
              setActiveTab("NLP");
            }}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl font-bold transition-all border-b-2 ${
              activeTab === "NLP"
                ? "border-amber-400 text-amber-300 bg-stone-900"
                : "border-transparent text-stone-400 hover:text-stone-200"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Titah Bebas NLP (AI)</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playBonangChime(3);
              setActiveTab("LOGS");
            }}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl font-bold transition-all border-b-2 ${
              activeTab === "LOGS"
                ? "border-amber-400 text-amber-300 bg-stone-900"
                : "border-transparent text-stone-400 hover:text-stone-200"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Catatan Titah Leluhur ({decreeLogs.length})</span>
          </button>
        </div>

        {/* Tab 1: 18 Preset Policy Cards */}
        {activeTab === "CARDS" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all font-medium border ${
                    selectedCategory === cat.id
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                      : "bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredCards.map((card) => {
                const canAfford = kingdom.emas >= card.biayaEmas;

                return (
                  <div
                    key={card.id}
                    className="flex flex-col justify-between p-4 rounded-2xl lontar-card group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-md bg-stone-900/90 text-amber-300 border border-amber-500/30">
                          {card.kategori}
                        </span>
                        <div className="flex items-center gap-1 text-amber-300 text-xs font-bold px-2 py-0.5 rounded-md bg-amber-950/40 border border-amber-500/30">
                          <Coins className="w-3.5 h-3.5" />
                          <span>{card.biayaEmas} Emas</span>
                        </div>
                      </div>

                      <h3 className="font-serif font-bold text-stone-100 group-hover:text-amber-200 transition-colors text-sm">
                        {card.name}
                      </h3>

                      <p className="text-xs text-stone-400 leading-relaxed min-h-[40px]">
                        {card.description}
                      </p>

                      {/* Stat Impact Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-800/60 text-[10px]">
                        {card.keadilan !== 0 && (
                          <span
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
                              card.keadilan > 0 ? "text-emerald-300 bg-emerald-950/50" : "text-rose-300 bg-rose-950/50"
                            }`}
                          >
                            <Scale className="w-3 h-3" />
                            {card.keadilan > 0 ? `+${card.keadilan * 100}%` : `${card.keadilan * 100}%`} Keadilan
                          </span>
                        )}

                        {card.kesejahteraan !== 0 && (
                          <span
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
                              card.kesejahteraan > 0 ? "text-emerald-300 bg-emerald-950/50" : "text-rose-300 bg-rose-950/50"
                            }`}
                          >
                            <Heart className="w-3 h-3" />
                            {card.kesejahteraan > 0 ? `+${card.kesejahteraan * 100}%` : `${card.kesejahteraan * 100}%`} Sejahtera
                          </span>
                        )}

                        {card.keamanan !== 0 && (
                          <span
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
                              card.keamanan > 0 ? "text-emerald-300 bg-emerald-950/50" : "text-rose-300 bg-rose-950/50"
                            }`}
                          >
                            <Shield className="w-3 h-3" />
                            {card.keamanan > 0 ? `+${card.keamanan * 100}%` : `${card.keamanan * 100}%`} Keamanan
                          </span>
                        )}

                        {card.lingkungan !== 0 && (
                          <span
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
                              card.lingkungan > 0 ? "text-teal-300 bg-teal-950/50" : "text-rose-300 bg-rose-950/50"
                            }`}
                          >
                            <Droplets className="w-3 h-3" />
                            {card.lingkungan > 0 ? `+${card.lingkungan * 100}%` : `${card.lingkungan * 100}%`} Harmoni
                          </span>
                        )}

                        {card.pajakDelta !== 0 && (
                          <span
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
                              card.pajakDelta < 0 ? "text-emerald-300 bg-emerald-950/50" : "text-amber-300 bg-amber-950/50"
                            }`}
                          >
                            <Percent className="w-3 h-3" />
                            {card.pajakDelta > 0 ? `+${card.pajakDelta}%` : `${card.pajakDelta}%`} Pajak
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      disabled={!canAfford}
                      onClick={() => handleIssueCard(card)}
                      className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        canAfford
                          ? "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-md active:scale-98"
                          : "bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-800"
                      }`}
                    >
                      <Scroll className="w-3.5 h-3.5" />
                      <span>{canAfford ? "Keluarkan Titah" : "Kas Emas Tidak Cukup"}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: NLP Free Text AI Decree */}
        {activeTab === "NLP" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Dewan Penasihat AI Kerajaan (NLP Edict Engine)
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-mono font-bold">
                  Biaya: 25 Bob Coins (Sisa: {bobCoins})
                </span>
              </div>
              <p className="text-stone-300 leading-relaxed">
                Tuliskan titahmu dalam bahasa Indonesia sehari-hari. Model bahasa AI akan membedah maksud titahmu ke dalam 5 vektor kebijakan (Keadilan, Kesejahteraan, Keamanan, Lingkungan, dan Pajak) dengan perlindungan Circuit Breaker deterministik.
              </p>
            </div>

            {/* Quick Inspiration Pills */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-stone-400">Contoh Titah Inspiratif:</span>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  "Bagi rata beras lumbung kepada janda dan anak yatim, kurangi pajak pasar.",
                  "Perketat ronda malam siskamling dan kerahkan pemuda menjaga perbatasan.",
                  "Pahat saluran irigasi subak baru dan bersihkan mata air sendang dari sampah.",
                  "Babat semak rimba larangan untuk membuka sawah terasering baru."
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/40 text-stone-300 text-[11px] text-left transition-colors"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea Input */}
            <div className="space-y-2">
              <textarea
                value={nlpText}
                onChange={(e) => setNlpText(e.target.value)}
                placeholder="Titahkan perintahmu di sini... (contoh: Turunkan pajak tani sebesar 5 persen dan dirikan pos ronda di bukit timur)"
                rows={4}
                className="w-full p-4 rounded-2xl bg-stone-900/90 border border-stone-700 focus:border-amber-500 focus:outline-none text-stone-100 text-sm placeholder:text-stone-500 resize-none font-sans"
              />

              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500">
                  {nlpText.length} karakter • Sanitasi Prompt Guard aktif
                </span>

                <button
                  disabled={!nlpText.trim() || bobCoins < 25 || isSubmittingNlp}
                  onClick={handleSubmitNlp}
                  className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
                    nlpText.trim() && bobCoins >= 25 && !isSubmittingNlp
                      ? "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-lg active:scale-95"
                      : "bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-800"
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingNlp ? "Membedah Titah..." : "Maklumatkan Titah"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: History Logs */}
        {activeTab === "LOGS" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {decreeLogs.length === 0 ? (
              <div className="text-center py-12 text-stone-500 text-sm">
                Belum ada titah yang dikeluarkan dalam sejarah kerajaan ini.
              </div>
            ) : (
              decreeLogs.map((log: DecreeLogEntry) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-stone-900/70 border border-stone-800 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-200">{log.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-400">
                        {log.sourceType === "PRESET_CARD" ? "Kartu Tematik" : "Titah NLP AI"}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500">
                      Dikeluarkan pada: {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="text-amber-400">-{log.costEmas} Emas</span>
                    <span className="text-emerald-400">+{Math.round(log.impacts.keadilan * 15)} Kepuasan</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
