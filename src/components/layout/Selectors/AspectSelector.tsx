// components/AspectSelector.tsx
import React from "react";
import { AspectType, AspectRatio } from "@/app/context/HeaderContext";
import { RatioBox } from "./Ratiobox";

type AspectOption = {
  label: string;
  value: AspectType;
  ratio: AspectRatio;
};

interface AspectSelectorProps {
  options: AspectOption[];
  currentValue: AspectType;
  sliderValue: number;
  onSelect: (opt: AspectOption) => void;
}

export function AspectSelector({
  options,
  currentValue,
  onSelect,
}: AspectSelectorProps) {
  return (
    <div className="  pl-8 grid grid-cols-3 gap-4">
      {options.map((opt) => {
        const isActive = opt.value === currentValue;
        return (
          <button
            key={opt.value}
            onClick={() => onSelect(opt)}
            type="button"
            aria-label="aspect ratio"
            className={`
              p-1 rounded-lg transition-all
              ${
                isActive
                  ? "ring-2 ring-red-500 dark:ring-red-400"
                  : "ring-1 ring-gray-200 dark:ring-gray-600 hover:ring-gray-300 dark:hover:ring-gray-500"
              }
            `}
          >
            <RatioBox ratio={opt.ratio} isActive={isActive} />
            <span className="sr-only">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
