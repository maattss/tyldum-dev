"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "./brand-mark";
import { SITE_NAME } from "@/lib/site";

function normalize(pathname: string): string {
  return pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
}

/** Home wordmark, rendered on the left of the header. */
export function HomeLink({ locale }: { locale: string }) {
  const pathname = normalize(usePathname());
  const href = `/${locale}`;

  return (
    <Link
      href={href}
      aria-current={pathname === href ? "page" : undefined}
      className="group flex items-center gap-2.5 rounded-md font-mono text-sm font-medium text-foreground"
    >
      <BrandMark className="h-6 w-6 shrink-0 rounded-md transition-transform duration-200 group-hover:-rotate-6" />
      <span>
        <span className="text-muted-foreground" aria-hidden="true">
          ~/
        </span>
        {SITE_NAME}
      </span>
    </Link>
  );
}

/** Page links, rendered as paths ("/cv") next to the language and theme switches. */
export function HeaderNavLinks({ locale, cvLabel }: { locale: string; cvLabel: string }) {
  const pathname = normalize(usePathname());
  const href = `/${locale}/cv`;
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`rounded-md px-2.5 py-3 transition-colors ${
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <span aria-hidden="true">/</span>
      <span className="lowercase">{cvLabel}</span>
    </Link>
  );
}
