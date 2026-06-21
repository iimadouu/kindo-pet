import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useStore } from '@/lib/StoreContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Mail, MessageCircle, Facebook, Instagram } from 'lucide-react';

export default function Contact() {
  const { language, t } = useLanguage();
  const { settings } = useStore();

  const whatsappUrl = `https://wa.me/${settings.whatsappNumber}`;

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">{t('contact.title')}</h1>
          <p className="text-muted-foreground text-lg">
            {language === 'ar' ? 'نحن هنا من أجلك ومن أجل رفاقك.' : 'Nous sommes là pour vous et vos compagnons.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="bg-primary text-primary-foreground border-transparent">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 font-serif">
                  {language === 'ar' ? 'التواصل المباشر' : 'Contact direct'}
                </h3>
                <p className="opacity-90 mb-8 text-sm leading-relaxed">
                  {language === 'ar'
                    ? 'أسرع طريقة للتواصل معنا للطلب أو الاستشارة.'
                    : 'Le moyen le plus rapide de nous joindre pour une commande ou un conseil.'}
                </p>
                <Button size="lg" variant="secondary" className="w-full h-14 text-primary font-bold text-base" asChild>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                    <MessageCircle className="w-6 h-6" />
                    {t('common.orderViaWhatsapp')}
                  </a>
                </Button>

                {/* Social links */}
                <div className="flex gap-3 mt-6">
                  {settings.facebookUrl && (
                    <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm opacity-80 hover:opacity-100 transition-opacity bg-white/20 rounded-lg px-3 py-2">
                      <Facebook className="w-4 h-4" /> Facebook
                    </a>
                  )}
                  {settings.instagramUrl && (
                    <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm opacity-80 hover:opacity-100 transition-opacity bg-white/20 rounded-lg px-3 py-2">
                      <Instagram className="w-4 h-4" /> Instagram
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-5 px-2">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-primary shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-sm">
                    {language === 'ar' ? 'العنوان' : 'Adresse'}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {language === 'ar' ? settings.addressAR : settings.addressFR}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-primary shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-sm">
                    {language === 'ar' ? 'الهاتف' : 'Téléphone'}
                  </h4>
                  <p className="text-muted-foreground text-sm" dir="ltr">{settings.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-primary shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-sm">Email</h4>
                  <a href={`mailto:${settings.email}`} className="text-muted-foreground text-sm hover:text-primary transition-colors">
                    {settings.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6 font-serif">{t('contact.formTitle')}</h3>
              <form
                className="space-y-5"
                onSubmit={e => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                  const msg = (form.elements.namedItem('message') as HTMLTextAreaElement).value;
                  const text = encodeURIComponent(`Bonjour Kindo,\n\nNom: ${name}\n\nMessage: ${msg}`);
                  window.open(`${whatsappUrl}?text=${text}`, '_blank');
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="name">{t('contact.namePlaceholder')}</Label>
                  <Input id="name" name="name" required className="bg-muted/50" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">{t('contact.emailPlaceholder')}</Label>
                  <Input id="email" name="email" type="email" className="bg-muted/50" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">{t('contact.messagePlaceholder')}</Label>
                  <Textarea id="message" name="message" required rows={5} className="bg-muted/50 resize-none" />
                </div>
                <Button type="submit" className="w-full h-12 text-base font-medium gap-2">
                  <MessageCircle className="w-4 h-4" />
                  {t('contact.send')} via WhatsApp
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  {language === 'ar'
                    ? 'سيُرسل نموذجك مباشرة عبر WhatsApp'
                    : 'Votre message sera envoyé directement via WhatsApp'}
                </p>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
