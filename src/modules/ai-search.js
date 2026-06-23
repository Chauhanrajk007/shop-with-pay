// AI Search Module — LuxCart
// Full-screen AI search overlay (like Google AI mode / ChatGPT)

import { formatPrice } from './ui.js';
import { addToCart } from './cart.js';

function openAI() {
  document.getElementById('ai-fullscreen')?.classList.add('open');
  document.body.classList.add('no-scroll');
  document.getElementById('ai-fs-input')?.focus();
}

function closeAI() {
  document.getElementById('ai-fullscreen')?.classList.remove('open');
  document.body.classList.remove('no-scroll');
}

function appendMessage(role, html) {
  const body = document.getElementById('ai-fs-body');
  if (!body) return;
  // Hide welcome on first message
  const welcome = body.querySelector('.ai-fs-welcome');
  if (welcome) welcome.style.display = 'none';

  const msg = document.createElement('div');
  msg.className = `ai-fs-msg ai-fs-msg-${role}`;
  msg.innerHTML = html;
  body.appendChild(msg);
  body.scrollTop = body.scrollHeight;
}

function renderProductCards(products) {
  return `<div class="ai-fs-products">${products.map(p => `
    <div class="ai-fs-product-card" data-id="${p._id || p.id || ''}">
      <img src="${p.image || ''}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'" />
      <div class="ai-fs-product-info">
        <span class="ai-fs-product-brand">${p.brand || p.category || ''}</span>
        <h4>${p.name}</h4>
        <span class="ai-fs-product-price">${formatPrice(p.price)}</span>
        ${p.reason ? `<p class="ai-fs-product-reason">${p.reason}</p>` : ''}
      </div>
    </div>
  `).join('')}</div>`;
}

async function sendQuery() {
  const input = document.getElementById('ai-fs-input');
  const query = input?.value?.trim();
  if (!query) return;

  appendMessage('user', `<p>${query}</p>`);
  input.value = '';

  // Typing indicator
  const typingId = 'typing-' + Date.now();
  appendMessage('ai', `<div class="ai-fs-typing" id="${typingId}"><div class="ai-dot"></div><div class="ai-dot"></div><div class="ai-dot"></div></div>`);

  try {
    const res = await fetch('/api/rag-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();

    // Remove typing
    document.getElementById(typingId)?.closest('.ai-fs-msg')?.remove();

    if (data.error) {
      appendMessage('ai', `<p class="ai-fs-error">⚠️ ${data.error}</p>`);
      return;
    }

    let html = '';
    if (data.reasoning) html += `<p class="ai-fs-reasoning">${data.reasoning}</p>`;
    if (data.products?.length > 0) {
      html += renderProductCards(data.products);
    } else {
      html += `<p>No matching products found. Try rephrasing your query!</p>`;
    }
    appendMessage('ai', html);

  } catch (e) {
    document.getElementById(typingId)?.closest('.ai-fs-msg')?.remove();
    appendMessage('ai', `<p class="ai-fs-error">⚠️ Could not reach AI. Check your connection.</p>`);
  }

  const body = document.getElementById('ai-fs-body');
  if (body) body.scrollTop = body.scrollHeight;
}

export function initAISearch() {
  // Hero "Ask AI" button opens full-screen overlay
  document.getElementById('hero-ai-btn')?.addEventListener('click', openAI);

  // Close
  document.getElementById('ai-fs-close')?.addEventListener('click', closeAI);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAI(); });

  // Send
  document.getElementById('ai-fs-send')?.addEventListener('click', sendQuery);
  document.getElementById('ai-fs-input')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendQuery();
  });

  // Suggestion chips
  document.querySelectorAll('.ai-fs-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const input = document.getElementById('ai-fs-input');
      if (input) input.value = chip.dataset.query;
      sendQuery();
    });
  });
}
