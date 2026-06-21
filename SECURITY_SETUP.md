# 🔒 Security Setup Guide

## ⚠️ CRITICAL: Credentials Exposed

Your R2 credentials were exposed in the `,env` file. Here's what you need to do:

---

## 🚨 IMMEDIATE ACTIONS REQUIRED

### 1. Rotate Your R2 Credentials (URGENT!)

Your current credentials are compromised. You need to create NEW credentials:

1. **Go to Cloudflare Dashboard**:
   - Navigate to: R2 → kindo-images bucket
   - Click "Manage R2 API Tokens"

2. **Delete the old token**:
   - Find the token with Access Key: `70f7e054e02c700e89a5a46da5773c47`
   - Click "Delete" or "Revoke"

3. **Create a new token**:
   - Click "Create API Token"
   - Permission: "Object Read & Write"
   - Apply to: "kindo-images" bucket only
   - Click "Create API Token"
   - **SAVE THE NEW CREDENTIALS SECURELY**

### 2. Update Your Secrets

Never store credentials in files! Use Wrangler secrets:

```bash
cd /home/iimadouu/Desktop/kindo-pet/worker

# Set R2 Public URL (this one is safe to know)
wrangler secret put R2_PUBLIC_URL
# When prompted, enter: https://pub-943bd5d0ce6f4df9b0b9cbc05bec9e54.r2.dev

# The R2 bucket is already bound in wrangler.toml
# Cloudflare automatically provides credentials via the binding
```

### 3. Clean Up Exposed Files

```bash
# Remove the misnamed file
rm /home/iimadouu/Desktop/kindo-pet/.env.worker

# Verify .env is in gitignore
cat /home/iimadouu/Desktop/kindo-pet/.gitignore | grep .env
```

---

## ✅ Correct Configuration Setup

### Frontend Configuration

**File**: `/artifacts/kindo/.env`
```env
# Worker URL (set this when worker is deployed)
VITE_WORKER_URL=https://kindo-upload-worker.YOUR-SUBDOMAIN.workers.dev

# Admin panel password (change this!)
VITE_ADMIN_PASSWORD=your-secure-password-here
```

**What goes here**:
- ✅ Frontend environment variables (VITE_*)
- ✅ Public URLs
- ✅ Non-sensitive configuration

**What NEVER goes here**:
- ❌ API keys
- ❌ Secret access keys
- ❌ Database credentials
- ❌ R2 credentials

### Worker Configuration

**File**: `/worker/wrangler.toml` (already correct ✓)
```toml
[[r2_buckets]]
binding = "BUCKET"
bucket_name = "kindo-images"

[[d1_databases]]
binding = "DB"
database_name = "kindo-db"
database_id = "9667ecc0-c85f-4d96-af13-a697ace3a4b4"
```

**What goes here**:
- ✅ Binding names
- ✅ Bucket names
- ✅ Database IDs
- ✅ Public configuration

**What NEVER goes here**:
- ❌ Access keys
- ❌ Secret keys
- ❌ Passwords

### Worker Secrets (Production)

**Set via Wrangler CLI**:
```bash
# For production deployment
wrangler secret put R2_PUBLIC_URL
```

### Worker Dev Vars (Local Development Only)

**File**: `/worker/.dev.vars` (already created ✓)
```env
R2_PUBLIC_URL=https://pub-943bd5d0ce6f4df9b0b9cbc05bec9e54.r2.dev
```

**Important**:
- ✅ Used ONLY for `wrangler dev` (local testing)
- ✅ Already in .gitignore
- ✅ R2_PUBLIC_URL is safe (it's public)
- ❌ Never commit this file

---

## 🔐 How R2 Authentication Works

### You DON'T need to manually provide credentials!

When you bind an R2 bucket in `wrangler.toml`:

```toml
[[r2_buckets]]
binding = "BUCKET"
bucket_name = "kindo-images"
```

Cloudflare **automatically**:
1. Authenticates your worker
2. Provides access to the bucket
3. Handles all credentials securely
4. No keys needed in code!

Your worker code uses it like this:
```javascript
await env.BUCKET.put(key, data)  // ✓ Secure, automatic auth
```

---

## 📋 Current Status

### Files Created:
- ✅ `/artifacts/kindo/.env` - Frontend config (VITE_WORKER_URL empty for local dev)
- ✅ `/worker/.dev.vars` - Worker dev config (only R2_PUBLIC_URL)
- ✅ `.gitignore` updated to exclude all sensitive files

### Files to Remove:
- ❌ `/,env` - Renamed to `.env.worker` (but should be deleted)
- ❌ `.env.worker` - Should be deleted after rotating credentials

### Action Required:
1. **Rotate R2 credentials** (most important!)
2. Delete exposed credential files
3. Set worker secrets via `wrangler secret put`
4. Never commit `.env` files

---

## 🧪 Testing Configuration

### Local Development (No Worker)

```bash
cd /home/iimadouu/Desktop/kindo-pet/artifacts/kindo

# .env should have:
# VITE_WORKER_URL=
# (empty means local dev mode)

npm run dev
```

**Result**: Uses localStorage, no database, perfect for testing UI.

### Local Worker Development

```bash
cd /home/iimadouu/Desktop/kindo-pet/worker

# Start local worker
wrangler dev

# In another terminal:
cd /home/iimadouu/Desktop/kindo-pet/artifacts/kindo

# Update .env:
# VITE_WORKER_URL=http://localhost:8787

npm run dev
```

**Result**: Frontend talks to local worker, which talks to remote D1/R2.

### Production

```bash
# Deploy worker
cd /home/iimadouu/Desktop/kindo-pet/worker
wrangler secret put R2_PUBLIC_URL
# Enter: https://pub-943bd5d0ce6f4df9b0b9cbc05bec9e54.r2.dev
wrangler deploy

# Update frontend .env:
# VITE_WORKER_URL=https://kindo-upload-worker.YOUR-SUBDOMAIN.workers.dev

# Deploy frontend
cd /home/iimadouu/Desktop/kindo-pet/artifacts/kindo
npm run build
# Upload dist/ to Cloudflare Pages
```

---

## 🎯 Security Best Practices

### DO:
- ✅ Use `wrangler secret put` for sensitive values
- ✅ Keep `.env` files in `.gitignore`
- ✅ Use Cloudflare bindings for R2/D1 access
- ✅ Rotate credentials if exposed
- ✅ Use different credentials for dev/prod

### DON'T:
- ❌ Commit `.env` files
- ❌ Share API keys publicly
- ❌ Put secrets in `wrangler.toml`
- ❌ Use the same password for everything
- ❌ Hardcode credentials in code

---

## 📞 Next Steps

1. **Rotate R2 credentials** (do this NOW!)
2. **Delete sensitive files**:
   ```bash
   rm /home/iimadouu/Desktop/kindo-pet/.env.worker
   ```

3. **Test local development**:
   ```bash
   cd artifacts/kindo
   npm run dev
   # Should work without worker (local mode)
   ```

4. **When ready to deploy**:
   - Deploy worker: `wrangler deploy`
   - Set secrets: `wrangler secret put R2_PUBLIC_URL`
   - Update frontend .env with worker URL
   - Deploy frontend

---

## 🆘 If Credentials Already Leaked

If these credentials were pushed to GitHub or shared publicly:

1. **Rotate immediately** (see step 1 above)
2. **Check Cloudflare logs** for unauthorized access
3. **Enable 2FA** on your Cloudflare account
4. **Review recent activity** in R2 bucket

---

**Current Security Status**: ⚠️ NEEDS ATTENTION

**After following this guide**: ✅ SECURE
