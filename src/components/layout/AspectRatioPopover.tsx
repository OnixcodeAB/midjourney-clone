"use client";
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
import { GalleryHorizontal, GalleryVertical, Square } from "lucide-react";
import { useState } from "react";

const aspectRatios = [
  { value: "3:2", label: "3:2", icon: <GalleryVertical size={20} /> },
  { value: "1:1", label: "1:1", icon: <Square size={20} /> },
  {
    value: "2:3",
    label: "2:3",
    icon: <GalleryHorizontal size={20} />,
  },
];

export default function AspectRatioPopover() {
  const { aspect, setAspect } = useHeaderSettings();
  const [open, setOpen] = useState(false);

  const selected =
    aspectRatios.find((r) => r.value === aspect) ||
    aspectRatios.find((r) => r.value === "1:1")!;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="aspect ratio"
          className="flex gap-1 items-center px-2 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-black text-sm"
        >
          {/* Dynamic icon */}
          {selected.icon}
          {selected.label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-xs p-2">
        <div className="p-2 pb-0 text-xs text-gray-500 font-semibold">
          Aspect ratio
        </div>
        <div className="flex flex-col gap-2 mt-2">
          {aspectRatios.map((opt) => (
            <button
              key={opt.value}
              className={`flex items-center justify-between px-3 py-2 text-base hover:bg-gray-200 focus:bg-gray-100 rounded-lg
                ${aspect === opt.value ? "bg-gray-100 font-semibold" : ""}`}
              onClick={() => {
                setAspect(opt.value as AspectType);
                setOpen(false);
              }}
              type="button"
            >
              <span className="flex items-center gap-2">
                <span className="rounded w-5 h-5 flex items-center justify-center">
                  {opt.icon}
                </span>
                {opt.label}
              </span>
              <span className="flex items-center">
                <span
                  className={`w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center 
                  ${aspect === opt.value ? "border-black" : ""}`}
                >
                  {aspect === opt.value && (
                    <span className="block w-2 h-2 bg-black rounded-full" />
                  )}
                </span>
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
