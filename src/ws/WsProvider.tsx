import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createStompClient } from "./StompClient";
import type { Client, IMessage, StompSubscription } from "@stomp/stompjs";

const WsCtx = createContext<WsContextValue>(null as unknown as WsContextValue);

export const WsProvider: React.FC<{
  token: string;
  children: React.ReactNode;
}> = ({ token, children }) => {
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const pendingSubs = useRef<
    Array<{ dest: string; cb: (msg: IMessage) => void; unsub?: () => void }>
  >([]);

  useEffect(() => {
    const client = createStompClient(token);
    clientRef.current = client;

    client.onConnect = () => {
      setConnected(true);
      // attach pending subscriptions
      pendingSubs.current.forEach((p) => {
        const sub = client.subscribe(`/user${p.dest}`, p.cb);
        p.unsub = () => sub.unsubscribe();
      });
    };

    client.onStompError = (f) => console.error("[STOMP ERROR]", f);
    client.onWebSocketClose = () => setConnected(false);

    client.activate();
    return () => {
      try {
        client.deactivate();
      } catch {}
      clientRef.current = null;
      setConnected(false);
      pendingSubs.current = [];
    };
  }, [token]);

  const subscribeUser: SubscribeFn = (dest, cb) => {
    const client = clientRef.current;
    if (client && connected) {
      const subscription: StompSubscription = client.subscribe(
        `/user${dest}`,
        cb
      );
      return () => subscription.unsubscribe();
    }
    // queue until connect
    const item = { dest, cb };
    pendingSubs.current.push(item);
    return () => {
      // remove queued sub if not yet subscribed
      pendingSubs.current = pendingSubs.current.filter((p) => p !== item);
      if (item.unsub) item.unsub();
    };
  };

  const publish = (dest: string, body: any) => {
    const client = clientRef.current;
    if (!client || !connected) return;
    client.publish({ destination: `/app${dest}`, body: JSON.stringify(body) });
  };

  const value = useMemo<WsContextValue>(
    () => ({ client: clientRef.current, connected, subscribeUser, publish }),
    [connected]
  );

  return <WsCtx.Provider value={value}>{children}</WsCtx.Provider>;
};

export const useWs = () => useContext(WsCtx);
