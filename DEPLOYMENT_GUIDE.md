# 🚀 Complete Deployment Guide

## Prerequisites

- [x] Cloudflare account
- [x] Wrangler CLI installed: `npm install -g wrangler`
- [x] R2 bucket created: `kindo-images`
- [x] D1 database created: `kindo-db`
- [x] Node.js and npm installed

---

## 🔧 Step 1: Setup Worker

### A. Initialize Database

```bash
cd /home/iimadouu/Desktop/kindo-pet/worker

# Create D1 database (if not exists)
wrangler d1 create kindo-db

# Initialize schema
wrangler d1 execute kindo-db --file=./schema.sql --remote

# Verify it worked
wrangler d1 execute kindo-db --command="SELECT * FROM settings LIMIT 5" --remote
```

**Expected**: You should see the default settings rows.

### B. Configure Worker Bindings

Edit `wrangler.toml` and update the database_id (already done ✓):

```toml
[[d1_databases]]
binding = "DB"
database_name = "kindo-db"
database_id = "9667ecc0-c85f-4d96-af13-a697ace3a4b4"  # Your actual ID

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "kindo-images"  # Your bucket name
```

### C. Set Worker Secrets

```bash
# Set R2 public URL
wrangler secret put R2_PUBLIC_URL
# When prompted, enter: https://pub-943bd5d0ce6f4df9b0b9cbc05bec9e54.r2.dev

# Verify
wrangler secret list
```

### D. Deploy Worker

```bash
# Deploy to production
wrangler deploy

# Test it
curl https://kindo-upload-worker.YOUR-SUBDOMAIN.workers.dev/test
```

**Expected Response**:
```json
{
  "status": "ok",
  "db": true,
  "bucket": true
}
```

**Save your worker URL**: `https://kindo-upload-worker.YOUR-SUBDOMAIN.workers.dev`

---

## 🎨 Step 2: Setup Frontend

### A. Configure Environment

```bash
cd /home/iimadouu/Desktop/kindo-pet/artifacts/kindo

# Create/Edit .env
nano .env
```

Add:
```env
VITE_WORKER_URL=https://kindo-upload-worker.YOUR-SUBDOMAIN.workers.dev
VITE_ADMIN_PASSWORD=your-secure-password-here
```

**Important**: Change `your-secure-password-here` to something secure!

### B. Install Dependencies

```bash
npm install
```

### C. Test Locally with Worker

```bash
npm run dev
```

Visit: `http://localhost:5173/admin`
- Try adding a product
- Check browser console for errors
- Verify data saves and loads

### D. Build for Production

```bash
npm run build
```

The `dist/` folder is ready to deploy.

---

## ☁️ Step 3: Deploy Frontend to Cloudflare Pages

### Option A: Via Wrangler (Recommended)

```bash
cd /home/iimadouu/Desktop/kindo-pet/artifacts/kindo

# First time: Create Pages project
wrangler pages project create kindo-store

# Deploy
wrangler pages deploy dist --project-name=kindo-store

# Set environment variables in Pages dashboard:
# - VITE_WORKER_URL
# - VITE_ADMIN_PASSWORD
```

### Option B: Via Git Integration

1. **Push to GitHub**:
   ```bash
   cd /home/iimadouu/Desktop/kindo-pet
   git add .
   git commit -m "Deploy Kindo store"
   git push origin main
   ```

2. **Connect to Cloudflare Pages**:
   - Go to: Cloudflare Dashboard → Pages
   - Click "Create a project"
   - Connect to your Git repository
   - Select the repository
   - Configure build:
     - Build command: `cd artifacts/kindo && npm install && npm run build`
     - Build output directory: `artifacts/kindo/dist`
     - Root directory: `/`

3. **Set Environment Variables**:
   - In Pages → Settings → Environment variables
   - Add:
     - `VITE_WORKER_URL` = `https://kindo-upload-worker.YOUR-SUBDOMAIN.workers.dev`
     - `VITE_ADMIN_PASSWORD` = `your-secure-password`

4. **Deploy**:
   - Cloudflare will auto-deploy on push
   - Or manually trigger: Pages → Deployments → Retry deployment

### Option C: Manual Upload

1. **Build locally**:
   ```bash
   cd /home/iimadouu/Desktop/kindo-pet/artifacts/kindo
   npm run build
   ```

2. **Upload via Dashboard**:
   - Go to Cloudflare Pages
   - Create project → Direct upload
   - Upload the `dist/` folder

---

## ✅ Step 4: Verify Deployment

### A. Test Worker API

```bash
# Get products
curl https://kindo-upload-worker.YOUR-SUBDOMAIN.workers.dev/api/products

# Expected: [] (empty array initially)

# Test health
curl https://kindo-upload-worker.YOUR-SUBDOMAIN.workers.dev/test

# Expected: {"status":"ok","db":true,"bucket":true}
```

### B. Test Frontend

1. Visit: `https://kindo-store.pages.dev`
2. Navigate to: `/admin`
3. Login with your password
4. Add a test product
5. Verify it saves
6. Refresh page - should still be there

