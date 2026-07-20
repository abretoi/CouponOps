// deals.js — Grocery Deals view: hero, market drill-down, category filters,
// product search, sort, AI refresh pill, ask-the-model bar, deal grid.

import { api, esc } from '../api.js';
import { toast } from '../app.js';
import { dealCard } from '../components/dealCard.js';

export default async function renderDeals(el, state) {
  const { data } = state;
  const markets = data.markets || [];
  const marketLookup = Object.fromEntries(markets.map(m => [m.id, m.label]));
  const cats = ['All', ...new Set(data.deals.map(d => d.cat))].sort((a, b) => a === 'All' ? -1 : a.localeCompare(b));

  const visibleFor = mkt => data.deals.filter(d =>
    mkt === 'all' || d.markets.includes('all') || d.markets.includes(mkt));

  el.innerHTML = `
  <section class="hero" data-reveal>
    <div class="eyebrow"><span class="pulse"></span>${esc(data.week || 'Weekly deals')} · ${data.deals.length} deals live</div>
    <h1 class="hero-h">Every stack. <em>Every market. Maximum savings.</em></h1>
    <p class="lede">Verified stackable coupon deals across ${markets.length - 1} US markets and ${new Set(data.deals.map(d => d.store)).size} retailers — store sale + manufacturer coupon + digital + rebate apps, layered the way the pros on KCL, Hip2Save, and Southern Savers run it.</p>
  </section>

  <div class="controls" data-reveal>
    <div class="ctrl-row">
      <div class="mkt-scroll" id="mktBar"></div>
    </div>
    <div class="ctrl-row">
      <div class="search-wrap">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="7" cy="7" r="5"/><path d="M14 14l-3.2-3.2"/></svg>
        <input class="search" id="searchInput" type="search" placeholder="Search products, stores, categories… (e.g. detergent, diapers, HEB)" value="${esc(state.query)}">
      </div>
      <select class="sel" id="sortSel">
        <option value="hot">Sort: Hottest</option>
        <option value="save">Sort: Biggest % saved</option>
        <option value="price">Sort: Lowest final price</option>
        <option value="store">Sort: By store</option>
      </select>
      <button class="refresh-pill" id="refreshBtn" title="Regenerate this market's deals from the current week via your AI model">
        <span class="spin"></span>↻ Refresh week
      </button>
    </div>
    <div class="ctrl-row" id="catBar"></div>
    <div class="ctrl-row" id="storeBar"></div>
  </div>

  <div class="ask-bar" data-reveal>
    <div class="search-wrap">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1.5l1.7 3.9 4.3.4-3.2 2.8 1 4.2L8 10.6l-3.8 2.2 1-4.2L2 5.8l4.3-.4z"/></svg>
      <input class="search" id="askInput" type="text" placeholder="Ask your AI model — 'cheapest diapers in Raleigh this week?'">
    </div>
    <button class="btn" id="askBtn">Ask AI</button>
  </div>
  <div class="ask-answer" id="askAnswer"></div>

  <div class="section-head">
    <h2 id="gridTitle">This week's deals</h2>
    <span class="count" id="gridCount"></span>
    <span class="rule"></span>
  </div>
  <div class="grid" id="grid"></div>`;

  const mktBar = el.querySelector('#mktBar');
  const catBar = el.querySelector('#catBar');
  const storeBar = el.querySelector('#storeBar');
  const grid = el.querySelector('#grid');

  function renderMarkets() {
    mktBar.innerHTML = markets.map(m => `
      <button class="chip ${state.market === m.id ? 'active' : ''}" data-mkt="${m.id}">
        ${m.emoji} ${esc(m.label)} <span class="cnt">${m.id === 'all' ? data.deals.length : visibleFor(m.id).length}</span>
      </button>`).join('');
  }

  function renderCats() {
    catBar.innerHTML = `<span class="filter-label">Category</span>` + cats.map(c => `
      <button class="chip ${state.cat === c ? 'active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
  }

  // Stores carried in the CURRENTLY selected market (and category), with the
  // count each contributes — this is the in-market drill-down.
  function storesForMarket() {
    const counts = {};
    for (const d of visibleFor(state.market)) {
      if (state.cat !== 'All' && d.cat !== state.cat) continue;
      counts[d.store] = (counts[d.store] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }

  function renderStores() {
    const list = storesForMarket();
    // The selected store may not exist in the new market/category — fall back.
    if (state.store !== 'All' && !list.some(([s]) => s === state.store)) state.store = 'All';
    const total = list.reduce((n, [, c]) => n + c, 0);
    storeBar.innerHTML =
      `<span class="filter-label">Store</span>` +
      `<button class="chip ${state.store === 'All' ? 'active' : ''}" data-store="All">All stores <span class="cnt">${total}</span></button>` +
      list.map(([s, c]) => `
        <button class="chip ${state.store === s ? 'active' : ''}" data-store="${esc(s)}">${esc(s)} <span class="cnt">${c}</span></button>`).join('');
  }

  function filtered() {
    const q = state.query.toLowerCase();
    let f = visibleFor(state.market).filter(d => {
      const cOk = state.cat === 'All' || d.cat === state.cat;
      const stOk = state.store === 'All' || d.store === state.store;
      const sOk = !q || [d.title, d.cat, d.store, d.badge, (d.stk || []).join(' ')].join(' ').toLowerCase().includes(q);
      return cOk && stOk && sOk;
    });
    if (state.sort === 'hot') f.sort((a, b) => b.hot - a.hot);
    else if (state.sort === 'save') f.sort((a, b) => b.sn - a.sn);
    else if (state.sort === 'price') f.sort((a, b) => a.fn - b.fn);
    else if (state.sort === 'store') f.sort((a, b) => a.store.localeCompare(b.store) || b.hot - a.hot);
    return f;
  }

  function renderGrid() {
    const f = filtered();
    el.querySelector('#gridCount').textContent = String(f.length).padStart(2, '0');
    const refreshedAt = data.refreshes?.[state.market];
    el.querySelector('#gridTitle').textContent = refreshedAt
      ? `Deals — AI-refreshed ${new Date(refreshedAt).toLocaleDateString()}`
      : "This week's deals";
    grid.innerHTML = f.length
      ? f.map(d => dealCard(d, marketLookup, data.sbg || {}, data.badgeStyle || {}, data.links || {}, data.couponSources || {})).join('')
      : '<p style="color:var(--text-3);padding:32px 0">No deals match. Try clearing filters — or hit Refresh to pull this market\'s current week.</p>';
    grid.querySelectorAll('[data-reveal]').forEach(c => c.classList.add('in'));
  }

  mktBar.addEventListener('click', e => {
    const b = e.target.closest('[data-mkt]');
    if (!b) return;
    state.market = b.dataset.mkt;
    localStorage.setItem('couponops-market', state.market);
    state.store = 'All';           // store list is market-scoped; reset on switch
    renderMarkets(); renderStores(); renderGrid();
  });
  catBar.addEventListener('click', e => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    state.cat = b.dataset.cat;
    renderCats(); renderStores(); renderGrid();
  });
  storeBar.addEventListener('click', e => {
    const b = e.target.closest('[data-store]');
    if (!b) return;
    state.store = b.dataset.store;
    renderStores(); renderGrid();
  });
  el.querySelector('#searchInput').addEventListener('input', e => { state.query = e.target.value; renderGrid(); });
  el.querySelector('#sortSel').value = state.sort;
  el.querySelector('#sortSel').addEventListener('change', e => { state.sort = e.target.value; renderGrid(); });

  grid.addEventListener('click', e => {
    if (e.target.closest('a')) return;
    const card = e.target.closest('.card');
    if (card) card.classList.toggle('open');
  });

  // Refresh pill — one market per call; requires a configured model.
  const refreshBtn = el.querySelector('#refreshBtn');
  refreshBtn.addEventListener('click', async () => {
    if (state.market === 'all') { toast('Pick a specific market first, then Refresh.'); return; }
    refreshBtn.disabled = true; refreshBtn.classList.add('busy');
    try {
      const r = await api.deals.refresh(state.market);
      toast(`Refreshed ${marketLookup[state.market]} — ${r.count} deals from your AI model.`);
      state.data = await api.deals.all();
      renderDeals(el, state); // re-render with fresh data
    } catch (err) {
      toast(`Refresh failed: ${err.message}`, 6000);
    } finally {
      refreshBtn.disabled = false; refreshBtn.classList.remove('busy');
    }
  });

  // Ask AI
  const askBtn = el.querySelector('#askBtn');
  const askInput = el.querySelector('#askInput');
  const askAnswer = el.querySelector('#askAnswer');
  async function ask() {
    const q = askInput.value.trim();
    if (!q) return;
    askBtn.disabled = true; askAnswer.classList.add('show'); askAnswer.textContent = 'Thinking…';
    try { askAnswer.textContent = (await api.ask(q, state.market)).answer; }
    catch (err) { askAnswer.textContent = `Error: ${err.message} — check Settings → API key.`; }
    finally { askBtn.disabled = false; }
  }
  askBtn.addEventListener('click', ask);
  askInput.addEventListener('keydown', e => { if (e.key === 'Enter') ask(); });

  renderMarkets(); renderCats(); renderStores(); renderGrid();
}
