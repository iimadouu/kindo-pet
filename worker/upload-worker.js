/**
 * Kindo Upload Worker
 * Cloudflare Worker — handles R2 image uploads + D1 CRUD (products, gallery, settings)
 *
 * Bindings required (set in Cloudflare dashboard or wrangler.toml):
 *   BUCKET  → R2 bucket "kindo-images"
 *   DB      → D1 database "kindo-db"
 *   R2_PUBLIC_URL → https://pub-943bd5d0ce6f4df9b0b9cbc05bec9e54.r2.dev (env var)
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: CORS 
      });
    }

    try {
      // Admin API endpoints (without /api/ prefix)
      if (path === '/upload' && request.method === 'POST') return handleUpload(request, env);
      if (path === '/products') return handleProducts(request, env);
      if (path === '/gallery') return handleGallery(request, env);
      if (path === '/settings') return handleSettings(request, env);
      if (path === '/test') return handleTest(env);

      // Public API endpoints (with /api/ prefix)
      if (path === '/api/upload' && request.method === 'POST') return handleUpload(request, env);
      if (path === '/api/products') return handleProducts(request, env);
      if (path === '/api/articles') return handleArticles(request, env);
      if (path === '/api/settings') return handleSettings(request, env);

      return json({ error: 'Not found' }, 404);
    } catch (err) {
      console.error('Worker error:', err);
      return json({ error: err.message || 'Internal server error' }, 500);
    }
  },
};

/* ── Image Upload ── */
async function handleUpload(request, env) {
  if (!env.BUCKET) return json({ error: 'R2 bucket not bound. Add BUCKET binding.' }, 500);

  const form = await request.formData();
  const file = form.get('file');
  if (!file || typeof file === 'string') return json({ error: 'No file provided' }, 400);

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];
  if (!allowed.includes(ext)) return json({ error: 'File type not allowed' }, 400);

  const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = await file.arrayBuffer();

  await env.BUCKET.put(key, buffer, {
    httpMetadata: { contentType: file.type || `image/${ext}` },
  });

  const publicUrl = env.R2_PUBLIC_URL || 'https://pub-943bd5d0ce6f4df9b0b9cbc05bec9e54.r2.dev';
  const url = `${publicUrl}/${key}`;

  return json({ success: true, url, key });
}

/* ── Products ── */
async function handleProducts(request, env) {
  if (!env.DB) return json({ error: 'D1 database not bound. Add DB binding.' }, 500);

  if (request.method === 'GET') {
    const { results } = await env.DB.prepare(
      'SELECT * FROM products ORDER BY featured DESC, created_at DESC'
    ).all();
    return json(results);
  }

  // BULK PUT - Replace entire products table
  if (request.method === 'PUT') {
    const products = await request.json();
    
    // If it's an array, do bulk sync
    if (Array.isArray(products)) {
      return await bulkSyncProducts(products, env);
    }
    
    // If it's a single object with an id, update that product
    if (products.id) {
      return await updateSingleProduct(products, env);
    }
    
    return json({ error: 'Invalid PUT request. Expected array of products or single product with id.' }, 400);
  }

  // POST - Create a new product
  if (request.method === 'POST') {
    const d = await request.json();
    const result = await env.DB.prepare(
      `INSERT INTO products
        (name, name_ar, name_en, category, type, price, description, description_ar, description_en, image_url, in_stock, featured, keywords, specs)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      d.name, d.name_ar || null, d.name_en || null, d.category, d.type || 'food', d.price,
      d.description || null, d.description_ar || null, d.description_en || null, d.image_url || null,
      d.in_stock !== undefined ? d.in_stock : 1, d.featured ? 1 : 0, d.keywords || null,
      d.specs ? (typeof d.specs === 'string' ? d.specs : JSON.stringify(d.specs)) : null
    ).run();
    return json({ success: true, id: result.meta?.last_row_id });
  }

  // DELETE - Delete a product
  if (request.method === 'DELETE') {
    const { id } = await request.json();
    await env.DB.prepare('DELETE FROM products WHERE id=?').bind(id).run();
    return json({ success: true });
  }

  return json({ error: 'Method not allowed' }, 405);
}

// Helper: Bulk sync products (used by PUT with array)
async function bulkSyncProducts(products, env) {
  // Strategy: Clear and re-insert all products
  // This ensures the DB matches exactly what's in the frontend
  
  const statements = [];
  
  // Delete all existing products
  statements.push(env.DB.prepare('DELETE FROM products'));
  
  // Insert all products from the array
  for (const d of products) {
    statements.push(
      env.DB.prepare(
        `INSERT INTO products
          (name, name_ar, name_en, category, type, price, description, description_ar, description_en, image_url, in_stock, featured, keywords, specs)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        d.name, d.name_ar || null, d.name_en || null, d.category, d.type || 'food', d.price,
        d.description || null, d.description_ar || null, d.description_en || null, d.image_url || null,
        d.in_stock !== undefined ? d.in_stock : 1, d.featured ? 1 : 0, d.keywords || null,
        d.specs ? (typeof d.specs === 'string' ? d.specs : JSON.stringify(d.specs)) : null
      )
    );
  }
  
  // Execute all statements as a transaction
  await env.DB.batch(statements);
  
  return json({ success: true, count: products.length });
}

