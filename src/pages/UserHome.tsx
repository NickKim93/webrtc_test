// src/pages/UserHome.tsx
import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { WsProvider } from '../ws/WsProvider';
import { NotificationsHub } from '../features/calls/NotificationsHub';
import type { CallPayload, SdpIncoming, IceIncoming } from '../features/calls/types';
import { CallSession } from '../features/calls/CallSession';
import { createCall } from '../api/http';

export default function UserHome() {
  const { token, meId } = useAuth();
  const [incoming, setIncoming] = useState<CallPayload | null>(null);
  const [active, setActive] = useState<{ callId: number; peerId: number; role: 'caller' | 'callee'; payload: CallPayload } | null>(null);

  const onIncoming = (p: CallPayload) => setIncoming(p);
  const onStarted = (p: CallPayload) => {
    const callId = p.callId;
    const peerId = meId === p.callerId ? p.translatorId : p.callerId;
    const role: 'caller' | 'callee' = meId === p.callerId ? 'caller' : 'callee';
    setIncoming(null);
    setActive({ callId, peerId, role, payload: p });
  };

  const clear = () => { setIncoming(null); setActive(null); };
  const onRejected = clear; const onEnded = clear; const onTimeout = () => clear();
  const onOffer = (_: SdpIncoming) => {}; const onAnswer = (_: SdpIncoming) => {}; const onIce = (_: IceIncoming) => {};

  const startCall = async (recipientId: number, themeId: number) => {
    if (!token) return;
    await createCall({ token, recipientId, themeId });
  };

  return (
    <WsProvider token={token!}>
      <div style={{ padding: 16 }}>
        <h2>User page</h2>
        <StartCallPanel onStart={startCall} />

        <NotificationsHub
          onIncoming={onIncoming}
          onStarted={onStarted}
          onRejected={onRejected}
          onEnded={onEnded}
          onTimeout={onTimeout}
          onOffer={onOffer}
          onAnswer={onAnswer}
          onIce={onIce}
        />

        {active && (
          <div style={{ marginTop: 16 }}>
            <CallSession meId={meId!} peerId={active.peerId} callId={active.callId} role={active.role} />
          </div>
        )}
      </div>
    </WsProvider>
  );
}

function StartCallPanel({ onStart }: { onStart: (rid: number, tid: number) => void }) {
  const [rid, setRid] = useState<number>(0);
  const [tid, setTid] = useState<number>(0);
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input placeholder="recipientId (translator)" value={rid || ''} onChange={(e) => setRid(Number(e.target.value))} />
      <input placeholder="themeId" value={tid || ''} onChange={(e) => setTid(Number(e.target.value))} />
      <button onClick={() => rid && tid && onStart(rid, tid)}>Позвонить</button>
    </div>
  );
}
