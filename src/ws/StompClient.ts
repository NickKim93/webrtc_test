import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export function createStompClient(token: string): Client {
  const wsPath = import.meta.env.VITE_WS_PATH || "/ws";
  const client = new Client({
    reconnectDelay: 3000,
    webSocketFactory: () => new SockJS(`${wsPath}?token=${encodeURIComponent(`Bearer ${token}`)}`),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    debug: (msg) => console.log("[STOMP]", msg),
  });

  return client;
}
