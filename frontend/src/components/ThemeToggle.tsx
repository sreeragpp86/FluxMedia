"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-md border border-black/5 dark:border-white/10 bg-white dark:bg-[#121214]" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center justify-center w-8 h-8 rounded-md border border-black/5 dark:border-white/10 bg-white dark:bg-[#121214] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors focus:outline-none"
      aria-label="Toggle color theme"
      title={isDark ? "Switch to Alabaster Light" : "Switch to Onyx Dark"}
    >
      {isDark ? (
        <Sun className="w-3.5 h-3.5 stroke-[2]" />
      ) : (
        <Moon className="w-3.5 h-3.5 stroke-[2]" />
      )}
    </motion.button>
  );
}
