"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { usePrompt } from "@/app/context/PromptContext";
import { useHeaderSettings } from "@/app/context/HeaderContext";
import { useDropzone } from "react-dropzone";
import { MoveUp, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import ImageSettingsPopover from "./Popover/ImageSettingsPopover";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { BannerModal } from "./Modals/BannerModal";
import { useUser } from "@clerk/nextjs";
import { checkOnboardingStatus } from "@/app/actions/db/checkOnboardingStatus";
import { generateImageAndSave } from "@/app/actions/openAI/generateImageAndSaveV3";
import PresetPopover from "./Popover/PresetPopover";
import HelpPopover from "./Popover/helpPopoever";
import TooltipButton from "./Button/TooltipButton";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import VariationsPopover from "./Popover/VariationsPopover";

export default function Header() {
  const [isEditing, setIsEditing] = useState(false);
  const { prompt, setPrompt } = usePrompt();
  const { ratio, quality } = useHeaderSettings();

  const pathname = usePathname();

  // Multi-image support
  const [previews, setPreviews] = useState<string[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const { getRootProps, getInputProps, open } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    noClick: true,
    noKeyboard: true,
    maxFiles: 10, // Adjust as needed
    onDrop: (files) => {
      const urls = files.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...urls]);
      setFileNames((prev) => [...prev, ...files.map((f) => f.name)]);
    },
  });

  const router = useRouter();
  const { user } = useUser();

  // Cleanup all blob URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
      });
    };
  }, [previews]);

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      if (
        e.dataTransfer?.types.includes("Files") ||
        e.dataTransfer?.types.includes("text/plain")
      ) {
        setIsDraggingFile(true);
      }
    };
    const handleDrop = () => setIsDraggingFile(false);
    const handleDragLeave = (e: DragEvent) => {
      if (e.relatedTarget === null) setIsDraggingFile(false);
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("drop", handleDrop);
    window.addEventListener("dragleave", handleDragLeave);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("dragleave", handleDragLeave);
    };
  }, []);

  const handleOnboarding = async () => {
    const onboarded = await checkOnboardingStatus(user?.id as string);
    if (!onboarded) setIsEditing(true);
  };

  const handleDropCapture = (e: React.DragEvent) => {
    const text = e.dataTransfer.getData("text/plain");
    if (text.startsWith("http")) {
      setPreviews((prev) => [...prev, text]);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Prompt required", {
        description: "Please enter some text before generating an image.",
      });
      return;
    }
    const originalPrompt = prompt;
    setPrompt("");
    const promise = generateImageAndSave({
      prompt,
      aspect: ratio || undefined,
      quality,
      // You can also pass previews here if needed for your logic
    });
    router.push("/create");
    const result = await promise;
    if (!result?.success) {
      setPrompt(originalPrompt);
      toast.error("Generation failed", {
        description: `${result?.error || "Try again later"}`,
      });
    }
  };

  if (
    pathname !== "/" &&
    pathname !== "/create" &&
    pathname !== "/create" &&
    !pathname.startsWith("/folder")
  )
    return null;
  if (!user?.id) return null; // Ensure user is authenticated

  return (
    <header
      className={`sticky inset-0 bottom-4 z-0 w-full flex flex-col items-center pb-2 ${
        isDraggingFile ? "border-blue-500" : "border-transparent"
      }`}
      onDropCapture={handleDropCapture}
    >
      <div className="flex flex-col items-center w-full h-fit max-w-3xl rounded-2xl border-2 px-4 py-2 gap-3 shadow-lg bg-white dark:bg-[#0a0a0a] ">
        {/* Upload image button & preview */}
        <div {...getRootProps()} className="flex items-start gap-2">
          {/* Image previews */}
          {previews.length > 0 &&
            previews.map((url, idx) => (
              <div key={url} className="relative">
                <img
                  src={url}
                  alt={`preview-${idx}`}
                  className="w-20 h-auto object-cover rounded-lg border"
                />
                <button
                  className="absolute top-1 right-1 rounded-full p-1 bg-white hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                  type="button"
                  title="Remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviews((pre) => pre.filter((_, i) => i !== idx));
                    setFileNames((names) => names.filter((_, i) => i !== idx));
                  }}
                >
                  <Trash2 className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}
          {/* Upload button if no previews */}

          <input {...getInputProps()} className="hidden" />
        </div>

        <div className="w-full flex items-center gap-2">
          {/* Upload button */}
          <Button
            type="button"
            variant="outline"
            className="p-[3px] rounded-lg cursor-pointer "
            onClick={open}
            title="Add images"
          >
            <Plus className="w-5 h-5 " />
          </Button>
          {/* Prompt input */}
          <Textarea
            className="border-none break-all pt-4 leading-4 outline-none bg-transparent text-base  placeholder:text-gray-400 placeholder:pt-1 resize-none "
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onClick={handleOnboarding}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleGenerate();
              }
            }}
            placeholder="Describe your image..."
          />
          {/* Buttons for aspect ratio / format / settings */}
        </div>
        <div className="w-full flex justify-between gap-4 mx-2">
          {/* Example: 1:1, 1v, settings, etc. */}
          <div className="flex gap-4">
            <ImageSettingsPopover />

            <VariationsPopover />

            <PresetPopover />
            {/* Remix/Generate Button */}
            <HelpPopover />
          </div>

          <TooltipButton
            tooltipText="Generate"
            onClick={handleGenerate}
            icon={<MoveUp className="text-black dark:text-white" size={20} />}
          >
            {/* "" */}
          </TooltipButton>
        </div>
      </div>

      <BannerModal isOpen={isEditing} onClose={() => setIsEditing(false)} />
    </header>
  );
}
