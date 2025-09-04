// src/features/calls/NotificationsHub.tsx
import { useEffect } from 'react';
import { useWs } from '../../ws/WsProvider';
import type { CallPayload, SdpIncoming, IceIncoming } from './types';

export function NotificationsHub({
  onIncoming,
  onStarted,
  onRejected,
  onEnded,
  onTimeout,
  onOffer,
  onAnswer,
  onIce,
}: {
  onIncoming: (p: CallPayload) => void;
  onStarted: (p: CallPayload) => void;
  onRejected: () => void;
  onEnded: () => void;
  onTimeout: (label: string) => void; // "timeout" | "missed"
  onOffer: (m: SdpIncoming) => void;
  onAnswer: (m: SdpIncoming) => void;
  onIce: (m: IceIncoming) => void;
}) {
  const { subscribeUser } = useWs();

  useEffect(() => {
    const off1 = subscribeUser('/queue/incoming-call', (m) => onIncoming(JSON.parse(m.body)));
    const off2 = subscribeUser('/queue/call-started', (m) => onStarted(JSON.parse(m.body)));
    const off3 = subscribeUser('/queue/call-rejected', () => onRejected());
    const off4 = subscribeUser('/queue/call-ended', () => onEnded());
    const off5 = subscribeUser('/queue/call-timeout', (m) => onTimeout(m.body || 'timeout'));

    const off6 = subscribeUser('/queue/webrtc/offer',  (m) => onOffer(JSON.parse(m.body)));
    const off7 = subscribeUser('/queue/webrtc/answer', (m) => onAnswer(JSON.parse(m.body)));
    const off8 = subscribeUser('/queue/webrtc/ice',    (m) => onIce(JSON.parse(m.body)));

    return () => { off1(); off2(); off3(); off4(); off5(); off6(); off7(); off8(); };
  }, [subscribeUser, onIncoming, onStarted, onRejected, onEnded, onTimeout, onOffer, onAnswer, onIce]);

  return null;
}