// Helper: Update a single product
async function updateSingleProduct(d, env) {
  await env.DB.prepare(
    `UPDATE products SET name=?, name_ar=?, name_en=?, category=?, type=?, price=?, description=?,
     description_ar=?, description_en=?, image_url=?, in_stock=?, featured=?, keywords=?, specs=?,
     updated_at=CURRENT_TIMESTAMP WHERE id=?`
  ).bind(
    d.name, d.name_ar || null, d.name_en || null, d.category, d.type || 'food', d.price,
    d.description || null, d.description_ar || null, d.description_en || null, d.image_url || null,
    d.in_stock !== undefined ? d.in_stock : 1, d.featured ? 1 : 0, d.keywords || null,
    d.specs ? (typeof d.specs === 'string' ? d.specs : JSON.stringify(d.specs)) : null, d.id
  ).run();
  return json({ success: true });
}

/* ── Gallery ── */
async function handleGallery(request, env) {
  if (!env.DB) return json({ error: 'D1 database not bound.' }, 500);

  if (request.method === 'GET') {
    const { results } = await env.DB.prepare(
      'SELECT * FROM gallery ORDER BY display_order ASC, created_at DESC'
    ).all();
    return json(results);
  }

  // BULK PUT - Replace entire gallery table
  if (request.method === 'PUT') {
    const articles = await request.json();
    
    // If it's an array, do bulk sync
    if (Array.isArray(articles)) {
      return await bulkSyncGallery(articles, env);
    }
    
    // If it's a single object with an id, update that article
    if (articles.id) {
      return await updateSingleArticle(articles, env);
    }
    
    return json({ error: 'Invalid PUT request. Expected array of articles or single article with id.' }, 400);
  }

  // POST - Create a new article
  if (request.method === 'POST') {
    const d = await request.json();
    const extraImages = Array.isArray(d.extra_images)
      ? JSON.stringify(d.extra_images)
      : (typeof d.extra_images === 'string' ? d.extra_images : null);

    const result = await env.DB.prepare(
      `INSERT INTO gallery
        (image_url, title, title_ar, title_en, excerpt, excerpt_ar, excerpt_en, body, body_ar, body_en, alt_text, category, display_order, extra_images, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      d.image_url || '', d.title || 'Untitled', d.title_ar || null, d.title_en || null,
      d.excerpt || null, d.excerpt_ar || null, d.excerpt_en || null,
      d.body || null, d.body_ar || null, d.body_en || null,
      d.alt_text || d.title || 'Gallery Image',
      d.category || null, d.display_order || 0, extraImages,
      d.date || null
    ).run();
    return json({ success: true, last_row_id: result.meta?.last_row_id });
  }

  // DELETE - Delete an article
  if (request.method === 'DELETE') {
    const { id } = await request.json();
    await env.DB.prepare('DELETE FROM gallery WHERE id=?').bind(id).run();
    return json({ success: true });
  }

  return json({ error: 'Method not allowed' }, 405);
}

// Helper: Bulk sync gallery (used by PUT with array)
async function bulkSyncGallery(articles, env) {
  const statements = [];
  
  // Delete all existing articles
  statements.push(env.DB.prepare('DELETE FROM gallery'));
  
  // Insert all articles from the array
  for (const d of articles) {
    const extraImages = Array.isArray(d.extra_images)
      ? JSON.stringify(d.extra_images)
      : (typeof d.extra_images === 'string' ? d.extra_images : null);
    
    statements.push(
      env.DB.prepare(
        `INSERT INTO gallery
          (image_url, title, title_ar, title_en, excerpt, excerpt_ar, excerpt_en, body, body_ar, body_en, alt_text, category, display_order, extra_images, date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        d.image_url || '', d.title || 'Untitled', d.title_ar || null, d.title_en || null,
        d.excerpt || null, d.excerpt_ar || null, d.excerpt_en || null,
        d.body || null, d.body_ar || null, d.body_en || null,
        d.alt_text || d.title || 'Gallery Image',
        d.category || null, d.display_order || 0, extraImages,
        d.date || null
      )
    );
  }
  
  // Execute all statements as a transaction
  await env.DB.batch(statements);
  
  return json({ success: true, count: articles.length });
}

