import type { Metadata } from "next";
import "@fontsource-variable/space-grotesk/wght.css";
import "@fontsource-variable/martian-mono/standard.css";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { THEME_BOOTSTRAP, ThemeToggle } from "@/components/theme-toggle";
import { dateBr } from "@/lib/format";
import { dataset } from "@/lib/pipeline";

export const metadata: Metadata = {
  title: { default: "Régua — onde focar hoje", template: "%s · Régua" },
  description: "Priorização de deals para vendedores B2B, com score explicável e fila de deals parados.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body className="min-h-screen">
        <a href="#conteudo" className="field sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-ground focus:p-2">
          Pular para o conteúdo
        </a>
        <header className="mx-auto flex max-w-[1400px] flex-wrap items-baseline justify-between gap-x-8 gap-y-1 px-[5vw] pt-6">
          <p className="field">
            <span className="text-primary">Régua</span> · Segunda-feira · Pipeline em {dateBr(dataset.referenceDate)}
          </p>
          <div className="flex flex-wrap items-baseline gap-x-8">
            <SiteNav />
            <ThemeToggle />
          </div>
        </header>
        <main id="conteudo" className="mx-auto max-w-[1400px] px-[5vw] pt-[6vh] pb-[10vh]">
          {children}
        </main>
      </body>
    </html>
  );
}
