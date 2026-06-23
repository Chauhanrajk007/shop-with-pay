// Admin Module â€” LuxCart
import { showToast, formatPrice } from './ui.js';
import { getToken, isLoggedIn, openAuth } from './auth.js';

let editingProductId = null;

function openAdmin() {
  if (!isLoggedIn()) { showToast('info', 'Login Required', 'Please login to access admin'); openAuth(); return; }
  document.getElementById('admin-overlay').classList.add('active');
  document.getElementById('admin-modal').classList.add('active');
  document.body.classList.add('no-scroll');
  document.getElementById('user-dropdown').classList.remove('active');
  fetchAdminProducts();
}

function closeAdmin() {
  document.getElementById('admin-overlay').classList.remove('active');
  document.getElementById('admin-modal').classList.remove('active');
  document.body.classList.remove('no-scroll');
}

async function fetchAdminProducts() {
  const loading = document.getElementById('admin-loading');
  const container = document.getElementById('admin-products');

  loading.style.display = 'flex';
  container.innerHTML = '';

  try {
    const res = await fetch('/api/admin?action=list', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const products = await res.json();
    loading.style.display = 'none';

    if (!Array.isArray(products) || products.length === 0) {
      container.innerHTML = '<p style="color: var(--text-tertiary); padding: 2rem; text-align: center;">No products found. Add your first product!</p>';
      return;
    }

    products.forEach(product => {
      const row = document.createElement('div');
      row.className = 'admin-product-row';
      row.innerHTML = `
        <div class="admin-product-info">
          <div class="admin-product-name">${product.name}</div>
          <div class="admin-product-meta">${product.category || ''} Â· ${product.brand || ''} Â· ${formatPrice(product.price)}</div>
        </div>
        <div class="admin-actions">
          <button class="admin-action-btn edit" aria-label="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
          </button>
          <button class="admin-action-btn delete" aria-label="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      `;
      row.querySelector('.edit').addEventListener('click', () => openAdminForm(product));
      row.querySelector('.delete').addEventListener('click', () => deleteProduct(product._id));
      container.appendChild(row);
    });
  } catch (err) {
    loading.style.display = 'none';
    container.innerHTML = '<p style="color: var(--error); padding: 2rem; text-align: center;">Failed to load products</p>';
  }
}

function openAdminForm(product) {
  editingProductId = product ? (product._id || product.id) : null;
  document.getElementById('admin-form-title').textContent = product ? 'Edit Product' : 'Add Product';
  document.getElementById('admin-product-name').value = product?.name || '';
  document.getElementById('admin-product-description').value = product?.description || '';
  document.getElementById('admin-product-category').value = product?.category || '';
  document.getElementById('admin-product-brand').value = product?.brand || '';
  document.getElementById('admin-product-price').value = product?.price || '';
  document.getElementById('admin-product-image').value = product?.image || '';
  document.getElementById('admin-form-overlay').classList.add('active');
  document.getElementById('admin-form-modal').classList.add('active');
}

function closeAdminForm() {
  document.getElementById('admin-form-overlay').classList.remove('active');
  document.getElementById('admin-form-modal').classList.remove('active');
  editingProductId = null;
  document.getElementById('admin-form').reset();
}

async function saveProduct(e) {
  e.preventDefault();
  const data = {
    name: document.getElementById('admin-product-name').value,
    description: document.getElementById('admin-product-description').value,
    category: document.getElementById('admin-product-category').value,
    brand: document.getElementById('admin-product-brand').value,
    price: document.getElementById('admin-product-price').value,
    image: document.getElementById('admin-product-image').value,
  };

  const action = editingProductId ? 'update' : 'add';
  if (editingProductId) data.id = editingProductId;

  try {
    const res = await fetch(`/api/admin?action=${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();

    if (result.error) { showToast('error', 'Error', result.error); return; }

    showToast('success', 'Saved', `Product ${action === 'add' ? 'added' : 'updated'} successfully`);
    closeAdminForm();
    fetchAdminProducts();
  } catch (err) {
    showToast('error', 'Error', 'Could not save product');
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const res = await fetch('/api/admin?action=delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ id })
    });
    const result = await res.json();

    if (result.error) { showToast('error', 'Error', result.error); return; }

    showToast('success', 'Deleted', 'Product removed');
    fetchAdminProducts();
  } catch (err) {
    showToast('error', 'Error', 'Could not delete product');
  }
}

export function initAdmin() {
  document.getElementById('admin-nav-btn')?.addEventListener('click', openAdmin);
  document.getElementById('admin-close')?.addEventListener('click', closeAdmin);
  document.getElementById('admin-overlay')?.addEventListener('click', closeAdmin);
  document.getElementById('admin-add-btn')?.addEventListener('click', () => openAdminForm(null));
  document.getElementById('admin-form-close')?.addEventListener('click', closeAdminForm);
  document.getElementById('admin-form-overlay')?.addEventListener('click', closeAdminForm);
  document.getElementById('admin-form')?.addEventListener('submit', saveProduct);
}

