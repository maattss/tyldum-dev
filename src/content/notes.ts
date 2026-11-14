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
    slug: "ai-skriver-testene-bestemmer",
    title: "AI skriver koden, testene bestemmer",
    date: "2026-11",
    body: "Denne siden er i stor grad skrevet av AI-agenter. Jeg bestemmer hva som skal bygges og leser gjennom endringene, mens visuelle regresjonstester, ytelsesbudsjett og typesjekk stopper det som ikke holder mål. Mener det samme gjelder i et team: verdien ligger mindre i hvor fort koden blir skrevet, og mer i hvor raskt du oppdager at den er feil.",
  },
  {
    slug: "en-teknologileder-bor-bygge",
    title: "En teknologileder bør fortsatt bygge",
    date: "2026-11",
    body: "Har gått fra utvikler til team lead til CTO på sju år. Mener en teknologileder bør bygge noe selv jevnlig. Ikke for å levere funksjoner, men for å kjenne verktøyene og friksjonen teamet lever med. Det er vanskelig å vurdere et arkitekturvalg eller et AI-verktøy du aldri har brukt selv.",
  },
];
