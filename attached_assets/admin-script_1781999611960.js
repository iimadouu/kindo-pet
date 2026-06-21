// Sample Data (in real app, this would come from a database)
let products = [];

let gallery = [];

// Load data from localStorage or use defaults
function loadFromStorage() {
    const savedProducts = localStorage.getItem('kindom_products');
    const savedGallery = localStorage.getItem('kindom_gallery');
    
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    }
    if (savedGallery) {
        gallery = JSON.parse(savedGallery);
    }
}

// Activity tracking
let activities = [];

function loadActivities() {
    const savedActivities = localStorage.getItem('kindom_activities');
    if (savedActivities) {
        activities = JSON.parse(savedActivities);
    }
}

function saveActivities() {
    localStorage.setItem('kindom_activities', JSON.stringify(activities));
}

function addActivity(type, message) {
    const activity = {
        id: Date.now(),
        type: type, // 'add', 'edit', 'delete', 'order'
        message: message,
        timestamp: new Date().toISOString()
    };
    activities.unshift(activity); // Add to beginning
    if (activities.length > 10) {
        activities = activities.slice(0, 10); // Keep only last 10
    }
    saveActivities();
    loadActivities();
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

function loadActivitiesDisplay() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    if (activities.length === 0) {
        activityList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No recent activity</p>';
        return;
    }
    
    const icons = {
        add: 'fa-plus-circle',
        edit: 'fa-edit',
        delete: 'fa-trash',
        order: 'fa-shopping-cart'
    };
    
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <i class="fas ${icons[activity.type] || 'fa-circle'}"></i>
            <span>${activity.message}</span>
            <span class="activity-time">${formatTime(activity.timestamp)}</span>
        </div>
    `).join('');
}

// Save data to localStorage
function saveToStorage() {
    localStorage.setItem('kindom_products', JSON.stringify(products));
    localStorage.setItem('kindom_gallery', JSON.stringify(gallery));
}

// Products API (D1 Database)
async function loadProductsFromDB() {
    try {
        const response = await fetch(`${WORKER_URL}/products`);
        if (response.ok) {
            return await response.json();
        } else {
            console.error('Products API returned error:', response.status);
        }
    } catch (error) {
        console.error('Failed to load products from DB:', error);
    }
    return null;
}

async function saveProductToDB(product) {
    try {
        const method = product.id ? 'PUT' : 'POST';
        const response = await fetch(`${WORKER_URL}/products`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error('Failed to save product to DB:', response.status, error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Failed to save product to DB:', error);
        return false;
    }
}

async function deleteProductFromDB(id) {
    try {
        const response = await fetch(`${WORKER_URL}/products`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error('Failed to delete product from DB:', response.status, error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Failed to delete product from DB:', error);
        return false;
    }
}

// Gallery API (D1 Database)
async function loadGalleryFromDB() {
    try {
        const response = await fetch(`${WORKER_URL}/gallery`);
        console.log('Gallery fetch response status:', response.status);
        if (response.ok) {
            const dbGallery = await response.json();
            console.log('Gallery data from DB:', dbGallery);
            // Convert DB format to gallery array format
            return dbGallery.map(g => {
                console.log('Processing gallery item:', g);
                const item = {
                    id: g.id,
                    image: g.image_url,
                    alt: g.alt_text || '',
                    title: g.title || '',
                    description: g.description || '',
                    extraImages: []
                };

                // Parse extra_images if it exists
                if (g.extra_images) {
                    try {
                        item.extraImages = JSON.parse(g.extra_images);
                        console.log('Parsed extraImages for item:', g.id, item.extraImages);
                    } catch (e) {
                        console.error('Failed to parse extra_images for item:', g.id, e);
                        item.extraImages = [];
                    }
                }

                return item;
            });
        } else {
            console.error('Gallery fetch failed with status:', response.status);
        }
    } catch (error) {
        console.error('Failed to load gallery from DB:', error);
    }
    return null;
}

async function saveGalleryToDB(galleryItem) {
    try {
        const method = galleryItem.id ? 'PUT' : 'POST';

        // Ensure extraImages is an array and properly JSON stringified
        let extraImagesValue = null;
        if (galleryItem.extraImages) {
            // Convert to array if it's a string
            const imagesArray = Array.isArray(galleryItem.extraImages) ? galleryItem.extraImages : [];
            if (imagesArray.length > 0) {
                extraImagesValue = JSON.stringify(imagesArray);
            }
        }

        console.log('Sending to API:', {
            extraImages: galleryItem.extraImages,
            extraImagesValue: extraImagesValue,
            isArray: Array.isArray(galleryItem.extraImages)
        });

        const response = await fetch(`${WORKER_URL}/gallery`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: galleryItem.id,
                image_url: galleryItem.image,
                title: galleryItem.title || 'Untitled',
                title_ar: null,
                title_en: null,
                description: galleryItem.description || null,
                description_ar: null,
                description_en: null,
                alt_text: galleryItem.alt || galleryItem.title || 'Gallery Image',
                category: galleryItem.category || null,
                display_order: galleryItem.displayOrder || 0,
                extra_images: extraImagesValue
            })
        });

        console.log('API response status:', response.status);
        const responseData = await response.json();
        console.log('API response data:', responseData);

        if (!response.ok) {
            console.error('Failed to save gallery to DB:', response.status, responseData);
            return { success: false };
        }

        if (!responseData.success) {
            console.error('API returned success:false:', responseData);
            return { success: false };
        }

        console.log('Gallery saved to DB successfully with ID:', responseData.last_row_id);
        return { success: true, id: responseData.last_row_id };
    } catch (error) {
        console.error('Failed to save gallery to DB:', error);
        return { success: false };
    }
}

async function deleteGalleryFromDB(id) {
    try {
        const response = await fetch(`${WORKER_URL}/gallery`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error('Failed to delete gallery from DB:', response.status, error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Failed to delete gallery from DB:', error);
        return false;
    }
}

// Security: Check authentication
function checkAuth() {
    const auth = sessionStorage.getItem('kindom_auth');
    const sessionStart = sessionStorage.getItem('kindom_session_start');
    
    if (!auth || !sessionStart) {
        return false;
    }
    
    // Check session timeout (30 minutes)
    const now = Date.now();
    const sessionAge = now - parseInt(sessionStart);
    const thirtyMinutes = 30 * 60 * 1000;
    
    if (sessionAge > thirtyMinutes) {
        // Session expired
        sessionStorage.removeItem('kindom_auth');
        sessionStorage.removeItem('kindom_session_start');
        return false;
    }
    
    return true;
}

// Security: Require auth for all admin operations
function requireAuth() {
    if (!checkAuth()) {
        alert('Session expirée. Veuillez vous reconnecter.');
        adminDashboard.style.display = 'none';
        loginContainer.style.display = 'flex';
        return false;
    }
    return true;
}

// Initialize data
loadFromStorage();

// DOM Elements
const loginContainer = document.getElementById('loginContainer');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const navItems = document.querySelectorAll('.nav-item:not(.logout-btn)');
const contentSections = document.querySelectorAll('.content-section');
const sectionTitle = document.getElementById('sectionTitle');

// Security: Advanced encryption using Web Crypto API
class SecureAuth {
    constructor() {
        this.iterations = 100000; // PBKDF2 iterations
        this.keyLength = 256; // Key length in bits
    }

    // Generate salt
    generateSalt() {
        return crypto.getRandomValues(new Uint8Array(16));
    }

    // Derive key from password using PBKDF2
    async deriveKey(password, salt) {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );

        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: this.iterations,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: this.keyLength },
            true,
            ['encrypt', 'decrypt']
        );
    }

    // Hash password for storage
    async hashPassword(password, salt = null) {
        if (!salt) {
            salt = this.generateSalt();
        }
        
        const key = await this.deriveKey(password, salt);
        const exportedKey = await crypto.subtle.exportKey('raw', key);
        
        // Combine salt and hash
        const combined = new Uint8Array(salt.length + exportedKey.byteLength);
        combined.set(salt);
        combined.set(new Uint8Array(exportedKey), salt.length);
        
        return btoa(String.fromCharCode.apply(null, combined));
    }

    // Verify password
    async verifyPassword(password, storedHash) {
        try {
            const combined = new Uint8Array(atob(storedHash).split('').map(c => c.charCodeAt(0)));
            const salt = combined.slice(0, 16);
            const hash = combined.slice(16);
            
            const key = await this.deriveKey(password, salt);
            const exportedKey = await crypto.subtle.exportKey('raw', key);
            const newHash = new Uint8Array(exportedKey);
            
            // Compare hashes
            return this.arraysEqual(hash, newHash);
        } catch (error) {
            console.error('Password verification error:', error);
            return false;
        }
    }

    // Compare two arrays
    arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }
}

// Initialize secure auth
const secureAuth = new SecureAuth();

// R2 Configuration
const WORKER_URL = 'https://kindom-upload-worker.imadedar98.workers.dev';

// Settings API (D1 Database)
async function loadSettingsFromDB() {
    try {
        const response = await fetch(`${WORKER_URL}/settings`);
        if (response.ok) {
            return await response.json();
        }
        const error = await response.json().catch(() => ({}));
        console.error('Failed to load settings from DB:', response.status, error);
    } catch (error) {
        console.error('Failed to load settings from DB:', error);
    }
    return null;
}

async function saveSettingsToDB(settings) {
    try {
        const response = await fetch(`${WORKER_URL}/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error('Failed to save settings to DB:', response.status, error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Failed to save settings to DB:', error);
        return false;
    }
}

