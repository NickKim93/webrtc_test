// src/features/calls/CallSession.tsx
import React, { useEffect, useRef } from 'react';
import { useWs } from '../../ws/WsProvider';
import { RtcEngine } from './RtcEngine';

export function CallSession({
  meId,
  peerId,
  callId,
  role,
}: {
  meId: number;
  peerId: number;
  callId: number;
  role: 'caller' | 'callee';
}) {
  const { publish, subscribeUser } = useWs();
  const engineRef = useRef<RtcEngine | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const engine = new RtcEngine(
      (remote) => { if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remote; },
      console.error,
    );
    engineRef.current = engine;

    engine.init().then(() => {
      // отправляем ICE по мере генерации
      engine.onIce((cand) =>
        publish('/webrtc/ice', {
          toUserId: peerId,
          callId,
          candidate: JSON.stringify(cand),
        }),
      );

      // инициатор создаёт offer
      if (role === 'caller') {
        engine.startOffer((offer) =>
          publish('/webrtc/offer', {
            toUserId: peerId,
            callId,
            sdp: JSON.stringify(offer),
          }),
        );
      }
    });

    // подписки на SDP/ICE от собеседника
    const offOffer = subscribeUser('/queue/webrtc/offer', (m) => {
      const { callId: id, sdp } = JSON.parse(m.body);
      if (id !== callId) return;
      engineRef.current?.handleOffer(JSON.parse(sdp), (ans) =>
        publish('/webrtc/answer', {
          toUserId: peerId,
          callId,
          sdp: JSON.stringify(ans),
        }),
      );
    });
    const offAnswer = subscribeUser('/queue/webrtc/answer', (m) => {
      const { callId: id, sdp } = JSON.parse(m.body);
      if (id !== callId) return;
      engineRef.current?.handleAnswer(JSON.parse(sdp));
    });
    const offIce = subscribeUser('/queue/webrtc/ice', (m) => {
      const { callId: id, candidate } = JSON.parse(m.body);
      if (id !== callId) return;
      engineRef.current?.addIce(JSON.parse(candidate));
    });

    return () => {
      offOffer();
      offAnswer();
      offIce();
      engineRef.current?.destroy();
    };
  }, [callId, peerId, publish, role, subscribeUser]);

  return (
    <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 12 }}>
      <p>Call #{callId} — {role}</p>
      <audio ref={remoteAudioRef} autoPlay />
      <div style={{ marginTop: 8 }}>
        <button onClick={() => publish('/call/end', { callId })}>Завершить звонок</button>
      </div>
    </div>
  );
}
