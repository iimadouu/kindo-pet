import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { useStore } from '@/lib/StoreContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  const { settings } = useStore();
  const promoText = language === 'ar' ? settings.promoTextAR : settings.promoTextFR;

  return (
    <div className="min-h-screen flex flex-col w-full bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <div className="fixed top-0 w-full z-50 flex flex-col">
        <div className="bg-primary text-primary-foreground text-xs md:text-sm font-medium py-2 px-4 text-center">
          {promoText}
        </div>
        <Navbar />
      </div>
      <main className="flex-1 w-full pt-[96px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
