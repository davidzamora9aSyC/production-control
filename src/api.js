export const API_BASE_URL = 'https://smartindustries.org';

// Lightweight cache with in-flight request deduplication for GET JSON endpoints
// Keyed by method+URL+Authorization header. Intended to reduce burst calls.
const __cache = new Map(); // key -> { ts, data }
const __inflight = new Map(); // key -> Promise<any>

function resolveUrl(pathOrUrl) {
  if (!pathOrUrl) return API_BASE_URL;
  if (typeof pathOrUrl !== 'string') return String(pathOrUrl);
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;
  if (pathOrUrl.startsWith('/')) return `${API_BASE_URL}${pathOrUrl}`;
  return `${API_BASE_URL}/${pathOrUrl}`;
}

function headerValue(headers, key) {
  if (!headers) return '';
  try {
    if (headers instanceof Headers) return headers.get(key) || '';
    const h = (headers[key] ?? headers[key.toLowerCase()]);
    return h || '';
  } catch {
    return '';
  }
}

export async function fetchJsonCached(pathOrUrl, init = {}, opts = {}) {
  const method = (init.method || 'GET').toUpperCase();
  const url = resolveUrl(pathOrUrl);
  const ttlMs = typeof opts.ttlMs === 'number' ? opts.ttlMs : 15000; // default 15s
  const force = !!opts.force;
  const auth = headerValue(init.headers, 'Authorization');
  const key = `${method}|${url}|${auth}`;

  // Only cache GET
  if (method !== 'GET') {
    const res = await fetch(url, init);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  if (!force) {
    const cached = __cache.get(key);
    if (cached && (Date.now() - cached.ts) < ttlMs) {
      return cached.data;
    }
    const inflight = __inflight.get(key);
    if (inflight) return inflight;
  }

  const p = (async () => {
    const res = await fetch(url, init);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    __cache.set(key, { ts: Date.now(), data });
    return data;
  })();

  __inflight.set(key, p);
  try {
    return await p;
  } finally {
    __inflight.delete(key);
  }
}
