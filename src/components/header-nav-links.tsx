"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
  wordmark?: boolean;
}

function NavLink({ href, label, isActive, wordmark = false }: NavLinkProps) {
  if (wordmark) {
    return (
      <Link
        href={href}
        aria-current={isActive ? "page" : undefined}
        className="font-serif text-[1.0625rem] font-medium tracking-tight text-foreground"
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`text-sm underline-offset-[6px] transition-colors duration-150 ${
        isActive
          ? "text-foreground underline decoration-foreground/40"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}

interface HeaderNavLinksProps {
  locale: string;
  homeLabel: string;
  cvLabel: string;
}

export function HeaderNavLinks({ locale, homeLabel, cvLabel }: HeaderNavLinksProps) {
  const pathname = usePathname();
  const normalizedPathname =
    pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  const localeRoot = `/${locale}`;
  const localeCv = `/${locale}/cv`;
  const isCvActive = normalizedPathname === localeCv || normalizedPathname.startsWith(`${localeCv}/`);
  const isHomeActive = normalizedPathname === localeRoot && !isCvActive;

  return (
    <>
      <NavLink href={localeRoot} label={homeLabel} isActive={isHomeActive} wordmark />
      <NavLink href={localeCv} label={cvLabel} isActive={isCvActive} />
    </>
  );
}
