import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Link } from 'wouter';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="md:col-span-1">
            <Link href="/" className="font-serif text-3xl font-bold tracking-wider text-primary block mb-4">
              KINDO
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs">
              L'excellence pour vos compagnons. Découvrez notre sélection premium d'alimentation et d'accessoires.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
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
            <h4 className="font-bold text-foreground mb-4">Entreprise</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">{t('nav.about')}</Link></li>
              <li><Link href="/gallery" className="hover:text-primary transition-colors">{t('nav.gallery')}</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">{t('nav.contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">{t('nav.contact')}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>Alger, Algérie</li>
              <li>+213 555 000 000</li>
              <li>
                <a href="https://wa.me/213555000000" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#25D366] hover:underline font-medium mt-2">
                  <MessageCircle className="w-4 h-4" />
                  {t('common.orderViaWhatsapp')}
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>&copy; {year} KINDO. Tous droits réservés.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Politique de confidentialité</a>
            <a href="#" className="hover:text-foreground transition-colors">Conditions générales</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
