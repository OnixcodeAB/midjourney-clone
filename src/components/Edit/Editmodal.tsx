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
  const [imageLoaded, setImageLoaded] = useState(false); // Initialize to false
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

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

  if (!isOpen) return null;

  const handleSubmit = () => {
    canvasRef.current?.getDataURLFromMask();
    console.log("🖼️ Original image:", imgSrc);
    console.log("📝 Prompt:", prompt);

    // TODO: Send to backend API
    setEditing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#212121] flex items-center justify-center">
      <button
        type="button"
        title="btn-close"
        onClick={onClose}
        className="absolute top-4 left-4 text-white hover:bg-gray-400/25 rounded-sm p-1"
      >
        <X className="size-6" />
      </button>

      <div className="absolute top-6 right-4 flex items-center gap-3 text-white">
        {editing ? (
          <>
            <button
              type="button"
              title="Undo"
              onClick={() => canvasRef.current?.undo()}
              className="hover:bg-gray-400/45 p-2 rounded-sm"
            >
              <Undo2 className="size-6 text-[#e3e3e3]" />
            </button>
            <button
              type="button"
              title="Redo"
              onClick={() => canvasRef.current?.redo()}
              className="hover:bg-gray-400/45 p-2 rounded-sm"
            >
              <Redo2 className="size-6 text-[#e3e3e3]" />
            </button>

            <div className="h-6 border border-r-gray-300" />
          </>
        ) : (
          <>
            {" "}
            <button
              type="button"
              title="Like"
              className="hover:bg-gray-400/45 p-2 rounded-sm"
            >
              <ThumbsUp className="size-6 text-[#e3e3e3] " />
            </button>
            <button
              type="button"
              title="Edit (draw)"
              onClick={() => setEditing(!editing)}
              className="hover:bg-gray-400/45 p-2 rounded-sm"
            >
              <Brush
                className={`size-6 ${
                  editing ? "text-yellow-400" : "text-[#e3e3e3]"
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
              className=" text-md py-2 px-3 hover:bg-gray-400/45 rounded-md cursor-pointer"
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
              className="hover:bg-gray-400/45 hover:text-blue-400 p-2 rounded-sm"
            >
              <Download className="size-6 " />
            </button>
          </>
        )}
      </div>
      {editing && (
        <p className=" absolute top-6 text-[#e3e3e3] text-xl">
          Editar Seleccion
        </p>
      )}
      <div className="relative">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-white z-10">
            <Loader className="animate-spin size-6" />
          </div>
        )}

        <img
          src={imgSrc}
          alt={alt}
          ref={imgRef}
          onLoad={() => setImageLoaded(true)}
          className="min-w-[34rem] max-w-[90vw] max-h-[75vh] object-contain "
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

      <div className="absolute bottom-6 min-w-4xl flex items-center bg-[#303030] rounded-full px-4 py-2 shadow-md border border-white/10">
        <button
          type="button"
          title="."
          onClick={handleSubmit}
          className="text-2xl text-center flex items-center justify-center mr-2  text-white border border-[#9b9b9b]  rounded-full w-8 h-8 "
        >
          <Plus />
        </button>
        <input
          type="text"
          placeholder="Describe lo que quieres añadir, quitar o sustituir…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="bg-transparent outline-none text-white flex-1 placeholder:text-gray-400 text-md"
        />
        <button
          type="button"
          title="."
          onClick={handleSubmit}
          className="text-[[#303030]] bg-[#9b9b9b]  rounded-full w-8 h-8 flex justify-center items-center"
        >
          <ArrowUp />
        </button>
      </div>
    </div>
  );
}
