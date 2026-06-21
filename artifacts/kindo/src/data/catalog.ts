export interface Product {
  id: string;
  nameFR: string;
  nameAR: string;
  descriptionFR: string;
  descriptionAR: string;
  category: 'dogs' | 'cats' | 'birds' | 'fish';
  type: 'food' | 'accessory';
  price: number;
  images: string[];  // First image is the main one
  specs: Record<string, string>;
  featured: boolean;
  keywords?: string;  // Optional keywords for search
  inStock?: boolean;  // Optional stock status
}

export const catalog: Product[] = [
  // Dogs
  {
    id: "d1",
    nameFR: "Royal Canin Maxi Adult",
    nameAR: "رويال كانين ماكسي للبالغين",
    descriptionFR: "Aliment complet pour chiens adultes de grande race (de 26 à 44 kg). De 15 mois à 5 ans.",
    descriptionAR: "غذاء كامل للكلاب البالغة من السلالات الكبيرة (من 26 إلى 44 كجم). من 15 شهرًا إلى 5 سنوات.",
    category: "dogs",
    type: "food",
    price: 12500,
    images: ["https://picsum.photos/seed/d1/600/600", "https://picsum.photos/seed/d1-2/600/600"],
    specs: { "Poids / الوزن": "15 kg", "Protéines / بروتين": "26%" },
    featured: true,
    keywords: "royal canin, dog food, large breed",
    inStock: true
  },
  {
    id: "d2",
    nameFR: "Laisse en Cuir Premium",
    nameAR: "مقود جلدي فاخر",
    descriptionFR: "Laisse en cuir véritable tressé pour une élégance et une durabilité maximales.",
    descriptionAR: "مقود مصنوع من الجلد الطبيعي المجدول لأقصى قدر من الأناقة والمتانة.",
    category: "dogs",
    type: "accessory",
    price: 4500,
    images: ["https://picsum.photos/seed/d2/600/600"],
    specs: { "Matière / المادة": "Cuir véritable / جلد طبيعي", "Longueur / الطول": "1.2m" },
    featured: false,
    keywords: "leash, leather, dog accessory",
    inStock: true
  },
  {
    id: "d3",
    nameFR: "Pro Plan OptiDigest",
    nameAR: "برو بلان أوبتي دايجست",
    descriptionFR: "Formule spéciale pour chiens à digestion sensible.",
    descriptionAR: "تركيبة خاصة للكلاب ذات الهضم الحساس.",
    category: "dogs",
    type: "food",
    price: 9800,
    images: ["https://picsum.photos/seed/d3/600/600"],
    specs: { "Poids / الوزن": "14 kg" },
    featured: true,
    keywords: "pro plan, sensitive, dog food",
    inStock: true
  },
  {
    id: "d4",
    nameFR: "Lit Orthopédique",
    nameAR: "سرير تقويم العظام",
    descriptionFR: "Lit en mousse à mémoire de forme pour un confort optimal.",
    descriptionAR: "سرير مصنوع من رغوة الذاكرة لتوفير راحة مثالية.",
    category: "dogs",
    type: "accessory",
    price: 15000,
    images: ["https://picsum.photos/seed/d4/600/600"],
    specs: { "Dimensions / الأبعاد": "100x70 cm" },
    featured: true,
    keywords: "bed, orthopedic, dog accessory",
    inStock: true
  },
  // Cats
  {
    id: "c1",
    nameFR: "Arbre à Chat Design",
    nameAR: "شجرة قطط بتصميم عصري",
    descriptionFR: "Arbre à chat minimaliste en bois naturel avec coussins lavables.",
    descriptionAR: "شجرة قطط بسيطة من الخشب الطبيعي مع وسائد قابلة للغسل.",
    category: "cats",
    type: "accessory",
    price: 24000,
    images: ["https://picsum.photos/seed/c1/600/600"],
    specs: { "Hauteur / الارتفاع": "140 cm" },
    featured: true,
    keywords: "cat tree, design, accessory",
    inStock: true
  },
  {
    id: "c2",
    nameFR: "Croquettes Orijen Sterilised",
    nameAR: "طعام أوريجن للقطط المعقمة",
    descriptionFR: "Alimentation riche en viandes fraîches pour chats stérilisés.",
    descriptionAR: "غذاء غني باللحوم الطازجة للقطط المعقمة.",
    category: "cats",
    type: "food",
    price: 8900,
    images: ["https://picsum.photos/seed/c2/600/600"],
    specs: { "Poids / الوزن": "5.4 kg", "Viande / اللحوم": "85%" },
    featured: true,
    keywords: "orijen, cat food, sterilised",
    inStock: true
  },
  // Birds
  {
    id: "b1",
    nameFR: "Cage Volière Premium",
    nameAR: "قفص طيور فاخر",
    descriptionFR: "Grande volière avec toit ouvrant et accessoires inclus.",
    descriptionAR: "قفص كبير مع سقف قابل للفتح وملحقات مضمنة.",
    category: "birds",
    type: "accessory",
    price: 18500,
    images: ["https://picsum.photos/seed/b1/600/600"],
    specs: { "Dimensions / الأبعاد": "160x80x50 cm" },
    featured: true,
    keywords: "cage, aviary, bird accessory",
    inStock: true
  },
  {
    id: "b2",
    nameFR: "Mélange Graines Perroquet",
    nameAR: "خليط بذور للببغاء",
    descriptionFR: "Mélange équilibré de graines, fruits et noix.",
    descriptionAR: "مزيج متوازن من البذور والفواكه والمكسرات.",
    category: "birds",
    type: "food",
    price: 3200,
    images: ["https://picsum.photos/seed/b2/600/600"],
    specs: { "Poids / الوزن": "2.5 kg" },
    featured: false,
    keywords: "seeds, parrot, bird food",
    inStock: true
  },
  // Fish
  {
    id: "f1",
    nameFR: "Aquarium Nano Cube",
    nameAR: "حوض أسماك نانو مكعب",
    descriptionFR: "Aquarium complet avec éclairage LED et filtration.",
    descriptionAR: "حوض أسماك كامل مع إضاءة LED ونظام فلترة.",
    category: "fish",
    type: "accessory",
    price: 28000,
    images: ["https://picsum.photos/seed/f1/600/600"],
    specs: { "Volume / الحجم": "30 L" },
    featured: true,
    keywords: "aquarium, nano, fish accessory",
    inStock: true
  },
  {
    id: "f2",
    nameFR: "TetraMin Flakes",
    nameAR: "رقائق تيترا مين",
    descriptionFR: "Flocons nutritionnels pour tous poissons d'ornement.",
    descriptionAR: "رقائق مغذية لجميع أسماك الزينة.",
    category: "fish",
    type: "food",
    price: 1500,
    images: ["https://picsum.photos/seed/f2/600/600"],
    specs: { "Poids / الوزن": "500 ml" },
    featured: false,
    keywords: "tetra, flakes, fish food",
    inStock: true
  }
];

