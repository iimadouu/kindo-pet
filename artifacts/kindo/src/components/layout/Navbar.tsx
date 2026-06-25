import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from 'next-themes';
import { Menu, X, Search, Moon, Sun, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/lib/StoreContext';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { products } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const animals = ['dogs', 'cats', 'birds', 'fish'];
  const productMenuItems = useMemo(() => {
    const items: Record<string, { food: string[]; accessory: string[] }> = {};
    animals.forEach(animal => {
      items[animal] = { food: [], accessory: [] };
    });
    products.forEach(product => {
      if (!animals.includes(product.category)) return;
      if (product.type === 'food' && product.foodCategory) {
        items[product.category].food.push(product.foodCategory);
      }
      if (product.type === 'accessory' && product.accessoryCategory) {
        items[product.category].accessory.push(product.accessoryCategory);
      }
    });
    animals.forEach(animal => {
      items[animal].food = Array.from(new Set(items[animal].food)).sort();
      items[animal].accessory = Array.from(new Set(items[animal].accessory)).sort();
    });
    return items;
  }, [products]);

  const buildCatalogUrl = ({ category, type, subtype }: { category?: string; type?: 'food' | 'accessory'; subtype?: string }) => {
    if (!category) return '/catalog';
    if (!type) return `/catalog/${encodeURIComponent(category)}`;
    if (!subtype) return `/catalog/${encodeURIComponent(category)}/${encodeURIComponent(type)}`;
    return `/catalog/${encodeURIComponent(category)}/${encodeURIComponent(type)}/${encodeURIComponent(subtype)}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/gallery', label: t('nav.gallery') },
    { href: '/about', label: t('nav.about') },
    { href: '/contact', label: t('nav.contact') },
  ];

  return (
    <header className={`w-full transition-all duration-300 ${isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm' : 'bg-background/80 backdrop-blur-sm border-b border-border/50'}`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl font-bold tracking-wider text-red-600" style={{ fontFamily: "'Sigmar One', cursive", WebkitTextStroke: '2px white', paintOrder: 'stroke fill' }}>
            KINDO
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className={`text-sm font-medium transition-colors ${location.startsWith('/catalog') ? 'text-primary' : 'text-foreground/80'}`}>
                {t('nav.products')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={8}>
              <DropdownMenuItem onSelect={() => setLocation('/catalog')}>
                {t('common.all')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {animals.map(animal => (
                <DropdownMenuSub key={animal}>
                  <DropdownMenuSubTrigger>{t(`nav.${animal}`)}</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {productMenuItems[animal].food.length > 0 && (
                      <>
                        <DropdownMenuLabel>{t('nav.food')}</DropdownMenuLabel>
                        <DropdownMenuItem
                          key={`${animal}-food-all`}
                          onSelect={() => setLocation(buildCatalogUrl({ category: animal, type: 'food' }))}
                        >
                          {t('common.all')}
                        </DropdownMenuItem>
                        {productMenuItems[animal].food.map(category => (
                          <DropdownMenuItem
                            key={`${animal}-food-${category}`}
                            onSelect={() => setLocation(buildCatalogUrl({ category: animal, type: 'food', subtype: category }))}
                          >
                            {category}
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                    {productMenuItems[animal].accessory.length > 0 && (
                      <>
                        <DropdownMenuLabel>{t('nav.accessory')}</DropdownMenuLabel>
                        {productMenuItems[animal].accessory.map(category => (
                          <DropdownMenuItem
                            key={`${animal}-accessory-${category}`}
                            onSelect={() => setLocation(buildCatalogUrl({ category: animal, type: 'accessory', subtype: category }))}
                          >
                            {category}
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                    {productMenuItems[animal].food.length === 0 && productMenuItems[animal].accessory.length === 0 && (
                      <DropdownMenuItem onSelect={() => setLocation(`/catalog/${animal}`)}>
                        {t('common.all')}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${location === link.href ? 'text-primary' : 'text-foreground/80'}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="hidden sm:flex relative w-48 lg:w-64">
            <Search className="absolute ltr:left-2 rtl:right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('common.search')} 
              className="h-9 ltr:pl-8 rtl:pr-8 bg-muted/50 border-transparent focus-visible:bg-background"
            />
          </form>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
            className="font-bold text-sm"
          >
            {language === 'fr' ? 'AR' : 'FR'}
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border shadow-lg p-4 flex flex-col gap-4 animate-in slide-in-from-top-4">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('common.search')} 
              className="h-10 ltr:pl-9 rtl:pr-9 w-full"
            />
          </form>
          <nav className="flex flex-col gap-2">
            <Link
              href="/catalog"
              className={`p-2 rounded-md text-sm font-medium ${location.startsWith('/catalog') ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-muted'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.products')}
            </Link>
            {animals.map(animal => (
              <details key={animal} className="group rounded-md border border-border/70 overflow-hidden">
                <summary className="flex items-center justify-between p-2 text-sm font-medium cursor-pointer bg-muted/50">
                  {t(`nav.${animal}`)}
                  <span className="text-xs opacity-70">+</span>
                </summary>
                <div className="space-y-1 p-2 bg-background">
                  {productMenuItems[animal].food.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">{t('nav.food')}</div>
                      <Link
                        href={buildCatalogUrl({ category: animal, type: 'food' })}
                        className="block rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-muted"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('common.all')}
                      </Link>
                      {productMenuItems[animal].food.map(category => (
                        <Link
                          key={`${animal}-mobile-food-${category}`}
                          href={buildCatalogUrl({ category: animal, type: 'food', subtype: category })}
                          className="block rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-muted"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  )}
                  {productMenuItems[animal].accessory.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">{t('nav.accessory')}</div>
                      {productMenuItems[animal].accessory.map(category => (
                        <Link
                          key={`${animal}-mobile-accessory-${category}`}
                          href={buildCatalogUrl({ category: animal, type: 'accessory', subtype: category })}
                          className="block rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-muted"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  )}
                  {productMenuItems[animal].food.length === 0 && productMenuItems[animal].accessory.length === 0 && (
                    <Link
                      href={`/catalog/${animal}`}
                      className="block rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-muted"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('common.all')}
                    </Link>
                  )}
                </div>
              </details>
            ))}
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`p-2 rounded-md text-sm font-medium ${location === link.href ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-muted'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
