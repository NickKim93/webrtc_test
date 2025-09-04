// src/api/http.ts
export async function createCall({
  token,
  recipientId,
  themeId,
}: {
  token: string;
  recipientId: number;
  themeId: number;
}) {
  const base = import.meta.env.VITE_API_URL || '/api';
  const res = await fetch(`${base}/calls`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ recipientId, themeId }),
  });
  if (!res.ok) throw new Error(`Create call failed: ${res.status}`);
  return res.json(); // ожидаем CallPayload.build(call)
}
