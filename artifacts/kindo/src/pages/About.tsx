import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShieldCheck, Leaf } from 'lucide-react';

export default function About() {
  const { language, t } = useLanguage();

  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        
        {/* Story Section */}
        <section className="max-w-4xl mx-auto text-center mb-24">
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-8">{t('about.title')}</h1>
          <div className="prose prose-lg dark:prose-invert mx-auto text-muted-foreground leading-relaxed">
            {language === 'ar' ? (
              <p>
                كندو ليست مجرد علامة تجارية، بل هي التزام تجاه رفاقنا ذوي الأربع أرجل. 
                تأسست في الجزائر، وقد وُلدت من شغف حقيقي بالحيوانات ورغبة في تقديم الأفضل لهم. 
                نحن نختار بعناية فائقة كل منتج في كتالوجنا لضمان جودة استثنائية وتغذية متوازنة وراحة مثالية.
              </p>
            ) : (
              <p>
                KINDO n'est pas qu'une simple marque, c'est un engagement envers nos compagnons à quatre pattes. 
                Fondée en Algérie, elle est née d'une véritable passion pour les animaux et d'une volonté de leur offrir ce qu'il y a de meilleur. 
                Nous sélectionnons rigoureusement chaque produit de notre catalogue pour garantir une qualité exceptionnelle, une nutrition équilibrée et un confort optimal.
              </p>
            )}
          </div>
        </section>

        {/* Image Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-24">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
            <img src="https://picsum.photos/seed/about1/800/600" alt="Pet care" className="w-full h-full object-cover" />
          </div>
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted md:mt-12">
            <img src="https://picsum.photos/seed/about2/800/600" alt="Premium food" className="w-full h-full object-cover" />
          </div>
        </section>

        {/* Values */}
        <section className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">{t('about.values')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <Card className="bg-transparent border-none shadow-none text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl mb-3">Qualité Premium</h3>
                <p className="text-muted-foreground text-sm">Une sélection rigoureuse des meilleures marques mondiales.</p>
              </CardContent>
            </Card>

            <Card className="bg-transparent border-none shadow-none text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl mb-3">Bien-être animal</h3>
                <p className="text-muted-foreground text-sm">La santé et le bonheur de vos compagnons au cœur de nos priorités.</p>
              </CardContent>
            </Card>

            <Card className="bg-transparent border-none shadow-none text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                  <Leaf className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl mb-3">Expertise</h3>
                <p className="text-muted-foreground text-sm">Des conseils personnalisés pour chaque besoin spécifique.</p>
              </CardContent>
            </Card>

          </div>
        </section>

      </div>
    </div>
  );
}
