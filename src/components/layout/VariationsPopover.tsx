"use client";
import {
  ImageVariationType,
  useHeaderSettings,
} from "@/app/context/HeaderContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Grid2x2, SquareDot, Videotape } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import TooltipButton from "./button/TooltipButton";

const variations = [
  { value: "4", label: "4", icon: <Grid2x2 className="size-6" /> },
  { value: "2", label: "2", icon: <Videotape className="size-6" /> },
  { value: "1", label: "1", icon: <SquareDot className="size-6" /> },
];

export default function VariationsPopover() {
  const { variation, setVariation } = useHeaderSettings();
  const [open, setOpen] = useState(false);

  const selected =
    variations.find((r) => r.value === variation) ||
    variations.find((r) => r.value === "1")!;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <TooltipButton
          tooltipText="Variations"
          onClick={() => setOpen(!open)}
          icon={selected.icon}
          iconLabel={selected.label}
        />
      </PopoverTrigger>
      <PopoverContent className="w-3xs p-2">
        <div className="p-2 pb-0  text-gray-500 ">Variations</div>
        <div className="flex flex-col gap-2 mt-2">
          {variations.map((opt) => (
            <Button
              variant={"ghost"}
              key={opt.value}
              className={`flex items-center justify-between px-3 py-2 text-base   rounded-lg
                ${
                  variation === opt.value
                    ? "bg-[#f5f5f5] dark:bg-[#404040]/60"
                    : ""
                }`}
              onClick={() => {
                setVariation(opt.value as ImageVariationType);
                setOpen(false);
              }}
              type="button"
            >
              <span className="flex items-center gap-2">
                <span className="rounded w-5 h-5 flex items-center justify-center">
                  {opt.icon}
                </span>
                {opt.label} {opt.value === "1" ? "image" : "images"}
              </span>
              <span className="flex items-center">
                <span
                  className={`w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center 
                  ${variation === opt.value ? "border-black" : ""}`}
                >
                  {variation === opt.value && (
                    <span className="block w-2 h-2 bg-black rounded-full" />
                  )}
                </span>
              </span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
