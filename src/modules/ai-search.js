// AI Search Module — LuxCart (floating chat panel)

function showToast(type, title, msg) {
  const tc = document.getElementById('toast-container');
  if (!tc) return;
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<strong>${title}</strong><span>${msg}</span>`;
  tc.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

function appendMessage(role, html) {
  const messages = document.getElementById('ai-results');
  if (!messages) return;
  const msg = document.createElement('div');
  msg.className = `ai-message ai-message-${role}`;
  msg.innerHTML = html;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
}

function renderProductCards(products) {
  return products.map(p => `
    <div class="ai-product-card" data-id="${p._id || p.id || ''}">
      <img src="${p.image || ''}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&h=120&fit=crop'" />
      <div class="ai-product-info">
        <span class="ai-product-name">${p.name}</span>
        <span class="ai-product-price">₹${Number(p.price).toLocaleString('en-IN')}</span>
        ${p.reason ? `<span class="ai-product-reason">${p.reason}</span>` : ''}
      </div>
    </div>
  `).join('');
}

async function sendQuery() {
  const input = document.getElementById('ai-input');
  const loading = document.getElementById('ai-loading');
  const sendBtn = document.getElementById('ai-send-btn');

  const query = input?.value?.trim();
  if (!query) return;

  // Show user message
  appendMessage('user', `<span>${query}</span>`);
  input.value = '';

  if (loading) loading.style.display = 'flex';
  if (sendBtn) sendBtn.disabled = true;

  try {
    const res = await fetch('/api/rag-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();

    if (data.error) {
      appendMessage('ai', `<span class="ai-error">⚠️ ${data.error}</span>`);
    } else {
      let html = '';
      if (data.reasoning) {
        html += `<p class="ai-reasoning">${data.reasoning}</p>`;
      }
      if (data.products?.length > 0) {
        html += `<div class="ai-products-grid">${renderProductCards(data.products)}</div>`;
      } else {
        html += `<span>I couldn't find specific products for that. Try rephrasing!</span>`;
      }
      appendMessage('ai', html);
    }
  } catch (e) {
    appendMessage('ai', `<span class="ai-error">⚠️ Could not reach AI. Check your connection.</span>`);
  } finally {
    if (loading) loading.style.display = 'none';
    if (sendBtn) sendBtn.disabled = false;
    const messages = document.getElementById('ai-results');
    if (messages) messages.scrollTop = messages.scrollHeight;
  }
}

export function initAISearch() {
  const fab = document.getElementById('ai-fab');
  const panel = document.getElementById('ai-panel');
  const closeBtn = document.getElementById('ai-panel-close');
  const sendBtn = document.getElementById('ai-send-btn');
  const input = document.getElementById('ai-input');

  function openPanel() {
    panel?.classList.add('open');
    fab?.classList.add('hidden');
    input?.focus();
  }

  function closePanel() {
    panel?.classList.remove('open');
    fab?.classList.remove('hidden');
  }

  if (fab) fab.addEventListener('click', openPanel);
  if (closeBtn) closeBtn.addEventListener('click', closePanel);
  if (sendBtn) sendBtn.addEventListener('click', sendQuery);
  if (input) {
    input.addEventListener('keypress', e => { if (e.key === 'Enter') sendQuery(); });
  }

  // Suggestion chips
  document.querySelectorAll('.ai-suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.query;
      const inp = document.getElementById('ai-input');
      if (inp) inp.value = q;
      sendQuery();
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePanel();
  });
}
