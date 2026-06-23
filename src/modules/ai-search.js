// AI Search Module — ShopWithPay
import { showToast, formatPrice } from './ui.js';
import { addToCart } from './cart.js';

export function initAISearch() {
  const panel     = document.getElementById('ai-panel');
  const closeBtn  = document.getElementById('ai-panel-close');
  const input     = document.getElementById('ai-input');
  const sendBtn   = document.getElementById('ai-send-btn');
  const voiceBtn  = document.getElementById('ai-voice-btn');

  // All elements with class .ai-trigger open the panel (nav icon + search icon)
  document.querySelectorAll('.ai-trigger').forEach((btn) => {
    btn.addEventListener('click', openPanel);
  });

  // Hero CTA button
  const heroBtn = document.getElementById('hero-ai-btn');
  if (heroBtn) heroBtn.addEventListener('click', openPanel);

  if (closeBtn) closeBtn.addEventListener('click', closePanel);
  if (sendBtn)  sendBtn.addEventListener('click',  sendQuery);
  if (input)    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendQuery(); });
  if (voiceBtn) voiceBtn.addEventListener('click',  startVoice);

  // Suggestion chips
  document.querySelectorAll('.ai-suggestion').forEach((chip) => {
    chip.addEventListener('click', () => {
      const inp = document.getElementById('ai-input');
      if (inp) { inp.value = chip.dataset.query; sendQuery(); }
    });
  });

  // Close on backdrop click
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });
}

function openPanel() {
  const panel = document.getElementById('ai-panel');
  if (panel) panel.classList.add('active');
  setTimeout(() => {
    const input = document.getElementById('ai-input');
    if (input) input.focus();
  }, 300);
}

function closePanel() {
  const panel = document.getElementById('ai-panel');
  if (panel) panel.classList.remove('active');
}

async function sendQuery() {
  const input    = document.getElementById('ai-input');
  const query    = input?.value?.trim();
  if (!query) return;

  const greeting = document.getElementById('ai-greeting');
  const results  = document.getElementById('ai-results');
  const loading  = document.getElementById('ai-loading');

  if (greeting) greeting.style.display = 'none';
  if (results)  results.innerHTML = '';
  if (loading)  loading.style.display = 'flex';

  try {
    const res = await fetch('/api/rag-search', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ query }),
    });
    const data = await res.json();
    if (loading) loading.style.display = 'none';

    if (data.error) {
      results.innerHTML = `<div class="ai-error"><p>⚠️ ${data.error}</p><p style="margin-top:8px;font-size:13px;opacity:.7">Make sure your Gemini API key is correct and the Generative Language API is enabled in Google Cloud Console.</p></div>`;
      return;
    }

    if (!data.products || data.products.length === 0) {
      results.innerHTML = `<div class="ai-no-results"><p>No products found for "<strong>${query}</strong>". Try different keywords!</p></div>`;
      return;
    }

    // AI reasoning summary
    if (data.reasoning) {
      const summaryEl = document.createElement('div');
      summaryEl.className = 'ai-summary';
      summaryEl.innerHTML = `<div class="ai-summary-icon">✦</div><p>${data.reasoning}</p>`;
      results.appendChild(summaryEl);
    }

    // Product cards
    data.products.forEach((product, i) => {
      const price = product.price ?? 0;
      const card  = document.createElement('div');
      card.className = 'ai-result-card';
      card.style.animationDelay = `${i * 0.07}s`;
      card.innerHTML = `
        <div class="ai-result-top">
          <img class="ai-result-image"
               src="${product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop&q=80'}"
               alt="${product.name}"
               onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop&q=80'" />
          <div class="ai-result-info">
            <div class="ai-result-name">${product.name}</div>
            <div class="ai-result-meta">${product.brand || product.category || ''}</div>
            <div class="ai-result-price">${formatPrice(price)}</div>
          </div>
        </div>
        ${product.reason ? `<div class="ai-result-reason"><span class="reason-label">✦ Why this:</span> ${product.reason}</div>` : ''}
        <button class="btn btn-primary ai-result-buy">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          <span>Add to Cart</span>
        </button>
      `;
      card.querySelector('.ai-result-buy').addEventListener('click', () => {
        addToCart({
          ...product,
          sizes:  product.sizes  || ['One Size'],
          colors: product.colors || ['#1a1a2e'],
          id:     product._id   || product.id || Date.now(),
        });
        showToast('success', 'Added!', `${product.name} added to cart`);
      });
      results.appendChild(card);
    });
  } catch (err) {
    if (loading) loading.style.display = 'none';
    results.innerHTML = `<div class="ai-error"><p>Connection error. Is the Vercel deployment live?</p></div>`;
    console.error('AI search error:', err);
  }

  if (input) input.value = '';
}

function startVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast('error', 'Not Supported', 'Voice input not supported in this browser');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  const voiceBtn = document.getElementById('ai-voice-btn');

  recognition.start();
  if (voiceBtn) voiceBtn.classList.add('listening');

  recognition.onresult = (e) => {
    const text = e.results[0][0].transcript;
    const inp  = document.getElementById('ai-input');
    if (inp) inp.value = text;
    if (voiceBtn) voiceBtn.classList.remove('listening');
    sendQuery();
  };

  recognition.onerror = () => {
    if (voiceBtn) voiceBtn.classList.remove('listening');
    showToast('error', 'Voice Error', 'Could not understand. Try again.');
  };

  recognition.onend = () => {
    if (voiceBtn) voiceBtn.classList.remove('listening');
  };
}
