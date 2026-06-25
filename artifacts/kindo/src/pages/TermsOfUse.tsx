import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

export default function TermsOfUse() {
  const { language } = useLanguage();

  const content = {
    fr: {
      title: 'Conditions générales d\'utilisation',
      lastUpdated: 'Dernière mise à jour : Juin 2025',
      sections: [
        {
          heading: '1. Objet',
          text: 'Les présentes conditions générales régissent l\'utilisation du site KINDO et la vente de produits pour animaux de compagnie. En utilisant ce site, vous acceptez ces conditions dans leur intégralité.'
        },
        {
          heading: '2. Produits',
          text: 'Nous nous efforçons de fournir des descriptions et images précises de nos produits. Cependant, nous ne pouvons garantir que les couleurs et caractéristiques affichées correspondent exactement au produit reçu.'
        },
        {
          heading: '3. Commandes et paiement',
          text: 'Les commandes sont confirmées par WhatsApp ou via notre formulaire de contact. Le paiement s\'effectue à la livraison en espèces. Nous nous réservons le droit d\'annuler toute commande en cas de stock insuffisant.'
        },
        {
          heading: '4. Livraison',
          text: 'Nous livrons sur l\'ensemble du territoire algérien. Les délais de livraison sont donnés à titre indicatif et peuvent varier selon la localité. La livraison est gratuite à partir de 5 000 DA sur Alger et environs.'
        },
        {
          heading: '5. Retours et échanges',
          text: 'Les retours sont acceptés dans un délai de 7 jours après réception, sous réserve que les produits soient dans leur emballage d\'origine et non utilisés. Les frais de retour sont à la charge du client sauf erreur de notre part.'
        },
        {
          heading: '6. Limitation de responsabilité',
          text: 'KINDO ne pourra être tenu responsable des dommages indirects résultant de l\'utilisation de nos produits. Notre responsabilité est limitée au montant de la commande concernée.'
        },
        {
          heading: '7. Droit applicable',
          text: 'Les présentes conditions sont régies par le droit algérien. En cas de litige, les tribunaux d\'Alger seront seuls compétents.'
        }
      ]
    },
    ar: {
      title: 'الشروط العامة للاستخدام',
      lastUpdated: 'آخر تحديث: يونيو 2025',
      sections: [
        {
          heading: '1. الغرض',
          text: 'تحكم هذه الشروط العامة استخدام موقع كيندو وبيع منتجات الحيوانات الأليفة. باستخدامك لهذا الموقع، فإنك توافق على هذه الشروط بكاملها.'
        },
        {
          heading: '2. المنتجات',
          text: 'نسعى جاهدين لتقديم أوصاف وصور دقيقة لمنتجاتنا. ومع ذلك، لا يمكننا ضمان أن الألوان والمواصفات المعروضة تتطابق تمامًا مع المنتج المستلم.'
        },
        {
          heading: '3. الطلبات والدفع',
          text: 'يتم تأكيد الطلبات عبر واتساب أو عبر نموذج الاتصال. يتم الدفع عند الاستلام نقدًا. نحتفظ بالحق في إلغاء أي طلب في حالة نقص المخزون.'
        },
        {
          heading: '4. التوصيل',
          text: 'نقوم بالتوصيل في جميع أنحاء التراب الجزائري. يتم تحديد آجال التوصيل بشكل استرشادي ويمكن أن تختلف حسب الولاية. التوصيل مجاني ابتداءً من 5000 دج في الجزائر العاصمة وضواحيها.'
        },
        {
          heading: '5. الإرجاع والاستبدال',
          text: 'يتم قبول الإرجاع في غضون 7 أيام من الاستلام، بشرط أن تكون المنتجات في عبوة الأصلية وغير مستخدمة. يتحمل العميل مصاريف الإرجاع ما لم يكن الخطأ منا.'
        },
        {
          heading: '6. تحديد المسؤولية',
          text: 'لا يمكن تحميل كيندو مسؤولية الأضرار غير المباشرة الناتجة عن استخدام منتجاتنا. تقتصر مسؤوليتنا على مبلغ الطلب المعني.'
        },
        {
          heading: '7. القانون الواجب التطبيق',
          text: 'تخضع هذه الشروط للقانون الجزائري. في حالة النزاع، تكون محاكم الجزائر وحدها المختصة.'
        }
      ]
    }
  };

  const data = content[language];

  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">{data.title}</h1>
        <p className="text-muted-foreground text-sm mb-12">{data.lastUpdated}</p>

        <div className="space-y-10">
          {data.sections.map((section, idx) => (
            <section key={idx}>
              <h2 className="font-serif text-2xl font-bold mb-4">{section.heading}</h2>
              <p className="text-muted-foreground leading-relaxed">{section.text}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
