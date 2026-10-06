"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "./brand-mark";

interface HeaderNavLinksProps {
  locale: string;
  homeLabel: string;
  cvLabel: string;
}

function normalize(pathname: string): string {
  return pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
}

/** Home wordmark, rendered on the left of the header. */
export function HomeLink({ locale, homeLabel }: Pick<HeaderNavLinksProps, "locale" | "homeLabel">) {
  const pathname = normalize(usePathname());
  const href = `/${locale}`;
  const [name, tld] = homeLabel.split(".");

  return (
    <Link
      href={href}
      aria-current={pathname === href ? "page" : undefined}
      className="group flex items-center gap-2.5 rounded-md text-[15px] font-semibold tracking-tight text-foreground"
    >
      <BrandMark className="h-7 w-7 shrink-0 rounded-[7px] ring-1 ring-border transition-transform duration-200 group-hover:-rotate-6" />
      <span>
        {name}
        {tld && <span className="text-muted-foreground transition-colors group-hover:text-primary">.{tld}</span>}
      </span>
    </Link>
  );
}

/** Section links, rendered on the right of the header next to the toggles. */
export function HeaderNavLinks({ locale, cvLabel }: Pick<HeaderNavLinksProps, "locale" | "cvLabel">) {
  const pathname = normalize(usePathname());
  const href = `/${locale}/cv`;
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {cvLabel}
      <span
        className={`absolute inset-x-3 -bottom-px h-px bg-primary transition-opacity duration-200 ${isActive ? "opacity-100" : "opacity-0"}`}
      />
    </Link>
  );
}
