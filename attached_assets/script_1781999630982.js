let productsData = {
    cats: [],
    dogs: [],
    birds: [],
    fish: [],
    other: []
};

const WORKER_URL = 'https://kindom-upload-worker.imadedar98.workers.dev';

// Load products from D1 database
async function loadProductsFromDB() {
    console.log('Loading products from DB...');
    try {
        const response = await fetch(`${WORKER_URL}/products`);
        console.log('DB response status:', response.status);
        if (response.ok) {
            const dbProducts = await response.json();
            console.log('DB products raw data:', dbProducts);
            // Convert DB format to productsData format
            const grouped = {};
            dbProducts.forEach(p => {
                if (!grouped[p.category]) {
                    grouped[p.category] = [];
                }
                grouped[p.category].push({
                    id: p.id,
                    name: p.name,
                    category: p.category,
                    price: p.price,
                    description: p.description,
                    image: p.image_url,
                    inStock: p.in_stock === 1,
                    type: p.type
                });
            });
            console.log('DB products grouped:', grouped);
            return grouped;
        } else {
            console.error('DB response not OK:', response.status);
        }
    } catch (error) {
        console.error('Failed to load products from DB:', error);
    }
    return null;
}

// Load gallery from D1 database
async function loadGalleryFromDB() {
    try {
        const response = await fetch(`${WORKER_URL}/gallery`);
        if (response.ok) {
            const dbGallery = await response.json();
            // Convert DB format to galleryData format
            return dbGallery.map(g => ({
                id: g.id,
                image: g.image_url,
                alt: g.title || '',
                title: g.title || '',
                description: g.description || '',
                extraImages: g.extra_images ? JSON.parse(g.extra_images) : []
            }));
        }
    } catch (error) {
        console.error('Failed to load gallery from DB:', error);
    }
    return null;
}

// Filter products by category (for footer links)
function filterByCategory(category) {
    // Scroll to products section
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Wait a bit for scroll, then filter
    setTimeout(() => {
        // Click the corresponding tab
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            if (btn.getAttribute('data-category') === category) {
                btn.click();
            }
        });
    }, 300);
}

// Gallery Data (will be overridden by localStorage if available)
let galleryData = [];

// Load from localStorage if available (gallery only)
function loadDataFromStorage() {
    const savedGallery = localStorage.getItem('kindom_gallery');
    
    if (savedGallery) {
        galleryData = JSON.parse(savedGallery);
    }
}

// Load data on page load
loadDataFromStorage();

// Translations
const translations = {
    fr: {
        inStock: "En Stock",
        outOfStock: "Rupture de Stock",
        orderWhatsApp: "Commander via WhatsApp"
    },
    ar: {
        inStock: "متوفر",
        outOfStock: "غير متوفر",
        orderWhatsApp: "اطلب عبر واتساب"
    },
    en: {
        inStock: "In Stock",
        outOfStock: "Out of Stock",
        orderWhatsApp: "Order via WhatsApp"
    }
};

let currentLang = 'fr';

// DOM Elements
const preloader = document.getElementById('preloader');
const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const productsGrid = document.getElementById('productsGrid');
const galleryGrid = document.getElementById('galleryGrid');
const categoryTabs = document.querySelectorAll('.tab-btn');
const langBtns = document.querySelectorAll('.lang-btn');
const productModal = document.getElementById('productModal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.querySelector('.close-modal');

// Preloader
window.addEventListener('load', () => {
    // Remove preloader immediately when page loads
    preloader.classList.add('hidden');
});

// Fallback: Hide preloader after 3 seconds even if load event doesn't fire
setTimeout(() => {
    preloader.classList.add('hidden');
}, 3000);

// Also hide on DOMContentLoaded as backup
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        preloader.classList.add('hidden');
    }, 100);
});

// Navbar Scroll Effect (throttled for performance)
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(() => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        scrollTimeout = null;
    }, 16); // ~60fps
});

// Mobile Menu Toggle
menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Search Overlay
const searchBtn = document.getElementById('searchBtn');
const searchOverlay = document.getElementById('searchOverlay');
const searchClose = document.getElementById('searchClose');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

