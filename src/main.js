// Main Entry — LuxCart
import './style.css';
import { createProductCard, initUI } from './modules/ui.js';
import { initCart } from './modules/cart.js';
import { initAuth } from './modules/auth.js';
import { initAISearch } from './modules/ai-search.js';
import { initCompare } from './modules/compare.js';
import { initOrders } from './modules/orders.js';
import { initWishlist } from './modules/wishlist.js';
import {
  initRevealAnimations, initCursorGlow, initNavScroll, initPreloader,
} from './modules/animations.js';

// ─── State ────────────────────────────────────────────────────────────────────
let allProducts = [];
let activeFilter = 'all';
let searchQuery = '';

// ─── Fetch products from MongoDB ──────────────────────────────────────────────
async function fetchProducts() {
  try {
    const res = await fetch('/api/server?action=products');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const mappedData = data.map((p, i) => ({
        ...p,
        id: p._id || p.id || i,
        image: p.image || `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop`,
        rating: p.rating || 4.5,
        reviews: p.reviews || 500,
      }));
      window.allProducts = mappedData;
      return mappedData;
    }
  } catch (e) {
    console.warn('Could not fetch products from API:', e.message);
  }
  return [];
}

// ─── Render products ──────────────────────────────────────────────────────────
function renderProducts() {
  const grid = document.getElementById('products-grid');
  const empty = document.getElementById('products-empty');
  const title = document.getElementById('toolbar-title');
  const count = document.getElementById('toolbar-count');
  if (!grid) return;

  let filtered = allProducts;

  if (activeFilter !== 'all') {
    filtered = filtered.filter(p => p.category?.toLowerCase() === activeFilter.toLowerCase());
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
    title.textContent = `Results for "${searchQuery}"`;
  } else {
    title.textContent = activeFilter === 'all' ? 'All Products' : activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1);
  }

  count.textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;
  grid.innerHTML = '';

  if (filtered.length === 0) {
    empty.style.display = 'flex';
    return;
  }
  empty.style.display = 'none';

  filtered.forEach((product, i) => {
    const card = createProductCard(product);
    card.style.setProperty('--delay', `${Math.min(i * 0.04, 0.5)}s`);
    card.classList.add('reveal-up');
    grid.appendChild(card);
  });

  initRevealAnimations();
}

// ─── Search ───────────────────────────────────────────────────────────────────
function initSearch() {
  const navInput = document.getElementById('main-search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  const sendBtn = document.getElementById('search-send-btn');
  const clearSearchBtn = document.getElementById('clear-search');
  const aiModeBtn = document.getElementById('ai-mode-btn');

  let isAIEnabled = true;

  if (aiModeBtn) {
    aiModeBtn.addEventListener('click', () => {
      isAIEnabled = !isAIEnabled;
      if (isAIEnabled) {
        aiModeBtn.classList.add('active');
        navInput.placeholder = "Search products or ask AI...";
        sendBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="m22 2-11 11"/></svg>';
      } else {
        aiModeBtn.classList.remove('active');
        navInput.placeholder = "Search products...";
        sendBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>';
      }
    });
  }

  function doSearch(query) {
    searchQuery = query.toLowerCase().trim();
    if (clearSearchBtn) {
      if (searchQuery) clearSearchBtn.style.display = 'inline-flex';
      else clearSearchBtn.style.display = 'none';
    }
    if (clearBtn) {
      if (searchQuery) clearBtn.style.display = 'flex';
      else clearBtn.style.display = 'none';
    }
    renderProducts();
  }

  if (navInput) {
    navInput.addEventListener('input', (e) => {
      // Basic local filtering as you type
      doSearch(e.target.value);
    });
    navInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        if (isAIEnabled && window.doAISearch) {
          window.doAISearch(e.target.value);
        } else {
          doSearch(e.target.value);
        }
      }
    });
  }
  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      if (isAIEnabled && navInput && window.doAISearch) {
        window.doAISearch(navInput.value);
      } else if (navInput) {
        doSearch(navInput.value);
      }
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', () => { if (navInput) navInput.value = ''; doSearch(''); });
  }
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (navInput) navInput.value = '';
      doSearch('');
      // Also clear AI results if any
      const banner = document.getElementById('ai-search-banner');
      if (banner) banner.remove();
    });
  }
}

// ─── Filters ──────────────────────────────────────────────────────────────────
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter || 'all';
      renderProducts();
    });
  });
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
async function init() {
  await initPreloader();

  allProducts = await fetchProducts();
  renderProducts();

  initUI();
  initCart();
  initAuth();
  initAISearch();
  initCompare();
  initOrders();
  initWishlist();
  initSearch();
  initFilters();

  initCursorGlow();
  initNavScroll();
}

document.addEventListener('DOMContentLoaded', init);
