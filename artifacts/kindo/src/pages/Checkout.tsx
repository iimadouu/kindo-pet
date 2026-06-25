import React from 'react';
import { Link } from 'wouter';
import { useLanguage } from '@/i18n/LanguageContext';
import { useStore } from '@/lib/StoreContext';
import { Product } from '@/data/catalog';
import { CartItem } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Phone, Mail, MessageCircle, ShoppingBag } from 'lucide-react';

export default function Checkout() {
  const { language, t } = useLanguage();
  const { cartItems, products, cartTotal, setCartItemQuantity, removeCartItem, emptyCart, settings } = useStore();

  const cartProducts = cartItems
    .map(item => ({ item, product: products.find(product => product.id === item.productId) }))
    .filter((entry): entry is { item: CartItem; product: Product } => Boolean(entry.product));

  const orderLines = cartProducts.map(({ item, product }) =>
    `${item.quantity} x ${language === 'ar' ? product.nameAR : product.nameFR} (${product.id}) - ${item.quantity * item.price} ${t('common.currency')}`
  ).join('\n');

  const whatsappMessage = encodeURIComponent(
    `${language === 'ar' ? 'مرحباً كيندو، أريد طلب:' : 'Bonjour Kindo, je souhaite commander:'}\n${orderLines}\n${language === 'ar' ? 'الإجمالي:' : 'Total:'} ${cartTotal} ${t('common.currency')}`
  );

  const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3 text-2xl font-bold">
            <ShoppingBag className="h-6 w-6 text-primary" />
            {t('common.cart')}
          </div>

          {cartProducts.length === 0 ? (
            <Card className="p-6">
              <CardTitle>{t('common.emptyCartNotice')}</CardTitle>
              <CardDescription>{t('common.continueShopping')}</CardDescription>
              <div className="mt-4">
                <Link href="/catalog">
                  <Button>{t('common.continueShopping')}</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {cartProducts.map(({ item, product }) => (
                <Card key={product.id} className="border-card-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex flex-col gap-1">
                      <span>{language === 'ar' ? product.nameAR : product.nameFR}</span>
                      <span className="text-sm text-muted-foreground">{product.id}</span>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {product.price.toLocaleString('fr-DZ')} {t('common.currency')} x {item.quantity} = {(item.quantity * product.price).toLocaleString('fr-DZ')} {t('common.currency')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-[auto_1fr_auto] items-center">
                    <div className="flex items-center gap-2 rounded-full border border-border bg-muted/50 p-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setCartItemQuantity(product.id, item.quantity - 1)}>
                        -
                      </Button>
                      <span className="min-w-[2rem] text-center font-semibold">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setCartItemQuantity(product.id, item.quantity + 1)}>
                        +
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t('common.price')}: {product.price.toLocaleString('fr-DZ')} {t('common.currency')}
                    </div>
                    <Button variant="outline" onClick={() => removeCartItem(product.id)}>
                      {t('common.remove')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
              <Separator />
              <Card className="p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{t('common.total')}</span>
                    <span className="font-semibold">
                      {cartTotal.toLocaleString('fr-DZ')} {t('common.currency')}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        {t('common.orderViaWhatsapp')}
                      </Button>
                    </a>
                    <Button variant="outline" className="w-full" onClick={emptyCart}>
                      {t('common.emptyCart')}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        <aside className="w-full xl:w-96 space-y-4">
          <Card className="p-6">
            <CardTitle>{t('contact.title')}</CardTitle>
            <CardDescription>{language === 'ar' ? settings.addressAR : settings.addressFR}</CardDescription>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{settings.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{settings.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {t('common.orderViaWhatsapp')}
                </a>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
