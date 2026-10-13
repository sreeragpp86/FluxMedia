"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { fetchSystemHealth, API_BASE_URL } from "@/lib/api";
import { Layers } from "lucide-react";

export function Navbar() {
  const [isOperational, setIsOperational] = useState<boolean | null>(null);

  useEffect(() => {
    fetchSystemHealth().then((health) => {
      setIsOperational(health !== null);
    });
    const interval = setInterval(() => {
      fetchSystemHealth().then((health) => {
        setIsOperational(health !== null);
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 dark:border-white/10 bg-white/80 dark:bg-[#09090B]/80 backdrop-blur-md transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
        {/* Brand Logo - Minimal SaaS */}
        <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
          <div className="w-6 h-6 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs shadow-sm">
            <Layers className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-tight text-sm text-zinc-900 dark:text-white">
              FluxMedia
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 border border-black/5 dark:border-white/10">
              v1.0.0-beta
            </span>
          </div>
        </Link>

        {/* Right Status Indicator, System Links & Theme Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <a
              href="https://github.com/sreerag-p-p/FluxMedia"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              GitHub Source
            </a>
            <a
              href={`${API_BASE_URL}/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              API Docs
            </a>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md border border-black/5 dark:border-white/10 bg-white dark:bg-[#121214] text-xs font-mono text-zinc-600 dark:text-zinc-400">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOperational ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
              }`}
            />
            <span className="text-[11px]">
              {isOperational ? "Cluster Operational" : "Connecting..."}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-black/5 dark:bg-white/10" />

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
