"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full border border-black/5 dark:border-white/10 bg-white dark:bg-[#121214]" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-200 border border-black/5 dark:border-white/10 bg-white/80 dark:bg-[#121214]/80 hover:bg-black/5 dark:hover:bg-white/5 backdrop-blur-md text-zinc-700 dark:text-zinc-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-zinc-200 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-zinc-700 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}
