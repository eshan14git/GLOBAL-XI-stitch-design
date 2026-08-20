export interface Team {
  name: string;
  code: string;
  flag: string;
}

export interface Group {
  name: string;
  teams: Team[];
}

export interface Tournament {
  id: string;
  name: string;
  tagline: string;
  status: "available" | "coming_soon";
  groups: Group[];
  knockoutStages: string[];
}

export const tournaments: Tournament[] = [
  {
    id: "euro-2024",
    name: "UEFA EURO 2024",
    tagline: "Germany 2024 - European Championship Simulation",
    status: "available",
    knockoutStages: ["Round of 16", "Quarter-Finals", "Semi-Finals", "Final"],
    groups: [
      {
        name: "Group A",
        teams: [
          { name: "Germany", code: "GER", flag: "🇩🇪" },
          { name: "Scotland", code: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
          { name: "Hungary", code: "HUN", flag: "🇭🇺" },
          { name: "Switzerland", code: "SUI", flag: "🇨🇭" }
        ]
      },
      {
        name: "Group B",
        teams: [
          { name: "Spain", code: "ESP", flag: "🇪🇸" },
          { name: "Croatia", code: "CRO", flag: "🇭🇷" },
          { name: "Italy", code: "ITA", flag: "🇮🇹" },
          { name: "Albania", code: "ALB", flag: "🇦🇱" }
        ]
      },
      {
        name: "Group C",
        teams: [
          { name: "Slovenia", code: "SVN", flag: "🇸🇮" },
          { name: "Denmark", code: "DEN", flag: "🇩🇰" },
          { name: "Serbia", code: "SRB", flag: "🇷🇸" },
          { name: "England", code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" }
        ]
      },
      {
        name: "Group D",
        teams: [
          { name: "Poland", code: "POL", flag: "🇵🇱" },
          { name: "Netherlands", code: "NED", flag: "🇳🇱" },
          { name: "Austria", code: "AUT", flag: "🇦🇹" },
          { name: "France", code: "FRA", flag: "🇫🇷" }
        ]
      },
      {
        name: "Group E",
        teams: [
          { name: "Belgium", code: "BEL", flag: "🇧🇪" },
          { name: "Slovakia", code: "SVK", flag: "🇸🇰" },
          { name: "Romania", code: "ROU", flag: "🇷🇴" },
          { name: "Ukraine", code: "UKR", flag: "🇺🇦" }
        ]
      },
      {
        name: "Group F",
        teams: [
          { name: "Turkey", code: "TUR", flag: "🇹🇷" },
          { name: "Georgia", code: "GEO", flag: "🇬🇪" },
          { name: "Portugal", code: "POR", flag: "🇵🇹" },
          { name: "Czechia", code: "CZE", flag: "🇨🇿" }
        ]
      }
    ]
  },
  {
    id: "world-cup-2026",
    name: "FIFA World Cup 2026",
    tagline: "North America 2026 - Simulation Bracket",
    status: "available",
    knockoutStages: ["Round of 16", "Quarter-Finals", "Semi-Finals", "Final"],
    groups: [
      {
        name: "Group A",
        teams: [
          { name: "United States", code: "USA", flag: "🇺🇸" },
          { name: "Mexico", code: "MEX", flag: "🇲🇽" },
          { name: "Canada", code: "CAN", flag: "🇨🇦" },
          { name: "Costa Rica", code: "CRC", flag: "🇨🇷" }
        ]
      },
      {
        name: "Group B",
        teams: [
          { name: "Argentina", code: "ARG", flag: "🇦🇷" },
          { name: "Chile", code: "CHI", flag: "🇨🇱" },
          { name: "Peru", code: "PER", flag: "🇵🇪" },
          { name: "Venezuela", code: "VEN", flag: "🇻🇪" }
        ]
      },
      {
        name: "Group C",
        teams: [
          { name: "Brazil", code: "BRA", flag: "🇧🇷" },
          { name: "Colombia", code: "COL", flag: "🇨🇴" },
          { name: "Paraguay", code: "PAR", flag: "🇵🇾" },
          { name: "Ecuador", code: "ECU", flag: "🇪🇨" }
        ]
      },
      {
        name: "Group D",
        teams: [
          { name: "France", code: "FRA", flag: "🇫🇷" },
          { name: "Denmark", code: "DEN", flag: "🇩🇰" },
          { name: "Australia", code: "AUS", flag: "🇦🇺" },
          { name: "Tunisia", code: "TUN", flag: "🇹🇳" }
        ]
      },
      {
        name: "Group E",
        teams: [
          { name: "England", code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
          { name: "Senegal", code: "SEN", flag: "🇸🇳" },
          { name: "Japan", code: "JPN", flag: "🇯🇵" },
          { name: "Morocco", code: "MAR", flag: "🇲🇦" }
        ]
      },
      {
        name: "Group F",
        teams: [
          { name: "Spain", code: "ESP", flag: "🇪🇸" },
          { name: "Germany", code: "GER", flag: "🇩🇪" },
          { name: "Croatia", code: "CRO", flag: "🇭🇷" },
          { name: "Belgium", code: "BEL", flag: "🇧🇪" }
        ]
      },
      {
        name: "Group G",
        teams: [
          { name: "Portugal", code: "POR", flag: "🇵🇹" },
          { name: "Uruguay", code: "URU", flag: "🇺🇾" },
          { name: "South Korea", code: "KOR", flag: "🇰🇷" },
          { name: "Ghana", code: "GHA", flag: "🇬🇭" }
        ]
      },
      {
        name: "Group H",
        teams: [
          { name: "Netherlands", code: "NED", flag: "🇳🇱" },
          { name: "Italy", code: "ITA", flag: "🇮🇹" },
          { name: "Switzerland", code: "SUI", flag: "🇨🇭" },
          { name: "Austria", code: "AUT", flag: "🇦🇹" }
        ]
      }
    ]
  },
  {
    id: "euro-2028",
    name: "UEFA EURO 2028",
    tagline: "United Kingdom & Ireland 2028 - Coming Soon",
    status: "coming_soon",
    groups: [],
    knockoutStages: []
  }
];