// Image Upload to R2 via Worker
async function uploadImageToR2(file, folder = 'products') {
    // Check cache first
    const cacheKey = `r2_cache_${file.name}_${file.size}`;
    const cachedUrl = localStorage.getItem(cacheKey);
    if (cachedUrl) {
        console.log('Using cached image URL:', cachedUrl);
        return cachedUrl;
    }

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await fetch(`${WORKER_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Cache the URL
        localStorage.setItem(cacheKey, data.url);
        
        return data.url;
    } catch (error) {
        console.error('Image upload error:', error);
        throw error;
    }
}

// Admin credentials — password hash is stored in Cloudflare D1 (settings table)
const ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'kindo123store123';
const PASSWORD_HASH_KEY = 'admin_password_hash';

// Get stored password hash (local cache)
function getStoredPasswordHash() {
    return localStorage.getItem('kindom_admin_hash') || null;
}

// Store password hash locally
function storePasswordHash(hash) {
    localStorage.setItem('kindom_admin_hash', hash);
}

// Get active password hash — D1 is source of truth, localStorage is cache
async function getPasswordHash() {
    const dbSettings = await loadSettingsFromDB();
    if (dbSettings?.[PASSWORD_HASH_KEY]) {
        storePasswordHash(dbSettings[PASSWORD_HASH_KEY]);
        return dbSettings[PASSWORD_HASH_KEY];
    }
    return getStoredPasswordHash();
}

// Verify admin password (used by login and password change)
async function verifyAdminPassword(password) {
    const hash = await getPasswordHash();

    if (hash && await secureAuth.verifyPassword(password, hash)) {
        return true;
    }

    // Default password works until a hash is saved in D1
    const dbSettings = await loadSettingsFromDB();
    if (!dbSettings?.[PASSWORD_HASH_KEY] && password === DEFAULT_ADMIN_PASSWORD) {
        return true;
    }

    return false;
}

// Save password hash to localStorage + Cloudflare D1
async function saveAdminPasswordHash(hash) {
    storePasswordHash(hash);
    return saveSettingsToDB({ [PASSWORD_HASH_KEY]: hash });
}

// Security: Hash function for passwords (SHA-256)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Security: Rate limiting for login attempts
let loginAttempts = 0;
let loginLockout = false;

// Initialize default admin password if not set in D1 or localStorage
async function initializeAdminPassword() {
    const hash = await getPasswordHash();
    if (!hash) {
        const defaultHash = await secureAuth.hashPassword(DEFAULT_ADMIN_PASSWORD);
        await saveAdminPasswordHash(defaultHash);
        console.warn('⚠️ DEFAULT PASSWORD SET: admin123 - Change it immediately in Settings > Sécurité Admin');
    }
}

// Login Functionality
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check if locked out
    if (loginLockout) {
        alert('Trop de tentatives échouées. Attendez 5 minutes.');
        return;
    }

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Security: Validate input
    if (!username || !password) {
        alert('Veuillez remplir tous les champs.');
        return;
    }

    // Check username and password
    if (username === ADMIN_USERNAME && await verifyAdminPassword(password)) {
        // Success: Reset attempts
        loginAttempts = 0;
        loginLockout = false;

        // Set session with encryption
        const sessionToken = btoa(JSON.stringify({
            timestamp: Date.now(),
            user: username,
            hash: await hashPassword(Date.now().toString())
        }));

        sessionStorage.setItem('kindom_auth', sessionToken);
        sessionStorage.setItem('kindom_session_start', Date.now());

        loginContainer.style.display = 'none';
        adminDashboard.style.display = 'grid';
        loadDashboard();
    } else {
        // Failed attempt
        loginAttempts++;

        if (loginAttempts >= 5) {
            loginLockout = true;
            setTimeout(() => {
                loginLockout = false;
                loginAttempts = 0;
            }, 300000); // 5 minutes lockout
            alert('Trop de tentatives échouées. Compte verrouillé pour 5 minutes.');
        } else {
            alert(`Identifiants invalides! Tentatives restantes: ${5 - loginAttempts}`);
        }
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
        // Clear session
        sessionStorage.removeItem('kindom_auth');
        sessionStorage.removeItem('kindom_session_start');
        
        adminDashboard.style.display = 'none';
        loginContainer.style.display = 'flex';
        loginForm.reset();
    }
});

// Mobile menu toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
    });
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });
}

// Close sidebar when clicking on nav items on mobile
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        }
    });
});

// Navigation
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Security check
        if (!requireAuth()) return;
        
        const section = item.getAttribute('data-section');
        
        // Update active nav item
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Show selected section
        contentSections.forEach(sec => sec.classList.remove('active'));
        document.getElementById(section).classList.add('active');
        
        // Update title
        sectionTitle.textContent = item.textContent.trim();
        
        // Load section data
        if (section === 'products') loadProducts();
        if (section === 'gallery') loadGallery();
    });
});

// Load Dashboard Stats
function loadDashboard() {
    const inStockCount = products.filter(p => p.inStock).length;
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('inStock').textContent = inStockCount;
    document.getElementById('galleryCount').textContent = gallery.length;
    loadActivitiesDisplay();
}

// Load Products Table
async function loadProducts(filter = 'all', search = '') {
    const tableBody = document.getElementById('productsTableBody');
    
    // Try to load from D1 first
    const dbProducts = await loadProductsFromDB();
    if (dbProducts && dbProducts.length > 0) {
        // Convert DB format to local format
        products = dbProducts.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            type: p.type,
            price: p.price,
            description: p.description,
            image: p.image_url,
            inStock: p.in_stock === 1
        }));
        saveToStorage(); // Update localStorage as backup
    }
    
    let filteredProducts = products;
    
    if (filter !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === filter);
    }
    
    if (search) {
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    tableBody.innerHTML = filteredProducts.map(product => `
        <tr>
            <td>${product.id}</td>
            <td><img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy"></td>
            <td><strong>${product.name}</strong></td>
            <td><span style="text-transform: capitalize;">${product.category}</span></td>
            <td><span class="badge" style="background: ${product.type === 'food' ? '#34C759' : '#007AFF'}; color: white; padding: 4px 12px; border-radius: 12px;">${product.type === 'food' ? 'Food' : 'Accessory'}</span></td>
            <td><strong>${product.price}</strong></td>
            <td>
                <span class="stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                    ${product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
            </td>
            <td>
                <div class="action-btns">
                    <button class="action-btn btn-edit" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Filter and Search Products
document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
    const search = document.getElementById('searchProducts').value;
    loadProducts(e.target.value, search);
});

