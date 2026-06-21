// Cloudflare Worker for R2 Image Upload and Settings API
// Deploy this to Cloudflare Workers and bind it to your R2 bucket and D1 database

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // SEO: 301 redirect www to non-www (canonical URL)
    const hostname = url.hostname;
    if (hostname.startsWith('www.')) {
      const nonWwwHostname = hostname.slice(4);
      const redirectUrl = `${url.protocol}//${nonWwwHostname}${url.pathname}${url.search}`;
      return Response.redirect(redirectUrl, 301);
    }

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, PUT, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Health check / test endpoint
    if (path === '/test') {
      if (!env.DB) {
        return new Response(JSON.stringify({ status: 'error', message: 'Database binding not found' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      try {
        const result = await env.DB.prepare('SELECT 1 as test').first();
        return new Response(JSON.stringify({ status: 'ok', message: 'Database binding working', result }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ status: 'error', message: error.message }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // Settings API endpoints
    if (path === '/settings') {
      if (!env.DB) {
        return new Response(JSON.stringify({ error: 'D1 database not bound. Set binding = "DB" in wrangler.toml and redeploy.' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      if (request.method === 'GET') {
        try {
          const result = await env.DB.prepare('SELECT setting_key, setting_value FROM settings').all();
          const settings = {};
          result.results.forEach(row => {
            // Exclude password hash from public settings response
            if (row.setting_key !== 'admin_password_hash') {
              settings[row.setting_key] = row.setting_value;
            }
          });
          return new Response(JSON.stringify(settings), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        } catch (error) {
          console.error('Settings fetch error:', error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      }

      if (request.method === 'PUT') {
        try {
          const body = await request.json();
          const updates = [];

          for (const [key, value] of Object.entries(body)) {
            updates.push(
              env.DB.prepare(
                'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON CONFLICT(setting_key) DO UPDATE SET setting_value = ?, updated_at = CURRENT_TIMESTAMP'
              ).bind(key, String(value), String(value)).run()
            );
          }

          await Promise.all(updates);

          return new Response(JSON.stringify({ success: true }), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        } catch (error) {
          console.error('Settings update error:', error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      }
    }

    // Products API endpoints
    if (path === '/products') {
      if (!env.DB) {
        return new Response(JSON.stringify({ error: 'D1 database not bound' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      if (request.method === 'GET') {
        try {
          const result = await env.DB.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
          return new Response(JSON.stringify(result.results), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        } catch (error) {
          console.error('Products fetch error:', error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      }

      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const result = await env.DB.prepare(
            'INSERT INTO products (name, name_ar, name_en, category, price, description, description_ar, description_en, image_url, in_stock, featured, keywords, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          ).bind(
            body.name,
            body.name_ar || null,
            body.name_en || null,
            body.category,
            body.price,
            body.description,
            body.description_ar || null,
            body.description_en || null,
            body.image_url,
            body.in_stock ? 1 : 0,
            body.featured ? 1 : 0,
            body.keywords || null,
            body.type
          ).run();

          return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        } catch (error) {
          console.error('Product create error:', error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      }

      if (request.method === 'PUT') {
        try {
          const body = await request.json();
          await env.DB.prepare(
            'UPDATE products SET name = ?, name_ar = ?, name_en = ?, category = ?, price = ?, description = ?, description_ar = ?, description_en = ?, image_url = ?, in_stock = ?, featured = ?, keywords = ?, type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
          ).bind(
            body.name,
            body.name_ar || null,
            body.name_en || null,
            body.category,
            body.price,
            body.description,
            body.description_ar || null,
            body.description_en || null,
            body.image_url,
            body.in_stock ? 1 : 0,
            body.featured ? 1 : 0,
            body.keywords || null,
            body.type,
            body.id
          ).run();

          return new Response(JSON.stringify({ success: true }), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        } catch (error) {
          console.error('Product update error:', error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      }

      if (request.method === 'DELETE') {
        try {
          const body = await request.json();
          await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(body.id).run();

          return new Response(JSON.stringify({ success: true }), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        } catch (error) {
          console.error('Product delete error:', error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      }
    }

    // Gallery API
    if (path === '/gallery') {
      if (request.method === 'GET') {
        try {
          const result = await env.DB.prepare('SELECT * FROM gallery ORDER BY created_at DESC').all();
          return new Response(JSON.stringify(result.results), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        } catch (error) {
          console.error('Gallery fetch error:', error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      }

      if (request.method === 'POST') {
        try {
          const body = await request.json();
          console.log('Gallery POST request received:', body);

          if (!env.DB) {
            console.error('Database binding not available');
            return new Response(JSON.stringify({ error: 'Database binding not available' }), {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            });
          }

          // Handle extra_images - ensure it's a valid JSON string or null
          let extraImagesValue = null;
          if (body.extra_images) {
            if (typeof body.extra_images === 'string') {
              // It's already a string, validate it's JSON
              try {
                JSON.parse(body.extra_images); // Validate it's valid JSON
                extraImagesValue = body.extra_images;
                console.log('Extra images validated as JSON string');
              } catch (e) {
                console.error('Invalid JSON in extra_images:', body.extra_images);
                extraImagesValue = null;
              }
            } else if (Array.isArray(body.extra_images)) {
              // It's an array, stringify it
              extraImagesValue = JSON.stringify(body.extra_images);
              console.log('Extra images converted from array to JSON string');
            } else {
              // Invalid format, convert to null
              console.error('Invalid extra_images format:', typeof body.extra_images);
              extraImagesValue = null;
            }
          }

          console.log('Attempting database insert with essential columns...');
          const result = await env.DB.prepare(
            'INSERT INTO gallery (image_url, title, description, alt_text, category, extra_images) VALUES (?, ?, ?, ?, ?, ?)'
          ).bind(
            body.image_url,
            body.title || 'Untitled',
            body.description || null,
            body.alt_text || body.title || 'Gallery Image',
            body.category || null,
            extraImagesValue
          ).run();

          console.log('Gallery insert result:', result);
          console.log('Insert success:', result.success);
          console.log('Last row ID:', result.meta?.last_row_id);
          console.log('Changes:', result.meta?.changes);
          console.log('Full meta:', result.meta);

          if (!result.success) {
            throw new Error(`Database insert failed: ${result.error}`);
          }

          const lastRowId = result.meta?.last_row_id || null;
          console.log('Returning last_row_id:', lastRowId);

          return new Response(JSON.stringify({ success: true, last_row_id: lastRowId }), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        } catch (error) {
          console.error('Gallery create error:', error);
          return new Response(JSON.stringify({ error: error.message, details: error.stack }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      }

      if (request.method === 'PUT') {
        try {
          const body = await request.json();

          // Handle extra_images - ensure it's a valid JSON string or null
          let extraImagesValue = null;
          if (body.extra_images) {
            if (typeof body.extra_images === 'string') {
              // It's already a string, validate it's JSON
              try {
                JSON.parse(body.extra_images); // Validate it's valid JSON
                extraImagesValue = body.extra_images;
              } catch (e) {
                console.error('Invalid JSON in extra_images:', body.extra_images);
                extraImagesValue = null;
              }
            } else if (Array.isArray(body.extra_images)) {
              // It's an array, stringify it
              extraImagesValue = JSON.stringify(body.extra_images);
            } else {
              // Invalid format, convert to null
              console.error('Invalid extra_images format:', typeof body.extra_images);
              extraImagesValue = null;
            }
          }

          await env.DB.prepare(
            'UPDATE gallery SET image_url = ?, title = ?, title_ar = ?, title_en = ?, description = ?, description_ar = ?, description_en = ?, alt_text = ?, category = ?, display_order = ?, extra_images = ? WHERE id = ?'
          ).bind(
            body.image_url,
            body.title || 'Untitled',
            body.title_ar || null,
            body.title_en || null,
            body.description || null,
            body.description_ar || null,
            body.description_en || null,
            body.alt_text || body.title || 'Gallery Image',
            body.category || null,
            body.display_order || 0,
            extraImagesValue,
            body.id
          ).run();

          return new Response(JSON.stringify({ success: true }), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        } catch (error) {
          console.error('Gallery update error:', error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      }

      if (request.method === 'DELETE') {
        try {
          const body = await request.json();
          await env.DB.prepare('DELETE FROM gallery WHERE id = ?').bind(body.id).run();

          return new Response(JSON.stringify({ success: true }), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        } catch (error) {
          console.error('Gallery delete error:', error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      }
    }

    // Image upload endpoint
    if (path === '/upload') {
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
      }

      try {
        const formData = await request.formData();
        const file = formData.get('file');
        const folder = formData.get('folder') || 'products';

        if (!file) {
          return new Response('No file provided', { status: 400 });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const extension = file.name.split('.').pop();
        const filename = `${folder}/${timestamp}-${random}.${extension}`;

        // Upload to R2
        await env.BUCKET.put(filename, file);

        // Return public URL
        const publicUrl = `https://pub-943bd5d0ce6f4df9b0b9cbc05bec9e54.r2.dev/${filename}`;

        return new Response(JSON.stringify({ url: publicUrl }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (error) {
        console.error('Upload error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    return new Response('Not found', { status: 404 });
  },
};
