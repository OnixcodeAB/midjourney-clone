// InpaintingCanvasPro.tsx
"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type Tool = "brush" | "eraser" | "lasso" | "auto";

interface Props {
  imageUrl: string;
  width?: number;
  height?: number;
  defaultBrushSize?: number;
  defaultTolerance?: number; // auto-select color tolerance (0-128 good range)
}

/**
 * InpaintingCanvasPro
 * - Two stacked canvases: base image + editable mask (red overlay)
 * - Tools: Brush, Eraser, Lasso (polygon fill), Auto-Select (magic-wand style flood fill)
 * - Live cursor overlay for precise selection feedback
 * - Undo/Redo history for mask only
 * - Export buttons (image and mask as PNG)
 *
 * Tailwind is optional; classes only add light styling.
 */
export default function InpaintingCanvasPro({
  imageUrl,
  width = 768,
  height = 512,
  defaultBrushSize = 24,
  defaultTolerance = 30,
}: Props) {
  const imgCanvasRef = useRef<HTMLCanvasElement>(null) as React.RefObject<HTMLCanvasElement>;
  const maskCanvasRef = useRef<HTMLCanvasElement>(null) as React.RefObject<HTMLCanvasElement>;

  const [tool, setTool] = useState<Tool>("brush");
  const [brushSize, setBrushSize] = useState(defaultBrushSize);
  const [tolerance, setTolerance] = useState(defaultTolerance);
  const [isDrawing, setIsDrawing] = useState(false);

  // Cursor / hover state for overlay
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);
  const [hover, setHover] = useState(false);

  // Lasso points (in canvas coordinates)
  const [lassoPoints, setLassoPoints] = useState<Array<{ x: number; y: number }>>([]);

  // History stacks for mask
  const historyRef = useRef<ImageData[]>([]);
  const redoRef = useRef<ImageData[]>([]);

  /* ---------- Image loading ---------- */
  useEffect(() => {
    const imgEl = new Image();
    imgEl.crossOrigin = "anonymous"; // helpful for remote images
    imgEl.src = imageUrl;
    imgEl.onload = () => {
      const ctx = imgCanvasRef.current?.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      const { sx, sy, sw, sh, dx, dy, dw, dh } = coverDims(
        imgEl.width,
        imgEl.height,
        ctx.canvas.width,
        ctx.canvas.height
      );
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(imgEl, sx, sy, sw, sh, dx, dy, dw, dh);

      // Clear mask when a new image loads
      const mctx = maskCanvasRef.current?.getContext("2d");
      if (mctx) {
        mctx.clearRect(0, 0, mctx.canvas.width, mctx.canvas.height);
        historyRef.current = [];
        redoRef.current = [];
      }
    };
  }, [imageUrl]);

  /* ---------- Helpers ---------- */
  const getCtx = (ref: React.RefObject<HTMLCanvasElement>) => ref.current?.getContext("2d") ?? null;

  const saveHistory = () => {
    const mctx = getCtx(maskCanvasRef);
    if (!mctx) return;
    historyRef.current.push(mctx.getImageData(0, 0, mctx.canvas.width, mctx.canvas.height));
    redoRef.current = [];
  };

  const undo = () => {
    const mctx = getCtx(maskCanvasRef);
    if (!mctx || historyRef.current.length === 0) return;
    const current = mctx.getImageData(0, 0, mctx.canvas.width, mctx.canvas.height);
    const prev = historyRef.current.pop();
    if (!prev) return;
    redoRef.current.push(current);
    mctx.putImageData(prev, 0, 0);
  };

  const redo = () => {
    const mctx = getCtx(maskCanvasRef);
    if (!mctx || redoRef.current.length === 0) return;
    const current = mctx.getImageData(0, 0, mctx.canvas.width, mctx.canvas.height);
    const next = redoRef.current.pop();
    if (!next) return;
    historyRef.current.push(current);
    mctx.putImageData(next, 0, 0);
  };

  // Mouse -> canvas coordinates (accounts for CSS scale)
  const getOffset = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * e.currentTarget.width);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * e.currentTarget.height);
    return { x, y };
  };

  /* ---------- Brush / Eraser ---------- */
  const startStroke = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== "brush" && tool !== "eraser") return;
    saveHistory();
    setIsDrawing(true);
    drawStroke(e);
  };

  const drawStroke = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const mctx = getCtx(maskCanvasRef);
    if (!mctx) return;
    const { x, y } = getOffset(e);

    mctx.globalCompositeOperation = tool === "brush" ? "source-over" : "destination-out";
    mctx.fillStyle = "rgba(255, 0, 0, 0.6)";
    mctx.beginPath();
    mctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    mctx.fill();
  };

  const endStroke = () => setIsDrawing(false);

  /* ---------- Lasso ---------- */
  const onLassoClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== "lasso") return;
    const pt = getOffset(e);
    setLassoPoints((pts) => [...pts, pt]);
  };

  const closeLassoAndFill = useCallback(() => {
    if (tool !== "lasso" || lassoPoints.length < 3) return;
    const mctx = getCtx(maskCanvasRef);
    if (!mctx) return;
    saveHistory();
    mctx.save();
    mctx.globalCompositeOperation = "source-over";
    mctx.fillStyle = "rgba(255, 0, 0, 0.6)";
    mctx.beginPath();
    mctx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
    for (let i = 1; i < lassoPoints.length; i++) {
      mctx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
    }
    mctx.closePath();
    mctx.fill();
    mctx.restore();
    setLassoPoints([]);
  }, [tool, lassoPoints]);

  /* ---------- Auto-Select (Magic Wand) ---------- */
  const onAutoSelect = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== "auto") return;
    const ictx = getCtx(imgCanvasRef);
    const mctx = getCtx(maskCanvasRef);
    if (!ictx || !mctx) return;

    const { x, y } = getOffset(e);
    const imgData = ictx.getImageData(0, 0, ictx.canvas.width, ictx.canvas.height);
    const selected = floodFillSelection(imgData, x, y, tolerance);
    if (!selected) return;

    saveHistory();

    // Draw selection as red alpha onto mask
    mctx.save();
    mctx.globalCompositeOperation = "source-over";

    const selCanvas = document.createElement("canvas");
    selCanvas.width = imgData.width;
    selCanvas.height = imgData.height;
    const sctx = selCanvas.getContext("2d")!;
    const selImg = sctx.createImageData(imgData.width, imgData.height);

    for (let i = 0; i < selImg.data.length; i += 4) {
      const on = selected[i / 4];
      selImg.data[i + 0] = 255;
      selImg.data[i + 1] = 0;
      selImg.data[i + 2] = 0;
      selImg.data[i + 3] = on ? 153 : 0; // 0.6 * 255
    }
    sctx.putImageData(selImg, 0, 0);
    mctx.drawImage(selCanvas, 0, 0);
    mctx.restore();
  };

  /* ---------- Keyboard Shortcuts ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (tool === "lasso" && (e.key === "Enter" || e.key === "Escape")) {
        e.preventDefault();
        closeLassoAndFill();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.shiftKey ? redo() : undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tool, closeLassoAndFill]);

  /* ---------- Export helpers ---------- */
  const exportMaskPNG = () => maskCanvasRef.current?.toDataURL("image/png");
  const exportImagePNG = () => imgCanvasRef.current?.toDataURL("image/png");

  /* ---------- Render ---------- */
  return (
    <div className="flex gap-4">
      {/* Stage */}
      <div className="relative rounded-lg" style={{ width, height }}>
        <canvas
          ref={imgCanvasRef}
          width={width}
          height={height}
          className="block rounded-lg shadow border"
        />
        <canvas
          ref={maskCanvasRef}
          width={width}
          height={height}
          className="absolute inset-0 rounded-lg"
          onMouseDown={(e) => {
            if (tool === "brush" || tool === "eraser") startStroke(e);
            if (tool === "auto") onAutoSelect(e);
            if (tool === "lasso") onLassoClick(e);
          }}
          onMouseMove={(e) => {
            // drawing
            if (tool === "brush" || tool === "eraser") drawStroke(e);
            // cursor overlay position
            const { x, y } = getOffset(e);
            setMouse({ x, y });
          }}
          onMouseUp={endStroke}
          onMouseEnter={(e) => {
            setHover(true);
            const { x, y } = getOffset(e);
            setMouse({ x, y });
          }}
          onMouseLeave={() => {
            endStroke();
            setHover(false);
            setMouse(null);
          }}
          onDoubleClick={() => {
            if (tool === "lasso") closeLassoAndFill();
          }}
          // keep native cursor helpful if overlay fails
          style={{
            cursor:
              tool === "lasso" || tool === "auto"
                ? "crosshair"
                : tool === "eraser"
                ? "none" // we show our own preview; hiding native looks cleaner
                : "none",
          }}
        />

        {/* Overlay: cursor + lasso preview (SVG shares canvas coordinates via viewBox) */}
        {hover && mouse && (
          <svg
            className="pointer-events-none absolute inset-0"
            viewBox={`0 0 ${width} ${height}`}
            width={width}
            height={height}
          >
            {/* Brush / Eraser preview */}
            {(tool === "brush" || tool === "eraser") && (
              <g>
                <circle
                  cx={mouse.x}
                  cy={mouse.y}
                  r={brushSize / 2}
                  fill="none"
                  stroke="white"
                  strokeWidth={1}
                />
                <circle
                  cx={mouse.x}
                  cy={mouse.y}
                  r={brushSize / 2}
                  fill="none"
                  stroke="black"
                  strokeWidth={1}
                  strokeDasharray="4 2"
                />
                {/* tiny center dot for precision */}
                <circle cx={mouse.x} cy={mouse.y} r={1} fill="black" />
              </g>
            )}

            {/* Lasso preview: crosshair + existing polyline + live segment */}
            {tool === "lasso" && (
              <g>
                {/* crosshair */}
                <line x1={mouse.x - 8} y1={mouse.y} x2={mouse.x + 8} y2={mouse.y} stroke="red" strokeWidth={1} />
                <line x1={mouse.x} y1={mouse.y - 8} x2={mouse.x} y2={mouse.y + 8} stroke="red" strokeWidth={1} />
                {/* existing polyline */}
                {lassoPoints.length > 0 && (
                  <>
                    <polyline
                      points={lassoPoints.map((p) => `${p.x},${p.y}`).join(" ")}
                      fill="none"
                      stroke="red"
                      strokeWidth={2}
                      strokeDasharray="6 4"
                    />
                    {/* live segment from last point to cursor */}
                    <line
                      x1={lassoPoints[lassoPoints.length - 1].x}
                      y1={lassoPoints[lassoPoints.length - 1].y}
                      x2={mouse.x}
                      y2={mouse.y}
                      stroke="red"
                      strokeWidth={1.5}
                      strokeDasharray="6 4"
                    />
                    {/* point handles */}
                    {lassoPoints.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r={3} fill="red" />
                    ))}
                  </>
                )}
              </g>
            )}

            {/* Auto-select target ring */}
            {tool === "auto" && (
              <g>
                <circle cx={mouse.x} cy={mouse.y} r={7} fill="none" stroke="red" strokeWidth={1.5} />
                <line x1={mouse.x - 10} y1={mouse.y} x2={mouse.x - 2} y2={mouse.y} stroke="red" strokeWidth={1} />
                <line x1={mouse.x + 2} y1={mouse.y} x2={mouse.x + 10} y2={mouse.y} stroke="red" strokeWidth={1} />
                <line x1={mouse.x} y1={mouse.y - 10} x2={mouse.x} y2={mouse.y - 2} stroke="red" strokeWidth={1} />
                <line x1={mouse.x} y1={mouse.y + 2} x2={mouse.x} y2={mouse.y + 10} stroke="red" strokeWidth={1} />
              </g>
            )}
          </svg>
        )}
      </div>

      {/* Tools Panel */}
      <div className="flex flex-col gap-3 min-w-56">
        <div className="font-semibold">Tools</div>
        <div className="grid grid-cols-2 gap-2">
          <ToolButton label="Brush" active={tool === "brush"} onClick={() => setTool("brush")} />
          <ToolButton label="Eraser" active={tool === "eraser"} onClick={() => setTool("eraser")} />
          <ToolButton label="Lasso" active={tool === "lasso"} onClick={() => setTool("lasso")} />
          <ToolButton label="Auto-Select" active={tool === "auto"} onClick={() => setTool("auto")} />
        </div>

        {(tool === "brush" || tool === "eraser") && (
          <label className="flex items-center gap-3">
            <span className="w-28">Brush Size</span>
            <input
              type="range"
              min={4}
              max={120}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full"
            />
            <span className="tabular-nums w-10 text-right">{brushSize}</span>
          </label>
        )}

        {tool === "auto" && (
          <label className="flex items-center gap-3">
            <span className="w-28">Tolerance</span>
            <input
              type="range"
              min={0}
              max={128}
              value={tolerance}
              onChange={(e) => setTolerance(Number(e.target.value))}
              className="w-full"
            />
            <span className="tabular-nums w-10 text-right">{tolerance}</span>
          </label>
        )}

        <div className="flex gap-2">
          <button className="px-3 py-1 rounded border" onClick={undo}>
            Undo
          </button>
          <button className="px-3 py-1 rounded border" onClick={redo}>
            Redo
          </button>
        </div>

        <div className="mt-2 grid gap-2">
          <button
            className="px-3 py-1 rounded border"
            onClick={() => {
              const url = exportMaskPNG();
              if (url) downloadDataURL(url, "mask.png");
            }}
          >
            Export Mask (PNG)
          </button>
          <button
            className="px-3 py-1 rounded border"
            onClick={() => {
              const url = exportImagePNG();
              if (url) downloadDataURL(url, "image.png");
            }}
          >
            Export Image (PNG)
          </button>
        </div>

        <div className="text-xs text-muted-foreground mt-2">
          Lasso: click to add points, <b>double-click</b> or press <b>Enter</b> to fill.
          <br />
          Auto-Select: click the image; adjust tolerance if needed.
        </div>
      </div>
    </div>
  );
}

