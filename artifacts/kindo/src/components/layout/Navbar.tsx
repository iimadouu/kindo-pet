import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from 'next-themes';
import { Menu, X, Search, Moon, Sun, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/catalog', label: t('nav.catalog') },
    { href: '/gallery', label: t('nav.gallery') },
    { href: '/about', label: t('nav.about') },
    { href: '/contact', label: t('nav.contact') },
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="font-serif text-2xl font-bold tracking-wider text-primary flex items-center gap-2">
          KINDO
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
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
          <div className="hidden sm:flex relative w-48 lg:w-64">
            <Search className="absolute ltr:left-2 rtl:right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={t('common.search')} 
              className="h-9 ltr:pl-8 rtl:pr-8 bg-muted/50 border-transparent focus-visible:bg-background"
            />
          </div>

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
          <div className="relative w-full">
            <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={t('common.search')} 
              className="h-10 ltr:pl-9 rtl:pr-9 w-full"
            />
          </div>
          <nav className="flex flex-col gap-2">
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
