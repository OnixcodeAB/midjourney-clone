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
import { ImagenCreation } from "@/app/actions/openAI/generateImagenV4";
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
    //Infer scenario
    const refs = (fileNames ?? []).filter(Boolean)
    
    let mode: "generate" | "reference" | "edit" = "generate";

    const originalPrompt = prompt;
    setPrompt("");
    //console.log({ prompt, ratio, quality, previews });
    const { success, error } = await ImagenCreation({
      prompt,
      aspect: ratio || undefined,
      quality,
      mode: "generate",
      imageRefs: fileNames.length > 0 ? fileNames : undefined, // Pass file names for uploads
    });

    router.push("/create");
    if (!success) {
      setPrompt(originalPrompt);
      toast.error("Generation failed", {
        description: `${error || "Try again later"}`,
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
      className={`hidden sticky inset-0 bottom-4 z-0 w-3xl left-[35%] lg:flex flex-col items-center bg-transparent ${
        isDraggingFile ? "" : "border-transparent"
      }`}
      onDropCapture={handleDropCapture}
    >
      {/* Parent */}
      <div
        className={`w-full rounded-lg  bg-card shadow-md flex flex-col items-center p-1 gap-4 ${
          isDraggingFile
            ? "animate-rotate-border card-wrapper"
            : "border-border border-solid border-2"
        }`}
      >
        {/* Content */}
        <div className={`w-full p-4 rounded-lg bg-card text-center`}>
          <div className="w-full flex flex-col gap-2 ">
            {/* Upload image button & preview */}
            <div {...getRootProps()} className="flex ml-12 gap-2">
              {/* Image previews */}
              {previews.length > 0 &&
                previews.map((url, idx) => (
                  <div key={url} className="relative">
                    <img
                      src={url}
                      alt={`preview-${idx}`}
                      className="w-20 h-auto object-cover rounded-lg border border-border"
                    />
                    <button
                      className="absolute top-1 right-1 rounded-full p-1 bg-background hover:bg-accent"
                      type="button"
                      title="Remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviews((pre) => pre.filter((_, i) => i !== idx));
                        setFileNames((names) =>
                          names.filter((_, i) => i !== idx)
                        );
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              {/* Upload button if no previews */}

              <input {...getInputProps()} className="hidden" />
            </div>

            <div className="w-full flex items-center gap-2 pb-1">
              {/* Upload button */}
              <Button
                type="button"
                variant="outline"
                className="p-[3px] rounded-lg cursor-pointer border-border hover:bg-accent"
                onClick={open}
                title="Add images"
              >
                <Plus className="w-5 h-5 text-foreground" />
              </Button>
              {/* Prompt input */}
              <Textarea
                className="border-none break-all pt-4 leading-4 outline-none bg-transparent text-base  placeholder:text-muted-foreground placeholder:pt-1 resize-none text-foreground"
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
            <div className="w-full flex justify-between gap-4 px-1">
              {/* Example: 1:1, 1v, settings, etc. */}
              <div className="flex gap-4">
                <ImageSettingsPopover />

                <VariationsPopover />

                {/* <PresetPopover /> */}
                {/* Remix/Generate Button */}
                <HelpPopover />
              </div>

              <TooltipButton
                tooltipText="Generate"
                onClick={handleGenerate}
                icon={<MoveUp className="text-primary" size={20} />}
              >
                {/* "" */}
              </TooltipButton>
            </div>
          </div>
        </div>
      </div>

      <BannerModal isOpen={isEditing} onClose={() => setIsEditing(false)} />
    </header>
  );
}
