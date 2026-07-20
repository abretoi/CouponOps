// sources.js — the trusted deal-source ecosystem: blogs, Instagram, Facebook
// groups, forums, and rebate apps that feed the AI refresh prompt.

import { api, esc } from '../api.js';

// Each source type takes one stop on the blue ramp.
const TYPE_STYLE = {
  site:      ['var(--ocean)',     'Site',           'ocean'],
  instagram: ['var(--sky)',       'Instagram',      'sky'],
  facebook:  ['var(--blue)',      'Facebook Group', 'blue'],
  forum:     ['var(--navy)',      'Forum',          'navy'],
  app:       ['var(--turquoise)', 'App',            'turquoise'],
};

export default async function renderSources(el) {
  const { sources = [] } = await api.deals.sources();
  const groups = [...new Set(sources.map(s => s.type))];

  el.innerHTML = `
  <section class="hero" data-reveal>
    <div class="eyebrow"><span class="pulse"></span>${sources.length} trusted sources</div>
    <h1 class="hero-h">The deal <em>intelligence network.</em></h1>
    <p class="lede">Every blog, Instagram account, Facebook group, forum, and rebate app CouponOps draws from. These are baked into the AI refresh prompt — add a source in <span style="font-family:var(--mono)">data/sources.json</span> and every future refresh uses it.</p>
  </section>
  ${groups.map(type => {
    const [color, label, pillar] = TYPE_STYLE[type] || ['var(--ocean)', type, 'ocean'];
    const items = sources.filter(s => s.type === type);
    return `
    <div class="section-head" data-reveal>
      <h2>${esc(label)}s</h2><span class="count">${String(items.length).padStart(2, '0')}</span><span class="rule"></span>
    </div>
    <div class="src-grid" data-reveal>
      ${items.map(s => `
      <a class="card" data-pillar="${pillar}" href="${esc(s.url)}" target="_blank" rel="noopener" style="cursor:pointer">
        <span class="type-pill" style="color:${color};background:color-mix(in oklab, ${color} 12%, transparent);border-color:color-mix(in oklab, ${color} 30%, var(--line))">${esc(label)}${s.tier === 'essential' ? ' · essential' : ''}</span>
        <h3>${esc(s.name)}</h3>
        <p style="font-size:var(--fs-small)">${esc(s.focus)}</p>
        <p style="font-size:var(--fs-micro);color:var(--text-4);font-family:var(--mono);margin-top:var(--s-2);overflow:hidden;text-overflow:ellipsis">${esc(s.url.replace('https://', ''))}</p>
      </a>`).join('')}
    </div>`;
  }).join('')}`;
}
