import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8">
      {/* Navigation Return */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Workspace</span>
        </Link>
      </div>

      {/* Main Header & Disclaimer Card */}
      <div className="space-y-6">
        <div className="space-y-1.5 border-b border-black/5 dark:border-white/10 pb-4">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Technical Terms & Disclaimer
          </h1>
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
            System Notice · Ephemeral Processing Demonstration
          </p>
        </div>

        {/* Primary Mandated Disclaimer Body */}
        <div className="rounded-lg border border-black/5 dark:border-white/10 bg-white dark:bg-[#121214] p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-900 dark:text-white">
            <ShieldAlert className="w-4 h-4 text-zinc-500" />
            <span>Usage Disclaimer</span>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            This application is a technical demonstration. Do not upload sensitive, personal, or proprietary media. All files are processed automatically and permanently purged from the server within 24 hours. Provided as-is without warranty.
          </p>
        </div>

        {/* Key System Specifications */}
        <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 pt-2 font-mono">
          <p>• Retention Window: &le; 24 hours automated hard purge</p>
          <p>• Ingestion Boundary: 500 MB maximum container size</p>
          <p>• Processing Scope: Ephemeral CPU/GPU transcoding passes only</p>
        </div>
      </div>
    </div>
  );
}
