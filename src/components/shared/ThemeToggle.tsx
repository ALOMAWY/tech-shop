"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

export function ThemeToggle() {
  const t = useTranslations("Shell");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("ts-theme");
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("ts-theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("themeToggle")}
      className="inline-flex cursor-pointer items-center gap-2 rounded-[6px] border border-line bg-chip px-3.5 py-1.5 text-[13px] text-copper transition-transform duration-200 active:scale-95"
    >
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
      <span>{theme === "dark" ? t("themeToLight") : t("themeToDark")}</span>
    </button>
  );
}