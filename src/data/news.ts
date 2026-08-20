export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  image: string;
  category: string;
  source: string;
  date: string;
  sourceUrl: string;
}

export const newsArticles: NewsArticle[] = [
  {
    id: "1",
    title: "Preparations Continue for the Next Generation of International Football",
    summary: "Key infrastructure projects and tactical shifts are dominating the agenda as nations gear up for the expanded tournament format.",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop",
    category: "WORLD CUP",
    source: "FIFA",
    date: "16 Aug 2026",
    sourceUrl: "https://www.fifa.com"
  },
  {
    id: "2",
    title: "European Nations League Dynamics Shift",
    summary: "Emerging tactical trends suggest a departure from traditional possession-based models in top-tier European competition.",
    image: "https://images.unsplash.com/photo-1431324155629-1a6edd1dec8d?q=80&w=600&auto=format&fit=crop",
    category: "UEFA",
    source: "UEFA Media",
    date: "15 Aug 2026",
    sourceUrl: "https://www.uefa.com"
  },
  {
    id: "3",
    title: "South American Qualifiers: The Road to Glory",
    summary: "As the qualifying rounds intensify, traditional powerhouses face unprecedented challenges from rising continental stars.",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop",
    category: "CONMEBOL",
    source: "CONMEBOL",
    date: "14 Aug 2026",
    sourceUrl: "https://www.conmebol.com"
  },
  {
    id: "4",
    title: "CAF Africa Cup of Nations Qualifiers Heat Up",
    summary: "Intense qualifiers across the continent showcase rising talent and shocking upsets in early round matchups.",
    image: "https://images.unsplash.com/photo-1517520287932-44dfd011f7c1?q=80&w=600&auto=format&fit=crop",
    category: "CAF",
    source: "CAF Online",
    date: "12 Aug 2026",
    sourceUrl: "https://www.cafonline.com"
  },
  {
    id: "5",
    title: "Asian Cup Qualifiers: Tactical Overhauls Pay Off",
    summary: "Innovative defensive blocks and rapid transitional structures redefine the playing style of middle-tier national teams.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop",
    category: "AFC",
    source: "AFC News",
    date: "10 Aug 2026",
    sourceUrl: "https://www.the-afc.com"
  }
];
