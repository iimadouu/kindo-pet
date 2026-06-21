import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useStore } from '@/lib/StoreContext';
import { ProductCard } from '@/components/shared/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useParams } from 'wouter';
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

const ITEMS_PER_PAGE = 12;

export default function Catalog() {
  const { language, t } = useLanguage();
  const { products } = useStore();
  const params = useParams();
  const initialCategory = (params as { category?: string }).category || 'all';
  
  // Get search query from URL
  const urlParams = new URLSearchParams(window.location.search);
  const urlSearch = urlParams.get('search') || '';

  const [search, setSearch] = useState(urlSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory !== 'all' ? [initialCategory] : []
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const categories = ['dogs', 'cats', 'birds', 'fish'];
  const types = ['food', 'accessory'];

  const handleCategoryToggle = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setPage(1);
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
    setPage(1);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search in French name, Arabic name, description, and keywords
      const searchText = search.toLowerCase();
      const matchSearch = search === '' || 
        p.nameFR.toLowerCase().includes(searchText) ||
        p.nameAR.toLowerCase().includes(searchText) ||
        (p.descriptionFR || '').toLowerCase().includes(searchText) ||
        (p.descriptionAR || '').toLowerCase().includes(searchText) ||
        (p.keywords || '').toLowerCase().includes(searchText);
      
      const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
      const matchType = selectedTypes.length === 0 || selectedTypes.includes(p.type);
      return matchSearch && matchCategory && matchType;
    });
  }, [products, search, selectedCategories, selectedTypes]);

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
