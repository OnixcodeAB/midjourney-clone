"use client";

import React from "react";

interface DonutLoaderProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  darkColor?: string;
  spin?: boolean;
}

export const DonutLoader: React.FC<DonutLoaderProps> = ({
  progress,
  size = 50,
  strokeWidth = 4,
  color = "blue",
  darkColor = "var(--primary)",
  spin = false,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div
      className="relative inline-block"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className={spin ? "animate-spin" : ""}
        style={{ display: "block" }} // Prevent layout shifts
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          fill="none"
          strokeWidth={strokeWidth}
          className="dark:stroke-[var(--secondary)]"
        />

        {/* Progress Circle - No transform here */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`dark:stroke-[${darkColor}]`}
        />
      </svg>

      {/* Percentage Text - Now absolutely positioned */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-[var(--foreground)] dark:text-[var(--dark-foreground)]">
          {Math.round(progress * 100)}%
        </span>
      </div>
    </div>
  );
};
