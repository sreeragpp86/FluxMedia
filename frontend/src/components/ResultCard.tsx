"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Download, Film, RotateCcw, ArrowDownRight, HardDrive } from "lucide-react";
import { SpotlightCard } from "./SpotlightCard";
import { getDownloadUrl } from "@/lib/api";

interface ResultCardProps {
  originalFilename: string;
  outputFilename: string;
  taskId: string;
  onReset: () => void;
}

export function ResultCard({
  originalFilename,
  outputFilename,
  taskId,
  onReset,
}: ResultCardProps) {
  const downloadUrl = getDownloadUrl(outputFilename);

  const handleDownload = () => {
    // Direct browser navigation to download endpoint
    window.location.href = downloadUrl;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      <SpotlightCard className="p-8">
        {/* Header with success badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/5 dark:border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-medium">
                Compression Completed
              </span>
              <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Ready for Download
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 px-2.5 py-1 rounded-md border border-black/5 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/60">
              H.264 • CRF 28
            </span>
          </div>
        </div>

        {/* Content details */}
        <div className="space-y-4 mb-8">
          <div className="p-4 rounded-xl border border-black/5 dark:border-white/10 bg-zinc-50/70 dark:bg-zinc-900/40 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Film className="w-5 h-5 text-zinc-500 shrink-0 stroke-[1.5]" />
                <div className="min-w-0">
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">Output Artifact</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {outputFilename}
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shrink-0">
                /uploads
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-zinc-500 dark:text-zinc-400 pt-2 border-t border-black/5 dark:border-white/5">
              <span>Source: {originalFilename}</span>
              <span className="truncate max-w-[150px]">Task: {taskId.slice(0, 8)}...</span>
            </div>
          </div>
        </div>

        {/* Actions CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleDownload}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-sm font-medium transition-all shadow-sm hover:shadow active:scale-[0.98]"
          >
            <Download className="w-4 h-4 stroke-[2]" />
            <span>Download Compressed Video</span>
            <ArrowDownRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
          </button>

          <button
            onClick={onReset}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-black/5 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 text-sm font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Queue Another</span>
          </button>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}
