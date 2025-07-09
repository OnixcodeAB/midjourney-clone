"use client";

import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import {
  AspectRatio,
  AspectType,
  useHeaderSettings,
} from "@/app/context/HeaderContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import TooltipButton from "./button/TooltipButton";
import { SlidersHorizontal } from "lucide-react";
import { RatioBox } from "./Ratiobox";
import { AspectSelector } from "./AspectSelector";

// Quality options
const QUALITY_OPTIONS = [
  { label: "Low", value: "low", description: "Fastest, 1024x1024 only" },
  { label: "Medium", value: "medium", description: "Best for most uses" },
  { label: "High", value: "high", description: "Highest quality, slower" },
];

const aspectOptions: {
  label: string;
  value: AspectType;
  ratio: AspectRatio;
}[] = [
  { label: "Portrait", value: "1:1", ratio: "1024x1536" },
  { label: "Square", value: "2:3", ratio: "1024x1024" },
  { label: "Landscape", value: "3:2", ratio: "1536x1024" },
];

export default function ImageSizeSelector() {
  const [open, setOpen] = useState(false);
  const {
    aspect: selected,
    setAspect,
    size: sliderValue,
    setSize,
    ratio,
    setRatio,
    quality: selectedQuality,
    setQuality, // Uncomment if you want to use the context for quality
    // Add these to context if desired:
    // quality, setQuality
  } = useHeaderSettings();

  // Use local state for quality for now

  const handleAspectSelect = (opt: (typeof aspectOptions)[0]) => {
    setAspect(opt.value as AspectType);
    setRatio(opt.ratio as AspectRatio);
  };

  const selectedAspect =
    aspectOptions.find((a) => a.value === selected) || aspectOptions[2];

  console.log("ratio", ratio, "selectedAspect", selectedAspect.ratio);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <TooltipButton
          tooltipText="Image settings"
          onClick={() => setOpen(!open)}
          icon={<SlidersHorizontal className="size-5" />}
        />
      </PopoverTrigger>
      <PopoverContent className="w-fit">
        <div className="p-1.5 space-y-4">
          {/* Quality Selector */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 dark:text-white mb-2">
              Select Quality
            </h4>
            <div className="flex justify-center gap-10 mb-4">
              {QUALITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setQuality(opt.value as QualityType);
                  }}
                  className={`px-4 py-2 rounded-md text-sm border transition
                ${
                  selectedQuality === opt.value
                    ? "bg-red-100 text-red-500 border-red-300 font-semibold"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
                  title={opt.description}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Existing Image Size Controls */}
          <div className="flex justify-between gap-4 py-3 mb-1 items-center">
            <h4 className="text-md mr-35 font-semibold text-gray-700 dark:text-white">
              Select Image Size
            </h4>
            <button
              type="button"
              onClick={() => {
                setAspect("3:2");
                setSize(80);
                setRatio("1536x1024");
              }}
              className="text-md text-gray-400 border border-white px-4 py-2 rounded-sm cursor-pointer hover:bg-red-100 hover:text-red-500 hover:border-red-300"
            >
              Reset
            </button>
          </div>

          <div className="flex items-center gap-6">
            {/* 1) Aspect Options */}
            <AspectSelector
              options={aspectOptions}
              currentValue={selected}
              sliderValue={sliderValue}
              onSelect={handleAspectSelect}
            />
          </div>
          {/* Done Button - Bottom Right */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={
                `px-4 py-1.5 rounded-md mt-1 font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 ` +
                `bg-red-100 text-red-600 hover:bg-red-200 focus:ring-red-300 ` +
                `dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700 dark:focus:ring-red-500`
              }
            >
              Done
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
