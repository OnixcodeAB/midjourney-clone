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

// Quality options
const QUALITY_OPTIONS = [
  { label: "Low", value: "low", description: "Fastest, 1024x1024 only" },
  { label: "Medium", value: "medium", description: "Best for most uses" },
  { label: "High", value: "high", description: "Highest quality, slower" },
];

const aspectOptions = [
  { label: "Portrait", value: "portrait", ratio: "1024x1536", range: [0, 40] },
  { label: "Square", value: "square", ratio: "1024x1024", range: [41, 60] },
  {
    label: "Landscape",
    value: "landscape",
    ratio: "1536x1024",
    range: [61, 100],
  },
];

export default function ImageSizeSelector() {
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

  useEffect(() => {
    const aspect = aspectOptions.find((a) => a.value === selected);
    if (aspect) {
      const [min, max] = aspect.range;
      const midpoint = Math.round((min + max) / 2);
      setSize(midpoint);
    }
  }, [selected]);

  const selectedAspect =
    aspectOptions.find((a) => a.value === selected) || aspectOptions[2];

  console.log("ratio", ratio, "selectedAspect", selectedAspect.ratio);

  return (
    <div className="p-4 space-y-4">
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
              onClick={() => setQuality(opt.value as QualityType)}
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
      <div className="flex justify-between gap-4 mb-0 items-center">
        <h4 className="text-md mr-35 font-semibold text-gray-700 dark:text-white">
          Select Image Size
        </h4>
        <button
          type="button"
          onClick={() => {
            setAspect("3:2");
            setSize(80);
            setRatio("1024x1536");
          }}
          className="text-md text-gray-400 border border-white px-4 py-2 rounded-sm cursor-pointer hover:bg-red-100 hover:text-red-500 hover:border-red-300"
        >
          Reset
        </button>
      </div>

      <div className="flex items-center justify-between gap-6">
        {/* Ratio Box */}
        <div className="relative flex flex-col justify-center w-30 h-30">
          <div
            className={`absolute  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                  border border-dashed w-17 h-25 rounded-md z-0 ${
                    ratio === (`1024x1024` as AspectRatio)
                      ? "border-black dark:border-white"
                      : ratio === (`1024x1536` as AspectRatio)
                      ? "border-gray-400 dark:border-white"
                      : "border-gray-400 dark:border-black"
                  }`}
          />
          <div
            className={`relative z-10 w-30 h-16 rounded-md flex items-center justify-center text-xs font-medium 
                ${
                  ratio === (`1536x1024` as AspectRatio)
                    ? "border border-gray-400 dark:border-white text-gray-500 dark:text-white"
                    : "border border-black"
                }`}
          >
            {selectedAspect?.ratio}
          </div>
        </div>

        {/* Options + Slider */}
        <div className="w-full flex flex-col gap-8">
          <div className="flex gap-4 justify-around border-b border-b-gray-200">
            {aspectOptions.map((opt) => {
              const isSelected = selected === opt.value;
              const isActive =
                sliderValue >= opt.range[0] && sliderValue <= opt.range[1];

              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => {
                    setAspect(opt.value as AspectType);
                    setRatio(opt.ratio as AspectRatio);
                  }}
                  className={`text-xs rounded-md px-5 py-2 mb-2 cursor-pointer border transition
                    ${
                      isActive
                        ? "bg-red-100 text-red-500 border-red-300"
                        : isSelected
                        ? "bg-gray-100 text-gray-700 border-gray-300"
                        : "text-gray-500 border-gray-200 hover:border-gray-400"
                    }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="relative group w-full">
            <Slider
              value={[sliderValue]}
              onValueChange={(val) => setSize(val[0])}
              max={100}
              step={1}
            />
            <div
              className="absolute -top-6 left-[calc(var(--percent,50%)_-_16px)] 
                         text-xs text-gray-600 bg-white px-1 rounded-sm border border-gray-200
                         opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                transform: `translateX(${sliderValue}%`,
                left: `calc(${sliderValue}% - 14px)`,
              }}
            >
              {sliderValue}
            </div>
          </div>
        </div>
      </div>
      {/* When sending request, pass { quality } */}
    </div>
  );
}
