// app.js — router + shared state + toast + theme. Views render into #content.

import { api } from './api.js';
import renderDeals from './views/deals.js';
import renderSources from './views/sources.js';
import renderSettings from './views/settings.js';

const VIEWS = { deals: renderDeals, sources: renderSources, settings: renderSettings };

export const state = {
  view: 'deals',
  market: localStorage.getItem('couponops-market') || 'all',
  cat: 'All',
  store: 'All',
  query: '',
  sort: 'hot',
  data: null,        // /api/deals payload
  config: null,      // /api/config payload
};

const content = document.getElementById('content');

export function toast(msg, ms = 3200) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), ms);
}

export function updateModelChip() {
  const chip = document.getElementById('modelChip');
  const c = state.config;
  chip.textContent = c?.aiModel ? `${c.aiProvider} · ${c.aiModel}` : 'no model configured';
}

export async function loadData(force = false) {
  if (!state.data || force) state.data = await api.deals.all().catch(e => { toast(e.message); return { deals: [], refreshes: {} }; });
  if (!state.config || force) {
    state.config = await api.config.get().catch(() => null);
    updateModelChip();
  }
  return state.data;
}

const TITLES = { deals: 'Grocery Deals', sources: 'Sources', settings: 'Settings' };

export async function navigate(view) {
  state.view = view;
  document.getElementById('pageTitle').textContent = TITLES[view] || view;
  document.querySelectorAll('.nav-item').forEach(n =>
    n.classList.toggle('active', n.dataset.view === view));
  content.innerHTML = '<div style="padding:64px 0;color:var(--text-3)">Loading…</div>';
  await loadData();
  content.innerHTML = '';
  await VIEWS[view](content, state);
  revealAll();
}

function revealAll() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.06 });
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
}

document.getElementById('nav').addEventListener('click', e => {
  const item = e.target.closest('.nav-item');
  if (item) navigate(item.dataset.view);
});

// Theme toggle (persisted)
const THEME_KEY = 'couponops-theme';
if (localStorage.getItem(THEME_KEY) === 'light') document.documentElement.setAttribute('data-theme', 'light');
document.getElementById('themeToggle').addEventListener('click', () => {
  const light = document.documentElement.getAttribute('data-theme') === 'light';
  if (light) { document.documentElement.removeAttribute('data-theme'); localStorage.setItem(THEME_KEY, 'dark'); }
  else { document.documentElement.setAttribute('data-theme', 'light'); localStorage.setItem(THEME_KEY, 'light'); }
});

navigate('deals');
