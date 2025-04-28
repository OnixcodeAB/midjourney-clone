"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DonutLoader } from "./DonutLoader ";

interface ImageCardProps {
  id: string;
  url: string;
  prompt?: string;
  status?: "pending" | "complete" | "running";
  progress_pct?: number;
  blurUrl?: string; // optional low-res preview (optional feature for blur-up)
}

const ImageCard = ({
  id,
  url,
  prompt,
  status = "pending",
  progress_pct,
  blurUrl,
}: ImageCardProps) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const router = useRouter();

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete) {
      setLoaded(true);
    }
  }, []);

  const handleClick = () => {
    router.push(`/jobs/create_${id}`);
  };

  return (
    <div
      className="relative w-50 border border-gray-300 overflow-hidden cursor-pointer group"
      onClick={handleClick}
    >
      {/* Skeleton shimmer */}

      {status === "pending" || status === "running" ? (
        <div className="absolute inset-0 bg-gray-200 flex flex-col items-center justify-center z-10">
          <DonutLoader
            progress={progress_pct ?? 10}
            size={60}
            strokeWidth={5}
            color="blue"
          />
          <p className="mt-2 text-xs text-gray-600">Generating...</p>
        </div>
      ) : (
        <>
          {!loaded && (
            <div
              className="absolute inset-0 z-10 bg-[linear-gradient(110deg,#e5e7eb_25%,#f3f4f6_50%,#e5e7eb_75%)]
          bg-[length:200%_100%] animate-shimmer"
            />
          )}

          {/* Main image with blur-up + fade-in */}
          <img
            ref={imgRef}
            src={url}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", url)}
            alt={`Image ${id}`}
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
            className={`aspect-square object-cover l transition duration-700 ease-in-out ${
              loaded ? "opacity-100 blur-0" : "opacity-0 blur-md"
            }`}
            style={{
              backgroundImage: blurUrl ? `url(${blurUrl})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </>
      )}

      {/* Prompt overlay on hover */}
      {prompt && (
        <div className="absolute bottom-0 left-0 w-full bg-black/50 text-white text-xs p-4 opacity-0 group-hover:opacity-100 transition-opacity z-20 truncate ">
          {prompt}
        </div>
      )}
    </div>
  );
};

export default ImageCard;
