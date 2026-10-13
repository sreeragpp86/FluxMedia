import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Hero Header Skeleton */}
      <div className="space-y-2 pb-4 border-b border-black/5 dark:border-white/10">
        <Skeleton className="h-7 w-72 sm:w-96" />
        <Skeleton className="h-4 w-60 sm:w-80" />
      </div>

      {/* Main Bento Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Bento Cell 1: Primary Stage Skeleton (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Rate control bar skeleton */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3.5 w-20" />
            </div>
            <Skeleton className="h-9 w-full rounded-md" />
          </div>

          {/* Upload Dropzone Skeleton */}
          <div className="rounded-lg border border-dashed border-black/15 dark:border-white/15 bg-white dark:bg-[#121214] p-10 flex flex-col items-center justify-center space-y-4 min-h-[280px]">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2 flex flex-col items-center">
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-3.5 w-64" />
            </div>
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-28 rounded" />
              <Skeleton className="h-5 w-20 rounded" />
            </div>
          </div>
        </div>

        {/* Bento Cell 2: Telemetry Side Card Skeleton (lg:col-span-4) */}
        <div className="lg:col-span-4 rounded-lg border border-black/5 dark:border-white/10 bg-white dark:bg-[#121214] flex flex-col justify-between overflow-hidden min-h-[380px]">
          <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>

          <div className="p-4 space-y-2.5 flex-1">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3.5 w-5/6" />
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3.5 w-3/4" />
          </div>

          <div className="p-3 border-t border-black/5 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
