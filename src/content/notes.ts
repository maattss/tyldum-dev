export interface Note {
  slug: string;
  title: string;
  /** ISO month, shown as written. */
  date: string;
  body: string;
}

/** Short notes for the home page. Written in Norwegian only, so they live here
 *  rather than in the translated messages; both locales render the same text. */
export const NOTES_LANGUAGE = "no";

export const notes: Note[] = [
  {
    slug: "ai-agenter",
    title: "Slik bruker vi AI-agenter",
    date: "2026-11",
    body: "Alle utviklerne i Outlet Group bruker Claude Code. Enkle issues gir vi til en agent, som lager en PR. Agentene lager nå også PR-er for nye versjoner av avhengigheter og sikkerhetsfikser, og skanner koden for sårbarheter. Det vi før utsatte, blir nå gjort med en gang.",
  },
  {
    slug: "unge-ledere",
    title: "Unge ledere",
    date: "2026-09",
    body: "I september startet jeg i Unge ledere, Agenda Vestlandets toårige lederprogram. Jeg bruker mye tid på å holde meg oppdatert teknisk, og vil bruke like mye tid på å bli en bedre leder.",
  },
  {
    slug: "hvorfor-jeg-fortsatt-koder",
    title: "Hvorfor jeg fortsatt koder",
    date: "2026-03",
    body: "Det er vanskelig å vurdere et arkitekturvalg eller et AI-verktøy man aldri har brukt selv. Derfor bygger jeg noe på egen hånd jevnlig.",
  },
];
