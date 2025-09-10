"use client";
import { useEffect, useRef, useState } from "react";
import CanvasDraw, { CanvasDrawRef } from "./CanvasDraw";
import {
  X,
  ThumbsUp,
  Download,
  Brush,
  Undo2,
  Redo2,
  Loader,
  Plus,
  ArrowUp,
} from "lucide-react";
import { ImagenCreation } from "@/app/actions/openAI/generateImagenV4";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  imgSrc: string;
  alt: string;
}

type AspectRatio = "1024x1024" | "1024x1536" | "1536x1024";

export default function EditModal({ isOpen, onClose, imgSrc, alt }: Props) {
  const canvasRef = useRef<CanvasDrawRef>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [editing, setEditing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [numRows, setNumRows] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission loading

  // Inside your EditModal component
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Function to calculate aspect ratio
  const calculateAspectRatio = (width: number, height: number): AspectRatio => {
    const ratio = width / height;
    
    if (ratio >= 0.9 && ratio <= 1.1) {
      return "1024x1024"; // Square or near-square
    } else if (ratio > 1.1) {
      return "1536x1024"; // Landscape (width > height)
    } else {
      return "1024x1536"; // Portrait (height > width)
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      // Reset the height to ensure scrollHeight is accurate
      textareaRef.current.style.height = "auto";
      // Set the height to the scroll height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);
  
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    if (imgRef.current && imageLoaded) {
      const { width, height } = imgRef.current.getBoundingClientRect();
      setCanvasSize({ width, height });
    }
  }, [imageLoaded]);

  useEffect(() => {
    if (editing) {
      canvasRef.current?.toggleDrawing();
    }
  }, [editing]);

  const handleSubmit = async () => {
    if (!canvasRef.current || !imgSrc || isSubmitting) return;
    
    setIsSubmitting(true); // Disable UI elements
    
    try {
      // Get the canvas data URL
      const maskUrl = canvasRef.current.getDataURLFromMask();
      if (!maskUrl) {
        console.error("No mask URL available");
        setIsSubmitting(false);
        return;
      }

      // Calculate aspect ratio from the original image
      let aspect: AspectRatio = "1024x1024"; // Default
      if (imgRef.current) {
        const naturalWidth = imgRef.current.naturalWidth;
        const naturalHeight = imgRef.current.naturalHeight;
        aspect = calculateAspectRatio(naturalWidth, naturalHeight);
      }

      const result = await ImagenCreation({
        prompt: prompt,
        mode: "edit",
        baseImageUrl: imgSrc,
        maskUrl: maskUrl,
        aspect: aspect, // Send the calculated aspect ratio
        // quality: "high", // Uncomment if needed
      });

      if (result.success) {
        console.log("Image created successfully:", result.image);
        // You can now close the modal and update your UI with the new image
        onClose();
      } else {
        console.error("Image creation failed:", result.error);
        // Handle the error, maybe show a toast or a message to the user
      }
    } catch (err) {
      console.error("An unexpected error occurred:", err);
    } finally {
      setIsSubmitting(false); // Re-enable UI elements
    }
  };

  const handlePromptChange = (e: any) => {
    const text = e.target.value;
    setPrompt(text);
    const newRows = text.split("\n").length;
    // Ensure the number of rows doesn't get too small (e.g., min 1 row)
    setNumRows(Math.max(1, Math.min(6, newRows))); // e.g., max 6 rows
  };

  // Base styles for all buttons
  const buttonBaseStyles = "p-2 rounded-sm hover:bg-accent transition-colors";
  const iconBaseStyles = "size-6 text-muted-foreground hover:text-foreground";
  const activeIconStyles = "text-primary";
  const textButtonStyles =
    "text-md py-2 px-3 bg-card hover:bg-accent border rounded-md cursor-pointer text-foreground";

  // Special button styles
  const submitButtonStyles =
    "text-background bg-primary rounded-full w-8 h-8 flex justify-center items-center hover:bg-primary/90";
  const closeButtonStyles = "text-foreground hover:bg-accent rounded-sm p-1";

  // Disabled styles
  const disabledStyles = "opacity-50 cursor-not-allowed";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex mt-6 justify-center">
      <button
        type="button"
        title="btn-close"
        onClick={onClose}
        disabled={isSubmitting} // Disable when submitting
        className={`absolute top-2 left-4 ${closeButtonStyles} ${isSubmitting ? disabledStyles : ''}`}
      >
        <X className="size-6" />
      </button>

      <div className="absolute top-2 right-4 flex items-center gap-3 text-foreground">
        {editing ? (
          <>
            <button
              type="button"
              title="Undo"
              onClick={() => canvasRef.current?.undo()}
              disabled={isSubmitting} // Disable when submitting
              className={`${buttonBaseStyles} ${isSubmitting ? disabledStyles : ''}`}
            >
              <Undo2 className={`${iconBaseStyles}`} />
            </button>
            <button
              type="button"
              title="Redo"
              onClick={() => canvasRef.current?.redo()}
              disabled={isSubmitting} // Disable when submitting
              className={`${buttonBaseStyles} ${isSubmitting ? disabledStyles : ''}`}
            >
              <Redo2 className={`${iconBaseStyles}`} />
            </button>

            <div className="h-6 border border-border" />
          </>
        ) : (
          <>
            <button
              type="button"
              title="Like"
              disabled={isSubmitting} // Disable when submitting
              className={`${buttonBaseStyles} ${isSubmitting ? disabledStyles : ''}`}
            >
              <ThumbsUp className={`${iconBaseStyles}`} />
            </button>
            <button
              type="button"
              title="Edit (draw)"
              onClick={() => setEditing(!editing)}
              disabled={isSubmitting} // Disable when submitting
              className={`${buttonBaseStyles} ${isSubmitting ? disabledStyles : ''}`}
            >
              <Brush
                className={`size-6 ${
                  editing ? activeIconStyles : iconBaseStyles
                }`}
              />
            </button>
          </>
        )}

        {editing ? (
          <>
            <button
              type="button"
              title="cancel"
              onClick={() => setEditing(!editing)}
              disabled={isSubmitting} // Disable when submitting
              className={`${textButtonStyles} ${isSubmitting ? disabledStyles : ''}`}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              title="Download"
              onClick={() => {
                const link = document.createElement("a");
                link.href = imgSrc;
                link.download = `${alt || "image"}.jpg`;
                link.click();
              }}
              disabled={isSubmitting} // Disable when submitting
              className={`${buttonBaseStyles} ${isSubmitting ? disabledStyles : ''}`}
            >
              <Download className={`${iconBaseStyles}`} />
            </button>
          </>
        )}
      </div>
      {editing && (
        <p className="absolute top-6 text-foreground text-xl">
          Editar Seleccion
        </p>
      )}
      <div className="relative">
        {(!imageLoaded || isSubmitting) && ( // Show loader during submission too
          <div className="absolute inset-0 flex items-center justify-center text-foreground z-10">
            <Loader className="animate-spin size-6" />
          </div>
        )}

        <img
          src={imgSrc}
          alt={alt}
          ref={imgRef}
          onLoad={() => setImageLoaded(true)}
          className="min-w-[34rem] max-w-[90vw] max-h-[75vh] object-contain"
        />

        {editing && imageLoaded && (
          <CanvasDraw
            ref={canvasRef}
            initialImageSrc={imgSrc}
            canvasWidth={canvasSize.width}
            canvasHeight={canvasSize.height}
            getDataURL={(url) => console.log("🎯 Mask URL:", url)}
            onDraw={() => console.log("🖌️ Draw event")}
            onUndo={() => console.log("↩️ Undo")}
            onRedo={() => console.log("↪️ Redo")}
          />
        )}
      </div>

      {/*  Input area for prompt and submit button */}
      <div className="absolute bottom-6 min-w-4xl flex flex-col bg-accent rounded-xl px-4 py-2 shadow-md border border-border">
        <div className="flex items-center w-full">
          <button
            type="button"
            title="."
            onClick={handleSubmit}
            disabled={isSubmitting} // Disable when submitting
            className="text-2xl text-center flex items-center justify-center mr-2 text-foreground border border-muted-foreground rounded-full w-8 h-8 flex-shrink-0"
          >
            {isSubmitting ? <Loader className="animate-spin size-4" /> : <Plus />}
          </button>
          <textarea
            ref={textareaRef}
            placeholder="Describe lo que quieres añadir, quitar o sustituir…"
            value={prompt}
            onChange={handlePromptChange}
            disabled={isSubmitting} // Disable when submitting
            className="bg-transparent outline-none text-foreground flex-1 placeholder:text-muted-foreground placeholder:pt-2.5 text-md resize-none py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            title="Submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !prompt.trim()} // Disable when submitting or prompt is empty
            className={`${submitButtonStyles} ${isSubmitting || !prompt.trim() ? 'opacity-50 cursor-not-allowed hover:bg-primary' : ''}`}
          >
            {isSubmitting ? (
              <Loader className="animate-spin size-4" />
            ) : (
              <ArrowUp />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}