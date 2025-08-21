import React, {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";

export type CanvasDrawProps = {
  initialImageSrc?: string;
  getDataURL?: (url: string) => void;
  onDraw?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canvasWidth?: number;
  canvasHeight?: number;
};

export type CanvasDrawRef = {
  toggleDrawing: () => void;
  toggleEraser: () => void;
  undo: () => void;
  redo: () => void;
  getDataURLFromMask: () => void;
  loadImage: (url: string) => void;
  setBrushSize: (size: number) => void;
  setBrushColor: (color: string) => void;
  setBrushOpacity: (opacity: number) => void;
};

const MAX_HISTORY = 20;
type MaskStateStack = string[];

const CanvasDraw = forwardRef<CanvasDrawRef, CanvasDrawProps>(
  (
    {
      initialImageSrc = "",
      getDataURL = () => {},
      onDraw,
      onUndo,
      onRedo,
      canvasWidth = 480,
      canvasHeight = 600,
    },
    ref
  ) => {
    const bgCanvasRef = useRef<HTMLCanvasElement>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement>(null);
    const brushCursorRef = useRef<HTMLDivElement>(null);

    const [drawingEnabled, setDrawingEnabled] = useState(false);
    const [eraserEnabled, setEraserEnabled] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);

    // Brush properties
    const brushSizeRef = useRef(80);
    const brushColorRef = useRef("#ff0000");
    const brushOpacityRef = useRef(0.6);

    // Offscreen canvas to store the mask before a new stroke
    const offscreenCanvasRef = useRef<HTMLCanvasElement>(
      document.createElement("canvas")
    );

    // For collecting the points of the current stroke
    const [currentStroke, setCurrentStroke] = useState<
      { x: number; y: number }[]
    >([]);

    // History
    const [undoStack, setUndoStack] = useState<MaskStateStack>([]);
    const [redoStack, setRedoStack] = useState<MaskStateStack>([]);

    useImperativeHandle(ref, () => ({
      toggleDrawing: () => setDrawingEnabled((prev) => !prev),
      toggleEraser: () => setEraserEnabled((prev) => !prev),
      undo,
      redo,
      getDataURLFromMask,
      loadImage,
      setBrushSize: (size) => (brushSizeRef.current = size),
      setBrushColor: (color) => (brushColorRef.current = color),
      setBrushOpacity: (opacity) => (brushOpacityRef.current = opacity),
    }));

    useEffect(() => {
      // Initialize offscreen canvas size
      offscreenCanvasRef.current.width = canvasWidth;
      offscreenCanvasRef.current.height = canvasHeight;

      if (initialImageSrc) {
        loadImage(initialImageSrc, true);
      } else {
        // Draw a blank background if no image
        const tmp = document.createElement("canvas");
        tmp.width = canvasWidth;
        tmp.height = canvasHeight;
        const ctx = tmp.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, tmp.width, tmp.height);
        }
        drawBackground(tmp);
        saveState();
      }
    }, [initialImageSrc, canvasWidth, canvasHeight]);

    // Setup mouse events
    useEffect(() => {
      const canvas = maskCanvasRef.current;
      if (!canvas) return;

      const handleMouseDown = (e: MouseEvent) => {
        if (!drawingEnabled) return;
        setIsDrawing(true);

        // Save current mask to offscreen before new stroke
        const offCtx = offscreenCanvasRef.current.getContext("2d");
        if (offCtx && maskCanvasRef.current) {
          offCtx.clearRect(0, 0, canvasWidth, canvasHeight);
          offCtx.drawImage(maskCanvasRef.current, 0, 0);
        }

        // Start collecting stroke points
        const { left, top } = canvas.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;
        setCurrentStroke([{ x, y }]);
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDrawing) {
          // Just update cursor position if not drawing
          updateBrushCursor(e);
          return;
        }

        // If we are drawing, collect new point
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setCurrentStroke((prev) => {
          const updated = [...prev, { x, y }];
          // Re-draw the stroke so far as one continuous path
          redrawStroke(updated);
          return updated;
        });

        // Also update the cursor position
        updateBrushCursor(e);
      };

      const handleMouseUp = () => {
        if (!isDrawing) return;
        setIsDrawing(false);

        // Once mouse is up, we have a final stroke on the mask canvas
        // Save to history
        saveState();
        setCurrentStroke([]);
      };

      const handleMouseLeave = () => {
        if (brushCursorRef.current) {
          brushCursorRef.current.style.display = "none";
        }
      };

      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
      };
    }, [drawingEnabled, isDrawing]);

    function updateBrushCursor(e: MouseEvent) {
      const cursor = brushCursorRef.current;
      const canvas = maskCanvasRef.current;
      if (!cursor || !canvas) return;
      const rect = canvas.getBoundingClientRect();

      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      cursor.style.width = `${brushSizeRef.current}px`;
      cursor.style.height = `${brushSizeRef.current}px`;
      cursor.style.display = drawingEnabled ? "block" : "none";
    }

    /**
     * Redraws the mask canvas from:
     *  1) OffscreenCanvas (the old mask),
     *  2) Then draws one continuous path for 'points'.
     */
    function redrawStroke(points: { x: number; y: number }[]) {
      const maskCanvas = maskCanvasRef.current;
      if (!maskCanvas) return;
      const ctx = maskCanvas.getContext("2d");
      if (!ctx) return;

      // Clear the mask canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Draw the old mask from offscreen
      const offCtx = offscreenCanvasRef.current;
      ctx.drawImage(offCtx, 0, 0);

      // Now draw the new stroke as one continuous path
      if (points.length < 2) return;

      ctx.save();
      ctx.globalCompositeOperation = eraserEnabled
        ? "destination-out"
        : "source-over";
      ctx.strokeStyle = eraserEnabled
        ? "rgba(0,0,0,1)"
        : hexToRgba(brushColorRef.current, brushOpacityRef.current);
      ctx.lineWidth = brushSizeRef.current;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    function hexToRgba(hex: string, opacity: number): string {
      const bigint = parseInt(hex.replace("#", ""), 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    function loadImage(url: string, isInitialLoad = false) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      img.onload = () => {
        drawBackground(img);
        if (isInitialLoad) {
          // Save initial state immediately after drawing the background
          saveState();
        }
      };
    }

    function drawBackground(image: CanvasImageSource) {
      const bgCanvas = bgCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (!bgCanvas || !maskCanvas) return;

      bgCanvas.width = canvasWidth;
      bgCanvas.height = canvasHeight;
      maskCanvas.width = canvasWidth;
      maskCanvas.height = canvasHeight;

      const bgCtx = bgCanvas.getContext("2d", { willReadFrequently: true });
      const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
      if (!bgCtx || !maskCtx) return;

      // Clear them before drawing
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

      // Draw the background image (if any)
      if (
        image instanceof HTMLImageElement ||
        image instanceof HTMLCanvasElement ||
        image instanceof ImageBitmap ||
        image instanceof OffscreenCanvas
      ) {
        bgCtx.drawImage(image, 0, 0, bgCanvas.width, bgCanvas.height);
        maskCtx.drawImage(image, 0, 0, bgCanvas.width, bgCanvas.height);
      }
    }

    function saveState() {
      const canvas = maskCanvasRef.current;
      if (!canvas) return;
      const data = canvas.toDataURL();
      setUndoStack((prev) => {
        const updated = [...prev, data];
        return updated.length > MAX_HISTORY ? updated.slice(1) : updated;
      });
      setRedoStack([]);
      onDraw?.();
    }

    function undo() {
      if (undoStack.length === 0 || !maskCanvasRef.current) return;
      const canvas = maskCanvasRef.current;
      // Get the current state before undoing and push it onto the redo stack.
      const currentState = canvas.toDataURL();
      setRedoStack((prev) => [...prev, currentState]);

      // Remove the last saved state from undoStack.
      const newUndoStack = [...undoStack];
      const lastState = newUndoStack.pop();
      setUndoStack(newUndoStack);

      if (lastState) {
        // Restore the canvas to the last state.
        restoreState(lastState);
        // Update the offscreen canvas to match the restored state.
        const offCtx = offscreenCanvasRef.current.getContext("2d");
        if (offCtx) {
          const img = new Image();
          img.onload = () => {
            offCtx.clearRect(0, 0, canvasWidth, canvasHeight);
            offCtx.drawImage(img, 0, 0);
          };
          img.src = lastState;
        }
      } else {
        // If no state remains, clear both canvases.
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        const offCtx = offscreenCanvasRef.current.getContext("2d");
        if (offCtx) {
          offCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        }
      }
      onUndo?.();
    }

    function redo() {
      if (redoStack.length === 0 || !maskCanvasRef.current) return;
      const canvas = maskCanvasRef.current;
      // Get the current state before redoing and push it onto the undo stack.
      const currentState = canvas.toDataURL();
      setUndoStack((prev) => [...prev, currentState]);

      // Remove the last state from the redo stack.
      const newRedoStack = [...redoStack];
      const nextState = newRedoStack.pop();
      setRedoStack(newRedoStack);

      if (nextState) {
        // Restore the canvas to the next state.
        restoreState(nextState);
        // Update the offscreen canvas to match the restored state.
        const offCtx = offscreenCanvasRef.current.getContext("2d");
        if (offCtx) {
          const img = new Image();
          img.onload = () => {
            offCtx.clearRect(0, 0, canvasWidth, canvasHeight);
            offCtx.drawImage(img, 0, 0);
          };
          img.src = nextState;
        }
      }
      onRedo?.();
    }

    function restoreState(dataUrl: string) {
      const canvas = maskCanvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = dataUrl;
    }

    function getMaskDataURL(): string {
      const canvas = maskCanvasRef.current;
      if (!canvas) return "";
      const ctx = canvas.getContext("2d");
      if (!ctx) return "";

      const bwCanvas = document.createElement("canvas");
      bwCanvas.width = canvas.width;
      bwCanvas.height = canvas.height;
      const bwCtx = bwCanvas.getContext("2d");
      if (!bwCtx) return "";

      const srcData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const destData = bwCtx.createImageData(srcData);

      for (let i = 0; i < srcData.data.length; i += 4) {
        const alpha = srcData.data[i + 3];
        const value = alpha > 0 ? 255 : 0;
        destData.data[i] = destData.data[i + 1] = destData.data[i + 2] = value;
        destData.data[i + 3] = 255;
      }

      bwCtx.putImageData(destData, 0, 0);
      return bwCanvas.toDataURL("image/png");
    }

    function getDataURLFromMask() {
      const url = getMaskDataURL();
      getDataURL(url);
    }

    return (
      <>
        {/* <canvas ref={bgCanvasRef} className="absolute top-0 left-0 z-0" /> */}
        <canvas
          ref={maskCanvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="absolute top-0 left-0 z-1"
        />
        <div
          ref={brushCursorRef}
          className="fixed pointer-events-none border-[3px] border-gray-500 rounded-full hidden z-20 transform -translate-x-1/2 -translate-y-1/2"
        />
      </>
    );
  }
);

export default CanvasDraw;