// Helper: Update a single article
async function updateSingleArticle(d, env) {
  const extraImages = Array.isArray(d.extra_images)
    ? JSON.stringify(d.extra_images)
    : (typeof d.extra_images === 'string' ? d.extra_images : null);

  await env.DB.prepare(
    `UPDATE gallery SET image_url=?, title=?, title_ar=?, title_en=?, excerpt=?, excerpt_ar=?, excerpt_en=?,
     body=?, body_ar=?, body_en=?, alt_text=?, category=?, display_order=?, extra_images=?, date=?,
     updated_at=CURRENT_TIMESTAMP WHERE id=?`
  ).bind(
    d.image_url || '', d.title || 'Untitled', d.title_ar || null, d.title_en || null,
    d.excerpt || null, d.excerpt_ar || null, d.excerpt_en || null,
    d.body || null, d.body_ar || null, d.body_en || null,
    d.alt_text || d.title || 'Gallery Image',
    d.category || null, d.display_order || 0, extraImages, d.date || null, d.id
  ).run();
  return json({ success: true });
}

/* ── Articles (mapped to gallery for compatibility) ── */
async function handleArticles(request, env) {
  // Articles are stored in the gallery table
  return handleGallery(request, env);
}

/* ── Settings ── */
async function handleSettings(request, env) {
  if (!env.DB) return json({ error: 'D1 database not bound.' }, 500);

  if (request.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT setting_key, setting_value FROM settings').all();
    const settings = {};
    results.forEach(r => { settings[r.setting_key] = r.setting_value; });
    return json(settings);
  }

  if (request.method === 'PUT') {
    const data = await request.json();
    const stmts = Object.entries(data).map(([key, value]) =>
      env.DB.prepare(
        `INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)
         ON CONFLICT(setting_key) DO UPDATE SET setting_value=?, updated_at=CURRENT_TIMESTAMP`
      ).bind(key, String(value), String(value))
    );
    await env.DB.batch(stmts);
    return json({ success: true });
  }

  return json({ error: 'Method not allowed' }, 405);
}

/* ── Health check ── */
async function handleTest(env) {
  const dbOk = env.DB
    ? await env.DB.prepare('SELECT 1 as ok').first().then(() => true).catch(() => false)
    : false;
  const bucketOk = !!env.BUCKET;
  return json({ status: 'ok', db: dbOk, bucket: bucketOk });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}
