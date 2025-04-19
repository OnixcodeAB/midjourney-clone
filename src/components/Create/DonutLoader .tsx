"use client";

import React from "react";

interface DonutLoaderProps {
  progress: number; // Expected as a fraction from 0 to 1 (e.g., 0.644)
  size?: number; // Diameter of the donut in pixels (default: 50)
  strokeWidth?: number; // Thickness of the donut stroke (default: 4)
  color?: string; // Color for the progress stroke (default: "blue")
}

export const DonutLoader: React.FC<DonutLoaderProps> = ({
  progress,
  size = 50,
  strokeWidth = 4,
  color = "blue",
}) => {
  // Calculate the circle radius (so the stroke is fully visible)
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Calculate the offset based on progress
  const offset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} className="relative">
      {/* Background Circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#e5e7eb"
        fill="none"
        strokeWidth={strokeWidth}
      />
      {/* Progress Circle */}
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
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      {/* Percentage Text */}
      <text
        x="50%"
        y="50%"
        dy=".3em"
        textAnchor="middle"
        className="text-xs font-medium fill-current text-gray-700"
      >
        {Math.round(progress * 100)}%
      </text>
    </svg>
  );
};
