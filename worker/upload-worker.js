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
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    try {
      if (path === '/upload' && request.method === 'POST') return handleUpload(request, env);
      if (path === '/products') return handleProducts(request, env);
      if (path === '/gallery') return handleGallery(request, env);
      if (path === '/settings') return handleSettings(request, env);
      if (path === '/test') return handleTest(env);
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

  if (request.method === 'POST') {
    const d = await request.json();
    const result = await env.DB.prepare(
      `INSERT INTO products
        (name, name_ar, category, type, price, description, description_ar, image_url, in_stock, featured, keywords)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      d.name, d.name_ar || null, d.category, d.type || 'food', d.price,
      d.description || null, d.description_ar || null, d.image_url,
      d.in_stock ? 1 : 0, d.featured ? 1 : 0, d.keywords || null
    ).run();
    return json({ success: true, id: result.meta?.last_row_id });
  }

  if (request.method === 'PUT') {
    const d = await request.json();
    await env.DB.prepare(
      `UPDATE products SET name=?, name_ar=?, category=?, type=?, price=?, description=?,
       description_ar=?, image_url=?, in_stock=?, featured=?, keywords=?,
       updated_at=CURRENT_TIMESTAMP WHERE id=?`
    ).bind(
      d.name, d.name_ar || null, d.category, d.type || 'food', d.price,
      d.description || null, d.description_ar || null, d.image_url,
      d.in_stock ? 1 : 0, d.featured ? 1 : 0, d.keywords || null, d.id
    ).run();
    return json({ success: true });
  }

  if (request.method === 'DELETE') {
    const { id } = await request.json();
    await env.DB.prepare('DELETE FROM products WHERE id=?').bind(id).run();
    return json({ success: true });
  }

  return json({ error: 'Method not allowed' }, 405);
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

  if (request.method === 'POST') {
    const d = await request.json();
    const extraImages = Array.isArray(d.extra_images)
      ? JSON.stringify(d.extra_images)
      : (typeof d.extra_images === 'string' ? d.extra_images : null);

    const result = await env.DB.prepare(
      `INSERT INTO gallery
        (image_url, title, title_ar, description, description_ar, alt_text, category, display_order, extra_images)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      d.image_url, d.title || 'Untitled', d.title_ar || null,
      d.description || null, d.description_ar || null,
      d.alt_text || d.title || 'Gallery Image',
      d.category || null, d.display_order || 0, extraImages
    ).run();
    return json({ success: true, last_row_id: result.meta?.last_row_id });
  }

  if (request.method === 'PUT') {
    const d = await request.json();
    const extraImages = Array.isArray(d.extra_images)
      ? JSON.stringify(d.extra_images)
      : (typeof d.extra_images === 'string' ? d.extra_images : null);

    await env.DB.prepare(
      `UPDATE gallery SET image_url=?, title=?, title_ar=?, description=?, description_ar=?,
       alt_text=?, category=?, display_order=?, extra_images=?, updated_at=CURRENT_TIMESTAMP
       WHERE id=?`
    ).bind(
      d.image_url, d.title || 'Untitled', d.title_ar || null,
      d.description || null, d.description_ar || null,
      d.alt_text || d.title || 'Gallery Image',
      d.category || null, d.display_order || 0, extraImages, d.id
    ).run();
    return json({ success: true });
  }

  if (request.method === 'DELETE') {
    const { id } = await request.json();
    await env.DB.prepare('DELETE FROM gallery WHERE id=?').bind(id).run();
    return json({ success: true });
  }

  return json({ error: 'Method not allowed' }, 405);
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
