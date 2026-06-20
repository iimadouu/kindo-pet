import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { gallery } from '@/data/gallery';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

export default function Gallery() {
  const { language, t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">{t('nav.gallery')}</h1>
        <p className="text-muted-foreground">Découvrez nos conseils, actualités et histoires de passionnés.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {gallery.map((article, i) => {
          const title = language === 'ar' ? article.titleAR : article.titleFR;
          const excerpt = language === 'ar' ? article.excerptAR : article.excerptFR;
          
          return (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/article/${article.id}`} className="group block h-full">
                <article className="relative h-96 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500">
                  <div className="absolute inset-0">
                    <img 
                      src={article.image} 
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>
                  
                  <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col justify-end text-white">
                    <div className="text-xs font-medium text-white/80 mb-3 uppercase tracking-wider">
                      {new Date(article.date).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR')}
                    </div>
                    <h2 className="text-2xl font-bold mb-2 leading-tight group-hover:text-primary transition-colors">
                      {title}
                    </h2>
                    <p className="text-white/80 text-sm line-clamp-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      {excerpt}
                    </p>
                  </div>
                </article>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
