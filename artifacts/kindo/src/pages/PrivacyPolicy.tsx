import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

export default function PrivacyPolicy() {
  const { language } = useLanguage();

  const content = {
    fr: {
      title: 'Politique de confidentialité',
      lastUpdated: 'Dernière mise à jour : Juin 2026',
      sections: [
        {
          heading: '1. Collecte des informations',
          text: 'Nous collectons les informations que vous nous fournissez lors de votre inscription, de votre passage de commande ou de votre contact avec notre service client. Cela peut inclure votre nom, adresse email, numéro de téléphone et adresse de livraison.'
        },
        {
          heading: '2. Utilisation des données',
          text: 'Vos données sont utilisées uniquement pour traiter vos commandes, améliorer votre expérience utilisateur et vous contacter concernant vos achats. Nous ne vendons ni ne partageons vos données personnelles avec des tiers sans votre consentement, sauf obligation légale.'
        },
        {
          heading: '3. Protection des données',
          text: 'Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données personnelles contre tout accès non autorisé, modification ou divulgation.'
        },
        {
          heading: '4. Cookies',
          text: 'Notre site utilise des cookies pour améliorer votre expérience de navigation. Vous pouvez désactiver les cookies dans les paramètres de votre navigateur, mais certaines fonctionnalités du site pourraient alors être limitées.'
        },
        {
          heading: '5. Vos droits',
          text: 'Conformément à la législation en vigueur, vous disposez d\'un droit d\'accès, de rectification et de suppression de vos données personnelles. Pour exercer ces droits, contactez-nous via notre page Contact.'
        },
        {
          heading: '6. Contact',
          text: 'Pour toute question relative à cette politique de confidentialité, vous pouvez nous contacter à l\'adresse indiquée dans la section Contact de notre site.'
        }
      ]
    },
    ar: {
      title: 'سياسة الخصوصية',
      lastUpdated: 'آخر تحديث: يونيو 2025',
      sections: [
        {
          heading: '1. جمع المعلومات',
          text: 'نقوم بجمع المعلومات التي تقدمها لنا عند تسجيلك أو إجراء طلب أو الاتصال بخدمة العملاء. قد يشمل ذلك اسمك وبريدك الإلكتروني ورقم هاتفك وعنوان التوصيل.'
        },
        {
          heading: '2. استخدام البيانات',
          text: 'تُستخدم بياناتك فقط لمعالجة طلباتك وتحسين تجربتك والتواصل معك بشأن مشترياتك. نحن لا نبيع بياناتك الشخصية ولا نشاركها مع أطراف ثالثة دون موافقتك، إلا عند الالتزام القانوني.'
        },
        {
          heading: '3. حماية البيانات',
          text: 'نقوم بتطبيق إجراءات أمنية تقنية وتنظيمية لحماية بياناتك الشخصية من أي وصول غير مصرح به أو تعديل أو إفشاء.'
        },
        {
          heading: '4. ملفات تعريف الارتباط',
          text: 'يستخدم موقعنا ملفات تعريف الارتباط (Cookies) لتحسين تجربة التصفح الخاصة بك. يمكنك تعطيلها من إعدادات متصفحك، لكن قد تصبح بعض ميزات الموقع محدودة.'
        },
        {
          heading: '5. حقوقك',
          text: 'وفقًا للقوانين المعمول بها، لديك الحق في الوصول إلى بياناتك الشخصية وتصحيحها وحذفها. لممارسة هذه الحقوق، تواصل معنا عبر صفحة الاتصال.'
        },
        {
          heading: '6. الاتصال',
          text: 'لأي سؤال يتعلق بهذه السياسة، يمكنك الاتصال بنا عبر العنوان المذكور في قسم الاتصال بموقعنا.'
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
