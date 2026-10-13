"use client";

import React from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import { Layers } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-black/5 dark:border-white/10 bg-white dark:bg-[#09090B] mt-20 transition-colors text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Brand Info */}
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-[10px]">
              <Layers className="w-3 h-3 stroke-[2.2]" />
            </div>
            <span className="font-semibold tracking-tight text-sm text-zinc-900 dark:text-white">
              FluxMedia
            </span>
            <span className="text-zinc-400 dark:text-zinc-600">·</span>
            <span className="text-zinc-500 dark:text-zinc-400">
              Decoupled Media Transcoding Queue
            </span>
          </div>

          {/* Minimal System Links */}
          <div className="flex items-center gap-5 text-zinc-600 dark:text-zinc-400">
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
              API Documentation
            </a>
            <Link
              href="/terms"
              className="hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Terms & Disclaimer
            </Link>
          </div>
        </div>

        {/* Bottom Bar: Sign-off, Copyright & Muted Version Tag */}
        <div className="pt-4 border-t border-black/5 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} FluxMedia</span>
            <span>·</span>
            <span>
              Engineered by{" "}
              <a
                href="https://www.linkedin.com/in/sreerag-p-p"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white underline underline-offset-2 transition-colors"
              >
                Sreerag P P
              </a>
            </span>
          </div>

          {/* Muted version tag in the bottom corner */}
          <div className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
            v1.0.0-beta
          </div>
        </div>
      </div>
    </footer>
  );
}
