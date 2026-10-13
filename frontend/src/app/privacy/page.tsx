"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  const lastUpdated = "October 9, 2026";

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-black/5 dark:border-white/10 pb-5 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight">
          Privacy & Security Standards
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Effective: {lastUpdated} · GDPR & CCPA Aligned
        </p>
      </div>

      {/* Core Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-lg border border-black/5 dark:border-white/10 bg-white dark:bg-[#121214] p-5 space-y-1.5">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
            Principle 01
          </span>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-white">
            Ephemeral Storage
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Media resides in /uploads strictly during transcode execution and is automatically destroyed within 24 hours.
          </p>
        </div>

        <div className="rounded-lg border border-black/5 dark:border-white/10 bg-white dark:bg-[#121214] p-5 space-y-1.5">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
            Principle 02
          </span>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-white">
            Zero Content Mining
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Customer video frames are never inspected, stored in external lakes, or used to train machine learning models.
          </p>
        </div>

        <div className="rounded-lg border border-black/5 dark:border-white/10 bg-white dark:bg-[#121214] p-5 space-y-1.5">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
            Principle 03
          </span>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-white">
            Process Sandboxing
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Every Celery task executes in an isolated process sandbox with strict path-traversal boundary enforcement.
          </p>
        </div>
      </div>

      {/* Main Privacy Body */}
      <div className="rounded-lg border border-black/5 dark:border-white/10 bg-white dark:bg-[#121214] p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed divide-y divide-black/5 dark:divide-white/10">
        <section className="space-y-2 pt-0">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
            01. Zero-Knowledge Architecture
          </h2>
          <p>
            FluxMedia is engineered as a zero-knowledge computational pipeline. We do not require accounts, cookies, tracking beacons, or identity profiles. Media streams directly from your client to ephemeral local storage, undergoes deterministic FFmpeg transcoding, and is served back to you.
          </p>
        </section>

        <section className="space-y-2 pt-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
            02. Ingested Telemetry
          </h2>
          <p>The system temporarily stores only strictly technical attributes required for pipeline operation:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-500">
            <li>File size and container format.</li>
            <li>Celery task execution UUID.</li>
            <li>FFmpeg exit code and byte savings calculation.</li>
          </ul>
        </section>

        <section className="space-y-2 pt-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
            03. Automated Hard Deletion
          </h2>
          <p>
            All source and compressed files stored in /uploads are tagged with random 8-character UUID prefixes. A background file sweeper purges all artifacts older than 24 hours. No cold-storage snapshots or tape backups are maintained.
          </p>
        </section>
      </div>

      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-black/10 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return To Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
