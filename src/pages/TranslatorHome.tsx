// src/pages/TranslatorHome.tsx
import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { WsProvider, useWs } from '../ws/WsProvider';
import { NotificationsHub } from '../features/calls/NotificationsHub';
import type { CallPayload, SdpIncoming, IceIncoming } from '../features/calls/types';
import { IncomingCallModal } from '../features/calls/IncomingCallModal';
import { CallSession } from '../features/calls/CallSession';

export default function TranslatorHome() {
  const { token, meId } = useAuth();
  const [incoming, setIncoming] = useState<CallPayload | null>(null);
  const [active, setActive] = useState<{ callId: number; peerId: number; role: 'caller' | 'callee'; payload: CallPayload } | null>(null);

  return (
    <WsProvider token={token!}>
      <TranslatorInner meId={meId!} incoming={incoming} setIncoming={setIncoming} active={active} setActive={setActive} />
    </WsProvider>
  );
}

function TranslatorInner({
  meId,
  incoming,
  setIncoming,
  active,
  setActive,
}: {
  meId: number;
  incoming: CallPayload | null;
  setIncoming: (v: CallPayload | null) => void;
  active: { callId: number; peerId: number; role: 'caller' | 'callee'; payload: CallPayload } | null;
  setActive: (v: any) => void;
}) {
  const { publish } = useWs();

  const onIncoming = (p: CallPayload) => setIncoming(p);
  const onStarted = (p: CallPayload) => {
    const callId = p.id;
    const peerId = meId === p.callerId ? p.translatorId : p.callerId;
    const role: 'caller' | 'callee' = meId === p.callerId ? 'caller' : 'callee';
    setIncoming(null);
    setActive({ callId, peerId, role, payload: p });
  };

  const clear = () => { setIncoming(null); setActive(null); };
  const onRejected = clear; const onEnded = clear; const onTimeout = () => clear();
  const onOffer = (_: SdpIncoming) => {}; const onAnswer = (_: SdpIncoming) => {}; const onIce = (_: IceIncoming) => {};

  return (
    <div style={{ padding: 16 }}>
      <h2>Translator page</h2>

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

      {incoming && (
        <IncomingCallModal
          call={incoming}
          onAccept={(id) => publish('/call/accept', { callId: id })}
          onReject={(id) => publish('/call/reject', { callId: id })}
        />
      )}

      {active && (
        <div style={{ marginTop: 16 }}>
          <CallSession meId={meId} peerId={active.peerId} callId={active.callId} role={active.role} />
        </div>
      )}
    </div>
  );
}
