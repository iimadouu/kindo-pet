import React, { useState, useRef } from 'react';
import { useStore } from '@/lib/StoreContext';
import { Product } from '@/data/catalog';
import { Article } from '@/data/gallery';
import { KindoSettings } from '@/lib/store';
import { apiUploadImage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  LayoutDashboard, Package, Image as ImageIcon, Settings, LogOut,
  Plus, Pencil, Trash2, Search, Star, X, Menu,
  Upload, Link2, CheckCircle, Dog, Cat, Bird, Fish,
} from 'lucide-react';

/* ─── Session ─── */
const SESSION_KEY = 'kindo_admin_session';
const SESSION_DURATION = 2 * 60 * 60 * 1000;
const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string) || 'kindo2024';

function getSession(): boolean {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const { expires } = JSON.parse(raw) as { expires: number };
    return Date.now() < expires;
  } catch { return false; }
}
function createSession() {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ expires: Date.now() + SESSION_DURATION }));
}
function destroySession() { sessionStorage.removeItem(SESSION_KEY); }

/* ─── Specs helpers ─── */
interface SpecRow { id: string; keyFR: string; keyAR: string; valueFR: string; valueAR: string; }

function specsToRows(specs: Record<string, string>): SpecRow[] {
  return Object.entries(specs).map(([k, v]) => {
    const [keyFR = '', keyAR = ''] = k.split(' / ');
    const [valueFR = '', valueAR = ''] = v.split(' / ');
    return { id: Math.random().toString(36).slice(2), keyFR, keyAR, valueFR, valueAR };
  });
}
function rowsToSpecs(rows: SpecRow[]): Record<string, string> {
  const r: Record<string, string> = {};
  rows.forEach(row => {
    if (!row.keyFR.trim()) return;
    const key = row.keyAR.trim() ? `${row.keyFR} / ${row.keyAR}` : row.keyFR;
    const val = row.valueAR.trim() ? `${row.valueFR} / ${row.valueAR}` : row.valueFR;
    r[key] = val;
  });
  return r;
}

const EMPTY_PRODUCT: Omit<Product, 'id'> = {
  nameFR: '', nameAR: '', descriptionFR: '', descriptionAR: '',
  category: 'dogs', type: 'food', price: 0, images: [''], specs: {}, featured: false,
};
const EMPTY_ARTICLE: Omit<Article, 'id'> = {
  titleFR: '', titleAR: '', excerptFR: '', excerptAR: '',
  bodyFR: '', bodyAR: '', image: '', date: new Date().toISOString().split('T')[0],
};

type Tab = 'dashboard' | 'products' | 'gallery' | 'settings';