searchBtn.addEventListener('click', () => {
    console.log('Search button clicked');
    console.log('Current productsData:', productsData);
    const flatProducts = Object.values(productsData).flat();
    console.log('Total products count:', flatProducts.length);
    searchOverlay.classList.add('active');
    searchInput.focus();
    
    // Show error message if no products are available
    if (flatProducts.length === 0) {
        searchResults.innerHTML = '<div class="no-results">No products available. Database connection may be down.</div>';
    }
});

searchClose.addEventListener('click', () => {
    searchOverlay.classList.remove('active');
    searchInput.value = '';
    searchResults.innerHTML = '';
});

searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        searchResults.innerHTML = '';
    }
});

// Real-time search with product tags
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    console.log('Search input event fired. Query:', query);
    console.log('productsData:', productsData);

    if (query.length < 2) {
        searchResults.innerHTML = '';
        console.log('Query too short, clearing results');
        return;
    }

    // Use productsData which is loaded from DB
    const flatProducts = Object.values(productsData).flat();
    console.log('Flat products count:', flatProducts.length);
    
    if (flatProducts.length === 0) {
        console.log('No products available in productsData');
        searchResults.innerHTML = '<div class="no-results">No products available. Database connection may be down.</div>';
        return;
    }
    
    const filtered = flatProducts.filter(product => {
        if (!product) return false;
        const name = (product.name || '').toLowerCase();
        const description = (product.description || '').toLowerCase();
        const category = (product.category || '').toLowerCase();
        const type = (product.type || '').toLowerCase();
        
        return name.includes(query) || description.includes(query) || category.includes(query) || type.includes(query);
    });
    
    if (filtered.length === 0) {
        searchResults.innerHTML = '<div class="no-results">No products found</div>';
        console.log('No products found for query:', query);
        return;
    }

    console.log('Found', filtered.length, 'products for query:', query);
    searchResults.innerHTML = filtered.map(product => `
        <div class="search-result-item" onclick="showProductModal(${product.id}); document.getElementById('searchOverlay').classList.remove('active');">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <div class="search-result-info">
                <div class="search-result-name">${product.name}</div>
                <div class="search-result-meta">
                    <span class="search-result-tag">${product.type === 'food' ? 'Food' : 'Accessory'}</span>
                    <span class="search-result-tag">${product.category}</span>
                    <span class="search-result-price">${product.price} DZD</span>
                </div>
            </div>
        </div>
    `).join('');
});

// Pagination state
let currentPage = 1;
const productsPerPage = 8;

// Trending tracking
let productViews = JSON.parse(localStorage.getItem('kindom_product_views')) || {};
let productOrders = JSON.parse(localStorage.getItem('kindom_product_orders')) || {};

// Track product view
function trackProductView(productId) {
    const today = new Date().toISOString().split('T')[0];
    if (!productViews[productId]) {
        productViews[productId] = {};
    }
    if (!productViews[productId][today]) {
        productViews[productId][today] = 0;
    }
    productViews[productId][today]++;
    localStorage.setItem('kindom_product_views', JSON.stringify(productViews));
}

// Track product order (WhatsApp click)
function trackProductOrder(productId) {
    const today = new Date().toISOString().split('T')[0];
    if (!productOrders[productId]) {
        productOrders[productId] = {};
    }
    if (!productOrders[productId][today]) {
        productOrders[productId][today] = 0;
    }
    productOrders[productId][today]++;
    localStorage.setItem('kindom_product_orders', JSON.stringify(productOrders));
}

// Calculate trending score (last 30 days)
function getTrendingScore(productId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let viewScore = 0;
    let orderScore = 0;
    
    // Calculate views with decay
    if (productViews[productId]) {
        Object.entries(productViews[productId]).forEach(([date, count]) => {
            const viewDate = new Date(date);
            if (viewDate >= thirtyDaysAgo) {
                const daysDiff = Math.floor((new Date() - viewDate) / (1000 * 60 * 60 * 24));
                const decay = Math.max(0.1, 1 - (daysDiff / 30));
                viewScore += count * decay;
            }
        });
    }
    
    // Calculate orders with higher weight
    if (productOrders[productId]) {
        Object.entries(productOrders[productId]).forEach(([date, count]) => {
            const orderDate = new Date(date);
            if (orderDate >= thirtyDaysAgo) {
                const daysDiff = Math.floor((new Date() - orderDate) / (1000 * 60 * 60 * 24));
                const decay = Math.max(0.1, 1 - (daysDiff / 30));
                orderScore += count * 5 * decay; // Orders weighted 5x more
            }
        });
    }
    
    return viewScore + orderScore;
}

