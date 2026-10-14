/**
 * Titah Rakyat: Sovereign of the Living Realm
 * Entrypoint Game Server & WebSocket Gateway Bootstrap (RFC 6455 / HTTP/2)
 *
 * Implements:
 * 1. Native HTTP Server with /health check endpoint.
 * 2. RFC 6455 WebSocket Server with JWT Handshake attachment.
 * 3. Graceful shutdown handler and port management (default 3001).
 */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { WebSocketServer } from "ws";
import { GameSocketServer } from "./services/socketService.js";

const PORT = Number(process.env.PORT) || 3001;
const JWT_SECRET =
  process.env.JWT_SECRET || "titah_rakyat_development_secret_key_2026";

export function createGameServer() {
  const httpServer = createServer(
    (req: IncomingMessage, res: ServerResponse) => {
      // Basic Health Check Endpoint
      if (req.url === "/health" || req.url === "/api/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            status: "HEALTHY",
            service: "titah-rakyat-backend",
            uptimeSeconds: Math.floor(process.uptime()),
            timestamp: new Date().toISOString()
          })
        );
        return;
      }

      // Default Not Found
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "NOT_FOUND" }));
    }
  );

  const wss = new WebSocketServer({ server: httpServer });
  const socketService = new GameSocketServer(JWT_SECRET);
  socketService.attach(wss);

  return { httpServer, wss, socketService };
}

// Auto-run if executed directly as entrypoint
if (
  process.argv[1] &&
  (process.argv[1].endsWith("server.ts") || process.argv[1].endsWith("server.js"))
) {
  const { httpServer } = createGameServer();
  httpServer.listen(PORT, () => {
    // Standard informational startup log
    process.stdout.write(
      `[Titah Rakyat Gateway] Server listening on port ${PORT}\n`
    );
  });

  const gracefulShutdown = () => {
    process.stdout.write(
      "\n[Titah Rakyat Gateway] Initiating graceful shutdown...\n"
    );
    httpServer.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGTERM", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);
}
