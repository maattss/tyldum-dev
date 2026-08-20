export const SITE_URL = "https://tyldum.dev";
export const SITE_NAME = "tyldum.dev";
export const PERSON_NAME = "Mats Tyldum";

export const LINKEDIN_URL = "https://www.linkedin.com/in/mtyldum/";
export const GITHUB_URL = "https://github.com/maattss";

/** Display form used where the bare handle reads better than the full URL. */
export const LINKEDIN_HANDLE = "linkedin.com/in/mtyldum";
export const GITHUB_HANDLE = "github.com/maattss";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}
