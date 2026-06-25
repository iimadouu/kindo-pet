import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useStore } from '@/lib/StoreContext';
import { ProductCard } from '@/components/shared/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useParams, useLocation } from 'wouter';
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

const ITEMS_PER_PAGE = 12;

export default function Catalog() {
  const { language, t } = useLanguage();
  const { products } = useStore();
  const params = useParams() as { category?: string; type?: string; subtype?: string };
  const [location] = useLocation();
  const initialCategory = params.category || 'all';
  const query = useMemo(() => new URLSearchParams(location.split('?')[1] || ''), [location]);

  const normalizeCategory = (value: string | null) => {
    if (!value) return '';
    const normalized = value.trim().toLowerCase();
    if (normalized === 'dog') return 'dogs';
    if (normalized === 'cat') return 'cats';
    if (normalized === 'bird') return 'birds';
    return normalized;
  };

  const normalizeType = (value: string | null) => {
    if (!value) return '';
    const normalized = value.trim().toLowerCase();
    return normalized === 'food' || normalized === 'accessory' ? normalized : '';
  };

  const parseList = (value: string | null) =>
    value ? value.split(',').map(v => v.trim()).filter(Boolean) : [];

  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedFoodCategories, setSelectedFoodCategories] = useState<string[]>([]);
  const [selectedAccessoryCategories, setSelectedAccessoryCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setSearch(query.get('search') || '');
    const categoryFromQuery = normalizeCategory(query.get('category') || query.get('categoy'));
    const categoryFromPath = normalizeCategory(params.category || null);
    const typeFromPath = normalizeType(params.type || null);
    const typeFromQuery = normalizeType(query.get('type'));
    const selectedCategory = categoryFromPath || categoryFromQuery || normalizeCategory(initialCategory);
    const selectedType = typeFromPath || typeFromQuery;

    setSelectedCategories(selectedCategory && selectedCategory !== 'all' ? [selectedCategory] : []);
    setSelectedTypes(selectedType ? [selectedType] : []);

    if (typeFromPath === 'food') {
      setSelectedFoodCategories(params.subtype ? [params.subtype] : []);
      setSelectedAccessoryCategories([]);
    } else if (typeFromPath === 'accessory') {
      setSelectedAccessoryCategories(params.subtype ? [params.subtype] : []);
      setSelectedFoodCategories([]);
    } else {
      setSelectedFoodCategories(parseList(query.get('foodCategory')));
      setSelectedAccessoryCategories(parseList(query.get('accessoryCategory')));
    }

    setPage(1);
  }, [location, query, initialCategory, params.category, params.type, params.subtype]);

  const categories = ['dogs', 'cats', 'birds', 'fish', 'none'];
  const types = ['food', 'accessory'];

  const handleCategoryToggle = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setPage(1);
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => {
      const next = prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type];
      if (!next.includes('food')) {
        setSelectedFoodCategories([]);
      }
      if (!next.includes('accessory')) {
        setSelectedAccessoryCategories([]);
      }
      return next;
    });
    setPage(1);
  };

  const handleFoodCategoryToggle = (category: string) => {
    setSelectedFoodCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
    setPage(1);
  };

  const handleAccessoryCategoryToggle = (category: string) => {
    setSelectedAccessoryCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
    setPage(1);
  };

  const updatePriceRange = (index: 0 | 1, value: number) => {
    setPriceRange(([min, max]) => {
      if (index === 0) {
        const nextMin = Math.min(value, max);
        return [nextMin, max];
      }
      const nextMax = Math.max(value, min);
      return [min, nextMax];
    });
    setPage(1);
  };

  const availableFoodCategories = useMemo(() => {
    return Array.from(new Set(products
      .filter(p => {
        const productCategory = normalizeCategory(p.category);
        return p.type === 'food' && (selectedCategories.length === 0 || selectedCategories.includes(productCategory));
      })
      .map(p => (p.foodCategory || '').trim())
      .filter(Boolean)
    ));
  }, [products, selectedCategories]);

  const availableAccessoryCategories = useMemo(() => {
    return Array.from(new Set(products
      .filter(p => {
        const productCategory = normalizeCategory(p.category);
        return p.type === 'accessory' && (selectedCategories.length === 0 || selectedCategories.includes(productCategory));
      })
      .map(p => (p.accessoryCategory || '').trim())
      .filter(Boolean)
    ));
  }, [products, selectedCategories]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search in French name, Arabic name, description, and keywords
      const searchText = search.toLowerCase();
      const matchSearch = search === '' || 
        p.nameFR.toLowerCase().includes(searchText) ||
        p.nameAR.toLowerCase().includes(searchText) ||
        (p.descriptionFR || '').toLowerCase().includes(searchText) ||
        (p.descriptionAR || '').toLowerCase().includes(searchText) ||
        (p.keywords || '').toLowerCase().includes(searchText) ||
        p.category.toLowerCase().includes(searchText) ||
        p.type.toLowerCase().includes(searchText) ||
        (p.foodCategory || '').toLowerCase().includes(searchText) ||
        (p.accessoryCategory || '').toLowerCase().includes(searchText) ||
        t(`nav.${p.category}`).toLowerCase().includes(searchText) ||
        t(`nav.${p.type}`).toLowerCase().includes(searchText);
      
      const productCategory = normalizeCategory(p.category);
      const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(productCategory);
      const matchType = selectedTypes.length === 0 || selectedTypes.includes(p.type);
      const matchFoodCategory = selectedFoodCategories.length === 0 || (p.type === 'food' && selectedFoodCategories.includes(p.foodCategory || ''));
      const matchAccessoryCategory = selectedAccessoryCategories.length === 0 || (p.type === 'accessory' && selectedAccessoryCategories.includes(p.accessoryCategory || ''));
      const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchSearch && matchCategory && matchType && matchFoodCategory && matchAccessoryCategory && matchPrice;
    });
  }, [products, search, selectedCategories, selectedTypes, selectedFoodCategories, selectedAccessoryCategories, priceRange, t]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const FilterSidebar = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-bold mb-4">{t('common.category')}</h3>
        <div className="space-y-3">
          {categories.map(cat => (
            <div key={cat} className="flex items-center space-x-2 rtl:space-x-reverse">
              <Checkbox
                id={`cat-${cat}`}
                checked={selectedCategories.includes(cat)}
                onCheckedChange={() => handleCategoryToggle(cat)}
              />
              <Label htmlFor={`cat-${cat}`} className="cursor-pointer">{t(`nav.${cat}`)}</Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <h3 className="font-bold mb-4">{t('common.type')}</h3>
        <div className="space-y-3">
          {types.map(type => (
            <div key={type} className="flex items-center space-x-2 rtl:space-x-reverse">
              <Checkbox
                id={`type-${type}`}
                checked={selectedTypes.includes(type)}
                onCheckedChange={() => handleTypeToggle(type)}
              />
              <Label htmlFor={`type-${type}`} className="cursor-pointer">{t(`nav.${type}`)}</Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <h3 className="font-bold mb-4">{t('common.price')}</h3>
        <div className="space-y-4 text-sm text-slate-600">
          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <div className="flex items-center justify-between">
                <span>{t('common.min')}</span>
                <span>{priceRange[0].toLocaleString('fr-DZ')} {t('common.currency')}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1000000}
                step={50}
                value={priceRange[0]}
                onChange={(e) => updatePriceRange(0, Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span>{t('common.max')}</span>
                <span>{priceRange[1].toLocaleString('fr-DZ')} {t('common.currency')}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1000000}
                step={50}
                value={priceRange[1]}
                onChange={(e) => updatePriceRange(1, Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              min={0}
              max={priceRange[1]}
              step={50}
              value={priceRange[0]}
              onChange={(e) => updatePriceRange(0, Number(e.target.value))}
              className="w-full border rounded-md px-3 py-2"
              aria-label="Minimum price"
            />
            <input
              type="number"
              min={priceRange[0]}
              max={1000000}
              step={50}
              value={priceRange[1]}
              onChange={(e) => updatePriceRange(1, Number(e.target.value))}
              className="w-full border rounded-md px-3 py-2"
              aria-label="Maximum price"
            />
          </div>
        </div>
      </div>
      {selectedTypes.includes('food') && availableFoodCategories.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-bold mb-4">{t('catalog.foodCategory')}</h3>
            <div className="space-y-3">
              {availableFoodCategories.map(category => (
                <div key={category} className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id={`food-cat-${category}`}
                    checked={selectedFoodCategories.includes(category)}
                    onCheckedChange={() => handleFoodCategoryToggle(category)}
                  />
                  <Label htmlFor={`food-cat-${category}`} className="cursor-pointer">{category}</Label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {selectedTypes.includes('accessory') && availableAccessoryCategories.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-bold mb-4">{t('catalog.accessoryCategory')}</h3>
            <div className="space-y-3">
              {availableAccessoryCategories.map(category => (
                <div key={category} className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id={`accessory-cat-${category}`}
                    checked={selectedAccessoryCategories.includes(category)}
                    onCheckedChange={() => handleAccessoryCategoryToggle(category)}
                  />
                  <Label htmlFor={`accessory-cat-${category}`} className="cursor-pointer">{category}</Label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold">{t('catalog.title')}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{filteredProducts.length} produits</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="ltr:pl-9 rtl:pr-9 w-full bg-background"
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden shrink-0">
                <Filter className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side={language === 'ar' ? 'right' : 'left'}>
              <SheetHeader className="mb-6">
                <SheetTitle>{t('catalog.filterBy')}</SheetTitle>
              </SheetHeader>
              <FilterSidebar />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24">
            <FilterSidebar />
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          {currentProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {currentProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    {language === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </Button>
                  <span className="text-sm font-medium">
                    {t('catalog.page')} {page} {t('catalog.of')} {totalPages}
                  </span>
                  <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                    {language === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24 bg-muted/30 rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground font-medium">{t('catalog.noResults')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
