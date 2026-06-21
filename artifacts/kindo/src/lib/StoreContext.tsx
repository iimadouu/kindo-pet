import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { Product } from '@/data/catalog';
import { Article } from '@/data/gallery';
import {
  KindoSettings,
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
  setProducts: (p: Product[]) => void;
  setArticles: (a: Article[]) => void;
  setSettings: (s: KindoSettings) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProductsState] = useState<Product[]>(() => loadProducts());
  const [articles, setArticlesState] = useState<Article[]>(() => loadGallery());
  const [settings, setSettingsState] = useState<KindoSettings>(() => loadSettings());

  /* On mount: if Worker is configured, fetch authoritative data from D1 and
     hydrate the store. This runs once and is transparent — the site renders
     immediately from localStorage while Worker data loads in the background. */
  useEffect(() => {
    if (!workerEnabled) return;
    apiGetProducts().then(data => {
      if (data && data.length > 0) {
        setProductsState(data);
        saveToStore(storeKeys.products, data);
      }
    });
    apiGetArticles().then(data => {
      if (data && data.length > 0) {
        setArticlesState(data);
        saveToStore(storeKeys.gallery, data);
      }
    });
    apiGetSettings().then(data => {
      if (data && Object.keys(data).length > 0) {
        setSettingsState(s => ({ ...s, ...data }));
        saveToStore(storeKeys.settings, data);
      }
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
    () => ({ products, articles, settings, setProducts, setArticles, setSettings }),
    [products, articles, settings, setProducts, setArticles, setSettings]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
