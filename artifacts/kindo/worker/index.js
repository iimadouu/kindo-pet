/**
 * Kindo Cloudflare Worker
 *
 * Bindings required (wrangler.toml):
 *   DB  → D1 database  (products, articles, settings)
 *   R2  → R2 bucket    (image storage)
 *
 * Vars required (wrangler.toml [vars]):
 *   R2_PUBLIC_URL → e.g. https://pub-xxx.r2.dev
 *
 * Images are uploaded to R2 and served directly via the public R2 URL
 * — no Worker CPU cost for image serving.
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

const DATA_KEYS = ['products', 'articles', 'settings'];

async function handleRequest(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  /* ── POST /api/upload — upload image to R2, return public CDN URL ── */
  if (path === '/api/upload' && method === 'POST') {
    let formData;
    try { formData = await request.formData(); }
    catch { return json({ error: 'Invalid form data' }, 400); }

    const file = formData.get('file');
    if (!file || typeof file === 'string') return json({ error: 'No file provided' }, 400);

    const raw = file.name ?? 'image';
    const ext = raw.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const key = `images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    try {
      await env.R2.put(key, file.stream(), {
        httpMetadata: { contentType: file.type || 'image/jpeg' },
      });
    } catch (err) {
      return json({ error: `R2 upload failed: ${err.message}` }, 500);
    }

    // Serve image directly from the public R2 CDN URL (fast, no Worker cost)
    const publicBase = (env.R2_PUBLIC_URL ?? '').replace(/\/$/, '');
    const imageUrl = `${publicBase}/${key}`;
    return json({ url: imageUrl, key });
  }

  /* ── GET|PUT /api/products|articles|settings — D1 CRUD ── */
  const dataKey = DATA_KEYS.find(k => path === `/api/${k}`);
  if (dataKey) {
    if (method === 'GET') {
      let row;
      try {
        row = await env.DB
          .prepare('SELECT value FROM kindo_data WHERE key = ?')
          .bind(dataKey)
          .first();
      } catch (err) {
        return json({ error: `DB read failed: ${err.message}` }, 500);
      }
      if (!row) return json(dataKey === 'settings' ? {} : []);
      try { return json(JSON.parse(row.value)); }
      catch { return json(dataKey === 'settings' ? {} : []); }
    }

    if (method === 'PUT') {
      let body;
      try { body = await request.json(); }
      catch { return json({ error: 'Invalid JSON body' }, 400); }

      try {
        await env.DB
          .prepare(
            'INSERT OR REPLACE INTO kindo_data (key, value, updated_at) VALUES (?, ?, unixepoch())'
          )
          .bind(dataKey, JSON.stringify(body))
          .run();
      } catch (err) {
        return json({ error: `DB write failed: ${err.message}` }, 500);
      }
      return json({ ok: true });
    }
  }

  return json({ error: 'Not found' }, 404);
}

export default {
  async fetch(request, env) {
    try {
      return await handleRequest(request, env);
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err?.message ?? 'Unknown error' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
      );
    }
  },
};
