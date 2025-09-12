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
import { calculateAspectRatio } from "@/lib/const";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  imgSrc: string;
  alt: string;
}

export default function EditModal({ isOpen, onClose, imgSrc, alt }: Props) {
  const canvasRef = useRef<CanvasDrawRef>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [editing, setEditing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [numRows, setNumRows] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 }); // Store original image dimensions

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
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

      // Store the natural dimensions of the original image
      setNaturalSize({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
    }
  }, [imageLoaded]);

  useEffect(() => {
    if (editing) {
      canvasRef.current?.toggleDrawing();
    }
  }, [editing]);

  const handleSubmit = async () => {
    if (!canvasRef.current || !imgSrc || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Get the canvas data URL with the original image dimensions
      const maskUrl = canvasRef.current.getDataURLFromMask(
        naturalSize.width,
        naturalSize.height
      );

      if (!maskUrl) {
        console.error("No mask URL available");
        setIsSubmitting(false);
        return;
      }

      // Calculate aspect ratio from the original image
      const aspect = calculateAspectRatio(
        naturalSize.width,
        naturalSize.height
      );

      const result = await ImagenCreation({
        prompt: prompt,
        mode: "edit",
        baseImageUrl: imgSrc,
        maskUrl: maskUrl,
        aspect: aspect,
      });

      if (result.success) {
        console.log("Image created successfully:", result.image);
        onClose();
      } else {
        console.error("Image creation failed:", result.error);
      }
    } catch (err) {
      console.error("An unexpected error occurred:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePromptChange = (e: any) => {
    const text = e.target.value;
    setPrompt(text);
    const newRows = text.split("\n").length;
    setNumRows(Math.max(1, Math.min(6, newRows)));
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
        disabled={isSubmitting}
        className={`absolute top-2 left-4 ${closeButtonStyles} ${
          isSubmitting ? disabledStyles : ""
        }`}
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
              disabled={isSubmitting}
              className={`${buttonBaseStyles} ${
                isSubmitting ? disabledStyles : ""
              }`}
            >
              <Undo2 className={`${iconBaseStyles}`} />
            </button>
            <button
              type="button"
              title="Redo"
              onClick={() => canvasRef.current?.redo()}
              disabled={isSubmitting}
              className={`${buttonBaseStyles} ${
                isSubmitting ? disabledStyles : ""
              }`}
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
              disabled={isSubmitting}
              className={`${buttonBaseStyles} ${
                isSubmitting ? disabledStyles : ""
              }`}
            >
              <ThumbsUp className={`${iconBaseStyles}`} />
            </button>
            <button
              type="button"
              title="Edit (draw)"
              onClick={() => setEditing(!editing)}
              disabled={isSubmitting}
              className={`${buttonBaseStyles} ${
                isSubmitting ? disabledStyles : ""
              }`}
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
              disabled={isSubmitting}
              className={`${textButtonStyles} ${
                isSubmitting ? disabledStyles : ""
              }`}
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
              disabled={isSubmitting}
              className={`${buttonBaseStyles} ${
                isSubmitting ? disabledStyles : ""
              }`}
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
        {(!imageLoaded || isSubmitting) && (
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
            originalWidth={naturalSize.width} // Pass original dimensions to CanvasDraw
            originalHeight={naturalSize.height}
            getDataURL={(url) => console.log("🎯 Mask URL:", url)}
            onDraw={() => console.log("🖌️ Draw event")}
            onUndo={() => console.log("↩️ Undo")}
            onRedo={() => console.log("↪️ Redo")}
          />
        )}
      </div>

      {/* Input area for prompt and submit button */}
      <div className="absolute bottom-6 min-w-4xl flex flex-col bg-accent rounded-xl px-4 py-2 shadow-md border border-border">
        <div className="flex items-center w-full">
          <button
            type="button"
            title="."
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="text-2xl text-center flex items-center justify-center mr-2 text-foreground border border-muted-foreground rounded-full w-8 h-8 flex-shrink-0"
          >
            {isSubmitting ? (
              <Loader className="animate-spin size-4" />
            ) : (
              <Plus />
            )}
          </button>
          <textarea
            ref={textareaRef}
            placeholder="Describe lo que quieres añadir, quitar o sustituir…"
            value={prompt}
            onChange={handlePromptChange}
            disabled={isSubmitting}
            className="bg-transparent outline-none text-foreground flex-1 placeholder:text-muted-foreground placeholder:pt-0 text-md resize-none pt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            title="Submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !prompt.trim()}
            className={`${submitButtonStyles} ${
              isSubmitting || !prompt.trim()
                ? "opacity-50 cursor-not-allowed hover:bg-primary"
                : ""
            }`}
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
