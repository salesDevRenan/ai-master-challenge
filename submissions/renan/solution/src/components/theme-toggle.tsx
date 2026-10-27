"use client";

import { useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";

const LABEL: Record<Theme, string> = { system: "Tema: sistema", light: "Tema: claro", dark: "Tema: escuro" };
const NEXT: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" };

/** Script inline que aplica o tema salvo antes da primeira pintura. */
export const THEME_BOOTSTRAP = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const saved = document.documentElement.dataset.theme;
    // Sincroniza com o tema aplicado pelo script inline antes da hidratação.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

  function cycle() {
    const next = NEXT[theme];
    const root = document.documentElement;
    if (next === "system") delete root.dataset.theme;
    else root.dataset.theme = next;
    try {
      if (next === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  }

  return (
    <button type="button" onClick={cycle} aria-live="polite" className="field min-h-11 cursor-pointer hover:text-primary">
      {LABEL[theme]}
    </button>
  );
}
