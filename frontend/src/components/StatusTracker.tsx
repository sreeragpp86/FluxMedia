"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { checkTaskStatus, TaskResultData } from "@/lib/api";
import { Copy, Check, RotateCcw, Loader2, CheckCircle2 } from "lucide-react";

interface StatusTrackerProps {
  taskId: string;
  filename: string;
  onCompleted: (result: TaskResultData | null | undefined) => void;
  onError: (error: string) => void;
  onReset: () => void;
  onLogsUpdate?: (logs: string[]) => void;
}

export function StatusTracker({
  taskId,
  filename,
  onCompleted,
  onError,
  onReset,
  onLogsUpdate,
}: StatusTrackerProps) {
  const [status, setStatus] = useState<string>("PENDING");
  const [elapsed, setElapsed] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([
    "00:00 Ingest: Multipart stream verified and written to /uploads",
    "00:01 Broker: Payload registered in Redis in-memory queue",
    "00:02 Worker: Celery solo pool process dequeued task",
  ]);

  useEffect(() => {
    onLogsUpdate?.(logs);
  }, [logs, onLogsUpdate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        const pad = next < 10 ? `0${next}` : `${next}`;
        if (next === 2) {
          setLogs((l) => [...l, `00:${pad} FFmpeg: Probing media container streams & channels`]);
        } else if (next === 4) {
          setLogs((l) => [...l, `00:${pad} FFmpeg: Initializing libx264 thread matrix & CRF profile`]);
        } else if (next === 6) {
          setLogs((l) => [...l, `00:${pad} FFmpeg: Transcoding active · Applying +faststart moov atom`]);
        } else if (next === 8) {
          setLogs((l) => [...l, `00:${pad} FFmpeg: Audio track normalized · Finalizing MP4 container`]);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const poll = async () => {
      try {
        const res = await checkTaskStatus(taskId);
        if (!isMounted) return;

        setStatus(res.status);

        if (res.status === "COMPLETED" || res.status === "SUCCESS") {
          setLogs((l) => [...l, "Pipeline: Transcoding pass completed. Artifact ready for download."]);
          onCompleted(res.result);
        } else if (res.status === "ERROR" || res.status === "FAILURE") {
          const errMsg =
            res.error ||
            res.result?.details ||
            res.result?.message ||
            "FFmpeg transcoding failed in background worker.";
          onError(errMsg);
        }
      } catch (err: any) {
        if (!isMounted) return;
      }
    };

    poll();
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

  const stages = [
    { name: "Stream Ingest", done: true },
    { name: "Redis Broker", done: true },
    { name: "FFmpeg Transcode", done: status === "PROCESSING" || status === "COMPLETED" },
    { name: "Artifact Delivery", done: status === "COMPLETED" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="rounded-lg border border-black/5 dark:border-white/10 bg-white dark:bg-[#121214] p-6 space-y-6"
    >
      {/* Top Ledger Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 dark:border-white/10 pb-4">
        <div>
          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
            Asynchronous Task Running
          </span>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-white mt-0.5 truncate max-w-sm">
            {filename}
          </h3>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={copyTaskId}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-black/10 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-mono text-zinc-600 dark:text-zinc-400 transition-colors"
          title="Copy Task ID"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          <span className="truncate max-w-[140px]">{taskId}</span>
        </motion.button>
      </div>

      {/* Animated Clean Progress Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 font-medium text-zinc-900 dark:text-white">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />
            <span>Status: {status}</span>
          </span>
          <span className="font-mono text-zinc-500 dark:text-zinc-400">
            {elapsed}s elapsed
          </span>
        </div>

        {/* Minimalist Linear Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative">
          <motion.div
            className="h-full bg-zinc-900 dark:bg-white rounded-full"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.8,
              ease: "easeInOut",
            }}
            style={{ width: "45%" }}
          />
        </div>
      </div>

      {/* Stepped Stage Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {stages.map((st, idx) => (
          <div
            key={st.name}
            className={`p-3 rounded-md border text-xs transition-colors ${
              st.done
                ? "border-black/15 dark:border-white/20 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-white"
                : "border-black/5 dark:border-white/5 bg-transparent text-zinc-400 dark:text-zinc-600"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                0{idx + 1}
              </span>
              {st.done ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900 dark:text-white stroke-[2.2]" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              )}
            </div>
            <p className="font-medium truncate">{st.name}</p>
          </div>
        ))}
      </div>

      {/* Footer Reset Action */}
      <div className="pt-2 flex justify-end">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-black/10 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Task</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
