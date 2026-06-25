const WORKER_URL = (import.meta.env.VITE_WORKER_URL as string) || 'https://kindom-upload-worker.imadedar98.workers.dev';

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${WORKER_URL}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function jsonOpts(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export interface AdminProduct {
  id?: number;
  name: string;
  name_ar: string;
  category: 'dogs' | 'cats' | 'birds' | 'fish' | 'none';
  type: 'food' | 'accessory';
  food_category?: string;
  food_category_ar?: string;
  price: number;
  description: string;
  description_ar: string;
  image_url: string;
  in_stock: boolean;
  featured: boolean;
  keywords?: string;
}

export interface AdminGalleryItem {
  id?: number;
  image_url: string;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  alt_text: string;
  category?: string;
  display_order?: number;
  extra_images?: string;
}

export const adminApi = {
  workerUrl: WORKER_URL,

  getProducts: () => req<AdminProduct[]>('/products'),
  createProduct: (d: AdminProduct) => req<{ success: boolean; id: number }>('/products', jsonOpts('POST', d)),
  updateProduct: (d: AdminProduct) => req<{ success: boolean }>('/products', jsonOpts('PUT', d)),
  deleteProduct: (id: number) => req<{ success: boolean }>('/products', jsonOpts('DELETE', { id })),

  getGallery: () => req<AdminGalleryItem[]>('/gallery'),
  createGalleryItem: (d: AdminGalleryItem) => req<{ success: boolean; last_row_id: number }>('/gallery', jsonOpts('POST', d)),
  updateGalleryItem: (d: AdminGalleryItem) => req<{ success: boolean }>('/gallery', jsonOpts('PUT', d)),
  deleteGalleryItem: (id: number) => req<{ success: boolean }>('/gallery', jsonOpts('DELETE', { id })),

  uploadImage: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${WORKER_URL}/upload`, { method: 'POST', body: form });
    if (!res.ok) throw new Error('Image upload failed');
    const data = await res.json() as { url: string };
    return data.url;
  },

  testConnection: () => req<{ status: string }>('/test'),
};
