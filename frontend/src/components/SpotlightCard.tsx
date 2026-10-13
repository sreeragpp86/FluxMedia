"use client";

import React, { useRef, useState, MouseEvent } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColorDark?: string;
  spotlightColorLight?: string;
}

export function SpotlightCard({
  children,
  className = "",
  spotlightColorDark = "rgba(255, 255, 255, 0.06)",
  spotlightColorLight = "rgba(0, 0, 0, 0.04)",
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-lg border border-black/5 dark:border-white/10 bg-white dark:bg-[#121214] transition-colors duration-200 ${className}`}
    >
      {/* Light mode cursor spotlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 dark:hidden"
        style={{
          opacity: isHovered ? 1 : 0,
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              ${spotlightColorLight},
              transparent 80%
            )
          `,
        }}
      />

      {/* Dark mode cursor spotlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 hidden dark:block"
        style={{
          opacity: isHovered ? 1 : 0,
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              ${spotlightColorDark},
              transparent 80%
            )
          `,
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