### C. Test Image Upload

1. In admin panel, add a product
2. Click "Upload" to upload an image
3. Should upload to R2 and return URL
4. URL should start with: `https://pub-943bd5d0ce6f4df9b0b9cbc05bec9e54.r2.dev/`

---

## 🔧 Troubleshooting

### Issue: "D1 database not bound"

**Solution**:
```bash
# Check wrangler.toml has correct database_id
cat worker/wrangler.toml

# Redeploy
wrangler deploy
```

### Issue: "R2 bucket not bound"

**Solution**:
```bash
# Verify bucket exists
wrangler r2 bucket list

# Check wrangler.toml
cat worker/wrangler.toml

# Redeploy
wrangler deploy
```

### Issue: "CORS error" in browser

**Solution**: Worker already has CORS enabled. Check:
1. Worker URL in `.env` is correct
2. No trailing slash in VITE_WORKER_URL
3. Clear browser cache

### Issue: "Column not found" SQL error

**Solution**:
```bash
# Re-run schema
wrangler d1 execute kindo-db --file=./worker/schema.sql --remote

# Check tables
wrangler d1 execute kindo-db --command="SELECT name FROM sqlite_master WHERE type='table'" --remote
```

### Issue: Product saves but doesn't persist

**Cause**: Running in local dev mode (no VITE_WORKER_URL)

**Solution**: Set `VITE_WORKER_URL` in `.env` and rebuild

### Issue: Image upload fails

**Check**:
1. R2 bucket exists
2. Worker has R2 binding
3. `R2_PUBLIC_URL` secret is set
4. File size < 25MB

---

## 📊 Monitoring

### View Worker Logs

```bash
wrangler tail
```

### Check D1 Database

```bash
# Count products
wrangler d1 execute kindo-db --command="SELECT COUNT(*) FROM products" --remote

# View all products
wrangler d1 execute kindo-db --command="SELECT id, name, price FROM products" --remote

# View settings
wrangler d1 execute kindo-db --command="SELECT * FROM settings" --remote
```

### Check R2 Storage

```bash
# List files
wrangler r2 object list kindo-images

# Check specific file
wrangler r2 object get kindo-images/uploads/filename.jpg
```

---

## 🔄 Updates & Maintenance

### Update Worker Code

```bash
cd /home/iimadouu/Desktop/kindo-pet/worker

# Make your changes to upload-worker.js

# Deploy
wrangler deploy
```

### Update Frontend

```bash
cd /home/iimadouu/Desktop/kindo-pet/artifacts/kindo

# Make your changes

# Build
npm run build

# Deploy (if using wrangler)
wrangler pages deploy dist --project-name=kindo-store

# Or git push if using Git integration
```

### Database Schema Changes

```bash
# If you need to add columns or tables:

# 1. Update schema.sql
nano worker/schema.sql

# 2. Create migration SQL
nano worker/migration.sql

# 3. Run migration
wrangler d1 execute kindo-db --file=./worker/migration.sql --remote

# 4. Update worker code if needed
# 5. Redeploy worker
```

---

## 🎯 Production Checklist

Before going live:

- [ ] Worker deployed and tested
- [ ] D1 database initialized
- [ ] R2 bucket configured
- [ ] R2_PUBLIC_URL secret set
- [ ] Frontend `.env` has correct VITE_WORKER_URL
- [ ] Admin password changed from default
- [ ] Test product CRUD operations
- [ ] Test article CRUD operations
- [ ] Test image upload
- [ ] Test settings update
- [ ] Custom domain configured (optional)
- [ ] SSL/HTTPS working
- [ ] CORS working
- [ ] All pages load correctly

---

## 📝 Post-Deployment

### Set Custom Domain (Optional)

#### For Frontend (Pages):
1. Cloudflare Pages → Custom domains
2. Add: `www.kindo.dz` or `kindo.dz`
3. Follow DNS setup instructions

#### For Worker:
1. Cloudflare Workers → kindo-upload-worker → Triggers
2. Add custom route: `api.kindo.dz/*`
3. Update frontend `.env`:
   ```env
   VITE_WORKER_URL=https://api.kindo.dz
   ```

### Enable Analytics

- Cloudflare Pages → Analytics (automatic)
- Workers → Analytics (automatic)

### Setup Backups

```bash
# Backup D1 database
wrangler d1 export kindo-db --output=backup.sql --remote

# Backup R2 (use rclone or similar)
```

---

## 🚀 You're Live!

Your Kindo pet store is now running on Cloudflare's global edge network:

- **Frontend**: Fast, cached worldwide
- **Worker**: Runs close to users globally
- **D1**: Distributed SQLite database
- **R2**: Object storage with no egress fees

**Next Steps**:
1. Add real products
2. Customize branding
3. Configure payment method (WhatsApp)
4. Share your store URL!

---

## 📞 Support

If you encounter issues:
1. Check worker logs: `wrangler tail`
2. Check browser console for frontend errors
3. Verify environment variables
4. Review this guide's troubleshooting section
