// UI Module â€” ShopWithPay
import { products, newArrivals } from '../data/products.js';
import { addToCart } from './cart.js';
import { toggleCompare } from './compare.js';

let wishlist = new Set();

export function formatPrice(price) {
  return `â‚¹${Number(price).toLocaleString('en-IN')}`;
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

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const stars = 'â˜…'.repeat(Math.floor(product.rating)) + (product.rating % 1 >= 0.5 ? 'Â½' : '');
  const isWished = wishlist.has(product.id);

  card.innerHTML = `
    <div class="product-image-wrap">
      <img src="${product.image}" alt="${product.name}" loading="lazy" />
      ${product.badge ? `<span class="product-badge-tag ${product.badge}">${product.badge === 'new' ? 'New' : 'Sale'}</span>` : ''}
      <div class="product-actions">
        <button class="product-action-btn wishlist-action ${isWished ? 'wishlisted' : ''}" data-id="${product.id}" aria-label="Add to Wishlist">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWished ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </button>
        <button class="product-action-btn quick-add-btn" data-id="${product.id}" aria-label="Quick Add to Cart">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
        </button>
        <button class="product-action-btn compare-action" data-id="${product.id}" aria-label="Compare">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22V8"/><path d="m21 3-9 9"/><path d="M3 3l9 9"/></svg>
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
        <span class="product-rating-count">(${product.reviews})</span>
      </div>
      <div class="product-price-row">
        <span class="product-price">${formatPrice(product.price)}</span>
        ${product.originalPrice ? `<span class="product-original-price">${formatPrice(product.originalPrice)}</span>` : ''}
        ${discount > 0 ? `<span class="product-discount">-${discount}%</span>` : ''}
      </div>
    </div>
  `;

  card.querySelector('.quick-add-btn')?.addEventListener('click', (e) => { e.stopPropagation(); addToCart(product); });
  card.querySelector('.wishlist-action')?.addEventListener('click', (e) => { e.stopPropagation(); toggleWishlist(product.id, e.currentTarget); });
  card.querySelector('.btn-quick-view')?.addEventListener('click', (e) => { e.stopPropagation(); openProductModal(product); });
  card.querySelector('.compare-action')?.addEventListener('click', (e) => { e.stopPropagation(); toggleCompare(product); e.currentTarget.classList.toggle('active'); });

  return card;
}

function toggleWishlist(productId, btn) {
  if (wishlist.has(productId)) {
    wishlist.delete(productId); btn.classList.remove('wishlisted');
    btn.querySelector('svg').setAttribute('fill', 'none');
    showToast('info', 'Removed', 'Item removed from wishlist');
  } else {
    wishlist.add(productId); btn.classList.add('wishlisted');
    btn.querySelector('svg').setAttribute('fill', 'currentColor');
    showToast('success', 'Wishlisted', 'Item added to wishlist');
  }
  updateWishlistBadge();
}

function updateWishlistBadge() {
  const badge = document.getElementById('wishlist-count');
  badge.textContent = wishlist.size;
  badge.classList.toggle('visible', wishlist.size > 0);
}

let currentModalProduct = null, currentQty = 1, selectedSize = null, selectedColor = null;

