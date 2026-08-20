"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "./Icons";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    const hasDark =
      root.classList.contains("dark") ||
      localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    setIsDark(hasDark);
    if (hasDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  function toggleTheme() {
    const nextDark = !isDark;
    setIsDark(nextDark);
    const root = document.documentElement;
    if (nextDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 rounded-xl text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-all duration-150 shadow-2xs cursor-pointer active:scale-95"
      title={isDark ? "Yorug' rejimga o'tish" : "Qorong'i rejimga o'tish"}
      aria-label="Mavzuni almashtirish"
    >
      {isDark ? (
        <SunIcon className="w-4 h-4 text-zinc-100" />
      ) : (
        <MoonIcon className="w-4 h-4 text-zinc-800" />
      )}
    </button>
  );
}