document.getElementById('searchProducts')?.addEventListener('input', (e) => {
    const filter = document.getElementById('categoryFilter').value;
    loadProducts(filter, e.target.value);
});

// Product Modal Functions
function showAddProductModal() {
    document.getElementById('productModalTitle').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productImage').setAttribute('required', ''); // Make image required for new products
    document.getElementById('productModal').classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        document.getElementById('productModalTitle').textContent = 'Edit Product';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productType').value = product.type || 'food';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productInStock').checked = product.inStock;
        document.getElementById('productImage').removeAttribute('required'); // Make image optional when editing
        document.getElementById('productModal').classList.add('active');
    }
}

async function deleteProduct(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
        const product = products.find(p => p.id === id);
        
        // Try to delete from D1 first
        const dbSuccess = await deleteProductFromDB(id);
        
        // Always update local array
        products = products.filter(p => p.id !== id);
        addActivity('delete', `Product deleted: ${product ? product.name : 'Unknown'}`);
        saveToStorage(); // Keep localStorage as backup
        loadProducts();
        loadDashboard();
        
        if (dbSuccess) {
            showNotification('Produit supprimé avec succès!', 'success');
        } else {
            showNotification('Produit supprimé (local only)', 'warning');
        }
    }
}

// Security: Input sanitization
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    // Remove potentially dangerous characters
    return input
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
}