export function openProductModal(product) {
  currentModalProduct = product; currentQty = 1;
  selectedSize = product.sizes?.[0] || null; selectedColor = product.colors?.[0] || null;

  document.getElementById('modal-product-image').src = product.image;
  document.getElementById('modal-product-image').alt = product.name;
  document.getElementById('modal-product-category').textContent = product.category;
  document.getElementById('modal-product-name').textContent = product.name;
  document.getElementById('modal-product-description').textContent = product.description;
  document.getElementById('modal-product-price').textContent = formatPrice(product.price);

  const origEl = document.getElementById('modal-product-original-price');
  if (product.originalPrice) { origEl.textContent = formatPrice(product.originalPrice); origEl.style.display = 'inline'; }
  else origEl.style.display = 'none';

  const stars = 'â˜…'.repeat(Math.floor(product.rating)) + (product.rating % 1 >= 0.5 ? 'Â½' : '');
  document.getElementById('modal-product-rating').innerHTML = `<span class="stars">${stars}</span> <span>${product.rating}</span> <span class="count">(${product.reviews} reviews)</span>`;

  const sizeOptions = document.getElementById('size-options');
  sizeOptions.innerHTML = '';
  product.sizes?.forEach((size) => {
    const btn = document.createElement('button');
    btn.className = `size-option${size === selectedSize ? ' selected' : ''}`;
    btn.textContent = size;
    btn.addEventListener('click', () => {
      selectedSize = size;
      sizeOptions.querySelectorAll('.size-option').forEach((s) => s.classList.remove('selected'));
      btn.classList.add('selected');
    });
    sizeOptions.appendChild(btn);
  });

  const colorOptions = document.getElementById('color-options');
  colorOptions.innerHTML = '';
  product.colors?.forEach((color) => {
    const btn = document.createElement('button');
    btn.className = `color-option${color === selectedColor ? ' selected' : ''}`;
    btn.style.backgroundColor = color;
    btn.addEventListener('click', () => {
      selectedColor = color;
      colorOptions.querySelectorAll('.color-option').forEach((c) => c.classList.remove('selected'));
      btn.classList.add('selected');
    });
    colorOptions.appendChild(btn);
  });

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

// Search is now handled by ai-search.js (search button opens AI panel directly)

function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const grid = document.getElementById('products-grid');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const cards = grid.querySelectorAll('.product-card');
      cards.forEach((card, i) => {
        const category = card.dataset.category;
        const shouldShow = filter === 'all' || category === filter;
        if (shouldShow) { card.style.display = ''; card.style.animation = `fadeInUp 0.5s ${i * 0.05}s var(--ease-out) both`; }
        else card.style.display = 'none';
      });
    });
  });
}

function initCarousel() {
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');
  if (!track) return;

  newArrivals.forEach((product) => { track.appendChild(createProductCard(product)); });
  let currentSlide = 0;
  const getVisibleCount = () => {
    if (window.innerWidth > 1024) return 4;
    if (window.innerWidth > 768) return 3;
    if (window.innerWidth > 480) return 2;
    return 1;
  };
  const totalDots = () => Math.ceil(newArrivals.length / getVisibleCount());

  function renderDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalDots(); i++) {
      const dot = document.createElement('button');
      dot.className = `carousel-dot${i === currentSlide ? ' active' : ''}`;
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
  }
  function goToSlide(idx) {
    currentSlide = Math.max(0, Math.min(idx, totalDots() - 1));
    const cards = track.querySelectorAll('.product-card');
    if (cards.length === 0) return;
    const cardWidth = cards[0].offsetWidth + 24;
    track.style.transform = `translateX(-${currentSlide * getVisibleCount() * cardWidth}px)`;
    renderDots();
  }
  prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
  renderDots();
  window.addEventListener('resize', () => goToSlide(0));
}

export function initUI() {
  document.getElementById('modal-close').addEventListener('click', closeProductModal);
  document.getElementById('modal-overlay').addEventListener('click', closeProductModal);
  document.getElementById('qty-minus').addEventListener('click', () => {
    if (currentQty > 1) { currentQty--; document.getElementById('qty-value').textContent = currentQty; }
  });
  document.getElementById('qty-plus').addEventListener('click', () => {
    currentQty++; document.getElementById('qty-value').textContent = currentQty;
  });
  document.getElementById('modal-add-to-cart').addEventListener('click', () => {
    if (currentModalProduct) { addToCart(currentModalProduct, currentQty, selectedSize, selectedColor); closeProductModal(); }
  });
  document.getElementById('modal-wishlist').addEventListener('click', () => {
    if (currentModalProduct) toggleWishlist(currentModalProduct.id, document.getElementById('modal-wishlist'));
  });
  document.getElementById('newsletter-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletter-email').value;
    if (email) { showToast('success', 'Subscribed!', 'Welcome to LuxCart club'); document.getElementById('newsletter-email').value = ''; }
  });
  initFilters(); initCarousel();
}

