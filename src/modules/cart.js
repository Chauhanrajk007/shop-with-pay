// Cart Module â€” ShopWithPay (with Razorpay checkout)
import { showToast, formatPrice } from './ui.js';
import { getToken, isLoggedIn, openAuth } from './auth.js';

let cartItems = [];

export function getCart() { return cartItems; }

export function addToCart(product, quantity = 1, size = null, color = null) {
  const existingIndex = cartItems.findIndex(
    (item) => item.id === product.id && item.size === size && item.color === color
  );
  if (existingIndex >= 0) {
    cartItems[existingIndex].quantity += quantity;
  } else {
    cartItems.push({
      ...product, quantity,
      size: size || product.sizes?.[0] || 'One Size',
      color: color || product.colors?.[0] || '#000',
    });
  }
  updateCartUI();
  showToast('success', 'Added to Cart', `${product.name} has been added`);
}

export function removeFromCart(index) {
  const item = cartItems[index];
  cartItems.splice(index, 1);
  updateCartUI();
  showToast('info', 'Removed', `${item.name} removed from cart`);
}

export function updateQuantity(index, delta) {
  cartItems[index].quantity += delta;
  if (cartItems[index].quantity <= 0) { removeFromCart(index); return; }
  updateCartUI();
}

export function updateCartUI() {
  const cartCount = document.getElementById('cart-count');
  const cartItemCount = document.getElementById('cart-item-count');
  const cartBody = document.getElementById('cart-items');
  const cartEmpty = document.getElementById('cart-empty');
  const cartFooter = document.getElementById('cart-footer');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const cartTotal = document.getElementById('cart-total');

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartCount.textContent = totalItems;
  cartCount.classList.toggle('visible', totalItems > 0);
  cartItemCount.textContent = `(${totalItems})`;

  if (cartItems.length === 0) {
    cartEmpty.style.display = 'flex'; cartBody.style.display = 'none'; cartFooter.style.display = 'none';
  } else {
    cartEmpty.style.display = 'none'; cartBody.style.display = 'flex'; cartFooter.style.display = 'block';
  }

  cartBody.innerHTML = '';
  cartItems.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.style.animationDelay = `${index * 0.05}s`;
    el.innerHTML = `
      <div class="cart-item-image"><img src="${item.image}" alt="${item.name}" loading="lazy" /></div>
      <div class="cart-item-details">
        <div><div class="cart-item-name">${item.name}</div><div class="cart-item-variant">${item.size}</div></div>
        <div class="cart-item-bottom">
          <span class="cart-item-price">${formatPrice(item.price * item.quantity)}</span>
          <div class="cart-item-qty">
            <button data-action="minus" data-index="${index}" aria-label="Decrease quantity">âˆ’</button>
            <span>${item.quantity}</span>
            <button data-action="plus" data-index="${index}" aria-label="Increase quantity">+</button>
          </div>
        </div>
      </div>
    `;
    cartBody.appendChild(el);
  });

  cartBody.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      updateQuantity(parseInt(btn.dataset.index), btn.dataset.action === 'plus' ? 1 : -1);
    });
  });

  cartSubtotal.textContent = formatPrice(totalPrice);
  cartTotal.textContent = formatPrice(totalPrice);
}

export function openCart() {
  document.getElementById('cart-sidebar').classList.add('active');
  document.getElementById('cart-overlay').classList.add('active');
  document.body.classList.add('no-scroll');
}

export function closeCart() {
  document.getElementById('cart-sidebar').classList.remove('active');
  document.getElementById('cart-overlay').classList.remove('active');
  document.body.classList.remove('no-scroll');
}

async function handleCheckout() {
  if (!isLoggedIn()) {
    showToast('info', 'Login Required', 'Please login to checkout');
    closeCart();
    openAuth();
    return;
  }
  if (cartItems.length === 0) return;

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  try {
    const res = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total })
    });
    const data = await res.json();

    if (data.error) { showToast('error', 'Error', data.error); return; }

    const options = {
      key: data.key,
      amount: data.order.amount,
      currency: 'INR',
      name: 'LuxCart',
      description: `Order - ${cartItems.length} items`,
      order_id: data.order.id,
      handler: async function (response) {
        try {
          await fetch('/api/orders?action=create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
              items: cartItems.map(i => ({ name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
              amount: total,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id
            })
          });
          cartItems = [];
          updateCartUI();
          closeCart();
          showToast('success', 'Payment Successful!', 'Your order has been placed');
        } catch (err) {
          showToast('error', 'Error', 'Payment recorded but order save failed');
        }
      },
      theme: { color: '#c9a96e' }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    showToast('error', 'Error', 'Could not initiate payment');
  }
}

export function initCart() {
  document.getElementById('cart-btn').addEventListener('click', openCart);
  document.getElementById('cart-close').addEventListener('click', closeCart);
  document.getElementById('cart-overlay').addEventListener('click', closeCart);
  document.getElementById('checkout-btn').addEventListener('click', handleCheckout);
}

