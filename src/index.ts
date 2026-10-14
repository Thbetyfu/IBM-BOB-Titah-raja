/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Core Backend Module Exports
 */

// Phase 1: Core Simulation & ECS Engine
export * from "./sim/agentEngine.js";
export * from "./sim/economyCalculator.js";
export * from "./sim/worldEngine.js";
export * from "./sim/dynastyEngine.js";

// Phase 2: Gateway, Security, AI NLP, Geolocation, Combat, & Calamity
export * from "./auth/jwt.js";
export * from "./decree/cardCatalog.js";
export * from "./ai/aiAdapter.js";
export * from "./services/allianceService.js";
export * from "./services/battleService.js";
export * from "./services/expeditionService.js";
export * from "./sim/calamityEngine.js";
export * from "./services/socketService.js";
export * from "./server.js";
