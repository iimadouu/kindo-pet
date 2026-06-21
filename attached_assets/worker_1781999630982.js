/**
 * Kindom API - Cloudflare Worker with D1 Database
 * Backend API for pet store e-commerce
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // API Routes
      if (path.startsWith('/api/products')) {
        return handleProducts(request, env, corsHeaders);
      } else if (path.startsWith('/api/gallery')) {
        return handleGallery(request, env, corsHeaders);
      } else if (path.startsWith('/api/settings')) {
        return handleSettings(request, env, corsHeaders);
      } else if (path.startsWith('/api/seo')) {
        return handleSEO(request, env, corsHeaders);
      } else if (path === '/api/auth/login') {
        return handleLogin(request, env, corsHeaders);
      } else {
        return jsonResponse({ error: 'Not found' }, 404, corsHeaders);
      }
    } catch (error) {
      return jsonResponse({ error: error.message }, 500, corsHeaders);
    }
  },
};

// Products API
async function handleProducts(request, env, corsHeaders) {
  const url = new URL(request.url);
  const method = request.method;

  if (method === 'GET') {
    // Get all products or by category
    const category = url.searchParams.get('category');
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY featured DESC, created_at DESC';
    
    const { results } = await env.DB.prepare(query).bind(...params).all();
    return jsonResponse({ products: results }, 200, corsHeaders);
  }

  if (method === 'POST') {
    // Create new product (admin only)
    const data = await request.json();
    const result = await env.DB.prepare(`
      INSERT INTO products (name, name_ar, name_en, category, price, description, description_ar, description_en, image_url, in_stock, keywords)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.name,
      data.name_ar || null,
      data.name_en || null,
      data.category,
      data.price,
      data.description,
      data.description_ar || null,
      data.description_en || null,
      data.image_url,
      data.in_stock ? 1 : 0,
      data.keywords || null
    ).run();

    return jsonResponse({ id: result.lastRowId, message: 'Product created' }, 201, corsHeaders);
  }

  if (method === 'PUT') {
    // Update product
    const data = await request.json();
    await env.DB.prepare(`
      UPDATE products 
      SET name=?, name_ar=?, name_en=?, category=?, price=?, description=?, description_ar=?, description_en=?, image_url=?, in_stock=?, keywords=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).bind(
      data.name, data.name_ar, data.name_en, data.category, data.price,
      data.description, data.description_ar, data.description_en,
      data.image_url, data.in_stock ? 1 : 0, data.keywords, data.id
    ).run();

    return jsonResponse({ message: 'Product updated' }, 200, corsHeaders);
  }

  if (method === 'DELETE') {
    const id = url.searchParams.get('id');
    await env.DB.prepare('DELETE FROM products WHERE id=?').bind(id).run();
    return jsonResponse({ message: 'Product deleted' }, 200, corsHeaders);
  }
}

// Gallery API
async function handleGallery(request, env, corsHeaders) {
  const method = request.method;

  if (method === 'GET') {
    const { results } = await env.DB.prepare(`
      SELECT * FROM gallery ORDER BY display_order ASC, created_at DESC
    `).all();
    return jsonResponse({ gallery: results }, 200, corsHeaders);
  }

  if (method === 'POST') {
    const data = await request.json();
    const result = await env.DB.prepare(`
      INSERT INTO gallery (image_url, title, title_ar, title_en, description, description_ar, description_en, alt_text, category, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.image_url,
      data.title,
      data.title_ar || null,
      data.title_en || null,
      data.description || null,
      data.description_ar || null,
      data.description_en || null,
      data.alt_text,
      data.category || null,
      data.display_order || 0
    ).run();

    return jsonResponse({ id: result.lastRowId, message: 'Gallery item created' }, 201, corsHeaders);
  }

  if (method === 'DELETE') {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    await env.DB.prepare('DELETE FROM gallery WHERE id=?').bind(id).run();
    return jsonResponse({ message: 'Gallery item deleted' }, 200, corsHeaders);
  }
}

// Settings API
async function handleSettings(request, env, corsHeaders) {
  const method = request.method;

  if (method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM settings').all();
    const settings = {};
    results.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    return jsonResponse({ settings }, 200, corsHeaders);
  }

  if (method === 'PUT') {
    const data = await request.json();
    for (const [key, value] of Object.entries(data)) {
      await env.DB.prepare(`
        INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)
        ON CONFLICT(setting_key) DO UPDATE SET setting_value=?, updated_at=CURRENT_TIMESTAMP
      `).bind(key, value, value).run();
    }
    return jsonResponse({ message: 'Settings updated' }, 200, corsHeaders);
  }
}

// SEO API
async function handleSEO(request, env, corsHeaders) {
  const url = new URL(request.url);
  const page = url.searchParams.get('page') || 'home';
  
  const { results } = await env.DB.prepare(
    'SELECT * FROM seo_content WHERE page_name=?'
  ).bind(page).all();

  if (results.length > 0) {
    return jsonResponse({ seo: results[0] }, 200, corsHeaders);
  }
  
  return jsonResponse({ error: 'SEO content not found' }, 404, corsHeaders);
}

// Authentication
async function handleLogin(request, env, corsHeaders) {
  const { username, password } = await request.json();
  
  const { results } = await env.DB.prepare(
    'SELECT * FROM admin_users WHERE username=?'
  ).bind(username).all();

  if (results.length === 0) {
    return jsonResponse({ error: 'Invalid credentials' }, 401, corsHeaders);
  }

  // In production, use proper password hashing (bcrypt)
  // For now, simple check (CHANGE THIS!)
  if (password === 'admin123') {
    // Update last login
    await env.DB.prepare(
      'UPDATE admin_users SET last_login=CURRENT_TIMESTAMP WHERE id=?'
    ).bind(results[0].id).run();

    return jsonResponse({ 
      success: true, 
      user: { username: results[0].username, email: results[0].email }
    }, 200, corsHeaders);
  }

  return jsonResponse({ error: 'Invalid credentials' }, 401, corsHeaders);
}

// Helper function
function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}
