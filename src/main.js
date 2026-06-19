// Main Entry — ShopWithPay
import './style.css';
import { collections, products, newArrivals } from './data/products.js';
import { createProductCard, initUI } from './modules/ui.js';
import { initCart } from './modules/cart.js';
import { initAuth } from './modules/auth.js';
import { initAISearch } from './modules/ai-search.js';
import { initCompare } from './modules/compare.js';
import { initOrders } from './modules/orders.js';
import { initAdmin } from './modules/admin.js';
import {
  initRevealAnimations, initCounterAnimation, initParticles,
  initCursorGlow, initNavScroll, initMobileMenu, initCountdown,
  initSmoothScroll, initPreloader, initTiltEffect,
} from './modules/animations.js';

function renderCollections() {
  const grid = document.getElementById('collections-grid');
  if (!grid) return;
  collections.forEach((col, i) => {
    const card = document.createElement('div');
    card.className = 'collection-card reveal-up';
    card.style.setProperty('--delay', `${i * 0.1}s`);
    card.innerHTML = `
      <img src="${col.image}" alt="${col.name}" loading="lazy" />
      <div class="collection-overlay">
        <div class="collection-info">
          <h3 class="collection-name">${col.name}</h3>
          <span class="collection-count">${col.count} Products</span>
        </div>
        <a href="#trending" class="collection-link">
          Explore
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
      </div>
    `;
    grid.appendChild(card);
  });
}

async function renderProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  let productList = products;

  // Try to fetch from API first
  try {
    const res = await fetch('/api/server?action=products');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      productList = data.map((p, i) => ({
        ...p,
        id: p._id || p.id || i,
        image: p.image || products[i % products.length]?.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=650&fit=crop&q=80',
        sizes: p.sizes || ['One Size'],
        colors: p.colors || ['#1a1a2e'],
        badge: p.badge || (i % 3 === 0 ? 'new' : i % 3 === 1 ? 'sale' : ''),
        originalPrice: p.originalPrice || (i % 2 === 0 ? Math.round(p.price * 1.3) : null),
        rating: p.rating || 4.5,
        reviews: p.reviews || Math.floor(Math.random() * 5000 + 500),
      }));
    }
  } catch {
    // Use local fallback data
  }

  productList.forEach((product, i) => {
    const card = createProductCard(product);
    card.style.setProperty('--delay', `${i * 0.05}s`);
    card.classList.add('reveal-up');
    grid.appendChild(card);
  });
}

async function init() {
  await initPreloader();

  renderCollections();
  await renderProducts();

  initUI();
  initCart();
  initAuth();
  initAISearch();
  initCompare();
  initOrders();
  initAdmin();

  initRevealAnimations();
  initCounterAnimation();
  initParticles();
  initCursorGlow();
  initNavScroll();
  initMobileMenu();
  initCountdown();
  initSmoothScroll();

  setTimeout(initTiltEffect, 200);
}

document.addEventListener('DOMContentLoaded', init);
