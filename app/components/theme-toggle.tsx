"use client";

import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      aria-label="Toggle theme"
      className="rounded-full border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-1.5 text-xs font-medium text-[color:var(--muted)] shadow-[0_6px_20px_rgba(0,0,0,0.12)]"
      onClick={toggle}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
