// Compare Module â€” LuxCart
import { showToast, formatPrice } from './ui.js';

let compareList = [];

export function toggleCompare(product) {
  const idx = compareList.findIndex(p => (p.id || p._id) === (product.id || product._id));
  if (idx >= 0) {
    compareList.splice(idx, 1);
    showToast('info', 'Removed', `${product.name} removed from comparison`);
  } else {
    if (compareList.length >= 3) {
      showToast('error', 'Max 3', 'You can compare up to 3 products');
      return;
    }
    compareList.push(product);
    showToast('success', 'Added', `${product.name} added to comparison`);
  }
  updateCompareBar();
}

function updateCompareBar() {
  const bar = document.getElementById('compare-bar');
  const count = document.getElementById('compare-count');
  count.textContent = compareList.length;
  if (compareList.length > 0) {
    bar.style.display = 'flex';
    setTimeout(() => bar.classList.add('visible'), 10);
  } else {
    bar.classList.remove('visible');
    setTimeout(() => { bar.style.display = 'none'; }, 400);
  }
}

function clearCompare() {
  compareList = [];
  updateCompareBar();
  document.querySelectorAll('.compare-action.active').forEach(btn => btn.classList.remove('active'));
  showToast('info', 'Cleared', 'Comparison list cleared');
}

async function openCompareModal() {
  if (compareList.length < 2) { showToast('error', 'Need More', 'Select at least 2 products'); return; }

  const overlay = document.getElementById('compare-overlay');
  const modal = document.getElementById('compare-modal');
  const loading = document.getElementById('compare-loading');
  const body = document.getElementById('compare-body');

  overlay.classList.add('active');
  modal.classList.add('active');
  document.body.classList.add('no-scroll');
  loading.style.display = 'flex';
  body.innerHTML = '';

  try {
    const res = await fetch('/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: compareList })
    });
    const data = await res.json();
    loading.style.display = 'none';

    if (data.error) { body.innerHTML = `<p style="color: var(--error); padding: 2rem; text-align: center;">${data.error}</p>`; return; }

    renderComparison(data, body);
  } catch (err) {
    loading.style.display = 'none';
    // Fallback â€” render basic comparison without AI
    renderBasicComparison(body);
  }
}

function renderComparison(data, container) {
  const productNames = compareList.map(p => p.name);
  let html = '<div class="compare-table-wrap"><table class="compare-table"><thead><tr><th>Feature</th>';
  productNames.forEach(name => { html += `<th>${name}</th>`; });
  html += '</tr></thead><tbody>';

  // Product images row
  html += '<tr><td><strong>Product</strong></td>';
  compareList.forEach(p => {
    html += `<td><img class="compare-product-img" src="${p.image || ''}" alt="${p.name}" /></td>`;
  });
  html += '</tr>';

  // Feature rows from AI
  if (data.features && data.comparison) {
    data.features.forEach(feature => {
      html += `<tr><td><strong>${feature}</strong></td>`;
      productNames.forEach(name => {
        const value = data.comparison[feature]?.[name] || 'â€”';
        html += `<td>${value}</td>`;
      });
      html += '</tr>';
    });
  }

  html += '</tbody></table></div>';

  // Verdict
  if (data.verdict) {
    html += `<div class="compare-verdict"><div class="compare-verdict-icon">âœ¦</div><p>${data.verdict}</p></div>`;
  }

  container.innerHTML = html;
}

function renderBasicComparison(container) {
  const features = ['Price', 'Category', 'Brand', 'Rating', 'Reviews', 'Description'];
  const productNames = compareList.map(p => p.name);

  let html = '<div class="compare-table-wrap"><table class="compare-table"><thead><tr><th>Feature</th>';
  productNames.forEach(name => { html += `<th>${name}</th>`; });
  html += '</tr></thead><tbody>';

  html += '<tr><td><strong>Product</strong></td>';
  compareList.forEach(p => { html += `<td><img class="compare-product-img" src="${p.image || ''}" alt="${p.name}" /></td>`; });
  html += '</tr>';

  features.forEach(feature => {
    html += `<tr><td><strong>${feature}</strong></td>`;
    compareList.forEach(p => {
      let val = 'â€”';
      if (feature === 'Price') val = formatPrice(p.price);
      else if (feature === 'Category') val = p.category || 'â€”';
      else if (feature === 'Brand') val = p.brand || 'â€”';
      else if (feature === 'Rating') val = `${p.rating}/5 â˜…`;
      else if (feature === 'Reviews') val = p.reviews?.toLocaleString() || '0';
      else if (feature === 'Description') val = p.description || 'â€”';
      html += `<td>${val}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;
}

function closeCompareModal() {
  document.getElementById('compare-overlay').classList.remove('active');
  document.getElementById('compare-modal').classList.remove('active');
  document.body.classList.remove('no-scroll');
}

export function initCompare() {
  document.getElementById('compare-clear-btn')?.addEventListener('click', clearCompare);
  document.getElementById('compare-open-btn')?.addEventListener('click', openCompareModal);
  document.getElementById('compare-close')?.addEventListener('click', closeCompareModal);
  document.getElementById('compare-overlay')?.addEventListener('click', closeCompareModal);
}

