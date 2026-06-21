import { Product, fullCatalog } from '@/data/catalog';
import { Article, gallery as staticGallery } from '@/data/gallery';

export interface KindoSettings {
  whatsappNumber: string;
  facebookUrl: string;
  instagramUrl: string;
  promoTextFR: string;
  promoTextAR: string;
  addressFR: string;
  addressAR: string;
  phone: string;
  email: string;
  adBannerEnabled: boolean;
  adBannerImage: string;
  adBannerTitleFR: string;
  adBannerTitleAR: string;
  adBannerDescFR: string;
  adBannerDescAR: string;
  adBannerLinkUrl: string;
}

export const DEFAULT_SETTINGS: KindoSettings = {
  whatsappNumber: '213555000000',
  facebookUrl: 'https://facebook.com/kindo',
  instagramUrl: 'https://instagram.com/kindo',
  promoTextFR: 'Livraison gratuite dès 5000 DA sur Alger et environs',
  promoTextAR: 'توصيل مجاني ابتداءً من 5000 دج في الجزائر العاصمة وضواحيها',
  addressFR: 'Alger, Algérie',
  addressAR: 'الجزائر العاصمة، الجزائر',
  phone: '+213 555 000 000',
  email: 'contact@kindo.dz',
  adBannerEnabled: false,
  adBannerImage: '',
  adBannerTitleFR: '',
  adBannerTitleAR: '',
  adBannerDescFR: '',
  adBannerDescAR: '',
  adBannerLinkUrl: '',
};

const KEYS = {
  products: 'kindo_products',
  gallery: 'kindo_gallery',
  settings: 'kindo_settings',
};

function load<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored) as T;
  } catch {}
  return fallback;
}

export function saveToStore<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export const storeKeys = KEYS;

export function loadProducts(): Product[] {
  return load<Product[]>(KEYS.products, fullCatalog);
}

export function loadGallery(): Article[] {
  return load<Article[]>(KEYS.gallery, staticGallery);
}

export function loadSettings(): KindoSettings {
  const stored = load<Partial<KindoSettings>>(KEYS.settings, {});
  return { ...DEFAULT_SETTINGS, ...stored };
}
