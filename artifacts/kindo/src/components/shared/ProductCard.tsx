import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Product } from '@/data/catalog';
import { useStore } from '@/lib/StoreContext';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export function ProductCard({ product }: { product: Product }) {
  const { language, t } = useLanguage();
  const { cartItems, addToCart, removeCartItem } = useStore();

  const cartItem = cartItems.find(item => item.productId === product.id);
  const [quantity, setQuantity] = useState(cartItem?.quantity ?? 1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setQuantity(cartItem?.quantity ?? 1);
  }, [cartItem?.quantity]);

  const name = language === 'ar' ? product.nameAR : product.nameFR;
  const lineTotal = product.price * quantity;
  const actionLabel = cartItem ? t('common.updateCart') : t('common.addToCart');

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

      <CardFooter className="flex flex-col gap-3 p-4 pt-0">
        <div className="flex flex-col gap-2 w-full">
          <div className="text-sm font-medium text-foreground/80">{t('common.quantity')}</div>
          <div className="flex items-center justify-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
            >
              -
            </Button>
            <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setQuantity(prev => prev + 1)}
            >
              +
            </Button>
          </div>

          <Button
            className={`w-full ${isAdding ? 'scale-95' : ''}`}
            onClick={() => {
              addToCart(product, quantity);
              setIsAdding(true);
              window.setTimeout(() => setIsAdding(false), 180);
            }}
          >
            {actionLabel}
          </Button>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t('common.total')}</span>
          <span className="font-semibold">
            {lineTotal.toLocaleString('fr-DZ')} {t('common.currency')}
          </span>
        </div>
        {cartItem && (
          <Button variant="outline" className="w-full" onClick={() => removeCartItem(product.id)}>
            {t('common.remove')}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
