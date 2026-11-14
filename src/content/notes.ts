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
    slug: "ai-agenter-i-utviklingen",
    title: "Slik bruker vi AI-agenter i utviklingen",
    date: "2026-11",
    body: "I Outlet Group bruker alle utviklerne Claude Code i det daglige arbeidet. Enkle issues tildeler vi en agent, som oppretter en PR automatisk. Neste steg er sikkerhetsgjennomganger og oppdatering av avhengigheter.",
  },
  {
    slug: "en-teknologileder-bor-bygge",
    title: "En teknologileder bør fortsatt bygge",
    date: "2026-11",
    body: "Mener en teknologileder bør bygge noe selv jevnlig. Det er vanskelig å vurdere et arkitekturvalg eller et AI-verktøy du aldri har brukt selv.",
  },
];
