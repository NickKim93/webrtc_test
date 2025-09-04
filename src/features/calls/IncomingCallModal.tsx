// src/features/calls/IncomingCallModal.tsx
import React from 'react';
import type { CallPayload } from './types';

export function IncomingCallModal({
  call,
  onAccept,
  onReject,
}: {
  call: CallPayload;
  onAccept: (callId: number) => void;
  onReject: (callId: number) => void;
}) {
  if (!call) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: 12, padding: 24, width: 360, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
        <h3>Входящий звонок</h3>
        <p>callId: {call.id}</p>
        <p>От пользователя: {call.callerId}</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button onClick={() => onAccept(call.id)}>Принять</button>
          <button onClick={() => onReject(call.id)}>Отклонить</button>
        </div>
      </div>
    </div>
  );
}
