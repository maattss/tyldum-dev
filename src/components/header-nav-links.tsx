"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderNavLinksProps {
  locale: string;
  homeLabel: string;
  cvLabel: string;
}

export function HeaderNavLinks({ locale, homeLabel, cvLabel }: HeaderNavLinksProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname.startsWith(path);
  };

  const isHome = isActive(`/${locale}`) && !pathname.includes("/cv");
  const isCv = isActive(`/${locale}/cv`);

  return (
    <>
      <Link
        href={`/${locale}`}
        className="group relative text-sm font-medium transition-colors duration-200"
      >
        <span className={isHome ? "gradient-text font-semibold" : "text-muted-foreground group-hover:text-foreground"}>
          {homeLabel}
        </span>
        <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-200 ${isHome ? "w-full" : "w-0 group-hover:w-full"}`} />
      </Link>
      <Link
        href={`/${locale}/cv`}
        className="group relative text-sm font-medium transition-colors duration-200"
      >
        <span className={isCv ? "gradient-text font-semibold" : "text-muted-foreground group-hover:text-foreground"}>
          {cvLabel}
        </span>
        <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-200 ${isCv ? "w-full" : "w-0 group-hover:w-full"}`} />
      </Link>
    </>
  );
}
