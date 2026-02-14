"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  label: string;
  locale: string;
  isCvLink?: boolean;
}

function NavLink({ href, label, locale, isCvLink = false }: NavLinkProps) {
  const pathname = usePathname();
  
  const isActive = isCvLink
    ? pathname.startsWith(`/${locale}/cv`)
    : (pathname === `/${locale}` || pathname === `/${locale}/`) && !pathname.includes("/cv");

  return (
    <Link
      href={href}
      className="group relative pb-1 text-sm font-medium transition-colors duration-150"
    >
      <span className={isActive ? "text-foreground font-semibold" : "text-muted-foreground group-hover:text-foreground"}>
        {label}
      </span>
      <span className={`absolute bottom-0 left-0 h-px bg-primary transition-all duration-200 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`} />
    </Link>
  );
}

interface HeaderNavLinksProps {
  locale: string;
  homeLabel: string;
  cvLabel: string;
}

export function HeaderNavLinks({ locale, homeLabel, cvLabel }: HeaderNavLinksProps) {
  return (
    <>
      <NavLink href={`/${locale}`} label={homeLabel} locale={locale} />
      <NavLink href={`/${locale}/cv`} label={cvLabel} locale={locale} isCvLink />
    </>
  );
}
