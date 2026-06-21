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

// Empty gallery - all articles should be added via admin panel
export const gallery: Article[] = [];
