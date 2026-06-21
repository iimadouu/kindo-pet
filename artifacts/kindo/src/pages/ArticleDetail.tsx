import React from 'react';
import { useParams, Link } from 'wouter';
import { useLanguage } from '@/i18n/LanguageContext';
import { useStore } from '@/lib/StoreContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ArticleDetail() {
  const { id } = useParams();
  const { language, t } = useLanguage();
  const { articles } = useStore();

  const article = articles.find(a => a.id === id);

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Article introuvable</h1>
        <Button asChild><Link href="/gallery">Retour à la galerie</Link></Button>
      </div>
    );
  }

  const title = language === 'ar' ? article.titleAR : article.titleFR;
  const excerpt = language === 'ar' ? article.excerptAR : article.excerptFR;
  const body = language === 'ar' ? article.bodyAR : article.bodyFR;

  return (
    <article className="pb-24">
      <div className="relative h-[55vh] min-h-[420px] w-full overflow-hidden">
        <img
          src={article.image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/70" />
        <div className="absolute bottom-0 inset-x-0 p-8 md:p-16 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-4 uppercase tracking-widest">
            <Calendar className="w-4 h-4" />
            {new Date(article.date).toLocaleDateString(
              language === 'ar' ? 'ar-DZ' : 'fr-FR',
              { year: 'numeric', month: 'long', day: 'numeric' }
            )}
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-white leading-tight">
            {title}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <Button variant="ghost" asChild className="mb-10 -ml-4">
            <Link href="/gallery" className="flex items-center gap-2 text-muted-foreground">
              {language === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              {t('nav.gallery')}
            </Link>
          </Button>

          {excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 border-l-4 border-primary ltr:pl-6 rtl:pr-6 rtl:border-l-0 rtl:border-r-4 italic">
              {excerpt}
            </p>
          )}

          <div
            className="prose prose-lg dark:prose-invert prose-p:text-muted-foreground prose-headings:font-serif prose-a:text-primary max-w-none"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        </motion.div>
      </div>
    </article>
  );
}
