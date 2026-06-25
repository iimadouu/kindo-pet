export interface Product {
  id: string;
  nameFR: string;
  nameAR: string;
  descriptionFR: string;
  descriptionAR: string;
  category: 'dogs' | 'cats' | 'birds' | 'fish' | 'none';
  type: 'food' | 'accessory';
  foodCategory?: string;
  foodCategoryAR?: string;
  accessoryCategory?: string;
  accessoryCategoryAR?: string;
  price: number;
  images: string[];  // First image is the main one
  specs: Record<string, string>;
  featured: boolean;
  keywords?: string;  // Optional keywords for search
  inStock?: boolean;  // Optional stock status
}

// Empty catalog - all products should be added via admin panel
export const catalog: Product[] = [];

export const fullCatalog = catalog;
