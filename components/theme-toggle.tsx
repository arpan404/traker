"use client";

import { useTheme } from "./theme-provider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      aria-label="Toggle theme"
      className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-bold text-[var(--foreground)] shadow-sm hover:bg-[var(--muted)] transition-all active:scale-95"
      onClick={toggle}
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-3.5 w-3.5" /> Light
        </>
      ) : (
        <>
          <Moon className="h-3.5 w-3.5" /> Dark
        </>
      )}
    </button>
  );
}
