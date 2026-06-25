-- Kindo D1 Database Schema
-- Run via: wrangler d1 execute kindo-db --command="$(cat ./schema.sql)" --remote

CREATE TABLE IF NOT EXISTS products (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  name_ar      TEXT,
  name_en      TEXT,
  category     TEXT NOT NULL CHECK(category IN ('dogs','cats','birds','fish','none')),
  type         TEXT NOT NULL DEFAULT 'food' CHECK(type IN ('food','accessory')),
  price        REAL NOT NULL DEFAULT 0,
  description  TEXT,
  description_ar TEXT,
  description_en TEXT,
  image_url    TEXT,
  in_stock     INTEGER NOT NULL DEFAULT 1,
  featured     INTEGER NOT NULL DEFAULT 0,
  keywords     TEXT,
  specs        TEXT,
  food_category TEXT,
  food_category_ar TEXT,
  accessory_category TEXT,
  accessory_category_ar TEXT,
  created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
  extra_images   TEXT,
  date           TEXT,
  created_at     TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key   TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Default settings
INSERT OR IGNORE INTO settings (setting_key, setting_value) VALUES
  ('whatsapp_number', '+213XXXXXXXXX'),
  ('facebook_url', 'https://facebook.com/kindo'),
  ('instagram_url', 'https://instagram.com/kindo'),
  ('promo_text_fr', 'Livraison gratuite dès 5000 DA sur Alger et environs'),
  ('promo_text_ar', 'شحن مجاني من 5000 دج في الجزائر العاصمة وضواحيها'),
  ('address_fr', 'Alger, Algérie'),
  ('address_ar', 'الجزائر العاصمة، الجزائر'),
  ('address_en', 'Algiers, Algeria'),
  ('phone', '+213 555 000 000'),
  ('email', 'contact@kindo.dz'),
  ('ad_banner_enabled', 'false'),
  ('ad_banner_image', ''),
  ('ad_banner_title_fr', ''),
  ('ad_banner_title_ar', ''),
  ('ad_banner_title_en', ''),
  ('ad_banner_desc_fr', ''),
  ('ad_banner_desc_ar', ''),
  ('ad_banner_desc_en', ''),
  ('ad_banner_link_url', '');
