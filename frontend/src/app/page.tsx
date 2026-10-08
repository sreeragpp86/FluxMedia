"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadZone } from "@/components/UploadZone";
import { StatusTracker } from "@/components/StatusTracker";
import { ResultCard } from "@/components/ResultCard";
import { uploadVideo } from "@/lib/api";
import { Server, Database, Cpu, AlertOctagon, RotateCcw } from "lucide-react";

type AppState = "idle" | "tracking" | "completed" | "error";

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [activeTaskId, setActiveTaskId] = useState<string>("");
  const [activeFilename, setActiveFilename] = useState<string>("");
  const [outputFilename, setOutputFilename] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelected = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage(null);
    setActiveFilename(file.name);

    try {
      const response = await uploadVideo(file, (percent) => {
        setUploadProgress(percent);
      });

      // Transition to tracking state
      setActiveTaskId(response.task_id);
      setAppState("tracking");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload video to backend");
    } finally {
      setIsUploading(false);
    }
  };

  const handleTaskCompleted = (result: any) => {
    const outName = result?.filename || result?.file || `compressed_${activeFilename}`;
    setOutputFilename(outName);
    setAppState("completed");
  };

  const handleTaskError = (error: string) => {
    setErrorMessage(error);
    setAppState("error");
  };

  const handleReset = () => {
    setAppState("idle");
    setActiveTaskId("");
    setActiveFilename("");
    setOutputFilename("");
    setErrorMessage(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <section className="text-center space-y-4 pt-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border border-black/5 dark:border-white/10 bg-white/60 dark:bg-[#121214]/60 backdrop-blur-md text-zinc-600 dark:text-zinc-400 mb-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100" />
          <span>Onyx & Alabaster Interface</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 max-w-2xl mx-auto"
        >
          Distributed Media Task Queue
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed"
        >
          High-throughput asynchronous FFmpeg video transcoding powered by FastAPI, Celery, and Redis.
        </motion.p>
      </section>

      {/* Main Interactive Stage */}
      <section className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {appState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <UploadZone
                onFileSelected={handleFileSelected}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                errorMessage={errorMessage}
              />
            </motion.div>
          )}

          {appState === "tracking" && (
            <motion.div
              key="tracking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <StatusTracker
                taskId={activeTaskId}
                filename={activeFilename}
                onCompleted={handleTaskCompleted}
                onError={handleTaskError}
                onReset={handleReset}
              />
            </motion.div>
          )}

          {appState === "completed" && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ResultCard
                originalFilename={activeFilename}
                outputFilename={outputFilename}
                taskId={activeTaskId}
                onReset={handleReset}
              />
            </motion.div>
          )}

          {appState === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="p-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Transcoding Failed
              </h3>
              <p className="text-xs font-mono text-rose-600 dark:text-rose-400 max-w-md mx-auto">
                {errorMessage || "An unexpected error occurred during FFmpeg execution."}
              </p>
              <div className="pt-2">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#121214] text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Another Video</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Architecture Cards Section */}
      <section className="pt-8 border-t border-black/5 dark:border-white/10">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 text-center mb-6">
          Distributed Pipeline Infrastructure
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#121214] space-y-2">
            <div className="flex items-center gap-2.5 text-zinc-900 dark:text-zinc-100 font-medium text-sm">
              <Server className="w-4 h-4 text-zinc-400" />
              <span>FastAPI API Gateway</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Handles multipart stream uploads to <code className="text-[11px] font-mono px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">/uploads</code>, verifies payloads, and dispatches Celery tasks.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#121214] space-y-2">
            <div className="flex items-center gap-2.5 text-zinc-900 dark:text-zinc-100 font-medium text-sm">
              <Database className="w-4 h-4 text-zinc-400" />
              <span>Redis Queue & Store</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Acts as the distributed broker and result backend running locally at <code className="text-[11px] font-mono px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">redis://localhost:6379/0</code>.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#121214] space-y-2">
            <div className="flex items-center gap-2.5 text-zinc-900 dark:text-zinc-100 font-medium text-sm">
              <Cpu className="w-4 h-4 text-zinc-400" />
              <span>Celery Worker & FFmpeg</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Asynchronous worker processes video compression with H.264 codec and writes output back to <code className="text-[11px] font-mono px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">/uploads</code>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
