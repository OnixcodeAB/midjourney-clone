"use client";
import { useState } from "react";
import { BookText, CircleHelp, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

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

export default function HelpPopover() {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<string>("none");

  const selected = presets.find((p) => p.value === preset) || presets[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={"outline"}
          aria-label="Presets"
          className="  rounded-full "
        >
          <CircleHelp className="w-5! h-5! text-black dark:text-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2">
        <div className="px-1 pt-2 pb-1">
          <h1 className="text-[13px] font-semibold mb-2">Text to Image</h1>
          <p className="text-xs">
            Generate an image by uploading a reference or describing it with
            text. The less detail you provide, the more creative freedom the AI
            has. The more you describe, the closer the result will match your
            vision.
          </p>
          <h1 className="text-[13px] font-semibold my-2">Advanced Control</h1>
          <p className="text-xs">
            For finer adjustments, use Detailed Editor to refine your image with
            precise text prompts, preset styles, and composition guides.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
