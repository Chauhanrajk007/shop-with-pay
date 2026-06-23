import { showToast, formatPrice } from './ui.js';

let wishlist = JSON.parse(localStorage.getItem('luxcart_wishlist')) || [];

export function initWishlist() {
  updateWishlistCount();
  setupWishlistModal();

  // Delegation for wishlist buttons on product cards
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.wishlist-action');
    if (btn) {
      const id = btn.dataset.id;
      toggleWishlist(id, btn);
    }
  });

  // Highlight already wishlisted items on load
  document.querySelectorAll('.wishlist-action').forEach(btn => {
    if (wishlist.includes(btn.dataset.id)) {
      btn.classList.add('wishlisted');
    }
  });
}

export function toggleWishlist(id, btnElement) {
  const index = wishlist.indexOf(id);
  if (index > -1) {
    wishlist.splice(index, 1);
    if (btnElement) btnElement.classList.remove('wishlisted');
    showToast('info', 'Removed', 'Item removed from wishlist');
  } else {
    wishlist.push(id);
    if (btnElement) btnElement.classList.add('wishlisted');
    showToast('success', 'Wishlisted', 'We will alert you on price drops!');
  }
  
  localStorage.setItem('luxcart_wishlist', JSON.stringify(wishlist));
  updateWishlistCount();
  renderWishlist();
}

function updateWishlistCount() {
  const badge = document.getElementById('wishlist-count');
  if (wishlist.length > 0) {
    badge.textContent = wishlist.length;
    badge.style.display = 'block';
  } else {
    badge.style.display = 'none';
  }
}

function setupWishlistModal() {
  const btn = document.getElementById('wishlist-btn');
  const modal = document.getElementById('wishlist-modal');
  const overlay = document.getElementById('wishlist-overlay');
  const closeBtn = document.getElementById('wishlist-close');

  if (!btn || !modal) return;

  const openModal = () => {
    renderWishlist();
    modal.classList.add('active');
    overlay.classList.add('active');
  };

  const closeModal = () => {
    modal.classList.remove('active');
    overlay.classList.remove('active');
  };

  btn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
}

function renderWishlist() {
  const body = document.getElementById('wishlist-body');
  if (!body) return;

  if (wishlist.length === 0) {
    body.innerHTML = `
      <div class="wishlist-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3" style="margin: 0 auto 10px"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        <p>Your wishlist is empty</p>
      </div>`;
    return;
  }

  const items = wishlist.map(id => window.allProducts?.find(p => String(p.id) === String(id))).filter(Boolean);
  
  body.innerHTML = items.map(p => `
    <div class="wishlist-item">
      <img src="${p.image}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop'" />
      <div class="wishlist-item-info">
        <div class="wishlist-item-name">${p.name}</div>
        <div class="wishlist-item-price">${formatPrice(p.price)}</div>
        <div class="wishlist-item-alert">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          Price drop alert active
        </div>
      </div>
      <button class="wishlist-item-remove" data-id="${p.id}" aria-label="Remove">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  `).join('');

  // Add listeners to remove buttons
  body.querySelectorAll('.wishlist-item-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      // also toggle UI button off in main view
      const mainBtn = document.querySelector(`.wishlist-action[data-id="${id}"]`);
      toggleWishlist(id, mainBtn);
    });
  });
}
