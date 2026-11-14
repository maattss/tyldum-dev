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
    body: "I Outlet Group bruker alle utviklerne Claude Code i det daglige arbeidet. Enkle issues tildeler vi en agent, som oppretter en PR automatisk. Neste steg er å bruke agenter mer aktivt til sikkerhetsgjennomganger og forslag til oppdatering av avhengigheter. Denne siden er bygget på samme måte: agenter skriver det meste av koden, mens visuelle regresjonstester, ytelsesbudsjett og typesjekk stopper det som ikke holder mål.",
  },
  {
    slug: "en-teknologileder-bor-bygge",
    title: "En teknologileder bør fortsatt bygge",
    date: "2026-11",
    body: "Har gått fra utvikler til team lead til CTO på sju år. Mener en teknologileder bør bygge noe selv jevnlig. Ikke for å levere funksjoner, men for å kjenne verktøyene og friksjonen teamet lever med. Det er vanskelig å vurdere et arkitekturvalg eller et AI-verktøy du aldri har brukt selv. Bygger derfor egne ting ved siden av jobben, som ferjetider.fyi og en privat AI-assistent.",
  },
];
