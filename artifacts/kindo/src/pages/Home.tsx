import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useStore } from '@/lib/StoreContext';
import { KindoSettings } from '@/lib/store';
import { partners, partnerMarquee } from '@/data/partners';
import { ProductCard } from '@/components/shared/ProductCard';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

function AdBanner({ settings, language }: { settings: KindoSettings; language: string }) {
  const isAr = language === 'ar';
  const title = isAr ? settings.adBannerTitleAR : settings.adBannerTitleFR;
  const desc  = isAr ? settings.adBannerDescAR  : settings.adBannerDescFR;
  const hasText = title || desc;
  const hasImage = !!settings.adBannerImage;
  const hasLink = !!settings.adBannerLinkUrl;

  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`relative w-full overflow-hidden ${hasImage ? 'min-h-[260px] md:min-h-[400px]' : 'py-12 md:py-20'} flex items-center justify-center`}
    >
      {hasImage && (
        <>
          <img
            src={settings.adBannerImage}
            alt={title || 'Publicité'}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/50" />
        </>
      )}
      {hasText && (
        <div
          className={`relative z-10 max-w-3xl mx-auto px-6 md:px-10 text-center ${
            hasImage ? 'text-white' : 'text-foreground'
          }`}
          dir={isAr ? 'rtl' : 'ltr'}
        >
          {title && (
            <h2 className={`font-serif font-bold leading-tight mb-4 ${
              hasImage
                ? 'text-3xl md:text-5xl drop-shadow-lg'
                : 'text-3xl md:text-4xl'
            }`}>
              {title}
            </h2>
          )}
          {desc && (
            <p className={`text-base md:text-lg font-light max-w-xl mx-auto ${
              hasImage ? 'text-white/90 drop-shadow' : 'text-muted-foreground'
            }`}>
              {desc}
            </p>
          )}
          {hasLink && (
            <div className="mt-8">
              <span className={`inline-block px-8 py-3 rounded-full font-semibold text-sm transition-all duration-200 ${
                hasImage
                  ? 'bg-white text-primary hover:bg-white/90'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}>
                {isAr ? 'اكتشف المزيد' : 'Découvrir'}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );

  return (
    <section className={`w-full ${!hasImage ? 'bg-muted/40 border-y border-border' : ''}`}>
      {hasLink ? (
        <a href={settings.adBannerLinkUrl} target="_blank" rel="noopener noreferrer" className="block group cursor-pointer">
          {inner}
        </a>
      ) : inner}
    </section>
  );
}

const heroImage = 'https://pub-943bd5d0ce6f4df9b0b9cbc05bec9e54.r2.dev/img.png'; // hero image

export default function Home() {
  const { language, t } = useLanguage();
  const { products, articles, settings } = useStore();

  const categories = ['dogs', 'cats', 'birds', 'fish'] as const;

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative h-[50vh] md:h-[80vh] min-h-[400px] md:min-h-[600px] w-full flex items-center justify-center overflow-hidden bg-sky-100">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="Kindo Hero" className="w-full h-full object-contain md:object-cover object-center" />
          <div className="absolute inset-0 bg-black/20 md:bg-black/40" />
        </div>
        <div className="container relative z-10 mx-auto px-4 h-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-white h-full flex flex-col justify-between py-10 md:text-center md:dir-ltr"
          >
            <div>
              <h1 className="font-serif text-3xl md:text-7xl font-bold mb-6 leading-tight">{t('home.heroTitle')}</h1>
              <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto font-light">{t('home.heroSubtitle')}</p>
            </div>
            <div className="mt-auto md:flex md:justify-center">
              <Button size="lg" asChild className="text-base h-14 px-8 rounded-full">
                <Link href="/catalog">{t('home.heroCta')}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partners Marquee */}
      <section className="border-b border-border bg-card py-6 overflow-hidden">
        <div className={`flex gap-10 items-center whitespace-nowrap opacity-60 ${language === 'ar' ? 'animate-marquee-right' : 'animate-marquee-left'}`}>
          {[...partnerMarquee, ...partnerMarquee].map((name, i) => (
            <div key={i} className="text-sm font-semibold tracking-wider uppercase flex-shrink-0 px-2">{name}</div>
          ))}
        </div>
      </section>

      {/* Ad Banner */}
      {settings.adBannerEnabled && (settings.adBannerImage || settings.adBannerTitleFR || settings.adBannerTitleAR) && (
        <AdBanner settings={settings} language={language} />
      )}

      {/* Hot Items / Featured */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4">{t('home.hotItems')}</h2>
          </div>

          <Tabs defaultValue="dogs" className="w-full" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex justify-center mb-12">
              <TabsList className="bg-muted/50 p-1">
                {categories.map(cat => (
                  <TabsTrigger key={cat} value={cat} className="px-6 py-2">{t(`nav.${cat}`)}</TabsTrigger>
                ))}
              </TabsList>
            </div>
            {categories.map(cat => {
              const featured = products.filter(p => p.category === cat && p.featured).slice(0, 5);
              const fallback = featured.length === 0 ? products.filter(p => p.category === cat).slice(0, 5) : featured;
              return (
                <TabsContent key={cat} value={cat} className="mt-0">
                  {fallback.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                      {fallback.map((product, i) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      {language === 'ar' ? 'لا توجد منتجات في هذه الفئة بعد.' : 'Aucun produit dans cette catégorie pour le moment.'}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>

          <div className="mt-12 text-center">
            <Button variant="outline" asChild>
              <Link href="/catalog">{t('common.all')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      {articles.length > 0 && (
        <section className="py-20 md:py-32 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4">{t('home.latestNews')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {articles.slice(0, 3).map((article, i) => {
                const title = language === 'ar' ? article.titleAR : article.titleFR;
                const excerpt = language === 'ar' ? article.excerptAR : article.excerptFR;
                return (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                  >
                    <Card className="overflow-hidden hover-elevate group cursor-pointer border-transparent bg-background shadow-sm">
                      <Link href={`/article/${article.id}`} className="block">
                        <div className="aspect-[4/3] overflow-hidden">
                          <img src={article.image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <CardContent className="p-6">
                          <div className="text-xs text-muted-foreground mb-2">
                            {new Date(article.date).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR')}
                          </div>
                          <h3 className="font-bold text-xl mb-3 line-clamp-2 group-hover:text-primary transition-colors">{title}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-3">{excerpt}</p>
                        </CardContent>
                      </Link>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Partners & Certifications */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4">{t('home.partnersTitle')}</h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">{t('home.partnersSubtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {partners.map((partner, i) => {
              const name = language === 'ar' ? partner.nameAR : partner.nameFR;
              const desc = language === 'ar' ? partner.descriptionAR : partner.descriptionFR;
              const typeColors: Record<string, string> = {
                brand: 'bg-primary/8 border-primary/20 hover:border-primary/50',
                certificate: 'bg-amber-500/8 border-amber-500/20 hover:border-amber-500/50',
                award: 'bg-emerald-500/8 border-emerald-500/20 hover:border-emerald-500/50',
              };
              const iconColors: Record<string, string> = {
                brand: 'bg-primary/15 text-primary',
                certificate: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
                award: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
              };
              return (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className={`group flex flex-col items-center gap-4 rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default ${typeColors[partner.type]}`}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-sm tracking-widest ${iconColors[partner.type]}`}>
                    {partner.icon}
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-foreground text-sm leading-snug mb-1">{name}</div>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-8">{t('home.ctaBanner')}</h2>
          <Button size="lg" variant="secondary" asChild className="h-14 px-8 rounded-full text-primary font-bold">
            <Link href="/contact">{t('nav.contact')}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
