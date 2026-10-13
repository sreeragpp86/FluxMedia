"use client";

import React, { useState } from "react";
import { ChevronDown, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

interface FAQItem {
  question: string;
  answer: string;
  category: "Codecs & Media" | "Queue & Performance" | "Privacy & Storage" | "Developer API";
}

const FAQS: FAQItem[] = [
  {
    category: "Codecs & Media",
    question: "Which video containers and codecs are supported?",
    answer:
      "FluxMedia natively supports MP4, MOV, MKV, WebM, AVI, and FLV input containers. All incoming streams are normalized and transcoded into universally compatible H.264 (AVC) video with AAC audio inside an MP4 container, playable on virtually any browser, TV, or mobile device.",
  },
  {
    category: "Codecs & Media",
    question: "What does the CRF (Constant Rate Factor) setting control?",
    answer:
      "CRF controls output compression efficiency: CRF 28 provides maximum compression with smaller file sizes (ideal for web/mobile streaming), CRF 23 is the industry recommended balanced preset, and CRF 18 yields visually lossless studio archival quality. FluxMedia clamps values between 18 and 35.",
  },
  {
    category: "Codecs & Media",
    question: "Is multi-channel audio and metadata preserved?",
    answer:
      "Yes. FFmpeg automatically maps the primary audio stream, normalizes audio sampling rates to 48kHz stereo AAC, and preserves rotation and timecode metadata where supported by the MP4 container.",
  },
  {
    category: "Queue & Performance",
    question: "How does the distributed task queue operate?",
    answer:
      "When you submit a file, the FastAPI gateway streams it directly into isolated storage and pushes an execution payload to a local or remote Redis message broker. An asynchronous Celery worker process picks up the message, invokes FFmpeg, tracks real-time progress, and stores the completed artifact back in /uploads.",
  },
  {
    category: "Queue & Performance",
    question: "What is the maximum allowed file size?",
    answer:
      "By default, the FastAPI streaming gateway enforces a 500 MB per-file threshold to prevent buffer exhaustion. Files larger than this threshold are rejected at the stream boundary with an HTTP 413 error.",
  },
  {
    category: "Queue & Performance",
    question: "Why does the worker use the 'solo' execution pool on macOS?",
    answer:
      "On macOS, Python's multiprocessing engine uses the 'spawn' model rather than 'fork'. Celery's default prefork pool can experience race conditions during worker trace initialization. Configuring the pool to 'solo' provides dedicated single-process throughput with complete stability on Darwin kernels.",
  },
  {
    category: "Privacy & Storage",
    question: "How long are uploaded videos stored on disk?",
    answer:
      "FluxMedia enforces a strict 24-hour transient storage policy. Uploaded media files and compressed artifacts in /uploads are considered transient cache and purged automatically. No files are ever shared or retained permanently.",
  },
  {
    category: "Privacy & Storage",
    question: "Are customer videos used to train artificial intelligence models?",
    answer:
      "Never. FluxMedia is a pure computational utility. No machine learning models, telemetry ingestion, or third-party analysis pipelines are connected to your media.",
  },
  {
    category: "Developer API",
    question: "Can I dispatch jobs programmatically via curl or Python?",
    answer:
      "Absolutely. You can send multipart/form-data directly to POST http://localhost:8000/upload with a file payload, which returns a task_id. You can then poll GET http://localhost:8000/status/{task_id} and fetch the output via GET http://localhost:8000/download/{filename}.",
  },
  {
    category: "Developer API",
    question: "How can I inspect live OpenAPI / Swagger documentation?",
    answer:
      "Visit http://localhost:8000/docs in your browser while the FastAPI server is running to view interactive Swagger docs, test endpoints, and generate client SDKs.",
  },
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [openIndexes, setOpenIndexes] = useState<number[]>([0, 1]);

  const categories = ["All", "Codecs & Media", "Queue & Performance", "Privacy & Storage", "Developer API"];

  const toggleIndex = (idx: number) => {
    if (openIndexes.includes(idx)) {
      setOpenIndexes(openIndexes.filter((i) => i !== idx));
    } else {
      setOpenIndexes([...openIndexes, idx]);
    }
  };

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-black/5 dark:border-white/10 pb-5 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight">
          Architecture FAQ
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Technical specifications covering the distributed FFmpeg queue, codec parameters, buffer safety, and developer APIs.
        </p>
      </div>

      {/* Search & Categories */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search keywords (e.g. CRF, Redis, solo, 500MB)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-[#121214] text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 font-mono"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`py-1 px-2.5 text-xs rounded-md transition-colors ${
                activeCategory === cat
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-medium"
                  : "border border-black/10 dark:border-white/10 bg-white dark:bg-[#121214] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion List */}
      <div className="rounded-lg border border-black/5 dark:border-white/10 bg-white dark:bg-[#121214] divide-y divide-black/5 dark:divide-white/10 overflow-hidden">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
            No matching specifications found for &quot;{searchTerm}&quot;.
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isOpen = openIndexes.includes(idx);
            return (
              <div key={faq.question}>
                <button
                  onClick={() => toggleIndex(idx)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                      {faq.category}
                    </span>
                    <span className="font-medium text-xs sm:text-sm text-zinc-900 dark:text-white">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-150 shrink-0 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-black/5 dark:border-white/5">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Return to Dashboard CTA */}
      <div className="p-5 rounded-lg border border-black/5 dark:border-white/10 bg-white dark:bg-[#121214] flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-zinc-900 dark:text-white">Ready to transcode media?</div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Stream video directly to the active Celery worker queue.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
        >
          <span>Open Dashboard</span>
          <ArrowRight className="w-3 h-3 stroke-[2]" />
        </Link>
      </div>
    </div>
  );
}
