// settings.js — AI provider + model + API key management. Keys are stored
// server-side in data/config.json (gitignored) and come back masked; a masked
// value is never re-saved (server filters values containing '••').

import { api, esc } from '../api.js';
import { toast, updateModelChip, state } from '../app.js';

export default async function renderSettings(el) {
  const cfg = state.config || await api.config.get();
  const providers = cfg.providers || {};

  el.innerHTML = `
  <section class="hero" data-reveal>
    <div class="eyebrow"><span class="pulse"></span>AI Engine</div>
    <h1 class="hero-h">Flip between <em>any model you want.</em></h1>
    <p class="lede">Pick a provider, paste its API key once, and every Refresh and Ask-AI call flows through it. Switch providers any time — each key is remembered separately.</p>
  </section>

  <div class="panel" data-reveal>
    <h3>Active model</h3>
    <p class="desc">This provider + model powers deal refreshes and questions.</p>
    <div class="provider-grid">
      <div class="field">
        <label for="provSel">Provider</label>
        <select id="provSel">${Object.entries(providers).map(([id, p]) =>
          `<option value="${id}" ${cfg.aiProvider === id ? 'selected' : ''}>${esc(p.label)}</option>`).join('')}</select>
      </div>
      <div class="field">
        <label for="modelInput">Model</label>
        <input id="modelInput" list="modelList" value="${esc(cfg.aiModel || '')}" placeholder="pick or type a model id">
        <datalist id="modelList"></datalist>
      </div>
      <div class="field" id="baseField" style="display:none">
        <label for="baseInput">Base URL (Ollama / custom)</label>
        <input id="baseInput" value="${esc(cfg.aiBaseUrl || '')}" placeholder="http://localhost:11434/v1">
      </div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn" id="saveActive">Save active model</button>
      <button class="btn ghost" id="testBtn">Test connection</button>
    </div>
    <div class="status-line" id="testStatus"></div>
  </div>

  <div class="section-head" data-reveal><h2>API Keys</h2><span class="rule"></span></div>
  <div class="provider-grid" data-reveal>
    ${Object.entries(providers).filter(([, p]) => p.needsKey).map(([id, p]) => `
    <div class="panel" style="margin-bottom:0">
      <h3 style="font-size:15px">${esc(p.label)}</h3>
      <div class="field" style="margin-bottom:var(--s-3)">
        <label for="key-${id}">API key</label>
        <input id="key-${id}" type="password" data-provider="${id}" value="${esc(cfg.aiKeys?.[id] || '')}" placeholder="paste key — stored locally only" autocomplete="off">
      </div>
      <button class="btn ghost" data-savekey="${id}" style="font-size:12.5px;padding:7px 14px">Save key</button>
    </div>`).join('')}
  </div>

  <div class="section-head" data-reveal><h2>Data</h2><span class="rule"></span></div>
  <div class="panel" data-reveal>
    <h3>Reset AI-refreshed deals</h3>
    <p class="desc">Drops all AI-refreshed weeks and returns every market to the curated seed snapshot.</p>
    <button class="btn ghost" id="resetLive">Revert all markets to seed data</button>
  </div>`;

  const provSel = el.querySelector('#provSel');
  const modelInput = el.querySelector('#modelInput');
  const modelList = el.querySelector('#modelList');
  const baseField = el.querySelector('#baseField');

  function syncProviderUI() {
    const p = providers[provSel.value] || { models: [] };
    modelList.innerHTML = p.models.map(m => `<option value="${esc(m)}">`).join('');
    if (!modelInput.value || !p.models.includes(modelInput.value)) modelInput.value = p.models[0] || '';
    baseField.style.display = ['ollama', 'custom'].includes(provSel.value) ? '' : 'none';
  }
  provSel.addEventListener('change', syncProviderUI);
  syncProviderUI();
  if (cfg.aiModel) modelInput.value = cfg.aiModel;

  el.querySelector('#saveActive').addEventListener('click', async () => {
    try {
      await api.config.save({ aiProvider: provSel.value, aiModel: modelInput.value.trim(), aiBaseUrl: el.querySelector('#baseInput')?.value.trim() || '' });
      state.config = await api.config.get();
      updateModelChip();
      toast(`Active model: ${provSel.value} · ${modelInput.value.trim()}`);
    } catch (e) { toast(`Save failed: ${e.message}`); }
  });

  el.querySelectorAll('[data-savekey]').forEach(btn => btn.addEventListener('click', async () => {
    const id = btn.dataset.savekey;
    const val = el.querySelector(`#key-${id}`).value.trim();
    if (!val) { toast('Paste a key first.'); return; }
    try {
      await api.config.save({ aiKeys: { [id]: val } });
      toast(`${providers[id].label} key saved.`);
      state.config = await api.config.get();
    } catch (e) { toast(`Save failed: ${e.message}`); }
  }));

  const testStatus = el.querySelector('#testStatus');
  el.querySelector('#testBtn').addEventListener('click', async () => {
    testStatus.className = 'status-line'; testStatus.textContent = 'Testing…';
    try {
      const r = await api.config.test();
      testStatus.className = 'status-line ok';
      testStatus.textContent = r.ok ? `✓ Connected — model replied: ${r.reply}` : `Model replied unexpectedly: ${r.reply}`;
    } catch (e) {
      testStatus.className = 'status-line err';
      testStatus.textContent = `✗ ${e.message}`;
    }
  });

  el.querySelector('#resetLive').addEventListener('click', async () => {
    try {
      await api.deals.clearRefresh('all');
      state.data = null;
      toast('All markets reverted to seed data.');
    } catch (e) { toast(e.message); }
  });
}
