import React, { useEffect, useRef } from "react";
import { PixiApp } from "./engine/PixiApp";
import { socketClient } from "./services/socketClient";
import { useGameStore } from "./store/useGameStore";
import { HudBar } from "./components/HudBar";
import { FactionSentiment } from "./components/FactionSentiment";
import { DecreeModal } from "./components/DecreeModal";
import { AllianceRadar } from "./components/AllianceRadar";
import { ExpeditionModal } from "./components/ExpeditionModal";
import { BossHpOverlay } from "./components/BossHpOverlay";
import { CoupOverlay } from "./components/CoupOverlay";
import { Maximize2 } from "lucide-react";

export const App: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const pixiAppRef = useRef<PixiApp | null>(null);

  const {
    kingdom,
    weather,
    boss
  } = useGameStore();

  useEffect(() => {
    let isMounted = true;

    if (canvasRef.current && !pixiAppRef.current) {
      const appInstance = new PixiApp();
      pixiAppRef.current = appInstance;

      appInstance
        .init(canvasRef.current)
        .then(() => {
          if (!isMounted) return;
          // Initial sync of building levels, weather, and boss
          appInstance.syncWithGameState(
            kingdom.balaiWanuaLv,
            kingdom.lumbungLv,
            kingdom.posRondaLv,
            weather,
            boss.isSpawned && !boss.isDefeated,
            boss.hp,
            boss.maxHp
          );
        })
        .catch((err) => {
          console.error("Gagal menginisialisasi PixiApp canvas:", err);
        });

      // Connect WebSocket gateway client with auto-simulation fallback
      socketClient.connect();
    }

    return () => {
      isMounted = false;
      socketClient.disconnect();
      if (pixiAppRef.current) {
        pixiAppRef.current.destroy();
        pixiAppRef.current = null;
      }
    };
  }, []);

  // Sync Pixi scene when store updates
  useEffect(() => {
    if (pixiAppRef.current && pixiAppRef.current.isInitialized) {
      pixiAppRef.current.syncWithGameState(
        kingdom.balaiWanuaLv,
        kingdom.lumbungLv,
        kingdom.posRondaLv,
        weather,
        boss.isSpawned && !boss.isDefeated,
        boss.hp,
        boss.maxHp
      );
    }
  }, [
    kingdom.balaiWanuaLv,
    kingdom.lumbungLv,
    kingdom.posRondaLv,
    weather,
    boss.isSpawned,
    boss.isDefeated,
    boss.hp,
    boss.maxHp
  ]);

  const handleResetCamera = () => {
    if (pixiAppRef.current) {
      pixiAppRef.current.resetCamera();
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080c08] select-none font-sans text-stone-100">
      {/* 2.5D Isometric Pixi.js Canvas Container */}
      <div
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Glassmorphism HUD Overlays */}
      <HudBar />
      <FactionSentiment />
      <DecreeModal />
      <AllianceRadar />
      <ExpeditionModal />
      <BossHpOverlay />
      <CoupOverlay />

      {/* Floating Bottom-Right Camera Reset Button */}
      <div className="fixed bottom-3 right-3 z-20 flex items-center gap-2">
        <button
          onClick={handleResetCamera}
          className="p-2.5 rounded-xl bg-black/75 hover:bg-black/90 active:scale-95 text-stone-300 hover:text-amber-300 transition-all border border-stone-700/60 shadow-lg backdrop-blur-md text-xs flex items-center gap-1.5"
          title="Pusatkan Kamera ke Keraton Wanua"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-semibold">Pusatkan Kamera</span>
        </button>
      </div>
    </div>
  );
};

export default App;