// Get trending products
function getTrendingProducts(limit = 6) {
    const allProducts = Object.values(productsData).flat();
    const trending = allProducts.map(product => ({
        ...product,
        trendingScore: getTrendingScore(product.id)
    })).sort((a, b) => b.trendingScore - a.trendingScore);
    
    return trending.slice(0, limit);
}

// Render trending products
function renderTrendingProducts() {
    const trendingGrid = document.getElementById('trendingGrid');
    if (!trendingGrid) return;
    
    const trendingProducts = getTrendingProducts(6);
    const trans = translations[currentLang];
    
    if (trendingProducts.length === 0) {
        trendingGrid.innerHTML = '<p style="text-align: center; color: #666;">No trending products yet</p>';
        return;
    }
    
    trendingGrid.innerHTML = trendingProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
            <span class="trending-badge"><i class="fas fa-fire"></i> Trending</span>
            <span class="stock-badge ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                ${product.inStock ? trans.inStock : trans.outOfStock}
            </span>
            <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
            <div class="product-info">
                <span class="product-category">${product.category} - ${product.type === 'food' ? 'Food' : 'Accessory'}</span>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <span class="product-price">${product.price}</span>
                <button class="whatsapp-order-btn" onclick="orderViaWhatsApp('${product.name}', '${product.price}', ${product.id})">
                    <i class="fab fa-whatsapp"></i> ${trans.orderWhatsApp}
                </button>
            </div>
        </div>
    `).join('');
    
    // Add click event to trending product cards
    document.querySelectorAll('#trendingGrid .product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.whatsapp-order-btn')) {
                const productId = card.getAttribute('data-id');
                showProductModal(productId);
            }
        });
    });
}

// Render Products (Food only) with pagination
function renderProducts(category, page = 1) {
    const products = productsData[category].filter(p => p.type === 'food');
    const trans = translations[currentLang];
    
    // Calculate pagination
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = products.slice(startIndex, endIndex);
    const totalPages = Math.ceil(products.length / productsPerPage);
    
    // Show loading state
    productsGrid.innerHTML = '<div class="loading-spinner">Loading...</div>';
    
    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
        let html = paginatedProducts.map(product => `
            <div class="product-card" data-id="${product.id}">
                <span class="stock-badge ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                    ${product.inStock ? trans.inStock : trans.outOfStock}
                </span>
                <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
                <div class="product-info">
                    <span class="product-category">${category}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <span class="product-price">${product.price}</span>
                    <button class="whatsapp-order-btn" onclick="orderViaWhatsApp('${product.name}', '${product.price}', ${product.id})">
                        <i class="fab fa-whatsapp"></i> ${trans.orderWhatsApp}
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add pagination controls if more than one page
        if (totalPages > 1) {
            html += `
                <div class="pagination-controls">
                    <button class="pagination-btn" ${page === 1 ? 'disabled' : ''} onclick="changePage('products', ${page - 1})">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <span class="pagination-info">${page} / ${totalPages}</span>
                    <button class="pagination-btn" ${page === totalPages ? 'disabled' : ''} onclick="changePage('products', ${page + 1})">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            `;
        }
        
        productsGrid.innerHTML = html;

        // Add click event to product cards
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.whatsapp-order-btn')) {
                    const productId = card.getAttribute('data-id');
                    showProductModal(productId);
                }
            });
        });
    });
}

// Change page function
function changePage(section, page) {
    currentPage = page;
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
        const category = activeTab.dataset.category;
        if (section === 'products') {
            renderProducts(category, page);
        } else if (section === 'accessories') {
            renderAccessories(category, page);
        }
    }
}

