import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Product } from '@/data/catalog';
import { useStore } from '@/lib/StoreContext';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { MessageCircle } from 'lucide-react';

export function ProductCard({ product }: { product: Product }) {
  const { language, t } = useLanguage();
  const { settings } = useStore();

  const name = language === 'ar' ? product.nameAR : product.nameFR;
  const message = encodeURIComponent(
    `Bonjour Kindo, je souhaite commander: ${product.nameFR} (Réf: ${product.id})`
  );
  const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${message}`;

  return (
    <Card className="overflow-hidden flex flex-col h-full hover-elevate transition-all duration-300 group border-card-border bg-card">
      <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-muted/30">
        <img
          src={product.images[0]}
          alt={name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-2 rtl:left-2 ltr:right-2 flex flex-col gap-1">
          <Badge variant="secondary" className="backdrop-blur-md bg-background/80 font-medium">
            {t(`nav.${product.category}`)}
          </Badge>
          <Badge variant="outline" className="backdrop-blur-md bg-background/80 font-medium">
            {t(`nav.${product.type}`)}
          </Badge>
          {product.foodCategory && (
            <Badge variant="outline" className="backdrop-blur-md bg-background/80 font-medium">
              {product.foodCategory}
            </Badge>
          )}
          {product.accessoryCategory && (
            <Badge variant="outline" className="backdrop-blur-md bg-background/80 font-medium">
              {product.accessoryCategory}
            </Badge>
          )}
        </div>
        {product.featured && (
          <div className="absolute top-2 ltr:left-2 rtl:right-2">
            <Badge className="bg-primary text-primary-foreground text-xs">★</Badge>
          </div>
        )}
      </Link>

      <CardContent className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <Link href={`/product/${product.id}`} className="block mt-2">
            <h3 className="font-bold text-lg leading-tight line-clamp-2 hover:text-primary transition-colors">{name}</h3>
          </Link>
        </div>
        <div className="mt-4 font-bold text-xl text-primary flex items-center gap-1">
          {product.price.toLocaleString('fr-DZ')} <span className="text-sm font-normal">{t('common.currency')}</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          asChild
          className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white flex items-center justify-center gap-2 group/btn"
        >
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            <span className="font-medium">{t('common.orderViaWhatsapp')}</span>
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
