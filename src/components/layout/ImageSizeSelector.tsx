"use client";

import { useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import {
  AspectRatio,
  AspectType,
  useHeaderSettings,
} from "@/app/context/HeaderContext";

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
  } = useHeaderSettings();

  //console.log(ratio);

  // Optional: Update slider midpoint when aspect changes
  useEffect(() => {
    const aspect = aspectOptions.find((a) => a.value === selected);
    if (aspect) {
      const [min, max] = aspect.range;
      const midpoint = Math.round((min + max) / 2);
      setSize(midpoint);
    }
  }, [selected]);

  const selectedAspect = aspectOptions.find((a) => a.value === selected);

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-end gap-4 mb-0 items-center">
        <h4 className="text-md mr-35 font-semibold text-gray-700">
          Image Size
        </h4>
        <button
          type="button"
          onClick={() => {
            setAspect("portrait");
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
          {/* Back box - dashed */}
          <div
            className={`absolute  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                  border border-dashed w-17 h-25 rounded-md z-0 ${
                    selected === "portrait" ? "border-black" : "border-gray-400"
                  }`}
          />

          {/* Front box - solid */}
          <div
            className={`relative z-10 w-30 h-16 rounded-md flex items-center justify-center text-xs font-medium 
                ${
                  selected === "portrait"
                    ? "border border-gray-400 text-gray-500"
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

          {/* Slider + Floating label on hover */}
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
    </div>
  );
}
