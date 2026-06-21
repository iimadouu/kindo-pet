import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
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

  const setProducts = useCallback((p: Product[]) => {
    setProductsState(p);
    saveToStore(storeKeys.products, p);
  }, []);

  const setArticles = useCallback((a: Article[]) => {
    setArticlesState(a);
    saveToStore(storeKeys.gallery, a);
  }, []);

  const setSettings = useCallback((s: KindoSettings) => {
    setSettingsState(s);
    saveToStore(storeKeys.settings, s);
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
