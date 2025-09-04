import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function createStompClient(token: string) {
  const wsPath = import.meta.env.VITE_WS_PATH;
  const client = new Client({
    reconnectDelay: 3000,
    webSocketFactory: () => new SockJS(wsPath),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    debug: (msg) => {
      console.log('[STOMP]', msg);
    },
  });
  return client;
}
