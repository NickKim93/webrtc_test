// src/features/calls/types.ts

export type CallPayload = {
  callId: number;          // call id из CallPayload.build(call)
  callerId: number;    // инициатор
  translatorId: number; // получатель (переводчик)
  status?: string;
  themeId?: number;
};

// Что прилетает по /queue/webrtc/offer | /answer
export type SdpIncoming = {
  callId: number;
  toUserId: number;
  sdp: string; // JSON-строка RTCSessionDescriptionInit
};

// Что прилетает по /queue/webrtc/ice
export type IceIncoming = {
  callId: number;
  toUserId: number;
  candidate: string; // JSON-строка RTCIceCandidateInit
};
