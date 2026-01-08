import createProxy from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createProxy(routing);

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
