# Database Schema vs Application Analysis

## ⚠️ CRITICAL ISSUES FOUND

I've analyzed the entire codebase including the Admin forms, TypeScript interfaces, and database schema. Here are the **mismatches** that will cause SQL errors when you try to add/edit data:

---

## 1. 🔴 PRODUCTS - CRITICAL MISMATCHES

### Database Schema (schema.sql)
```sql
CREATE TABLE IF NOT EXISTS products (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  name_ar      TEXT,
  name_en      TEXT,
  category     TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'food',
  price        REAL NOT NULL DEFAULT 0,
  description  TEXT,
  description_ar TEXT,
  description_en TEXT,
  image_url    TEXT,              -- ❌ SINGLE IMAGE
  in_stock     INTEGER NOT NULL DEFAULT 1,
  featured     INTEGER NOT NULL DEFAULT 0,
  keywords     TEXT,
  specs        TEXT,
  created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Frontend TypeScript Interface
```typescript
export interface Product {
  id: string;
  nameFR: string;      // ❌ Uses FR/AR naming
  nameAR: string;
  descriptionFR: string;
  descriptionAR: string;
  category: 'dogs' | 'cats' | 'birds' | 'fish';
  type: 'food' | 'accessory';
  price: number;
  images: string[];    // ❌ ARRAY of images
  specs: Record<string, string>;
  featured: boolean;
}
```

### Admin Form Expects
```typescript
// ProductFormDialog collects:
{
  nameFR: string,           // DB expects: name
  nameAR: string,           // DB expects: name_ar
  descriptionFR: string,    // DB expects: description
  descriptionAR: string,    // DB expects: description_ar
  images: string[],         // ❌ DB only has: image_url (single)
  category: string,         // ✓ Matches
  type: string,             // ✓ Matches
  price: number,            // ✓ Matches
  featured: boolean,        // DB expects: INTEGER (0/1)
  specs: Record<string,string> // DB expects: TEXT (JSON string)
}
```

### Worker API Expectations (upload-worker.js)
```javascript
// POST/PUT /products expects:
{
  name: string,            // ❌ Frontend sends nameFR
  name_ar: string,
  name_en: string,
  description: string,     // ❌ Frontend sends descriptionFR
  description_ar: string,
  description_en: string,
  image_url: string,       // ❌ Frontend sends images array
  category: string,
  type: string,
  price: number,
  in_stock: 0/1,          // ❌ Frontend doesn't send this
  featured: 0/1,
  keywords: string,        // ❌ Frontend doesn't send this
  specs: string (JSON)
}
```

### 🔧 What Will Break:
1. **Multiple Images**: Admin allows adding multiple images, but DB only stores ONE in `image_url`
2. **Field Name Mismatch**: Frontend uses `nameFR/nameAR`, worker expects `name/name_ar`
3. **Missing Fields**: Frontend doesn't send `name_en`, `description_en`, `in_stock`, `keywords`
4. **Type Mismatch**: `featured` sent as boolean, DB expects INTEGER
5. **EN Fields**: Database has `name_en` and `description_en` but they're never used

---

## 2. 🟡 GALLERY/ARTICLES - MODERATE ISSUES

### Database Schema
```sql
CREATE TABLE IF NOT EXISTS gallery (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url      TEXT NOT NULL,
  title          TEXT NOT NULL DEFAULT 'Untitled',
  title_ar       TEXT,
  title_en       TEXT,
  excerpt        TEXT,
  excerpt_ar     TEXT,
  excerpt_en     TEXT,
  body           TEXT,
  body_ar        TEXT,
  body_en        TEXT,
  alt_text       TEXT,
  category       TEXT,
  display_order  INTEGER NOT NULL DEFAULT 0,
  extra_images   TEXT,           -- ⚠️ For additional images (JSON)
  date           TEXT,
  created_at     TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Frontend TypeScript Interface
```typescript
export interface Article {
  id: string;
  titleFR: string;      // ❌ DB expects: title
  titleAR: string;      // DB expects: title_ar
  excerptFR: string,    // DB expects: excerpt
  excerptAR: string,    // DB expects: excerpt_ar
  bodyFR: string,       // DB expects: body
  bodyAR: string,       // DB expects: body_ar
  image: string,        // DB expects: image_url
  date: string          // ✓ Matches
}
```

### Admin Form Expects
```typescript
// ArticleFormDialog collects:
{
  titleFR: string,      // DB expects: title
  titleAR: string,      // DB expects: title_ar
  excerptFR: string,    // DB expects: excerpt
  excerptAR: string,    // DB expects: excerpt_ar
  bodyFR: string,       // DB expects: body
  bodyAR: string,       // DB expects: body_ar
  image: string,        // DB expects: image_url
  date: string          // ✓ Matches
}
```

### 🔧 What Will Break:
1. **Field Name Mismatch**: Frontend uses `titleFR/titleAR`, worker expects `title/title_ar`
2. **Image Field**: Frontend uses `image`, DB expects `image_url`
3. **Missing Fields**: Frontend doesn't send `title_en`, `excerpt_en`, `body_en`, `alt_text`, `category`, `display_order`, `extra_images`
4. **Worker Fallback**: The worker has fallbacks (`d.title ?? d.description`), so it might partially work but is fragile

---

## 3. ✅ SETTINGS - MOSTLY OK

### Database Schema
```sql
CREATE TABLE IF NOT EXISTS settings (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key   TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Settings are stored as **key-value pairs** and the worker converts them to a flat object, which matches what the frontend expects. This should work fine.

### ⚠️ Minor Issue:
The frontend interface has camelCase properties like `whatsappNumber`, but the DB likely uses snake_case keys like `whatsapp_number`. The worker should handle this conversion, but verify the actual keys in the database match what's expected.

---

## 🎯 RECOMMENDATIONS

### Option 1: Fix the Frontend (RECOMMENDED)
Update the Admin forms and TypeScript interfaces to match the database schema:

**Changes needed:**
1. Rename all fields to match DB schema:
   - `nameFR` → `name`
   - `nameAR` → `name_ar`
   - `descriptionFR` → `description`
   - `descriptionAR` → `description_ar`
   - `titleFR` → `title`
   - `image` → `image_url`
   - `images` → single `image_url` field

2. Add missing fields to forms:
   - `name_en`, `description_en` for products
   - `title_en`, `excerpt_en`, `body_en` for articles
   - `in_stock` checkbox for products
   - `keywords` input for products
   - `alt_text`, `category`, `display_order` for gallery

3. Handle multiple images properly:
   - Store first image in `image_url`
   - Store additional images in `specs` JSON for products
   - Store additional images in `extra_images` JSON for gallery

### Option 2: Fix the Database Schema
Migrate the database to match frontend expectations:

```sql
-- Would need to:
ALTER TABLE products RENAME COLUMN name TO nameFR;
ALTER TABLE products RENAME COLUMN image_url TO images;
-- etc... (but SQLite doesn't support all these operations easily)
```

This is **NOT recommended** because:
- SQLite has limited ALTER TABLE support
- It would require data migration
- The current schema is more standard

### Option 3: Add a Translation Layer
Create a mapper function that translates between frontend and backend formats:

```typescript
function productToDbFormat(product: Product) {
  return {
    name: product.nameFR,
    name_ar: product.nameAR,
    image_url: product.images[0],
    // ... etc
  };
}

function dbToProductFormat(dbProduct: any): Product {
  return {
    nameFR: dbProduct.name,
    nameAR: dbProduct.name_ar,
    images: [dbProduct.image_url],
    // ... etc
  };
}
```

---

## 🚨 IMMEDIATE ACTION ITEMS

1. **DO NOT try to add products yet** - it will fail with column errors
2. **Choose a fix strategy** (I recommend Option 1 - fix the frontend)
3. **Test with the `/test` endpoint** to verify database connection
4. **Back up any existing data** before making changes

---

## 📋 COMPLETE FIELD MAPPING

### Products Field Mapping
| Frontend (Product interface) | Database (products table) | Worker expects | Status |
|------------------------------|---------------------------|----------------|--------|
| `id` (string) | `id` (INTEGER) | `id` | ⚠️ Type mismatch |
| `nameFR` | `name` | `name` | ❌ Name mismatch |
| `nameAR` | `name_ar` | `name_ar` | ✅ OK |
| - | `name_en` | `name_en` | ❌ Missing |
| `descriptionFR` | `description` | `description` | ❌ Name mismatch |
| `descriptionAR` | `description_ar` | `description_ar` | ✅ OK |
| - | `description_en` | `description_en` | ❌ Missing |
| `category` | `category` | `category` | ✅ OK |
| `type` | `type` | `type` | ✅ OK |
| `price` | `price` | `price` | ✅ OK |
| `images[]` | `image_url` | `image_url` | ❌ Type mismatch |
| - | `in_stock` | `in_stock` | ❌ Missing |
| `featured` (boolean) | `featured` (INTEGER) | `featured` (0/1) | ⚠️ Type mismatch |
| - | `keywords` | `keywords` | ❌ Missing |
| `specs` (object) | `specs` (TEXT) | `specs` (JSON string) | ⚠️ Needs serialization |

### Gallery/Articles Field Mapping
| Frontend (Article interface) | Database (gallery table) | Worker expects | Status |
|-----------------------------|--------------------------|----------------|--------|
| `id` (string) | `id` (INTEGER) | `id` | ⚠️ Type mismatch |
| `titleFR` | `title` | `title` | ❌ Name mismatch |
| `titleAR` | `title_ar` | `title_ar` | ✅ OK |
| - | `title_en` | `title_en` | ❌ Missing |
| `excerptFR` | `excerpt` | `excerpt` | ❌ Name mismatch |
| `excerptAR` | `excerpt_ar` | `excerpt_ar` | ✅ OK |
| - | `excerpt_en` | `excerpt_en` | ❌ Missing |
| `bodyFR` | `body` | `body` | ❌ Name mismatch |
| `bodyAR` | `body_ar` | `body_ar` | ✅ OK |
| - | `body_en` | `body_en` | ❌ Missing |
| `image` | `image_url` | `image_url` | ❌ Name mismatch |
| - | `alt_text` | `alt_text` | ❌ Missing |
| - | `category` | `category` | ❌ Missing |
| - | `display_order` | `display_order` | ❌ Missing |
| - | `extra_images` | `extra_images` | ❌ Missing |
| `date` | `date` | `date` | ✅ OK |

---

Would you like me to implement the fixes? I recommend **Option 1** (updating the frontend to match the database schema).
