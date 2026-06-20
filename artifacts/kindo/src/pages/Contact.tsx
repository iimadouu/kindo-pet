import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';

export default function Contact() {
  const { language, t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="max-w-5xl mx-auto">
        
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">{t('contact.title')}</h1>
          <p className="text-muted-foreground text-lg">Nous sommes là pour vous et vos compagnons.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Contact Info */}
          <div className="space-y-8">
            <Card className="bg-primary text-primary-foreground border-transparent">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6 font-serif">Contact direct</h3>
                <p className="opacity-90 mb-8">Le moyen le plus rapide de nous joindre pour une commande ou un conseil.</p>
                
                <Button size="lg" variant="secondary" className="w-full h-14 text-primary font-bold text-lg" asChild>
                  <a href="https://wa.me/213555000000" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                    <MessageCircle className="w-6 h-6" />
                    {t('common.orderViaWhatsapp')}
                  </a>
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-6 px-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-primary shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Adresse</h4>
                  <p className="text-muted-foreground">{t('contact.address')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-primary shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Téléphone</h4>
                  <p className="text-muted-foreground" dir="ltr">{t('contact.phone')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-primary shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Email</h4>
                  <p className="text-muted-foreground">contact@kindo.dz</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6 font-serif">{t('contact.formTitle')}</h3>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <Label htmlFor="name">{t('contact.namePlaceholder')}</Label>
                  <Input id="name" className="bg-muted/50" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">{t('contact.emailPlaceholder')}</Label>
                  <Input id="email" type="email" className="bg-muted/50" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">{t('contact.messagePlaceholder')}</Label>
                  <Textarea id="message" rows={5} className="bg-muted/50 resize-none" />
                </div>
                
                <Button type="submit" className="w-full h-12 text-base font-medium">
                  {t('contact.send')}
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
