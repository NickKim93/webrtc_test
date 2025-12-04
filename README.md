# WebRTC Test Client

This project is a minimal React + Vite front end used to drive and verify the WebRTC call flow implemented in the Spring Boot backend. It lets you authenticate, receive STOMP notifications, and establish a peer-to-peer audio stream between a caller and a translator.

## Backend contract
- REST endpoints:
  - `POST /auth/login` - accepts `{ login, password }` and returns `{ token }` (JWT). Used by the login form.
  - `POST /calls` - accepts `{ recipientId, themeId }` with the caller's JWT bearer token. Expected to create a call session and trigger STOMP notifications.
- SockJS/STOMP broker (default path `/ws`):
  - Subscriptions: `/queue/incoming-call`, `/queue/call-started`, `/queue/call-rejected`, `/queue/call-ended`, `/queue/call-timeout`, `/queue/webrtc/offer`, `/queue/webrtc/answer`, `/queue/webrtc/ice`.
  - Publications from the client (sent to `/app/...` destinations):
    - `/call/accept`, `/call/reject`, `/call/end`.
    - `/webrtc/offer`, `/webrtc/answer`, `/webrtc/ice` (payloads contain `callId`, `toUserId`, and the SDP or ICE JSON strings).

Make sure your backend exposes matching endpoints and relays STOMP messages to the authenticated user queues.

## Configuration
- Environment variables are read via `import.meta.env`:
  - `VITE_API_URL` - base URL for REST calls.
  - `VITE_WS_PATH` - SockJS endpoint (defaults to `/ws`).
- Create a `.env.local` file if you need to override the defaults, for example:

```
VITE_API_URL=http://localhost:8080/
VITE_WS_PATH=http://localhost:8080/ws
```

- The dev server proxy in `vite.config.js`. Update the `target` values there when you want to point at a different backend while keeping relative URLs in the code.

## Getting started
1. Install dependencies: `npm install`.
2. Ensure the Spring Boot backend is running and exposes the contract described above.
3. Start the front end: `npm run dev` (Vite listens on `http://localhost:5173`).
4. Open the app in a browser and log in either with credentials (which call `/auth/login`) or by pasting a raw JWT token.

## Testing the call flow
1. Sign in as a translator in one browser tab or window (requires `ROLE_TRANSLATOR`).
2. Sign in as a regular user in another tab or window (requires `ROLE_USER`).
3. From the user view, start a call by entering the translator's user id and a theme id, then click **Start call**.
4. Accept or reject the call from the translator view. When accepted, the `CallSession` component establishes the WebRTC peer connection, exchanging SDP offers or answers and ICE candidates through the backend.
5. Use the **End call** button to terminate the session and verify `/queue/call-ended` notification handling.

## Available scripts
- `npm run dev` - start the Vite dev server.
- `npm run build` - create a production build.
- `npm run preview` - serve the production bundle locally.
- `npm run lint` - run ESLint.

## Notes
- Authentication state persists in `localStorage`; clearing storage logs the user out.
- The `RtcEngine` currently captures audio only (`getUserMedia({ audio: true, video: false })`). Adjust the constraints if you need video.
- The default STUN server is Google's public server. Update `RtcEngine` if your deployment requires custom ICE servers.
