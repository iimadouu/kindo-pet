import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { fullCatalog } from '@/data/catalog';
import { gallery } from '@/data/gallery';
import { partners } from '@/data/partners';
import { ProductCard } from '@/components/shared/ProductCard';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
const heroImage = 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=1920&q=80';

export default function Home() {
  const { language, t } = useLanguage();

  const categories = ['dogs', 'cats', 'birds', 'fish'] as const;

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Kindo Hero" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-white"
          >
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {t('home.heroTitle')}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto font-light">
              {t('home.heroSubtitle')}
            </p>
            <Button size="lg" asChild className="text-base h-14 px-8 rounded-full">
              <Link href="/catalog">{t('home.heroCta')}</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Partners Marquee */}
      <section className="border-b border-border bg-card py-6 overflow-hidden">
        <div className="container mx-auto">
          <div className="flex gap-8 items-center animate-marquee whitespace-nowrap opacity-60">
            {[...partners, ...partners].map((partner, i) => (
              <div key={i} className="text-sm font-semibold tracking-wider uppercase flex-shrink-0">
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hot Items / Featured */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4">
              {t('home.hotItems')}
            </h2>
          </div>

          <Tabs defaultValue="dogs" className="w-full" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex justify-center mb-12">
              <TabsList className="bg-muted/50 p-1">
                {categories.map(cat => (
                  <TabsTrigger key={cat} value={cat} className="px-6 py-2">
                    {t(`nav.${cat}`)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {categories.map(cat => (
              <TabsContent key={cat} value={cat} className="mt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {fullCatalog
                    .filter(p => p.category === cat && p.featured)
                    .slice(0, 5)
                    .map((product, i) => (
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
              </TabsContent>
            ))}
          </Tabs>
          
          <div className="mt-12 text-center">
            <Button variant="outline" asChild>
              <Link href="/catalog">{t('common.all')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4">
              {t('home.latestNews')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {gallery.slice(0, 3).map((article, i) => {
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
                        <img 
                          src={article.image} 
                          alt={title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
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

      {/* CTA Banner */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-8">
            {t('home.ctaBanner')}
          </h2>
          <Button size="lg" variant="secondary" asChild className="h-14 px-8 rounded-full text-primary font-bold">
            <Link href="/contact">{t('nav.contact')}</Link>
          </Button>
        </div>
      </section>

    </div>
  );
}
