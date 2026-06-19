// AI Search Module — ShopWithPay
import { showToast, formatPrice } from './ui.js';
import { addToCart } from './cart.js';

export function initAISearch() {
  const pill = document.getElementById('ai-pill');
  const panel = document.getElementById('ai-panel');
  const closeBtn = document.getElementById('ai-panel-close');
  const input = document.getElementById('ai-input');
  const sendBtn = document.getElementById('ai-send-btn');
  const voiceBtn = document.getElementById('ai-voice-btn');
  const triggerBtn = document.getElementById('ai-trigger-btn');
  const heroBtn = document.getElementById('hero-ai-btn');

  if (pill) pill.addEventListener('click', openPanel);
  if (triggerBtn) triggerBtn.addEventListener('click', openPanel);
  if (heroBtn) heroBtn.addEventListener('click', openPanel);
  if (closeBtn) closeBtn.addEventListener('click', closePanel);
  if (sendBtn) sendBtn.addEventListener('click', sendQuery);
  if (input) input.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendQuery(); });
  if (voiceBtn) voiceBtn.addEventListener('click', startVoice);

  // Suggestion chips
  document.querySelectorAll('.ai-suggestion').forEach((chip) => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.query;
      sendQuery();
    });
  });
}

function openPanel() {
  document.getElementById('ai-panel').classList.add('active');
  document.getElementById('ai-pill').classList.add('hidden');
  setTimeout(() => document.getElementById('ai-input').focus(), 300);
}

function closePanel() {
  document.getElementById('ai-panel').classList.remove('active');
  document.getElementById('ai-pill').classList.remove('hidden');
}

async function sendQuery() {
  const input = document.getElementById('ai-input');
  const query = input.value.trim();
  if (!query) return;

  const greeting = document.getElementById('ai-greeting');
  const results = document.getElementById('ai-results');
  const loading = document.getElementById('ai-loading');

  greeting.style.display = 'none';
  results.innerHTML = '';
  loading.style.display = 'flex';

  try {
    const res = await fetch('/api/rag-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    loading.style.display = 'none';

    if (data.error) {
      results.innerHTML = `<div class="ai-error"><p>Sorry, something went wrong. Please try again.</p></div>`;
      return;
    }

    if (!data.products || data.products.length === 0) {
      results.innerHTML = `<div class="ai-no-results"><p>No products found for "${query}". Try different keywords!</p></div>`;
      return;
    }

    // Show AI reasoning summary
    if (data.reasoning) {
      const summaryEl = document.createElement('div');
      summaryEl.className = 'ai-summary';
      summaryEl.innerHTML = `<div class="ai-summary-icon">✦</div><p>${data.reasoning}</p>`;
      results.appendChild(summaryEl);
    }

    // Render product cards
    data.products.forEach((product, i) => {
      const card = document.createElement('div');
      card.className = 'ai-result-card';
      card.style.animationDelay = `${i * 0.1}s`;
      card.innerHTML = `
        <div class="ai-result-top">
          <img class="ai-result-image" src="${product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop&q=80'}" alt="${product.name}" />
          <div class="ai-result-info">
            <div class="ai-result-name">${product.name}</div>
            <div class="ai-result-meta">${product.brand || product.category || ''}</div>
            <div class="ai-result-price">${formatPrice(product.price)}</div>
          </div>
        </div>
        ${product.reason ? `<div class="ai-result-reason"><span class="reason-label">✦ Why this:</span> ${product.reason}</div>` : ''}
        <button class="btn btn-primary ai-result-buy">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          <span>Add to Cart</span>
        </button>
      `;
      card.querySelector('.ai-result-buy').addEventListener('click', () => {
        addToCart({ ...product, sizes: ['One Size'], colors: ['#1a1a2e'], id: product._id || product.id || Date.now() });
      });
      results.appendChild(card);
    });
  } catch (err) {
    loading.style.display = 'none';
    results.innerHTML = `<div class="ai-error"><p>Connection error. Make sure the server is running.</p></div>`;
  }

  input.value = '';
}

function startVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { showToast('error', 'Not Supported', 'Voice input not supported in this browser'); return; }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  const voiceBtn = document.getElementById('ai-voice-btn');

  recognition.start();
  voiceBtn.classList.add('listening');

  recognition.onresult = (e) => {
    const text = e.results[0][0].transcript;
    document.getElementById('ai-input').value = text;
    voiceBtn.classList.remove('listening');
    sendQuery();
  };

  recognition.onerror = () => {
    voiceBtn.classList.remove('listening');
    showToast('error', 'Voice Error', 'Could not understand. Try again.');
  };

  recognition.onend = () => { voiceBtn.classList.remove('listening'); };
}