/* ---------- Small UI helper ---------- */
function ToolButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded border ${
        active ? "bg-black text-white dark:bg-white dark:text-black" : ""
      }`}
    >
      {label}
    </button>
  );
}

/* ---------- Geometry helpers ---------- */
// Compute draw params to cover target rect while preserving aspect (like CSS background-size: cover)
function coverDims(sw: number, sh: number, tw: number, th: number) {
  const sRatio = sw / sh;
  const tRatio = tw / th;
  let sx = 0,
    sy = 0,
    sw2 = sw,
    sh2 = sh,
    dx = 0,
    dy = 0,
    dw = tw,
    dh = th;

  if (sRatio > tRatio) {
    // source wider: crop width
    const newSw = sh * tRatio;
    sx = (sw - newSw) / 2;
    sw2 = newSw;
  } else {
    // source taller: crop height
    const newSh = sw / tRatio;
    sy = (sh - newSh) / 2;
    sh2 = newSh;
  }
  return { sx, sy, sw: sw2, sh: sh2, dx, dy, dw, dh };
}

/* ---------- Magic-wand-like flood fill ---------- */
/**
 * Returns a boolean array (length = width*height) where true = selected pixel.
 * BFS region grow by Euclidean RGB distance from seed.
 */
function floodFillSelection(img: ImageData, x: number, y: number, tol: number): boolean[] | null {
  const { width, height, data } = img;
  if (x < 0 || y < 0 || x >= width || y >= height) return null;

  const idx = (y * width + x) * 4;
  const sr = data[idx + 0],
    sg = data[idx + 1],
    sb = data[idx + 2];

  const selected = new Array<boolean>(width * height).fill(false);
  const q: Array<{ x: number; y: number }> = [{ x, y }];
  selected[y * width + x] = true;

  const inBounds = (xx: number, yy: number) => xx >= 0 && yy >= 0 && xx < width && yy < height;

  while (q.length) {
    const { x: cx, y: cy } = q.shift()!;
    const neigh = [
      { x: cx + 1, y: cy },
      { x: cx - 1, y: cy },
      { x: cx, y: cy + 1 },
      { x: cx, y: cy - 1 },
    ];
    for (const n of neigh) {
      if (!inBounds(n.x, n.y)) continue;
      const ni = n.y * width + n.x;
      if (selected[ni]) continue;
      const di = ni * 4;
      const dr = data[di + 0],
        dg = data[di + 1],
        db = data[di + 2];
      if (colorDist(sr, sg, sb, dr, dg, db) <= tol) {
        selected[ni] = true;
        q.push(n);
      }
    }
  }
  return selected;
}

function colorDist(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) {
  const dr = r1 - r2,
    dg = g1 - g2,
    db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/* ---------- Download helper ---------- */
function downloadDataURL(dataURL: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataURL;
  a.download = filename;
  a.click();
}
