// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const { loginWithCredentials, loginWithToken, roles } = useAuth();
  const nav = useNavigate();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rawToken, setRawToken] = useState('');
  const [mode, setMode] = useState<'creds' | 'token'>('creds');
  const [err, setErr] = useState<string | null>(null);

  const goHome = (nextRoles: string[]) => {
    if (nextRoles.includes('ROLE_TRANSLATOR')) nav('/translator');
    else nav('/user');
  };

  const submitCreds = async () => {
    setErr(null);
    try {
      const next = await loginWithCredentials(phone, password);
      goHome(next.roles);
    } catch (e: any) {
      setErr(e.message || 'Login failed');
    }
  };

  const submitToken = () => {
    setErr(null);
    try {
      const next = loginWithToken(rawToken.trim());
      goHome(next.roles || roles);
    } catch (e: any) {
      setErr(e.message || 'Bad token');
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '64px auto', padding: 24, border: '1px solid #ddd', borderRadius: 12 }}>
      <h2>Login</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={() => setMode('creds')} disabled={mode === 'creds'}>By credentials</button>
        <button onClick={() => setMode('token')} disabled={mode === 'token'}>Paste token</button>
      </div>

      {mode === 'creds' ? (
        <>
          <input
            placeholder="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: '100%', marginBottom: 8 }}
          />
          <input
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', marginBottom: 8 }}
          />
          <button onClick={submitCreds} style={{ width: '100%' }}>Sign in</button>
        </>
      ) : (
        <>
          <textarea
            placeholder="JWT token"
            value={rawToken}
            onChange={(e) => setRawToken(e.target.value)}
            style={{ width: '100%', height: 120, marginBottom: 8 }}
          />
          <button onClick={submitToken} style={{ width: '100%' }}>Use token</button>
        </>
      )}

      {err && <p style={{ color: 'crimson', marginTop: 8 }}>{err}</p>}
    </div>
  );
}