// Replicate to have 40 items
const additionalItems: Product[] = [];
for (let i = 3; i <= 10; i++) {
  additionalItems.push({
    id: `d${i+2}`,
    nameFR: `Produit Chien ${i}`,
    nameAR: `منتج كلب ${i}`,
    descriptionFR: "Description générique pour ce produit premium.",
    descriptionAR: "وصف عام لهذا المنتج المتميز.",
    category: 'dogs',
    type: i % 2 === 0 ? 'food' : 'accessory',
    price: 2000 + i * 500,
    images: [`https://picsum.photos/seed/d${i+2}/600/600`],
    specs: { "Info": "Detail" },
    featured: i === 3,
    keywords: "dog, product",
    inStock: true
  });
  additionalItems.push({
    id: `c${i+2}`,
    nameFR: `Produit Chat ${i}`,
    nameAR: `منتج قط ${i}`,
    descriptionFR: "Description générique pour ce produit premium.",
    descriptionAR: "وصف عام لهذا المنتج المتميز.",
    category: 'cats',
    type: i % 2 === 0 ? 'food' : 'accessory',
    price: 1500 + i * 400,
    images: [`https://picsum.photos/seed/c${i+2}/600/600`],
    specs: { "Info": "Detail" },
    featured: i === 4,
    keywords: "cat, product",
    inStock: true
  });
  additionalItems.push({
    id: `b${i+2}`,
    nameFR: `Produit Oiseau ${i}`,
    nameAR: `منتج طائر ${i}`,
    descriptionFR: "Description générique pour ce produit premium.",
    descriptionAR: "وصف عام لهذا المنتج المتميز.",
    category: 'birds',
    type: i % 2 === 0 ? 'food' : 'accessory',
    price: 1000 + i * 300,
    images: [`https://picsum.photos/seed/b${i+2}/600/600`],
    specs: { "Info": "Detail" },
    featured: false,
    keywords: "bird, product",
    inStock: true
  });
  additionalItems.push({
    id: `f${i+2}`,
    nameFR: `Produit Poisson ${i}`,
    nameAR: `منتج سمك ${i}`,
    descriptionFR: "Description générique pour ce produit premium.",
    descriptionAR: "وصف عام لهذا المنتج المتميز.",
    category: 'fish',
    type: i % 2 === 0 ? 'food' : 'accessory',
    price: 800 + i * 200,
    images: [`https://picsum.photos/seed/f${i+2}/600/600`],
    specs: { "Info": "Detail" },
    featured: false,
    keywords: "fish, product",
    inStock: true
  });
}

export const fullCatalog = [...catalog, ...additionalItems];