// Security: Validate URL
function isValidURL(url) {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

// Save Product
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Security check
    if (!requireAuth()) return;
    
    const imageFile = document.getElementById('productImage').files[0];
    const productId = document.getElementById('productId').value;
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading...';
    
    try {
        let imageUrl;
        
        // Handle image upload
        if (imageFile) {
            // Upload new image to R2
            imageUrl = await uploadImageToR2(imageFile, 'products');
        } else if (productId) {
            // Editing without changing image - keep existing
            const existingProduct = products.find(p => p.id == productId);
            imageUrl = existingProduct ? existingProduct.image : null;
        } else {
            // Adding new product without image - error
            alert('Veuillez sélectionner une image!');
            submitBtn.disabled = false;
            submitBtn.textContent = productId ? 'Update Product' : 'Save Product';
            return;
        }
        
        // Sanitize inputs
        const productData = {
            id: productId || Date.now(),
            name: sanitizeInput(document.getElementById('productName').value),
            category: sanitizeInput(document.getElementById('productCategory').value),
            type: sanitizeInput(document.getElementById('productType').value),
            price: sanitizeInput(document.getElementById('productPrice').value),
            description: sanitizeInput(document.getElementById('productDescription').value),
            image_url: imageUrl,
            in_stock: document.getElementById('productInStock').checked,
            featured: false,
            keywords: null
        };
        
        // Validate required fields
        if (!productData.name || !productData.category || !productData.type || !productData.price || !productData.description) {
            alert('Veuillez remplir tous les champs obligatoires!');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Product';
            return;
        }
        
        // Try to save to D1
        const dbSuccess = await saveProductToDB(productData);
        
        // Always update local array as backup
        const localProductData = {
            id: productData.id,
            name: productData.name,
            category: productData.category,
            type: productData.type,
            price: productData.price,
            description: productData.description,
            image: productData.image_url,
            inStock: productData.in_stock
        };
        
        if (document.getElementById('productId').value) {
            // Update existing product
            const index = products.findIndex(p => p.id == productData.id);
            products[index] = localProductData;
            addActivity('edit', `Product updated: ${productData.name}`);
            showNotification(dbSuccess ? 'Produit mis à jour avec succès!' : 'Produit mis à jour (local only)', dbSuccess ? 'success' : 'warning');
        } else {
            // Add new product
            products.push(localProductData);
            addActivity('add', `New product added: ${productData.name}`);
            showNotification(dbSuccess ? 'Produit ajouté avec succès!' : 'Produit ajouté (local only)', dbSuccess ? 'success' : 'warning');
        }
        
        saveToStorage(); // Keep localStorage as backup
        loadProducts();
        loadDashboard();
        closeProductModal();
    } catch (error) {
        console.error('Product save error:', error);
        alert('Erreur lors de l\'upload de l\'image: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = productId ? 'Update Product' : 'Save Product';
    }
});

