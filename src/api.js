const PUBLIC_API_BASE_URL = "https://subterraneously-proannexation-vasiliki.ngrok-free.dev/api";
const USE_DEV_BACKEND = process.env.REACT_APP_USE_DEV_BACKEND === "true";

const defaultBaseUrl = (() => {
  if (typeof window === "undefined") return PUBLIC_API_BASE_URL;

  const host = window.location.hostname;
  const isLocalHost = host === "localhost" || host === "127.0.0.1";

  if (USE_DEV_BACKEND || isLocalHost) {
    return `${window.location.origin}/api`;
  }

  // Public deployments must call the backend host directly. Vercel only serves
  // the React app, so /api there falls back to index.html instead of Nest.
  if (host === "production-control.vercel.app" || host.endsWith(".vercel.app")) {
    return PUBLIC_API_BASE_URL;
  }

  // For LAN/ngrok gateways, route through the gateway at the same origin.
  return `${window.location.origin}/api`;
})();

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || defaultBaseUrl;


const TOKEN_KEY = "auth:token";
const NGROK_SKIP_WARNING_HEADER = "ngrok-skip-browser-warning";

export async function apiFetch(pathOrUrl, init = {}) {
  const url = resolveUrl(pathOrUrl);
  const headers = new Headers(init.headers || {});
  if (!headers.has(NGROK_SKIP_WARNING_HEADER)) {
    headers.set(NGROK_SKIP_WARNING_HEADER, "true");
  }
  try {
    const token = typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null;
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  } catch {
    // ignore storage errors
  }
  return fetch(url, { ...init, headers });
}

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
    const res = await apiFetch(url, init);
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
    const res = await apiFetch(url, init);
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
