"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Copy, Check, Clock, Cpu, Film, AlertTriangle } from "lucide-react";
import { checkTaskStatus, TaskStatusResponse } from "@/lib/api";

interface StatusTrackerProps {
  taskId: string;
  filename: string;
  onCompleted: (result: TaskStatusResponse["result"]) => void;
  onError: (error: string) => void;
  onReset: () => void;
}

export function StatusTracker({
  taskId,
  filename,
  onCompleted,
  onError,
  onReset,
}: StatusTrackerProps) {
  const [status, setStatus] = useState<string>("PENDING");
  const [elapsed, setElapsed] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>("");

  useEffect(() => {
    // Timer for elapsed seconds
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const poll = async () => {
      try {
        const res = await checkTaskStatus(taskId);
        if (!isMounted) return;

        setLastCheckTime(new Date().toLocaleTimeString());
        setStatus(res.status);

        if (res.status === "COMPLETED" || res.status === "SUCCESS") {
          onCompleted(res.result);
        } else if (res.status === "ERROR" || res.status === "FAILURE") {
          const errMsg =
            res.error ||
            res.result?.details ||
            res.result?.message ||
            "FFmpeg processing failed";
          onError(errMsg);
        }
      } catch (err: any) {
        if (!isMounted) return;
        // Don't immediately fail on transient network error, just record check
        setLastCheckTime("Connection error, retrying...");
      }
    };

    // Immediate first check
    poll();

    // Poll every 2 seconds as requested
    const interval = setInterval(poll, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [taskId, onCompleted, onError]);

  const copyTaskId = () => {
    navigator.clipboard.writeText(taskId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusDetails = () => {
    switch (status) {
      case "PROCESSING":
        return {
          label: "Active Worker Transcoding",
          desc: "Celery worker running FFmpeg H.264 compression...",
          color: "text-amber-500",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/20",
        };
      case "COMPLETED":
        return {
          label: "Transcoding Completed",
          desc: "Output video rendered and stored in /uploads.",
          color: "text-emerald-500",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/20",
        };
      case "ERROR":
        return {
          label: "Processing Error",
          desc: "An error occurred during transcoding.",
          color: "text-rose-500",
          bgColor: "bg-rose-500/10",
          borderColor: "border-rose-500/20",
        };
      default:
        return {
          label: "Queued in Redis",
          desc: "Waiting for available Celery worker thread...",
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/20",
        };
    }
  };

  const statusInfo = getStatusDetails();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#121214] p-8 overflow-hidden relative"
    >
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-200/50 dark:bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/5 dark:border-white/10 mb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Task Orchestration
          </span>
          <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mt-0.5">
            <Film className="w-5 h-5 text-zinc-400 stroke-[1.5]" />
            <span className="truncate max-w-[280px] sm:max-w-md">{filename}</span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyTaskId}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/5 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            title="Copy Task ID"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span className="truncate max-w-[120px]">{taskId}</span>
          </button>
        </div>
      </div>

      {/* Central Animation & State */}
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative mb-6">
          {/* Animated concentric rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="w-24 h-24 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center"
          />
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full border border-zinc-400/40 dark:border-zinc-500/30 bg-zinc-100/80 dark:bg-zinc-800/60 backdrop-blur-sm flex items-center justify-center"
          >
            <Loader2 className="w-7 h-7 text-zinc-800 dark:text-zinc-200 animate-spin" />
          </motion.div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium border mb-2 uppercase tracking-wider"
             style={{
               borderColor: statusInfo.borderColor,
               backgroundColor: statusInfo.bgColor,
               color: statusInfo.color,
             }}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {status}
        </div>

        <h4 className="text-base font-medium text-zinc-900 dark:text-zinc-100 mb-1">
          {statusInfo.label}
        </h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center max-w-sm">
          {statusInfo.desc}
        </p>
      </div>

      {/* Dynamic Progress indicator */}
      <div className="w-full bg-zinc-100 dark:bg-zinc-800/80 h-1.5 rounded-full overflow-hidden mb-6 relative">
        <motion.div
          className="h-full bg-gradient-to-r from-zinc-500 via-zinc-900 to-zinc-500 dark:from-zinc-400 dark:via-zinc-100 dark:to-zinc-400 rounded-full"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut",
          }}
          style={{ width: "60%" }}
        />
      </div>

      {/* Meta Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-black/5 dark:border-white/10 text-xs font-mono text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-400" />
          <span>Elapsed: {elapsed}s</span>
        </div>
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-zinc-400" />
          <span>Poll Frequency: 2000ms</span>
        </div>
        <div className="col-span-2 sm:col-span-1 text-right sm:text-right">
          <span>Synced: {lastCheckTime || "Connecting..."}</span>
        </div>
      </div>
    </motion.div>
  );
}
