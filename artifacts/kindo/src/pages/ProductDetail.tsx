import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useLanguage } from '@/i18n/LanguageContext';
import { useStore } from '@/lib/StoreContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/shared/ProductCard';
import { MessageCircle, ArrowLeft, ArrowRight, Share2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductDetail() {
  const { id } = useParams();
  const { language, t } = useLanguage();
  const { products, settings } = useStore();
  const [activeImage, setActiveImage] = useState(0);

  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Produit introuvable</h1>
        <Button asChild><Link href="/catalog">Retour au catalogue</Link></Button>
      </div>
    );
  }

  const name = language === 'ar' ? product.nameAR : product.nameFR;
  const description = language === 'ar' ? product.descriptionAR : product.descriptionFR;
  const message = encodeURIComponent(
    `Bonjour Kindo, je souhaite commander: ${product.nameFR} (Réf: ${product.id})`
  );
  const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${message}`;

  const recommended = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const featuredProducts = products
    .filter(p => p.featured)
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product.nameFR, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Button variant="ghost" asChild className="mb-8 pl-0">
        <Link href={`/catalog/${product.category}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          {language === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          {t('common.back')}
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted/30 border border-border">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={product.images[activeImage]}
                alt={name}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            {product.featured && (
              <div className="absolute top-4 ltr:left-4 rtl:right-4">
                <Badge className="bg-primary text-primary-foreground">
                  {language === 'ar' ? '⭐ مميز' : '⭐ Coup de cœur'}
                </Badge>
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${activeImage === idx ? 'border-primary' : 'border-transparent hover:border-border'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">{t(`nav.${product.category}`)}</Badge>
            <Badge variant="outline">{t(`nav.${product.type}`)}</Badge>
            {product.foodCategory && (
              <Badge variant="outline">{product.foodCategory}</Badge>
            )}
            {product.accessoryCategory && (
              <Badge variant="outline">{product.accessoryCategory}</Badge>
            )}
          </div>

          <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4 leading-tight">{name}</h1>

          <div className="text-3xl font-bold text-primary mb-8 flex items-end gap-2">
            {product.price.toLocaleString('fr-DZ')}
            <span className="text-lg font-normal mb-1">{t('common.currency')}</span>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none mb-10 text-muted-foreground leading-relaxed">
            <p>{description}</p>
          </div>

          {Object.keys(product.specs).length > 0 && (
            <div className="mb-10">
              <h3 className="font-bold text-lg mb-4">{t('product.specs')}</h3>
              <Separator className="mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                {Object.entries(product.specs).map(([key, value]) => {
                  const [keyFR, keyAR] = key.split(' / ');
                  const [valFR, valAR] = value.split(' / ');
                  const displayKey = language === 'ar' ? (keyAR || keyFR) : keyFR;
                  const displayVal = language === 'ar' ? (valAR || valFR) : (valFR || value);

                  return (
                    <div key={key} className="flex justify-between py-2.5 border-b border-border/50 text-sm">
                      <span className="text-muted-foreground">{displayKey}</span>
                      <span className="font-semibold text-foreground text-right">{displayVal}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-auto pt-8 flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white h-14 text-base font-semibold"
              asChild
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5" />
                {t('common.orderViaWhatsapp')}
              </a>
            </Button>
            <Button size="lg" variant="outline" className="h-14 w-14 shrink-0 p-0" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {recommended.length > 0 && (
        <section className="pt-16 border-t border-border">
          <h2 className="font-serif text-2xl font-bold mb-8">{t('product.recommended')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {recommended.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section className="pt-16 border-t border-border">
          <h2 className="font-serif text-2xl font-bold mb-8">
            {language === 'ar' ? '⭐ منتجات مميزة' : '⭐ Produits vedette'}
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {featuredProducts.map(p => (
              <div key={p.id} className="shrink-0 w-48 md:w-56 snap-start">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
