"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Film, FileVideo, X, ArrowUpRight, AlertCircle } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
  uploadProgress: number;
  errorMessage?: string | null;
}

export function UploadZone({
  onFileSelected,
  isUploading,
  uploadProgress,
  errorMessage,
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const validateAndSelect = (file: File) => {
    setLocalError(null);
    const validVideoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();

    if (!file.type.startsWith("video/") && !validVideoExtensions.includes(ext)) {
      setLocalError("Please select a valid video file (MP4, MOV, MKV, WebM)");
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
    }
  };

  const handleStartUpload = () => {
    if (selectedFile) {
      onFileSelected(selectedFile);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const displayError = errorMessage || localError;

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="video/*,.mp4,.mov,.avi,.mkv,.webm"
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !selectedFile && inputRef.current?.click()}
        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 p-8 text-center ${
          isDragOver
            ? "border-zinc-400 dark:border-zinc-500 bg-zinc-100/50 dark:bg-zinc-900/50 scale-[1.01]"
            : "border-black/5 dark:border-white/10 bg-white dark:bg-[#121214] hover:border-black/10 dark:hover:border-white/20"
        } ${!selectedFile ? "cursor-pointer" : ""}`}
      >
        {/* Glow ambient background effect */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-zinc-200/40 dark:bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {!selectedFile ? (
            <motion.div
              key="drop-idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-6"
            >
              <div className="w-14 h-14 rounded-2xl border border-black/5 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300 mb-4 shadow-sm group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6 stroke-[1.5]" />
              </div>

              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 tracking-tight mb-1">
                Drag and drop your media file
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">
                Upload video files for high-throughput distributed FFmpeg H.264 transcoding.
              </p>

              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 dark:text-zinc-500">
                <span className="px-2 py-0.5 rounded border border-black/5 dark:border-white/10 bg-zinc-100 dark:bg-zinc-800/60">
                  MP4
                </span>
                <span className="px-2 py-0.5 rounded border border-black/5 dark:border-white/10 bg-zinc-100 dark:bg-zinc-800/60">
                  MOV
                </span>
                <span className="px-2 py-0.5 rounded border border-black/5 dark:border-white/10 bg-zinc-100 dark:bg-zinc-800/60">
                  MKV
                </span>
                <span className="px-2 py-0.5 rounded border border-black/5 dark:border-white/10 bg-zinc-100 dark:bg-zinc-800/60">
                  WEBM
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="file-selected"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col items-center py-4 text-left"
            >
              <div className="w-full flex items-center justify-between p-4 rounded-xl border border-black/5 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/60 mb-6">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shrink-0">
                    <FileVideo className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                      {formatBytes(selectedFile.size)} • {selectedFile.type || "Video"}
                    </p>
                  </div>
                </div>

                {!isUploading && (
                  <button
                    onClick={handleClear}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {isUploading ? (
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                    <span>Streaming to /uploads...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <motion.div
                      className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ ease: "easeInOut" }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleStartUpload}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-sm font-medium transition-all shadow-sm hover:shadow active:scale-[0.98]"
                  >
                    <span>Enqueue Compression Task</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="px-4 py-3 rounded-xl border border-black/5 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs text-zinc-600 dark:text-zinc-400 transition-colors"
                  >
                    Change File
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {displayError && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-2 p-3 rounded-xl text-xs text-rose-600 dark:text-rose-400 border border-rose-500/20 bg-rose-500/5 font-mono"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{displayError}</span>
        </motion.div>
      )}
    </div>
  );
}


