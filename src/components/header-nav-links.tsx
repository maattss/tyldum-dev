"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
}

function NavLink({ href, label, isActive }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`group relative rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
        isActive
          ? "border border-border bg-secondary/80 text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <span className={isActive ? "font-semibold" : ""}>
        {label}
      </span>
      <span className={`absolute bottom-0 left-1/2 h-px -translate-x-1/2 bg-primary transition-all duration-200 ${isActive ? "w-8" : "w-0 group-hover:w-6"}`} />
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
      <NavLink href={localeRoot} label={homeLabel} isActive={isHomeActive} />
      <NavLink href={localeCv} label={cvLabel} isActive={isCvActive} />
    </>
  );
}
