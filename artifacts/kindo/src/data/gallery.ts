export interface Article {
  id: string;
  titleFR: string;
  titleAR: string;
  excerptFR: string;
  excerptAR: string;
  bodyFR: string;
  bodyAR: string;
  image: string;
  date: string;
}

export const gallery: Article[] = [
  {
    id: "a1",
    titleFR: "Comment bien nourrir son chiot ?",
    titleAR: "كيف تطعم جروك بشكل صحيح؟",
    excerptFR: "Les premiers mois sont cruciaux pour la croissance de votre chien. Découvrez nos conseils nutrition.",
    excerptAR: "الأشهر الأولى حاسمة لنمو كلبك. اكتشف نصائحنا الغذائية.",
    bodyFR: "<p>Le choix de l'alimentation...</p>",
    bodyAR: "<p>اختيار التغذية...</p>",
    image: "https://picsum.photos/seed/a1/800/600",
    date: "2023-10-15T10:00:00Z"
  },
  {
    id: "a2",
    titleFR: "Nouveauté : Arbres à chat design",
    titleAR: "جديد: أشجار قطط عصرية",
    excerptFR: "Notre nouvelle collection allie esthétique et confort pour votre félin.",
    excerptAR: "مجموعتنا الجديدة تجمع بين الجمال والراحة لقطتك.",
    bodyFR: "<p>Découvrez notre gamme...</p>",
    bodyAR: "<p>اكتشف مجموعتنا...</p>",
    image: "https://picsum.photos/seed/a2/800/600",
    date: "2023-09-22T14:30:00Z"
  },
  {
    id: "a3",
    titleFR: "Préparer l'arrivée d'un oiseau",
    titleAR: "التحضير لوصول طائر",
    excerptFR: "Tout ce dont vous avez besoin pour accueillir votre nouveau compagnon à plumes.",
    excerptAR: "كل ما تحتاجه للترحيب برفيقك ذو الريش الجديد.",
    bodyFR: "<p>La cage doit être...</p>",
    bodyAR: "<p>يجب أن يكون القفص...</p>",
    image: "https://picsum.photos/seed/a3/800/600",
    date: "2023-08-05T09:15:00Z"
  },
  {
    id: "a4",
    titleFR: "Les essentiels de l'aquariophilie",
    titleAR: "أساسيات تربية الأسماك",
    excerptFR: "Guide du débutant pour un aquarium sain et équilibré.",
    excerptAR: "دليل المبتدئين لحوض أسماك صحي ومتوازن.",
    bodyFR: "<p>L'eau est la clé...</p>",
    bodyAR: "<p>الماء هو المفتاح...</p>",
    image: "https://picsum.photos/seed/a4/800/600",
    date: "2023-07-11T11:45:00Z"
  }
];
