// AI Search Module — LuxCart
// Only the inline "Ask AI" button beside search bar → shows results below hero

import { formatPrice } from './ui.js';

// ─── Inline AI Results (below hero) ──────────────────────────────────────────

function renderInlineResults(data) {
  const section = document.getElementById('ai-results-section');
  const grid = document.getElementById('ai-results-grid');
  const reasoning = document.getElementById('ai-reasoning-text');
  const loading = document.getElementById('ai-loading');

  if (loading) loading.style.display = 'none';

  if (!data || data.error) {
    reasoning.textContent = data?.error || 'Something went wrong.';
    grid.innerHTML = '';
    return;
  }

  reasoning.textContent = data.reasoning || '';

  grid.innerHTML = (data.products || []).map(p => `
    <div class="ai-result-card">
      <img src="${p.image || ''}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'" />
      <div class="ai-result-info">
        <span class="ai-result-brand">${p.brand || p.category || ''}</span>
        <h4 class="ai-result-name">${p.name}</h4>
        <span class="ai-result-price">${formatPrice(p.price)}</span>
        ${p.reason ? `<p class="ai-result-reason">${p.reason}</p>` : ''}
      </div>
    </div>
  `).join('');
}

async function doAISearch(query) {
  const section = document.getElementById('ai-results-section');
  const loading = document.getElementById('ai-loading');
  const grid = document.getElementById('ai-results-grid');

  section.style.display = 'block';
  if (loading) loading.style.display = 'flex';
  grid.innerHTML = '';

  section.scrollIntoView({ behavior: 'smooth', block: 'start' });

  try {
    const res = await fetch('/api/rag-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    renderInlineResults(data);
  } catch (e) {
    renderInlineResults({ error: 'Could not reach AI. Check your connection.' });
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initAISearch() {
  const heroAiBtn = document.getElementById('hero-ai-btn');
  const heroInput = document.getElementById('hero-search-input');

  // "Ask AI" button click
  if (heroAiBtn) {
    heroAiBtn.addEventListener('click', () => {
      const q = heroInput?.value?.trim();
      if (q) doAISearch(q);
    });
  }

  // Shift+Enter triggers AI search from the hero input
  if (heroInput) {
    heroInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        const q = heroInput.value.trim();
        if (q) doAISearch(q);
      }
    });
  }

  // Close inline results
  document.getElementById('ai-results-close')?.addEventListener('click', () => {
    document.getElementById('ai-results-section').style.display = 'none';
  });
}
