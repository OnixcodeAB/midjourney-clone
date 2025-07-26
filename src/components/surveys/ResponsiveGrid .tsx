"use client";
import useMediaQueries from "@/hooks/useMediaQueries";
import { useState, useEffect, useMemo } from "react";

interface BreakpointCols {
  default: number;
  small?: number; // Use optional properties as not all might be defined
  medium?: number;
  large?: number;
  xxlarge?: number; // Matches the key from useMediaQueries
}

interface ResponsiveGridProps {
  breakpointCols: BreakpointCols;
  gap?: string;
}

export const ResponsiveGrid = ({
  breakpointCols,
  gap = "16px",
}: ResponsiveGridProps) => {
  const [columns, setColumns] = useState(breakpointCols.default);
  const { small, medium, large, xxlarge } = useMediaQueries();

  useEffect(() => {
    // Determine the active breakpoint and set columns accordingly.
    // Order matters here: start from the largest breakpoint and go down.
    if (xxlarge && breakpointCols.xxlarge) {
      // Assuming 1440px for xxlarge based on your prop
      setColumns(breakpointCols.xxlarge);
    } else if (large && breakpointCols.large) {
      setColumns(breakpointCols.large);
    } else if (medium && breakpointCols.medium) {
      setColumns(breakpointCols.medium);
    } else if (small && breakpointCols.small) {
      setColumns(breakpointCols.small);
    } else {
      // If none of the specific breakpoints match, or if the smallest breakpoint
      // is not met, fall back to the default.
      setColumns(breakpointCols.default);
    }
  }, [small, medium, large, xxlarge, breakpointCols]); // Depend on media query states and breakpointCols prop

  // Memoize columnStyle to prevent unnecessary re-creations if `columns` or `gap` don't change
  const columnStyle = useMemo(
    () => ({
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: gap,
    }),
    [columns, gap]
  );
  {
    /* <div style={columnStyle}>
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        style={{
          background: "#eee",
          padding: "20px",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        Item {i + 1}
      </div>
    ))}
  </div> */
  }
  return (
    <div style={columnStyle}>
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          style={{
            background: "#eee",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          Item {i + 1}
        </div>
      ))}
    </div>
  );
};
