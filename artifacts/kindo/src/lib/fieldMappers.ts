/**
 * Field Mappers - Translation layer between frontend format and database format
 * 
 * Frontend uses: nameFR, nameAR, descriptionFR, descriptionAR, images[], etc.
 * Database uses: name, name_ar, description, description_ar, image_url, etc.
 * 
 * This layer ensures seamless conversion while keeping the UI unchanged.
 */

import { Product } from '@/data/catalog';
import { Article } from '@/data/gallery';

// ============================================================================
// PRODUCT MAPPERS
// ============================================================================

/**
 * Convert Product from database format to frontend format
 * Database: { name, name_ar, description, description_ar, image_url, in_stock, ... }
 * Frontend: { nameFR, nameAR, descriptionFR, descriptionAR, images[], inStock, ... }
 */
export function productFromDb(dbProduct: any): Product {
  return {
    id: String(dbProduct.id || ''),
    nameFR: dbProduct.name || '',
    nameAR: dbProduct.name_ar || '',
    descriptionFR: dbProduct.description || '',
    descriptionAR: dbProduct.description_ar || '',
    category: dbProduct.category || 'dogs',
    type: dbProduct.type || 'food',
    price: parseFloat(dbProduct.price) || 0,
    images: dbProduct.image_url ? [dbProduct.image_url] : [],
    featured: Boolean(dbProduct.featured),
    keywords: dbProduct.keywords || '',
    inStock: Boolean(dbProduct.in_stock ?? true),
    specs: typeof dbProduct.specs === 'string' 
      ? JSON.parse(dbProduct.specs || '{}') 
      : (dbProduct.specs || {})
  };
}

/**
 * Convert Product from frontend format to database format for API submission
 * Frontend: { nameFR, nameAR, descriptionFR, descriptionAR, images[], ... }
 * Database: { name, name_ar, description, description_ar, image_url, in_stock, ... }
 * 
 * NOTE: Does NOT include 'id' field for bulk inserts (DB auto-generates it)
 */
export function productToDb(product: Product): any {
  const dbProduct: any = {
    name: product.nameFR,
    name_ar: product.nameAR,
    name_en: product.nameFR, // Use FR as fallback for EN
    description: product.descriptionFR,
    description_ar: product.descriptionAR,
    description_en: product.descriptionFR, // Use FR as fallback for EN
    category: product.category,
    type: product.type,
    price: product.price,
    image_url: product.images && product.images.length > 0 ? product.images[0] : '',
    in_stock: product.inStock !== false ? 1 : 0,
    featured: product.featured ? 1 : 0,
    keywords: product.keywords || '',
    specs: JSON.stringify(product.specs || {})
  };
  
  // Only include ID if it's a real database ID (not a temp ID like "tmp-123")
  // For bulk inserts, we let the database auto-generate IDs
  if (product.id && !product.id.startsWith('tmp-')) {
    dbProduct.id = product.id;
  }
  
  return dbProduct;
}

// ============================================================================
// ARTICLE/GALLERY MAPPERS
// ============================================================================

/**
 * Convert Article from database format to frontend format
 * Database: { title, title_ar, excerpt, excerpt_ar, body, body_ar, image_url, ... }
 * Frontend: { titleFR, titleAR, excerptFR, excerptAR, bodyFR, bodyAR, image, ... }
 */
export function articleFromDb(dbArticle: any): Article {
  return {
    id: String(dbArticle.id || ''),
    titleFR: dbArticle.title || '',
    titleAR: dbArticle.title_ar || '',
    excerptFR: dbArticle.excerpt || '',
    excerptAR: dbArticle.excerpt_ar || '',
    bodyFR: dbArticle.body || '',
    bodyAR: dbArticle.body_ar || '',
    image: dbArticle.image_url || '',
    date: dbArticle.date || new Date().toISOString()
  };
}

/**
 * Convert Article from frontend format to database format for API submission
 * Frontend: { titleFR, titleAR, excerptFR, excerptAR, bodyFR, bodyAR, image, ... }
 * Database: { title, title_ar, excerpt, excerpt_ar, body, body_ar, image_url, ... }
 * 
 * NOTE: Does NOT include 'id' field for bulk inserts (DB auto-generates it)
 */
export function articleToDb(article: Article): any {
  const dbArticle: any = {
    title: article.titleFR,
    title_ar: article.titleAR,
    title_en: article.titleFR, // Use FR as fallback for EN
    excerpt: article.excerptFR,
    excerpt_ar: article.excerptAR,
    excerpt_en: article.excerptFR, // Use FR as fallback for EN
    body: article.bodyFR,
    body_ar: article.bodyAR,
    body_en: article.bodyFR, // Use FR as fallback for EN
    image_url: article.image,
    alt_text: article.titleFR,
    category: 'general',
    display_order: 0,
    extra_images: '',
    date: article.date
  };
  
  // Only include ID if it's a real database ID (not a temp ID like "tmp-123")
  if (article.id && !article.id.startsWith('tmp-')) {
    dbArticle.id = article.id;
  }
  
  return dbArticle;
}

/**
 * Convert array of products from database to frontend format
 */
export function productsFromDb(dbProducts: any[]): Product[] {
  if (!Array.isArray(dbProducts)) return [];
  return dbProducts.map(productFromDb);
}

/**
 * Convert array of products from frontend to database format
 */
export function productsToDb(products: Product[]): any[] {
  if (!Array.isArray(products)) return [];
  return products.map(productToDb);
}

/**
 * Convert array of articles from database to frontend format
 */
export function articlesFromDb(dbArticles: any[]): Article[] {
  if (!Array.isArray(dbArticles)) return [];
  return dbArticles.map(articleFromDb);
}

/**
 * Convert array of articles from frontend to database format
 */
export function articlesToDb(articles: Article[]): any[] {
  if (!Array.isArray(articles)) return [];
  return articles.map(articleToDb);
}