// Render Accessories with pagination
function renderAccessories(category, page = 1) {
    const accessories = productsData[category].filter(p => p.type === 'accessory');
    const trans = translations[currentLang];
    const accessoriesGrid = document.getElementById('accessoriesGrid');
    
    // Calculate pagination
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedAccessories = accessories.slice(startIndex, endIndex);
    const totalPages = Math.ceil(accessories.length / productsPerPage);
    
    // Show loading state
    accessoriesGrid.innerHTML = '<div class="loading-spinner">Loading...</div>';
    
    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
        let html = paginatedAccessories.map(product => `
            <div class="product-card" data-id="${product.id}">
                <span class="stock-badge ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                    ${product.inStock ? trans.inStock : trans.outOfStock}
                </span>
                <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
                <div class="product-info">
                    <span class="product-category">${category}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <span class="product-price">${product.price}</span>
                    <button class="whatsapp-order-btn" onclick="orderViaWhatsApp('${product.name}', '${product.price}', ${product.id})">
                        <i class="fab fa-whatsapp"></i> ${trans.orderWhatsApp}
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add pagination controls if more than one page
        if (totalPages > 1) {
            html += `
                <div class="pagination-controls">
                    <button class="pagination-btn" ${page === 1 ? 'disabled' : ''} onclick="changePage('accessories', ${page - 1})">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <span class="pagination-info">${page} / ${totalPages}</span>
                    <button class="pagination-btn" ${page === totalPages ? 'disabled' : ''} onclick="changePage('accessories', ${page + 1})">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            `;
        }
        
        accessoriesGrid.innerHTML = html;

        // Add click event to accessory cards
        document.querySelectorAll('#accessoriesGrid .product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.whatsapp-order-btn')) {
                    const productId = card.getAttribute('data-id');
                    showProductModal(productId);
                }
            });
        });
    });
}

// Show Product Modal
function showProductModal(productId) {
    const product = Object.values(productsData).flat().find(p => p.id == productId);
    const trans = translations[currentLang];
    
    // Track product view
    trackProductView(productId);
    
    if (product) {
        modalBody.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="modal-body-content">
                <span class="product-category">${product.category}</span>
                <h2>${product.name}</h2>
                <p>${product.description}</p>
                <div class="modal-body-footer">
                    <span class="modal-price">${product.price}</span>
                    <button class="whatsapp-order-btn" onclick="orderViaWhatsApp('${product.name}', '${product.price}', ${product.id})">
                        <i class="fab fa-whatsapp"></i> ${trans.orderWhatsApp}
                    </button>
                </div>
            </div>
        `;
        productModal.classList.add('active');
    }
}

// Close Modal
closeModal.addEventListener('click', () => {
    productModal.classList.remove('active');
});

productModal.addEventListener('click', (e) => {
    if (e.target === productModal) {
        productModal.classList.remove('active');
    }
});

// Category Tabs for Food
categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const category = tab.getAttribute('data-category');
        renderProducts(category);
    });
});

// Category Tabs for Accessories
const accessoryTabs = document.querySelectorAll('.tab-btn-acc');
accessoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        accessoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const category = tab.getAttribute('data-category');
        renderAccessories(category);
    });
});

// WhatsApp Order Function
function orderViaWhatsApp(productName, price, productId) {
    const messages = {
        fr: `Bonjour! Je suis intéressé(e) par la commande de: ${productName} - ${price} DZD`,
        ar: `مرحباً! أنا مهتم بطلب: ${productName} - ${price} DZD`,
        en: `Hello! I'm interested in ordering: ${productName} - ${price} DZD`
    };
    const message = messages[currentLang] || messages.fr;
    const whatsappURL = `https://wa.me/0657496125?text=${encodeURIComponent(message)}`;
    
    // Track product order
    if (productId) {
        trackProductOrder(productId);
    }
    
    window.open(whatsappURL, '_blank');
}

// Render Gallery
function renderGallery() {
    galleryGrid.innerHTML = galleryData.map(item => `
        <div class="gallery-item" onclick="showGalleryModal(${item.id})">
            <img src="${item.image}" alt="${item.alt}">
            <div class="gallery-text-overlay">
                ${item.title ? `<h3>${item.title}</h3>` : ''}
                ${item.description ? `<p>${item.description}</p>` : ''}
            </div>
            <div class="gallery-overlay">
                <i class="fas fa-search-plus"></i>
            </div>
        </div>
    `).join('');
}

// Gallery Modal & Carousel Logic
const galleryModal = document.getElementById('galleryModal');
const closeGalleryModalBtn = document.getElementById('closeGalleryModal');
const carouselTrack = document.getElementById('carouselTrack');
const carouselDotsContainer = document.getElementById('carouselDots');
const galleryModalTitle = document.getElementById('galleryModalTitle');
const galleryModalDescription = document.getElementById('galleryModalDescription');
const btnPrev = document.getElementById('carouselPrev');
const btnNext = document.getElementById('carouselNext');

let currentSlide = 0;
let currentAlbumImages = [];

