import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useLanguage } from '@/i18n/LanguageContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex flex-col w-full bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Promo Banner */}
      <div className="bg-primary text-primary-foreground text-xs md:text-sm font-medium py-2 px-4 text-center">
        {t('home.promoText')}
      </div>
      
      <Navbar />
      
      <main className="flex-1 w-full pt-16">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
