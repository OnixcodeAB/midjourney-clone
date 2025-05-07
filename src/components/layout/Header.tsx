"use client";
import { useEffect, useState } from "react";
import { usePrompt } from "@/app/context/PromptContext";
import { useHeaderSettings } from "@/app/context/HeaderContext";
import { useDropzone } from "react-dropzone";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Image, Lock, SlidersHorizontal, Trash2 } from "lucide-react";
import ImageSizeSelector from "./ImageSizeSelector";
import { generateImageAndSave } from "@/app/actions/generateImageSora";
import { useRouter } from "next/navigation";
import { BannerModal } from "./BannerModal";
import { useUser } from "@clerk/nextjs";
import { Textarea } from "../ui/textarea";
import { checkOnboardingStatus } from "@/app/actions/checkOnboardingStatus";
import { on } from "events";

export default function Header() {
  const [isEditing, setIsEditing] = useState(false);
  const { prompt, setPrompt } = usePrompt();
  const { ratio } = useHeaderSettings();
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const { getRootProps, getInputProps, open } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    noClick: true,
    noKeyboard: true,
    maxFiles: 1,
    onDrop: (files) => {
      const file = files[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
        setFileName(file.name);
      }
    },
  });

  const router = useRouter();
  const { user } = useUser();

  // cleanup preview
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

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
    console.log(onboarded)
    if (!onboarded) {
      setIsEditing(true);
    } else {
      return;
    }
  };

  const handleDropCapture = (e: React.DragEvent) => {
    const text = e.dataTransfer.getData("text/plain");
    if (text.startsWith("http")) {
      setPreview(text); // handle image dropped from grid
    }
  };

  const handleGenerate = async () => {
    // Don't allow empty prompt
    if (!prompt.trim()) {
      toast.error("Prompt required", {
        description: "Please enter some text before generating an image.",
      });
      return;
    }

    const originalPrompt = prompt;

    // Optimistically clear the prompt
    setPrompt("");

    // 1) Kick off the server action (don’t await it yet)
    const promise = generateImageAndSave({
      prompt,
      aspect: ratio,
    });

    // 2) Immediately navigate to /create
    router.push("/create");

    // 3) Now await your save; if it fails, restore the prompt
    const result = await promise;
    if (!result?.success) {
      setPrompt(originalPrompt);
      toast.error("Generation failed", {
        description: "Something went wrong—please try again later.",
      });
    }
  };

  return (
    <header
      className={`sticky inset-0 z-50 bg-[#fcfcfd] flex flex-col items-start top-2 border-2 rounded-lg px-3 mx-2 py-1 shadow-lg transition-colors duration-300 ${
        isDraggingFile ? "border-blue-500" : "border-gray-200"
      }`}
      onDropCapture={handleDropCapture}
    >
      <div
        {...getRootProps()}
        className={`relative w-full flex items-center ${
          prompt.trim() ? "" : "h-10"
        }`}
      >
        <Image className="text-gray-400 size-6 cursor-pointer" onClick={open} />
        <input {...getInputProps()} className="hidden" />

        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onClick={() => {
            handleOnboarding();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleGenerate();
            }
          }}
          className={`resize-none w-full  leading-10  border-none outline-none focus:outline-none focus-visible:ring-0 placeholder:text-[15px] placeholder:text-gray-400 ${
            prompt.trim() ? "max-h-35" : ""
          }`}
          placeholder="Log in to start creating.."
        />

        <Popover modal>
          <PopoverTrigger>
            <SlidersHorizontal className="text-gray-400 size-6 cursor-pointer" />
          </PopoverTrigger>
          <PopoverContent>
            <ImageSizeSelector />
          </PopoverContent>
        </Popover>
      </div>

      {/* Thumbnail preview */}
      {preview && (
        <div className="w-full mt-2 ml-1 flex item-start justify-between gap-2 py-2 bg-[#fcfcfd]">
          <img
            src={preview}
            alt="preview"
            className="w-20 h-20 object-cover rounded-md border"
          />
          <div className="flex flex-col gap-2 text-gray-400">
            <button
              type="button"
              aria-label="btn-preview-lock"
              className="btn-preview"
            >
              <Lock className="size-5 " />
            </button>
            <button
              type="reset"
              aria-label="btn-preview-reset"
              className="btn-preview"
            >
              <Trash2 className="size-5" onClick={() => setPreview(null)} />
            </button>
          </div>
        </div>
      )}
      <BannerModal
        isOpen={isEditing}
        onClose={() => {
          setIsEditing(false);
        }}
      />
    </header>
  );
}
