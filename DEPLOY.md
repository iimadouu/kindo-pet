# Kindo — Deploy Guide

## Architecture

```
GitHub repo
  └─ artifacts/kindo/     → Cloudflare Pages (React/Vite frontend)
  └─ worker/              → Cloudflare Worker (R2 uploads + D1 CRUD)
```

---

## 1. Deploy the Worker (backend)

```bash
cd worker

# First time: create D1 database
wrangler d1 create kindo-db
# Copy the database_id output into wrangler.toml → d1_databases[].database_id

# Run schema migrations
wrangler d1 execute kindo-db --file=schema.sql --remote

# Set the R2 public URL as a Worker secret
wrangler secret put R2_PUBLIC_URL
# Enter: https://pub-943bd5d0ce6f4df9b0b9cbc05bec9e54.r2.dev

# Deploy the worker
wrangler deploy
# Note the worker URL (e.g. https://kindo-upload-worker.xxx.workers.dev)
```

---

## 2. Deploy the Frontend (Cloudflare Pages)

In the Cloudflare Pages dashboard:

| Setting               | Value                                         |
|-----------------------|-----------------------------------------------|
| Build command         | `cd artifacts/kindo && BASE_PATH=/ pnpm run build` |
| Build output directory| `artifacts/kindo/dist/public`                 |
| Root directory        | `/` (repository root)                         |

**Environment variables** (Pages → Settings → Environment variables):

| Variable             | Value                                              |
|----------------------|----------------------------------------------------|
| VITE_WORKER_URL      | https://kindo-upload-worker.xxx.workers.dev         |
| VITE_ADMIN_PASSWORD  | (your chosen admin password — keep it secret)       |
| NODE_ENV             | production                                         |

---

## 3. Admin Panel

The admin panel is at `/admin` on your Pages domain (e.g. `https://kindo.pages.dev/admin`).

It is:
- Password protected (VITE_ADMIN_PASSWORD)
- Noindexed by robots
- Uncacheable

**Change the default password** (`kindo2024`) before going live by setting `VITE_ADMIN_PASSWORD` in Cloudflare Pages environment variables.

---

## 4. GitHub → Cloudflare Pages (automatic deploys)

1. Push repo to GitHub
2. In Cloudflare Pages → "Connect to Git" → select your repo
3. Set the build settings above
4. Every push to `main` triggers a new deploy automatically

---

## 5. Worker CORS

The Worker allows all origins (`*`) by default. To restrict to your Pages domain only, update the `CORS` headers in `worker/upload-worker.js`:

```js
const CORS = {
  'Access-Control-Allow-Origin': 'https://kindo.pages.dev',
  ...
};
```
