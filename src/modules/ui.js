// UI Module — LuxCart
import { addToCart } from './cart.js';
import { toggleCompare } from './compare.js';

export function formatPrice(price) {
  return `₹${Number(price).toLocaleString('en-IN')}`;
}

export function showToast(type, title, message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  const iconSvg = {
    success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>',
    error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
    info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  };
  toast.innerHTML = `
    <div class="toast-icon ${type}">${iconSvg[type] || iconSvg.info}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('removing'); setTimeout(() => toast.remove(), 300); }, 3000);
}

export function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.dataset.category = product.category;

  const stars = '★'.repeat(Math.floor(product.rating)) + (product.rating % 1 >= 0.5 ? '½' : '');

  card.innerHTML = `
    <div class="product-image-wrap">
      <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'" />
      <div class="product-actions">
        <button class="product-action-btn quick-add-btn" data-id="${product.id}" aria-label="Add to Cart">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
        </button>
        <button class="product-action-btn compare-action" data-id="${product.id}" aria-label="Compare">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22V8"/><path d="m21 3-9 9"/><path d="M3 3l9 9"/></svg>
        </button>
        <button class="product-action-btn wishlist-action" data-id="${product.id}" aria-label="Wishlist">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </button>
      </div>
      <div class="product-quick-view">
        <button class="btn-quick-view" data-id="${product.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          Quick View
        </button>
      </div>
    </div>
    <div class="product-info">
      <div class="product-category">${product.category}</div>
      <h3 class="product-name">${product.name}</h3>
      <div class="product-rating">
        <span class="product-stars">${stars}</span>
        <span class="product-rating-count">(${product.reviews?.toLocaleString() || 0})</span>
      </div>
      <div class="product-price-row">
        <span class="product-price">${formatPrice(product.price)}</span>
      </div>
    </div>
  `;

  card.querySelector('.quick-add-btn')?.addEventListener('click', (e) => { e.stopPropagation(); addToCart(product); });
  card.querySelector('.btn-quick-view')?.addEventListener('click', (e) => { e.stopPropagation(); openProductModal(product); });
  card.querySelector('.compare-action')?.addEventListener('click', (e) => { e.stopPropagation(); toggleCompare(product); e.currentTarget.classList.toggle('active'); });

  return card;
}

let currentModalProduct = null, currentQty = 1;

export function openProductModal(product) {
  currentModalProduct = product; currentQty = 1;

  document.getElementById('modal-product-image').src = product.image;
  document.getElementById('modal-product-image').alt = product.name;
  document.getElementById('modal-product-category').textContent = product.category;
  document.getElementById('modal-product-name').textContent = product.name;
  document.getElementById('modal-product-description').textContent = product.description;
  document.getElementById('modal-product-price').textContent = formatPrice(product.price);

  const stars = '★'.repeat(Math.floor(product.rating)) + (product.rating % 1 >= 0.5 ? '½' : '');
  document.getElementById('modal-product-rating').innerHTML = `<span class="stars">${stars}</span> <span>${product.rating}</span> <span class="count">(${product.reviews?.toLocaleString() || 0} reviews)</span>`;

  document.getElementById('qty-value').textContent = currentQty;
  document.getElementById('product-modal').classList.add('active');
  document.getElementById('modal-overlay').classList.add('active');
  document.body.classList.add('no-scroll');
}

function closeProductModal() {
  document.getElementById('product-modal').classList.remove('active');
  document.getElementById('modal-overlay').classList.remove('active');
  document.body.classList.remove('no-scroll');
  currentModalProduct = null;
}

export function initUI() {
  document.getElementById('modal-close')?.addEventListener('click', closeProductModal);
  document.getElementById('modal-overlay')?.addEventListener('click', closeProductModal);
  document.getElementById('qty-minus')?.addEventListener('click', () => {
    if (currentQty > 1) { currentQty--; document.getElementById('qty-value').textContent = currentQty; }
  });
  document.getElementById('qty-plus')?.addEventListener('click', () => {
    currentQty++; document.getElementById('qty-value').textContent = currentQty;
  });
  document.getElementById('modal-add-to-cart')?.addEventListener('click', () => {
    if (currentModalProduct) { addToCart(currentModalProduct, currentQty); closeProductModal(); }
  });
}
