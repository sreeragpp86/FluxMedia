"use client";

import React from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Layers } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-[#09090B]/70 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 text-base">
                FluxMedia
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border border-black/5 dark:border-white/10 bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400">
                Queue v1.0
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
              Distributed FFmpeg Task Processing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border border-black/5 dark:border-white/10 bg-zinc-50 dark:bg-[#121214] text-zinc-600 dark:text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>FastAPI • Celery • Redis</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
