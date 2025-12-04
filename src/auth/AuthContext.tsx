// src/auth/AuthContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { decodeJwt, extractRoles, extractUserId, type JwtPayload } from './jwt';

export type AuthState = {
  token: string | null;
  meId: number | null;
  roles: string[];
};

export type AuthContextValue = AuthState & {
  loginWithToken: (token: string) => AuthState;
  loginWithCredentials: (phone: string, password: string) => Promise<AuthState>;
  logout: () => void;
};

const Ctx = createContext<AuthContextValue>(null as unknown as AuthContextValue);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem('token');
    const userIdStr = localStorage.getItem('userId');
    const rolesStr = localStorage.getItem('roles');
    return {
      token,
      meId: userIdStr ? Number(userIdStr) : null,
      roles: rolesStr ? JSON.parse(rolesStr) : [],
    };
  });

  const persist = (next: AuthState) => {
    setState(next);
    if (next.token) localStorage.setItem('token', next.token);
    else localStorage.removeItem('token');

    if (next.meId != null) localStorage.setItem('userId', String(next.meId));
    else localStorage.removeItem('userId');

    localStorage.setItem('roles', JSON.stringify(next.roles || []));
  };

  const loginWithToken = useCallback((token: string) => {
    const payload: JwtPayload = decodeJwt(token);
    const meId = extractUserId(payload);
    const roles = extractRoles(payload);
    if (meId == null) throw new Error('JWT must contain numeric id (claims.id or numeric sub)');
    const next = { token, meId, roles };
    persist(next);
    return next;
  }, []);

  const loginWithCredentials = useCallback(
    async (phone: string, password: string) => {
      const base = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      if (!data.token) throw new Error('No token in response');
      return loginWithToken(data.token);
    },
    [loginWithToken],
  );

  const logout = useCallback(() => persist({ token: null, meId: null, roles: [] }), []);

  // синхронизация между вкладками
  useEffect(() => {
    const h = () => {
      const token = localStorage.getItem('token');
      const meId = localStorage.getItem('userId');
      const roles = localStorage.getItem('roles');
      setState({
        token,
        meId: meId ? Number(meId) : null,
        roles: roles ? JSON.parse(roles) : [],
      });
    };
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, loginWithToken, loginWithCredentials, logout }),
    [state, loginWithToken, loginWithCredentials, logout],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
