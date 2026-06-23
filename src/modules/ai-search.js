// AI Search Module — LuxCart
// Renders AI search results inline in the main products grid

import { createProductCard } from './ui.js';

export function initAISearch() {
  // Expose function for main search input to trigger
  window.doAISearch = async function(query) {
    if (!query) return;

    const grid = document.getElementById('products');
    if (!grid) return;

    // Show loading state
    grid.classList.add('loading');
    
    // Remove existing AI banner if any
    document.getElementById('ai-search-banner')?.remove();

    try {
      const res = await fetch('/api/rag-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      grid.classList.remove('loading');

      if (data.error) {
        console.error('AI Search error:', data.error);
        return;
      }

      // Add banner above grid
      if (data.reasoning) {
        const banner = document.createElement('div');
        banner.id = 'ai-search-banner';
        banner.className = 'ai-search-banner';
        banner.innerHTML = `
          <div class="ai-search-banner-text">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>
            <div>
              <strong>AI Picked for you:</strong>
              <p>${data.reasoning}</p>
            </div>
          </div>
          <button class="btn btn-outline btn-sm" id="clear-search">Clear</button>
        `;
        grid.parentNode.insertBefore(banner, grid);

        document.getElementById('clear-search').addEventListener('click', () => {
          banner.remove();
          document.getElementById('main-search-input').value = '';
          // trigger normal empty search to reset grid
          if (window.allProducts) {
             grid.innerHTML = '';
             window.allProducts.forEach(p => grid.appendChild(createProductCard(p)));
          }
        });
      }

      // Render AI selected products
      grid.innerHTML = '';
      if (data.products && data.products.length > 0) {
        // Map data.products to full product objects if possible
        const fullProducts = data.products.map(aiProd => {
           const fullP = window.allProducts?.find(p => p.name === aiProd.name) || aiProd;
           // If AI gave a specific reason, attach it temporarily
           if (aiProd.reason) fullP.ai_reason = aiProd.reason;
           return fullP;
        });
        
        fullProducts.forEach(p => {
          const card = createProductCard(p);
          // Insert the reason text below name
          if (p.ai_reason) {
            const reasonEl = document.createElement('div');
            reasonEl.style.fontSize = '0.75rem';
            reasonEl.style.color = 'var(--accent)';
            reasonEl.style.marginTop = '4px';
            reasonEl.style.lineHeight = '1.4';
            reasonEl.textContent = p.ai_reason;
            card.querySelector('.product-name').after(reasonEl);
          }
          grid.appendChild(card);
        });
      } else {
        grid.innerHTML = '<div class="products-empty">No AI recommendations found.</div>';
      }

      // Scroll to top of products
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (e) {
      grid.classList.remove('loading');
      console.error('Failed to connect to AI Search', e);
    }
  };
}
