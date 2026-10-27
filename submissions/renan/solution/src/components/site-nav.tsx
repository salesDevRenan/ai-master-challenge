"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

const LINKS = [
  { href: "/", label: "Hoje" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/time", label: "Time" },
  { href: "/metodologia", label: "Metodologia" },
] as const;

/*
 * O caminho atual só existe em tempo de requisição. O shell estático mostra os
 * links sem destaque, e o destaque da página atual chega com o Suspense.
 */
export function SiteNav() {
  return (
    <Suspense fallback={<NavLinks />}>
      <CurrentNav />
    </Suspense>
  );
}

function CurrentNav() {
  return <NavLinks pathname={usePathname()} />;
}

function NavLinks({ pathname }: { pathname?: string }) {
  return (
    <nav aria-label="Principal">
      <ul className="flex flex-wrap gap-x-6">
        {LINKS.map(({ href, label }) => {
          const current =
            pathname !== undefined && (href === "/" ? pathname === "/" || pathname.startsWith("/deal") : pathname.startsWith(href));
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={`field inline-flex min-h-11 items-center hover:text-primary ${current ? "text-primary" : ""}`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
