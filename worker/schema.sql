-- Kindo D1 Database Schema
-- Run via: wrangler d1 execute kindo-db --file=schema.sql

CREATE TABLE IF NOT EXISTS products (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  name_ar      TEXT,
  category     TEXT NOT NULL CHECK(category IN ('dogs','cats','birds','fish')),
  type         TEXT NOT NULL DEFAULT 'food' CHECK(type IN ('food','accessory')),
  price        REAL NOT NULL DEFAULT 0,
  description  TEXT,
  description_ar TEXT,
  image_url    TEXT,
  in_stock     INTEGER NOT NULL DEFAULT 1,
  featured     INTEGER NOT NULL DEFAULT 0,
  keywords     TEXT,
  created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gallery (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url      TEXT NOT NULL,
  title          TEXT NOT NULL DEFAULT 'Untitled',
  title_ar       TEXT,
  description    TEXT,
  description_ar TEXT,
  alt_text       TEXT,
  category       TEXT,
  display_order  INTEGER NOT NULL DEFAULT 0,
  extra_images   TEXT,
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
  ('promo_text_fr', 'Livraison gratuite dès 5000 DA sur Alger et environs'),
  ('promo_text_ar', 'شحن مجاني من 5000 دج في الجزائر العاصمة وضواحيها');
