import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { Product } from '@/data/catalog';
import { Article } from '@/data/gallery';
import {
  KindoSettings,
  DEFAULT_SETTINGS,
  loadProducts,
  loadGallery,
  loadSettings,
  saveToStore,
  storeKeys,
} from '@/lib/store';
import {
  workerEnabled,
  apiGetProducts,
  apiGetArticles,
  apiGetSettings,
  apiSaveProducts,
  apiSaveArticles,
  apiSaveSettings,
} from '@/lib/api';

interface StoreContextValue {
  products: Product[];
  articles: Article[];
  settings: KindoSettings;
  loading: boolean;
  setProducts: (p: Product[]) => void;
  setArticles: (a: Article[]) => void;
  setSettings: (s: KindoSettings) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  /*
   * When VITE_WORKER_URL is set (Cloudflare production):
   *   - Start with empty state — zero static / localStorage data shown
   *   - Fetch authoritative data from D1 immediately
   *   - loading = true until all three fetches complete
   *
   * When no Worker (local dev):
   *   - Use localStorage with static-data fallback as before
   *   - loading = false immediately
   */
  const [products, setProductsState] = useState<Product[]>(
    () => workerEnabled ? [] : loadProducts()
  );
  const [articles, setArticlesState] = useState<Article[]>(
    () => workerEnabled ? [] : loadGallery()
  );
  const [settings, setSettingsState] = useState<KindoSettings>(
    () => workerEnabled ? DEFAULT_SETTINGS : loadSettings()
  );
  const [loading, setLoading] = useState(workerEnabled);

  useEffect(() => {
    if (!workerEnabled) return;

    Promise.all([
      apiGetProducts(),
      apiGetArticles(),
      apiGetSettings(),
    ]).then(([prods, arts, setts]) => {
      if (prods) {
        setProductsState(prods);
        saveToStore(storeKeys.products, prods);
      }
      if (arts) {
        setArticlesState(arts);
        saveToStore(storeKeys.gallery, arts);
      }
      if (setts && Object.keys(setts).length > 0) {
        const merged = { ...DEFAULT_SETTINGS, ...setts };
        setSettingsState(merged);
        saveToStore(storeKeys.settings, merged);
      }
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const setProducts = useCallback((p: Product[]) => {
    setProductsState(p);
    saveToStore(storeKeys.products, p);
    if (workerEnabled) apiSaveProducts(p);
  }, []);

  const setArticles = useCallback((a: Article[]) => {
    setArticlesState(a);
    saveToStore(storeKeys.gallery, a);
    if (workerEnabled) apiSaveArticles(a);
  }, []);

  const setSettings = useCallback((s: KindoSettings) => {
    setSettingsState(s);
    saveToStore(storeKeys.settings, s);
    if (workerEnabled) apiSaveSettings(s);
  }, []);

  const value = useMemo(
    () => ({ products, articles, settings, loading, setProducts, setArticles, setSettings }),
    [products, articles, settings, loading, setProducts, setArticles, setSettings]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
