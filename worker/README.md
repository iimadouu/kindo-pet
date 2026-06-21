# Kindo Worker

Cloudflare Worker handling image uploads (R2) and data CRUD (D1).

## Deploy

```bash
cd worker
npm install -g wrangler   # if not installed
wrangler login

# Create D1 database (first time only)
wrangler d1 create kindo-db
# Copy the database_id into wrangler.toml

# Run schema migrations
wrangler d1 execute kindo-db --file=schema.sql

# Set secrets (never commit these)
wrangler secret put R2_PUBLIC_URL
# Enter: https://pub-943bd5d0ce6f4df9b0b9cbc05bec9e54.r2.dev

# Deploy the worker
wrangler deploy
```

## Endpoints

| Method | Path        | Description                    |
|--------|-------------|--------------------------------|
| GET    | /test       | Health check (DB + bucket)     |
| POST   | /upload     | Upload image to R2             |
| GET    | /products   | List all products              |
| POST   | /products   | Create product                 |
| PUT    | /products   | Update product                 |
| DELETE | /products   | Delete product `{ id }`        |
| GET    | /gallery    | List all gallery items         |
| POST   | /gallery    | Create gallery item            |
| PUT    | /gallery    | Update gallery item            |
| DELETE | /gallery    | Delete gallery item `{ id }`   |
| GET    | /settings   | Get all settings               |
| PUT    | /settings   | Update settings (key-value)    |

## R2 Bucket

The `kindo-images` bucket must be created in the Cloudflare dashboard.
Public access URL: `https://pub-943bd5d0ce6f4df9b0b9cbc05bec9e54.r2.dev`
