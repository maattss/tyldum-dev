/** Formats an ISO `YYYY-MM-DD` date for display, pinned to UTC so the rendered
 *  string is identical on the server and in every client timezone. */
export function formatIsoDate(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));
}