function showGalleryModal(id) {
    const album = galleryData.find(item => item.id === id);
    if (!album) return;

    // Set text content
    galleryModalTitle.textContent = album.title || 'Untitled Album';
    galleryModalDescription.textContent = album.description || '';

    // Gather all images (cover + extras)
    currentAlbumImages = [album.image];
    if (album.extraImages && album.extraImages.length > 0) {
        currentAlbumImages = currentAlbumImages.concat(album.extraImages);
    }

    currentSlide = 0;
    renderCarousel();
    
    galleryModal.classList.add('active');
}

function renderCarousel() {
    // Render slides
    carouselTrack.innerHTML = currentAlbumImages.map(url => `
        <div class="carousel-slide">
            <img src="${url}" alt="Album Image">
        </div>
    `).join('');

    // Render dots
    if (currentAlbumImages.length > 1) {
        carouselDotsContainer.innerHTML = currentAlbumImages.map((_, index) => `
            <div class="carousel-dot ${index === currentSlide ? 'active' : ''}" onclick="goToSlide(${index})"></div>
        `).join('');
        btnPrev.style.display = 'flex';
        btnNext.style.display = 'flex';
        carouselDotsContainer.style.display = 'flex';
    } else {
        carouselDotsContainer.innerHTML = '';
        btnPrev.style.display = 'none';
        btnNext.style.display = 'none';
        carouselDotsContainer.style.display = 'none';
    }

    updateCarouselPosition();
}

function updateCarouselPosition() {
    carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Update dots
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function goToSlide(index) {
    currentSlide = index;
    updateCarouselPosition();
}

btnPrev.addEventListener('click', () => {
    currentSlide = (currentSlide > 0) ? currentSlide - 1 : currentAlbumImages.length - 1;
    updateCarouselPosition();
});

btnNext.addEventListener('click', () => {
    currentSlide = (currentSlide < currentAlbumImages.length - 1) ? currentSlide + 1 : 0;
    updateCarouselPosition();
});

closeGalleryModalBtn.addEventListener('click', () => {
    galleryModal.classList.remove('active');
});

galleryModal.addEventListener('click', (e) => {
    if (e.target === galleryModal) {
        galleryModal.classList.remove('active');
    }
});

// Language Switcher
langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        langBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const lang = btn.getAttribute('data-lang');
        currentLang = lang;
        changeLanguage(lang);
    });
});

function changeLanguage(lang) {
    // Change text content
    document.querySelectorAll('[data-' + lang + ']').forEach(element => {
        element.textContent = element.getAttribute('data-' + lang);
    });

    // Change placeholders
    document.querySelectorAll('[data-placeholder-' + lang + ']').forEach(element => {
        element.placeholder = element.getAttribute('data-placeholder-' + lang);
    });

    // Change body direction for Arabic
    if (lang === 'ar') {
        document.body.classList.add('rtl');
        document.documentElement.setAttribute('lang', 'ar');
        document.documentElement.setAttribute('dir', 'rtl');
    } else {
        document.body.classList.remove('rtl');
        document.documentElement.setAttribute('dir', 'ltr');
        if (lang === 'fr') {
            document.documentElement.setAttribute('lang', 'fr');
        } else {
            document.documentElement.setAttribute('lang', 'en');
        }
    }

    // Re-render products and accessories with new language
    const activeProductTab = document.querySelector('.tab-btn.active');
    if (activeProductTab) {
        const category = activeProductTab.getAttribute('data-category');
        renderProducts(category);
    }
    
    const activeAccessoryTab = document.querySelector('.tab-btn-acc.active');
    if (activeAccessoryTab) {
        const category = activeAccessoryTab.getAttribute('data-category');
        renderAccessories(category);
    }
}

// Security: Rate limiting for contact form
let contactFormSubmissions = 0;
let contactFormLocked = false;

