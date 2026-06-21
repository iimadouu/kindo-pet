/**
 * API Client for Kindom
 * Connects frontend to Cloudflare Workers API
 */

const API_BASE_URL = 'https://kindom-api.YOUR-SUBDOMAIN.workers.dev';

class KindomAPI {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Products API
    async getProducts(category = null) {
        const params = category ? `?category=${category}` : '';
        return this.request(`/api/products${params}`);
    }

    async createProduct(productData) {
        return this.request('/api/products', {
            method: 'POST',
            body: JSON.stringify(productData),
        });
    }

    async updateProduct(productData) {
        return this.request('/api/products', {
            method: 'PUT',
            body: JSON.stringify(productData),
        });
    }

    async deleteProduct(productId) {
        return this.request(`/api/products?id=${productId}`, {
            method: 'DELETE',
        });
    }

    // Gallery API
    async getGallery() {
        return this.request('/api/gallery');
    }

    async createGalleryItem(itemData) {
        return this.request('/api/gallery', {
            method: 'POST',
            body: JSON.stringify(itemData),
        });
    }

    async deleteGalleryItem(itemId) {
        return this.request(`/api/gallery?id=${itemId}`, {
            method: 'DELETE',
        });
    }

    // Settings API
    async getSettings() {
        return this.request('/api/settings');
    }

    async updateSettings(settingsData) {
        return this.request('/api/settings', {
            method: 'PUT',
            body: JSON.stringify(settingsData),
        });
    }

    // SEO API
    async getSEOContent(page = 'home') {
        return this.request(`/api/seo?page=${page}`);
    }

    // Auth API
    async login(username, password) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    }
}

// Export instance
const api = new KindomAPI();

// For use in browser console or debugging
if (typeof window !== 'undefined') {
    window.KindomAPI = api;
}
