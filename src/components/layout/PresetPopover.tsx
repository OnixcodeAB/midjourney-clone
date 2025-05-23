"use client";
import { useState } from "react";
import { BookText, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Example preset data, you can extend/replace these:
const presets = [
  { value: "none", label: "None", icon: <X className="w-5 h-5" /> },
  {
    value: "archival-v0",
    label: "Archival v0",
    icon: <BookText className="w-5 h-5" />,
  },
  {
    value: "film-noir-v0",
    label: "Film Noir v0",
    icon: <BookText className="w-5 h-5" />,
  },
  {
    value: "cardboard-papercraft-v0",
    label: "Cardboard & Papercraft v0",
    icon: <BookText className="w-5 h-5" />,
  },
  {
    value: "whimsical-stop-motion-v0",
    label: "Whimsical Stop Motion v0",
    icon: <BookText className="w-5 h-5" />,
  },
  {
    value: "balloon-world-v1",
    label: "Balloon World v1",
    icon: <BookText className="w-5 h-5" />,
  },
  {
    value: "superbowl-com-v0",
    label: "OpenAI Superbowl Com...",
    icon: <BookText className="w-5 h-5" />,
  },
  {
    value: "cartoonify-v0",
    label: "Cartoonify by Sora v0",
    icon: <BookText className="w-5 h-5" />,
  },
];

export default function PresetPopover() {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<string>("none");

  const selected = presets.find((p) => p.value === preset) || presets[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Presets"
          className="flex gap-1 items-center p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-sm"
        >
          <BookText className="w-5 h-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0">
        <div className="flex justify-between items-center px-4 pt-2 pb-1">
          <span className="text-xs text-gray-500 font-semibold">Presets</span>
          <button
            className="text-xs text-blue-500 hover:underline"
            tabIndex={-1}
            // Add handler if you want a manage dialog
          >
            Manage
          </button>
        </div>
        <div className="flex flex-col">
          {presets.map((opt) => (
            <button
              key={opt.value}
              className={`
                flex items-center justify-between px-3 py-2 text-base 
                hover:bg-gray-100 focus:bg-gray-100
                ${preset === opt.value ? "bg-gray-100 font-semibold" : ""}
              `}
              onClick={() => {
                setPreset(opt.value);
                setOpen(false);
              }}
              type="button"
            >
              <span className="flex items-center gap-2">
                <span className="">{opt.icon}</span>
                {opt.label}
              </span>
              <span className="flex items-center">
                <span
                  className={`w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center 
                  ${preset === opt.value ? "border-black" : ""}`}
                >
                  {preset === opt.value && (
                    <span className="block w-2 h-2 bg-black rounded-full" />
                  )}
                </span>
              </span>
            </button>
          ))}
        </div>
        {/* Add a down-chevron for more (optional) */}
        <div className="flex justify-center py-1">
          <span className="w-5 h-5 text-gray-400">&#x25BC;</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
