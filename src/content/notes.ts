export interface Note {
  slug: string;
  title: string;
  /** ISO month, shown as written. */
  date: string;
  /** Paragraphs, in order. */
  body: string[];
  /** Turns the first occurrence of `text` in the body into a link. */
  link?: { text: string; href: string };
}

/** Short notes for the home page. Written in Norwegian only, so they live here
 *  rather than in the translated messages; both locales render the same text. */
export const NOTES_LANGUAGE = "no";

export const notes: Note[] = [
  {
    slug: "ai-agenter",
    title: "Slik bruker vi AI-agenter",
    date: "2026-11",
    body: ["Alle utviklerne i Outlet Group bruker Claude Code. Enkle issues gir vi til en agent, som lager en PR. Agentene lager nå også PR-er for nye versjoner av avhengigheter og sikkerhetsfikser, og skanner koden for sårbarheter. Det vi før utsatte, blir nå gjort med en gang."],
  },
  {
    slug: "unge-ledere",
    title: "Unge ledere",
    date: "2026-09",
    body: [
      "I september startet jeg i Unge ledere, Agenda Vestlandets toårige program for 35 ledere i bergensområdet. Første samling var på Herdla, med «Hvem er jeg som leder?» og teamledelse som tema. Videre venter Vestlandskonferansen, en studietur til utlandet og en samling om politikk og påvirkning i Oslo.",
      "Jeg bruker mye tid på å holde meg oppdatert teknisk. Ledelse fortjener like mye, men er lett å nedprioritere når hverdagen er full. Programmet gir meg faste stopp for å tenke over hvordan jeg leder, og et nettverk av ledere i regionen å lære av.",
    ],
    link: {
      text: "Unge ledere",
      href: "https://www.sparebankennorge.no/agendavestlandet/unge-ledere",
    },
  },
  {
    slug: "hvorfor-jeg-fortsatt-koder",
    title: "Hvorfor jeg fortsatt koder",
    date: "2026-03",
    body: [
      "Det er vanskelig å vurdere et arkitekturvalg eller et AI-verktøy man aldri har brukt selv. Derfor bygger jeg noe på egen hånd jevnlig.",
      "Prosjektene under er laget sånn. De gir meg et sted å prøve nye verktøy før vi tar dem i bruk på jobb, og jeg merker selv hva som går fort og hva som tar tid.",
      "Det gjør meg også til en bedre sparringspartner for utviklerne. Jeg vet hva jeg ber om når jeg ber om noe.",
    ],
  },
];
