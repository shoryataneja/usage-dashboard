const TOKEN_KEY = 'cd_token';
const BASE_KEY = 'cd_base_url';

export const DEFAULT_BASE_URL = 'http://localhost:4000/api/v1';

export function getBaseUrl() {
  return localStorage.getItem(BASE_KEY) || DEFAULT_BASE_URL;
}

export function setBaseUrl(url) {
  localStorage.setItem(BASE_KEY, url.trim().replace(/\/+$/, ''));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiClientError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch(path, { method = 'GET', body, query } = {}) {
  const url = new URL(getBaseUrl() + path);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers = { Accept: 'application/json' };
  if (body) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const started = performance.now();
  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiClientError(
      `Cannot reach ${getBaseUrl()} — is the backend running on that host?`,
      0,
    );
  }
  const elapsed = Math.round(performance.now() - started);

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok) {
    const message = payload?.message || payload?.error || `Request failed with status ${res.status}`;
    throw new ApiClientError(message, res.status, payload);
  }

  return {
    data: payload?.data ?? payload,
    meta: payload?.meta,
    status: res.status,
    elapsed,
  };
}
