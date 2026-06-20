export interface Partner {
  id: string;
  nameFR: string;
  nameAR: string;
  descriptionFR: string;
  descriptionAR: string;
  type: 'brand' | 'certificate' | 'award';
  icon: string;
}

export const partners: Partner[] = [
  {
    id: 'royal-canin',
    nameFR: 'Royal Canin',
    nameAR: 'رويال كانين',
    descriptionFR: 'Distributeur officiel',
    descriptionAR: 'موزع رسمي',
    type: 'brand',
    icon: 'RC',
  },
  {
    id: 'pro-plan',
    nameFR: 'Purina Pro Plan',
    nameAR: 'بيورينا برو بلان',
    descriptionFR: 'Distributeur exclusif',
    descriptionAR: 'موزع حصري',
    type: 'brand',
    icon: 'PP',
  },
  {
    id: 'iso-9001',
    nameFR: 'ISO 9001',
    nameAR: 'آيزو 9001',
    descriptionFR: 'Qualité certifiée',
    descriptionAR: 'جودة معتمدة',
    type: 'certificate',
    icon: 'ISO',
  },
  {
    id: 'vet-approved',
    nameFR: 'Vétérinaire Approuvé',
    nameAR: 'معتمد بيطرياً',
    descriptionFR: 'Recommandé par les vétérinaires',
    descriptionAR: 'موصى به من الأطباء البيطريين',
    type: 'certificate',
    icon: 'VET',
  },
  {
    id: 'naturel',
    nameFR: '100% Naturel',
    nameAR: '100% طبيعي',
    descriptionFR: 'Ingrédients naturels garantis',
    descriptionAR: 'مكونات طبيعية مضمونة',
    type: 'certificate',
    icon: 'NAT',
  },
  {
    id: 'premium-2024',
    nameFR: 'Service Premium 2024',
    nameAR: 'خدمة مميزة 2024',
    descriptionFR: 'Élu meilleur service',
    descriptionAR: 'تم اختياره أفضل خدمة',
    type: 'award',
    icon: 'PRX',
  },
  {
    id: 'eco',
    nameFR: 'Éco-Responsable',
    nameAR: 'مسؤولية بيئية',
    descriptionFR: 'Engagement environnemental',
    descriptionAR: 'التزام بيئي',
    type: 'certificate',
    icon: 'ECO',
  },
  {
    id: 'hills',
    nameFR: "Hill's Science Diet",
    nameAR: 'هيلز ساينس دايت',
    descriptionFR: 'Partenaire officiel',
    descriptionAR: 'شريك رسمي',
    type: 'brand',
    icon: 'HSD',
  },
];

export const partnerMarquee = [
  "Royal Canin",
  "Purina Pro Plan",
  "Hill's Science Diet",
  "ISO 9001 Certifié",
  "Veterinary Approved",
  "100% Naturel",
  "Service Premium 2024",
  "Éco-Responsable",
];
