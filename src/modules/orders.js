// Orders Module â€” LuxCart
import { showToast, formatPrice } from './ui.js';
import { getToken, isLoggedIn, openAuth } from './auth.js';

function openOrders() {
  if (!isLoggedIn()) { showToast('info', 'Login Required', 'Please login to view orders'); openAuth(); return; }
  document.getElementById('orders-overlay').classList.add('active');
  document.getElementById('orders-modal').classList.add('active');
  document.body.classList.add('no-scroll');
  document.getElementById('user-dropdown').classList.remove('active');
  fetchOrders();
}

function closeOrders() {
  document.getElementById('orders-overlay').classList.remove('active');
  document.getElementById('orders-modal').classList.remove('active');
  document.body.classList.remove('no-scroll');
}

async function fetchOrders() {
  const loading = document.getElementById('orders-loading');
  const empty = document.getElementById('orders-empty');
  const list = document.getElementById('orders-list');

  loading.style.display = 'flex';
  empty.style.display = 'none';
  list.innerHTML = '';

  try {
    const res = await fetch('/api/orders?action=list', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const orders = await res.json();
    loading.style.display = 'none';

    if (!Array.isArray(orders) || orders.length === 0) {
      empty.style.display = 'flex';
      return;
    }

    orders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
      const card = document.createElement('div');
      card.className = 'order-card';
      card.innerHTML = `
        <div class="order-card-header">
          <div>
            <div class="order-id">Order #${(order._id || '').toString().slice(-8).toUpperCase()}</div>
            <div class="order-date">${date}</div>
          </div>
          <span class="order-status ${order.status}">${order.status}</span>
        </div>
        <div class="order-items">
          ${(order.items || []).map(item => `
            <div class="order-item">
              <img src="${item.image || ''}" alt="${item.name}" />
              <div class="order-item-info">
                <span class="order-item-name">${item.name}</span>
                <span class="order-item-qty">x${item.quantity}</span>
              </div>
              <span class="order-item-price">${formatPrice(item.price * item.quantity)}</span>
            </div>
          `).join('')}
        </div>
        <div class="order-total">
          <span>Total</span>
          <span>${formatPrice(order.amount)}</span>
        </div>
      `;
      list.appendChild(card);
    });
  } catch (err) {
    loading.style.display = 'none';
    empty.style.display = 'flex';
  }
}

export function initOrders() {
  document.getElementById('orders-nav-btn')?.addEventListener('click', openOrders);
  document.getElementById('orders-close')?.addEventListener('click', closeOrders);
  document.getElementById('orders-overlay')?.addEventListener('click', closeOrders);
}

export { openOrders };

