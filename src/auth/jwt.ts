// src/auth/jwt.ts
export type JwtPayload = {
  id?: number | string; 
  roles?: string[] | string;  
  authorities?: string[] | string;
  role?: string;
  scope?: string;
  [k: string]: unknown;
};

function b64urlToJson(b64url: string) {
  // конвертируем base64url → base64 и добавляем padding
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  if (pad) b64 += '='.repeat(4 - pad);
  const json = atob(b64);
  return JSON.parse(json);
}

export function decodeJwt(token: string): JwtPayload {
  const parts = token.split('.');
  if (parts.length < 2) throw new Error('Invalid JWT');
  return b64urlToJson(parts[1]);
}

export function extractUserId(payload: JwtPayload): number | null {
  // предпочитаем кастомный claims.id; запасной вариант — numeric sub
  if (payload.id != null) return Number(payload.id);
  if (payload.sub && /^\d+$/.test(payload.sub)) return Number(payload.sub);
  return null;
}

export function extractRoles(payload: JwtPayload): string[] {
  // берём роли из любого поля, приводим к массиву строк
  const raw =
    (payload.roles ??
      payload.authorities ??
      payload.role ??
      payload.scope) as string[] | string | undefined;

  if (!raw) return [];

  const arr = Array.isArray(raw)
    ? raw
    : String(raw)
        .split(/[ ,]/g)
        .map((s) => s.trim())
        .filter(Boolean);

  // нормализуем частую опечатку
  return arr.map((r) => (r === 'ROLE_TRANLSATOR' ? 'ROLE_TRANSLATOR' : r));
}
