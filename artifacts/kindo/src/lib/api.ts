import { Product } from '@/data/catalog';
import { Article } from '@/data/gallery';
import { KindoSettings } from '@/lib/store';

const RAW = (import.meta.env.VITE_WORKER_URL as string | undefined) ?? '';
const WORKER = RAW.replace(/\/$/, '');
export const workerEnabled = WORKER.length > 0;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  if (!workerEnabled) return null;
  try {
    const res = await fetch(`${WORKER}${path}`, init);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/* ── Reads ── */
export const apiGetProducts = () => apiFetch<Product[]>('/api/products');
export const apiGetArticles = () => apiFetch<Article[]>('/api/articles');
export const apiGetSettings = () => apiFetch<KindoSettings>('/api/settings');

/* ── Writes ── */
const put = (path: string, body: unknown) =>
  apiFetch<{ ok: boolean }>(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const apiSaveProducts = (p: Product[]) => put('/api/products', p);
export const apiSaveArticles = (a: Article[]) => put('/api/articles', a);
export const apiSaveSettings = (s: KindoSettings) => put('/api/settings', s);

/* ── Image upload → R2 ──
   Returns the R2-served URL on success, null on failure.
   Caller should fall back to FileReader (base64) when null is returned. */
export async function apiUploadImage(file: File): Promise<string | null> {
  if (!workerEnabled) return null;
  try {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${WORKER}/api/upload`, { method: 'POST', body: fd });
    if (!res.ok) return null;
    const data = (await res.json()) as { url: string };
    return data.url ?? null;
  } catch {
    return null;
  }
}
