import React, { useState, useEffect, useRef, useCallback } from 'react';
import { adminApi, AdminProduct, AdminGalleryItem } from '@/lib/adminApi';

const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string) || 'kindo2024';
const SESSION_KEY = 'kindo_admin_auth';
const SESSION_TS_KEY = 'kindo_admin_ts';
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours

function isSessionValid(): boolean {
  const auth = sessionStorage.getItem(SESSION_KEY);
  const ts = sessionStorage.getItem(SESSION_TS_KEY);
  if (!auth || !ts) return false;
  return Date.now() - parseInt(ts, 10) < SESSION_TIMEOUT;
}

type Tab = 'dashboard' | 'products' | 'gallery';

const EMPTY_PRODUCT: AdminProduct = {
  name: '', name_ar: '', category: 'dogs', type: 'food',
  price: 0, description: '', description_ar: '',
  image_url: '', in_stock: true, featured: false,
};

const EMPTY_ARTICLE: AdminGalleryItem = {
  image_url: '', title: '', title_ar: '', description: '',
  description_ar: '', alt_text: '', category: '', display_order: 0,
};

export default function Admin() {
  const [authed, setAuthed] = useState(isSessionValid);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [gallery, setGallery] = useState<AdminGalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);
  const [editArticle, setEditArticle] = useState<AdminGalleryItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const articleFileRef = useRef<HTMLInputElement>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      sessionStorage.setItem(SESSION_TS_KEY, Date.now().toString());
      setAuthed(true);
      setLoginError('');
    } else {
      setLoginError('Mot de passe incorrect.');
    }
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_TS_KEY);
    setAuthed(false);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'products' || tab === 'dashboard') {
        const p = await adminApi.getProducts();
        setProducts(p);
      }
      if (tab === 'gallery' || tab === 'dashboard') {
        const g = await adminApi.getGallery();
        setGallery(g);
      }
    } catch (e) {
      setError('Impossible de se connecter au Worker. Vérifiez VITE_WORKER_URL.');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, loadData]);

  const uploadImage = async (file: File): Promise<string> => {
    setUploading(true);
    try {
      return await adminApi.uploadImage(file);
    } catch {
      throw new Error("Échec de l'upload image.");
    } finally {
      setUploading(false);
    }
  };

  if (!authed) return <LoginScreen password={password} onChange={setPassword} onSubmit={login} error={loginError} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="font-serif text-2xl font-bold text-green-700 dark:text-green-400 tracking-wider">KINDO</div>
          <div className="text-xs text-gray-400 mt-1">Panneau d'administration</div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {([
            { id: 'dashboard', label: 'Tableau de bord', icon: '◈' },
            { id: 'products', label: 'Produits', icon: '⊡' },
            { id: 'gallery', label: 'Galerie', icon: '⊞' },
          ] as const).map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                tab === item.id
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="text-xs text-gray-400 mb-3 truncate">{adminApi.workerUrl}</div>
          <button onClick={logout} className="w-full text-sm text-red-500 hover:text-red-700 py-1 text-left">
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-4 flex items-center justify-between">
          <h1 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
            {tab === 'dashboard' && 'Tableau de bord'}
            {tab === 'products' && 'Gestion des produits'}
            {tab === 'gallery' && 'Gestion de la galerie'}
          </h1>
          <div className="flex items-center gap-3">
            {successMsg && (
              <span className="text-sm text-green-600 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">{successMsg}</span>
            )}
            {error && (
              <span className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full">{error}</span>
            )}
            <button onClick={loadData} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
              {loading ? '...' : '↺ Actualiser'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {tab === 'dashboard' && (
            <DashboardView products={products} gallery={gallery} setTab={setTab} />
          )}
          {tab === 'products' && (
            <ProductsView
              products={products}
              loading={loading}
              editProduct={editProduct}
              setEditProduct={setEditProduct}
              fileRef={fileRef}
              uploading={uploading}
              uploadImage={uploadImage}
              onSave={async (p) => {
                try {
                  if (p.id) await adminApi.updateProduct(p);
                  else await adminApi.createProduct(p);
                  setEditProduct(null);
                  showSuccess(p.id ? 'Produit mis à jour.' : 'Produit ajouté.');
                  await loadData();
                } catch { setError("Échec de la sauvegarde."); }
              }}
              onDelete={async (id) => {
                if (!window.confirm('Supprimer ce produit ?')) return;
                try {
                  await adminApi.deleteProduct(id);
                  showSuccess('Produit supprimé.');
                  await loadData();
                } catch { setError("Échec de la suppression."); }
              }}
            />
          )}
          {tab === 'gallery' && (
            <GalleryView
              gallery={gallery}
              loading={loading}
              editArticle={editArticle}
              setEditArticle={setEditArticle}
              fileRef={articleFileRef}
              uploading={uploading}
              uploadImage={uploadImage}
              onSave={async (a) => {
                try {
                  if (a.id) await adminApi.updateGalleryItem(a);
                  else await adminApi.createGalleryItem(a);
                  setEditArticle(null);
                  showSuccess(a.id ? 'Article mis à jour.' : 'Article ajouté.');
                  await loadData();
                } catch { setError("Échec de la sauvegarde."); }
              }}
              onDelete={async (id) => {
                if (!window.confirm('Supprimer cet article ?')) return;
                try {
                  await adminApi.deleteGalleryItem(id);
                  showSuccess('Article supprimé.');
                  await loadData();
                } catch { setError("Échec de la suppression."); }
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}

/* ── Login Screen ── */
function LoginScreen({ password, onChange, onSubmit, error }: {
  password: string; onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void; error: string;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="font-serif text-3xl font-bold text-green-700 dark:text-green-400 tracking-widest mb-2">KINDO</div>
          <div className="text-sm text-gray-500">Administration — Accès sécurisé</div>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => onChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg transition-colors"
          >
            Connexion
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Dashboard ── */
function DashboardView({ products, gallery, setTab }: {
  products: AdminProduct[]; gallery: AdminGalleryItem[]; setTab: (t: Tab) => void;
}) {
  const byCategory = ['dogs', 'cats', 'birds', 'fish'].map(cat => ({
    cat,
    count: products.filter(p => p.category === cat).length,
  }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Produits total" value={products.length} color="green" />
        <StatCard label="Articles galerie" value={gallery.length} color="amber" />
        <StatCard label="En stock" value={products.filter(p => p.in_stock).length} color="blue" />
        <StatCard label="Mis en avant" value={products.filter(p => p.featured).length} color="purple" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Produits par catégorie</h3>
          <div className="space-y-3">
            {byCategory.map(({ cat, count }) => (
              <div key={cat} className="flex items-center gap-3">
                <div className="w-24 text-sm text-gray-500 capitalize">{cat}</div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${products.length ? (count / products.length) * 100 : 0}%` }}
                  />
                </div>
                <div className="w-6 text-sm font-medium text-gray-700 dark:text-gray-300 text-right">{count}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Actions rapides</h3>
          <div className="space-y-2">
            <button onClick={() => setTab('products')} className="w-full text-left px-4 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
              + Ajouter un produit
            </button>
            <button onClick={() => setTab('gallery')} className="w-full text-left px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors">
              + Ajouter un article
            </button>
            <a href="/" target="_blank" className="block px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
              Voir le site public
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900',
    amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-900',
  };
  const textColors: Record<string, string> = {
    green: 'text-green-700 dark:text-green-400',
    amber: 'text-amber-700 dark:text-amber-400',
    blue: 'text-blue-700 dark:text-blue-400',
    purple: 'text-purple-700 dark:text-purple-400',
  };
  return (
    <div className={`rounded-xl border p-6 ${colors[color]}`}>
      <div className={`text-3xl font-bold mb-1 ${textColors[color]}`}>{value}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}

/* ── Image Upload ── */
function ImageUploader({ currentUrl, onUploaded, fileRef, uploading }: {
  currentUrl: string; onUploaded: (url: string) => void;
  fileRef: React.RefObject<HTMLInputElement | null>; uploading: boolean;
}) {
  const [preview, setPreview] = useState(currentUrl);
  const [urlInput, setUrlInput] = useState(currentUrl);

  useEffect(() => {
    setPreview(currentUrl);
    setUrlInput(currentUrl);
  }, [currentUrl]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    try {
      const url = await adminApi.uploadImage(file);
      setPreview(url);
      setUrlInput(url);
      onUploaded(url);
    } catch {
      alert("Échec de l'upload. Vérifiez la connexion au Worker.");
    }
  };

  return (
    <div className="space-y-2">
      {preview && (
        <img src={preview} alt="preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={urlInput}
          onChange={e => { setUrlInput(e.target.value); setPreview(e.target.value); onUploaded(e.target.value); }}
          placeholder="https://... ou uploader un fichier"
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium transition-colors disabled:opacity-50"
        >
          {uploading ? '...' : 'Upload'}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

/* ── Products View ── */
function ProductsView({ products, loading, editProduct, setEditProduct, fileRef, uploading, uploadImage, onSave, onDelete }: {
  products: AdminProduct[];
  loading: boolean;
  editProduct: AdminProduct | null;
  setEditProduct: (p: AdminProduct | null) => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
  uploading: boolean;
  uploadImage: (f: File) => Promise<string>;
  onSave: (p: AdminProduct) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [form, setForm] = useState<AdminProduct>(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(editProduct ?? EMPTY_PRODUCT);
  }, [editProduct]);

  const set = (key: keyof AdminProduct, val: unknown) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
            {products.length} produit{products.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => { setEditProduct(null); setForm(EMPTY_PRODUCT); }}
            className="text-sm px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white rounded-lg font-medium transition-colors"
          >
            + Nouveau
          </button>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Chargement...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Aucun produit. Ajoutez-en un.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[600px] overflow-auto">
            {products.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <img src={p.image_url || 'https://picsum.photos/seed/default/60/60'} alt={p.name}
                  className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{p.name}</div>
                  <div className="text-xs text-gray-400 flex gap-2">
                    <span className="capitalize">{p.category}</span>
                    <span>·</span>
                    <span>{p.price.toLocaleString()} DA</span>
                    {p.in_stock ? <span className="text-green-500">En stock</span> : <span className="text-red-400">Rupture</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditProduct(p)} className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 transition-colors">
                    Modifier
                  </button>
                  <button onClick={() => onDelete(p.id!)} className="text-xs px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-500 rounded hover:bg-red-100 transition-colors">
                    Suppr.
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-5 text-sm">
          {form.id ? `Modifier — ${form.name}` : 'Nouveau produit'}
        </h3>
        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nom (FR)" required>
              <input value={form.name} onChange={e => set('name', e.target.value)} required className={inputCls} />
            </Field>
            <Field label="اسم (AR)">
              <input value={form.name_ar} onChange={e => set('name_ar', e.target.value)} dir="rtl" className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Catégorie" required>
              <select value={form.category} onChange={e => set('category', e.target.value)} required className={inputCls}>
                <option value="dogs">Chiens</option>
                <option value="cats">Chats</option>
                <option value="birds">Oiseaux</option>
                <option value="fish">Poissons</option>
              </select>
            </Field>
            <Field label="Type" required>
              <select value={form.type} onChange={e => set('type', e.target.value)} required className={inputCls}>
                <option value="food">Nourriture</option>
                <option value="accessory">Accessoire</option>
              </select>
            </Field>
          </div>

          <Field label="Prix (DA)" required>
            <input type="number" value={form.price} onChange={e => set('price', Number(e.target.value))} required min={0} className={inputCls} />
          </Field>

          <Field label="Description (FR)">
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} className={inputCls} />
          </Field>
          <Field label="وصف (AR)">
            <textarea value={form.description_ar} onChange={e => set('description_ar', e.target.value)} rows={2} dir="rtl" className={inputCls} />
          </Field>

          <Field label="Image du produit">
            <ImageUploader
              currentUrl={form.image_url}
              onUploaded={url => set('image_url', url)}
              fileRef={fileRef}
              uploading={uploading}
            />
          </Field>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
              <input type="checkbox" checked={form.in_stock} onChange={e => set('in_stock', e.target.checked)} className="rounded" />
              En stock
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="rounded" />
              Mis en avant
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm">
              {saving ? 'Enregistrement...' : (form.id ? 'Mettre à jour' : 'Créer le produit')}
            </button>
            {form.id && (
              <button type="button" onClick={() => setForm(EMPTY_PRODUCT)} className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Gallery View ── */
function GalleryView({ gallery, loading, editArticle, setEditArticle, fileRef, uploading, uploadImage, onSave, onDelete }: {
  gallery: AdminGalleryItem[];
  loading: boolean;
  editArticle: AdminGalleryItem | null;
  setEditArticle: (a: AdminGalleryItem | null) => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
  uploading: boolean;
  uploadImage: (f: File) => Promise<string>;
  onSave: (a: AdminGalleryItem) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [form, setForm] = useState<AdminGalleryItem>(EMPTY_ARTICLE);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(editArticle ?? EMPTY_ARTICLE);
  }, [editArticle]);

  const set = (key: keyof AdminGalleryItem, val: unknown) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...form, alt_text: form.alt_text || form.title });
    setSaving(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
            {gallery.length} article{gallery.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => { setEditArticle(null); setForm(EMPTY_ARTICLE); }}
            className="text-sm px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
          >
            + Nouveau
          </button>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Chargement...</div>
        ) : gallery.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Aucun article. Ajoutez-en un.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[600px] overflow-auto">
            {gallery.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <img src={a.image_url || 'https://picsum.photos/seed/gallery/60/60'} alt={a.title}
                  className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{a.title}</div>
                  <div className="text-xs text-gray-400 truncate">{a.description?.slice(0, 60)}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditArticle(a)} className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 transition-colors">
                    Modifier
                  </button>
                  <button onClick={() => onDelete(a.id!)} className="text-xs px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-500 rounded hover:bg-red-100 transition-colors">
                    Suppr.
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-5 text-sm">
          {form.id ? `Modifier — ${form.title}` : 'Nouvel article'}
        </h3>
        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Titre (FR)" required>
              <input value={form.title} onChange={e => set('title', e.target.value)} required className={inputCls} />
            </Field>
            <Field label="عنوان (AR)">
              <input value={form.title_ar} onChange={e => set('title_ar', e.target.value)} dir="rtl" className={inputCls} />
            </Field>
          </div>

          <Field label="Description courte (FR)">
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} className={inputCls} />
          </Field>
          <Field label="وصف مختصر (AR)">
            <textarea value={form.description_ar} onChange={e => set('description_ar', e.target.value)} rows={2} dir="rtl" className={inputCls} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Catégorie">
              <input value={form.category ?? ''} onChange={e => set('category', e.target.value)} placeholder="ex: santé, nutrition..." className={inputCls} />
            </Field>
            <Field label="Ordre d'affichage">
              <input type="number" value={form.display_order ?? 0} onChange={e => set('display_order', Number(e.target.value))} min={0} className={inputCls} />
            </Field>
          </div>

          <Field label="Image de l'article">
            <ImageUploader
              currentUrl={form.image_url}
              onUploaded={url => set('image_url', url)}
              fileRef={fileRef}
              uploading={uploading}
            />
          </Field>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm">
              {saving ? 'Enregistrement...' : (form.id ? 'Mettre à jour' : "Créer l'article")}
            </button>
            {form.id && (
              <button type="button" onClick={() => setForm(EMPTY_ARTICLE)} className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Helpers ── */
const inputCls = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