// Contact Form
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Check rate limit
    if (contactFormLocked) {
        alert('Veuillez attendre avant de soumettre un autre message.');
        return;
    }
    
    const formData = new FormData(contactForm);
    const name = contactForm.querySelector('input[type="text"]').value;
    const email = contactForm.querySelector('input[type="email"]').value;
    const subject = contactForm.querySelectorAll('input[type="text"]')[1].value;
    const message = contactForm.querySelector('textarea').value;
    
    // Basic validation
    if (!name || !email || !subject || !message) {
        alert('Veuillez remplir tous les champs.');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Adresse email invalide.');
        return;
    }
    
    // Rate limiting
    contactFormSubmissions++;
    if (contactFormSubmissions >= 3) {
        contactFormLocked = true;
        setTimeout(() => {
            contactFormLocked = false;
            contactFormSubmissions = 0;
        }, 300000); // 5 minutes
    }
    
    // Send to WhatsApp
    const whatsappMessage = `Nouveau formulaire de contact:\n\nNom: ${name}\nEmail: ${email}\nSujet: ${subject}\nMessage: ${message}`;
    const whatsappURL = `https://wa.me/0657496125?text=${encodeURIComponent(whatsappMessage)}`;
    
    window.open(whatsappURL, '_blank');
    contactForm.reset();
    
    alert('Merci! Votre message a été envoyé via WhatsApp.');
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements
document.querySelectorAll('.product-card, .gallery-item, .info-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});

// Initialize
async function initializeApp() {
    console.log('Initializing app...');
    // Load products from D1 database only
    const dbProducts = await loadProductsFromDB();
    console.log('Products loaded:', dbProducts);
    if (dbProducts) {
        productsData = dbProducts;
        console.log('productsData set:', productsData);
        const flatProducts = Object.values(productsData).flat();
        console.log('Total products loaded:', flatProducts.length);
    } else {
        console.error('Failed to load products from database');
        alert('Failed to load products. Please check your connection or contact support.');
    }

    // Try to load gallery from D1 first
    const dbGallery = await loadGalleryFromDB();
    if (dbGallery) {
        galleryData = dbGallery;
    }

    // Check for search parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');

    if (searchQuery) {
        handleSearch(searchQuery);
    } else {
        renderTrendingProducts();
        renderProducts('cats');
        renderAccessories('cats');
        renderGallery();
    }

    console.log('App initialization complete. Final productsData:', productsData);
    
    // Clear any loading messages in search results
    const searchResultsElement = document.getElementById('searchResults');
    if (searchResultsElement && searchResultsElement.innerHTML.includes('Loading products')) {
        searchResultsElement.innerHTML = '';
    }
}

// Search functionality
function handleSearch(query) {
    const searchTerm = query.toLowerCase();
    const allProducts = Object.values(productsData).flat();
    const filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );

    if (filteredProducts.length === 0) {
        // Show no results message
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <h3 style="color: #666; margin-bottom: 1rem;">Aucun résultat pour "${query}"</h3>
                    <p style="color: #999;">Essayez avec d'autres termes de recherche</p>
                    <button onclick="window.location.href='index.html'" style="margin-top: 1rem; padding: 0.8rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Retour à l'accueil
                    </button>
                </div>
            `;
        }
    } else {
        // Display search results
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            const trans = translations[currentLang];
            productsGrid.innerHTML = filteredProducts.map(product => `
                <div class="product-card" data-id="${product.id}">
                    <span class="stock-badge ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                        ${product.inStock ? trans.inStock : trans.outOfStock}
                    </span>
                    <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
                    <div class="product-info">
                        <span class="product-category">${product.category}</span>
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-description">${product.description}</p>
                        <span class="product-price">${product.price}</span>
                        <button class="whatsapp-order-btn" onclick="orderViaWhatsApp('${product.name}', '${product.price}', ${product.id})">
                            <i class="fab fa-whatsapp"></i> ${trans.orderWhatsApp}
                        </button>
                    </div>
                </div>
            `).join('');
        }

        // Scroll to products section
        const productsSection = document.getElementById('products');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Still render other sections
    renderTrendingProducts();
    renderAccessories('cats');
    renderGallery();
}

initializeApp();

// Parallax Effect
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-shape');
    
    parallaxElements.forEach((el, index) => {
        const speed = (index + 1) * 0.5;
        el.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Add to cart animation (placeholder)
let cartCount = 0;
document.addEventListener('click', (e) => {
    if (e.target.closest('.whatsapp-order-btn')) {
        const cartBtn = document.querySelector('.cart-count');
        cartCount++;
        cartBtn.textContent = cartCount;
        cartBtn.style.animation = 'none';
        setTimeout(() => {
            cartBtn.style.animation = 'bounce 0.5s ease';
        }, 10);
    }
});

// Initialize accessories on page load
renderAccessories('cats');

console.log('Kindom Pet Store - Website Loaded Successfully! 🐾');
