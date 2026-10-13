"use client";

import React, { useState, useRef, DragEvent, ChangeEvent, useEffect } from "react";
import { motion } from "framer-motion";
import { formatBytes } from "@/lib/utils";
import {
  Upload,
  FileVideo,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

interface TranscodePreset {
  id: string;
  label: string;
  crf: number;
  reduction: string;
  description: string;
}

const PRESETS: TranscodePreset[] = [
  {
    id: "efficiency",
    label: "CRF 28 · Efficiency",
    crf: 28,
    reduction: "~55% smaller",
    description: "Maximum payload compression for web & mobile distribution",
  },
  {
    id: "balanced",
    label: "CRF 23 · Balanced",
    crf: 23,
    reduction: "~35% smaller",
    description: "Optimal balance between perceptual sharpness and file size",
  },
  {
    id: "master",
    label: "CRF 18 · Master",
    crf: 18,
    reduction: "~15% smaller",
    description: "Visually lossless fidelity for archival & primary delivery",
  },
];

interface UploadZoneProps {
  onFileSelected: (file: File, crf: number) => void;
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
  const [selectedCrf, setSelectedCrf] = useState<number>(28);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoResolution, setVideoResolution] = useState<{ width: number; height: number } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setVideoPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setVideoPreviewUrl(null);
      setVideoResolution(null);
      setDuration(0);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [selectedFile]);

  const validateAndSelect = (file: File) => {
    setLocalError(null);
    const validVideoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v", ".flv"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();

    const MAX_SIZE = 500 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setLocalError("File exceeds the 500 MB ceiling limit.");
      return;
    }

    if (!file.type.startsWith("video/") && !validVideoExtensions.includes(ext)) {
      setLocalError("Unsupported container. Please select MP4, MOV, MKV, WebM, or AVI.");
      return;
    }

    setSelectedFile(file);
  };

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

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const togglePlayback = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      setVideoResolution({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime || 0);
    }
  };

  const formatSeconds = (sec: number) => {
    if (!sec || isNaN(sec)) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleStartUpload = () => {
    if (selectedFile) {
      onFileSelected(selectedFile, selectedCrf);
    }
  };

  const displayError = errorMessage || localError;

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="video/*,.mp4,.mov,.avi,.mkv,.webm"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Preset Rate Control Selector */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-medium">Encoding Profile</span>
          <span className="font-mono text-[11px]">
            {PRESETS.find((p) => p.crf === selectedCrf)?.reduction}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1 p-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/10 text-xs">
          {PRESETS.map((preset) => {
            const isSelected = selectedCrf === preset.crf;
            return (
              <motion.button
                key={preset.id}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCrf(preset.crf)}
                disabled={isUploading}
                className={`py-1.5 px-2 text-center rounded font-medium transition-colors ${
                  isSelected
                    ? "bg-white dark:bg-[#121214] text-zinc-900 dark:text-white shadow-sm border border-black/5 dark:border-white/10"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {preset.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Spacious Dashed Dropzone */}
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative rounded-lg border border-dashed p-10 text-center transition-all cursor-pointer ${
            isDragOver
              ? "border-zinc-900 dark:border-white bg-zinc-100/50 dark:bg-zinc-900/50"
              : "border-black/15 dark:border-white/15 bg-white dark:bg-[#121214] hover:border-black/30 dark:hover:border-white/30"
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800/60 border border-black/5 dark:border-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
              <Upload className="w-5 h-5 stroke-[1.8]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-medium text-zinc-900 dark:text-white">
                Drop your video here to transcode
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Drag and drop media or click to browse from disk
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 border border-black/5 dark:border-white/10">
                MP4, MOV, MKV, WebM
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 border border-black/5 dark:border-white/10">
                Max 500 MB
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Staged File Card */
        <div className="rounded-lg border border-black/5 dark:border-white/10 bg-white dark:bg-[#121214] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-black/5 dark:border-white/10 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shrink-0">
                <FileVideo className="w-4 h-4 stroke-[1.8]" />
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-zinc-900 dark:text-white truncate">
                  {selectedFile.name}
                </p>
                <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  {formatBytes(selectedFile.size)}
                  {videoResolution && ` · ${videoResolution.width}×${videoResolution.height}px`}
                </p>
              </div>
            </div>

            {!isUploading && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleClear}
                className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Discard file"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>

          {/* Video Preview Scrubber */}
          {videoPreviewUrl && (
            <div className="relative rounded-md bg-black aspect-video max-h-60 mx-auto overflow-hidden border border-black/10 dark:border-white/10">
              <video
                ref={videoRef}
                src={videoPreviewUrl}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlayback}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
              />

              <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between text-white text-xs font-mono">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlayback}
                    className="p-1 hover:text-zinc-300 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </button>
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="p-1 hover:text-zinc-300 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-[11px] text-zinc-300">
                    {formatSeconds(currentTime)} / {formatSeconds(duration)}
                  </span>
                </div>

                <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                  Target: CRF {selectedCrf}
                </span>
              </div>
            </div>
          )}

          {/* Action Row */}
          {isUploading ? (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-mono text-zinc-500 dark:text-zinc-400">
                <span>Streaming upload to cluster...</span>
                <span className="text-zinc-900 dark:text-white font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <motion.div
                  className="h-full bg-zinc-900 dark:bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ ease: "easeInOut" }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-1">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleStartUpload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm"
              >
                <span>Enqueue Transcoding Task</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => inputRef.current?.click()}
                className="px-3 py-2.5 rounded-md border border-black/10 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                Change File
              </motion.button>
            </div>
          )}
        </div>
      )}

      {/* Error Notice */}
      {displayError && (
        <div className="p-3 rounded-md border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}
