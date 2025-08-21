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

  // Inside your EditModal component
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleSubmit = () => {
    canvasRef.current?.getDataURLFromMask();
    console.log("🖼️ Original image:", imgSrc);
    console.log("📝 Prompt:", prompt);
    setEditing(false);
    onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex mt-6 justify-center">
      <button
        type="button"
        title="btn-close"
        onClick={onClose}
        className={`absolute top-2 left-4 ${closeButtonStyles}`}
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
              className={`${buttonBaseStyles} `}
            >
              <Undo2 className={`${iconBaseStyles}`} />
            </button>
            <button
              type="button"
              title="Redo"
              onClick={() => canvasRef.current?.redo()}
              className={`${buttonBaseStyles} `}
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
              className={`${buttonBaseStyles} `}
            >
              <ThumbsUp className={`${iconBaseStyles}`} />
            </button>
            <button
              type="button"
              title="Edit (draw)"
              onClick={() => setEditing(!editing)}
              className={`${buttonBaseStyles} `}
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
              className={textButtonStyles}
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
              className={`${buttonBaseStyles}`}
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
        {!imageLoaded && (
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
            className="text-2xl text-center flex items-center justify-center mr-2 text-foreground border border-muted-foreground rounded-full w-8 h-8 flex-shrink-0"
          >
            <Plus />
          </button>
          <textarea
            ref={textareaRef}
            placeholder="Describe lo que quieres añadir, quitar o sustituir…"
            value={prompt}
            onChange={handlePromptChange}
            className="bg-transparent outline-none text-foreground flex-1 placeholder:text-muted-foreground placeholder:pt-2.5 text-md resize-none py-2 "
          />
          <button
            type="button"
            title="."
            onClick={handleSubmit}
            className="text-background bg-primary rounded-full w-8 h-8 flex justify-center items-center hover:bg-primary/90 flex-shrink-0"
          >
            <ArrowUp />
          </button>
        </div>
      </div>
    </div>
  );
}
