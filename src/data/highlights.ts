export interface Highlight {
  id: string;
  title: string;
  tournament: string;
  year: number;
  teams: string;
  thumbnail: string;
  youtubeId: string;
  source: string;
}

export const highlights: Highlight[] = [
  {
    id: "1",
    title: "Argentina vs France - World Cup Final 2022",
    tournament: "World Cup",
    year: 2022,
    teams: "Argentina vs France",
    thumbnail: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=600&auto=format&fit=crop",
    youtubeId: "mUY5v_Yw8dE",
    source: "FIFA"
  },
  {
    id: "2",
    title: "Italy vs England - Final Thriller",
    tournament: "EURO",
    year: 2020,
    teams: "Italy vs England",
    thumbnail: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop",
    youtubeId: "8O6xN1uS2uM",
    source: "UEFA"
  },
  {
    id: "3",
    title: "Spain vs Croatia - Tactical Masterclass",
    tournament: "Nations League",
    year: 2023,
    teams: "Spain vs Croatia",
    thumbnail: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=600&auto=format&fit=crop",
    youtubeId: "XUoQzD_bTxs",
    source: "UEFA"
  },
  {
    id: "4",
    title: "Brazil vs Germany - Semi-Final 2014",
    tournament: "World Cup",
    year: 2014,
    teams: "Brazil vs Germany",
    thumbnail: "https://images.unsplash.com/photo-1489945052260-4f21c52268b9?q=80&w=600&auto=format&fit=crop",
    youtubeId: "5F2g_A4fU6g",
    source: "FIFA"
  },
  {
    id: "5",
    title: "France vs Croatia - World Cup Final 2018",
    tournament: "World Cup",
    year: 2018,
    teams: "France vs Croatia",
    thumbnail: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=600&auto=format&fit=crop",
    youtubeId: "ND2u942jF_A",
    source: "FIFA"
  }
];
