/**
 * inventory.js
 * Handles fetching product data from Google Sheets (CSV) and rendering it.
 */

const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRsqpg0VRSudwbC2r9hImpf0wNjZdsjq04WIj9ZzmNu3U5VLh5DLe5EO83IPACUK1o1OunMXInkvBaP/pub?output=csv'; // User needs to replace this

async function fetchInventory() {
    try {
        const response = await fetch(GOOGLE_SHEET_CSV_URL);
        if (!response.ok) throw new Error('Failed to fetch inventory data');
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error('Error loading inventory:', error);
        return []; // Return empty array on error
    }
}

function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const entry = {};
        headers.forEach((header, index) => {
            entry[header] = values[index];
        });
        return entry;
    }).filter(item => item.Category); // Ensure it has at least a category
}

function renderProducts(products, filterCategory) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    grid.innerHTML = ''; // Clear existing items

    const filtered = products.filter(p => p.Category.toLowerCase() === filterCategory.toLowerCase());

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 4rem;">目前此分類尚無商品</p>';
        return;
    }

    filtered.forEach(product => {
        const item = document.createElement('div');
        item.className = 'product-item reveal active'; // Keep reveal active for immediate visibility or use script.js logic

        // Handle images stored locally vs external URLs
        const imgSrc = product.ImageURL.startsWith('http') ? product.ImageURL : `assets/images/${product.ImageURL}`;

        item.innerHTML = `
            <div class="product-image">
                <img src="${imgSrc}" alt="${product.Name}">
            </div>
            <div class="product-info">
                <h3>${product.Name}</h3>
                <p class="price">${product.Price}</p>
            </div>
        `;
        grid.appendChild(item);
    });
}

// Initialization Logic
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('cat') || 'furniture'; // Default to furniture

    // Update titles
    const titleMap = {
        'furniture': '柚木/實木傢俱',
        'chair': '單椅',
        'vintage': '古物選品'
    };

    const titleEl = document.getElementById('category-title');
    const subtitleEl = document.getElementById('category-subtitle');

    if (titleEl && titleMap[category]) {
        titleEl.textContent = titleMap[category];
    }
    if (subtitleEl) {
        subtitleEl.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    }

    // Fetch and Render
    const products = await fetchInventory();

    // Fallback Mock Data if URL is not set
    if (GOOGLE_SHEET_CSV_URL.includes('YOUR_GOOGLE_SHEET_CSV_URL_HERE') || products.length === 0) {
        console.warn('Using mock data because CSV URL is not configured.');
        const mockData = [
            { Category: 'furniture', Name: '經典實木單椅', Price: 'NT$ 12,800', ImageURL: 'chair.png' },
            { Category: 'furniture', Name: '復古黃銅桌燈', Price: 'NT$ 5,600', ImageURL: 'lamp.png' },
            { Category: 'chair', Name: '設計師扶手椅', Price: 'NT$ 15,000', ImageURL: 'chair.png' },
            { Category: 'vintage', Name: '古董花瓶', Price: 'NT$ 3,200', ImageURL: 'IMG_9271.JPG' }
        ];
        renderProducts(mockData, category);
    } else {
        renderProducts(products, category);
    }
});
