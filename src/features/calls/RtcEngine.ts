// src/features/calls/RtcEngine.ts
export class RtcEngine {
  private pc!: RTCPeerConnection;
  private local!: MediaStream;

  constructor(
    private onRemote: (stream: MediaStream) => void,
    private onError: (e: any) => void,
    private iceServers: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }],
  ) {}

  async init() {
    this.local = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    this.pc = new RTCPeerConnection({ iceServers: this.iceServers });
    this.local.getTracks().forEach((t) => this.pc.addTrack(t, this.local));
    this.pc.ontrack = (e) => this.onRemote(e.streams[0]);
  }

  getLocal() { return this.local; }

  onIce(cb: (cand: RTCIceCandidateInit) => void) {
    this.pc.onicecandidate = (e) => { if (e.candidate) cb(e.candidate.toJSON()); };
  }

  async startOffer(send: (offer: RTCSessionDescriptionInit) => void) {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    send(offer);
  }

  async handleOffer(offer: RTCSessionDescriptionInit, sendAnswer: (ans: RTCSessionDescriptionInit) => void) {
    await this.pc.setRemoteDescription(offer);
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    sendAnswer(answer);
  }

  async handleAnswer(answer: RTCSessionDescriptionInit) {
    await this.pc.setRemoteDescription(answer);
  }

  async addIce(c: RTCIceCandidateInit) {
    try { await this.pc.addIceCandidate(c); } catch (e) { this.onError(e); }
  }

  destroy() {
    try { this.pc.getSenders().forEach((s) => s.track?.stop()); } catch {}
    try { this.pc.close(); } catch {}
    try { this.local.getTracks().forEach((t) => t.stop()); } catch {}
  }
}
