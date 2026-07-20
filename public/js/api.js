// api.js — thin fetch helpers. Every server call flows through req().

async function req(path, opts = {}) {
  const res = await fetch(path, {
    headers: { 'content-type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `${res.status} ${res.statusText}`);
  return data;
}

export const api = {
  deals: {
    all: () => req('/api/deals'),
    markets: () => req('/api/deals/markets'),
    sources: () => req('/api/deals/sources'),
    refresh: market => req('/api/deals/refresh', { method: 'POST', body: { market } }),
    clearRefresh: market => req('/api/deals/refresh/clear', { method: 'POST', body: { market } }),
  },
  config: {
    get: () => req('/api/config'),
    save: patch => req('/api/config', { method: 'POST', body: patch }),
    test: () => req('/api/config/test', { method: 'POST', body: {} }),
  },
  ask: (question, market) => req('/api/ask', { method: 'POST', body: { question, market } }),
};

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
