"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadZone } from "@/components/UploadZone";
import { StatusTracker } from "@/components/StatusTracker";
import { ResultCard } from "@/components/ResultCard";
import { uploadVideo, TaskResultData } from "@/lib/api";
import { RotateCcw, AlertCircle, Terminal } from "lucide-react";

type AppState = "idle" | "tracking" | "completed" | "error";

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [activeTaskId, setActiveTaskId] = useState<string>("");
  const [activeFilename, setActiveFilename] = useState<string>("");
  const [outputFilename, setOutputFilename] = useState<string>("");
  const [taskResult, setTaskResult] = useState<TaskResultData | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Terminal Logs in Bento Side-Card
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "sys: cluster initialized · listening on redis :6379",
    "worker: celery solo pool standing by for task events",
    "gateway: fastapi streaming multipart router mounted",
  ]);

  const handleFileSelected = async (file: File, crf: number) => {
    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage(null);
    setActiveFilename(file.name);
    setTerminalLogs((prev) => [
      ...prev,
      `ingest: incoming stream [${file.name}] (${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
    ]);

    try {
      const response = await uploadVideo(file, crf, (percent) => {
        setUploadProgress(percent);
      });
      setActiveTaskId(response.task_id);
      setTerminalLogs((prev) => [
        ...prev,
        `dispatch: task enqueued id=${response.task_id}`,
      ]);
      setAppState("tracking");
    } catch (err: any) {
      setErrorMessage(err.message || "Upload stream failed. Ensure backend is running.");
      setTerminalLogs((prev) => [
        ...prev,
        `error: upload rejected - ${err.message || "unknown failure"}`,
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTaskCompleted = (result: TaskResultData | null | undefined) => {
    const outName = result?.filename || result?.file || `compressed_${activeFilename}`;
    setOutputFilename(outName);
    setTaskResult(result || null);
    setTerminalLogs((prev) => [
      ...prev,
      `completed: artifact ready [${outName}]`,
    ]);
    setAppState("completed");
  };

  const handleTaskError = (error: string) => {
    setErrorMessage(error);
    setTerminalLogs((prev) => [...prev, `error: task failed - ${error}`]);
    setAppState("error");
  };

  const handleReset = () => {
    setAppState("idle");
    setActiveTaskId("");
    setActiveFilename("");
    setOutputFilename("");
    setTaskResult(null);
    setErrorMessage(null);
    setUploadProgress(0);
    setTerminalLogs((prev) => [...prev, "sys: reset console to idle state"]);
  };

  const handleLogsUpdate = (newLogs: string[]) => {
    setTerminalLogs(newLogs);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="space-y-1 pb-4 border-b border-black/5 dark:border-white/10">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Distributed Media Processing Queue
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Decoupled FFmpeg video transcoding with FastAPI, Redis, and Celery.
        </p>
      </div>

      {/* Main Bento Layout: Stage + Worker Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Bento Primary Stage (lg:col-span-8) */}
        <div className="lg:col-span-8 flex flex-col justify-start">
          <AnimatePresence mode="wait">
            {appState === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <StatusTracker
                  taskId={activeTaskId}
                  filename={activeFilename}
                  onCompleted={handleTaskCompleted}
                  onError={handleTaskError}
                  onReset={handleReset}
                  onLogsUpdate={handleLogsUpdate}
                />
              </motion.div>
            )}

            {appState === "completed" && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <ResultCard
                  originalFilename={activeFilename}
                  outputFilename={outputFilename}
                  taskId={activeTaskId}
                  resultData={taskResult}
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
                className="rounded-lg border border-red-500/20 bg-white dark:bg-[#121214] p-6 space-y-4 text-center"
              >
                <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-white">
                    Task Execution Interrupted
                  </h3>
                  <p className="text-xs font-mono text-red-600 dark:text-red-400 mt-1 max-w-md mx-auto">
                    {errorMessage || "FFmpeg encountered an encoding exception in worker thread."}
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bento Telemetry Panel (lg:col-span-4) */}
        <div className="lg:col-span-4 rounded-lg border border-black/5 dark:border-white/10 bg-white dark:bg-[#121214] flex flex-col justify-between overflow-hidden min-h-[380px]">
          <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-zinc-500" />
              <span>Worker Telemetry</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
              {terminalLogs.length} events
            </span>
          </div>

          <div className="p-4 font-mono text-[11px] space-y-2 text-zinc-600 dark:text-zinc-400 flex-1 overflow-y-auto max-h-[320px] lg:max-h-none">
            {terminalLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-zinc-400 select-none">&gt;</span>
                <span className="break-all">{log}</span>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-black/5 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/40 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
            <span>broker: redis:6379</span>
            <span>solo pool active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