/* ═══════════════════════════════════════════════════════════════
   ROOT COMPONENT
════════════════════════════════════════════════════════════════ */
export default function Admin() {
  const [authenticated, setAuthenticated] = useState(() => getSession());
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { products, articles, settings, setProducts, setArticles, setSettings } = useStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) { createSession(); setAuthenticated(true); }
    else { setLoginError('Mot de passe incorrect.'); setPassword(''); }
  };

  /* ── Login screen ── */
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-red-600" style={{ fontFamily: "'Sigmar One', cursive", WebkitTextStroke: '2px white', paintOrder: 'stroke fill' }}>KINDO</h1>
            <p className="text-slate-500 text-sm mt-1">Administration — Accès sécurisé</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pw">Mot de passe</Label>
              <Input
                id="pw" type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                className={`border-2 ${loginError ? 'border-red-400' : 'border-emerald-300'} focus:border-emerald-600`}
                autoFocus
              />
              {loginError && <p className="text-red-500 text-xs">{loginError}</p>}
            </div>
            <Button type="submit" className="w-full h-12 text-base font-semibold bg-emerald-700 hover:bg-emerald-800">
              Connexion
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'products',  label: 'Produits',          icon: <Package className="w-5 h-5" /> },
    { id: 'gallery',   label: 'Galerie / Articles', icon: <ImageIcon className="w-5 h-5" /> },
    { id: 'settings',  label: 'Paramètres',         icon: <Settings className="w-5 h-5" /> },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white w-64">
      <div className="p-6 border-b border-slate-700">
        <span className="text-2xl font-bold text-red-600" style={{ fontFamily: "'Sigmar One', cursive", WebkitTextStroke: '1.5px white', paintOrder: 'stroke fill' }}>KINDO</span>
        <p className="text-slate-400 text-xs mt-0.5">Admin Panel</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === item.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}{item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={() => { destroySession(); setAuthenticated(false); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-all"
        >
          <LogOut className="w-5 h-5" />Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-64 shrink-0 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-64 flex flex-col"><SidebarContent /></div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 md:ml-64 min-w-0">
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
          <button className="md:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-slate-800 text-lg">
            {navItems.find(n => n.id === activeTab)?.label}
          </h1>
        </header>
        <main className="p-4 md:p-6">
          {activeTab === 'dashboard' && <DashboardTab products={products} articles={articles} settings={settings} setActiveTab={setActiveTab} />}
          {activeTab === 'products'  && <ProductsTab products={products} setProducts={setProducts} />}
          {activeTab === 'gallery'   && <GalleryTab articles={articles} setArticles={setArticles} />}
          {activeTab === 'settings'  && <SettingsTab settings={settings} setSettings={setSettings} />}
        </main>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════════════════════════ */
function DashboardTab({
  products, articles, settings, setActiveTab,
}: { products: Product[]; articles: Article[]; settings: KindoSettings; setActiveTab: (t: Tab) => void }) {
  const cats = [
    { id: 'dogs',  label: 'Chiens',   icon: <Dog  className="w-4 h-4 text-amber-500" /> },
    { id: 'cats',  label: 'Chats',    icon: <Cat  className="w-4 h-4 text-purple-500" /> },
    { id: 'birds', label: 'Oiseaux',  icon: <Bird className="w-4 h-4 text-sky-500" /> },
    { id: 'fish',  label: 'Poissons', icon: <Fish className="w-4 h-4 text-blue-500" /> },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Produits',     value: products.length,                          color: 'bg-emerald-100 text-emerald-700', icon: <Package className="w-6 h-6" /> },
          { label: 'Articles',     value: articles.length,                          color: 'bg-blue-100 text-blue-700',       icon: <ImageIcon className="w-6 h-6" /> },
          { label: 'En vedette',   value: products.filter(p => p.featured).length,  color: 'bg-amber-100 text-amber-700',     icon: <Star className="w-6 h-6" /> },
          { label: 'WhatsApp',     value: settings.whatsappNumber ? '✓' : '—',     color: 'bg-green-100 text-green-700',     icon: <CheckCircle className="w-6 h-6" /> },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-sm bg-white">
            <CardContent className="p-5">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
              <div className="text-2xl font-bold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader><CardTitle className="text-sm">Produits par catégorie</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {cats.map(c => (
              <div key={c.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-700">{c.icon}{c.label}</div>
                <Badge variant="secondary">{products.filter(p => p.category === c.id).length}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader><CardTitle className="text-sm">Actions rapides</CardTitle></CardHeader>
          <CardContent className="space-y-2.5">
            {[
              { label: 'Ajouter un produit',    tab: 'products'  as Tab, color: 'text-emerald-600' },
              { label: 'Ajouter un article',    tab: 'gallery'   as Tab, color: 'text-blue-600' },
              { label: 'Modifier les paramètres', tab: 'settings' as Tab, color: 'text-slate-600' },
            ].map(a => (
              <Button key={a.tab} className="w-full justify-start gap-2 font-normal" variant="outline"
                onClick={() => setActiveTab(a.tab)}>
                <Plus className={`w-4 h-4 ${a.color}`} />{a.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRODUCTS TAB
════════════════════════════════════════════════════════════════ */
function ProductsTab({ products, setProducts }: { products: Product[]; setProducts: (p: Product[]) => void }) {
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const filtered = products.filter(p => (p.nameFR + p.nameAR).toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: string) => {
    if (!window.confirm('Supprimer ce produit définitivement ?')) return;
    setProducts(products.filter(p => p.id !== id));
    toast({ title: 'Produit supprimé' });
  };

  const handleSave = (data: Product) => {
    if (products.find(p => p.id === data.id)) {
      setProducts(products.map(p => p.id === data.id ? data : p));
      toast({ title: 'Produit mis à jour ✓' });
    } else {
      setProducts([data, ...products]);
      toast({ title: 'Produit créé ✓' });
    }
    setEditingProduct(null);
    setIsAdding(false);
  };

  const toggleFeatured = (id: string) =>
    setProducts(products.map(p => p.id === id ? { ...p, featured: !p.featured } : p));

  const catLabel: Record<string, string> = { dogs: 'Chiens', cats: 'Chats', birds: 'Oiseaux', fish: 'Poissons' };
  const typeLabel: Record<string, string> = { food: 'Aliment', accessory: 'Accessoire' };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-white" />
        </div>
        <Button onClick={() => setIsAdding(true)} className="gap-2 shrink-0 bg-emerald-700 hover:bg-emerald-800">
          <Plus className="w-4 h-4" />Nouveau produit
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Produit', 'Catégorie', 'Prix', 'En vedette', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-slate-400 text-sm">Aucun produit trouvé.</td></tr>
              )}
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <img src={p.images[0]} alt="" className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-800 text-sm truncate max-w-[180px]">{p.nameFR}</div>
                        <div className="text-slate-400 text-xs truncate max-w-[180px]" dir="rtl">{p.nameAR}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge variant="secondary" className="text-xs mr-1">{catLabel[p.category]}</Badge>
                    <Badge variant="outline" className="text-xs">{typeLabel[p.type]}</Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-emerald-700">
                    {p.price.toLocaleString('fr-DZ')} DA
                  </td>
                  <td className="px-4 py-3">
                    <Switch checked={p.featured} onCheckedChange={() => toggleFeatured(p.id)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" className="w-8 h-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => setEditingProduct(p)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="w-8 h-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(p.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 text-xs text-slate-400 border-t border-slate-50">
          {filtered.length} produit{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {(isAdding || editingProduct) && (
        <ProductFormDialog
          product={editingProduct}
          onSave={handleSave}
          onClose={() => { setEditingProduct(null); setIsAdding(false); }}
        />
      )}
    </div>
  );
}

/* ─── Product Form Dialog ─── */
function ProductFormDialog({ product, onSave, onClose }: { product: Product | null; onSave: (p: Product) => void; onClose: () => void }) {
  const isEdit = !!product;
  type FormState = Omit<Product, 'id' | 'specs'> & { specs: SpecRow[] };
  const [form, setForm] = useState<FormState>(() => {
    const base = product ?? { id: '', ...EMPTY_PRODUCT };
    return { ...base, specs: specsToRows(base.specs) };
  });
  const [images, setImages] = useState<string[]>(() => product?.images?.length ? product.images : ['']);
  const [uploading, setUploading] = useState(false);

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm(f => ({ ...f, [field]: value }));

  /* specs */
  const updateSpec = (id: string, field: keyof SpecRow, value: string) =>
    set('specs', form.specs.map(r => r.id === id ? { ...r, [field]: value } : r));
  const addSpec = () =>
    set('specs', [...form.specs, { id: Math.random().toString(36).slice(2), keyFR: '', keyAR: '', valueFR: '', valueAR: '' }]);
  const removeSpec = (id: string) =>
    set('specs', form.specs.filter(r => r.id !== id));

  /* images */
  const addImage = () => setImages(i => [...i, '']);
  const removeImage = (idx: number) => setImages(i => i.filter((_, j) => j !== idx));
  const updateImage = (idx: number, val: string) => setImages(i => i.map((img, j) => j === idx ? val : img));

  const uploadFile = async (file: File, idx: number) => {
    setUploading(true);
    try {
      const url = await apiUploadImage(file);
      if (url) {
        updateImage(idx, url);
      } else {
        const reader = new FileReader();
        reader.onload = ev => { if (ev.target?.result) updateImage(idx, ev.target.result as string); };
        reader.readAsDataURL(file);
      }
    } catch { alert('Upload échoué. Entrez une URL manuellement.'); }
    finally { setUploading(false); }
  };

  const pickFile = (idx: number) => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) uploadFile(f, idx); };
    input.click();
  };

  const handleSave = () => {
    if (!form.nameFR.trim()) return alert('Le nom (FR) est requis.');
    const cleanImages = images.filter(Boolean);
    if (!cleanImages.length) return alert('Au moins une image est requise.');
    if (form.price <= 0) return alert('Le prix doit être supérieur à 0.');
    onSave({
      id: product?.id || `p${Date.now()}`,
      nameFR: form.nameFR, nameAR: form.nameAR,
      descriptionFR: form.descriptionFR, descriptionAR: form.descriptionAR,
      category: form.category, type: form.type,
      price: form.price, images: cleanImages,
      specs: rowsToSpecs(form.specs),
      featured: form.featured,
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">{isEdit ? 'Modifier le produit' : 'Nouveau produit'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nom (FR) <span className="text-red-500">*</span></Label>
              <Input value={form.nameFR} onChange={e => set('nameFR', e.target.value)} placeholder="Ex: Royal Canin Maxi Adult" />
            </div>
            <div className="space-y-1.5">
              <Label>الاسم (AR)</Label>
              <Input value={form.nameAR} onChange={e => set('nameAR', e.target.value)} placeholder="رويال كانين" dir="rtl" className="text-right" />
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Description (FR)</Label>
              <Textarea value={form.descriptionFR} onChange={e => set('descriptionFR', e.target.value)} rows={3} placeholder="Description détaillée en français…" />
            </div>
            <div className="space-y-1.5">
              <Label>الوصف (AR)</Label>
              <Textarea value={form.descriptionAR} onChange={e => set('descriptionAR', e.target.value)} rows={3} placeholder="الوصف بالعربية…" dir="rtl" className="text-right" />
            </div>
          </div>

          {/* Category / Type / Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Catégorie</Label>
              <Select value={form.category} onValueChange={v => set('category', v as Product['category'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dogs">🐕 Chiens</SelectItem>
                  <SelectItem value="cats">🐈 Chats</SelectItem>
                  <SelectItem value="birds">🐦 Oiseaux</SelectItem>
                  <SelectItem value="fish">🐟 Poissons</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => set('type', v as Product['type'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">🍖 Alimentation</SelectItem>
                  <SelectItem value="accessory">🎾 Accessoire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Prix (DA) <span className="text-red-500">*</span></Label>
              <Input type="number" value={form.price || ''} min={0}
                onChange={e => set('price', parseFloat(e.target.value) || 0)}
                placeholder="12500" />
            </div>
          </div>

          {/* Featured */}
          <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <Switch checked={form.featured} onCheckedChange={v => set('featured', v)} />
            <div>
              <p className="font-medium text-sm">Produit en vedette ★</p>
              <p className="text-xs text-slate-500">Affiché sur la page d'accueil dans "Nos incontournables"</p>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Images <span className="text-red-500">*</span></Label>
                <p className="text-xs text-slate-400 mt-0.5">La première image est l'image principale</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addImage} className="gap-1 text-xs">
                <Plus className="w-3 h-3" />Ajouter
              </Button>
            </div>
            <div className="space-y-2.5">
              {images.map((img, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 flex items-center justify-center">
                    {img
                      ? <img src={img} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.opacity='0'; }} />
                      : <ImageIcon className="w-4 h-4 text-slate-300" />
                    }
                  </div>
                  <Input value={img} onChange={e => updateImage(idx, e.target.value)} placeholder="https://… ou cliquez Upload →" className="flex-1 text-sm" />
                  <Button type="button" size="icon" variant="outline" className="shrink-0" disabled={uploading} onClick={() => pickFile(idx)}>
                    <Upload className="w-4 h-4" />
                  </Button>
                  {images.length > 1 && (
                    <Button type="button" size="icon" variant="ghost" className="shrink-0 text-red-400 hover:text-red-600" onClick={() => removeImage(idx)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Link2 className="w-3 h-3" />Collez une URL d'image ou uploadez depuis votre appareil
            </p>
          </div>

          {/* Specs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Spécifications techniques</Label>
                <p className="text-xs text-slate-400 mt-0.5">Poids, dimensions, composition, etc.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addSpec} className="gap-1 text-xs">
                <Plus className="w-3 h-3" />Ajouter
              </Button>
            </div>
            {form.specs.length > 0 && (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 px-3 py-2 bg-slate-50 border-b text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <span>Clé FR</span><span>المفتاح AR</span><span>Valeur FR</span><span>القيمة AR</span><span></span>
                </div>
                {form.specs.map(row => (
                  <div key={row.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 px-3 py-2 border-b border-slate-50 items-center last:border-0">
                    <Input value={row.keyFR}   onChange={e => updateSpec(row.id, 'keyFR',   e.target.value)} placeholder="Poids"   className="h-8 text-xs" />
                    <Input value={row.keyAR}   onChange={e => updateSpec(row.id, 'keyAR',   e.target.value)} placeholder="الوزن"   dir="rtl" className="h-8 text-xs text-right" />
                    <Input value={row.valueFR} onChange={e => updateSpec(row.id, 'valueFR', e.target.value)} placeholder="15 kg"   className="h-8 text-xs" />
                    <Input value={row.valueAR} onChange={e => updateSpec(row.id, 'valueAR', e.target.value)} placeholder="15 كجم" dir="rtl" className="h-8 text-xs text-right" />
                    <Button type="button" size="icon" variant="ghost" className="w-7 h-7 text-red-400 hover:text-red-600" onClick={() => removeSpec(row.id)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave} className="min-w-28 bg-emerald-700 hover:bg-emerald-800">
            {isEdit ? 'Enregistrer' : 'Créer le produit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GALLERY TAB
════════════════════════════════════════════════════════════════ */
function GalleryTab({ articles, setArticles }: { articles: Article[]; setArticles: (a: Article[]) => void }) {
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    if (!window.confirm('Supprimer cet article définitivement ?')) return;
    setArticles(articles.filter(a => a.id !== id));
    toast({ title: 'Article supprimé' });
  };

  const handleSave = (data: Article) => {
    if (articles.find(a => a.id === data.id)) {
      setArticles(articles.map(a => a.id === data.id ? data : a));
      toast({ title: 'Article mis à jour ✓' });
    } else {
      setArticles([data, ...articles]);
      toast({ title: 'Article publié ✓' });
    }
    setEditingArticle(null);
    setIsAdding(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setIsAdding(true)} className="gap-2 bg-emerald-700 hover:bg-emerald-800">
          <Plus className="w-4 h-4" />Nouvel article
        </Button>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
          Aucun article. Créez le premier !
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map(a => (
            <div key={a.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group">
              <div className="aspect-video overflow-hidden bg-slate-100">
                <img src={a.image} alt={a.titleFR} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
              <div className="p-4">
                <p className="text-xs text-slate-400 mb-1">
                  {new Date(a.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <h3 className="font-semibold text-sm text-slate-800 line-clamp-2 mb-0.5">{a.titleFR}</h3>
                {a.titleAR && <p className="text-xs text-slate-400 line-clamp-1" dir="rtl">{a.titleAR}</p>}
                {a.excerptFR && <p className="text-xs text-slate-500 line-clamp-2 mt-1">{a.excerptFR}</p>}
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" onClick={() => setEditingArticle(a)}>
                    <Pencil className="w-3 h-3" />Modifier
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600 hover:bg-red-50 px-3" onClick={() => handleDelete(a.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(isAdding || editingArticle) && (
        <ArticleFormDialog
          article={editingArticle}
          onSave={handleSave}
          onClose={() => { setEditingArticle(null); setIsAdding(false); }}
        />
      )}
    </div>
  );
}

/* ─── Article Form Dialog ─── */
function ArticleFormDialog({ article, onSave, onClose }: { article: Article | null; onSave: (a: Article) => void; onClose: () => void }) {
  const isEdit = !!article;
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState<Omit<Article, 'id'>>(() =>
    article ? { ...article, date: article.date.split('T')[0] } : { ...EMPTY_ARTICLE }
  );
  const [uploading, setUploading] = useState(false);

  const set = (field: keyof Omit<Article, 'id'>, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const url = await apiUploadImage(file);
      if (url) {
        set('image', url);
      } else {
        const reader = new FileReader();
        reader.onload = ev => { if (ev.target?.result) set('image', ev.target.result as string); };
        reader.readAsDataURL(file);
      }
    } catch { alert("Upload échoué. Entrez une URL manuellement."); }
    finally { setUploading(false); }
  };

  const pickImage = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = e => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) uploadImage(f); };
    input.click();
  };

  const handleSave = () => {
    if (!form.titleFR.trim()) return alert('Le titre (FR) est requis.');
    if (!form.image.trim()) return alert("L'image principale est requise.");
    onSave({
      id: article?.id || `art${Date.now()}`,
      ...form,
      date: new Date(form.date || today).toISOString(),
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">{isEdit ? "Modifier l'article" : 'Nouvel article'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Titre (FR) <span className="text-red-500">*</span></Label>
              <Input value={form.titleFR} onChange={e => set('titleFR', e.target.value)} placeholder="Comment nourrir son chiot ?" />
            </div>
            <div className="space-y-1.5">
              <Label>العنوان (AR)</Label>
              <Input value={form.titleAR} onChange={e => set('titleAR', e.target.value)} placeholder="كيف تطعم جروك؟" dir="rtl" className="text-right" />
            </div>
          </div>

          {/* Excerpts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Résumé / Extrait (FR)</Label>
              <Textarea value={form.excerptFR} onChange={e => set('excerptFR', e.target.value)} rows={2}
                placeholder="Courte introduction affichée sur la carte d'article…" />
            </div>
            <div className="space-y-1.5">
              <Label>ملخص (AR)</Label>
              <Textarea value={form.excerptAR} onChange={e => set('excerptAR', e.target.value)} rows={2}
                placeholder="مقدمة قصيرة…" dir="rtl" className="text-right" />
            </div>
          </div>

          {/* Body */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Contenu complet (FR)</Label>
              <p className="text-xs text-slate-400">HTML supporté : &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;ul&gt;, etc.</p>
              <Textarea value={form.bodyFR} onChange={e => set('bodyFR', e.target.value)} rows={9}
                placeholder="<p>Votre contenu en français…</p><h2>Titre section</h2><p>Suite…</p>"
                className="font-mono text-xs leading-relaxed" />
            </div>
            <div className="space-y-1.5">
              <Label>المحتوى الكامل (AR)</Label>
              <p className="text-xs text-slate-400">HTML مدعوم</p>
              <Textarea value={form.bodyAR} onChange={e => set('bodyAR', e.target.value)} rows={9}
                placeholder="<p>محتواك بالعربية…</p>"
                dir="rtl" className="text-right font-mono text-xs leading-relaxed" />
            </div>
          </div>

          {/* Image + Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Image principale <span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                <Input value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://…" className="flex-1" />
                <Button type="button" size="icon" variant="outline" disabled={uploading} onClick={pickImage}>
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              {form.image && (
                <div className="mt-2 rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                  <img src={form.image} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Date de publication</Label>
              <Input type="date" value={form.date.split('T')[0]} max={today}
                onChange={e => set('date', e.target.value)} />
              <p className="text-xs text-slate-400">Affichée sur la carte et dans l'article.</p>

              <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-700 font-medium">💡 Conseils de rédaction</p>
                <ul className="text-xs text-blue-600 mt-1.5 space-y-1 list-disc list-inside">
                  <li>Le résumé apparaît sur la carte (galerie)</li>
                  <li>Le contenu complet s'affiche dans l'article</li>
                  <li>Utilisez le HTML pour mettre en forme le contenu</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave} className="min-w-28 bg-emerald-700 hover:bg-emerald-800">
            {isEdit ? 'Enregistrer' : 'Publier'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SETTINGS TAB
════════════════════════════════════════════════════════════════ */
function SettingsTab({ settings, setSettings }: { settings: KindoSettings; setSettings: (s: KindoSettings) => void }) {
  const [form, setForm] = useState<KindoSettings>({ ...settings });
  const { toast } = useToast();

  const set = (field: keyof KindoSettings, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSave = () => {
    setSettings(form);
    toast({ title: 'Paramètres enregistrés ✓', description: 'Les changements sont visibles immédiatement.' });
  };

  return (
    <div className="max-w-2xl space-y-6">

      {/* Contact & Social */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader><CardTitle className="text-sm">Contact & Réseaux sociaux</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Numéro WhatsApp</Label>
            <Input value={form.whatsappNumber} onChange={e => set('whatsappNumber', e.target.value.replace(/\D/g, ''))}
              placeholder="213555000000" dir="ltr" />
            <p className="text-xs text-slate-400">Format international sans + ni espaces. Ex: 213555000000</p>
            {form.whatsappNumber && (
              <div className="p-2 bg-green-50 rounded-lg text-xs text-green-700 font-medium">
                Lien : wa.me/{form.whatsappNumber}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>URL Facebook</Label>
              <Input value={form.facebookUrl} onChange={e => set('facebookUrl', e.target.value)} placeholder="https://facebook.com/kindo" />
            </div>
            <div className="space-y-1.5">
              <Label>URL Instagram</Label>
              <Input value={form.instagramUrl} onChange={e => set('instagramUrl', e.target.value)} placeholder="https://instagram.com/kindo" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Téléphone affiché</Label>
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+213 555 000 000" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="contact@kindo.dz" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promo Banner */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader><CardTitle className="text-sm">Bandeau promotionnel (haut de page)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Texte — Français</Label>
            <Input value={form.promoTextFR} onChange={e => set('promoTextFR', e.target.value)}
              placeholder="Livraison gratuite dès 5000 DA sur Alger et environs" />
          </div>
          <div className="space-y-1.5">
            <Label>النص — العربية</Label>
            <Input value={form.promoTextAR} onChange={e => set('promoTextAR', e.target.value)}
              placeholder="توصيل مجاني من 5000 دج…" dir="rtl" className="text-right" />
          </div>
          <div className="p-3 rounded-xl bg-emerald-700 text-white text-sm text-center font-medium">
            {form.promoTextFR || 'Aperçu du bandeau…'}
          </div>
        </CardContent>
      </Card>

      {/* Ad Banner */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-sm">Bannière publicitaire (après les partenaires)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, adBannerEnabled: !f.adBannerEnabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.adBannerEnabled ? 'bg-emerald-600' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.adBannerEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <Label className="cursor-pointer" onClick={() => setForm(f => ({ ...f, adBannerEnabled: !f.adBannerEnabled }))}>
              {form.adBannerEnabled ? 'Bannière activée ✓' : 'Bannière désactivée'}
            </Label>
          </div>

          {/* Image */}
          <div className="space-y-1.5">
            <Label>Image de la bannière</Label>
            <div className="flex gap-2">
              <Input
                value={form.adBannerImage.startsWith('data:') ? '' : form.adBannerImage}
                onChange={e => set('adBannerImage', e.target.value)}
                placeholder="https://... ou téléverser ci-dessous"
                className="flex-1"
              />
              <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-slate-300 hover:border-emerald-400 text-xs text-slate-500 hover:text-emerald-600 transition-colors whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Téléverser
                <input type="file" accept="image/*" className="hidden" onChange={async e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await apiUploadImage(file);
                  if (url) {
                    set('adBannerImage', url);
                  } else {
                    const reader = new FileReader();
                    reader.onload = ev => set('adBannerImage', ev.target?.result as string ?? '');
                    reader.readAsDataURL(file);
                  }
                }} />
              </label>
            </div>
            {form.adBannerImage && (
              <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 max-h-40">
                <img src={form.adBannerImage} alt="Aperçu bannière" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Titre — Français</Label>
              <Input value={form.adBannerTitleFR} onChange={e => set('adBannerTitleFR', e.target.value)} placeholder="Notre nouvelle collection" />
            </div>
            <div className="space-y-1.5">
              <Label>العنوان — العربية</Label>
              <Input value={form.adBannerTitleAR} onChange={e => set('adBannerTitleAR', e.target.value)} placeholder="مجموعتنا الجديدة" dir="rtl" className="text-right" />
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Description — Français</Label>
              <textarea
                value={form.adBannerDescFR}
                onChange={e => set('adBannerDescFR', e.target.value)}
                placeholder="Découvrez notre sélection exclusive pour vos animaux…"
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label>الوصف — العربية</Label>
              <textarea
                value={form.adBannerDescAR}
                onChange={e => set('adBannerDescAR', e.target.value)}
                placeholder="اكتشف تشكيلتنا الحصرية لحيواناتك الأليفة…"
                rows={3}
                dir="rtl"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none text-right"
              />
            </div>
          </div>

          {/* Link */}
          <div className="space-y-1.5">
            <Label>Lien (optionnel) — toute la bannière devient cliquable</Label>
            <Input value={form.adBannerLinkUrl} onChange={e => set('adBannerLinkUrl', e.target.value)} placeholder="https://... ou /catalog" />
          </div>

          {/* Live preview */}
          {(form.adBannerTitleFR || form.adBannerImage) && (
            <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 relative min-h-[120px] flex items-center justify-center"
              style={form.adBannerImage ? { backgroundImage: `url(${form.adBannerImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: '#f1f5f9' }}>
              {form.adBannerImage && <div className="absolute inset-0 bg-black/50 rounded-xl" />}
              <div className={`relative z-10 text-center px-6 py-4 ${form.adBannerImage ? 'text-white' : 'text-slate-700'}`}>
                {form.adBannerTitleFR && <div className="font-serif font-bold text-lg">{form.adBannerTitleFR}</div>}
                {form.adBannerDescFR && <div className="text-sm mt-1 opacity-90">{form.adBannerDescFR}</div>}
              </div>
              <div className="absolute top-2 right-2 text-xs bg-black/30 text-white px-2 py-0.5 rounded-full">Aperçu</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Address */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader><CardTitle className="text-sm">Adresse</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Adresse (FR)</Label>
              <Input value={form.addressFR} onChange={e => set('addressFR', e.target.value)} placeholder="Alger, Algérie" />
            </div>
            <div className="space-y-1.5">
              <Label>العنوان (AR)</Label>
              <Input value={form.addressAR} onChange={e => set('addressAR', e.target.value)}
                placeholder="الجزائر العاصمة، الجزائر" dir="rtl" className="text-right" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button size="lg" onClick={handleSave} className="w-full sm:w-auto px-12 bg-emerald-700 hover:bg-emerald-800">
        Enregistrer tous les paramètres
      </Button>
    </div>
  );
}
