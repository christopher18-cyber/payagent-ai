const BASE = import.meta.env.VITE_API_URL;
const KEY = import.meta.env.VITE_API_KEY;

export async function api(path, options = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': KEY,
      ...(options.headers || {}),
    },
  });

  // Read as text first: the API key interceptor's 401 is plain text, not JSON
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text };
  }

  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}