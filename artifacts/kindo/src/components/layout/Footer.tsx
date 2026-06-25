import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useStore } from '@/lib/StoreContext';
import { Link } from 'wouter';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';

export function Footer() {
  const { t, language } = useLanguage();
  const { settings } = useStore();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          <div className="md:col-span-1">
            <Link href="/" className="block mb-4">
              <span className="text-3xl font-bold tracking-wider text-red-600" style={{ fontFamily: "'Sigmar One', cursive", WebkitTextStroke: '2px white', paintOrder: 'stroke fill' }}>
                KINDO
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs">
              {language === 'ar'
                ? 'التميز لرفاقك. اكتشف مجموعتنا المتميزة من الأغذية والإكسسوارات.'
                : "L'excellence pour vos compagnons. Découvrez notre sélection premium d'alimentation et d'accessoires."}
            </p>
            <div className="flex gap-4">
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">{t('nav.catalog')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/catalog/dogs" className="hover:text-primary transition-colors">{t('nav.dogs')}</Link></li>
              <li><Link href="/catalog/cats" className="hover:text-primary transition-colors">{t('nav.cats')}</Link></li>
              <li><Link href="/catalog/birds" className="hover:text-primary transition-colors">{t('nav.birds')}</Link></li>
              <li><Link href="/catalog/fish" className="hover:text-primary transition-colors">{t('nav.fish')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">
              {language === 'ar' ? 'الشركة' : 'Entreprise'}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">{t('nav.about')}</Link></li>
              <li><Link href="/gallery" className="hover:text-primary transition-colors">{t('nav.gallery')}</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">{t('nav.contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">{t('nav.contact')}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>{language === 'ar' ? settings.addressAR : settings.addressFR}</li>
              <li dir="ltr">{settings.phone}</li>
              <li>
                <a
                  href={`https://wa.me/${settings.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#25D366] hover:underline font-medium mt-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t('common.orderViaWhatsapp')}
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>&copy; {year} KINDO. {language === 'ar' ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}</p>
          <div className="flex gap-4">
            <Link 
              href="/privacy" 
              className="hover:text-foreground transition-colors py-2 px-1 active:scale-95 touch-manipulation"
            >
              {t('legal.privacyPolicy')}
            </Link>
            <Link 
              href="/terms" 
              className="hover:text-foreground transition-colors py-2 px-1 active:scale-95 touch-manipulation"
            >
              {t('legal.termsOfUse')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
