"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  RotateCcw,
  CheckCircle2,
  Copy,
  Check,
  TrendingDown,
  Share2,
} from "lucide-react";
import { SpotlightCard } from "./SpotlightCard";
import { getDownloadUrl, TaskResultData } from "@/lib/api";
import { formatBytes } from "@/lib/utils";

interface ResultCardProps {
  originalFilename: string;
  outputFilename: string;
  taskId: string;
  resultData?: TaskResultData | null;
  onReset: () => void;
}

export function ResultCard({
  originalFilename,
  outputFilename,
  taskId,
  resultData,
  onReset,
}: ResultCardProps) {
  const downloadUrl = getDownloadUrl(outputFilename);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);

  const originalSize = resultData?.original_size || 0;
  const outputSize = resultData?.output_size || 0;
  const savingsPct = resultData?.savings_pct || 0;
  const crfValue = resultData?.crf || 28;

  const ffmpegCommand = `ffmpeg -y -i "${originalFilename}" -c:v libx264 -crf ${crfValue} -preset medium -c:a aac -b:a 128k -movflags +faststart "${outputFilename}"`;

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = outputFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + downloadUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCli = () => {
    navigator.clipboard.writeText(ffmpegCommand);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full"
    >
      <SpotlightCard className="p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-black/5 dark:border-white/10 flex items-center justify-center text-zinc-900 dark:text-white shrink-0">
              <CheckCircle2 className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Transcoding Completed
              </span>
              <h3 className="text-sm font-medium text-zinc-900 dark:text-white mt-0.5 truncate max-w-sm">
                {outputFilename}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-black/5 dark:border-white/10">
              CRF {crfValue} · H.264 MP4
            </span>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyLink}
              className="p-1.5 rounded-md border border-black/10 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
              title="Copy shareable download link"
            >
              {copiedLink ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Compression Metrics Ledger */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3.5 rounded-md border border-black/5 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/40">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mb-0.5">
              Source Size
            </span>
            <span className="text-sm font-mono font-medium text-zinc-900 dark:text-white">
              {originalSize ? formatBytes(originalSize) : "Original"}
            </span>
          </div>

          <div className="p-3.5 rounded-md border border-black/5 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/40">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mb-0.5">
              Output Size
            </span>
            <span className="text-sm font-mono font-medium text-zinc-900 dark:text-white">
              {outputSize ? formatBytes(outputSize) : "Output"}
            </span>
          </div>

          <div className="p-3.5 rounded-md border border-black/5 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/40">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mb-0.5 flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-emerald-500" />
              <span>Reduction</span>
            </span>
            <span className="text-sm font-mono font-medium text-emerald-600 dark:text-emerald-400">
              {savingsPct > 0 ? `-${savingsPct}% Saved` : "Optimized"}
            </span>
          </div>
        </div>

        {/* Compressed Video Player Preview */}
        <div className="relative rounded-md bg-black aspect-video max-h-64 mx-auto overflow-hidden border border-black/10 dark:border-white/10">
          <video
            ref={videoRef}
            src={downloadUrl}
            controls
            className="w-full h-full object-contain"
          />
          <div className="absolute top-2.5 left-2.5 text-[10px] font-mono text-zinc-300 bg-black/75 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm">
            Output Preview · {outputFilename}
          </div>
        </div>

        {/* FFmpeg Invocation Command */}
        <div className="p-3 rounded-md border border-black/5 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/40 space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>Executed Command</span>
            <button
              onClick={handleCopyCli}
              className="hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1"
            >
              {copiedCli ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy CLI</span>
                </>
              )}
            </button>
          </div>
          <pre className="text-[11px] text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-all select-all leading-relaxed">
            {ffmpegCommand}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 stroke-[2]" />
            <span>Download Transcoded Media</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md border border-black/10 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Process Another</span>
          </motion.button>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}