// Load Gallery
async function loadGallery() {
    console.log('Loading gallery from database...');
    // Try to load from D1 first
    const dbGallery = await loadGalleryFromDB();
    if (dbGallery) {
        console.log('Gallery loaded from DB:', dbGallery);
        gallery = dbGallery;
        saveToStorage(); // Update localStorage as backup
    } else {
        console.log('Failed to load from DB, using localStorage');
    }

    const galleryGrid = document.getElementById('galleryAdminGrid');
    galleryGrid.innerHTML = gallery.map(item => `
        <div class="gallery-admin-item">
            <img src="${item.image}" alt="${item.alt}" loading="lazy">
            <div class="gallery-item-info" style="padding: 10px; background: #f8f9fa; border-top: 1px solid #eee; text-align: center;">
                <h4 style="margin: 0; font-size: 14px; color: #333;">${item.title || 'Untitled Album'}</h4>
                <small style="color: #666;">${(item.extraImages && item.extraImages.length) ? '+' + item.extraImages.length + ' photos' : '1 photo'}</small>
            </div>
            <div class="gallery-item-actions">
                <button class="gallery-edit-btn" onclick="editGalleryItem(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="gallery-delete-btn" onclick="deleteGalleryItem(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Gallery Modal Functions
function showAddGalleryModal() {
    document.getElementById('galleryModal').classList.add('active');
    document.getElementById('galleryModalTitle').textContent = 'Add Gallery Album';
    document.getElementById('galleryId').value = '';
    document.getElementById('galleryImage').setAttribute('required', '');
    document.getElementById('galleryImageHint').textContent = 'Upload cover image (will be stored in Cloudflare R2)';
    document.getElementById('gallerySubmitBtn').textContent = 'Add Image';
}

function editGalleryItem(id) {
    const item = gallery.find(g => g.id === id);
    if (!item) return;

    document.getElementById('galleryModal').classList.add('active');
    document.getElementById('galleryModalTitle').textContent = 'Edit Gallery Album';
    document.getElementById('galleryId').value = item.id;
    document.getElementById('galleryTitle').value = item.title || '';
    document.getElementById('galleryDescription').value = item.description || '';
    document.getElementById('galleryAlt').value = item.alt || '';
    document.getElementById('galleryImage').removeAttribute('required');
    document.getElementById('galleryImageHint').textContent = 'Leave empty to keep current cover image';
    document.getElementById('gallerySubmitBtn').textContent = 'Update Album';

    // Load extra images
    const extraImagesContainer = document.getElementById('extraImagesContainer');
    extraImagesContainer.innerHTML = '<label>Extra Album Images</label>';
    if (item.extraImages && item.extraImages.length > 0) {
        item.extraImages.forEach((img, index) => {
            addExtraImageInput(img);
        });
    }
}

function closeGalleryModal() {
    document.getElementById('galleryModal').classList.remove('active');
    document.getElementById('galleryForm').reset();
    document.getElementById('extraImagesContainer').innerHTML = '<label>Extra Album Images</label>';
    document.getElementById('galleryId').value = '';
}

async function deleteGalleryItem(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette image?')) {
        // Delete from D1 first
        const dbSuccess = await deleteGalleryFromDB(id);
        if (dbSuccess) {
            showNotification('Image supprimée avec succès!', 'success');
        } else {
            showNotification('Erreur lors de la suppression (LOCAL ONLY)', 'warning');
        }
        
        // Always update local array as backup
        gallery = gallery.filter(item => item.id !== id);
        saveToStorage();
        loadGallery();
        loadDashboard();
    }
}

// Dynamic Extra Images
function addExtraImageField() {
    const container = document.getElementById('extraImagesContainer');
    const div = document.createElement('div');
    div.className = 'extra-image-input-group';
    div.style.display = 'flex';
    div.style.gap = '10px';
    div.style.marginTop = '10px';
    div.innerHTML = `
        <input type="file" class="form-input extra-image-file" accept="image/*" required>
        <button type="button" class="btn-danger" style="padding: 10px; border-radius: 8px; border: none; cursor: pointer; color: white;" onclick="this.parentElement.remove()">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(div);
}

function addExtraImageInput(imageUrl) {
    const container = document.getElementById('extraImagesContainer');
    const div = document.createElement('div');
    div.className = 'extra-image-input-group';
    div.style.display = 'flex';
    div.style.gap = '10px';
    div.style.marginTop = '10px';
    div.innerHTML = `
        <input type="url" class="form-input extra-image-url" value="${imageUrl}" placeholder="Image URL" required>
        <button type="button" class="btn-danger" style="padding: 10px; border-radius: 8px; border: none; cursor: pointer; color: white;" onclick="this.parentElement.remove()">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(div);
}

// Save Gallery Item
document.getElementById('galleryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Security check
    if (!requireAuth()) return;
    
    const imageFile = document.getElementById('galleryImage').files[0];
    const galleryId = document.getElementById('galleryId').value;
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading...';
    
    try {
        let imageUrl;
        
        // Handle cover image
        if (imageFile) {
            // Upload new cover image to R2
            imageUrl = await uploadImageToR2(imageFile, 'gallery');
        } else if (galleryId) {
            // Editing without changing cover image - keep existing
            const existingItem = gallery.find(g => g.id == galleryId);
            imageUrl = existingItem ? existingItem.image : null;
        } else {
            // Adding new item without image - error
            alert('Veuillez sélectionner une image de couverture!');
            submitBtn.disabled = false;
            submitBtn.textContent = galleryId ? 'Update Album' : 'Add Image';
            return;
        }
        
        // Gather and upload extra images
        const extraImagesFileInputs = document.querySelectorAll('.extra-image-file');
        const extraImagesUrlInputs = document.querySelectorAll('.extra-image-url');
        const extraImages = [];

        // Handle existing URL inputs (from edit mode)
        extraImagesUrlInputs.forEach(input => {
            if (input.value && isValidURL(input.value)) {
                extraImages.push(input.value);
            }
        });

        // Handle file inputs (new uploads)
        for (const input of extraImagesFileInputs) {
            if (input.files[0]) {
                const extraImageUrl = await uploadImageToR2(input.files[0], 'gallery');
                extraImages.push(extraImageUrl);
            }
        }
        
        const title = sanitizeInput(document.getElementById('galleryTitle').value);
        const description = sanitizeInput(document.getElementById('galleryDescription').value);
        const altText = sanitizeInput(document.getElementById('galleryAlt').value);
        
        if (galleryId) {
            // Update existing gallery item
            const index = gallery.findIndex(g => g.id == galleryId);
            if (index !== -1) {
                gallery[index] = {
                    ...gallery[index],
                    title: title,
                    description: description,
                    image: imageUrl,
                    alt: altText,
                    extraImages: extraImages
                };
                addActivity('edit', `Gallery album updated: ${title}`);
            } else {
                console.error('Gallery item not found for editing, id:', galleryId);
                showNotification('Erreur: Album non trouvé pour modification', 'warning');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Update Album';
                return;
            }
        } else {
            // Add new gallery item (id will be assigned by DB on save)
            const galleryData = {
                title: title,
                description: description,
                image: imageUrl,
                alt: altText,
                extraImages: extraImages
            };
            gallery.push(galleryData);
            addActivity('add', `New gallery album added: ${title}`);
        }

        // Save to D1
        const galleryItem = galleryId ? gallery[gallery.findIndex(g => g.id == galleryId)] : gallery[gallery.length - 1];
        const dbResult = await saveGalleryToDB(galleryItem);
        if (!dbResult.success) {
            showNotification('Erreur lors de la sauvegarde (LOCAL ONLY)', 'warning');
        } else {
            // Update local item with DB-generated ID for new items
            if (!galleryId && dbResult.id) {
                gallery[gallery.length - 1].id = dbResult.id;
            }
            console.log('Gallery saved to DB successfully, reloading from DB...');
            // Force reload from database to get the correct ID and data
            await loadGallery();
            showNotification('Album sauvegardé avec succès!', 'success');
        }

        saveToStorage();
        loadDashboard();
        closeGalleryModal();
    } catch (error) {
        console.error('Gallery save error:', error);
        alert('Erreur lors de l\'upload des images: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = galleryId ? 'Update Album' : 'Add Image';
    }
});

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 20px 30px;
        background: ${type === 'success' ? '#34C759' : '#FF3B30'};
        color: white;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Export Data (for saving to localStorage or server)
function exportData() {
    return {
        products: products,
        gallery: gallery
    };
}

// Import Data (for loading from localStorage or server)
function importData(data) {
    if (data.products) products = data.products;
    if (data.gallery) gallery = data.gallery;
    loadDashboard();
}

// Initialize
loadFromStorage();
loadActivities();
loadProducts();
loadGallery();
initializeAdminPassword();

// Password Strength Checker
function checkPasswordStrength(password) {
    const strengthIndicator = document.getElementById('passwordStrength');
    let score = 0;
    let feedback = [];

    // Length check
    if (password.length >= 12) score += 1;
    else feedback.push('Au moins 12 caractères');

    // Complexity checks
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Lettres minuscules');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Lettres majuscules');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Chiffres');

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push('Symboles (!@#$%^&*)');

    // Display strength
    strengthIndicator.style.display = 'block';
    
    if (score < 3) {
        strengthIndicator.className = 'password-strength weak';
        strengthIndicator.textContent = '🔴 Faible - Requis: ' + feedback.join(', ');
        return false;
    } else if (score < 5) {
        strengthIndicator.className = 'password-strength medium';
        strengthIndicator.textContent = '🟡 Moyen - Ajoutez: ' + feedback.join(', ');
        return false;
    } else {
        strengthIndicator.className = 'password-strength strong';
        strengthIndicator.textContent = '🟢 Fort - Mot de passe sécurisé!';
        return true;
    }
}

// Password change form
document.getElementById('passwordChangeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Security check
    if (!requireAuth()) return;
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Veuillez remplir tous les champs.');
        return;
    }
    
    // Check if new passwords match
    if (newPassword !== confirmPassword) {
        alert('Les nouveaux mots de passe ne correspondent pas.');
        return;
    }
    
    // Check password strength
    if (!checkPasswordStrength(newPassword)) {
        alert('Le mot de passe ne respecte pas les critères de sécurité.');
        return;
    }
    
    // Verify current password (same logic as login)
    if (!(await verifyAdminPassword(currentPassword))) {
        alert('Mot de passe actuel incorrect.');
        return;
    }
    
    // Hash and store new password in localStorage + Cloudflare D1
    try {
        const newHash = await secureAuth.hashPassword(newPassword);
        const saved = await saveAdminPasswordHash(newHash);
        
        if (!saved) {
            alert('Mot de passe mis à jour localement, mais la sauvegarde Cloudflare a échoué. Réessayez.');
            return;
        }
        
        // Clear form
        document.getElementById('passwordChangeForm').reset();
        document.getElementById('passwordStrength').style.display = 'none';
        
        showNotification('Mot de passe changé avec succès!', 'success');
        
        // Log out user to force re-login with new password
        setTimeout(() => {
            sessionStorage.clear();
            adminDashboard.style.display = 'none';
            loginContainer.style.display = 'flex';
            alert('Mot de passe mis à jour. Veuillez vous reconnecter.');
        }, 2000);
        
    } catch (error) {
        console.error('Password change error:', error);
        alert('Erreur lors du changement de mot de passe.');
    }
});

// Real-time password strength checking
document.getElementById('newPassword').addEventListener('input', (e) => {
    checkPasswordStrength(e.target.value);
});

// Store settings
document.getElementById('storeSettingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!requireAuth()) return;
    
    const settings = {
        store_name: document.getElementById('storeName').value,
        whatsapp_number: document.getElementById('whatsappNumber').value,
        email: document.getElementById('storeEmail').value,
        address_fr: document.getElementById('storeAddress').value,
        primary_color: document.getElementById('primaryColor').value,
        secondary_color: document.getElementById('secondaryColor').value
    };
    
    // Validate WhatsApp number format
    const whatsappRegex = /^[0-9+\-\s()]+$/;
    if (!whatsappRegex.test(settings.whatsapp_number)) {
        alert('Format de numéro WhatsApp invalide.');
        return;
    }
    
    // Save to D1 database
    const success = await saveSettingsToDB(settings);
    if (success) {
        showNotification('Paramètres sauvegardés!', 'success');
    } else {
        alert('Erreur lors de la sauvegarde des paramètres.');
    }
});

// Apply theme
async function applyTheme() {
    if (!requireAuth()) return;
    
    const primaryColor = document.getElementById('primaryColor').value;
    const secondaryColor = document.getElementById('secondaryColor').value;
    
    // Update CSS variables
    document.documentElement.style.setProperty('--primary', primaryColor);
    document.documentElement.style.setProperty('--secondary', secondaryColor);
    
    // Save theme to D1 database
    const settings = {
        primary_color: primaryColor,
        secondary_color: secondaryColor
    };
    const success = await saveSettingsToDB(settings);
    
    // Also save to localStorage as fallback
    localStorage.setItem('kindom_theme', JSON.stringify({
        primaryColor,
        secondaryColor
    }));
    
    if (success) {
        showNotification('Thème appliqué!', 'success');
    } else {
        showNotification('Thème appliqué (local only)', 'warning');
    }
}

// Load saved settings on page load
async function loadSavedSettings() {
    // Load from D1 database
    const dbSettings = await loadSettingsFromDB();
    if (dbSettings) {
        document.getElementById('storeName').value = dbSettings.store_name || 'Kindom';
        document.getElementById('whatsappNumber').value = dbSettings.whatsapp_number || '+213XXXXXXXXX';
        document.getElementById('storeEmail').value = dbSettings.email || 'contact@kindom-dz.com';
        document.getElementById('storeAddress').value = dbSettings.address_fr || 'Alger, Algérie';
        document.getElementById('primaryColor').value = dbSettings.primary_color || '#FF6B6B';
        document.getElementById('secondaryColor').value = dbSettings.secondary_color || '#4ECDC4';
        document.documentElement.style.setProperty('--primary', dbSettings.primary_color || '#FF6B6B');
        document.documentElement.style.setProperty('--secondary', dbSettings.secondary_color || '#4ECDC4');
    } else {
        // Fallback to localStorage if DB not available
        const storeSettings = localStorage.getItem('kindom_store_settings');
        if (storeSettings) {
            const settings = JSON.parse(storeSettings);
            document.getElementById('storeName').value = settings.storeName || 'Kindom';
            document.getElementById('whatsappNumber').value = settings.whatsappNumber || '+213XXXXXXXXX';
            document.getElementById('storeEmail').value = settings.storeEmail || 'contact@kindom-dz.com';
            document.getElementById('storeAddress').value = settings.storeAddress || 'Alger, Algérie';
        }
        
        const theme = localStorage.getItem('kindom_theme');
        if (theme) {
            const { primaryColor, secondaryColor } = JSON.parse(theme);
            document.getElementById('primaryColor').value = primaryColor;
            document.getElementById('secondaryColor').value = secondaryColor;
            document.documentElement.style.setProperty('--primary', primaryColor);
            document.documentElement.style.setProperty('--secondary', secondaryColor);
        }
    }
}

// Call load settings when admin panel opens
const originalLoadDashboard = loadDashboard;
loadDashboard = async function() {
    originalLoadDashboard.call(this);
    await loadSavedSettings();
};

// Clear all data function
function clearAllData() {
    if (confirm('⚠️ ATTENTION!\n\nCela supprimera TOUS les produits et images de la galerie.\nCette action est irréversible!\n\nÊtes-vous absolument sûr?')) {
        if (confirm('Dernière confirmation: Supprimer TOUTES les données?')) {
            products = [];
            gallery = [];
            saveToStorage();
            loadProducts();
            loadGallery();
            loadDashboard();
            showNotification('Toutes les données ont été supprimées!', 'success');
        }
    }
}

console.log('Admin Panel Loaded Successfully! 👑');
