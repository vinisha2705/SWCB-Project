// Thin wrapper around the Express backend for actions that should be
// server-authoritative (writing alert resolutions, registering FCM tokens).
const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export const api = {
  emptyBot: (botId) => request(`/api/bots/${botId}/empty`, { method: 'POST' }),
  ackAlert: (alertId) => request(`/api/alerts/${alertId}/ack`, { method: 'POST' }),
  registerToken: (token, uid) =>
    request('/api/fcm/register', { method: 'POST', body: JSON.stringify({ token, uid }) })
};
