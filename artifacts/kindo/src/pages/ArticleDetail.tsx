import React from 'react';
import { useParams, Link } from 'wouter';
import { useLanguage } from '@/i18n/LanguageContext';
import { gallery } from '@/data/gallery';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ArticleDetail() {
  const { id } = useParams();
  const { language, t } = useLanguage();

  const article = gallery.find(a => a.id === id);

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Article introuvable</h1>
        <Button asChild><Link href="/gallery">Retour à la galerie</Link></Button>
      </div>
    );
  }

  const title = language === 'ar' ? article.titleAR : article.titleFR;
  const body = language === 'ar' ? article.bodyAR : article.bodyFR;

  return (
    <article className="pb-24">
      {/* Hero Image */}
      <div className="relative h-[50vh] min-h-[400px] w-full">
        <img 
          src={article.image} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto bg-card rounded-2xl shadow-xl p-8 md:p-12 border border-border"
        >
          <Button variant="ghost" asChild className="mb-8 -ml-4">
            <Link href="/gallery" className="flex items-center gap-2 text-muted-foreground">
              {language === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              {t('nav.gallery')}
            </Link>
          </Button>

          <div className="text-sm font-medium text-primary mb-4 uppercase tracking-wider">
            {new Date(article.date).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </div>

          <h1 className="font-serif text-3xl md:text-5xl font-bold mb-8 leading-tight">
            {title}
          </h1>

          <div 
            className="prose prose-lg dark:prose-invert prose-p:text-muted-foreground prose-headings:font-serif max-w-none"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        </motion.div>
      </div>
    </article>
  );
}
