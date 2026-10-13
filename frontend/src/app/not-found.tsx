import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-zinc-900 dark:text-white font-mono">
          404 | Pipeline Not Found
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
          The requested media queue path or task artifact does not exist.
        </p>
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-black/10 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors shadow-sm"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Workspace</span>
      </Link>
    </div>
  );
}
